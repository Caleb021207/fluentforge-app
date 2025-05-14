
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  translation?: string | Record<string, unknown>;
  messageId?: string;
  audioUrl?: string;
  pending?: boolean;
  error?: boolean;
}

export interface LanguageMetrics {
  grammarAccuracy: number;
  conversationComplexity: number;
  messageCount: number;
  vocabularyDiversity?: number;
  session_id?: string;
  timestamp?: number;
}

export interface Rating {
  difficulty: number;
  helpful: number;
  enjoyable: number;
}

export interface TopicSuggestion {
  title: string;
  description: string;
  example: string;
}
