import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToolExecutionStatus } from '../constants/tool.constants';

export class ToolExecutionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'knowledge_retrieval' })
  toolName!: string;

  @ApiProperty({ example: '1.0.0' })
  toolVersion!: string;

  @ApiProperty({
    enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
  })
  status!: ToolExecutionStatus;

  @ApiPropertyOptional({ type: Object, nullable: true })
  output?: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  errorCode?: string | null;

  @ApiPropertyOptional({ nullable: true })
  errorMessage?: string | null;

  @ApiPropertyOptional({ nullable: true })
  durationMs?: number | null;

  @ApiProperty()
  createdAt!: Date;
}
