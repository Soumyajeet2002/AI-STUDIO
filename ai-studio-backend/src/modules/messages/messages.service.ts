/* eslint-disable @typescript-eslint/unbound-method */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from '../chats/entities/chat.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ListMessagesQueryDto } from './dto/list-messages-query.dto';
import {
  MessageListResponseDto,
  MessageResponseDto,
} from './dto/message-response.dto';
import { MessageMapper } from './mappers/message.mapper';
import { MessageRepository } from './repositories/message.repository';
import {
  MessageChatNotFoundException,
  MessageNotEditableException,
  MessageNotFoundException,
} from './exceptions/message.exceptions';
// import { MessageRole } from './constants/message.constants';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    @InjectRepository(ChatEntity)
    private readonly chats: Repository<ChatEntity>,
  ) {}

  private async findOwnedChat(
    chatId: string,
    ownerId: string,
  ): Promise<ChatEntity> {
    const chat = await this.chats.findOne({
      where: { id: chatId, ownerId },
    });

    if (!chat) throw new MessageChatNotFoundException();
    return chat;
  }

  async create(
    ownerId: string,
    chatId: string,
    dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    await this.findOwnedChat(chatId, ownerId);

    const content = dto.content.trim();
    if (!content) {
      throw new MessageNotEditableException();
    }

    const message = await this.messageRepository.createUserMessage({
      chatId,
      content,
      metadata: dto.metadata,
    });

    if (!message) throw new MessageChatNotFoundException();
    return MessageMapper.toResponse(message);
  }

  async findAll(
    ownerId: string,
    chatId: string,
    query: ListMessagesQueryDto,
  ): Promise<MessageListResponseDto> {
    await this.findOwnedChat(chatId, ownerId);

    const result = await this.messageRepository.listByChat({
      chatId,
      page: query.page,
      limit: query.limit,
    });

    return {
      ...result,
      items: result.items.map(MessageMapper.toResponse),
    };
  }

  async findOne(
    ownerId: string,
    chatId: string,
    messageId: string,
  ): Promise<MessageResponseDto> {
    await this.findOwnedChat(chatId, ownerId);

    const message = await this.messageRepository.findById(messageId);
    if (!message || message.chatId !== chatId) {
      throw new MessageNotFoundException();
    }

    return MessageMapper.toResponse(message);
  }

  async update(
    ownerId: string,
    chatId: string,
    messageId: string,
    dto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    await this.findOwnedChat(chatId, ownerId);

    const content = dto.content.trim();
    if (!content) throw new MessageNotEditableException();

    const message = await this.messageRepository.updateUserMessage(
      messageId,
      chatId,
      { content },
    );

    if (!message) throw new MessageNotFoundException();
    return MessageMapper.toResponse(message);
  }

  async remove(
    ownerId: string,
    chatId: string,
    messageId: string,
  ): Promise<void> {
    await this.findOwnedChat(chatId, ownerId);

    const deleted = await this.messageRepository.deleteUserMessage(
      messageId,
      chatId,
    );

    if (!deleted) throw new MessageNotFoundException();
  }
}
