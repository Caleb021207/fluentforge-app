
// This file contains additional type definitions for Supabase tables
// that complement the auto-generated types in src/integrations/supabase/types.ts

import { Json } from '@/integrations/supabase/types';

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
  source_language: string | null;
  target_language: string | null;
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

// Note: The tables in Database schema must match these interfaces
// Add this comment to make it clear that these types must be updated
// if the database schema changes.

// Define custom Database typings to explicitly include all our tables
export interface Database {
  public: {
    Tables: {
      certification_attempts: {
        Row: CertificationAttempt;
        Insert: Partial<CertificationAttempt>;
        Update: Partial<CertificationAttempt>;
        Relationships: [];
      };
      certification_transcripts: {
        Row: {
          id: string;
          attempt_id: string;
          user_id: string;
          created_at: string;
          user_transcripts: Json;
          ai_responses: Json;
          analysis_data: Json | null;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          user_id: string;
          created_at?: string;
          user_transcripts?: Json;
          ai_responses?: Json;
          analysis_data?: Json | null;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          user_id?: string;
          created_at?: string;
          user_transcripts?: Json;
          ai_responses?: Json;
          analysis_data?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "certification_transcripts_attempt_id_fkey";
            columns: ["attempt_id"];
            isOneToOne: false;
            referencedRelation: "certification_attempts";
            referencedColumns: ["id"];
          }
        ];
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Partial<LessonProgress>;
        Update: Partial<LessonProgress>;
        Relationships: [];
      };
      profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile>;
        Update: Partial<UserProfile>;
        Relationships: [];
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile>;
        Update: Partial<UserProfile>;
        Relationships: [];
      };
      user_settings: {
        Row: UserSettings;
        Insert: Partial<UserSettings>;
        Update: Partial<UserSettings>;
        Relationships: [];
      };
      classrooms: {
        Row: Classroom;
        Insert: Partial<Classroom>;
        Update: Partial<Classroom>;
        Relationships: [];
      };
      student_classrooms: {
        Row: StudentClassroom;
        Insert: Partial<StudentClassroom>;
        Update: Partial<StudentClassroom>;
        Relationships: [];
      };
      usage_stats: {
        Row: UsageStats;
        Insert: Partial<UsageStats>;
        Update: Partial<UsageStats>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

// Add type to explicitly define what tables Supabase can access
export type TableNames = keyof Database['public']['Tables'];
