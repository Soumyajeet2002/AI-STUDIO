import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'projects' })
@Index('idx_projects_owner_created_at', ['ownerId', 'createdAt'])
@Index('idx_projects_owner_pinned', ['ownerId', 'isPinned'])
@Index('idx_projects_owner_archived', ['ownerId', 'isArchived'])
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'owner_id',
    type: 'uuid',
  })
  ownerId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity;

  @Column({
    type: 'varchar',
    length: 120,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  icon!: string | null;

  @Column({
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  color!: string | null;

  @Column({
    name: 'is_pinned',
    type: 'boolean',
    default: false,
  })
  isPinned!: boolean;

  @Column({
    name: 'is_archived',
    type: 'boolean',
    default: false,
  })
  isArchived!: boolean;

  @Column({
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  settings!: Record<string, unknown>;

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

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date | null;
}
