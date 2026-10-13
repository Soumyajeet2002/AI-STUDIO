import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  MESSAGE_DEFAULT_LIMIT,
  MESSAGE_DEFAULT_PAGE,
  MESSAGE_MAX_LIMIT,
} from '../constants/message.constants';

export class ListMessagesQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: MESSAGE_DEFAULT_PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = MESSAGE_DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Messages per page',
    default: MESSAGE_DEFAULT_LIMIT,
    minimum: 1,
    maximum: MESSAGE_MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MESSAGE_MAX_LIMIT)
  limit = MESSAGE_DEFAULT_LIMIT;
}
