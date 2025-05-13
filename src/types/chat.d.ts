
import { ReactNode } from 'react';
import { TranslationType } from '@/components/practice/hooks/translation/types';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  translation?: TranslationType;
}

export interface LanguageMetrics {
  grammarAccuracy: number;
  vocabularyDiversity: number;
  conversationComplexity: number;
  messageCount: number;
}
