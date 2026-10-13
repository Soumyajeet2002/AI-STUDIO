import {
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../types/tool.types';

export interface AgentTool {
  getDefinition(): ToolDefinition;

  execute(
    input: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult>;
}
