import type {
  AIExecutionStatus,
  AIToolType,
} from "./ai.types";

export type ExecutionToolCallStatus =
  | "running"
  | "completed"
  | "cancelled"
  | "failed";

export type ExecutionToolCall = {
  id: string;
  tool: AIToolType;
  status: ExecutionToolCallStatus;
  input?: unknown;
  output?: unknown;
  startedAt?: string;
  completedAt?: string;
  error?: string;
};

export type ExecutionTokenUsage = {
  input: number;
  output: number;
  total: number;
};

export type ExecutionRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "cancelled"
  | "failed";

export type ExecutionRun = {
  id: string;
  requestId: string;
  chatId: string;
  status: ExecutionRunStatus;
  aiStatus: AIExecutionStatus;
  toolCalls: ExecutionToolCall[];
  tokenUsage: ExecutionTokenUsage | null;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
};