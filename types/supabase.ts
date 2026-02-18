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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string
          end_time: string
          id: number
          start_time: string
          tutor_id: number
          updated_at: string
          week_day: Database["public"]["Enums"]["week_day"]
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: number
          start_time: string
          tutor_id: number
          updated_at?: string
          week_day: Database["public"]["Enums"]["week_day"]
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: number
          start_time?: string
          tutor_id?: number
          updated_at?: string
          week_day?: Database["public"]["Enums"]["week_day"]
        }
        Relationships: [
          {
            foreignKeyName: "availability_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_balances: {
        Row: {
          amount_available: number
          amount_pending: number
          id: number
          parent_id: number
          updated_at: string
        }
        Insert: {
          amount_available?: number
          amount_pending?: number
          id?: number
          parent_id: number
          updated_at?: string
        }
        Update: {
          amount_available?: number
          amount_pending?: number
          id?: number
          parent_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_balances_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: true
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: number
          parent_id: number
          session_id: number | null
          student_id: number
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: number
          parent_id: number
          session_id?: number | null
          student_id: number
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: number
          parent_id?: number
          session_id?: number | null
          student_id?: number
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          attendance_score: number | null
          confidence_score: number | null
          homework_completed: boolean
          id: number
          recorded_at: string
          session_id: number | null
          student_id: number | null
          tutor_comments: string | null
        }
        Insert: {
          attendance_score?: number | null
          confidence_score?: number | null
          homework_completed?: boolean
          id?: number
          recorded_at?: string
          session_id?: number | null
          student_id?: number | null
          tutor_comments?: string | null
        }
        Update: {
          attendance_score?: number | null
          confidence_score?: number | null
          homework_completed?: boolean
          id?: number
          recorded_at?: string
          session_id?: number | null
          student_id?: number | null
          tutor_comments?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          billing_address: string | null
          id: number
          notification_preferences: string | null
          user_id: number
        }
        Insert: {
          billing_address?: string | null
          id?: number
          notification_preferences?: string | null
          user_id: number
        }
        Update: {
          billing_address?: string | null
          id?: number
          notification_preferences?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "parents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_reports: {
        Row: {
          created_at: string
          homework_assigned: string | null
          id: number
          session_id: number | null
          student_id: number
          student_notes: string | null
          student_performance: number | null
          topics: string | null
          tutor_id: number
          tutor_notes: string | null
        }
        Insert: {
          created_at?: string
          homework_assigned?: string | null
          id?: number
          session_id?: number | null
          student_id: number
          student_notes?: string | null
          student_performance?: number | null
          topics?: string | null
          tutor_id: number
          tutor_notes?: string | null
        }
        Update: {
          created_at?: string
          homework_assigned?: string | null
          id?: number
          session_id?: number | null
          student_id?: number
          student_notes?: string | null
          student_performance?: number | null
          topics?: string | null
          tutor_id?: number
          tutor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_reports_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          ends_at: string
          id: number
          parent_id: number
          scheduled_at: string
          slot_units: number
          status: Database["public"]["Enums"]["session_status"]
          student_id: number
          subject_id: number
          tutor_id: number
        }
        Insert: {
          ends_at: string
          id?: number
          parent_id: number
          scheduled_at: string
          slot_units?: number
          status?: Database["public"]["Enums"]["session_status"]
          student_id: number
          subject_id: number
          tutor_id: number
        }
        Update: {
          ends_at?: string
          id?: number
          parent_id?: number
          scheduled_at?: string
          slot_units?: number
          status?: Database["public"]["Enums"]["session_status"]
          student_id?: number
          subject_id?: number
          tutor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string | null
          grade: string | null
          id: number
          learning_goals: string | null
          parent_id: number | null
          user_id: number
        }
        Insert: {
          birth_date?: string | null
          grade?: string | null
          id?: number
          learning_goals?: string | null
          parent_id?: number | null
          user_id: number
        }
        Update: {
          birth_date?: string | null
          grade?: string | null
          id?: number
          learning_goals?: string | null
          parent_id?: number | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          category: string
          id: number
          tutor_id: number
        }
        Insert: {
          category: string
          id?: number
          tutor_id: number
        }
        Update: {
          category?: string
          id?: number
          tutor_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutors"
            referencedColumns: ["id"]
          },
        ]
      }
      tutors: {
        Row: {
          bio: string | null
          education: string | null
          id: number
          tagline: string | null
          user_id: number
          verified: boolean
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          education?: string | null
          id?: number
          tagline?: string | null
          user_id: number
          verified?: boolean
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          education?: string | null
          id?: number
          tagline?: string | null
          user_id?: number
          verified?: boolean
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tutors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: number
          is_active: boolean
          last_login: string | null
          last_name: string | null
          phone: string | null
          profile_pic: string | null
          role: number | null
          timezone: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: number
          is_active?: boolean
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          profile_pic?: string | null
          role?: number | null
          timezone?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: number
          is_active?: boolean
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          profile_pic?: string | null
          role?: number | null
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      session_status:
        | "Scheduled"
        | "Completed"
        | "Canceled"
        | "No-show"
        | "Rescheduled"
      transaction_type:
        | "Purchase"
        | "Session Debit"
        | "Refund"
        | "Adjustment"
        | "Cancellation Fee"
      week_day:
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday"
        | "Sunday"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      session_status: [
        "Scheduled",
        "Completed",
        "Canceled",
        "No-show",
        "Rescheduled",
      ],
      transaction_type: [
        "Purchase",
        "Session Debit",
        "Refund",
        "Adjustment",
        "Cancellation Fee",
      ],
      week_day: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
  },
} as const
