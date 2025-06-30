import axios from 'axios';
import type { AuthResponse, UserLoginData, UserRegisterData } from '../types/auth.types';

// Asegurarnos de que la URL base no termine en slash
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// Flag para controlar si debemos hacer peticiones de autenticación
let shouldMakeAuthRequests = true;

// Configurar axios para incluir cookies en las peticiones
axios.defaults.withCredentials = true;

// Interceptor para manejar errores 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar cualquier estado de autenticación local
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      shouldMakeAuthRequests = false;
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Método para resetear el flag de peticiones
  resetAuthState() {
    shouldMakeAuthRequests = true;
  },

  // Método para deshabilitar las peticiones de autenticación
  disableAuthRequests() {
    shouldMakeAuthRequests = false;
  },

  async login(data: UserLoginData): Promise<AuthResponse> {
    if (!shouldMakeAuthRequests) {
      throw new Error('No se pueden realizar peticiones de autenticación en este momento');
    }

    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, data);
      shouldMakeAuthRequests = true;
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error al iniciar sesión');
    }
  },

  async register(data: UserRegisterData): Promise<AuthResponse> {
    if (!shouldMakeAuthRequests) {
      throw new Error('No se pueden realizar peticiones de autenticación en este momento');
    }

    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data);
      shouldMakeAuthRequests = true;
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Error al registrar usuario');
    }
  },

  async logout(): Promise<void> {
    // Deshabilitar peticiones de autenticación inmediatamente
    shouldMakeAuthRequests = false;

    try {
      // Intentar limpiar la cookie en el backend
      await axios.post(`${API_URL}/auth/logout`).catch(() => {
        // Si falla, no importa, la cookie se limpiará por sí sola
        console.log('Backend logout failed, continuing with local logout');
      });
    } catch (error) {
      // No lanzamos el error para asegurar que la sesión se limpie localmente
      console.log('Error during logout, continuing with local logout');
    } finally {
      // Asegurarnos de que la cookie se limpie localmente
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    if (!shouldMakeAuthRequests) {
      return null;
    }

    try {
      const response = await axios.get<AuthResponse>(`${API_URL}/auth/profile`);
      shouldMakeAuthRequests = true;
      return response.data.user;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Asegurarnos de que la cookie se limpie si recibimos 401
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        shouldMakeAuthRequests = false;
        return null;
      }
      throw error;
    }
  }
}; 