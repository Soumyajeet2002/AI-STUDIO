import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentRunEventEntity } from '../entities/agent-run-event.entity';
import { AgentRunEventData } from '../types/agent-run.types';

@Injectable()
export class AgentRunEventRepository {
  constructor(
    @InjectRepository(AgentRunEventEntity)
    private readonly repository: Repository<AgentRunEventEntity>,
  ) {}

  async append(data: AgentRunEventData): Promise<AgentRunEventEntity> {
    return this.repository.save(
      this.repository.create({
        runId: data.runId,
        type: data.type,
        phase: data.phase ?? null,
        message: data.message ?? null,
        payload: data.payload ?? {},
      }),
    );
  }

  async listAfter(
    runId: string,
    lastEventId: number,
    limit: number,
  ): Promise<AgentRunEventEntity[]> {
    return this.repository
      .createQueryBuilder('event')
      .where('event.runId = :runId', { runId })
      .andWhere('event.id > :lastEventId', { lastEventId })
      .orderBy('event.id', 'ASC')
      .take(limit)
      .getMany();
  }
}
