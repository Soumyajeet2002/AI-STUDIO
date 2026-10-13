import { useCallback, useRef, useState } from "react";

import { aiService } from "../services/ai.service";
import { useExecutionStore } from "../store/execution.store";

import type {
  AIExecutionEvent,
  AIExecutionRequest,
  AIExecutionStatus,
  AIToolType,
} from "../types/ai.types";

type ToolEvent = {
  type: "start" | "result";
  tool: AIToolType;
  toolCallId: string;
  input?: unknown;
  output?: unknown;
};

type TokenUsage = {
  input: number;
  output: number;
  total: number;
};

type AIExecutionState = {
  runId: string | null;
  status: AIExecutionStatus;
  streamingText: string;
  toolEvents: ToolEvent[];
  tokenUsage: TokenUsage | null;
  error: string | null;
  isExecuting: boolean;
};

const initialState: AIExecutionState = {
  runId: null,
  status: "idle",
  streamingText: "",
  toolEvents: [],
  tokenUsage: null,
  error: null,
  isExecuting: false,
};

export function useAIExecution() {
  const [state, setState] =
    useState<AIExecutionState>(initialState);

  const activeRunIdRef =
    useRef<string | null>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const handleEvent = useCallback(
    (
      runId: string,
      event: AIExecutionEvent,
    ) => {
      const isActiveRun =
        activeRunIdRef.current === runId;

      setState((current) => {
        switch (event.type) {
          case "status": {
            if (isActiveRun) {
              const runStatus =
                event.status === "queued"
                  ? "queued"
                  : event.status ===
                      "completed"
                    ? "completed"
                    : event.status ===
                        "cancelled"
                      ? "cancelled"
                      : event.status ===
                          "failed"
                        ? "failed"
                        : "running";

              useExecutionStore
                .getState()
                .updateRunStatus(
                  runId,
                  runStatus,
                  event.status,
                );
            }

            if (!isActiveRun) {
              return current;
            }

            return {
              ...current,
              status: event.status,
              isExecuting:
                event.status !==
                  "completed" &&
                event.status !==
                  "cancelled" &&
                event.status !==
                  "failed",
            };
          }

          case "text_delta": {
            if (!isActiveRun) {
              return current;
            }

            useExecutionStore
              .getState()
              .updateRunStatus(
                runId,
                "running",
                "streaming",
              );

            return {
              ...current,
              status: "streaming",
              streamingText:
                current.streamingText +
                event.delta,
            };
          }

          case "tool_start": {
            useExecutionStore
              .getState()
              .addToolCall(runId, {
                id: event.toolCallId,
                tool: event.tool,
                status: "running",
                input: event.input,
                startedAt:
                  new Date().toISOString(),
              });

            if (!isActiveRun) {
              return current;
            }

            return {
              ...current,
              toolEvents: [
                ...current.toolEvents,
                {
                  type: "start",
                  tool: event.tool,
                  toolCallId:
                    event.toolCallId,
                  input: event.input,
                },
              ],
            };
          }

          case "tool_result": {
            useExecutionStore
              .getState()
              .updateToolCall(
                runId,
                event.toolCallId,
                {
                  status: "completed",
                  output: event.output,
                  completedAt:
                    new Date().toISOString(),
                },
              );

            if (!isActiveRun) {
              return current;
            }

            return {
              ...current,
              toolEvents: [
                ...current.toolEvents,
                {
                  type: "result",
                  tool: event.tool,
                  toolCallId:
                    event.toolCallId,
                  output: event.output,
                },
              ],
            };
          }

          case "token_usage": {
            const tokenUsage = {
              input: event.input,
              output: event.output,
              total: event.total,
            };

            useExecutionStore
              .getState()
              .setTokenUsage(
                runId,
                tokenUsage,
              );

            if (!isActiveRun) {
              return current;
            }

            return {
              ...current,
              tokenUsage,
            };
          }

          case "completed": {
            useExecutionStore
              .getState()
              .completeRun(runId);

            if (!isActiveRun) {
              return current;
            }

            return {
              ...current,
              status: "completed",
              isExecuting: false,
            };
          }

          case "cancelled": {
            useExecutionStore
              .getState()
              .cancelRunningToolCalls(
                runId,
              );

            useExecutionStore
              .getState()
              .cancelRun(runId);

            if (!isActiveRun) {
              return current;
            }

            return {
              ...current,
              status: "cancelled",
              isExecuting: false,
            };
          }

          case "error": {
            useExecutionStore
              .getState()
              .failRun(
                runId,
                event.message,
              );

            if (!isActiveRun) {
              return current;
            }

            return {
              ...current,
              status: "failed",
              error: event.message,
              isExecuting: false,
            };
          }

          default:
            return current;
        }
      });
    },
    [],
  );

  const execute = useCallback(
    async (request: AIExecutionRequest) => {
      /*
       * If something is still running for any reason,
       * cancel it before starting another execution.
       */
      abortControllerRef.current?.abort();

      const runId =
        crypto.randomUUID();

      const requestId =
        request.requestId ??
        crypto.randomUUID();

      const controller =
        new AbortController();

      activeRunIdRef.current = runId;
      abortControllerRef.current =
        controller;

      useExecutionStore
        .getState()
        .createRun({
          id: runId,
          requestId,
          chatId: request.chatId,
        });

      setState({
        ...initialState,
        runId,
        status: "queued",
        isExecuting: true,
      });

      try {
        const response =
          await aiService.execute(
            {
              ...request,
              requestId,
            },
            (event) =>
              handleEvent(
                runId,
                event,
              ),
            controller.signal,
          );

        /*
         * The execution may have finished after
         * another execution became active.
         *
         * Never let an old execution overwrite
         * the new execution's UI state.
         */
        if (
          activeRunIdRef.current !==
          runId
        ) {
          return null;
        }

        setState((current) => ({
          ...current,
          status: response.status,
          isExecuting:
            response.status !==
              "completed" &&
            response.status !==
              "cancelled" &&
            response.status !==
              "failed",
        }));

        return response;
      } catch (error) {
        /*
         * AbortController cancellation is handled
         * as cancellation, not as an error.
         */
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          useExecutionStore
            .getState()
            .cancelRunningToolCalls(
              runId,
            );

          useExecutionStore
            .getState()
            .cancelRun(runId);

          if (
            activeRunIdRef.current ===
            runId
          ) {
            setState((current) => ({
              ...current,
              status: "cancelled",
              isExecuting: false,
            }));
          }

          return null;
        }

        const message =
          error instanceof Error
            ? error.message
            : "AI execution failed.";

        useExecutionStore
          .getState()
          .failRun(
            runId,
            message,
          );

        if (
          activeRunIdRef.current ===
          runId
        ) {
          setState((current) => ({
            ...current,
            status: "failed",
            error: message,
            isExecuting: false,
          }));
        }

        return null;
      } finally {
        if (
          activeRunIdRef.current ===
          runId
        ) {
          abortControllerRef.current =
            null;
        }
      }
    },
    [handleEvent],
  );

  const stop = useCallback(() => {
    const runId =
      activeRunIdRef.current;

    if (!runId) {
      return;
    }

    const controller =
      abortControllerRef.current;

    if (!controller) {
      return;
    }

    /*
     * Immediately update the UI so the user
     * doesn't have to wait for the service
     * cancellation to propagate.
     */
    useExecutionStore
      .getState()
      .cancelRunningToolCalls(
        runId,
      );

    useExecutionStore
      .getState()
      .cancelRun(runId);

    setState((current) => ({
      ...current,
      status: "cancelled",
      isExecuting: false,
    }));

    controller.abort();
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();

    abortControllerRef.current = null;
    activeRunIdRef.current = null;

    setState(initialState);
  }, []);

  return {
    execute,
    stop,
    reset,

    runId: state.runId,
    status: state.status,
    streamingText: state.streamingText,
    toolEvents: state.toolEvents,
    tokenUsage: state.tokenUsage,
    error: state.error,
    isExecuting: state.isExecuting,
  };
}