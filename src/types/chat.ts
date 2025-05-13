export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  translation?: string | Record<string, unknown>;
}

// Add the missing LanguageMetrics interface
export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
}

// Import the TranslationType from the hooks to maintain consistency
import { TranslationType } from "../components/practice/hooks/translation";
// Use 'export type' to re-export a type with isolatedModules enabled
export type { TranslationType };
