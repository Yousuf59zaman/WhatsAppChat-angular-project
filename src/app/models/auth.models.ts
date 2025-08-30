export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  refreshToken: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

