import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { api } from '../services/api';
import type { User, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, AuthMeResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const checkAuth = async () => {
      if (token) {
        try {
          const data = await api.get<AuthMeResponse>('/auth/me');
          setUser(data.user);
        } catch (err) {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('token');
        }
      }
    };

    checkAuth().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setError(null);

      const credentials: LoginRequest = { email, password };
      const data = await api.post<LoginResponse>('/auth/login', credentials);

      localStorage.setItem('token', data.token);
      setUser(data.user);

      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      setError(null);

      const data = await api.post<RegisterResponse>('/auth/register', userData);

      localStorage.setItem('token', data.token);
      setUser(data.user);

      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, error, login, register, logout } },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
