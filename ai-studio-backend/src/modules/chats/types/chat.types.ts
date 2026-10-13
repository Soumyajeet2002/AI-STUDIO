export interface CreateChatData {
  ownerId: string;
  projectId?: string | null;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateChatData {
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface ListChatsOptions {
  ownerId: string;
  page: number;
  limit: number;
  search?: string;
  projectId?: string;
  isArchived?: boolean;
}

export interface ChatListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
