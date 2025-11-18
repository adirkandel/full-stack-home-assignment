import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type {  User, LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, AuthMeResponse 
} from '../types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: RegisterRequest) => Promise<any>;
  logout: () => void;
};

export const useAuth = () => {
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
     } else {
      setLoading(false);
    }}
    checkAuth().finally(() => setLoading(false));
  }, []);


const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.post<RegisterResponse>('/auth/register', userData);
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      return data;
    } catch (err: any) {
      const errorMessage = err?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };
 

  return { user, loading, login, register, logout };
};

