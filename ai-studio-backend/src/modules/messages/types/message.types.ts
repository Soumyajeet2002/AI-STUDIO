import { MessageStatus } from '../constants/message.constants';

export interface CreateUserMessageData {
  chatId: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateUserMessageData {
  content: string;
}

export interface ListMessagesOptions {
  chatId: string;
  page: number;
  limit: number;
}

export interface UpdateMessageStatusData {
  status: MessageStatus;
  modelProvider?: string | null;
  modelName?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
}
