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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_code_attempts: {
        Row: {
          attempted_code: string
          created_at: string
          id: string
          success: boolean
          user_id: string
        }
        Insert: {
          attempted_code: string
          created_at?: string
          id?: string
          success?: boolean
          user_id: string
        }
        Update: {
          attempted_code?: string
          created_at?: string
          id?: string
          success?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_code_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      access_codes: {
        Row: {
          active: boolean | null
          code: string
          code_type: string
          created_at: string
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
          target_id: string | null
          target_name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          code: string
          code_type?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          target_id?: string | null
          target_name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          code?: string
          code_type?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          target_id?: string | null
          target_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_override_logs: {
        Row: {
          admin_id: string
          created_at: string
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
          api_type: string | null
          created_at: string
          endpoint: string | null
          id: string
          metadata: Json | null
          service: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          api_type?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          metadata?: Json | null
          service?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          api_type?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          metadata?: Json | null
          service?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          created_at: string
          id: string
          meta: Json
          transcript: string | null
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          meta?: Json
          transcript?: string | null
          type?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          meta?: Json
          transcript?: string | null
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          accepted_at: string | null
          ai_feedback: Json | null
          ai_score: number | null
          assignment_id: string
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          expires_at: string | null
          id: string
          message_count: number | null
          messages: Json | null
          score: number | null
          session_id: string | null
          started_at: string | null
          status: string | null
          student_id: string
          submitted_at: string | null
          teacher_notes: string | null
          teacher_override_score: number | null
          transcript: Json | null
          updated_at: string
          xp_awarded: number | null
        }
        Insert: {
          accepted_at?: string | null
          ai_feedback?: Json | null
          ai_score?: number | null
          assignment_id: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          expires_at?: string | null
          id?: string
          message_count?: number | null
          messages?: Json | null
          score?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          student_id: string
          submitted_at?: string | null
          teacher_notes?: string | null
          teacher_override_score?: number | null
          transcript?: Json | null
          updated_at?: string
          xp_awarded?: number | null
        }
        Update: {
          accepted_at?: string | null
          ai_feedback?: Json | null
          ai_score?: number | null
          assignment_id?: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          expires_at?: string | null
          id?: string
          message_count?: number | null
          messages?: Json | null
          score?: number | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          student_id?: string
          submitted_at?: string | null
          teacher_notes?: string | null
          teacher_override_score?: number | null
          transcript?: Json | null
          updated_at?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          assignment_mode: string | null
          assignment_type: string | null
          cefr_level: string | null
          class_id: string
          created_at: string
          description: string | null
          due_date: string | null
          grammar_requirements: Json | null
          id: string
          max_duration_minutes: number | null
          min_messages: number | null
          points_possible: number | null
          status: string | null
          teacher_id: string
          title: string
          topic_prompt: string
          updated_at: string
        }
        Insert: {
          assignment_mode?: string | null
          assignment_type?: string | null
          cefr_level?: string | null
          class_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          grammar_requirements?: Json | null
          id?: string
          max_duration_minutes?: number | null
          min_messages?: number | null
          points_possible?: number | null
          status?: string | null
          teacher_id: string
          title: string
          topic_prompt: string
          updated_at?: string
        }
        Update: {
          assignment_mode?: string | null
          assignment_type?: string | null
          cefr_level?: string | null
          class_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          grammar_requirements?: Json | null
          id?: string
          max_duration_minutes?: number | null
          min_messages?: number | null
          points_possible?: number | null
          status?: string | null
          teacher_id?: string
          title?: string
          topic_prompt?: string
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
      can_do_statements: {
        Row: {
          created_at: string
          framework: string
          id: string
          level: string | null
          skill_or_mode: string | null
          statement: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          framework: string
          id?: string
          level?: string | null
          skill_or_mode?: string | null
          statement: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          framework?: string
          id?: string
          level?: string | null
          skill_or_mode?: string | null
          statement?: string
          updated_at?: string
        }
        Relationships: []
      }
      certification_attempts: {
        Row: {
          certification_type: string
          completed_at: string | null
          created_at: string
          id: string
          level: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          certification_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          certification_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          level?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      certification_transcripts: {
        Row: {
          ai_responses: Json | null
          attempt_id: string | null
          created_at: string
          id: string
          user_id: string
          user_transcripts: Json | null
        }
        Insert: {
          ai_responses?: Json | null
          attempt_id?: string | null
          created_at?: string
          id?: string
          user_id: string
          user_transcripts?: Json | null
        }
        Update: {
          ai_responses?: Json | null
          attempt_id?: string | null
          created_at?: string
          id?: string
          user_id?: string
          user_transcripts?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "certification_transcripts_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "certification_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      class_certification_stats: {
        Row: {
          academic_year: string | null
          avg_score: number | null
          certification_type: string
          class_id: string
          id: string
          last_updated: string
          student_count: number
        }
        Insert: {
          academic_year?: string | null
          avg_score?: number | null
          certification_type: string
          class_id: string
          id?: string
          last_updated?: string
          student_count?: number
        }
        Update: {
          academic_year?: string | null
          avg_score?: number | null
          certification_type?: string
          class_id?: string
          id?: string
          last_updated?: string
          student_count?: number
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
      class_curriculum_assignments: {
        Row: {
          class_id: string
          created_at: string
          due_date: string | null
          group_label: string | null
          id: string
          instructions: string | null
          lesson_id: string | null
          target_cefr_levels: string[]
          target_wida_max: number | null
          target_wida_min: number | null
          teacher_id: string
          title: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          due_date?: string | null
          group_label?: string | null
          id?: string
          instructions?: string | null
          lesson_id?: string | null
          target_cefr_levels?: string[]
          target_wida_max?: number | null
          target_wida_min?: number | null
          teacher_id: string
          title: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          due_date?: string | null
          group_label?: string | null
          id?: string
          instructions?: string | null
          lesson_id?: string | null
          target_cefr_levels?: string[]
          target_wida_max?: number | null
          target_wida_min?: number | null
          teacher_id?: string
          title?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_curriculum_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_curriculum_assignments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_curriculum_assignments_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string | null
          class_code: string | null
          created_at: string
          grade_level_id: string | null
          id: string
          max_students: number
          name: string
          period: string | null
          room_number: string | null
          school_id: string | null
          semester: string | null
          subject_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          class_code?: string | null
          created_at?: string
          grade_level_id?: string | null
          id?: string
          max_students?: number
          name: string
          period?: string | null
          room_number?: string | null
          school_id?: string | null
          semester?: string | null
          subject_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          class_code?: string | null
          created_at?: string
          grade_level_id?: string | null
          id?: string
          max_students?: number
          name?: string
          period?: string | null
          room_number?: string | null
          school_id?: string | null
          semester?: string | null
          subject_id?: string | null
          teacher_id?: string
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
      compliance_status: {
        Row: {
          action_items: Json | null
          compliance_score: number | null
          compliance_type: string
          created_at: string
          findings: Json | null
          id: string
          last_audit_date: string | null
          next_audit_date: string | null
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          action_items?: Json | null
          compliance_score?: number | null
          compliance_type: string
          created_at?: string
          findings?: Json | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          action_items?: Json | null
          compliance_score?: number | null
          compliance_type?: string
          created_at?: string
          findings?: Json | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_can_do_map: {
        Row: {
          can_do_id: string
          content_id: string
          content_type: string
          created_at: string
          id: string
        }
        Insert: {
          can_do_id: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
        }
        Update: {
          can_do_id?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_can_do_map_can_do_id_fkey"
            columns: ["can_do_id"]
            isOneToOne: false
            referencedRelation: "can_do_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          language: string
          level_band: string | null
          status: string
          target_framework: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          level_band?: string | null
          status?: string
          target_framework?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          language?: string
          level_band?: string | null
          status?: string
          target_framework?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_breach_notifications: {
        Row: {
          affected_data_types: string[] | null
          affected_user_count: number | null
          breach_date: string
          breach_description: string
          breach_type: string
          created_at: string
          created_by: string | null
          id: string
          mitigation_steps: string
          severity: string
        }
        Insert: {
          affected_data_types?: string[] | null
          affected_user_count?: number | null
          breach_date: string
          breach_description: string
          breach_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          mitigation_steps: string
          severity: string
        }
        Update: {
          affected_data_types?: string[] | null
          affected_user_count?: number | null
          breach_date?: string
          breach_description?: string
          breach_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          mitigation_steps?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_breach_notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          error_message: string | null
          export_file_url: string | null
          file_format: string
          id: string
          request_type: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          export_file_url?: string | null
          file_format: string
          id?: string
          request_type: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          export_file_url?: string | null
          file_format?: string
          id?: string
          request_type?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      district_settings: {
        Row: {
          consent_type: string
          created_at: string
          district_id: string
          id: string
          max_age: number
          min_age: number
          require_parental_consent: boolean
          updated_at: string
        }
        Insert: {
          consent_type?: string
          created_at?: string
          district_id: string
          id?: string
          max_age?: number
          min_age?: number
          require_parental_consent?: boolean
          updated_at?: string
        }
        Update: {
          consent_type?: string
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
            isOneToOne: true
            referencedRelation: "school_districts"
            referencedColumns: ["id"]
          },
        ]
      }
      district_users: {
        Row: {
          consent_date: string | null
          consent_provided: boolean | null
          consent_type: string | null
          created_at: string
          district_id: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_date?: string | null
          consent_provided?: boolean | null
          consent_type?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_date?: string | null
          consent_provided?: boolean | null
          consent_type?: string | null
          created_at?: string
          district_id?: string | null
          id?: string
          role?: string | null
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
      educational_data_access_audit: {
        Row: {
          access_granted: boolean
          access_purpose: string | null
          access_type: string | null
          accessed_at: string
          accessed_user_id: string
          accessor_user_id: string
          created_at: string
          data_accessed: string | null
          data_category: string | null
          data_type: string
          denial_reason: string | null
          educational_justification: string | null
          id: string
          legitimate_interest_verified: boolean
        }
        Insert: {
          access_granted?: boolean
          access_purpose?: string | null
          access_type?: string | null
          accessed_at?: string
          accessed_user_id: string
          accessor_user_id: string
          created_at?: string
          data_accessed?: string | null
          data_category?: string | null
          data_type: string
          denial_reason?: string | null
          educational_justification?: string | null
          id?: string
          legitimate_interest_verified?: boolean
        }
        Update: {
          access_granted?: boolean
          access_purpose?: string | null
          access_type?: string | null
          accessed_at?: string
          accessed_user_id?: string
          accessor_user_id?: string
          created_at?: string
          data_accessed?: string | null
          data_category?: string | null
          data_type?: string
          denial_reason?: string | null
          educational_justification?: string | null
          id?: string
          legitimate_interest_verified?: boolean
        }
        Relationships: []
      }
      exercise_attempts: {
        Row: {
          created_at: string
          difficulty: number | null
          exercise_id: string
          id: string
          is_correct: boolean
          lesson_id: string | null
          response_ms: number | null
          selected_option_id: string | null
          skill_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          exercise_id: string
          id?: string
          is_correct: boolean
          lesson_id?: string | null
          response_ms?: number | null
          selected_option_id?: string | null
          skill_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          exercise_id?: string
          id?: string
          is_correct?: boolean
          lesson_id?: string | null
          response_ms?: number | null
          selected_option_id?: string | null
          skill_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_attempts_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_options: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          is_correct: boolean
          label: string
          position: number
          rationale: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          is_correct?: boolean
          label: string
          position?: number
          rationale?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          is_correct?: boolean
          label?: string
          position?: number
          rationale?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_options_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          difficulty: number | null
          gate_results: Json
          id: string
          lesson_id: string
          passage_id: string | null
          position: number
          prompt: string
          receptive_productive: string | null
          source_model: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          gate_results?: Json
          id?: string
          lesson_id: string
          passage_id?: string | null
          position?: number
          prompt: string
          receptive_productive?: string | null
          source_model?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          gate_results?: Json
          id?: string
          lesson_id?: string
          passage_id?: string | null
          position?: number
          prompt?: string
          receptive_productive?: string | null
          source_model?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "passages"
            referencedColumns: ["id"]
          },
        ]
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
      learner_streaks: {
        Row: {
          created_at: string
          current_streak: number
          freeze_refilled_on: string | null
          freezes_available: number
          freezes_used: number
          id: string
          last_activity_date: string | null
          last_freeze_used_on: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          freeze_refilled_on?: string | null
          freezes_available?: number
          freezes_used?: number
          id?: string
          last_activity_date?: string | null
          last_freeze_used_on?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          freeze_refilled_on?: string | null
          freezes_available?: number
          freezes_used?: number
          id?: string
          last_activity_date?: string | null
          last_freeze_used_on?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          accuracy: number
          attempts: number
          completed_at: string | null
          correct: number
          created_at: string
          id: string
          last_exercise_id: string | null
          lesson_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number
          attempts?: number
          completed_at?: string | null
          correct?: number
          created_at?: string
          id?: string
          last_exercise_id?: string | null
          lesson_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number
          attempts?: number
          completed_at?: string | null
          correct?: number
          created_at?: string
          id?: string
          last_exercise_id?: string | null
          lesson_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          id: string
          intro_md: string | null
          position: number
          skill_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intro_md?: string | null
          position?: number
          skill_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intro_md?: string | null
          position?: number
          skill_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      passages: {
        Row: {
          audio_asset_id: string | null
          body: string
          cefr_level: string | null
          created_at: string
          gate_results: Json
          id: string
          key_language_use: string | null
          language: string
          readability_grade: number | null
          skill_type: string | null
          source_model: string | null
          status: string
          title: string | null
          topic: string | null
          updated_at: string
          wida_level: number | null
          word_count: number | null
        }
        Insert: {
          audio_asset_id?: string | null
          body: string
          cefr_level?: string | null
          created_at?: string
          gate_results?: Json
          id?: string
          key_language_use?: string | null
          language?: string
          readability_grade?: number | null
          skill_type?: string | null
          source_model?: string | null
          status?: string
          title?: string | null
          topic?: string | null
          updated_at?: string
          wida_level?: number | null
          word_count?: number | null
        }
        Update: {
          audio_asset_id?: string | null
          body?: string
          cefr_level?: string | null
          created_at?: string
          gate_results?: Json
          id?: string
          key_language_use?: string | null
          language?: string
          readability_grade?: number | null
          skill_type?: string | null
          source_model?: string | null
          status?: string
          title?: string | null
          topic?: string | null
          updated_at?: string
          wida_level?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "passages_audio_asset_id_fkey"
            columns: ["audio_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_flashcards: {
        Row: {
          category: string | null
          cefr_level: string | null
          created_at: string
          definition: string | null
          example: string | null
          id: string
          mastery_level: number | null
          next_due: string | null
          source_type: string | null
          student_id: string
          term: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cefr_level?: string | null
          created_at?: string
          definition?: string | null
          example?: string | null
          id?: string
          mastery_level?: number | null
          next_due?: string | null
          source_type?: string | null
          student_id: string
          term: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cefr_level?: string | null
          created_at?: string
          definition?: string | null
          example?: string | null
          id?: string
          mastery_level?: number | null
          next_due?: string | null
          source_type?: string | null
          student_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_public_data: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          role: string | null
          school_id: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          role?: string | null
          school_id?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          role?: string | null
          school_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_tier: string | null
          age_verified_at: string | null
          avatar_url: string | null
          birth_year: number | null
          created_at: string
          display_name: string | null
          email: string | null
          grade_level_id: string | null
          graduation_year: number | null
          id: string
          is_minor: boolean
          learning_goal: string | null
          native_language: string | null
          parental_consent_at: string | null
          parental_consent_granted: boolean
          placement_cefr: string | null
          placement_taken_at: string | null
          role: string | null
          safety_mode: string
          school_id: string | null
          student_id: string | null
          target_date: string | null
          target_language: string | null
          target_level: string | null
          updated_at: string
        }
        Insert: {
          account_tier?: string | null
          age_verified_at?: string | null
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          grade_level_id?: string | null
          graduation_year?: number | null
          id: string
          is_minor?: boolean
          learning_goal?: string | null
          native_language?: string | null
          parental_consent_at?: string | null
          parental_consent_granted?: boolean
          placement_cefr?: string | null
          placement_taken_at?: string | null
          role?: string | null
          safety_mode?: string
          school_id?: string | null
          student_id?: string | null
          target_date?: string | null
          target_language?: string | null
          target_level?: string | null
          updated_at?: string
        }
        Update: {
          account_tier?: string | null
          age_verified_at?: string | null
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          grade_level_id?: string | null
          graduation_year?: number | null
          id?: string
          is_minor?: boolean
          learning_goal?: string | null
          native_language?: string | null
          parental_consent_at?: string | null
          parental_consent_granted?: boolean
          placement_cefr?: string | null
          placement_taken_at?: string | null
          role?: string | null
          safety_mode?: string
          school_id?: string | null
          student_id?: string | null
          target_date?: string | null
          target_language?: string | null
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
        ]
      }
      recent_phrases: {
        Row: {
          created_at: string
          id: string
          language: string | null
          level: string | null
          phrase: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string | null
          level?: string | null
          phrase: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          level?: string | null
          phrase?: string
        }
        Relationships: []
      }
      roster_sync_connections: {
        Row: {
          config: Json
          created_at: string
          created_by: string | null
          external_id: string | null
          id: string
          last_synced_at: string | null
          provider: string
          school_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          provider: string
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by?: string | null
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          provider?: string
          school_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_sync_connections_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_certification_stats: {
        Row: {
          academic_year: string | null
          avg_score: number | null
          certification_type: string
          class_count: number
          id: string
          last_updated: string
          school_id: string
          student_count: number
        }
        Insert: {
          academic_year?: string | null
          avg_score?: number | null
          certification_type: string
          class_count?: number
          id?: string
          last_updated?: string
          school_id: string
          student_count?: number
        }
        Update: {
          academic_year?: string | null
          avg_score?: number | null
          certification_type?: string
          class_count?: number
          id?: string
          last_updated?: string
          school_id?: string
          student_count?: number
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
          created_at: string
          district_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          id?: string
          name?: string
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
      skill_mastery: {
        Row: {
          ability: number
          attempts: number
          correct: number
          created_at: string
          id: string
          last_practiced_at: string | null
          mastery: number
          recent_window: Json
          skill_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ability?: number
          attempts?: number
          correct?: number
          created_at?: string
          id?: string
          last_practiced_at?: string | null
          mastery?: number
          recent_window?: Json
          skill_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ability?: number
          attempts?: number
          correct?: number
          created_at?: string
          id?: string
          last_practiced_at?: string | null
          mastery?: number
          recent_window?: Json
          skill_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_mastery_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          description: string | null
          id: string
          position: number
          status: string
          target_grammar_point: string | null
          title: string
          type: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          status?: string
          target_grammar_point?: string | null
          title: string
          type: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          position?: number
          status?: string
          target_grammar_point?: string | null
          title?: string
          type?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          class_id: string
          created_at: string
          enrolled_at: string
          enrollment_date: string
          final_grade: string | null
          grade_points: number | null
          id: string
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          enrolled_at?: string
          enrollment_date?: string
          final_grade?: string | null
          grade_points?: number | null
          id?: string
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          enrolled_at?: string
          enrollment_date?: string
          final_grade?: string | null
          grade_points?: number | null
          id?: string
          status?: string | null
          student_id?: string
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
          assignment_id: string
          created_at: string
          feedback: string | null
          grade_letter: string | null
          graded_at: string | null
          id: string
          points_earned: number | null
          student_id: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          feedback?: string | null
          grade_letter?: string | null
          graded_at?: string | null
          id?: string
          points_earned?: number | null
          student_id: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          feedback?: string | null
          grade_letter?: string | null
          graded_at?: string | null
          id?: string
          points_earned?: number | null
          student_id?: string
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
          analysis_data: Json | null
          classroom_id: string | null
          conversation_complexity: number | null
          created_at: string
          fluency_score: number | null
          grammar_accuracy: number | null
          id: string
          pronunciation_accuracy: number | null
          session_id: string | null
          user_id: string
          vocabulary_diversity: number | null
        }
        Insert: {
          analysis_data?: Json | null
          classroom_id?: string | null
          conversation_complexity?: number | null
          created_at?: string
          fluency_score?: number | null
          grammar_accuracy?: number | null
          id?: string
          pronunciation_accuracy?: number | null
          session_id?: string | null
          user_id: string
          vocabulary_diversity?: number | null
        }
        Update: {
          analysis_data?: Json | null
          classroom_id?: string | null
          conversation_complexity?: number | null
          created_at?: string
          fluency_score?: number | null
          grammar_accuracy?: number | null
          id?: string
          pronunciation_accuracy?: number | null
          session_id?: string | null
          user_id?: string
          vocabulary_diversity?: number | null
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
          certification_attempts_semester_limit: number | null
          certification_attempts_used_current_semester: number | null
          created_at: string
          id: string
          premium_voice_minutes_monthly_limit: number | null
          premium_voice_minutes_used_current_month: number | null
          student_id: string
          text_messages_monthly_limit: number | null
          text_messages_used_current_month: number | null
          text_practice_tokens_monthly_limit: number | null
          text_practice_tokens_used_current_month: number | null
          tts_tokens_monthly_limit: number | null
          tts_tokens_used_current_month: number | null
          updated_at: string
          voice_minutes_monthly_limit: number | null
          voice_minutes_used_current_month: number | null
          whisper_stt_minutes_monthly_limit: number | null
          whisper_stt_minutes_used_current_month: number | null
        }
        Insert: {
          certification_attempts_semester_limit?: number | null
          certification_attempts_used_current_semester?: number | null
          created_at?: string
          id?: string
          premium_voice_minutes_monthly_limit?: number | null
          premium_voice_minutes_used_current_month?: number | null
          student_id: string
          text_messages_monthly_limit?: number | null
          text_messages_used_current_month?: number | null
          text_practice_tokens_monthly_limit?: number | null
          text_practice_tokens_used_current_month?: number | null
          tts_tokens_monthly_limit?: number | null
          tts_tokens_used_current_month?: number | null
          updated_at?: string
          voice_minutes_monthly_limit?: number | null
          voice_minutes_used_current_month?: number | null
          whisper_stt_minutes_monthly_limit?: number | null
          whisper_stt_minutes_used_current_month?: number | null
        }
        Update: {
          certification_attempts_semester_limit?: number | null
          certification_attempts_used_current_semester?: number | null
          created_at?: string
          id?: string
          premium_voice_minutes_monthly_limit?: number | null
          premium_voice_minutes_used_current_month?: number | null
          student_id?: string
          text_messages_monthly_limit?: number | null
          text_messages_used_current_month?: number | null
          text_practice_tokens_monthly_limit?: number | null
          text_practice_tokens_used_current_month?: number | null
          tts_tokens_monthly_limit?: number | null
          tts_tokens_used_current_month?: number | null
          updated_at?: string
          voice_minutes_monthly_limit?: number | null
          voice_minutes_used_current_month?: number | null
          whisper_stt_minutes_monthly_limit?: number | null
          whisper_stt_minutes_used_current_month?: number | null
        }
        Relationships: []
      }
      student_usage_metrics: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          last_activity_date: string | null
          lessons_completed: number
          practice_sessions: number
          student_id: string
          updated_at: string
          voice_chat_minutes: number
          week_starting: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          practice_sessions?: number
          student_id: string
          updated_at?: string
          voice_chat_minutes?: number
          week_starting: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number
          practice_sessions?: number
          student_id?: string
          updated_at?: string
          voice_chat_minutes?: number
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
          description: string | null
          id: string
          priority: number | null
          recommendation_type: string | null
          title: string | null
          transcript_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: number | null
          recommendation_type?: string | null
          title?: string | null
          transcript_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          priority?: number | null
          recommendation_type?: string | null
          title?: string | null
          transcript_id?: string | null
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
      transcript_analyses: {
        Row: {
          analysis_data: Json | null
          cefr_level: string | null
          created_at: string
          id: string
          overall_score: number | null
          upload_date: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          cefr_level?: string | null
          created_at?: string
          id?: string
          overall_score?: number | null
          upload_date?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          cefr_level?: string | null
          created_at?: string
          id?: string
          overall_score?: number | null
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          can_do_statement: string | null
          cefr_level: string | null
          content_objective: string | null
          course_id: string
          created_at: string
          id: string
          key_language_use: string | null
          language_objective: string | null
          position: number
          status: string
          theme: string | null
          title: string
          updated_at: string
          wida_level: number | null
        }
        Insert: {
          can_do_statement?: string | null
          cefr_level?: string | null
          content_objective?: string | null
          course_id: string
          created_at?: string
          id?: string
          key_language_use?: string | null
          language_objective?: string | null
          position?: number
          status?: string
          theme?: string | null
          title: string
          updated_at?: string
          wida_level?: number | null
        }
        Update: {
          can_do_statement?: string | null
          cefr_level?: string | null
          content_objective?: string | null
          course_id?: string
          created_at?: string
          id?: string
          key_language_use?: string | null
          language_objective?: string | null
          position?: number
          status?: string
          theme?: string | null
          title?: string
          updated_at?: string
          wida_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "units_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_counters: {
        Row: {
          bucket: string
          count: number
          created_at: string
          day: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket: string
          count?: number
          created_at?: string
          day?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket?: string
          count?: number
          created_at?: string
          day?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          messages_count: number | null
          minutes_used: number | null
          session_id: string | null
          session_type: string
          student_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          messages_count?: number | null
          minutes_used?: number | null
          session_id?: string | null
          session_type: string
          student_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          messages_count?: number | null
          minutes_used?: number | null
          session_id?: string | null
          session_type?: string
          student_id?: string
        }
        Relationships: []
      }
      user_progression: {
        Row: {
          certifications_completed: number | null
          created_at: string
          current_level: number | null
          current_streak: number | null
          current_streak_days: number | null
          id: string
          last_activity_date: string | null
          lessons_completed: number | null
          level: number | null
          longest_streak: number | null
          longest_streak_days: number | null
          streak_multiplier: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications_completed?: number | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          current_streak_days?: number | null
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number | null
          level?: number | null
          longest_streak?: number | null
          longest_streak_days?: number | null
          streak_multiplier?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications_completed?: number | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          current_streak_days?: number | null
          id?: string
          last_activity_date?: string | null
          lessons_completed?: number | null
          level?: number | null
          longest_streak?: number | null
          longest_streak_days?: number | null
          streak_multiplier?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vocab_card_state: {
        Row: {
          created_at: string
          difficulty: number
          due: string
          elapsed_days: number
          id: string
          lapses: number
          last_review: string | null
          learning_steps: number
          reps: number
          scheduled_days: number
          stability: number
          state: number
          updated_at: string
          user_id: string
          vocabulary_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number
          due?: string
          elapsed_days?: number
          id?: string
          lapses?: number
          last_review?: string | null
          learning_steps?: number
          reps?: number
          scheduled_days?: number
          stability?: number
          state?: number
          updated_at?: string
          user_id: string
          vocabulary_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number
          due?: string
          elapsed_days?: number
          id?: string
          lapses?: number
          last_review?: string | null
          learning_steps?: number
          reps?: number
          scheduled_days?: number
          stability?: number
          state?: number
          updated_at?: string
          user_id?: string
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocab_card_state_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      vocab_lesson_map: {
        Row: {
          created_at: string
          lesson_id: string
          vocabulary_id: string
        }
        Insert: {
          created_at?: string
          lesson_id: string
          vocabulary_id: string
        }
        Update: {
          created_at?: string
          lesson_id?: string
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocab_lesson_map_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vocab_lesson_map_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      vocab_review_log: {
        Row: {
          created_at: string
          difficulty: number | null
          due: string | null
          elapsed_days: number | null
          id: string
          last_elapsed_days: number | null
          rating: number
          review: string
          scheduled_days: number | null
          stability: number | null
          state: number
          user_id: string
          vocabulary_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: number | null
          due?: string | null
          elapsed_days?: number | null
          id?: string
          last_elapsed_days?: number | null
          rating: number
          review?: string
          scheduled_days?: number | null
          stability?: number | null
          state: number
          user_id: string
          vocabulary_id: string
        }
        Update: {
          created_at?: string
          difficulty?: number | null
          due?: string | null
          elapsed_days?: number | null
          id?: string
          last_elapsed_days?: number | null
          rating?: number
          review?: string
          scheduled_days?: number | null
          stability?: number | null
          state?: number
          user_id?: string
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocab_review_log_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary: {
        Row: {
          audio_asset_id: string | null
          cefr_level: string | null
          created_at: string
          example_sentence: string | null
          frequency_rank: number | null
          id: string
          ipa: string | null
          language: string
          lemma: string
          part_of_speech: string | null
          translation_l1: string | null
          updated_at: string
        }
        Insert: {
          audio_asset_id?: string | null
          cefr_level?: string | null
          created_at?: string
          example_sentence?: string | null
          frequency_rank?: number | null
          id?: string
          ipa?: string | null
          language?: string
          lemma: string
          part_of_speech?: string | null
          translation_l1?: string | null
          updated_at?: string
        }
        Update: {
          audio_asset_id?: string | null
          cefr_level?: string | null
          created_at?: string
          example_sentence?: string | null
          frequency_rank?: number | null
          id?: string
          ipa?: string | null
          language?: string
          lemma?: string
          part_of_speech?: string | null
          translation_l1?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_audio_asset_id_fkey"
            columns: ["audio_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json
          ref_id: string | null
          ref_type: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json
          ref_id?: string | null
          ref_type?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json
          ref_id?: string | null
          ref_type?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_send_text_message: {
        Args: { p_student_id: string }
        Returns: {
          can_send: boolean
          messages_limit: number
          messages_remaining: number
          messages_used: number
          reason: string
        }[]
      }
      can_start_premium_voice_session: {
        Args: { target_student_id: string }
        Returns: Json
      }
      can_start_voice_session: {
        Args: { target_student_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_max_attempts?: number
          p_user_id: string
          p_window_minutes?: number
        }
        Returns: boolean
      }
      consume_rate_limit: {
        Args: { p_bucket: string; p_daily_limit: number; p_user_id: string }
        Returns: boolean
      }
      generate_access_code:
        | {
            Args: {
              p_code_type: string
              p_expires_in_days?: number
              p_max_uses?: number
              p_target_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_code_type: string
              p_expires_at?: string
              p_max_uses?: number
              p_target_id: string
              p_target_name: string
            }
            Returns: string
          }
      get_user_last_sign_in: { Args: { user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_stt_usage: {
        Args: { p_minutes: number; p_student_id: string }
        Returns: undefined
      }
      increment_tts_token_usage: {
        Args: { p_tokens: number; p_user_id: string }
        Returns: undefined
      }
      increment_tts_usage: {
        Args: { p_minutes: number; p_student_id: string }
        Returns: undefined
      }
      increment_voice_usage: {
        Args: { p_minutes: number; p_user_id: string }
        Returns: undefined
      }
      initialize_student_usage_limits: {
        Args: { target_student_id: string }
        Returns: undefined
      }
      initialize_student_usage_limits_with_tier: {
        Args: { p_account_tier?: string; p_student_id: string }
        Returns: undefined
      }
      is_teacher_of_class: {
        Args: { _class: string; _teacher: string }
        Returns: boolean
      }
      is_teacher_of_student: {
        Args: { _student: string; _teacher: string }
        Returns: boolean
      }
      process_access_code: { Args: { p_code: string }; Returns: Json }
      recalculate_student_metrics: {
        Args: { target_student_id: string }
        Returns: undefined
      }
      same_school_as: {
        Args: { _target: string; _viewer: string }
        Returns: boolean
      }
      update_flashcard_mastery: {
        Args: { p_flashcard_id: string; p_quality: number }
        Returns: undefined
      }
      update_student_language_aggregate_metrics: {
        Args: { target_student_id: string }
        Returns: undefined
      }
      update_student_practice_counts: {
        Args: { target_student_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
