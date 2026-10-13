/* eslint-disable @typescript-eslint/unbound-method */
import { AgentPlanStepResponseDto } from '../dto/agent-plan-step-response.dto';
import { AgentRunResponseDto } from '../dto/agent-run-response.dto';
import { AgentPlanStepEntity } from '../entities/agent-plan-step.entity';
import { AgentRunEntity } from '../entities/agent-run.entity';

export class AgentRunMapper {
  static toStepResponse(entity: AgentPlanStepEntity): AgentPlanStepResponseDto {
    return {
      id: entity.id,
      sequenceNumber: entity.sequenceNumber,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      startedAt: entity.startedAt?.toISOString() ?? null,
      completedAt: entity.completedAt?.toISOString() ?? null,
    };
  }

  static toResponse(
    entity: AgentRunEntity,
    steps?: AgentPlanStepEntity[],
  ): AgentRunResponseDto {
    return {
      id: entity.id,
      chatId: entity.chatId,
      status: entity.status,
      phase: entity.phase,
      input: entity.input,
      outputText: entity.outputText,
      options: entity.options ?? {},
      errorCode: entity.errorCode,
      errorMessage: entity.errorMessage,
      startedAt: entity.startedAt?.toISOString() ?? null,
      completedAt: entity.completedAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      ...(steps ? { planSteps: steps.map(this.toStepResponse) } : {}),
    };
  }
}
