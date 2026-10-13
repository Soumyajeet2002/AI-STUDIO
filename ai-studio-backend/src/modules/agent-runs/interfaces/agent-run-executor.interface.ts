import {
  AgentRunExecutionContext,
  AgentRunExecutionResult,
} from '../types/agent-run.types';

export const AGENT_RUN_EXECUTOR = Symbol('AGENT_RUN_EXECUTOR');

export interface AgentRunExecutor {
  execute(context: AgentRunExecutionContext): Promise<AgentRunExecutionResult>;
}
