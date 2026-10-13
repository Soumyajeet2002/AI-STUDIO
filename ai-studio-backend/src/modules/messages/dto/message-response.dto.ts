import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageRole, MessageStatus } from '../constants/message.constants';

export class MessageResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  chatId!: string;

  @ApiProperty({ enum: MessageRole, enumName: 'MessageRole' })
  role!: MessageRole;

  @ApiProperty()
  content!: string;

  @ApiProperty({ enum: MessageStatus, enumName: 'MessageStatus' })
  status!: MessageStatus;

  @ApiProperty({ example: 1, minimum: 1 })
  sequenceNumber!: number;

  @ApiPropertyOptional({ nullable: true })
  modelProvider!: string | null;

  @ApiPropertyOptional({ nullable: true })
  modelName!: string | null;

  @ApiPropertyOptional({ nullable: true, minimum: 0 })
  inputTokens!: number | null;

  @ApiPropertyOptional({ nullable: true, minimum: 0 })
  outputTokens!: number | null;

  @ApiProperty({ type: 'object', additionalProperties: true })
  metadata!: Record<string, unknown>;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}

export class MessageListResponseDto {
  @ApiProperty({ type: [MessageResponseDto] })
  items!: MessageResponseDto[];

  @ApiProperty({ example: 125 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 50 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
