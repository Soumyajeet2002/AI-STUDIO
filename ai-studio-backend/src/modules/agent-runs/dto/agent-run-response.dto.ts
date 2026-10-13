import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AgentRunPhase,
  AgentRunStatus,
} from '../constants/agent-run.constants';
import { AgentPlanStepResponseDto } from './agent-plan-step-response.dto';

export class AgentRunResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  chatId!: string;

  @ApiProperty({ enum: AgentRunStatus })
  status!: AgentRunStatus;

  @ApiProperty({ enum: AgentRunPhase })
  phase!: AgentRunPhase;

  @ApiProperty()
  input!: string;

  @ApiProperty()
  outputText!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  options!: Record<string, unknown>;

  @ApiPropertyOptional({ nullable: true })
  errorCode!: string | null;

  @ApiPropertyOptional({ nullable: true })
  errorMessage!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  startedAt!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  completedAt!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ type: [AgentPlanStepResponseDto] })
  planSteps?: AgentPlanStepResponseDto[];
}

export class AgentRunListResponseDto {
  @ApiProperty({ type: [AgentRunResponseDto] })
  items!: AgentRunResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
