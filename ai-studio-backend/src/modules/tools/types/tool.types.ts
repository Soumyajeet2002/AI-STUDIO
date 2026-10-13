import type { JSONSchemaType } from 'ajv';
import type { ToolExecutionStatus } from '../constants/tool.constants';

export interface ToolDefinition {
  name: string;
  version: string;
  description: string;
  inputSchema: object;
  enabled: boolean;
  requiresApproval: boolean;
  timeoutMs: number;
  allowedRoles?: string[];
}

export interface ToolExecutionContext {
  userId: string;
  chatId?: string;
  runId?: string;
  requestId?: string;
  roles?: string[];
  signal: AbortSignal;
}

export interface ToolExecutionResult {
  success: boolean;
  output?: unknown;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionRecord {
  id: string;
  toolName: string;
  toolVersion: string;
  status: ToolExecutionStatus;
  startedAt?: Date;
  completedAt?: Date;
}

export type JsonSchema = JSONSchemaType<unknown> | object;
