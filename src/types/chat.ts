
// Chat message types
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  translation?: string;
  audioUrl?: string;
  isTranslating?: boolean;
  isError?: boolean;
  errorMessage?: string;
};

// Legacy Message type for backward compatibility
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: TranslationType;
}

// Message count tracking
export type MessageCount = {
  inputs: number;
  outputs: number;
};

// Session status types
export type SessionStatus = 'available' | 'active' | 'cooldown' | 'unavailable' | 'loading' | 'idle';

// Suggestion categories for hints
export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}

// Language metrics interface
export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
}

// Import TranslationType directly from its source
import { TranslationType } from '@/components/practice/hooks/translation/types';

// Re-export TranslationType for backward compatibility
// Using 'export type' instead of 'export' to fix the isolatedModules error
export type { TranslationType };
