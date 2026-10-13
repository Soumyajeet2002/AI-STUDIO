import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

import {
  AUTH_ACCESS_TOKEN_TTL_SECONDS,
  AUTH_ACCESS_TOKEN_TYPE,
  AUTH_JWT_AUDIENCE,
  AUTH_JWT_ISSUER,
  AUTH_REFRESH_TOKEN_TTL_SECONDS,
  AUTH_REFRESH_TOKEN_TYPE,
} from './constants/auth.constants';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import {
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  RegistrationEmailAlreadyExistsException,
} from './exceptions/auth.exceptions';

import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './interfaces/token-payload.interface';

import { AuthSessionRepository } from './repositories/auth-session.repository';

import { PasswordService } from './services/password.service';

import { UsersService } from '../users/users.service';

import { UserEntity } from '../users/entities/user.entity';

import { AuthTokenPair } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly sessionRepository: AuthSessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    dto: RegisterDto,
    userAgent?: string | null,
    ipAddress?: string | null,
  ): Promise<{
    tokens: AuthTokenPair;
    user: UserEntity;
  }> {
    const email = this.normalizeEmail(dto.email);

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new RegistrationEmailAlreadyExistsException();
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.usersService.createWithPasswordHash({
      email,
      displayName: dto.displayName.trim(),
      passwordHash,
      avatarUrl: dto.avatarUrl ?? null,
    });

    const tokens = await this.createSessionAndTokens(
      user,
      userAgent,
      ipAddress,
    );

    return {
      tokens,
      user,
    };
  }

  async login(
    dto: LoginDto,
    userAgent?: string | null,
    ipAddress?: string | null,
  ): Promise<{
    tokens: AuthTokenPair;
    user: UserEntity;
  }> {
    const email = this.normalizeEmail(dto.email);

    const user = await this.usersService.findByEmailForAuthentication(email);

    if (!user || !user.isActive) {
      throw new InvalidCredentialsException();
    }

    const validPassword = await this.passwordService.verify(
      user.passwordHash,
      dto.password,
    );

    if (!validPassword) {
      throw new InvalidCredentialsException();
    }

    const tokens = await this.createSessionAndTokens(
      user,
      userAgent,
      ipAddress,
    );

    return {
      tokens,
      user,
    };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserEntity;
  }> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const session = await this.sessionRepository.findById(payload.sessionId);

    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new InvalidRefreshTokenException();
    }

    const refreshTokenMatches = await this.passwordService.verify(
      session.refreshTokenHash,
      refreshToken,
    );

    if (!refreshTokenMatches) {
      // Possible refresh-token reuse.
      await this.sessionRepository.revoke(session.id);

      throw new InvalidRefreshTokenException();
    }

    const user = await this.usersService.findEntityById(session.userId);

    if (!user || !user.isActive) {
      await this.sessionRepository.revoke(session.id);

      throw new InvalidRefreshTokenException();
    }

    const accessToken = await this.signAccessToken(user.id, session.id);

    const newRefreshToken = await this.signRefreshToken(user.id, session.id);

    const newRefreshTokenHash =
      await this.passwordService.hash(newRefreshToken);

    const newExpiresAt = new Date(
      Date.now() + AUTH_REFRESH_TOKEN_TTL_SECONDS * 1000,
    );

    await this.sessionRepository.updateRefreshToken(
      session.id,
      newRefreshTokenHash,
      newExpiresAt,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  async logout(authenticatedUser: AuthenticatedUser): Promise<void> {
    await this.sessionRepository.revoke(authenticatedUser.sessionId);
  }

  async logoutAll(authenticatedUser: AuthenticatedUser): Promise<void> {
    await this.sessionRepository.revokeAllForUser(authenticatedUser.id);
  }

  async getCurrentUser(userId: string): Promise<UserEntity> {
    const user = await this.usersService.findEntityById(userId);

    if (!user || !user.isActive) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  private async createSessionAndTokens(
    user: UserEntity,
    userAgent?: string | null,
    ipAddress?: string | null,
  ): Promise<AuthTokenPair> {
    // const sessionId = crypto.randomUUID();
    const sessionId = randomUUID();

    const accessToken = await this.signAccessToken(user.id, sessionId);

    const refreshToken = await this.signRefreshToken(user.id, sessionId);

    const refreshTokenHash = await this.passwordService.hash(refreshToken);

    const expiresAt = new Date(
      Date.now() + AUTH_REFRESH_TOKEN_TTL_SECONDS * 1000,
    );

    await this.sessionRepository.createSession({
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signAccessToken(
    userId: string,
    sessionId: string,
  ): Promise<string> {
    const secret = this.requireConfig('AUTH_ACCESS_TOKEN_SECRET');

    const payload: AccessTokenPayload = {
      sub: userId,
      sessionId,
      type: AUTH_ACCESS_TOKEN_TYPE,
    };

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: AUTH_ACCESS_TOKEN_TTL_SECONDS,
      issuer: AUTH_JWT_ISSUER,
      audience: AUTH_JWT_AUDIENCE,
    });
  }

  private async signRefreshToken(
    userId: string,
    sessionId: string,
  ): Promise<string> {
    const secret = this.requireConfig('AUTH_REFRESH_TOKEN_SECRET');

    const payload: RefreshTokenPayload = {
      sub: userId,
      sessionId,
      type: AUTH_REFRESH_TOKEN_TYPE,
    };

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: AUTH_REFRESH_TOKEN_TTL_SECONDS,
      issuer: AUTH_JWT_ISSUER,
      audience: AUTH_JWT_AUDIENCE,
    });
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const secret = this.requireConfig('AUTH_REFRESH_TOKEN_SECRET');

      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret,
          issuer: AUTH_JWT_ISSUER,
          audience: AUTH_JWT_AUDIENCE,
        },
      );

      if (
        payload.type !== AUTH_REFRESH_TOKEN_TYPE ||
        !payload.sub ||
        !payload.sessionId
      ) {
        throw new Error();
      }

      return payload;
    } catch {
      throw new InvalidRefreshTokenException();
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private requireConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`${key} is not configured`);
    }

    return value;
  }
}
