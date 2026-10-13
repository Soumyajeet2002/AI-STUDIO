import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'auth_sessions' })
@Index('idx_auth_sessions_user_id', ['userId'])
@Index('idx_auth_sessions_expires_at', ['expiresAt'])
export class AuthSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
  })
  refreshTokenHash!: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
  })
  expiresAt!: Date;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt!: Date | null;

  @Column({
    name: 'last_used_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastUsedAt!: Date | null;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  userAgent!: string | null;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  ipAddress!: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
