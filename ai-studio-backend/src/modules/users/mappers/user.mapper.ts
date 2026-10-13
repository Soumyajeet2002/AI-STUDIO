import { Injectable } from '@nestjs/common';

import { UserResponseDto } from '../dto/user-response.dto';
import { UserEntity } from '../entities/user.entity';
import { UserPublic } from '../types/user.types';

@Injectable()
export class UserMapper {
  toPublic(entity: UserEntity): UserPublic {
    return {
      id: entity.id,
      email: entity.email,
      displayName: entity.displayName,
      avatarUrl: entity.avatarUrl,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  toResponse(entity: UserEntity): UserResponseDto {
    return this.toPublic(entity);
  }
}
