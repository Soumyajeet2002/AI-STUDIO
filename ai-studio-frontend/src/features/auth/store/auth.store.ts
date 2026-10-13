import { create } from "zustand";

import { authService } from "../services/auth.service";
import { tokenStorage } from "../../../services/api/token-storage";

import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../types/auth.types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  initializeSession: () => Promise<void>;
  handleSessionExpired: () => void;
  clearError: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(payload);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      authService.clearSession();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.register(payload);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch (error) {
      authService.clearSession();

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

initializeSession: async () => {
  const state = useAuthStore.getState();

  if (state.isInitialized || state.isLoading) {
    return;
  }

  const accessToken = tokenStorage.getAccessToken();
  const refreshToken = tokenStorage.getRefreshToken();

  if (!accessToken && !refreshToken) {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
    return;
  }

  set({ isLoading: true, error: null });

  try {
    const user = await Promise.race([
      authService.getCurrentUser(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Session restoration timed out.")),
          10000,
        );
      }),
    ]);

    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  } catch {
    authService.clearSession();

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  }
},
  handleSessionExpired: () => {
    authService.clearSession();

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: "Your session has expired. Please log in again.",
    });
  },

  clearError: () => set({ error: null }),
}));