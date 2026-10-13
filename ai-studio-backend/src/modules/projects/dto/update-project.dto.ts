import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { IsObject, IsOptional } from 'class-validator';

import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({
    description: 'Project-specific settings',
    example: {
      defaultModel: 'auto',
      enableWebSearch: true,
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
