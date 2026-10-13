import { Injectable } from '@nestjs/common';
import {
  AgentRunStatus,
  AgentRunPhase,
  AgentRunEventType,
} from './constants/agent-run.constants';
import { AgentRunExecutor } from './interfaces/agent-run-executor.interface';
import {
  AgentRunExecutionContext,
  AgentRunExecutionResult,
} from './types/agent-run.types';

@Injectable()
export class AgentRunExecutorService implements AgentRunExecutor {
  async execute(
    context: AgentRunExecutionContext,
  ): Promise<AgentRunExecutionResult> {
    if (context.signal.aborted) {
      return {
        status: AgentRunStatus.CANCELLED,
        outputText: '',
      };
    }

    await context.emit({
      runId: context.runId,
      type: AgentRunEventType.STATUS,
      phase: AgentRunPhase.PLANNING,
      message: 'Preparing agent execution.',
    });

    await context.emit({
      runId: context.runId,
      type: AgentRunEventType.ERROR,
      phase: AgentRunPhase.FAILED,
      message: 'No LLM-backed agent executor is configured yet.',
      payload: {
        code: 'AGENT_EXECUTOR_NOT_CONFIGURED',
        retryable: false,
      },
    });

    return {
      status: AgentRunStatus.FAILED,
      outputText: '',
      errorCode: 'AGENT_EXECUTOR_NOT_CONFIGURED',
      errorMessage:
        'Configure an LLM-backed agent executor before enabling agent execution.',
    };
  }
}
