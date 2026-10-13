import { Injectable, Logger } from '@nestjs/common';
import Ajv, { ValidateFunction } from 'ajv';
import { AgentTool } from './interfaces/agent-tool.interface';
import { ToolDefinition } from './types/tool.types';
import { ToolNotFoundException } from './exceptions/tool.exceptions';

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);
  private readonly ajv = new Ajv({
    allErrors: true,
    strict: true,
    validateSchema: true,
  });

  private readonly tools = new Map<string, AgentTool>();
  private readonly validators = new Map<string, ValidateFunction>();

  register(tool: AgentTool): void {
    const definition = tool.getDefinition();

    if (!/^[a-z][a-z0-9_]{1,99}$/.test(definition.name)) {
      throw new Error(`Invalid tool name: ${definition.name}`);
    }

    if (this.tools.has(definition.name)) {
      throw new Error(`Tool already registered: ${definition.name}`);
    }

    if (!definition.version || !definition.description) {
      throw new Error(`Tool metadata is incomplete: ${definition.name}`);
    }

    if (
      !Number.isInteger(definition.timeoutMs) ||
      definition.timeoutMs < 1 ||
      definition.timeoutMs > 120_000
    ) {
      throw new Error(`Invalid timeout for tool: ${definition.name}`);
    }

    const validator = this.ajv.compile(definition.inputSchema);

    this.tools.set(definition.name, tool);
    this.validators.set(definition.name, validator);

    this.logger.log(
      `Registered tool: ${definition.name}@${definition.version}`,
    );
  }

  get(name: string): AgentTool {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new ToolNotFoundException(name);
    }

    return tool;
  }

  getDefinition(name: string): ToolDefinition {
    return this.get(name).getDefinition();
  }

  list(includeDisabled = false): ToolDefinition[] {
    return [...this.tools.values()]
      .map((tool) => tool.getDefinition())
      .filter((definition) => includeDisabled || definition.enabled)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  validateInput(name: string, input: Record<string, unknown>): void {
    const validator = this.validators.get(name);

    if (!validator) {
      throw new ToolNotFoundException(name);
    }

    if (!validator(input)) {
      throw new Error(
        `Input validation failed for tool "${name}": ${
          validator.errors
            ?.map((error) => `${error.instancePath || '/'} ${error.message}`)
            .join('; ') ?? 'Invalid input'
        }`,
      );
    }
  }
}
