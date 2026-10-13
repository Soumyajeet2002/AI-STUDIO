export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSessionContext {
  userId: string;
  sessionId: string;
  userAgent: string | null;
  ipAddress: string | null;
}

export interface RefreshTokenContext {
  sessionId: string;
  userId: string;
}
