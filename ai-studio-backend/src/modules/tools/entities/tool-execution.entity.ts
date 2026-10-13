import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ToolExecutionStatus } from '../constants/tool.constants';

@Entity({ name: 'tool_executions' })
@Index('idx_tool_executions_user_created', ['userId', 'createdAt'])
@Index('idx_tool_executions_run', ['runId'])
@Index('idx_tool_executions_status', ['status', 'createdAt'])
export class ToolExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'chat_id', type: 'uuid', nullable: true })
  chatId!: string | null;

  @Column({ name: 'run_id', type: 'uuid', nullable: true })
  runId!: string | null;

  @Column({ name: 'tool_name', type: 'varchar', length: 100 })
  toolName!: string;

  @Column({ name: 'tool_version', type: 'varchar', length: 32 })
  toolVersion!: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status!: ToolExecutionStatus;

  @Column({ name: 'input_hash', type: 'varchar', length: 64 })
  inputHash!: string;

  @Column({ name: 'output', type: 'jsonb', nullable: true })
  output!: Record<string, unknown> | null;

  @Column({ name: 'error_code', type: 'varchar', length: 100, nullable: true })
  errorCode!: string | null;

  @Column({
    name: 'error_message',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  errorMessage!: string | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'duration_ms', type: 'integer', nullable: true })
  durationMs!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
