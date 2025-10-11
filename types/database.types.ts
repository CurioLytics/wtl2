export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      journals: {
        Row: {
          id: string
          user_id: string
          content: string
          journal_date: string | null
          title: string | null
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          journal_date?: string | null
          title?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          journal_date?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_template: {
        Row: {
          id: string
          name: string
          content: string | null
          tag: string[] | null
          other: string | null
          category: string | null
        }
        Insert: {
          id?: string
          name: string
          content?: string | null
          tag?: string[] | null
          other?: string | null
          category?: string | null
        }
        Update: {
          id?: string
          name?: string
          content?: string | null
          tag?: string[] | null
          other?: string | null
          category?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          english_level: string | null
          goals: string[] | null
          writing_types: string[] | null
          updated_at: string | null
          onboarding_completed: boolean
          pinned_template_ids: string[] | null
        }
        Insert: {
          id: string
          name?: string | null
          english_level?: string | null
          goals?: string[] | null
          writing_types?: string[] | null
          updated_at?: string | null
          onboarding_completed?: boolean
          pinned_template_ids?: string[] | null
        }
        Update: {
          id?: string
          name?: string | null
          english_level?: string | null
          goals?: string[] | null
          writing_types?: string[] | null
          updated_at?: string | null
          onboarding_completed?: boolean
          pinned_template_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcard_set: {
        Row: {
          id: string
          title: string
          created_at: string | null
          profile_id: string | null
        }
        Insert: {
          id?: string
          title: string
          created_at?: string | null
          profile_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          created_at?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_set_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcard: {
        Row: {
          id: string
          set_id: string
          front: string
          back: string
          created_at: string | null
        }
        Insert: {
          id?: string
          set_id: string
          front: string
          back: string
          created_at?: string | null
        }
        Update: {
          id?: string
          set_id?: string
          front?: string
          back?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_set_id_fkey"
            columns: ["set_id"]
            referencedRelation: "flashcard_set"
            referencedColumns: ["id"]
          }
        ]
      }
      flashcard_status: {
        Row: {
          id: string
          flashcard_id: string
          interval: number
          repetitions: number
          ease_factor: number
          next_review_at: string | null
          last_review_at: string | null
        }
        Insert: {
          id?: string
          flashcard_id: string
          interval?: number
          repetitions?: number
          ease_factor?: number
          next_review_at?: string | null
          last_review_at?: string | null
        }
        Update: {
          id?: string
          flashcard_id?: string
          interval?: number
          repetitions?: number
          ease_factor?: number
          next_review_at?: string | null
          last_review_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_status_flashcard_id_fkey"
            columns: ["flashcard_id"]
            referencedRelation: "flashcard"
            referencedColumns: ["id"]
          }
        ]
      }
      roleplay_scenario: {
        Row: {
          id: string
          name: string
          context: string
          starter_message: string
          guide: string | null
          level: string | null
          topic: string | null
          created_at: string | null
          role1: string | null
        }
        Insert: {
          id?: string
          name: string
          context: string
          starter_message: string
          guide?: string | null
          level?: string | null
          topic?: string | null
          created_at?: string | null
          role1?: string | null
        }
        Update: {
          id?: string
          name?: string
          context?: string
          starter_message?: string
          guide?: string | null
          level?: string | null
          topic?: string | null
          created_at?: string | null
          role1?: string | null
        }
        Relationships: []
      }
      vocabulary: {
        Row: {
          id: string
          user_id: string
          word: string
          meaning: string
          example: string | null
          source_type: string
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          meaning: string
          example?: string | null
          source_type: string
          source_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          meaning?: string
          example?: string | null
          source_type?: string
          source_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}