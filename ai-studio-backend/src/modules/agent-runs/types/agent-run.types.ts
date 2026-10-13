import {
  AgentPlanStepStatus,
  AgentRunEventType,
  AgentRunPhase,
  AgentRunStatus,
} from '../constants/agent-run.constants';

export interface CreateAgentRunData {
  ownerId: string;
  chatId: string;
  input: string;
  options?: Record<string, unknown>;
}

export interface ListAgentRunsOptions {
  ownerId: string;
  chatId?: string;
  page: number;
  limit: number;
}

export interface AgentRunQueuePayload {
  runId: string;
  ownerId: string;
}

export interface CreatePlanStepData {
  runId: string;
  sequenceNumber: number;
  title: string;
  description?: string;
}

export interface AgentRunEventData {
  runId: string;
  type: AgentRunEventType;
  phase?: AgentRunPhase;
  message?: string;
  payload?: Record<string, unknown>;
}

export interface AgentRunExecutionContext {
  runId: string;
  ownerId: string;
  chatId: string;
  input: string;
  options: Record<string, unknown>;
  signal: AbortSignal;
  emit: (event: AgentRunEventData) => Promise<void>;
}

export interface AgentRunExecutionResult {
  outputText: string;
  status:
    AgentRunStatus.COMPLETED | AgentRunStatus.FAILED | AgentRunStatus.CANCELLED;
  errorCode?: string;
  errorMessage?: string;
}

export interface AgentPlanStepSnapshot {
  id: string;
  sequenceNumber: number;
  title: string;
  description: string | null;
  status: AgentPlanStepStatus;
  createdAt: Date;
  updatedAt: Date;
}
