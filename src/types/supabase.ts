
// This file contains additional type definitions for Supabase tables
// that complement the auto-generated types in src/integrations/supabase/types.ts

export interface UserProfile {
  id: string;
  display_name: string | null;
  learning_goal: string | null;
  target_level: string | null;
  target_date: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  level: string;
  lesson_id: number;
  progress: number;
  completed: boolean;
  last_accessed: string | null;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

export interface CertificationAttempt {
  id: string;
  user_id: string;
  certification_type: string;
  level: string;
  score: number;
  completed_at: string | null;
  created_at: string | null;
}

export type UserRole = 'student' | 'teacher';

export interface UserSettings {
  id: string;
  role: UserRole;
  updated_at: string;
}

export interface Classroom {
  id: string;
  name: string;
  class_code: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface StudentClassroom {
  id: string;
  student_id: string;
  classroom_id: string;
  joined_at: string;
}

export interface UsageStats {
  id: string;
  user_id: string;
  date: string;
  text_chat_count: number;
  voice_minutes_used: number;
  created_at: string;
  updated_at: string;
}

// Use these types in your components like this:
// import { UserProfile, LessonProgress, CertificationAttempt } from "@/types/supabase";
