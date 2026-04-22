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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          client_id: string
          created_at: string
          id: string
          message: string | null
          requested_date: string
          status: Database["public"]["Enums"]["booking_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          message?: string | null
          requested_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          message?: string | null
          requested_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      fitness_metrics: {
        Row: {
          client_id: string
          created_at: string
          id: string
          metric: string
          recorded_at: string
          value: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          metric: string
          recorded_at?: string
          value: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          metric?: string
          recorded_at?: string
          value?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      trainer_data_access: {
        Row: {
          client_id: string
          created_at: string
          granted: boolean
          id: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          granted?: boolean
          id?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          granted?: boolean
          id?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainers: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string
          expertise: string[] | null
          hourly_rate: number | null
          id: string
          is_approved: boolean
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id?: string
          years_experience?: number | null
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
      workout_plan_days: {
        Row: {
          created_at: string
          day_index: number
          id: string
          notes: string | null
          plan_id: string
          title: string
          video_url: string | null
          workout_type: string | null
        }
        Insert: {
          created_at?: string
          day_index: number
          id?: string
          notes?: string | null
          plan_id: string
          title: string
          video_url?: string | null
          workout_type?: string | null
        }
        Update: {
          created_at?: string
          day_index?: number
          id?: string
          notes?: string | null
          plan_id?: string
          title?: string
          video_url?: string | null
          workout_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plan_exercises: {
        Row: {
          created_at: string
          day_id: string
          id: string
          name: string
          notes: string | null
          position: number
          reps: number | null
          rest_seconds: number | null
          sets: number | null
        }
        Insert: {
          created_at?: string
          day_id: string
          id?: string
          name: string
          notes?: string | null
          position?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
        }
        Update: {
          created_at?: string
          day_id?: string
          id?: string
          name?: string
          notes?: string | null
          position?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "workout_plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          client_id: string
          created_at: string
          id: string
          start_date: string | null
          title: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          start_date?: string | null
          title?: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          start_date?: string | null
          title?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          position: number
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          position?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          position?: number
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          avg_heart_rate: number | null
          calories: number | null
          client_id: string
          completion_ratio: number | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          max_heart_rate: number | null
          notes: string | null
          perceived_effort: number | null
          plan_day_id: string | null
          plan_day_index: number | null
          plan_id: string | null
          report_json: Json | null
          source: string
          started_at: string
          workout_id: string | null
          workout_efficiency: number | null
          workout_name: string
          workout_type: string | null
        }
        Insert: {
          avg_heart_rate?: number | null
          calories?: number | null
          client_id: string
          completion_ratio?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          max_heart_rate?: number | null
          notes?: string | null
          perceived_effort?: number | null
          plan_day_id?: string | null
          plan_day_index?: number | null
          plan_id?: string | null
          report_json?: Json | null
          source?: string
          started_at?: string
          workout_id?: string | null
          workout_efficiency?: number | null
          workout_name: string
          workout_type?: string | null
        }
        Update: {
          avg_heart_rate?: number | null
          calories?: number | null
          client_id?: string
          completion_ratio?: number | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          max_heart_rate?: number | null
          notes?: string | null
          perceived_effort?: number | null
          plan_day_id?: string | null
          plan_day_index?: number | null
          plan_id?: string | null
          report_json?: Json | null
          source?: string
          started_at?: string
          workout_id?: string | null
          workout_efficiency?: number | null
          workout_name?: string
          workout_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "workout_plan_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string | null
          estimated_duration_min: number | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_min?: number | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          estimated_duration_min?: number | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      trainer_has_access: {
        Args: { _client_id: string; _trainer_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "trainer" | "client"
      booking_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "cancelled"
        | "completed"
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
      app_role: ["admin", "trainer", "client"],
      booking_status: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "completed",
      ],
    },
  },
} as const
