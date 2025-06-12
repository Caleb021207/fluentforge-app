export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_coach_sessions: {
        Row: {
          coach_response: string
          conversation_context: Json | null
          created_at: string
          id: string
          prompt: string
          response_time_ms: number | null
          session_ts: string
          user_id: string
        }
        Insert: {
          coach_response: string
          conversation_context?: Json | null
          created_at?: string
          id?: string
          prompt: string
          response_time_ms?: number | null
          session_ts?: string
          user_id: string
        }
        Update: {
          coach_response?: string
          conversation_context?: Json | null
          created_at?: string
          id?: string
          prompt?: string
          response_time_ms?: number | null
          session_ts?: string
          user_id?: string
        }
        Relationships: []
      }
      api_calls_tracking: {
        Row: {
          call_type: string
          created_at: string
          id: string
          language: string | null
          text_length: number | null
          user_id: string
        }
        Insert: {
          call_type: string
          created_at?: string
          id?: string
          language?: string | null
          text_length?: number | null
          user_id: string
        }
        Update: {
          call_type?: string
          created_at?: string
          id?: string
          language?: string | null
          text_length?: number | null
          user_id?: string
        }
        Relationships: []
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
      certification_transcripts: {
        Row: {
          ai_responses: Json
          analysis_data: Json | null
          attempt_id: string
          created_at: string
          id: string
          user_id: string
          user_transcripts: Json
        }
        Insert: {
          ai_responses?: Json
          analysis_data?: Json | null
          attempt_id: string
          created_at?: string
          id?: string
          user_id: string
          user_transcripts?: Json
        }
        Update: {
          ai_responses?: Json
          analysis_data?: Json | null
          attempt_id?: string
          created_at?: string
          id?: string
          user_id?: string
          user_transcripts?: Json
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
      classroom_codes: {
        Row: {
          active: boolean | null
          class_name: string
          code: string
          created_at: string
          description: string | null
          id: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          class_name: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          class_name?: string
          code?: string
          created_at?: string
          description?: string | null
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
            referencedRelation: "classroom_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coach_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_insights: {
        Row: {
          created_at: string
          id: string
          insight_text: string
          insight_type: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          insight_text: string
          insight_type?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          insight_text?: string
          insight_type?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_insights_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coach_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_score_reports: {
        Row: {
          cefr_level: string | null
          created_at: string
          id: string
          is_first_score: boolean | null
          overall_score: number | null
          recommendations: Json | null
          section_scores: Json | null
          session_id: string | null
          updated_at: string
          upload_date: string
          uploaded_file_data: Json
          user_id: string
        }
        Insert: {
          cefr_level?: string | null
          created_at?: string
          id?: string
          is_first_score?: boolean | null
          overall_score?: number | null
          recommendations?: Json | null
          section_scores?: Json | null
          session_id?: string | null
          updated_at?: string
          upload_date?: string
          uploaded_file_data?: Json
          user_id: string
        }
        Update: {
          cefr_level?: string | null
          created_at?: string
          id?: string
          is_first_score?: boolean | null
          overall_score?: number | null
          recommendations?: Json | null
          section_scores?: Json | null
          session_id?: string | null
          updated_at?: string
          upload_date?: string
          uploaded_file_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      coach_sessions: {
        Row: {
          coaching_style: Json | null
          created_at: string
          ended_at: string | null
          id: string
          messages: Json
          native_language: string
          session_summary: string | null
          target_language: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coaching_style?: Json | null
          created_at?: string
          ended_at?: string | null
          id?: string
          messages?: Json
          native_language?: string
          session_summary?: string | null
          target_language?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coaching_style?: Json | null
          created_at?: string
          ended_at?: string | null
          id?: string
          messages?: Json
          native_language?: string
          session_summary?: string | null
          target_language?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversation_ratings: {
        Row: {
          accuracy_score: number
          analysis_data: Json | null
          complexity_score: number
          created_at: string
          id: string
          message_count: number
          session_id: string
          session_type: string
          user_id: string
        }
        Insert: {
          accuracy_score: number
          analysis_data?: Json | null
          complexity_score: number
          created_at?: string
          id?: string
          message_count?: number
          session_id: string
          session_type: string
          user_id: string
        }
        Update: {
          accuracy_score?: number
          analysis_data?: Json | null
          complexity_score?: number
          created_at?: string
          id?: string
          message_count?: number
          session_id?: string
          session_type?: string
          user_id?: string
        }
        Relationships: []
      }
      district_settings: {
        Row: {
          created_at: string | null
          district_id: string
          id: string
          max_age: number | null
          min_age: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district_id: string
          id?: string
          max_age?: number | null
          min_age?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district_id?: string
          id?: string
          max_age?: number | null
          min_age?: number | null
          updated_at?: string | null
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
          consent_provided: boolean | null
          consent_type: string | null
          created_at: string | null
          district_id: string
          id: string
          user_id: string
        }
        Insert: {
          consent_date?: string | null
          consent_provided?: boolean | null
          consent_type?: string | null
          created_at?: string | null
          district_id: string
          id?: string
          user_id: string
        }
        Update: {
          consent_date?: string | null
          consent_provided?: boolean | null
          consent_type?: string | null
          created_at?: string | null
          district_id?: string
          id?: string
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
      learning_analytics: {
        Row: {
          accuracy_score: number | null
          complexity_score: number | null
          created_at: string
          date: string
          fluency_score: number | null
          id: string
          practice_minutes: number | null
          total_conversations: number | null
          updated_at: string
          user_id: string
          vocab_count: number | null
        }
        Insert: {
          accuracy_score?: number | null
          complexity_score?: number | null
          created_at?: string
          date: string
          fluency_score?: number | null
          id?: string
          practice_minutes?: number | null
          total_conversations?: number | null
          updated_at?: string
          user_id: string
          vocab_count?: number | null
        }
        Update: {
          accuracy_score?: number | null
          complexity_score?: number | null
          created_at?: string
          date?: string
          fluency_score?: number | null
          id?: string
          practice_minutes?: number | null
          total_conversations?: number | null
          updated_at?: string
          user_id?: string
          vocab_count?: number | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          last_accessed: string | null
          lesson_id: number
          level: string
          progress: number | null
          updated_at: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          lesson_id: number
          level: string
          progress?: number | null
          updated_at?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          lesson_id?: number
          level?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          learning_goal: string | null
          target_date: string | null
          target_level: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          learning_goal?: string | null
          target_date?: string | null
          target_level?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          learning_goal?: string | null
          target_date?: string | null
          target_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pronunciation_scores: {
        Row: {
          completeness_score: number
          created_at: string
          fluency_score: number
          id: string
          phrase_text: string
          pronunciation_score: number
          session_id: string | null
          user_id: string
        }
        Insert: {
          completeness_score: number
          created_at?: string
          fluency_score: number
          id?: string
          phrase_text: string
          pronunciation_score: number
          session_id?: string | null
          user_id: string
        }
        Update: {
          completeness_score?: number
          created_at?: string
          fluency_score?: number
          id?: string
          phrase_text?: string
          pronunciation_score?: number
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      school_districts: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
          avg_accuracy_score: number | null
          avg_complexity_score: number | null
          avg_conversation_complexity: number | null
          avg_grammar_accuracy: number | null
          certification_attempts: number | null
          completed_lessons: number | null
          created_at: string
          highest_certification_score: number | null
          id: string
          language_metrics_count: number | null
          last_activity: string | null
          premium_voice_calls: number | null
          premium_voice_minutes_remaining: number | null
          premium_voice_minutes_used: number | null
          premium_voice_sessions: number | null
          student_id: string
          text_practice_calls: number | null
          total_lessons: number | null
          updated_at: string
        }
        Insert: {
          avg_accuracy_score?: number | null
          avg_complexity_score?: number | null
          avg_conversation_complexity?: number | null
          avg_grammar_accuracy?: number | null
          certification_attempts?: number | null
          completed_lessons?: number | null
          created_at?: string
          highest_certification_score?: number | null
          id?: string
          language_metrics_count?: number | null
          last_activity?: string | null
          premium_voice_calls?: number | null
          premium_voice_minutes_remaining?: number | null
          premium_voice_minutes_used?: number | null
          premium_voice_sessions?: number | null
          student_id: string
          text_practice_calls?: number | null
          total_lessons?: number | null
          updated_at?: string
        }
        Update: {
          avg_accuracy_score?: number | null
          avg_complexity_score?: number | null
          avg_conversation_complexity?: number | null
          avg_grammar_accuracy?: number | null
          certification_attempts?: number | null
          completed_lessons?: number | null
          created_at?: string
          highest_certification_score?: number | null
          id?: string
          language_metrics_count?: number | null
          last_activity?: string | null
          premium_voice_calls?: number | null
          premium_voice_minutes_remaining?: number | null
          premium_voice_minutes_used?: number | null
          premium_voice_sessions?: number | null
          student_id?: string
          text_practice_calls?: number | null
          total_lessons?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          last_pronunciation_session: string | null
          last_voice_session: string | null
          last_voice_timer_reset: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
          weekly_pronunciation_sessions_used: number | null
          weekly_voice_minutes_remaining: number | null
          weekly_voice_minutes_used: number | null
          weekly_voice_sessions_used: number | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_pronunciation_session?: string | null
          last_voice_session?: string | null
          last_voice_timer_reset?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
          weekly_pronunciation_sessions_used?: number | null
          weekly_voice_minutes_remaining?: number | null
          weekly_voice_minutes_used?: number | null
          weekly_voice_sessions_used?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_pronunciation_session?: string | null
          last_voice_session?: string | null
          last_voice_timer_reset?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
          weekly_pronunciation_sessions_used?: number | null
          weekly_voice_minutes_remaining?: number | null
          weekly_voice_minutes_used?: number | null
          weekly_voice_sessions_used?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          accent: string | null
          ai_coach_enabled: boolean | null
          created_at: string
          id: string
          target_language: string | null
          ui_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent?: string | null
          ai_coach_enabled?: boolean | null
          created_at?: string
          id?: string
          target_language?: string | null
          ui_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent?: string | null
          ai_coach_enabled?: boolean | null
          created_at?: string
          id?: string
          target_language?: string | null
          ui_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      class_student_metrics: {
        Row: {
          classroom_id: string | null
          last_activity: string | null
          premium_voice_calls: number | null
          student_email: string | null
          student_id: string | null
          student_name: string | null
          text_practice_calls: number | null
        }
        Relationships: [
          {
            foreignKeyName: "classroom_memberships_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classroom_codes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_classroom: {
        Args: { class_name: string }
        Returns: Json
      }
      join_classroom: {
        Args: { class_code: string }
        Returns: Json
      }
      recalculate_student_metrics: {
        Args: { target_student_id: string }
        Returns: undefined
      }
      reset_weekly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_weekly_voice_timer: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_student_language_aggregate_metrics: {
        Args: { target_student_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
