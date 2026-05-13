import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUserState] = useState<User | null>(() => {
    const u = localStorage.getItem('user');
    try {
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // On mount, if we have a token but no user, or just to verify the token is still valid
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Import authService dynamically to avoid circular dependencies if any
          const { authService } = await import('../services/auth.service');
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to verify token', error);
          logout();
        }
      }
      setIsInitialized(true);
    };

    initAuth();
  }, []);

  // Sync with localStorage if changed elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      setTokenState(localStorage.getItem('token'));
      const u = localStorage.getItem('user');
      try {
        setUserState(u ? JSON.parse(u) : null);
      } catch {
        setUserState(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      setUser, 
      setToken, 
      logout,
      isAuthenticated: !!token 
    }}>
      {isInitialized ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background-alt">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
