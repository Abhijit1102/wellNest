// Auth types
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Mood types
export interface MoodEntry {
  id: string;
  user_id: string;
  mood_value: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface MoodAnalytics {
  average_mood: number;
  mood_distribution: Record<number, number>;
  trends: {
    date: string;
    average_mood: number;
  }[];
}

// Journal types
export interface JournalEntry {
  id: string; // The aliased _id from FastAPI
  user_id: string;
  title: string; 
  content: string;
  tags: string[];
  sentiment_score: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalPrompt {
  id: string;
  text: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

// Analytics types
export interface AnalyticsSummary {
  total_mood_entries: number;
  total_journal_entries: number;
  average_mood: number;
  top_emotions: string[];
  mood_trend: {
    date: string;
    value: number;
  }[];
}

export interface EmotionTrend {
  emotion: string;
  count: number;
  percentage: number;
}

export interface Streak {
  type: 'mood' | 'journal';
  current: number;
  longest: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export interface MoodFormData {
  mood: number;
  note: string;
}

export interface JournalFormData {
  title: string;
  content: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
