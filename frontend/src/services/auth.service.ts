import axiosInstance from './axiosInstance';
import type { AuthResponse, UserCreate, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axiosInstance.post<AuthResponse>('/auth/login', formData);
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    
    return response.data;
  },

  register: async (userData: UserCreate): Promise<User> => {
    const response = await axiosInstance.post<User>('/auth/register/', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout/');
    } catch (error) {
      console.warn('Backend logout failed or token already cleared:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
};
