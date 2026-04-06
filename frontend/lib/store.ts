import { create } from 'zustand';
import { User, AuthResponse } from './types';
import { apiClient, authApi } from './api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setToken: (token: string | null) => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setToken: (token) => {
    set({ token });
    if (token) {
      apiClient.setToken(token);
      // Store in localStorage & cookies for persistence across client & SSR checks
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
    } else {
      apiClient.setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => {
    set({ error: null });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);

      if (!response.success) {
        set({ error: response.error || 'Login failed', isLoading: false });
        return false;
      }

      const authData = response.data as AuthResponse;
      set({
        token: authData.access_token,
        user: authData.user,
        isAuthenticated: true,
        isLoading: false,
      });

      apiClient.setToken(authData.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authData.access_token);
        document.cookie = `auth_token=${authData.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  register: async (email, password, username) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(email, password, username);

      if (!response.success) {
        set({ error: response.error || 'Registration failed', isLoading: false });
        return false;
      }

      const authData = response.data as AuthResponse;
      set({
        token: authData.access_token,
        user: authData.user,
        isAuthenticated: true,
        isLoading: false,
      });

      apiClient.setToken(authData.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', authData.access_token);
        document.cookie = `auth_token=${authData.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await authApi.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
    apiClient.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },
}));

// Hook to restore auth state from localStorage on app load
export const initializeAuth = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      useAuthStore.setState({ token });
      apiClient.setToken(token);
    }
  }
};
