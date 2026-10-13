import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AgentRunEventType,
  AgentRunPhase,
} from '../constants/agent-run.constants';

export class AgentRunEventResponseDto {
  @ApiProperty({ example: 12 })
  id!: number;

  @ApiProperty({ enum: AgentRunEventType })
  type!: AgentRunEventType;

  @ApiPropertyOptional({ enum: AgentRunPhase, nullable: true })
  phase!: AgentRunPhase | null;

  @ApiPropertyOptional({ nullable: true })
  message!: string | null;

  @ApiProperty({ type: 'object', additionalProperties: true })
  payload!: Record<string, unknown>;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}
