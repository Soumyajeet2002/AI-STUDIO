import { ChatEntity } from '../entities/chat.entity';
import { ChatResponseDto } from '../dto/chat-response.dto';

export class ChatMapper {
  static toResponse(entity: ChatEntity): ChatResponseDto {
    return {
      id: entity.id,
      ownerId: entity.ownerId,
      projectId: entity.projectId ?? null,
      title: entity.title,
      isArchived: entity.isArchived,
      metadata: entity.metadata ?? {},
      lastMessageAt: entity.lastMessageAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
