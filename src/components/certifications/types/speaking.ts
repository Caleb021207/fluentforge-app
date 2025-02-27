
export interface AssessmentMetricsType {
  pronunciation: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  comprehension: number;
  listening: number;  // Added explicit listening score
  overall: number;
}

export interface AssessmentResultType {
  metrics: AssessmentMetricsType;
  level: string;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface ConversationMessageType {
  type: 'user' | 'assistant';
  content: string;
}
