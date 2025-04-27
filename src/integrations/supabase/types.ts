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
      access_codes: {
        Row: {
          code: string
          created_at: string | null
          generated_by: string | null
          id: string
          is_used: boolean | null
          role_type: string
          tier: number
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          generated_by?: string | null
          id?: string
          is_used?: boolean | null
          role_type?: string
          tier: number
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          generated_by?: string | null
          id?: string
          is_used?: boolean | null
          role_type?: string
          tier?: number
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      certification_attempts: {
        Row: {
          certification_type: string
          completed_at: string | null
          created_at: string | null
          id: string
          level: string
          score: number
          source_language: string | null
          target_language: string | null
          user_id: string
        }
        Insert: {
          certification_type: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          level: string
          score: number
          source_language?: string | null
          target_language?: string | null
          user_id: string
        }
        Update: {
          certification_type?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          level?: string
          score?: number
          source_language?: string | null
          target_language?: string | null
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
          active: boolean
          class_name: string
          code: string
          created_at: string
          id: string
          teacher_id: string
        }
        Insert: {
          active?: boolean
          class_name: string
          code: string
          created_at?: string
          id?: string
          teacher_id: string
        }
        Update: {
          active?: boolean
          class_name?: string
          code?: string
          created_at?: string
          id?: string
          teacher_id?: string
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
          {
            foreignKeyName: "classroom_memberships_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "student_usage_metrics"
            referencedColumns: ["classroom_id"]
          },
          {
            foreignKeyName: "classroom_memberships_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "teacher_students"
            referencedColumns: ["classroom_id"]
          },
        ]
      }
      district_settings: {
        Row: {
          consent_type:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at: string | null
          district_id: string | null
          id: string
          max_age: number | null
          min_age: number | null
          require_parental_consent: boolean | null
          updated_at: string | null
        }
        Insert: {
          consent_type?:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          max_age?: number | null
          min_age?: number | null
          require_parental_consent?: boolean | null
          updated_at?: string | null
        }
        Update: {
          consent_type?:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          max_age?: number | null
          min_age?: number | null
          require_parental_consent?: boolean | null
          updated_at?: string | null
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
          consent_type:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at: string | null
          district_id: string | null
          id: string
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          consent_date?: string | null
          consent_provided?: boolean | null
          consent_type?:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          consent_date?: string | null
          consent_provided?: boolean | null
          consent_type?:
            | Database["public"]["Enums"]["district_consent_type"]
            | null
          created_at?: string | null
          district_id?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      lesson_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          last_accessed: string | null
          lesson_id: number
          level: string
          progress: number
          updated_at: string
          user_id: string | null
          xp_earned: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          last_accessed?: string | null
          lesson_id: number
          level: string
          progress?: number
          updated_at?: string
          user_id?: string | null
          xp_earned?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          last_accessed?: string | null
          lesson_id?: number
          level?: string
          progress?: number
          updated_at?: string
          user_id?: string | null
          xp_earned?: number
        }
        Relationships: []
      }
      premium_voice_chat_sessions: {
        Row: {
          created_at: string
          id: string
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_end?: string | null
          session_start?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
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
          email?: string | null
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
          email?: string | null
          id?: string
          learning_goal?: string | null
          target_date?: string | null
          target_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      school_districts: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          learning_goal: string | null
          target_date: string | null
          target_level: string | null
          tier: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          learning_goal?: string | null
          target_date?: string | null
          target_level?: string | null
          tier?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          learning_goal?: string | null
          target_date?: string | null
          target_level?: string | null
          tier?: number | null
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      student_usage_metrics: {
        Row: {
          avg_certification_score: number | null
          certification_attempts: number | null
          class_name: string | null
          classroom_id: string | null
          completed_lessons: number | null
          last_certification: string | null
          last_lesson_progress: string | null
          last_voice_chat: string | null
          student_id: string | null
          teacher_id: string | null
          total_lessons: number | null
          voice_chat_minutes: number | null
          voice_chat_sessions: number | null
        }
        Relationships: []
      }
      teacher_students: {
        Row: {
          class_code: string | null
          class_name: string | null
          classroom_id: string | null
          joined_at: string | null
          student_email: string | null
          student_id: string | null
          student_name: string | null
          teacher_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_role: {
        Args: {
          target_user_id: string
          role_name: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      create_classroom: {
        Args: { class_name: string }
        Returns: Json
      }
      generate_class_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_student_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_teacher_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_class_member: {
        Args: { classroom_id: string }
        Returns: boolean
      }
      is_teacher: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_teacher_of_student: {
        Args: { student_id: string }
        Returns: boolean
      }
      join_classroom: {
        Args: { class_code: string }
        Returns: Json
      }
      make_myself_teacher: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "teacher" | "student"
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
      app_role: ["teacher", "student"],
      district_consent_type: [
        "individual",
        "code_of_conduct",
        "written_permission",
      ],
    },
  },
} as const
