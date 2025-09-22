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
          title: string
          content: string
          template_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          template_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          template_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journals_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journals_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "journal_templates"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_templates: {
        Row: {
          id: string
          title: string
          description: string
          template_content: string
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          template_content: string
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          template_content?: string
          tags?: string[]
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          onboarding_completed: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          onboarding_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          onboarding_completed?: boolean
          created_at?: string
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