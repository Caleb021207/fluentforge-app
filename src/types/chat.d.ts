
import { TranslationType } from "@/components/practice/hooks/translation/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp: Date;
  translation?: TranslationType;
}

export interface MessageCount {
  inputs: number;
  outputs: number;
}

// Legacy Message type for backward compatibility
export interface Message {
  role: "user" | "assistant" | "system" | "error";
  content: string;
  translation?: TranslationType;
}

export interface LanguageMetrics {
  grammarAccuracy: number;
  vocabularyDiversity: number;
  conversationComplexity: number;
  messageCount: number;
}
