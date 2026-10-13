import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

import {
  PROJECT_COLOR_MAX_LENGTH,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_ICON_MAX_LENGTH,
  PROJECT_NAME_MAX_LENGTH,
} from '../constants/project.constants';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project display name',
    example: 'AI Research Workspace',
    minLength: 1,
    maxLength: PROJECT_NAME_MAX_LENGTH,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  name!: string;

  @ApiPropertyOptional({
    description: 'Optional project description',
    example: 'Research, experiments, and AI architecture notes.',
    maxLength: PROJECT_DESCRIPTION_MAX_LENGTH,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_DESCRIPTION_MAX_LENGTH)
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Icon identifier used by the frontend',
    example: 'folder-kanban',
    maxLength: PROJECT_ICON_MAX_LENGTH,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_ICON_MAX_LENGTH)
  icon?: string | null;

  @ApiPropertyOptional({
    description: 'Frontend theme color or design token',
    example: '#6366F1',
    maxLength: PROJECT_COLOR_MAX_LENGTH,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(PROJECT_COLOR_MAX_LENGTH)
  @Matches(/^(#[0-9a-fA-F]{3,8}|[a-zA-Z][a-zA-Z0-9_-]*)$/, {
    message: 'color must be a valid hex color or design token',
  })
  color?: string | null;
}
