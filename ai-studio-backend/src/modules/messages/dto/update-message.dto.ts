import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { MESSAGE_MAX_CONTENT_LENGTH } from '../constants/message.constants';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Replacement content for an editable user message.',
    example: 'Please summarize the latest project notes.',
    minLength: 1,
    maxLength: MESSAGE_MAX_CONTENT_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(MESSAGE_MAX_CONTENT_LENGTH)
  content!: string;
}
