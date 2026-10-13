import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { ProjectEntity } from '../entities/project.entity';
import {
  CreateProjectData,
  ListProjectsOptions,
  UpdateProjectData,
} from '../types/project.types';

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly repository: Repository<ProjectEntity>,
  ) {}

  async createProject(data: CreateProjectData): Promise<ProjectEntity> {
    const entity = this.repository.create({
      ownerId: data.ownerId,
      name: data.name,
      description: data.description ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      isPinned: false,
      isArchived: false,
      settings: {},
    });

    return this.repository.save(entity);
  }

  async findOwnedProject(
    projectId: string,
    ownerId: string,
  ): Promise<ProjectEntity | null> {
    return this.repository.findOne({
      where: {
        id: projectId,
        ownerId,
      },
    });
  }

  async listOwnedProjects(
    ownerId: string,
    options: ListProjectsOptions,
  ): Promise<[ProjectEntity[], number]> {
    const query = this.repository
      .createQueryBuilder('project')
      .where('project.owner_id = :ownerId', {
        ownerId,
      })
      .andWhere('project.is_archived = :isArchived', {
        isArchived: options.isArchived ?? false,
      });

    if (options.isPinned !== undefined) {
      query.andWhere('project.is_pinned = :isPinned', {
        isPinned: options.isPinned,
      });
    }

    if (options.search?.trim()) {
      const search = `%${options.search.trim()}%`;

      query.andWhere(
        new Brackets((qb) => {
          qb.where('project.name ILIKE :search', {
            search,
          }).orWhere('project.description ILIKE :search', { search });
        }),
      );
    }

    query
      .orderBy('project.is_pinned', 'DESC')
      .addOrderBy('project.updated_at', 'DESC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    return query.getManyAndCount();
  }

  async updateOwnedProject(
    projectId: string,
    ownerId: string,
    data: UpdateProjectData,
  ): Promise<ProjectEntity | null> {
    const project = await this.findOwnedProject(projectId, ownerId);

    if (!project) {
      return null;
    }

    Object.assign(project, data);

    await this.repository.save(project);

    return this.findOwnedProject(projectId, ownerId);
  }

  async setPinned(
    projectId: string,
    ownerId: string,
    isPinned: boolean,
  ): Promise<ProjectEntity | null> {
    const project = await this.findOwnedProject(projectId, ownerId);

    if (!project) {
      return null;
    }

    project.isPinned = isPinned;

    await this.repository.save(project);

    return this.findOwnedProject(projectId, ownerId);
  }

  async setArchived(
    projectId: string,
    ownerId: string,
    isArchived: boolean,
  ): Promise<ProjectEntity | null> {
    const project = await this.findOwnedProject(projectId, ownerId);

    if (!project) {
      return null;
    }

    project.isArchived = isArchived;

    await this.repository.save(project);

    return this.findOwnedProject(projectId, ownerId);
  }

  async softDeleteOwnedProject(
    projectId: string,
    ownerId: string,
  ): Promise<boolean> {
    const project = await this.findOwnedProject(projectId, ownerId);

    if (!project) {
      return false;
    }

    await this.repository.softDelete({
      id: projectId,
      ownerId,
    });

    return true;
  }
}
