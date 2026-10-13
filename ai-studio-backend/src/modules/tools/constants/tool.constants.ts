export const TOOL_CONSTANTS = {
  MAX_INPUT_BYTES: 64 * 1024,
  MAX_OUTPUT_BYTES: 256 * 1024,
  DEFAULT_TIMEOUT_MS: 30_000,
  MAX_TIMEOUT_MS: 120_000,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const TOOL_EXECUTION_STATUSES = [
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
] as const;

export type ToolExecutionStatus = (typeof TOOL_EXECUTION_STATUSES)[number];
