const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

import { VerifyResponse } from './types';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = isFormData ? {} : {
      'Content-Type': 'application/json',
    };
    
    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      console.log('[API REQUEST]', endpoint, { method: options.method || 'GET' });
      const response = await fetch(url, { ...options, headers });
      console.log('[API RESPONSE]', endpoint, { status: response.status });

      // ✅ FIXED 401 HANDLING (avoid login race condition)
      if (response.status === 401 && typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');

        if (token) {
          localStorage.removeItem('auth_token');
          document.cookie =
            'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

          if (!window.location.pathname.startsWith('/auth')) {
            window.location.href = '/auth/login';
          }
        }
      }

      const data = await response.json();
      console.log('[API DATA]', endpoint, data);

      if (!response.ok || data.success === false) {
        return {
          success: false,
          error: data.error || data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data !== undefined ? data.data : data,
      };
    } catch (error) {
      console.error('[API ERROR]:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    }, isFormData);
  }

  async put<T>(endpoint: string, body: unknown) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    }, isFormData);
  }

  async patch<T>(endpoint: string, body: unknown) {
  return this.request<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// --- APIs ---
export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => {
    apiClient.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },
  verifyToken: () => apiClient.get<VerifyResponse>('/auth/verify'),
  requestPasswordReset: (email: string) =>
    apiClient.post('/auth/request-password-reset', { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, new_password: password }),
};

export const userApi = {
  getProfile: () => apiClient.get('/users/me'),

  updateProfile: (formData: FormData) =>
    apiClient.put('/users/me', formData),
};

// Mood endpoints
export const moodApi = {
  getMoods: (limit?: number, offset?: number) =>
    apiClient.get(`/moods/${limit ? `?limit=${limit}&offset=${offset || 0}` : ''}`),
  createMood: (mood_value: number, note?: string) =>
    apiClient.post('/moods/', { 
      mood_score: mood_value,
      notes: note, 
    }),
  getMoodAnalytics: (days?: number) =>
    apiClient.get(`/moods/analytics${days ? `?days=${days}` : ''}`),
};


export const journalApi = {
  // ✅ GET ALL
  getEntries: (limit?: number, skip?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (skip) params.append('skip', skip.toString());
    const queryString = params.toString();
    return apiClient.get(`/journal/${queryString ? `?${queryString}` : ''}`);
  },

  // ✅ CREATE
  createEntry: (title: string, content: string) =>
    apiClient.post('/journal/', { title, content }),

  // ✅ UPDATE (PATCH, not PUT)
  updateEntry: (id: string, data: any) =>
    apiClient.patch(`/journal/${id}`, data),

  // ✅ TOGGLE FAVORITE
  toggleFavorite: (id: string, is_favorite: boolean) =>
    apiClient.patch(`/journal/${id}/favorite`, { is_favorite }),

  // ✅ DELETE
  deleteEntry: (id: string) =>
    apiClient.delete(`/journal/${id}`),

  // ✅ GET SINGLE (optional but useful)
  getEntryById: (id: string) =>
    apiClient.get(`/journal/${id}`),
};

// Chat endpoints
export const chatApi = {
  sendMessage: (conversation_id: string, message: string) =>
    apiClient.post('/chat/message', { conversation_id, message }),
  getConversations: () => apiClient.get('/chat/conversations'),
  createConversation: () => apiClient.post('/chat/conversations', {}),
  getConversation: (id: string) => apiClient.get(`/chat/conversations/${id}`),
  deleteConversation: (id: string) => apiClient.delete(`/chat/conversations/${id}`),
};

// Analytics endpoints
export const analyticsApi = {
  getSummary: (days: number = 7) =>
    apiClient.get(`/analytics/summary?days=${days}`),

  getEmotionTrends: (days: number = 7) =>
    apiClient.get(`/analytics/emotion-trends?days=${days}`),

  getStreaks: () =>
    apiClient.get('/analytics/streaks'),
};