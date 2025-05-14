
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  translation?: string | Record<string, unknown>;
  messageId?: string;
  audioUrl?: string;
  pending?: boolean;
  error?: boolean;
}

export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
  session_id?: string;
  timestamp?: number;
}

export interface Rating {
  difficulty: number;
  helpful: number;
  enjoyable: number;
}

export interface TopicSuggestion {
  title: string;
  description: string;
  example: string;
}

// Add missing types from chat.d.ts to ensure compatibility
export type Role = 'user' | 'assistant' | 'system';
export type TranslationType = string | null | undefined | Record<string, unknown>;
export type SessionStatus = 'idle' | 'loading' | 'active' | 'cooldown';

export interface MessageCount {
  inputs: number;
  outputs: number;
}

export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: TranslationType;
}
