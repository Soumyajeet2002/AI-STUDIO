import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MESSAGE_MAX_CONTENT_LENGTH } from '../constants/message.constants';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Text content of the user message.',
    example: 'Summarize the latest project notes.',
    minLength: 1,
    maxLength: MESSAGE_MAX_CONTENT_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(MESSAGE_MAX_CONTENT_LENGTH)
  content!: string;

  @ApiPropertyOptional({
    description: 'Optional application-defined message metadata.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
