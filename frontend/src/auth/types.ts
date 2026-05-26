import type { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  user: User;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
}
