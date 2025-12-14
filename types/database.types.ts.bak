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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      feedback_grammar_items: {
        Row: {
          created_at: string | null
          description: string
          feedback_id: string
          grammar_topic_id: string | null
          id: string
          tags: string[] | null
        }
        Insert: {
          created_at?: string | null
          description: string
          feedback_id: string
          grammar_topic_id?: string | null
          id?: string
          tags?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string
          feedback_id?: string
          grammar_topic_id?: string | null
          id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_grammar_items_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedbacks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_grammar_items_grammar_topic_id_fkey"
            columns: ["grammar_topic_id"]
            isOneToOne: false
            referencedRelation: "grammar_topics"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          clarity_feedback: string | null
          created_at: string | null
          enhanced_version: string | null
          fixed_typo: string | null
          id: string
          ideas_feedback: string | null
          profile_id: string
          source_id: string
          source_type: Database["public"]["Enums"]["feedback_source_type"]
          summary: string | null
          vocabulary_feedback: string | null
        }
        Insert: {
          clarity_feedback?: string | null
          created_at?: string | null
          enhanced_version?: string | null
          fixed_typo?: string | null
          id?: string
          ideas_feedback?: string | null
          profile_id: string
          source_id: string
          source_type: Database["public"]["Enums"]["feedback_source_type"]
          summary?: string | null
          vocabulary_feedback?: string | null
        }
        Update: {
          clarity_feedback?: string | null
          created_at?: string | null
          enhanced_version?: string | null
          fixed_typo?: string | null
          id?: string
          ideas_feedback?: string | null
          profile_id?: string
          source_id?: string
          source_type?: Database["public"]["Enums"]["feedback_source_type"]
          summary?: string | null
          vocabulary_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_category: {
        Row: {
          description: string | null
          image_cover: string | null
          name: string
        }
        Insert: {
          description?: string | null
          image_cover?: string | null
          name: string
        }
        Update: {
          description?: string | null
          image_cover?: string | null
          name?: string
        }
        Relationships: []
      }
      frameworks: {
        Row: {
          category: string
          content: string
          cover_image: string | null
          description: string | null
          is_default: boolean | null
          is_pinned: boolean | null
          name: string
          profile_id: string | null
          source: string | null
        }
        Insert: {
          category: string
          content: string
          cover_image?: string | null
          description?: string | null
          is_default?: boolean | null
          is_pinned?: boolean | null
          name: string
          profile_id?: string | null
          source?: string | null
        }
        Update: {
          category?: string
          content?: string
          cover_image?: string | null
          description?: string | null
          is_default?: boolean | null
          is_pinned?: boolean | null
          name?: string
          profile_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "frameworks_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "framework_category"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "frameworks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fsrs_review_logs: {
        Row: {
          card_id: string | null
          created_at: string | null
          difficulty_before: number | null
          elapsed_days: number | null
          id: string
          rating: string | null
          review_date: string | null
          scheduled_days: number | null
          stability_before: number | null
          state: string | null
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          difficulty_before?: number | null
          elapsed_days?: number | null
          id?: string
          rating?: string | null
          review_date?: string | null
          scheduled_days?: number | null
          stability_before?: number | null
          state?: string | null
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          difficulty_before?: number | null
          elapsed_days?: number | null
          id?: string
          rating?: string | null
          review_date?: string | null
          scheduled_days?: number | null
          stability_before?: number | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fsrs_review_logs_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_status"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_topics: {
        Row: {
          description: string | null
          id: string
          level: string | null
          topic_id: string | null
          topic_name: string
        }
        Insert: {
          description?: string | null
          id?: string
          level?: string | null
          topic_id?: string | null
          topic_name: string
        }
        Update: {
          description?: string | null
          id?: string
          level?: string | null
          topic_id?: string | null
          topic_name?: string
        }
        Relationships: []
      }
      journal_tag: {
        Row: {
          journal_id: string
          tag_id: string
        }
        Insert: {
          journal_id: string
          tag_id: string
        }
        Update: {
          journal_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_tag_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "journal_tags"
            referencedColumns: ["name"]
          },
        ]
      }
      journal_tags: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      journals: {
        Row: {
          content: string
          created_at: string | null
          enhanced_version: string | null
          id: string
          is_draft: boolean
          journal_date: string | null
          summary: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          enhanced_version?: string | null
          id?: string
          is_draft?: boolean
          journal_date?: string | null
          summary?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          enhanced_version?: string | null
          id?: string
          is_draft?: boolean
          journal_date?: string | null
          summary?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journals_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["learning_event_type"]
          id: string
          metadata: Json | null
          profile_id: string
          reference_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["learning_event_type"]
          id?: string
          metadata?: Json | null
          profile_id: string
          reference_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["learning_event_type"]
          id?: string
          metadata?: Json | null
          profile_id?: string
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          last_update: string | null
          profile_id: string
          streak_days: number | null
          total_journals_completed: number | null
          total_words_learned: number | null
        }
        Insert: {
          last_update?: string | null
          profile_id: string
          streak_days?: number | null
          total_journals_completed?: number | null
          total_words_learned?: number | null
        }
        Update: {
          last_update?: string | null
          profile_id?: string
          streak_days?: number | null
          total_journals_completed?: number | null
          total_words_learned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_progress"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          daily_journal_goal: number | null
          daily_review_goal: number | null
          daily_roleplay_goal: number | null
          daily_vocab_goal: number | null
          english_challenges: string[] | null
          english_improvement_reasons: string[] | null
          english_level: string | null
          id: string
          journaling_challenges: string[] | null
          journaling_reasons: string[] | null
          name: string | null
          onboarding_completed: boolean | null
          style: string | null
          updated_at: string | null
        }
        Insert: {
          daily_journal_goal?: number | null
          daily_review_goal?: number | null
          daily_roleplay_goal?: number | null
          daily_vocab_goal?: number | null
          english_challenges?: string[] | null
          english_improvement_reasons?: string[] | null
          english_level?: string | null
          id: string
          journaling_challenges?: string[] | null
          journaling_reasons?: string[] | null
          name?: string | null
          onboarding_completed?: boolean | null
          style?: string | null
          updated_at?: string | null
        }
        Update: {
          daily_journal_goal?: number | null
          daily_review_goal?: number | null
          daily_roleplay_goal?: number | null
          daily_vocab_goal?: number | null
          english_challenges?: string[] | null
          english_improvement_reasons?: string[] | null
          english_level?: string | null
          id?: string
          journaling_challenges?: string[] | null
          journaling_reasons?: string[] | null
          name?: string | null
          onboarding_completed?: boolean | null
          style?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roleplay_topics: {
        Row: {
          name: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: []
      }
      roleplays: {
        Row: {
          ai_role: string | null
          context: string
          created_at: string | null
          id: string
          image: string | null
          level: string | null
          name: string
          partner_prompt: string | null
          starter_message: string
          task: string | null
          topic: string | null
        }
        Insert: {
          ai_role?: string | null
          context: string
          created_at?: string | null
          id?: string
          image?: string | null
          level?: string | null
          name: string
          partner_prompt?: string | null
          starter_message: string
          task?: string | null
          topic?: string | null
        }
        Update: {
          ai_role?: string | null
          context?: string
          created_at?: string | null
          id?: string
          image?: string | null
          level?: string | null
          name?: string
          partner_prompt?: string | null
          starter_message?: string
          task?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roleplays_topic_fkey"
            columns: ["topic"]
            isOneToOne: false
            referencedRelation: "roleplay_topics"
            referencedColumns: ["name"]
          },
        ]
      }
      sessions: {
        Row: {
          conversation_json: Json | null
          created_at: string | null
          feedback: string | null
          highlights: string[] | null
          pinned: boolean | null
          profile_id: string
          roleplay_id: string | null
          session_id: string
        }
        Insert: {
          conversation_json?: Json | null
          created_at?: string | null
          feedback?: string | null
          highlights?: string[] | null
          pinned?: boolean | null
          profile_id: string
          roleplay_id?: string | null
          session_id?: string
        }
        Update: {
          conversation_json?: Json | null
          created_at?: string | null
          feedback?: string | null
          highlights?: string[] | null
          pinned?: boolean | null
          profile_id?: string
          roleplay_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_roleplay_id_fkey"
            columns: ["roleplay_id"]
            isOneToOne: false
            referencedRelation: "roleplays"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          current_streak: number | null
          last_active_date: string | null
          longest_streak: number | null
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          current_streak?: number | null
          last_active_date?: string | null
          longest_streak?: number | null
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          current_streak?: number | null
          last_active_date?: string | null
          longest_streak?: number | null
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vocab_topics: {
        Row: {
          description: string | null
          id: string
          level: string | null
          topic_id: string | null
          topic_name: string
        }
        Insert: {
          description?: string | null
          id?: string
          level?: string | null
          topic_id?: string | null
          topic_name: string
        }
        Update: {
          description?: string | null
          id?: string
          level?: string | null
          topic_id?: string | null
          topic_name?: string
        }
        Relationships: []
      }
      vocabulary: {
        Row: {
          created_at: string | null
          example: string | null
          id: string
          is_starred: boolean | null
          meaning: string
          set_id: string
          source_id: string | null
          updated_at: string | null
          word: string
        }
        Insert: {
          created_at?: string | null
          example?: string | null
          id?: string
          is_starred?: boolean | null
          meaning: string
          set_id: string
          source_id?: string | null
          updated_at?: string | null
          word: string
        }
        Update: {
          created_at?: string | null
          example?: string | null
          id?: string
          is_starred?: boolean | null
          meaning?: string
          set_id?: string
          source_id?: string | null
          updated_at?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_set"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_set: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_starred: boolean | null
          profile_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_starred?: boolean | null
          profile_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_starred?: boolean | null
          profile_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_set_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_status: {
        Row: {
          difficulty: number | null
          ease_factor: number
          elapsed_days: number | null
          id: string
          interval: number
          lapses: number | null
          last_review_at: string | null
          learning_steps: number | null
          next_review_at: string | null
          repetitions: number
          scheduled_days: number | null
          stability: number | null
          state: string | null
          updated_at: string | null
          vocabulary_id: string
        }
        Insert: {
          difficulty?: number | null
          ease_factor?: number
          elapsed_days?: number | null
          id?: string
          interval?: number
          lapses?: number | null
          last_review_at?: string | null
          learning_steps?: number | null
          next_review_at?: string | null
          repetitions?: number
          scheduled_days?: number | null
          stability?: number | null
          state?: string | null
          updated_at?: string | null
          vocabulary_id: string
        }
        Update: {
          difficulty?: number | null
          ease_factor?: number
          elapsed_days?: number | null
          id?: string
          interval?: number
          lapses?: number | null
          last_review_at?: string | null
          learning_steps?: number | null
          next_review_at?: string | null
          repetitions?: number
          scheduled_days?: number | null
          stability?: number | null
          state?: string | null
          updated_at?: string | null
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_status_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      grammar_feedback_view: {
        Row: {
          created_at: string | null
          error_description: string | null
          profile_id: string | null
          tags: string[] | null
          topic_level: string | null
          topic_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_flashcard_set_stats: {
        Args: { user_uuid: string }
        Returns: {
          flashcards_due: number
          set_id: string
          title: string
          total_flashcards: number
        }[]
      }
      get_flashcard_sets:
        | {
            Args: { profile: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.get_flashcard_sets(profile => text), public.get_flashcard_sets(profile => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"[]
          }
        | {
            Args: { profile: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.get_flashcard_sets(profile => text), public.get_flashcard_sets(profile => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"[]
          }
      get_flashcards_for_review: {
        Args: { set_uuid: string; user_uuid: string }
        Returns: {
          ease_factor: number
          example: string
          flashcard_id: string
          interval: number
          meaning: string
          next_review_at: string
          state: string
          word: string
        }[]
      }
      get_journal_stats: {
        Args: { user_uuid: string }
        Returns: {
          current_streak: number
          total_entries: number
        }[]
      }
      get_journals: {
        Args: { _user_id: string }
        Returns: {
          content: string
          id: string
          journal_date: string
          title: string
        }[]
      }
      get_vocabulary_for_review: {
        Args: { set_uuid: string; user_uuid: string }
        Returns: {
          ease_factor: number
          example: string
          interval: number
          meaning: string
          next_review_at: string
          state: string
          vocabulary_id: string
          word: string
        }[]
      }
      get_vocabulary_set_stats: {
        Args: { user_uuid: string }
        Returns: {
          set_id: string
          title: string
          total_vocabulary: number
          vocabulary_due: number
        }[]
      }
      get_vocabulary_sets: {
        Args: { profile: string }
        Returns: {
          set_id: string
          set_title: string
          total_vocabulary: number
          vocabulary_due: number
        }[]
      }
      insert_flashcards_into_journal_vocab: {
        Args: { p_flashcards: Json; p_user_id: string }
        Returns: {
          example: string
          flashcard_id: string
          meaning: string
          word: string
        }[]
      }
      insert_vocabulary_into_journal_vocab: {
        Args: { p_user_id: string; p_vocabulary: Json }
        Returns: {
          example: string
          meaning: string
          vocabulary_id: string
          word: string
        }[]
      }
      record_learning_event: {
        Args: {
          p_event_type: Database["public"]["Enums"]["learning_event_type"]
          p_metadata?: Json
          p_profile_id: string
          p_reference_id: string
        }
        Returns: undefined
      }
      test_get_journal_vocab_set_id:
        | {
            Args: { p_user_id: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.test_get_journal_vocab_set_id(p_user_id => text), public.test_get_journal_vocab_set_id(p_user_id => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { p_user_id: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.test_get_journal_vocab_set_id(p_user_id => text), public.test_get_journal_vocab_set_id(p_user_id => uuid). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      update_flashcard_review: {
        Args: {
          card_id: string
          difficulty: number
          ease_factor: number
          interval: number
          next_review: string
          rating: string
          stability: number
          user_uuid: string
        }
        Returns: undefined
      }
      update_vocabulary_review: {
        Args: {
          card_id: string
          difficulty: number
          ease_factor: number
          interval: number
          next_review: string
          rating: string
          stability: number
          user_uuid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      feedback_source_type: "journal" | "roleplay"
      learning_event_type:
        | "vocab_created"
        | "vocab_reviewed"
        | "journal_created"
        | "roleplay_completed"
        | "session_active"
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
      feedback_source_type: ["journal", "roleplay"],
      learning_event_type: [
        "vocab_created",
        "vocab_reviewed",
        "journal_created",
        "roleplay_completed",
        "session_active",
      ],
    },
  },
} as const
