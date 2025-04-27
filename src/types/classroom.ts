
export interface ClassroomData {
  id: string;
  class_name: string;
  code: string;
  created_at: string;
}

export interface StudentUsageMetrics {
  student_id: string;
  student_email: string | null;
  student_name: string | null;
  voice_chat_sessions: number;
  voice_chat_minutes: number;
  certification_attempts: number;
  avg_certification_score: number;
  completed_lessons: number;
  total_lessons: number;
  last_voice_chat: string | null;
  last_certification: string | null;
  last_lesson_progress: string | null;
  class_name?: string;
  classroom_id?: string;
  teacher_id?: string;
}

export interface ClassroomResponse {
  success: boolean;
  message: string;
  classroom_id?: string;
  class_code?: string;
  class_name?: string;
}
