import { Injectable } from '@nestjs/common';

// import { randomUUID } from 'node:crypto';
import { UpdateProjectData } from './types/project.types';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';
import {
  ProjectListResponseDto,
  ProjectResponseDto,
} from './dto/project-response.dto';

import { ProjectNotFoundException } from './exceptions/project.exceptions';

import { ProjectMapper } from './mappers/project.mapper';
import { ProjectRepository } from './repositories/project.repository';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectMapper: ProjectMapper,
  ) {}

  async create(
    ownerId: string,
    dto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.createProject({
      ownerId,
      name: dto.name.trim(),
      description: this.normalizeNullableText(dto.description),
      icon: this.normalizeNullableText(dto.icon),
      color: this.normalizeNullableText(dto.color),
    });

    return this.projectMapper.toResponse(project);
  }

  async findAll(
    ownerId: string,
    query: ListProjectsQueryDto,
  ): Promise<ProjectListResponseDto> {
    const [projects, total] = await this.projectRepository.listOwnedProjects(
      ownerId,
      {
        page: query.page,
        limit: query.limit,
        search: query.search,
        isPinned: query.isPinned,
        isArchived: query.isArchived,
      },
    );

    return {
      items: projects.map((project) => this.projectMapper.toResponse(project)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findOne(
    ownerId: string,
    projectId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOwnedProject(
      projectId,
      ownerId,
    );

    if (!project) {
      throw new ProjectNotFoundException();
    }

    return this.projectMapper.toResponse(project);
  }

  async update(
    ownerId: string,
    projectId: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    // const data: Record<string, unknown> = {};
    const data: UpdateProjectData = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      data.description = this.normalizeNullableText(dto.description);
    }

    if (dto.icon !== undefined) {
      data.icon = this.normalizeNullableText(dto.icon);
    }

    if (dto.color !== undefined) {
      data.color = this.normalizeNullableText(dto.color);
    }

    if (dto.settings !== undefined) {
      data.settings = dto.settings;
    }

    const updated = await this.projectRepository.updateOwnedProject(
      projectId,
      ownerId,
      data,
    );

    if (!updated) {
      throw new ProjectNotFoundException();
    }

    return this.projectMapper.toResponse(updated);
  }

  async pin(
    ownerId: string,
    projectId: string,
    isPinned: boolean,
  ): Promise<ProjectResponseDto> {
    const updated = await this.projectRepository.setPinned(
      projectId,
      ownerId,
      isPinned,
    );

    if (!updated) {
      throw new ProjectNotFoundException();
    }

    return this.projectMapper.toResponse(updated);
  }

  async archive(
    ownerId: string,
    projectId: string,
    isArchived: boolean,
  ): Promise<ProjectResponseDto> {
    const updated = await this.projectRepository.setArchived(
      projectId,
      ownerId,
      isArchived,
    );

    if (!updated) {
      throw new ProjectNotFoundException();
    }

    return this.projectMapper.toResponse(updated);
  }

  async delete(ownerId: string, projectId: string): Promise<void> {
    const deleted = await this.projectRepository.softDeleteOwnedProject(
      projectId,
      ownerId,
    );

    if (!deleted) {
      throw new ProjectNotFoundException();
    }
  }

  private normalizeNullableText(
    value: string | null | undefined,
  ): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : null;
  }
}
