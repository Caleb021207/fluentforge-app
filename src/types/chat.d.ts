
export type Role = 'user' | 'assistant' | 'system';

import { TranslationType } from "../components/practice/hooks/translation/types";

export interface Message {
  role: Role;
  content: string;
  translation?: TranslationType;
}

export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}

export type SessionStatus = 'idle' | 'loading' | 'active' | 'cooldown';

export interface MessageCount {
  inputs: number;
  outputs: number;
}

// Export the LanguageMetrics interface here too to ensure backward compatibility
export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: TranslationType;
}
