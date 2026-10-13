import { Injectable } from '@nestjs/common';

import { ProjectResponseDto } from '../dto/project-response.dto';
import { ProjectEntity } from '../entities/project.entity';

@Injectable()
export class ProjectMapper {
  toResponse(entity: ProjectEntity): ProjectResponseDto {
    return {
      id: entity.id,
      ownerId: entity.ownerId,
      name: entity.name,
      description: entity.description,
      icon: entity.icon,
      color: entity.color,
      isPinned: entity.isPinned,
      isArchived: entity.isArchived,
      settings: entity.settings,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
