import { Injectable } from '@nestjs/common';

// import { CreateUserDto } from './dto/create-user.dto';

import { UpdateUserDto } from './dto/update-user.dto';

import { UserMapper } from './mappers/user.mapper';

import { UserRepository } from './repositories/user.repository';

import { UserResponseDto } from './dto/user-response.dto';

import { UserEntity } from './entities/user.entity';

import {
  UserEmailAlreadyExistsException,
  UserNotFoundException,
} from './exceptions/user.exceptions';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async createWithPasswordHash(data: {
    email: string;
    displayName: string;
    passwordHash: string;
    avatarUrl?: string | null;
  }): Promise<UserEntity> {
    const email = this.normalizeEmail(data.email);

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new UserEmailAlreadyExistsException();
    }

    return this.userRepository.createUser({
      email,
      displayName: data.displayName.trim(),
      passwordHash: data.passwordHash,
      avatarUrl: data.avatarUrl ?? null,
    });
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.findEntityById(id);

    return this.userMapper.toResponse(user);
  }

  async findEntityById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(this.normalizeEmail(email));
  }

  async findByEmailForAuthentication(
    email: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findByEmailWithPasswordHash(
      this.normalizeEmail(email),
    );
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.findEntityById(id);

    const normalizedEmail =
      dto.email !== undefined ? this.normalizeEmail(dto.email) : undefined;

    if (normalizedEmail && normalizedEmail !== existing.email) {
      const emailExists = await this.userRepository.exists({
        email: normalizedEmail,
      });

      if (emailExists) {
        throw new UserEmailAlreadyExistsException();
      }
    }

    const updated = await this.userRepository.updateUser(id, {
      email: normalizedEmail,
      displayName: dto.displayName?.trim(),
      avatarUrl: dto.avatarUrl,
    });

    if (!updated) {
      throw new UserNotFoundException();
    }

    return this.userMapper.toResponse(updated);
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const updated = await this.userRepository.deactivateUser(id);

    if (!updated) {
      throw new UserNotFoundException();
    }

    return this.userMapper.toResponse(updated);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
