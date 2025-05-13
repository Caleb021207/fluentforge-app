
// Chat and message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  translation?: TranslationType;
  timestamp?: Date;
}

// Add the ChatMessage interface that was missing
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  translation?: TranslationType;
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

// Import the TranslationType from the hooks to maintain consistency
import { TranslationType } from "../components/practice/hooks/translation";
// Use 'export type' to re-export a type with isolatedModules enabled
export type { TranslationType };

// Add the missing LanguageMetrics interface
export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
}
