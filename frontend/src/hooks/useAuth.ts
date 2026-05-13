import { useState, useCallback } from 'react';
import { authService } from '../services/api';
import type { UserCreate } from '../types';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken, logout: contextLogout, user, isAuthenticated } = useAuthContext();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setToken(response.access_token);
      
      // Fetch actual user data from the backend
      const userData = await authService.getMe();
      setUser(userData);
      
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserCreate) => {
    setLoading(true);
    try {
      await authService.register(userData);
      toast.success('Account created successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async (reason?: string) => {
    await authService.logout();
    contextLogout();
    if (reason) toast(reason, { icon: 'Session expired' });
    navigate('/login');
  }, [navigate, contextLogout]);

  return { 
    loading, 
    login, 
    register, 
    logout, 
    user,
    isAuthenticated 
  };
};
