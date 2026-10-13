import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { CreateUserData, UpdateUserData } from '../types/user.types';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async createUser(data: CreateUserData): Promise<UserEntity> {
    const user = this.repository.create({
      email: data.email,
      displayName: data.displayName,
      passwordHash: data.passwordHash,
      avatarUrl: data.avatarUrl ?? null,
      isActive: true,
    });

    return this.repository.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: {
        email,
      },
    });
  }

  async findByEmailWithPasswordHash(email: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', {
        email,
      })
      .getOne();
  }

  async updateUser(
    id: string,
    data: UpdateUserData,
  ): Promise<UserEntity | null> {
    await this.repository.update(id, data);

    return this.findById(id);
  }

  async deactivateUser(id: string): Promise<UserEntity | null> {
    await this.repository.update(id, {
      isActive: false,
    });

    return this.findById(id);
  }

  async exists(where: FindOptionsWhere<UserEntity>): Promise<boolean> {
    return this.repository.exists({
      where,
    });
  }
}
