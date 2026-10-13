import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AIExecutionStatus } from "../types/ai.types";
import type {
  ExecutionRun,
  ExecutionToolCall,
  ExecutionTokenUsage,
} from "../types/execution.types";

type ExecutionStore = {
  runs: Record<string, ExecutionRun>;


  createRun: (params: {
    id: string;
    requestId: string;
    chatId: string;
  }) => void;


  updateRunStatus: (
    runId: string,
    status: ExecutionRun["status"],
    aiStatus: AIExecutionStatus,
  ) => void;

  addToolCall: (
    runId: string,
    toolCall: ExecutionToolCall,
  ) => void;

  updateToolCall: (
    runId: string,
    toolCallId: string,
    update: Partial<ExecutionToolCall>,
  ) => void;

  setTokenUsage: (
    runId: string,
    tokenUsage: ExecutionTokenUsage,
  ) => void;

  completeRun: (
    runId: string,
  ) => void;

  cancelRun: (
    runId: string,
  ) => void;

  cancelRunningToolCalls: (
    runId: string,
  ) => void;

  failRun: (
    runId: string,
    error: string,
  ) => void;

  getRun: (
    runId: string,
  ) => ExecutionRun | undefined;
  
  getActiveRun: () => ExecutionRun | undefined;

  getRunsForChat: (
    chatId: string,
  ) => ExecutionRun[];

  clearRun: (
    runId: string,
  ) => void;

  clearAllRuns: () => void;

};

export const useExecutionStore =
  create<ExecutionStore>()(
    persist(
      (set, get) => ({
        runs: {},

        createRun: ({
          id,
          requestId,
          chatId,
        }) => {
          const now =
            new Date().toISOString();

          const run: ExecutionRun = {
            id,
            requestId,
            chatId,
            status: "queued",
            aiStatus: "queued",
            toolCalls: [],
            tokenUsage: null,
            startedAt: now,
            completedAt: null,
            error: null,
          };

          set((state) => ({
            runs: {
              ...state.runs,
              [id]: run,
            },
          }));
        },

        updateRunStatus: (
          runId,
          status,
          aiStatus,
        ) => {
          set((state) => {
            const run =
              state.runs[runId];

            if (!run) {
              return state;
            }

            return {
              runs: {
                ...state.runs,
                [runId]: {
                  ...run,
                  status,
                  aiStatus,
                },
              },
            };
          });
        },

        addToolCall: (
          runId,
          toolCall,
        ) => {
          set((state) => {
            const run =
              state.runs[runId];

            if (!run) {
              return state;
            }

            return {
              runs: {
                ...state.runs,
                [runId]: {
                  ...run,
                  toolCalls: [
                    ...run.toolCalls,
                    toolCall,
                  ],
                },
              },
            };
          });
        },

        updateToolCall: (
          runId,
          toolCallId,
          update,
        ) => {
          set((state) => {
            const run =
              state.runs[runId];

            if (!run) {
              return state;
            }

            return {
              runs: {
                ...state.runs,
                [runId]: {
                  ...run,
                  toolCalls:
                    run.toolCalls.map(
                      (toolCall) =>
                        toolCall.id ===
                          toolCallId
                          ? {
                            ...toolCall,
                            ...update,
                          }
                          : toolCall,
                    ),
                },
              },
            };
          });
        },

        setTokenUsage: (
          runId,
          tokenUsage,
        ) => {
          set((state) => {
            const run =
              state.runs[runId];

            if (!run) {
              return state;
            }

            return {
              runs: {
                ...state.runs,
                [runId]: {
                  ...run,
                  tokenUsage,
                },
              },
            };
          });
        },

        completeRun: (
          runId,
        ) => {
          set((state) => {
            const run =
              state.runs[runId];

            if (!run) {
              return state;
            }

            return {
              runs: {
                ...state.runs,
                [runId]: {
                  ...run,
                  status: "completed",
                  aiStatus: "completed",
                  completedAt:
                    new Date().toISOString(),
                },
              },
            };
          });
        },

        cancelRun: (
          runId,
        ) => {
          set((state) => {
            const run =
              state.runs[runId];

            if (!run) {
              return state;
            }

            return {
              runs: {
                ...state.runs,
                [runId]: {
                  ...run,
                  status: "cancelled",
                  aiStatus: "cancelled",
                  completedAt:
                    new Date().toISOString(),
                },
              },
            };
          });
        },

        cancelRunningToolCalls: (
          runId,
        ) => {
          set((state) => {
            const run =
              state.runs[runId];

            if (!run) {
              return state;
            }

            return {
              runs: {
                ...state.runs,
                [runId]: {
                  ...run,
                  toolCalls:
                    run.toolCalls.map(
                      (toolCall) =>
                        toolCall.status ===
                          "running"
                          ? {
                            ...toolCall,
                            status:
                              "cancelled",
                            completedAt:
                              new Date().toISOString(),
                          }
                          : toolCall,
                    ),
                },
              },
            };
          });
        },

        failRun: (
          runId,
          error,
        ) => {
          set((state) => {
            const run =
              state.runs[runId];

            if (!run) {
              return state;
            }

            return {
              runs: {
                ...state.runs,
                [runId]: {
                  ...run,
                  status: "failed",
                  aiStatus: "failed",
                  completedAt:
                    new Date().toISOString(),
                  error,
                },
              },
            };
          });
        },

        getRun: (
          runId,
        ) => {
          return get().runs[runId];
        },
        getActiveRun: () => {
          return Object.values(get().runs)
            .filter(
              (run) =>
                run.status === "queued" ||
                run.status === "running",
            )
            .sort(
              (a, b) =>
                new Date(b.startedAt).getTime() -
                new Date(a.startedAt).getTime(),
            )[0];
        },

        getRunsForChat: (
          chatId,
        ) => {
          return Object.values(
            get().runs,
          )
            .filter(
              (run) =>
                run.chatId === chatId,
            )
            .sort(
              (a, b) =>
                new Date(
                  a.startedAt,
                ).getTime() -
                new Date(
                  b.startedAt,
                ).getTime(),
            );
        },

        clearRun: (
          runId,
        ) => {
          set((state) => {
            const nextRuns = {
              ...state.runs,
            };

            delete nextRuns[runId];

            return {
              runs: nextRuns,
            };
          });
        },

        clearAllRuns: () => {
          set({
            runs: {},
          });
        },
      }),
      {
        name: "ai-studio-execution-runs",
        version: 1,
      },
    ),
  );