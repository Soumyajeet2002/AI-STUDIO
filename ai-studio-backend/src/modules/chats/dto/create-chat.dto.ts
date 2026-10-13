/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateChatDto {
  @ApiPropertyOptional({
    description: 'Project to place this chat in. Omit for a standalone chat.',
    format: 'uuid',
    nullable: true,
  })
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Conversation title. Defaults to New chat.',
    example: 'Research assistant',
    minLength: 1,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Additional chat metadata. Do not put secrets here.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
