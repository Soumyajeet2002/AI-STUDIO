import { create } from "zustand";

import type {
  WorkspaceRequest,
} from "../services/workspace.service";

type WorkspaceRequestRecord = {
  chatId: string;
  requestId: string;
  request: WorkspaceRequest;
};

type WorkspaceStore = {
  pendingRequests: Record<
    string,
    WorkspaceRequestRecord
  >;

  setPendingRequest: (
    record: WorkspaceRequestRecord,
  ) => void;

  getPendingRequest: (
    chatId: string,
  ) => WorkspaceRequestRecord | undefined;

  clearPendingRequest: (
    chatId: string,
  ) => void;
};

export const useWorkspaceStore =
  create<WorkspaceStore>((set, get) => ({
    pendingRequests: {},

    setPendingRequest: (record) => {
      set((state) => ({
        pendingRequests: {
          ...state.pendingRequests,
          [record.chatId]: record,
        },
      }));
    },

    getPendingRequest: (chatId) => {
      return get().pendingRequests[chatId];
    },

    clearPendingRequest: (chatId) => {
      set((state) => {
        const next = {
          ...state.pendingRequests,
        };

        delete next[chatId];

        return {
          pendingRequests: next,
        };
      });
    },
  }));