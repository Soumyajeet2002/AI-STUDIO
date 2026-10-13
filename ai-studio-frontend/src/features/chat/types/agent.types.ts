import type {
    AIExecutionStatus,
    AIToolType,
} from "./ai.types";

import type {
    ExecutionRunStatus,
    ExecutionToolCallStatus,
} from "./execution.types";

/**
 * ---------------------------------------------------------
 * Agent execution request
 * ---------------------------------------------------------
 */

export type AgentExecutionRequest = {
    requestId: string;
    chatId: string;

    message: string;

    capability:
        | "image"
        | "video"
        | "content"
        | "web"
        | null;

    attachments: AgentAttachment[];

    model?: string;

    conversationId?: string;

    metadata?: Record<
        string,
        unknown
    >;
};

export type AgentAttachment = {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
};


/**
 * ---------------------------------------------------------
 * Agent run
 * ---------------------------------------------------------
 */

export type AgentRun = {
    id: string;

    requestId: string;

    chatId: string;

    status: ExecutionRunStatus;

    aiStatus: AIExecutionStatus;

    currentTask: string | null;

    progress: number;

    toolCalls: AgentToolCall[];

    tokenUsage: AgentTokenUsage;

    startedAt: string;

    completedAt: string | null;

    error: AgentExecutionError | null;
};


/**
 * ---------------------------------------------------------
 * Tool execution
 * ---------------------------------------------------------
 */

export type AgentToolCall = {
    id: string;

    tool: AIToolType;

    status: ExecutionToolCallStatus;

    input: unknown;

    output: unknown;

    startedAt: string;

    completedAt: string | null;

    error: string | null;
};


/**
 * ---------------------------------------------------------
 * Token usage
 * ---------------------------------------------------------
 */

export type AgentTokenUsage = {
    input: number;

    output: number;

    total: number;
};


/**
 * ---------------------------------------------------------
 * Execution error
 * ---------------------------------------------------------
 */

export type AgentExecutionError = {
    code: string;

    message: string;

    retryable: boolean;
};


/**
 * ---------------------------------------------------------
 * Stream event envelope
 * ---------------------------------------------------------
 */

export type AgentStreamEvent =
    | AgentStatusEvent
    | AgentTaskEvent
    | AgentTextDeltaEvent
    | AgentToolStartEvent
    | AgentToolResultEvent
    | AgentTokenUsageEvent
    | AgentCompletedEvent
    | AgentCancelledEvent
    | AgentErrorEvent;


/**
 * ---------------------------------------------------------
 * Status
 * ---------------------------------------------------------
 */

export type AgentStatusEvent = {
    type: "status";

    runId: string;

    status: AIExecutionStatus;
};


/**
 * ---------------------------------------------------------
 * Current task
 * ---------------------------------------------------------
 */

export type AgentTaskEvent = {
    type: "task";

    runId: string;

    task: string;

    progress: number;
};


/**
 * ---------------------------------------------------------
 * Streaming text
 * ---------------------------------------------------------
 */

export type AgentTextDeltaEvent = {
    type: "text_delta";

    runId: string;

    messageId: string;

    delta: string;
};


/**
 * ---------------------------------------------------------
 * Tool started
 * ---------------------------------------------------------
 */

export type AgentToolStartEvent = {
    type: "tool_start";

    runId: string;

    toolCallId: string;

    tool: AIToolType;

    input: unknown;

    startedAt: string;
};


/**
 * ---------------------------------------------------------
 * Tool completed
 * ---------------------------------------------------------
 */

export type AgentToolResultEvent = {
    type: "tool_result";

    runId: string;

    toolCallId: string;

    tool: AIToolType;

    output: unknown;

    completedAt: string;
};


/**
 * ---------------------------------------------------------
 * Token usage
 * ---------------------------------------------------------
 */

export type AgentTokenUsageEvent = {
    type: "token_usage";

    runId: string;

    input: number;

    output: number;

    total: number;
};


/**
 * ---------------------------------------------------------
 * Completed
 * ---------------------------------------------------------
 */

export type AgentCompletedEvent = {
    type: "completed";

    runId: string;

    messageId: string;

    completedAt: string;
};


/**
 * ---------------------------------------------------------
 * Cancelled
 * ---------------------------------------------------------
 */

export type AgentCancelledEvent = {
    type: "cancelled";

    runId: string;

    cancelledAt: string;
};


/**
 * ---------------------------------------------------------
 * Error
 * ---------------------------------------------------------
 */

export type AgentErrorEvent = {
    type: "error";

    runId: string;

    error: AgentExecutionError;
};


/**
 * ---------------------------------------------------------
 * Execute response
 * ---------------------------------------------------------
 */

export type AgentExecutionResponse = {
    requestId: string;

    runId: string;

    chatId: string;

    status: ExecutionRunStatus;
};