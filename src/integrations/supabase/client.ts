
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wfhktxvwlogdnuwdzzri.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmaGt0eHZ3bG9nZG51d2R6enJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MzY2OTAsImV4cCI6MjA1NjAxMjY5MH0.7DQw-A75nn2rGP73lghmdjgQ_JwubyAadUG7vJaU3vk";

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          display_name: string;
          learning_goal: string;
          target_level: string;
          target_date: string;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          display_name?: string;
          learning_goal?: string;
          target_level?: string;
          target_date?: string;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string;
          learning_goal?: string;
          target_level?: string;
          target_date?: string;
          avatar_url?: string | null;
        };
      };
      certification_attempts: {
        Row: {
          certification_type: string;
          completed_at: string;
          created_at: string;
          id: string;
          level: string;
          score: number;
          user_id: string;
        };
        Insert: {
          certification_type: string;
          completed_at?: string;
          created_at?: string;
          id?: string;
          level: string;
          score: number;
          user_id: string;
        };
        Update: {
          certification_type?: string;
          completed_at?: string;
          created_at?: string;
          id?: string;
          level?: string;
          score?: number;
          user_id?: string;
        };
      };
      vocabulary_progress: {
        Row: {
          id: string;
          user_id: string;
          unit_id: number;
          lesson_id: number;
          matched_pairs: string[];
          score: number;
          attempts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          unit_id: number;
          lesson_id: number;
          matched_pairs: string[];
          score: number;
          attempts: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          unit_id?: number;
          lesson_id?: number;
          matched_pairs?: string[];
          score?: number;
          attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
