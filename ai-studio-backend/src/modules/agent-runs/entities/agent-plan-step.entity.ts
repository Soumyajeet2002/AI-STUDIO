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
import { AgentRunEntity } from './agent-run.entity';
import { AgentPlanStepStatus } from '../constants/agent-run.constants';

@Entity({ name: 'agent_plan_steps' })
@Index('IDX_agent_plan_steps_run_sequence', ['runId', 'sequenceNumber'], {
  unique: true,
})
export class AgentPlanStepEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => AgentRunEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'run_id' })
  run!: AgentRunEntity;

  @Column({ name: 'run_id', type: 'uuid' })
  runId!: string;

  @Column({ name: 'sequence_number', type: 'integer' })
  sequenceNumber!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: AgentPlanStepStatus,
    enumName: 'agent_plan_steps_status_enum',
    default: AgentPlanStepStatus.PENDING,
  })
  status!: AgentPlanStepStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
