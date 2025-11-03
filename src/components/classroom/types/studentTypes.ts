
export interface StudentMetrics {
  student_id: string | null;
  student_name: string | null;
  student_email: string | null;
  text_practice_calls: number;
  premium_voice_calls: number;
  premium_voice_sessions: number;
  premium_voice_minutes_used: number;
  premium_voice_minutes_remaining: number;
  certification_attempts: number;
  highest_certification_score: number;
  completed_lessons: number;
  total_lessons: number;
  last_activity: string | null;
  avg_grammar_accuracy?: number;
  avg_conversation_complexity?: number;
  avg_pronunciation_accuracy?: number;
  language_metrics_count?: number;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = keyof StudentMetrics;
