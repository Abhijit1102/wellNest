// lib/store.ts
import { create } from 'zustand';
import { apiClient, authApi } from './api';
import { User, AuthResponse } from './types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    full_name: string,
    consent: any
  ) => Promise<boolean>;

  logout: () => Promise<void>;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // ✅ SINGLE SOURCE OF TRUTH
  setToken: (token) => {
    apiClient.setToken(token);

    set({
      token,
      isAuthenticated: !!token,
    });

    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);

        // ✅ CRITICAL: cookie for middleware
        document.cookie = `auth_token=${token}; path=/; max-age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax`;
      } else {
        localStorage.removeItem('auth_token');
        document.cookie =
          'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  },

  setUser: (user) => {
    set({ user }); // ❌ don't touch isAuthenticated here
  },

  clearError: () => set({ error: null }),

  // 🔥 LOGIN (CLEAN + RELIABLE)
  login: async (email, password) => {
    set({ isLoading: true, error: null });

    console.log('[LOGIN] Starting login for:', email);
    const response = await authApi.login(email, password);
    console.log('[LOGIN] API Response:', response);

    if (!response.success) {
      console.error('[LOGIN] Login failed:', response.error);
      set({
        error: response.error || 'Login failed',
        isLoading: false,
      });
      return false;
    }

    const authData = response.data as AuthResponse;
    console.log('[LOGIN] Auth data:', authData);

    // ✅ ALWAYS use setToken
    useAuthStore.getState().setToken(authData.access_token);
    console.log('[LOGIN] Token set successfully');

    set({
      user: authData.user,
      isLoading: false,
    });

    console.log('[LOGIN] Login successful, returning true');
    return true;
  },

  register: async (email, password, full_name, consent) => {
    set({ isLoading: true, error: null });

    const response = await authApi.register({
      email,
      password,
      full_name,
      consent,
    });

    if (!response.success) {
      set({
        error: response.error || 'Registration failed',
        isLoading: false,
      });
      return false;
    }

    const authData = response.data as AuthResponse;

    useAuthStore.getState().setToken(authData.access_token);

    set({
      user: authData.user,
      isLoading: false,
    });

    return true;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      useAuthStore.getState().setToken(null);

      set({
        user: null,
        error: null,
      });

      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  },
}));

// ✅ INIT AUTH (VERY IMPORTANT)
export const initializeAuth = async () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');

    if (token) {
      apiClient.setToken(token);
      useAuthStore.getState().setToken(token);

      try {
        const res = await authApi.verifyToken(); // or getCurrentUser()

        if (res.success && res.data) {
          const user: User = {
            id: res.data.id,
            email: res.data.email,
            full_name: res.data.full_name,
            profile: res.data.profile,
            created_at: res.data.created_at,
            updated_at: res.data.updated_at,
          };

          useAuthStore.getState().setUser(user);

        } else {
          useAuthStore.getState().setToken(null);
        }
      } catch (e) {
        useAuthStore.getState().setToken(null);
      }
    }
  }
};