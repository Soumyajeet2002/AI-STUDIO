import type { WorkspaceCapabilityType } from "../../workspace/types/workspace.types";

export type AIExecutionStatus =
  | "idle"
  | "queued"
  | "planning"
  | "searching"
  | "retrieving"
  | "executing"
  | "streaming"
  | "completed"
  | "cancelled"
  | "failed";

export type AIToolType =
  | "web_search"
  | "knowledge_retrieval"
  | "code_execution"
  | "image_generation"
  | "video_generation"
  | "file_analysis";

export type AIExecutionEvent =
  | {
      type: "status";
      status: AIExecutionStatus;
    }
  | {
      type: "text_delta";
      delta: string;
    }
  | {
      type: "tool_start";
      tool: AIToolType;
      toolCallId: string;
      input?: unknown;
    }
  | {
      type: "tool_result";
      tool: AIToolType;
      toolCallId: string;
      output?: unknown;
    }
  | {
      type: "token_usage";
      input: number;
      output: number;
      total: number;
    }
  | {
      type: "completed";
      messageId: string;
    }
  | {
      type: "cancelled";
    }
  | {
      type: "error";
      message: string;
    };

export type AIExecutionRequest = {
  chatId: string;
  message: string;
  capability: WorkspaceCapabilityType | null;
  attachments: string[];
  requestId?: string;
};

export type AIExecutionResponse = {
  requestId: string;
  chatId: string;
  status:
    | AIExecutionStatus;
};