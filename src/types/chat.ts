
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

// Message count tracking
export type MessageCount = {
  inputs: number;
  outputs: number;
};

// Session status types
export type SessionStatus = 'available' | 'active' | 'cooldown' | 'unavailable';

// Suggestion categories for hints
export type SuggestionCategory = 
  | 'general' 
  | 'vocabulary' 
  | 'grammar' 
  | 'conversation' 
  | 'cultural' 
  | 'practice'
  | 'example';

// TranslationType - reuse from practice/hooks/translation/types.ts
export type { TranslationType } from '@/components/practice/hooks/translation/types';
