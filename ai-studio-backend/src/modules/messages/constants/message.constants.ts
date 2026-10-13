export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool',
}

export enum MessageStatus {
  PENDING = 'pending',
  STREAMING = 'streaming',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export const MESSAGE_MAX_CONTENT_LENGTH = 100_000;
export const MESSAGE_DEFAULT_PAGE = 1;
export const MESSAGE_DEFAULT_LIMIT = 50;
export const MESSAGE_MAX_LIMIT = 100;
