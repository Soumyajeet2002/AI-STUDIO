/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  AGENT_RUN_BACKOFF_MS,
  AGENT_RUN_JOB,
  AGENT_RUN_MAX_ATTEMPTS,
  AGENT_RUN_QUEUE,
} from './constants/agent-run.constants';
import { AgentRunQueuePayload } from './types/agent-run.types';

@Injectable()
export class AgentRunQueueService {
  constructor(
    @InjectQueue(AGENT_RUN_QUEUE)
    private readonly queue: Queue<AgentRunQueuePayload>,
  ) {}

  async enqueue(payload: AgentRunQueuePayload): Promise<void> {
    await this.queue.add(AGENT_RUN_JOB, payload, {
      jobId: payload.runId,
      attempts: AGENT_RUN_MAX_ATTEMPTS,
      backoff: { type: 'exponential', delay: AGENT_RUN_BACKOFF_MS },
      removeOnComplete: { age: 86_400, count: 10_000 },
      removeOnFail: { age: 604_800, count: 10_000 },
    });
  }

  async cancelQueued(runId: string): Promise<void> {
    const job = await this.queue.getJob(runId);
    if (!job) return;

    const state = await job.getState();
    if (state === 'waiting' || state === 'delayed' || state === 'prioritized') {
      await job.remove();
    }
  }
}
