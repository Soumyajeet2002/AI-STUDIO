import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateChatArchiveDto {
  @ApiProperty({
    description: 'Whether the chat should be archived.',
    example: true,
  })
  @IsBoolean()
  isArchived!: boolean;
}
