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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          learning_goal: string | null
          target_date: string | null
          target_level: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          learning_goal?: string | null
          target_date?: string | null
          target_level?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          learning_goal?: string | null
          target_date?: string | null
          target_level?: string | null
          updated_at?: string
        }
        Relationships: []
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
          listening_score: number | null
          overall_score: number | null
          progress_insights: string | null
          raw_extracted_data: Json | null
          reading_score: number | null
          recommendations: string[] | null
          speaking_score: number | null
          strengths: string[] | null
          test_date: string | null
          test_provider: string | null
          updated_at: string
          upload_date: string
          user_id: string
          weaknesses: string[] | null
          writing_score: number | null
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
          listening_score?: number | null
          overall_score?: number | null
          progress_insights?: string | null
          raw_extracted_data?: Json | null
          reading_score?: number | null
          recommendations?: string[] | null
          speaking_score?: number | null
          strengths?: string[] | null
          test_date?: string | null
          test_provider?: string | null
          updated_at?: string
          upload_date?: string
          user_id: string
          weaknesses?: string[] | null
          writing_score?: number | null
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
          listening_score?: number | null
          overall_score?: number | null
          progress_insights?: string | null
          raw_extracted_data?: Json | null
          reading_score?: number | null
          recommendations?: string[] | null
          speaking_score?: number | null
          strengths?: string[] | null
          test_date?: string | null
          test_provider?: string | null
          updated_at?: string
          upload_date?: string
          user_id?: string
          weaknesses?: string[] | null
          writing_score?: number | null
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
            referencedRelation: "classrooms"
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
      update_student_language_aggregate_metrics: {
        Args: { target_student_id: string }
        Returns: undefined
      }
    }
    Enums: {
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
    Enums: {
      district_consent_type: [
        "individual",
        "code_of_conduct",
        "written_permission",
      ],
    },
  },
} as const
