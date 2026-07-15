export interface AccessTokenPayload {
  sub: number;
  email: string | null;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: number;
}
