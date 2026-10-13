export interface AccessTokenPayload {
  sub: string;
  sessionId: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}
