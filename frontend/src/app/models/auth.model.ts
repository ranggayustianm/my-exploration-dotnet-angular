export interface User {
  id: number;
  username: string;
  email: string;
}

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserDto {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  username: string;
  email: string;
  expiresAt: Date;
}

export interface CurrentUser {
  id?: number;
  username: string;
  email: string;
  token: string;
}
