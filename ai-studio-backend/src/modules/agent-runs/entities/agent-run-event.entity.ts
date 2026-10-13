import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AgentRunEntity } from './agent-run.entity';
import { AgentRunEventData } from '../types/agent-run.types';
import { AgentRunPhase } from '../constants/agent-run.constants';

@Entity({ name: 'agent_run_events' })
export class AgentRunEventEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => AgentRunEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'run_id' })
  run!: AgentRunEntity;

  @Column({
    name: 'run_id',
    type: 'uuid',
  })
  runId!: string;

  @Column({
    type: 'enum',
    enum: [
      'status',
      'task',
      'text_delta',
      'tool_start',
      'tool_result',
      'token_usage',
      'completed',
      'cancelled',
      'error',
    ],
    enumName: 'agent_run_events_type_enum',
  })
  type!: AgentRunEventData['type'];

  @Column({
    type: 'enum',
    enum: AgentRunPhase,
    enumName: 'agent_runs_phase_enum',
    nullable: true,
  })
  phase!: AgentRunPhase | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  message!: string | null;

  @Column({
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  payload!: Record<string, unknown>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
