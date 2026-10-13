import { MessageResponseDto } from '../dto/message-response.dto';
import { MessageEntity } from '../entities/message.entity';

export class MessageMapper {
  static toResponse(entity: MessageEntity): MessageResponseDto {
    return {
      id: entity.id,
      chatId: entity.chatId,
      role: entity.role,
      content: entity.content,
      status: entity.status,
      sequenceNumber: entity.sequenceNumber,
      modelProvider: entity.modelProvider,
      modelName: entity.modelName,
      inputTokens: entity.inputTokens,
      outputTokens: entity.outputTokens,
      metadata: entity.metadata ?? {},
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
