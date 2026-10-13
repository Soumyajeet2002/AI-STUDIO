import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthSessionEntity } from '../entities/auth-session.entity';

export interface CreateAuthSessionData {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class AuthSessionRepository {
  constructor(
    @InjectRepository(AuthSessionEntity)
    private readonly repository: Repository<AuthSessionEntity>,
  ) {}

  async createSession(data: CreateAuthSessionData): Promise<AuthSessionEntity> {
    const session = this.repository.create({
      id: data.id,
      userId: data.userId,
      refreshTokenHash: data.refreshTokenHash,
      expiresAt: data.expiresAt,
      revokedAt: null,
      lastUsedAt: null,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
    });

    return this.repository.save(session);
  }

  async findById(id: string): Promise<AuthSessionEntity | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async updateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date,
  ): Promise<AuthSessionEntity | null> {
    await this.repository.update(
      { id: sessionId },
      {
        refreshTokenHash,
        expiresAt,
        lastUsedAt: new Date(),
        revokedAt: null,
      },
    );

    return this.findById(sessionId);
  }

  async revoke(sessionId: string): Promise<void> {
    await this.repository.update(
      {
        id: sessionId,
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(AuthSessionEntity)
      .set({
        revokedAt: new Date(),
      })
      .where('user_id = :userId', { userId })
      .andWhere('revoked_at IS NULL')
      .execute();
  }
}
