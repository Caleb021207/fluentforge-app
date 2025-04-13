
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
  tier: number | null;
  is_admin: boolean | null;
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

// Type for access codes
export interface AccessCode {
  id: string;
  code: string;
  tier: number;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  generated_by: string | null;
}

// Use these types in your components like this:
// import { UserProfile, LessonProgress, CertificationAttempt, PremiumVoiceChatSession, AccessCode } from "@/types/supabase";
