import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from '../chats/entities/chat.entity';
import { CreateAgentRunDto } from './dto/create-agent-run.dto';
import { ListAgentRunsQueryDto } from './dto/list-agent-runs-query.dto';
import {
  AgentRunListResponseDto,
  AgentRunResponseDto,
} from './dto/agent-run-response.dto';
import { AgentRunMapper } from './mappers/agent-run.mapper';
import { AgentRunRepository } from './repositories/agent-run.repository';
import { AgentPlanStepRepository } from './repositories/agent-plan-step.repository';
import { AgentRunQueueService } from './agent-run-queue.service';
import { AgentRunEventsService } from './agent-run-events.service';
import {
  AgentRunChatNotFoundException,
  AgentRunNotCancellableException,
  AgentRunNotFoundException,
} from './exceptions/agent-run.exceptions';
import {
  AgentRunEventType,
  AgentRunPhase,
  AgentRunStatus,
} from './constants/agent-run.constants';

@Injectable()
export class AgentRunsService {
  constructor(
    private readonly runs: AgentRunRepository,
    private readonly steps: AgentPlanStepRepository,
    private readonly queue: AgentRunQueueService,
    private readonly events: AgentRunEventsService,
    @InjectRepository(ChatEntity)
    private readonly chats: Repository<ChatEntity>,
  ) {}

  async create(
    ownerId: string,
    dto: CreateAgentRunDto,
  ): Promise<AgentRunResponseDto> {
    const chat = await this.chats.findOne({
      where: { id: dto.chatId, ownerId },
    });

    if (!chat) throw new AgentRunChatNotFoundException();

    const run = await this.runs.create({
      ownerId,
      chatId: dto.chatId,
      input: dto.input.trim(),
      options: dto.options,
    });

    try {
      await this.events.emit({
        runId: run.id,
        type: AgentRunEventType.STATUS,
        phase: AgentRunPhase.QUEUED,
        message: 'Agent run queued.',
      });

      await this.queue.enqueue({ runId: run.id, ownerId });
    } catch {
      await this.runs.updateFields(run.id, {
        status: AgentRunStatus.FAILED,
        phase: AgentRunPhase.FAILED,
        errorCode: 'AGENT_QUEUE_UNAVAILABLE',
        errorMessage: 'The agent run could not be queued. Please retry.',
        completedAt: new Date(),
      });

      await this.events.emit({
        runId: run.id,
        type: AgentRunEventType.ERROR,
        phase: AgentRunPhase.FAILED,
        message: 'The agent run could not be queued.',
        payload: { code: 'AGENT_QUEUE_UNAVAILABLE' },
      });

      throw new Error('Unable to queue agent run.');
    }

    return AgentRunMapper.toResponse(run);
  }

  async findAll(
    ownerId: string,
    query: ListAgentRunsQueryDto,
  ): Promise<AgentRunListResponseDto> {
    if (query.chatId) {
      const chat = await this.chats.findOne({
        where: { id: query.chatId, ownerId },
      });
      if (!chat) throw new AgentRunChatNotFoundException();
    }

    const result = await this.runs.listOwned({
      ownerId,
      chatId: query.chatId,
      page: query.page,
      limit: query.limit,
    });

    return {
      ...result,
      items: result.items.map((run) => AgentRunMapper.toResponse(run)),
    };
  }

  async findOne(ownerId: string, runId: string): Promise<AgentRunResponseDto> {
    const run = await this.runs.findOwned(runId, ownerId);
    if (!run) throw new AgentRunNotFoundException();

    const steps = await this.steps.listByRun(run.id);
    return AgentRunMapper.toResponse(run, steps);
  }

  async cancel(ownerId: string, runId: string): Promise<AgentRunResponseDto> {
    const run = await this.runs.requestCancellation(runId, ownerId);
    if (!run) throw new AgentRunNotFoundException();

    if (
      run.status === AgentRunStatus.COMPLETED ||
      run.status === AgentRunStatus.FAILED
    ) {
      throw new AgentRunNotCancellableException();
    }

    if (run.status === AgentRunStatus.CANCELLED) {
      await this.queue.cancelQueued(runId);
      await this.events.emit({
        runId,
        type: AgentRunEventType.CANCELLED,
        phase: AgentRunPhase.CANCELLED,
        message: 'Agent run cancelled.',
      });
      return AgentRunMapper.toResponse(run);
    }

    await this.events.emit({
      runId,
      type: AgentRunEventType.STATUS,
      phase: run.phase,
      message: 'Cancellation requested.',
    });

    return AgentRunMapper.toResponse(run);
  }
}
