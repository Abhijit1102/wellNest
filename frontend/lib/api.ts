const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

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
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

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
      console.error('[v0] API request error:', error);
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
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth endpoints
export const authApi = {
  register: (email: string, password: string, username: string) =>
    apiClient.post('/auth/register', { email, password, username }),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout', {}),
  verifyToken: () => apiClient.get('/auth/verify'),
  requestPasswordReset: (email: string) =>
    apiClient.post('/auth/request-password-reset', { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

// User endpoints
export const userApi = {
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data: unknown) => apiClient.put('/users/me', data),
};

// Mood endpoints
export const moodApi = {
  getMoods: (limit?: number, offset?: number) =>
    apiClient.get(`/moods${limit ? `?limit=${limit}&offset=${offset || 0}` : ''}`),
  createMood: (mood_value: number, note?: string) =>
    apiClient.post('/moods', { mood_value, note }),
  getMoodAnalytics: (days?: number) =>
    apiClient.get(`/moods/analytics${days ? `?days=${days}` : ''}`),
};

// Journal endpoints
export const journalApi = {
  getEntries: (limit?: number, offset?: number) =>
    apiClient.get(`/journal${limit ? `?limit=${limit}&offset=${offset || 0}` : ''}`),
  createEntry: (title: string, content: string) =>
    apiClient.post('/journal', { title, content }),
  updateEntry: (id: string, data: unknown) =>
    apiClient.put(`/journal/${id}`, data),
  deleteEntry: (id: string) => apiClient.delete(`/journal/${id}`),
  getPrompt: () => apiClient.get('/journal/prompt'),
};

// Chat endpoints
export const chatApi = {
  sendMessage: (conversation_id: string, message: string) =>
    apiClient.post('/chat/message', { conversation_id, message }),
  getConversations: () => apiClient.get('/chat/conversations'),
  createConversation: () => apiClient.post('/chat/conversations', {}),
  getConversation: (id: string) => apiClient.get(`/chat/conversations/${id}`),
};

// Analytics endpoints
export const analyticsApi = {
  getSummary: (days?: number) =>
    apiClient.get(`/analytics/summary${days ? `?days=${days}` : ''}`),
  getEmotionTrends: (days?: number) =>
    apiClient.get(`/analytics/emotion-trends${days ? `?days=${days}` : ''}`),
  getStreaks: () => apiClient.get('/analytics/streaks'),
};
