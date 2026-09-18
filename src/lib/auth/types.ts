export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
  idToken?: string;
}

export interface AuthSession {
  user: GoogleUser;
  tokens: GoogleTokens;
  createdAt: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: GoogleUser | null;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
}
