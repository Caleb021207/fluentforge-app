
// Basic message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: number;
  translation?: string | null;
  audioUrl?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export type MessageCount = {
  inputs: number;
  outputs: number;
};

// Speech recognition types
export type TranscriptResult = {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
};

export type SpeechRecognitionState = 'inactive' | 'listening' | 'processing';
export type VoiceChatMode = 'listening' | 'speaking';

// Session status types
export type SessionStatus = 'available' | 'active' | 'cooldown' | 'limit_reached' | 'loading' | 'error';

// Language support type
export type SupportLevel = 'full' | 'beta' | 'limited' | 'unavailable';

// Translation types
export type TranslationType = string | Record<string, unknown>;

// Hint and suggestion types
export type SuggestionCategory = 'general' | 'grammar' | 'vocabulary' | 'culture' | 'practice';

export interface SuggestionItem {
  text: string;
  category: SuggestionCategory;
}

// Language metrics type
export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
  pronunciationAccuracy?: number;
  timestamp?: number;
}
