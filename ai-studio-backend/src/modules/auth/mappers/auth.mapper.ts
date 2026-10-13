import { Injectable } from '@nestjs/common';

import {
  AccessTokenResponseDto,
  AuthResponseDto,
} from '../dto/auth-response.dto';

import { UserEntity } from '../../users/entities/user.entity';
import { UserMapper } from '../../users/mappers/user.mapper';

@Injectable()
export class AuthMapper {
  constructor(private readonly userMapper: UserMapper) {}

  toAuthResponse(
    accessToken: string,
    refreshToken: string,
    user: UserEntity,
  ): AuthResponseDto {
    return {
      accessToken,
      refreshToken,
      user: this.userMapper.toResponse(user),
    };
  }

  toAccessTokenResponse(
    accessToken: string,
    user: UserEntity,
  ): AccessTokenResponseDto {
    return {
      accessToken,
      user: this.userMapper.toResponse(user),
    };
  }
}
