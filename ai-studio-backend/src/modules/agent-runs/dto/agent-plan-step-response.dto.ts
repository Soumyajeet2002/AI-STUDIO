import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AgentPlanStepStatus } from '../constants/agent-run.constants';

export class AgentPlanStepResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 1 })
  sequenceNumber!: number;

  @ApiProperty({ example: 'Gather relevant information' })
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({ enum: AgentPlanStepStatus })
  status!: AgentPlanStepStatus;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  startedAt!: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  completedAt!: string | null;
}
