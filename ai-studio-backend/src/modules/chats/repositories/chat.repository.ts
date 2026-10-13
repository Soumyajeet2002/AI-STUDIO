import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from '../entities/chat.entity';
import {
  CreateChatData,
  ListChatsOptions,
  UpdateChatData,
} from '../types/chat.types';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly repository: Repository<ChatEntity>,
  ) {}

  async create(data: CreateChatData): Promise<ChatEntity> {
    const entity = this.repository.create({
      ownerId: data.ownerId,
      projectId: data.projectId ?? null,
      title: data.title?.trim() || 'New chat',
      metadata: data.metadata ?? {},
      isArchived: false,
    });

    return this.repository.save(entity);
  }

  async findOwnedById(
    chatId: string,
    ownerId: string,
  ): Promise<ChatEntity | null> {
    return this.repository.findOne({
      where: { id: chatId, ownerId },
    });
  }

  async listOwned(options: ListChatsOptions) {
    const { ownerId, page, limit, search, projectId, isArchived } = options;

    const query = this.repository
      .createQueryBuilder('chat')
      .where('chat.ownerId = :ownerId', { ownerId });

    if (projectId) {
      query.andWhere('chat.projectId = :projectId', { projectId });
    }

    if (typeof isArchived === 'boolean') {
      query.andWhere('chat.isArchived = :isArchived', { isArchived });
    }

    if (search?.trim()) {
      query.andWhere('chat.title ILIKE :search', {
        search: `%${this.escapeLike(search.trim())}%`,
      });
    }

    query
      .orderBy('chat.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('chat.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateOwned(
    chatId: string,
    ownerId: string,
    data: UpdateChatData,
  ): Promise<ChatEntity | null> {
    const chat = await this.findOwnedById(chatId, ownerId);
    if (!chat) return null;

    if (data.title !== undefined) chat.title = data.title;
    if (data.metadata !== undefined) chat.metadata = data.metadata;

    return this.repository.save(chat);
  }

  async setArchived(
    chatId: string,
    ownerId: string,
    isArchived: boolean,
  ): Promise<ChatEntity | null> {
    const chat = await this.findOwnedById(chatId, ownerId);
    if (!chat) return null;

    chat.isArchived = isArchived;
    return this.repository.save(chat);
  }

  async softDeleteOwned(chatId: string, ownerId: string): Promise<boolean> {
    const result = await this.repository.softDelete({ id: chatId, ownerId });
    return (result.affected ?? 0) > 0;
  }

  private escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }
}
