import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatEntity } from '../../chats/entities/chat.entity';
import { MessageRole, MessageStatus } from '../constants/message.constants';

@Entity({ name: 'messages' })
@Check('"sequence_number" > 0')
@Index('IDX_messages_chat_sequence', ['chatId', 'sequenceNumber'], {
  unique: true,
})
@Index('IDX_messages_chat_created_at', ['chatId', 'createdAt'])
@Index('IDX_messages_chat_status', ['chatId', 'status'])
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'chat_id', type: 'uuid' })
  chatId!: string;

  @ManyToOne(() => ChatEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat!: ChatEntity;

  @Column({
    type: 'enum',
    enum: MessageRole,
    enumName: 'messages_role_enum',
  })
  role!: MessageRole;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    enumName: 'messages_status_enum',
    default: MessageStatus.COMPLETED,
  })
  status!: MessageStatus;

  @Column({ name: 'sequence_number', type: 'integer' })
  sequenceNumber!: number;

  @Column({
    name: 'model_provider',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  modelProvider!: string | null;

  @Column({ name: 'model_name', type: 'varchar', length: 100, nullable: true })
  modelName!: string | null;

  @Column({ name: 'input_tokens', type: 'integer', nullable: true })
  inputTokens!: number | null;

  @Column({ name: 'output_tokens', type: 'integer', nullable: true })
  outputTokens!: number | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
