/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  AGENT_RUN_QUEUE,
  AgentRunEventType,
  AgentRunPhase,
  AgentRunStatus,
} from './constants/agent-run.constants';
import { AgentRunQueuePayload } from './types/agent-run.types';
import { AgentRunRepository } from './repositories/agent-run.repository';
import { AgentRunEventsService } from './agent-run-events.service';
import { AgentRunExecutorService } from './agent-run-executor.service';

@Injectable()
@Processor(AGENT_RUN_QUEUE)
export class AgentRunWorkerProcessor extends WorkerHost {
  private readonly logger = new Logger(AgentRunWorkerProcessor.name);

  constructor(
    private readonly runs: AgentRunRepository,
    private readonly events: AgentRunEventsService,
    private readonly executor: AgentRunExecutorService,
  ) {
    super();
  }

  async process(job: Job<AgentRunQueuePayload>): Promise<void> {
    const { runId, ownerId } = job.data;
    const run = await this.runs.findOwned(runId, ownerId);

    if (!run || run.status !== AgentRunStatus.QUEUED) return;

    const claimed = await this.runs.claim(runId);
    if (!claimed) return;

    await this.events.emit({
      runId,
      type: AgentRunEventType.STATUS,
      phase: AgentRunPhase.RUNNING,
      message: 'Agent execution started.',
    });

    const controller = new AbortController();

    try {
      const result = await this.executor.execute({
        runId,
        ownerId,
        chatId: run.chatId,
        input: run.input,
        options: run.options ?? {},
        signal: controller.signal,
        emit: (event) => this.events.emit(event),
      });

      const completedAt = new Date();

      await this.runs.updateFields(runId, {
        status: result.status,
        phase:
          result.status === AgentRunStatus.COMPLETED
            ? AgentRunPhase.COMPLETED
            : result.status === AgentRunStatus.CANCELLED
              ? AgentRunPhase.CANCELLED
              : AgentRunPhase.FAILED,
        outputText: result.outputText,
        errorCode: result.errorCode ?? null,
        errorMessage: result.errorMessage ?? null,
        completedAt,
      });

      await this.events.emit({
        runId,
        type:
          result.status === AgentRunStatus.COMPLETED
            ? AgentRunEventType.COMPLETED
            : result.status === AgentRunStatus.CANCELLED
              ? AgentRunEventType.CANCELLED
              : AgentRunEventType.ERROR,
        phase:
          result.status === AgentRunStatus.COMPLETED
            ? AgentRunPhase.COMPLETED
            : result.status === AgentRunStatus.CANCELLED
              ? AgentRunPhase.CANCELLED
              : AgentRunPhase.FAILED,
        message: result.errorMessage ?? `Agent run ${result.status}.`,
        payload: { status: result.status, errorCode: result.errorCode ?? null },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected agent execution failure.';

      this.logger.error(`Agent run ${runId} failed: ${message}`);

      await this.runs.updateFields(runId, {
        status: AgentRunStatus.FAILED,
        phase: AgentRunPhase.FAILED,
        errorCode: 'AGENT_EXECUTION_FAILED',
        errorMessage: 'Agent execution failed.',
        completedAt: new Date(),
      });

      await this.events.emit({
        runId,
        type: AgentRunEventType.ERROR,
        phase: AgentRunPhase.FAILED,
        message: 'Agent execution failed.',
        payload: { code: 'AGENT_EXECUTION_FAILED' },
      });

      throw error;
    }
  }
}
