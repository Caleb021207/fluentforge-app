
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
