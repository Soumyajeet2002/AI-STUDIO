/* eslint-disable @typescript-eslint/unbound-method */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../projects/entities/project.entity';
import { ChatMapper } from './mappers/chat.mapper';
import { ChatRepository } from './repositories/chat.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ListChatsQueryDto } from './dto/list-chats-query.dto';
import { UpdateChatArchiveDto } from './dto/update-chat-archive.dto';
import {
  ChatNotFoundException,
  ChatProjectNotFoundException,
  ChatTitleRequiredException,
} from './exceptions/chat.exceptions';
import { ChatResponseDto, ChatListResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chats: ChatRepository,
    @InjectRepository(ProjectEntity)
    private readonly projects: Repository<ProjectEntity>,
  ) {}

  async create(ownerId: string, dto: CreateChatDto): Promise<ChatResponseDto> {
    if (dto.projectId) {
      const project = await this.projects.findOne({
        where: {
          id: dto.projectId,
          ownerId,
        },
      });

      if (!project) {
        throw new ChatProjectNotFoundException();
      }
    }

    const title = dto.title?.trim();

    if (dto.title !== undefined && !title) {
      throw new ChatTitleRequiredException();
    }

    const chat = await this.chats.create({
      ownerId,
      projectId: dto.projectId ?? null,
      title: title || undefined,
      metadata: dto.metadata,
    });

    return ChatMapper.toResponse(chat);
  }

  async findAll(
    ownerId: string,
    query: ListChatsQueryDto,
  ): Promise<ChatListResponseDto> {
    if (query.projectId) {
      const project = await this.projects.findOne({
        where: { id: query.projectId, ownerId },
      });
      if (!project) throw new ChatProjectNotFoundException();
    }

    const result = await this.chats.listOwned({
      ownerId,
      page: query.page,
      limit: query.limit,
      search: query.search,
      projectId: query.projectId,
      isArchived: query.isArchived,
    });

    return {
      ...result,
      items: result.items.map(ChatMapper.toResponse),
    };
  }

  async findOne(ownerId: string, chatId: string): Promise<ChatResponseDto> {
    const chat = await this.chats.findOwnedById(chatId, ownerId);
    if (!chat) throw new ChatNotFoundException();
    return ChatMapper.toResponse(chat);
  }

  async update(
    ownerId: string,
    chatId: string,
    dto: UpdateChatDto,
  ): Promise<ChatResponseDto> {
    if (dto.projectId !== undefined) {
      throw new ChatProjectNotFoundException();
    }

    if (dto.title !== undefined && !dto.title.trim()) {
      throw new ChatTitleRequiredException();
    }

    const updated = await this.chats.updateOwned(chatId, ownerId, {
      title: dto.title?.trim(),
      metadata: dto.metadata,
    });

    if (!updated) throw new ChatNotFoundException();
    return ChatMapper.toResponse(updated);
  }

  async setArchived(
    ownerId: string,
    chatId: string,
    dto: UpdateChatArchiveDto,
  ): Promise<ChatResponseDto> {
    const updated = await this.chats.setArchived(
      chatId,
      ownerId,
      dto.isArchived,
    );

    if (!updated) throw new ChatNotFoundException();
    return ChatMapper.toResponse(updated);
  }

  async remove(ownerId: string, chatId: string): Promise<void> {
    const deleted = await this.chats.softDeleteOwned(chatId, ownerId);
    if (!deleted) throw new ChatNotFoundException();
  }
}
