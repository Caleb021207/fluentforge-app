
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
  translation?: TranslationType | string;
}

export type TranslationType = string | null | undefined;

export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}

export type SessionStatus = 'idle' | 'loading' | 'active' | 'cooldown';

export interface MessageCount {
  inputs: number;
  outputs: number;
}

export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
}
