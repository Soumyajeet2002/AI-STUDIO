import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChatEntity } from '../../chats/entities/chat.entity';
import { MessageEntity } from '../entities/message.entity';
import { MessageRole, MessageStatus } from '../constants/message.constants';
import {
  CreateUserMessageData,
  ListMessagesOptions,
  UpdateUserMessageData,
} from '../types/message.types';

@Injectable()
export class MessageRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(MessageEntity)
    private readonly messages: Repository<MessageEntity>,
    @InjectRepository(ChatEntity)
    private readonly chats: Repository<ChatEntity>,
  ) {}

  async createUserMessage(
    data: CreateUserMessageData,
  ): Promise<MessageEntity | null> {
    return this.dataSource.transaction(async (manager) => {
      const chatRepository = manager.getRepository(ChatEntity);
      const messageRepository = manager.getRepository(MessageEntity);

      const chat = await chatRepository.findOne({
        where: { id: data.chatId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!chat) return null;

      const lastMessage = await messageRepository
        .createQueryBuilder('message')
        .select('MAX(message.sequenceNumber)', 'max')
        .where('message.chatId = :chatId', { chatId: data.chatId })
        .getRawOne<{ max: string | null }>();

      const sequenceNumber = Number(lastMessage?.max ?? 0) + 1;

      const entity = messageRepository.create({
        chatId: data.chatId,
        role: MessageRole.USER,
        content: data.content,
        status: MessageStatus.COMPLETED,
        sequenceNumber,
        metadata: data.metadata ?? {},
      });

      const saved = await messageRepository.save(entity);

      chat.lastMessageAt = saved.createdAt;
      await chatRepository.save(chat);

      return saved;
    });
  }

  async findById(messageId: string): Promise<MessageEntity | null> {
    return this.messages.findOne({ where: { id: messageId } });
  }

  async listByChat(options: ListMessagesOptions) {
    const query = this.messages
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId: options.chatId })
      .orderBy('message.sequenceNumber', 'ASC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  }

  async updateUserMessage(
    messageId: string,
    chatId: string,
    data: UpdateUserMessageData,
  ): Promise<MessageEntity | null> {
    const message = await this.messages.findOne({
      where: {
        id: messageId,
        chatId,
        role: MessageRole.USER,
      },
    });

    if (!message) return null;

    message.content = data.content;
    return this.messages.save(message);
  }

  async deleteUserMessage(messageId: string, chatId: string): Promise<boolean> {
    const result = await this.messages.delete({
      id: messageId,
      chatId,
      role: MessageRole.USER,
    });

    return (result.affected ?? 0) > 0;
  }
}
