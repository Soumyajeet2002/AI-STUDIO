import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  ownerId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  projectId!: string | null;

  @ApiProperty({ example: 'Research assistant' })
  title!: string;

  @ApiProperty({ example: false })
  isArchived!: boolean;

  @ApiProperty({ type: 'object', additionalProperties: true })
  metadata!: Record<string, unknown>;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  lastMessageAt!: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}

export class ChatListResponseDto {
  @ApiProperty({ type: [ChatResponseDto] })
  items!: ChatResponseDto[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
