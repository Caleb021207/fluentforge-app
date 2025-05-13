
// Chat and message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  translation?: string | object;
  timestamp?: Date;
}

// Add the ChatMessage interface that was missing
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: string | object;
  timestamp?: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
}

export interface MessageCount {
  inputs: number;
  outputs: number;
}

export type SessionStatus = 'available' | 'active' | 'loading' | 'cooldown';

export interface SuggestionCategory {
  title: string;
  suggestions: string[];
}

export interface ConversationHint {
  categories: SuggestionCategory[];
  loading: boolean;
}

// Define TranslationType to fix the type errors
export type TranslationType = string | { [key: string]: any };

// Add the missing LanguageMetrics interface
export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
}
