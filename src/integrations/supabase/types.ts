export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string
          data: Json | null
          description: string
          expires_at: string | null
          id: string
          insight_type: string
          is_acknowledged: boolean
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          description: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_acknowledged?: boolean
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_acknowledged?: boolean
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_study_goals: {
        Row: {
          completed_questions: number
          created_at: string
          date: string
          id: string
          is_completed: boolean
          study_plan_id: string
          subjects_focus: Json
          target_questions: number
          target_time_minutes: number
          time_spent_minutes: number
          updated_at: string
        }
        Insert: {
          completed_questions?: number
          created_at?: string
          date: string
          id?: string
          is_completed?: boolean
          study_plan_id: string
          subjects_focus?: Json
          target_questions?: number
          target_time_minutes?: number
          time_spent_minutes?: number
          updated_at?: string
        }
        Update: {
          completed_questions?: number
          created_at?: string
          date?: string
          id?: string
          is_completed?: boolean
          study_plan_id?: string
          subjects_focus?: Json
          target_questions?: number
          target_time_minutes?: number
          time_spent_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      mock_test_sessions: {
        Row: {
          accuracy_percentage: number | null
          created_at: string
          end_time: string | null
          id: string
          mock_test_id: string
          percentile: number | null
          questions: Json
          rank: number | null
          start_time: string
          status: string
          subject_scores: Json | null
          time_spent_seconds: number | null
          total_score: number | null
          updated_at: string
          user_answers: Json
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          created_at?: string
          end_time?: string | null
          id?: string
          mock_test_id: string
          percentile?: number | null
          questions: Json
          rank?: number | null
          start_time?: string
          status?: string
          subject_scores?: Json | null
          time_spent_seconds?: number | null
          total_score?: number | null
          updated_at?: string
          user_answers?: Json
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          created_at?: string
          end_time?: string | null
          id?: string
          mock_test_id?: string
          percentile?: number | null
          questions?: Json
          rank?: number | null
          start_time?: string
          status?: string
          subject_scores?: Json | null
          time_spent_seconds?: number | null
          total_score?: number | null
          updated_at?: string
          user_answers?: Json
          user_id?: string
        }
        Relationships: []
      }
      mock_tests: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_distribution: Json
          duration_minutes: number
          id: string
          is_active: boolean
          is_full_length: boolean
          question_distribution: Json
          syllabus_coverage: Json | null
          title: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_distribution: Json
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_full_length?: boolean
          question_distribution: Json
          syllabus_coverage?: Json | null
          title: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_distribution?: Json
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_full_length?: boolean
          question_distribution?: Json
          syllabus_coverage?: Json | null
          title?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          attempted_at: string
          id: string
          is_correct: boolean
          points_earned: number
          question_id: string
          time_taken_seconds: number | null
          user_answer: Json | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          is_correct: boolean
          points_earned?: number
          question_id: string
          time_taken_seconds?: number | null
          user_answer?: Json | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          is_correct?: boolean
          points_earned?: number
          question_id?: string
          time_taken_seconds?: number | null
          user_answer?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          last_practice_date: string | null
          streak_days: number
          target_year: number
          total_points: number
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          last_practice_date?: string | null
          streak_days?: number
          target_year?: number
          total_points?: number
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          last_practice_date?: string | null
          streak_days?: number
          target_year?: number
          total_points?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: Json
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string | null
          id: string
          is_active: boolean
          options: Json | null
          points: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          solution_steps: string | null
          time_limit_seconds: number | null
          topic_id: string
          updated_at: string
          year_appeared: number | null
        }
        Insert: {
          correct_answer: Json
          created_at?: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          is_active?: boolean
          options?: Json | null
          points?: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          solution_steps?: string | null
          time_limit_seconds?: number | null
          topic_id: string
          updated_at?: string
          year_appeared?: number | null
        }
        Update: {
          correct_answer?: Json
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          is_active?: boolean
          options?: Json | null
          points?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          solution_steps?: string | null
          time_limit_seconds?: number | null
          topic_id?: string
          updated_at?: string
          year_appeared?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          points_reward: number
        }
        Insert: {
          condition_type: string
          condition_value: number
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          points_reward?: number
        }
        Update: {
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          points_reward?: number
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          ai_recommendations: Json | null
          completion_percentage: number
          created_at: string
          current_week: number
          description: string | null
          difficulty_level: string
          id: string
          is_active: boolean
          subjects: Json
          target_exam_date: string | null
          title: string
          total_weeks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendations?: Json | null
          completion_percentage?: number
          created_at?: string
          current_week?: number
          description?: string | null
          difficulty_level: string
          id?: string
          is_active?: boolean
          subjects?: Json
          target_exam_date?: string | null
          title: string
          total_weeks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendations?: Json | null
          completion_percentage?: number
          created_at?: string
          current_week?: number
          description?: string | null
          difficulty_level?: string
          id?: string
          is_active?: boolean
          subjects?: Json
          target_exam_date?: string | null
          title?: string
          total_weeks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          code: Database["public"]["Enums"]["subject_type"]
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: Database["public"]["Enums"]["subject_type"]
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: Database["public"]["Enums"]["subject_type"]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          subject_id: string
          weightage: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          subject_id: string
          weightage?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          subject_id?: string
          weightage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          created_at: string
          date: string
          difficulty_performance: Json
          id: string
          peak_performance_time: string | null
          questions_attempted: number
          questions_correct: number
          strong_topics: Json
          study_streak: number
          subjects_practiced: Json
          time_spent_minutes: number
          updated_at: string
          user_id: string
          weak_topics: Json
        }
        Insert: {
          created_at?: string
          date: string
          difficulty_performance?: Json
          id?: string
          peak_performance_time?: string | null
          questions_attempted?: number
          questions_correct?: number
          strong_topics?: Json
          study_streak?: number
          subjects_practiced?: Json
          time_spent_minutes?: number
          updated_at?: string
          user_id: string
          weak_topics?: Json
        }
        Update: {
          created_at?: string
          date?: string
          difficulty_performance?: Json
          id?: string
          peak_performance_time?: string | null
          questions_attempted?: number
          questions_correct?: number
          strong_topics?: Json
          study_streak?: number
          subjects_practiced?: Json
          time_spent_minutes?: number
          updated_at?: string
          user_id?: string
          weak_topics?: Json
        }
        Relationships: []
      }
      user_rewards: {
        Row: {
          earned_at: string
          id: string
          reward_id: string
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          reward_id: string
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
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
      generate_study_recommendations: {
        Args: { target_user_id: string }
        Returns: {
          recommendation_type: string
          title: string
          description: string
          priority: string
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "content_creator" | "user"
      difficulty_level: "easy" | "medium" | "hard"
      question_type:
        | "single_correct"
        | "multiple_correct"
        | "numerical"
        | "assertion_reason"
      subject_type: "physics" | "chemistry" | "mathematics"
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
      app_role: ["admin", "content_creator", "user"],
      difficulty_level: ["easy", "medium", "hard"],
      question_type: [
        "single_correct",
        "multiple_correct",
        "numerical",
        "assertion_reason",
      ],
      subject_type: ["physics", "chemistry", "mathematics"],
    },
  },
} as const
