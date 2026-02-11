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
      access_codes: {
        Row: {
          code: string
          code_type: string
          created_at: string
          created_by: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          target_id: string | null
        }
        Insert: {
          code: string
          code_type?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          target_id?: string | null
        }
        Update: {
          code?: string
          code_type?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          target_id?: string | null
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
          id: string
          metadata: Json | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          api_type?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          api_type?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          message_count: number | null
          messages: Json | null
          score: number | null
          status: string | null
          student_id: string
          submitted_at: string | null
          teacher_notes: string | null
          teacher_override_score: number | null
          updated_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          message_count?: number | null
          messages?: Json | null
          score?: number | null
          status?: string | null
          student_id: string
          submitted_at?: string | null
          teacher_notes?: string | null
          teacher_override_score?: number | null
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          message_count?: number | null
          messages?: Json | null
          score?: number | null
          status?: string | null
          student_id?: string
          submitted_at?: string | null
          teacher_notes?: string | null
          teacher_override_score?: number | null
          updated_at?: string
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
      classes: {
        Row: {
          class_code: string | null
          created_at: string
          id: string
          name: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          class_code?: string | null
          created_at?: string
          id?: string
          name: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          class_code?: string | null
          created_at?: string
          id?: string
          name?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      educational_data_access_audit: {
        Row: {
          access_purpose: string | null
          accessed_user_id: string
          accessor_user_id: string
          created_at: string
          data_type: string
          id: string
        }
        Insert: {
          access_purpose?: string | null
          accessed_user_id: string
          accessor_user_id: string
          created_at?: string
          data_type: string
          id?: string
        }
        Update: {
          access_purpose?: string | null
          accessed_user_id?: string
          accessor_user_id?: string
          created_at?: string
          data_type?: string
          id?: string
        }
        Relationships: []
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
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          native_language: string | null
          role: string | null
          school_id: string | null
          target_language: string | null
          updated_at: string
        }
        Insert: {
          account_tier?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          native_language?: string | null
          role?: string | null
          school_id?: string | null
          target_language?: string | null
          updated_at?: string
        }
        Update: {
          account_tier?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          native_language?: string | null
          role?: string | null
          school_id?: string | null
          target_language?: string | null
          updated_at?: string
        }
        Relationships: []
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
      student_enrollments: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          status: string | null
          student_id: string
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          status?: string | null
          student_id: string
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
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
      transcript_analyses: {
        Row: {
          analysis_data: Json | null
          cefr_level: string | null
          created_at: string
          id: string
          overall_score: number | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          cefr_level?: string | null
          created_at?: string
          id?: string
          overall_score?: number | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          cefr_level?: string | null
          created_at?: string
          id?: string
          overall_score?: number | null
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
          created_at: string
          current_streak: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          longest_streak: number | null
          streak_multiplier: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          streak_multiplier?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
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
      generate_access_code: {
        Args: {
          p_code_type: string
          p_expires_in_days?: number
          p_max_uses?: number
          p_target_id: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      process_access_code: { Args: { p_code: string }; Returns: Json }
      recalculate_student_metrics: {
        Args: { target_student_id: string }
        Returns: undefined
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
