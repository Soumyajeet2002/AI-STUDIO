/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AgentRunEntity } from '../entities/agent-run.entity';
import {
  AgentRunPhase,
  AgentRunStatus,
} from '../constants/agent-run.constants';
import {
  CreateAgentRunData,
  ListAgentRunsOptions,
} from '../types/agent-run.types';

@Injectable()
export class AgentRunRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(AgentRunEntity)
    private readonly repository: Repository<AgentRunEntity>,
  ) {}

  async create(data: CreateAgentRunData): Promise<AgentRunEntity> {
    return this.repository.save(
      this.repository.create({
        ownerId: data.ownerId,
        chatId: data.chatId,
        input: data.input,
        options: data.options ?? {},
        status: AgentRunStatus.QUEUED,
      }),
    );
  }

  async findOwned(
    runId: string,
    ownerId: string,
  ): Promise<AgentRunEntity | null> {
    return this.repository.findOne({ where: { id: runId, ownerId } });
  }

  async listOwned(options: ListAgentRunsOptions) {
    const query = this.repository
      .createQueryBuilder('run')
      .where('run.ownerId = :ownerId', { ownerId: options.ownerId });

    if (options.chatId) {
      query.andWhere('run.chatId = :chatId', { chatId: options.chatId });
    }

    query
      .orderBy('run.createdAt', 'DESC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async claim(runId: string): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update(AgentRunEntity)
      .set({
        status: AgentRunStatus.RUNNING,
        phase: AgentRunPhase.RUNNING as never,
        startedAt: () => 'COALESCE(started_at, NOW())',
      })
      .where('id = :runId', { runId })
      .andWhere('status = :status', { status: AgentRunStatus.QUEUED })
      .andWhere('"cancel_requested_at" IS NULL')
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async updateFields(
    runId: string,
    fields: Partial<AgentRunEntity>,
  ): Promise<void> {
    // await this.repository.update({ id: runId }, fields);
    await this.repository.update(
      { id: runId },
      {
        status: fields.status,
        phase: fields.phase,
        startedAt: fields.startedAt,
        completedAt: fields.completedAt,
        cancelRequestedAt: fields.cancelRequestedAt,
        errorCode: fields.errorCode,
        errorMessage: fields.errorMessage,
      },
    );
  }

  async requestCancellation(
    runId: string,
    ownerId: string,
  ): Promise<AgentRunEntity | null> {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(AgentRunEntity);
      const run = await repo.findOne({
        where: { id: runId, ownerId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!run) return null;

      if (
        run.status === AgentRunStatus.COMPLETED ||
        run.status === AgentRunStatus.FAILED ||
        run.status === AgentRunStatus.CANCELLED
      ) {
        return run;
      }

      run.cancelRequestedAt = new Date();

      if (run.status === AgentRunStatus.QUEUED) {
        run.status = AgentRunStatus.CANCELLED;
        run.phase = AgentRunPhase.CANCELLED;
        run.completedAt = new Date();
      }

      return repo.save(run);
    });
  }

  async findById(runId: string): Promise<AgentRunEntity | null> {
    return this.repository.findOne({ where: { id: runId } });
  }
}
