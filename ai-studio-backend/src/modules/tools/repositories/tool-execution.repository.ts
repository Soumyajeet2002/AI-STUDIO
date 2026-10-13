import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToolExecutionEntity } from '../entities/tool-execution.entity';

@Injectable()
export class ToolExecutionRepository {
  constructor(
    @InjectRepository(ToolExecutionEntity)
    private readonly repository: Repository<ToolExecutionEntity>,
  ) {}

  async create(
    data: Partial<ToolExecutionEntity>,
  ): Promise<ToolExecutionEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: Partial<ToolExecutionEntity>): Promise<void> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error(`Tool execution ${id} was not found.`);
    }

    Object.assign(entity, data);
    await this.repository.save(entity);
  }

  async findOwned(
    id: string,
    userId: string,
  ): Promise<ToolExecutionEntity | null> {
    return this.repository.findOne({
      where: { id, userId },
    });
  }

  async listOwned(
    userId: string,
    limit: number,
  ): Promise<ToolExecutionEntity[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
