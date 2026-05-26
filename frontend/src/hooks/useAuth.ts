import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get<MeResponse>('/auth/me').then((data) => {
        setUser(data.user);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData: RegisterData) => {
    const data = await api.post<AuthResponse>('/auth/register', userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, register, logout };
};
