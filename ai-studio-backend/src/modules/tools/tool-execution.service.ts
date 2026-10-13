import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { TOOL_CONSTANTS } from './constants/tool.constants';
import { ToolRegistryService } from './tool-registry.service';
import { ToolExecutionRepository } from './repositories/tool-execution.repository';
import { ToolExecutionContext } from './types/tool.types';
import {
  ToolDisabledException,
  ToolInputValidationException,
  ToolPermissionException,
} from './exceptions/tool.exceptions';

@Injectable()
export class ToolExecutionService {
  private readonly logger = new Logger(ToolExecutionService.name);

  constructor(
    private readonly registry: ToolRegistryService,
    private readonly executions: ToolExecutionRepository,
  ) {}

  async execute(
    name: string,
    input: Record<string, unknown>,
    context: ToolExecutionContext,
  ) {
    const tool = this.registry.get(name);
    const definition = tool.getDefinition();

    if (!definition.enabled) {
      throw new ToolDisabledException(name);
    }

    if (definition.requiresApproval) {
      // Approval workflows are implemented in a later phase.
      throw new ForbiddenException({
        code: 'TOOL_APPROVAL_REQUIRED',
        message: 'This tool requires an approval workflow before execution.',
      });
    }

    if (
      definition.allowedRoles?.length &&
      !definition.allowedRoles.some((role) => context.roles?.includes(role))
    ) {
      throw new ToolPermissionException();
    }

    if (!context.userId) {
      throw new ToolPermissionException();
    }

    let serializedInput: string;

    try {
      serializedInput = JSON.stringify(input);
    } catch {
      throw new ToolInputValidationException();
    }

    if (
      !serializedInput ||
      Buffer.byteLength(serializedInput, 'utf8') >
        TOOL_CONSTANTS.MAX_INPUT_BYTES
    ) {
      throw new ToolInputValidationException();
    }

    try {
      this.registry.validateInput(name, input);
    } catch {
      throw new ToolInputValidationException();
    }

    const inputHash = createHash('sha256')
      .update(serializedInput)
      .digest('hex');

    const startedAt = new Date();
    const startedMs = Date.now();

    const execution = await this.executions.create({
      userId: context.userId,
      chatId: context.chatId ?? null,
      runId: context.runId ?? null,
      toolName: definition.name,
      toolVersion: definition.version,
      status: 'running',
      inputHash,
      output: null,
      errorCode: null,
      errorMessage: null,
      startedAt,
      completedAt: null,
      durationMs: null,
    });

    const controller = new AbortController();
    const onParentAbort = () => controller.abort(context.signal.reason);

    if (context.signal.aborted) {
      controller.abort(context.signal.reason);
    } else {
      context.signal.addEventListener('abort', onParentAbort, { once: true });
    }

    const timeoutMs = Math.min(
      definition.timeoutMs,
      TOOL_CONSTANTS.MAX_TIMEOUT_MS,
    );

    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      if (controller.signal.aborted) {
        throw new Error('TOOL_CANCELLED');
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort(new Error('TOOL_TIMEOUT'));
          reject(new Error('TOOL_TIMEOUT'));
        }, timeoutMs);
      });

      const result = await Promise.race([
        tool.execute(input, {
          ...context,
          signal: controller.signal,
        }),
        timeoutPromise,
      ]);

      if (controller.signal.aborted) {
        throw new Error(
          context.signal.aborted ? 'TOOL_CANCELLED' : 'TOOL_TIMEOUT',
        );
      }

      if (!result || typeof result.success !== 'boolean') {
        throw new Error('INVALID_TOOL_RESULT');
      }

      const safeOutput = result.output === undefined ? null : result.output;

      let serializedOutput: string | undefined;

      try {
        serializedOutput =
          safeOutput === null ? undefined : JSON.stringify(safeOutput);
      } catch {
        throw new Error('INVALID_TOOL_OUTPUT');
      }

      if (
        serializedOutput !== undefined &&
        Buffer.byteLength(serializedOutput, 'utf8') >
          TOOL_CONSTANTS.MAX_OUTPUT_BYTES
      ) {
        throw new Error('TOOL_OUTPUT_TOO_LARGE');
      }

      const output =
        safeOutput !== null &&
        typeof safeOutput === 'object' &&
        !Array.isArray(safeOutput)
          ? (safeOutput as Record<string, unknown>)
          : safeOutput === null
            ? null
            : { value: safeOutput };

      const completedAt = new Date();
      const durationMs = Date.now() - startedMs;

      await this.executions.update(execution.id, {
        status: result.success ? 'completed' : 'failed',
        output,
        errorCode: result.success
          ? null
          : (result.errorCode ?? 'TOOL_EXECUTION_FAILED'),
        errorMessage: result.success
          ? null
          : (result.errorMessage ?? 'The tool execution failed.').slice(
              0,
              1000,
            ),
        completedAt,
        durationMs,
      });

      return {
        executionId: execution.id,
        toolName: definition.name,
        status: result.success ? ('completed' as const) : ('failed' as const),
        result,
        durationMs,
      };
    } catch (error) {
      const completedAt = new Date();
      const durationMs = Date.now() - startedMs;
      const errorCode =
        error instanceof Error ? error.message : 'TOOL_EXECUTION_FAILED';

      const cancelled =
        context.signal.aborted || errorCode === 'TOOL_CANCELLED';
      const timedOut = errorCode === 'TOOL_TIMEOUT';

      await this.executions.update(execution.id, {
        status: cancelled ? 'cancelled' : 'failed',
        errorCode: cancelled
          ? 'TOOL_CANCELLED'
          : timedOut
            ? 'TOOL_TIMEOUT'
            : 'TOOL_EXECUTION_FAILED',
        errorMessage: cancelled
          ? 'Tool execution was cancelled.'
          : timedOut
            ? 'Tool execution exceeded its time limit.'
            : 'Tool execution failed.',
        completedAt,
        durationMs,
      });

      this.logger.warn(
        `Tool execution ${execution.id} ended with ${cancelled ? 'cancelled' : timedOut ? 'timeout' : 'failure'}.`,
      );

      return {
        executionId: execution.id,
        toolName: definition.name,
        status: cancelled ? ('cancelled' as const) : ('failed' as const),
        errorCode: cancelled
          ? 'TOOL_CANCELLED'
          : timedOut
            ? 'TOOL_TIMEOUT'
            : 'TOOL_EXECUTION_FAILED',
        durationMs,
      };
    } finally {
      if (timeout) clearTimeout(timeout);
      context.signal.removeEventListener('abort', onParentAbort);
    }
  }
}
