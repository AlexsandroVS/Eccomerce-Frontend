import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type { AuthResponse } from '../types/auth.types';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<AuthResponse['user']>;
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<AuthResponse['user']>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para limpiar el estado de autenticación
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsLoading(false);
    authService.disableAuthRequests();
  }, []);

  // Efecto para inicializar la autenticación
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Resetear el estado de autenticación antes de intentar
        authService.resetAuthState();
        console.log('Attempting to restore session...');
        const currentUser = await authService.getCurrentUser();
        
        if (!mounted) return;
        
        if (currentUser) {
          console.log('Session restored successfully:', currentUser);
          setUser(currentUser);
        } else {
          console.log('No valid session found');
          clearAuthState();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          clearAuthState();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [clearAuthState]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Resetear el estado de autenticación antes de intentar
      authService.resetAuthState();
      console.log('Attempting login...');
      const response = await authService.login({ email, password });
      console.log('Login successful:', response.user);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      clearAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; phone?: string }) => {
    setIsLoading(true);
    try {
      // Resetear el estado de autenticación antes de intentar
      authService.resetAuthState();
      console.log('Attempting registration...');
      const response = await authService.register(data);
      console.log('Registration successful:', response.user);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Registration failed:', error);
      clearAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('Attempting logout...');
      await authService.logout();
      console.log('Logout successful');
      clearAuthState();
    } catch (error) {
      console.error('Logout failed:', error);
      clearAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    login,
    register,
    logout
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 