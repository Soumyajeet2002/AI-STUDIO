import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ChatEntity } from '../../chats/entities/chat.entity';
import {
  AgentRunPhase,
  AgentRunStatus,
} from '../constants/agent-run.constants';

@Entity({ name: 'agent_runs' })
@Index('IDX_agent_runs_owner_created', ['ownerId', 'createdAt'])
@Index('IDX_agent_runs_chat_created', ['chatId', 'createdAt'])
@Index('IDX_agent_runs_status_created', ['status', 'createdAt'])
export class AgentRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner!: UserEntity;

  @Column({ name: 'chat_id', type: 'uuid' })
  chatId!: string;

  @ManyToOne(() => ChatEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat!: ChatEntity;

  @Column({
    type: 'enum',
    enum: AgentRunStatus,
    enumName: 'agent_runs_status_enum',
    default: AgentRunStatus.QUEUED,
  })
  status!: AgentRunStatus;

  @Column({
    type: 'enum',
    enum: AgentRunPhase,
    enumName: 'agent_runs_phase_enum',
    default: AgentRunPhase.QUEUED,
  })
  phase!: AgentRunPhase;

  @Column({ type: 'text' })
  input!: string;

  @Column({ name: 'output_text', type: 'text', default: '' })
  outputText!: string;

  //   @Column({ type: 'jsonb', default: () => "'{}'::jsonb'".replace("'", '') })
  //   options!: Record<string, unknown>;
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  options!: Record<string, unknown>;

  @Column({ name: 'error_code', type: 'varchar', length: 100, nullable: true })
  errorCode!: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'cancel_requested_at', type: 'timestamptz', nullable: true })
  cancelRequestedAt!: Date | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
