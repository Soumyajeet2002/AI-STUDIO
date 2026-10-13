import { ToolResponseDto } from '../dto/tool-response.dto';
import { ToolExecutionResponseDto } from '../dto/tool-execution-response.dto';
import { ToolDefinition } from '../types/tool.types';
import { ToolExecutionEntity } from '../entities/tool-execution.entity';

export class ToolMapper {
  static toToolResponse(definition: ToolDefinition): ToolResponseDto {
    return {
      name: definition.name,
      version: definition.version,
      description: definition.description,
      inputSchema: definition.inputSchema,
      enabled: definition.enabled,
      requiresApproval: definition.requiresApproval,
      timeoutMs: definition.timeoutMs,
    };
  }

  static toExecutionResponse(
    entity: ToolExecutionEntity,
  ): ToolExecutionResponseDto {
    return {
      id: entity.id,
      toolName: entity.toolName,
      toolVersion: entity.toolVersion,
      status: entity.status,
      output: entity.output,
      errorCode: entity.errorCode,
      errorMessage: entity.errorMessage,
      durationMs: entity.durationMs,
      createdAt: entity.createdAt,
    };
  }
}
