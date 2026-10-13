import { apiClient } from "../../../services/api/api-client";
import { tokenStorage } from "../../../services/api/token-storage";

import type {
  AuthMessageResponse,
  AuthResponse,
  AuthUser,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from "../types/auth.types";

export const authService = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload,
      { auth: false, retryOnUnauthorized: false },
    );

    this.persistSession(response);

    return response;
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      payload,
      { auth: false, retryOnUnauthorized: false },
    );

    this.persistSession(response);

    return response;
  },

  async getCurrentUser(): Promise<AuthUser> {
    return apiClient.get<AuthUser>("/auth/me");
  },

  async refreshSession(): Promise<AuthResponse> {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      tokenStorage.clear();
      throw new Error("No refresh token is available.");
    }

    const payload: RefreshTokenRequest = { refreshToken };

    const response = await apiClient.post<AuthResponse>(
      "/auth/refresh",
      payload,
      { auth: false, retryOnUnauthorized: false },
    );

    this.persistSession(response);

    return response;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
      if (refreshToken) {
        await apiClient.post<AuthMessageResponse>(
          "/auth/logout",
          { refreshToken } satisfies LogoutRequest,
          { auth: false, retryOnUnauthorized: false },
        );
      }
    } finally {
      tokenStorage.clear();
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await apiClient.post<AuthMessageResponse>(
        "/auth/logout-all",
        undefined,
        { auth: true, retryOnUnauthorized: false },
      );
    } finally {
      tokenStorage.clear();
    }
  },

  persistSession(response: AuthResponse): void {
    tokenStorage.setTokens(
      response.accessToken,
      response.refreshToken,
    );
  },

  clearSession(): void {
    tokenStorage.clear();
  },
};