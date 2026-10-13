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
import { ProjectEntity } from '../../projects/entities/project.entity';

@Entity({ name: 'chats' })
@Index('IDX_chats_owner_updated_at', ['ownerId', 'updatedAt'])
@Index('IDX_chats_owner_project', ['ownerId', 'projectId'])
@Index('IDX_chats_owner_archived', ['ownerId', 'isArchived'])
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId!: string | null;

  @ManyToOne(() => ProjectEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'project_id' })
  project!: ProjectEntity | null;

  @Column({ type: 'varchar', length: 200, default: 'New chat' })
  title!: string;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
