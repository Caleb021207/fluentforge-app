
import { TranslationType } from "@/components/practice/hooks/translation/types";

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
  translation?: TranslationType;
}

export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}

export type SessionStatus = 'idle' | 'loading' | 'active' | 'cooldown' | 'available';

export interface MessageCount {
  inputs: number;
  outputs: number;
}

export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
  pronunciationAccuracy?: number;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: TranslationType;
}
