export enum AgentRunStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum AgentRunPhase {
  QUEUED = 'queued',
  PLANNING = 'planning',
  RETRIEVING = 'retrieving',
  SEARCHING = 'searching',
  EXECUTING = 'executing',
  STREAMING = 'streaming',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  //   RUNNING = 'RUNNING',
  RUNNING = 'running',
}

export enum AgentPlanStepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum AgentRunEventType {
  STATUS = 'status',
  TASK = 'task',
  TEXT_DELTA = 'text_delta',
  TOOL_START = 'tool_start',
  TOOL_RESULT = 'tool_result',
  TOKEN_USAGE = 'token_usage',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ERROR = 'error',
}

export const AGENT_RUN_QUEUE = 'agent-runs';
export const AGENT_RUN_JOB = 'execute-agent-run';
export const AGENT_RUN_MAX_ATTEMPTS = 2;
export const AGENT_RUN_BACKOFF_MS = 2_000;
export const AGENT_RUN_DEFAULT_PAGE = 1;
export const AGENT_RUN_DEFAULT_LIMIT = 20;
export const AGENT_RUN_MAX_LIMIT = 100;
export const AGENT_RUN_MAX_INPUT_LENGTH = 50_000;
export const AGENT_RUN_SSE_HEARTBEAT_MS = 15_000;
export const AGENT_RUN_SSE_POLL_INTERVAL_MS = 1_000;
export const AGENT_RUN_SSE_BATCH_SIZE = 100;
