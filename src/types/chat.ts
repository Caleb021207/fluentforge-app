
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: TranslationType;
}

export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  vocabularyDiversity?: number;
  pronunciationAccuracy?: number;
  messageCount: number;
  timestamp: number;
}

export interface TranslatedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: string;
}

export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}

export interface MessageCount {
  inputs: number;
  outputs: number;
}

export type SessionStatus = 'idle' | 'loading' | 'active' | 'cooldown' | 'available';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: TranslationType;
}

export type TranslationType = string | Record<string, unknown> | null | undefined;
