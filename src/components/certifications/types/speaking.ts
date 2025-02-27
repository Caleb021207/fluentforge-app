
export interface AssessmentMetricsType {
  pronunciation: number;
  fluency: number;
  grammar: number;
  vocabulary: number;
  comprehension: number;
  overall: number;
}

export interface AssessmentResultType {
  metrics: AssessmentMetricsType;
  level: string;
  feedback: string;
}

export interface ConversationMessageType {
  type: 'user' | 'assistant';
  content: string;
}
