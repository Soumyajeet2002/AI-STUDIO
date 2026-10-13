import { Injectable } from '@nestjs/common';
import { AgentRunEventRepository } from './repositories/agent-run-event.repository';
import { AgentRunEventData } from './types/agent-run.types';

@Injectable()
export class AgentRunEventsService {
  constructor(private readonly events: AgentRunEventRepository) {}

  async emit(event: AgentRunEventData): Promise<void> {
    await this.events.append(event);
  }

  async listAfter(runId: string, lastEventId: number) {
    return this.events.listAfter(runId, lastEventId, 100);
  }
}
