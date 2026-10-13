import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import {
  AGENT_RUN_DEFAULT_LIMIT,
  AGENT_RUN_DEFAULT_PAGE,
  AGENT_RUN_MAX_LIMIT,
} from '../constants/agent-run.constants';

export class ListAgentRunsQueryDto {
  @ApiPropertyOptional({ default: AGENT_RUN_DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = AGENT_RUN_DEFAULT_PAGE;

  @ApiPropertyOptional({
    default: AGENT_RUN_DEFAULT_LIMIT,
    minimum: 1,
    maximum: AGENT_RUN_MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(AGENT_RUN_MAX_LIMIT)
  limit = AGENT_RUN_DEFAULT_LIMIT;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by chat' })
  @IsOptional()
  @IsUUID()
  chatId?: string;
}
