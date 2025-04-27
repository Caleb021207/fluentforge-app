
export interface StudentMetrics {
  student_id: string | null;
  student_name: string | null;
  student_email: string | null;
  voice_chat_sessions: number;
  voice_chat_minutes: number;
  text_inputs: number;
  text_outputs: number;
  premium_voice_sessions: number;
  premium_voice_minutes: number;
  certification_attempts: number;
  highest_certification_score: number;
  completed_lessons: number;
  total_lessons: number;
  last_activity: string | null;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = keyof StudentMetrics;
