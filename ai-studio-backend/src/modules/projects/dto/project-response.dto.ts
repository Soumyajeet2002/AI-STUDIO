import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Unique project identifier',
  })
  id!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Owner user identifier',
  })
  ownerId!: string;

  @ApiProperty({ example: 'AI Research Workspace' })
  name!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Research and AI experiments',
  })
  description!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'folder-kanban',
  })
  icon!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: '#6366F1',
  })
  color!: string | null;

  @ApiProperty({ example: false })
  isPinned!: boolean;

  @ApiProperty({ example: false })
  isArchived!: boolean;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: {
      defaultModel: 'auto',
      enableWebSearch: true,
    },
  })
  settings!: Record<string, unknown>;

  @ApiProperty({ type: Date })
  createdAt!: Date;

  @ApiProperty({ type: Date })
  updatedAt!: Date;
}

export class ProjectListResponseDto {
  @ApiProperty({
    type: [ProjectResponseDto],
  })
  items!: ProjectResponseDto[];

  @ApiProperty({ example: 45 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}
