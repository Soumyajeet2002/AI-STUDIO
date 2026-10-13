/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AgentRunStatus } from './constants/agent-run.constants';
import { AgentRunEventRepository } from './repositories/agent-run-event.repository';
import { AgentRunRepository } from './repositories/agent-run.repository';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class AgentRunStreamService {
  constructor(
    private readonly events: AgentRunEventRepository,
    private readonly runs: AgentRunRepository,
  ) {}

  stream(runId: string, initialLastEventId: number): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      let cursor = initialLastEventId;
      let closed = false;
      let polling = false;

      const poll = async () => {
        if (closed || polling) return;
        polling = true;

        try {
          const rows = await this.events.listAfter(runId, cursor, 100);

          for (const event of rows) {
            if (closed) break;

            cursor = event.id;
            subscriber.next({
              id: String(event.id),
              type: event.type,
              data: {
                runId,
                type: event.type,
                phase: event.phase,
                message: event.message,
                payload: event.payload,
                createdAt: event.createdAt.toISOString(),
              },
            } as MessageEvent);
          }

          const run = await this.runs.findById(runId);
          if (
            run &&
            [
              AgentRunStatus.COMPLETED,
              AgentRunStatus.FAILED,
              AgentRunStatus.CANCELLED,
            ].includes(run.status) &&
            rows.length === 0
          ) {
            subscriber.complete();
          }
        } catch (error) {
          subscriber.error(error);
        } finally {
          polling = false;
        }
      };

      void poll();
      const interval = setInterval(() => void poll(), 1000);

      return () => {
        closed = true;
        clearInterval(interval);
      };
    });
  }
}
