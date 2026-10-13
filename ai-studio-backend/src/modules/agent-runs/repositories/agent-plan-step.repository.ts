import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentPlanStepEntity } from '../entities/agent-plan-step.entity';
import { AgentPlanStepStatus } from '../constants/agent-run.constants';

@Injectable()
export class AgentPlanStepRepository {
  constructor(
    @InjectRepository(AgentPlanStepEntity)
    private readonly repository: Repository<AgentPlanStepEntity>,
  ) {}

  async create(
    runId: string,
    sequenceNumber: number,
    title: string,
    description?: string,
  ): Promise<AgentPlanStepEntity> {
    return this.repository.save(
      this.repository.create({
        runId,
        sequenceNumber,
        title,
        description: description ?? null,
        status: AgentPlanStepStatus.PENDING,
      }),
    );
  }

  async listByRun(runId: string): Promise<AgentPlanStepEntity[]> {
    return this.repository.find({
      where: { runId },
      order: { sequenceNumber: 'ASC' },
    });
  }
}
