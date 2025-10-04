export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          active: boolean | null
          code: string
          code_type: Database["public"]["Enums"]["code_type"]
          created_at: string
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          metadata: Json | null
          target_id: string | null
          target_name: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          code: string
          code_type: Database["public"]["Enums"]["code_type"]
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          metadata?: Json | null
          target_id?: string | null
          target_name: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          code?: string
          code_type?: Database["public"]["Enums"]["code_type"]
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          metadata?: Json | null
          target_id?: string | null
          target_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_override_logs: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string | null
          id: string
          new_value: number | null
          override_type: string
          previous_value: number | null
          reason: string | null
          student_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          new_value?: number | null
          override_type: string
          previous_value?: number | null
          reason?: string | null
          student_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          new_value?: number | null
          override_type?: string
          previous_value?: number | null
          reason?: string | null
          student_id?: string
        }
        Relationships: []
      }
      api_calls_tracking: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          service: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          service: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          service?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string
          created_by: string | null
          encrypted: boolean | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          encrypted?: boolean | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          encrypted?: boolean | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          assignment_type: string | null
          class_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          points_possible: number
          title: string
          updated_at: string
        }
        Insert: {
          assignment_type?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          points_possible?: number
          title: string
          updated_at?: string
        }
        Update: {
          assignment_type?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          points_possible?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      certification_attempts: {
        Row: {
          certification_type: string
          completed_at: string | null
          created_at: string
          id: string
          level: string
          score: number
          user_id: string
        }
        Insert: {
          certification_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          level: string
          score: number
          user_id: string
        }
        Update: {
          certification_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      class_certification_stats: {
        Row: {
          academic_year: string
          avg_score: number | null
          certification_type: string
          class_id: string | null
          id: string
          last_updated: string | null
          student_count: number | null
        }
        Insert: {
          academic_year: string
          avg_score?: number | null
          certification_type: string
          class_id?: string | null
          id?: string
          last_updated?: string | null
          student_count?: number | null
        }
        Update: {
          academic_year?: string
          avg_score?: number | null
          certification_type?: string
          class_id?: string | null
          id?: string
          last_updated?: string | null
          student_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "class_certification_stats_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          class_code: string
          created_at: string
          grade_level_id: string | null
          id: string
          max_students: number | null
          name: string
          period: string | null
          room_number: string | null
          school_id: string | null
          semester: string | null
          subject_id: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          class_code: string
          created_at?: string
          grade_level_id?: string | null
          id?: string
          max_students?: number | null
          name: string
          period?: string | null
          room_number?: string | null
          school_id?: string | null
          semester?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          class_code?: string
          created_at?: string
          grade_level_id?: string | null
          id?: string
          max_students?: number | null
          name?: string
          period?: string | null
          room_number?: string | null
          school_id?: string | null
          semester?: string | null
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classroom_codes: {
        Row: {
          active: boolean
          class_name: string
          code: string
          created_at: string
          id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          class_name: string
          code: string
          created_at?: string
          id?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          class_name?: string
          code?: string
          created_at?: string
          id?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      classroom_memberships: {
        Row: {
          classroom_id: string
          id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          classroom_id: string
          id?: string
          joined_at?: string
          student_id: string
        }
        Update: {
          classroom_id?: string
          id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classroom_memberships_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          created_at: string
          id: string
          join_code: string
          name: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          join_code: string
          name: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          join_code?: string
          name?: string
          teacher_id?: string
        }
        Relationships: []
      }
      district_settings: {
        Row: {
          consent_type: Database["public"]["Enums"]["district_consent_type"]
          created_at: string
          district_id: string
          id: string
          max_age: number
          min_age: number
          require_parental_consent: boolean
          updated_at: string
        }
        Insert: {
          consent_type?: Database["public"]["Enums"]["district_consent_type"]
          created_at?: string
          district_id: string
          id?: string
          max_age?: number
          min_age?: number
          require_parental_consent?: boolean
          updated_at?: string
        }
        Update: {
          consent_type?: Database["public"]["Enums"]["district_consent_type"]
          created_at?: string
          district_id?: string
          id?: string
          max_age?: number
          min_age?: number
          require_parental_consent?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_settings_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "school_districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_users: {
        Row: {
          consent_date: string | null
          consent_provided: boolean
          consent_type:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at: string
          district_id: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_date?: string | null
          consent_provided?: boolean
          consent_type?:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at?: string
          district_id: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_date?: string | null
          consent_provided?: boolean
          consent_type?:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at?: string
          district_id?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "district_users_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "school_districts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_captures: {
        Row: {
          captured_at: string
          created_at: string
          email: string
          id: string
          ip_address: unknown | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          captured_at?: string
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          captured_at?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      grade_levels: {
        Row: {
          created_at: string
          id: string
          level_name: string
          level_number: number
          school_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level_name: string
          level_number: number
          school_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level_name?: string
          level_number?: number
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grade_levels_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          grade_level_id: string | null
          graduation_year: number | null
          id: string
          learning_goal: string | null
          role: string | null
          school_id: string | null
          student_id: string | null
          target_date: string | null
          target_level: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          grade_level_id?: string | null
          graduation_year?: number | null
          id: string
          learning_goal?: string | null
          role?: string | null
          school_id?: string | null
          student_id?: string | null
          target_date?: string | null
          target_level?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          grade_level_id?: string | null
          graduation_year?: number | null
          id?: string
          learning_goal?: string | null
          role?: string | null
          school_id?: string | null
          student_id?: string | null
          target_date?: string | null
          target_level?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_milestones: {
        Row: {
          achievement_date: string
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          improvement_percentage: number | null
          milestone_type: string
          previous_value: number | null
          transcript_id: string | null
          user_id: string
        }
        Insert: {
          achievement_date?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          improvement_percentage?: number | null
          milestone_type: string
          previous_value?: number | null
          transcript_id?: string | null
          user_id: string
        }
        Update: {
          achievement_date?: string
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          improvement_percentage?: number | null
          milestone_type?: string
          previous_value?: number | null
          transcript_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_milestones_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcript_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action_type: string
          count: number | null
          created_at: string
          id: string
          user_id: string
          window_start: string
        }
        Insert: {
          action_type: string
          count?: number | null
          created_at?: string
          id?: string
          user_id: string
          window_start?: string
        }
        Update: {
          action_type?: string
          count?: number | null
          created_at?: string
          id?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      recent_phrases: {
        Row: {
          created_at: string
          id: string
          language: string
          level: string
          phrase: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          level: string
          phrase: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          level?: string
          phrase?: string
        }
        Relationships: []
      }
      school_certification_stats: {
        Row: {
          academic_year: string
          avg_score: number | null
          certification_type: string
          class_count: number | null
          id: string
          last_updated: string | null
          school_id: string | null
          student_count: number | null
        }
        Insert: {
          academic_year: string
          avg_score?: number | null
          certification_type: string
          class_count?: number | null
          id?: string
          last_updated?: string | null
          school_id?: string | null
          student_count?: number | null
        }
        Update: {
          academic_year?: string
          avg_score?: number | null
          certification_type?: string
          class_count?: number | null
          id?: string
          last_updated?: string | null
          school_id?: string | null
          student_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "school_certification_stats_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_districts: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          created_at: string
          district: string | null
          district_id: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          principal_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          district?: string | null
          district_id?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          principal_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          district?: string | null
          district_id?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          principal_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "school_districts"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      student_enrollments: {
        Row: {
          class_id: string | null
          created_at: string
          enrollment_date: string
          final_grade: string | null
          grade_points: number | null
          id: string
          status: string | null
          student_id: string | null
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          enrollment_date?: string
          final_grade?: string | null
          grade_points?: number | null
          id?: string
          status?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          enrollment_date?: string
          final_grade?: string | null
          grade_points?: number | null
          id?: string
          status?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_grades: {
        Row: {
          assignment_id: string | null
          created_at: string
          feedback: string | null
          grade_letter: string | null
          graded_at: string | null
          id: string
          points_earned: number | null
          student_id: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          feedback?: string | null
          grade_letter?: string | null
          graded_at?: string | null
          id?: string
          points_earned?: number | null
          student_id?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          feedback?: string | null
          grade_letter?: string | null
          graded_at?: string | null
          id?: string
          points_earned?: number | null
          student_id?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_grades_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_language_metrics: {
        Row: {
          conversation_complexity: number | null
          created_at: string
          grammar_accuracy: number | null
          id: string
          message_count: number | null
          pronunciation_accuracy: number | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          conversation_complexity?: number | null
          created_at?: string
          grammar_accuracy?: number | null
          id?: string
          message_count?: number | null
          pronunciation_accuracy?: number | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          conversation_complexity?: number | null
          created_at?: string
          grammar_accuracy?: number | null
          id?: string
          message_count?: number | null
          pronunciation_accuracy?: number | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_metrics: {
        Row: {
          avg_conversation_complexity: number | null
          avg_grammar_accuracy: number | null
          created_at: string
          id: string
          language_metrics_count: number | null
          last_activity: string | null
          premium_voice_calls: number | null
          student_id: string
          text_practice_calls: number | null
          updated_at: string
        }
        Insert: {
          avg_conversation_complexity?: number | null
          avg_grammar_accuracy?: number | null
          created_at?: string
          id?: string
          language_metrics_count?: number | null
          last_activity?: string | null
          premium_voice_calls?: number | null
          student_id: string
          text_practice_calls?: number | null
          updated_at?: string
        }
        Update: {
          avg_conversation_complexity?: number | null
          avg_grammar_accuracy?: number | null
          created_at?: string
          id?: string
          language_metrics_count?: number | null
          last_activity?: string | null
          premium_voice_calls?: number | null
          student_id?: string
          text_practice_calls?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      student_usage_limits: {
        Row: {
          academic_year: string
          certification_attempts_semester_limit: number
          certification_attempts_used_current_semester: number
          created_at: string
          current_month: string
          current_semester: string
          id: string
          last_reset_month: string | null
          last_reset_semester: string | null
          student_id: string
          text_messages_monthly_limit: number | null
          text_messages_used_current_month: number
          updated_at: string
          voice_minutes_monthly_limit: number
          voice_minutes_used_current_month: number
        }
        Insert: {
          academic_year?: string
          certification_attempts_semester_limit?: number
          certification_attempts_used_current_semester?: number
          created_at?: string
          current_month?: string
          current_semester?: string
          id?: string
          last_reset_month?: string | null
          last_reset_semester?: string | null
          student_id: string
          text_messages_monthly_limit?: number | null
          text_messages_used_current_month?: number
          updated_at?: string
          voice_minutes_monthly_limit?: number
          voice_minutes_used_current_month?: number
        }
        Update: {
          academic_year?: string
          certification_attempts_semester_limit?: number
          certification_attempts_used_current_semester?: number
          created_at?: string
          current_month?: string
          current_semester?: string
          id?: string
          last_reset_month?: string | null
          last_reset_semester?: string | null
          student_id?: string
          text_messages_monthly_limit?: number | null
          text_messages_used_current_month?: number
          updated_at?: string
          voice_minutes_monthly_limit?: number
          voice_minutes_used_current_month?: number
        }
        Relationships: []
      }
      student_usage_metrics: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          last_activity_date: string | null
          lessons_completed: number | null
          practice_sessions: number | null
          student_id: string | null
          updated_at: string
          voice_chat_minutes: number | null
          week_starting: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number | null
          practice_sessions?: number | null
          student_id?: string | null
          updated_at?: string
          voice_chat_minutes?: number | null
          week_starting: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number | null
          practice_sessions?: number | null
          student_id?: string | null
          updated_at?: string
          voice_chat_minutes?: number | null
          week_starting?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_usage_metrics_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_usage_metrics_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_recommendations: {
        Row: {
          created_at: string
          difficulty_level: string | null
          estimated_time_investment: string | null
          id: string
          priority_level: number
          recommendation_text: string
          resources: Json | null
          skill_area: string
          status: string
          transcript_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty_level?: string | null
          estimated_time_investment?: string | null
          id?: string
          priority_level?: number
          recommendation_text: string
          resources?: Json | null
          skill_area: string
          status?: string
          transcript_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty_level?: string | null
          estimated_time_investment?: string | null
          id?: string
          priority_level?: number
          recommendation_text?: string
          resources?: Json | null
          skill_area?: string
          status?: string
          transcript_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_recommendations_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcript_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string
          department: string | null
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          department?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          department?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      teacher_assignments: {
        Row: {
          academic_year: string
          created_at: string
          id: string
          school_id: string | null
          subject_id: string | null
          teacher_id: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string
          id?: string
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string
          id?: string
          school_id?: string | null
          subject_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_restrictions: {
        Row: {
          allowed_days: number[]
          class_id: string | null
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          is_active: boolean
          restriction_type: string
          school_id: string | null
          start_time: string
          student_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          allowed_days?: number[]
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          restriction_type: string
          school_id?: string | null
          start_time?: string
          student_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          allowed_days?: number[]
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          restriction_type?: string
          school_id?: string | null
          start_time?: string
          student_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      transcript_analyses: {
        Row: {
          analysis_status: string
          cefr_level: string | null
          created_at: string
          detailed_feedback: string | null
          file_name: string
          file_type: string
          file_url: string | null
          id: string
          overall_score: number | null
          progress_insights: string | null
          raw_extracted_data: Json | null
          reading_listening_score: number | null
          recommendations: string[] | null
          spoken_fluency_score: number | null
          strengths: string[] | null
          test_date: string | null
          test_provider: string | null
          updated_at: string
          upload_date: string
          user_id: string
          weaknesses: string[] | null
          written_production_score: number | null
        }
        Insert: {
          analysis_status?: string
          cefr_level?: string | null
          created_at?: string
          detailed_feedback?: string | null
          file_name: string
          file_type: string
          file_url?: string | null
          id?: string
          overall_score?: number | null
          progress_insights?: string | null
          raw_extracted_data?: Json | null
          reading_listening_score?: number | null
          recommendations?: string[] | null
          spoken_fluency_score?: number | null
          strengths?: string[] | null
          test_date?: string | null
          test_provider?: string | null
          updated_at?: string
          upload_date?: string
          user_id: string
          weaknesses?: string[] | null
          written_production_score?: number | null
        }
        Update: {
          analysis_status?: string
          cefr_level?: string | null
          created_at?: string
          detailed_feedback?: string | null
          file_name?: string
          file_type?: string
          file_url?: string | null
          id?: string
          overall_score?: number | null
          progress_insights?: string | null
          raw_extracted_data?: Json | null
          reading_listening_score?: number | null
          recommendations?: string[] | null
          spoken_fluency_score?: number | null
          strengths?: string[] | null
          test_date?: string | null
          test_provider?: string | null
          updated_at?: string
          upload_date?: string
          user_id?: string
          weaknesses?: string[] | null
          written_production_score?: number | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          academic_year: string
          created_at: string
          ended_at: string | null
          id: string
          messages_count: number | null
          minutes_used: number | null
          session_id: string | null
          session_type: string
          started_at: string
          student_id: string
        }
        Insert: {
          academic_year?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          messages_count?: number | null
          minutes_used?: number | null
          session_id?: string | null
          session_type: string
          started_at?: string
          student_id: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          messages_count?: number | null
          minutes_used?: number | null
          session_id?: string | null
          session_type?: string
          started_at?: string
          student_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      can_start_voice_session: {
        Args: { target_student_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_max_requests?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_phrases: {
        Args: { p_language: string; p_level: string }
        Returns: undefined
      }
      create_classroom: {
        Args: { class_name: string }
        Returns: Json
      }
      generate_access_code: {
        Args: {
          p_code_type: Database["public"]["Enums"]["code_type"]
          p_expires_at?: string
          p_max_uses?: number
          p_target_id: string
          p_target_name: string
        }
        Returns: string
      }
      get_class_student_metrics: {
        Args: { target_classroom_id?: string }
        Returns: {
          classroom_id: string
          last_activity: string
          premium_voice_calls: number
          student_email: string
          student_id: string
          student_name: string
          text_practice_calls: number
        }[]
      }
      get_user_district_ids: {
        Args: { target_user_id: string }
        Returns: string[]
      }
      initialize_student_usage_limits: {
        Args: { target_student_id: string }
        Returns: undefined
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_student_in_admin_school: {
        Args: { student_user_id: string }
        Returns: boolean
      }
      is_user_enrolled_in_class: {
        Args: { class_id_param: string }
        Returns: boolean
      }
      is_user_teacher_of_class: {
        Args: { class_id_param: string }
        Returns: boolean
      }
      join_classroom: {
        Args: { class_code: string }
        Returns: Json
      }
      log_role_change_attempt: {
        Args: {
          requested_role: string
          success: boolean
          target_user_id: string
        }
        Returns: undefined
      }
      process_access_code: {
        Args: Record<PropertyKey, never> | { p_code: string }
        Returns: Json
      }
      recalculate_student_metrics: {
        Args: { target_student_id: string }
        Returns: undefined
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_semester_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_student_language_aggregate_metrics: {
        Args: { target_student_id: string }
        Returns: undefined
      }
      update_student_usage_aggregates: {
        Args: { target_student_id: string }
        Returns: undefined
      }
    }
    Enums: {
      code_type: "district" | "school" | "teacher" | "class"
      district_consent_type:
        | "individual"
        | "code_of_conduct"
        | "written_permission"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      code_type: ["district", "school", "teacher", "class"],
      district_consent_type: [
        "individual",
        "code_of_conduct",
        "written_permission",
      ],
    },
  },
} as const
