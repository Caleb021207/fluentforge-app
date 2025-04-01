
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

// Type for premium voice chat sessions
export interface PremiumVoiceChatSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end: string | null;
  created_at: string;
}

// Use these types in your components like this:
// import { UserProfile, LessonProgress, CertificationAttempt, PremiumVoiceChatSession } from "@/types/supabase";
