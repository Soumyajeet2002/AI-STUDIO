// export interface Chat {
//   id: string;
//   title: string;
//   projectId: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateChatRequest {
//   title: string;
//   projectId?: string;
// }

// export interface UpdateChatRequest {
//   title?: string;
//   projectId?: string | null;
// }

// export interface ChatMessage {
//   id: string;
//   chatId: string;
//   role: "user" | "assistant" | "system" | "tool";
//   content: string;
//   status?: string;
//   sequenceNumber?: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateMessageRequest {
//   role: "user";
//   content: string;
// }

// export interface UpdateMessageRequest {
//   content: string;
// }


export interface Chat {
  id: string;
  ownerId: string;
  projectId: string | null;
  title: string;
  isArchived: boolean;
  metadata: Record<string, unknown>;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatRequest {
  title: string;
  projectId?: string;
}

export interface UpdateChatRequest {
  title?: string;
  projectId?: string | null;
}

// Persisted backend message
export interface ChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  status?: string;
  sequenceNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageRequest {
  role: "user";
  content: string;
}

export interface UpdateMessageRequest {
  content: string;
}

// UI-only message used by ChatWorkspace
export interface WorkspaceMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  status: string;
  tokenUsage?: TokenUsage | null;
  metadata?: {
    requestId?: string;
    executionId?: string;
    executionStatus?:
    | "queued"
    | "planning"
    | "executing"
    | "running"
    | "searching"
    | "retrieving"
    | "streaming"
    | "completed"
    | "failed"
    | "cancelled";
    createdAt?: string;
    capability?: "image" | "video" | "content" | "web" | null;
  };
}

// Adjust this interface to match your existing TokenUsage definition.
export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface PaginatedChatsResponse {
  items: Chat[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}