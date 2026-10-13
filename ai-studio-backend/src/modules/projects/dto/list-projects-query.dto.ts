/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';

import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  PROJECT_DEFAULT_PAGE,
  PROJECT_DEFAULT_PAGE_SIZE,
  PROJECT_MAX_PAGE_SIZE,
} from '../constants/project.constants';

export class ListProjectsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number, starting at 1',
    default: PROJECT_DEFAULT_PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = PROJECT_DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Number of projects per page',
    default: PROJECT_DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: PROJECT_MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PROJECT_MAX_PAGE_SIZE)
  limit = PROJECT_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    description: 'Search project names and descriptions',
    example: 'AI research',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter pinned projects',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({
    description: 'Filter archived projects',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  isArchived?: boolean;
}
