/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CHAT_DEFAULT_LIMIT,
  CHAT_DEFAULT_PAGE,
  CHAT_MAX_LIMIT,
} from '../constants/chat.constants';

export class ListChatsQueryDto {
  @ApiPropertyOptional({ default: CHAT_DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = CHAT_DEFAULT_PAGE;

  @ApiPropertyOptional({
    default: CHAT_DEFAULT_LIMIT,
    minimum: 1,
    maximum: CHAT_MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CHAT_MAX_LIMIT)
  limit = CHAT_DEFAULT_LIMIT;

  @ApiPropertyOptional({ description: 'Search chat titles', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by project UUID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Filter archived chats' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isArchived?: boolean;
}
