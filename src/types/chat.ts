
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: string | Record<string, unknown>;
}

export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  vocabularyDiversity?: number;
  pronunciationAccuracy?: number;
  messageCount: number;
  timestamp: number;
}

export interface TranslatedMessage {
  role: string;
  content: string;
  translation?: string;
}
