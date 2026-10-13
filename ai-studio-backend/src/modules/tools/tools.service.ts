/* eslint-disable @typescript-eslint/unbound-method */
import { Injectable, NotFoundException } from '@nestjs/common';
import { ToolExecutionRepository } from './repositories/tool-execution.repository';
import { ToolRegistryService } from './tool-registry.service';
import { ToolMapper } from './mappers/tool.mapper';

@Injectable()
export class ToolsService {
  constructor(
    private readonly registry: ToolRegistryService,
    private readonly executions: ToolExecutionRepository,
  ) {}

  listTools(includeDisabled = false) {
    return this.registry.list(includeDisabled).map(ToolMapper.toToolResponse);
  }

  async listMyExecutions(userId: string, limit = 20) {
    const boundedLimit = Math.max(1, Math.min(limit, 100));
    const rows = await this.executions.listOwned(userId, boundedLimit);

    return rows.map(ToolMapper.toExecutionResponse);
  }

  async getMyExecution(executionId: string, userId: string) {
    const execution = await this.executions.findOwned(executionId, userId);

    if (!execution) {
      // Avoid exposing whether another user's execution exists.
      throw new NotFoundException({
        code: 'TOOL_EXECUTION_NOT_FOUND',
        message: 'Tool execution was not found.',
      });
    }

    return ToolMapper.toExecutionResponse(execution);
  }
}
