import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { CreateChatDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {
  @ApiPropertyOptional({
    description: 'Replace the chat metadata object.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  declare metadata?: Record<string, unknown>;
}
