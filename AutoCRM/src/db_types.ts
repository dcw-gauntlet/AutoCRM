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
      messages: {
        Row: {
          created_at: string
          id: number
          message_type: Database["public"]["Enums"]["message_type"] | null
          sender_id: string | null
          text: string | null
          ticket_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message_type?: Database["public"]["Enums"]["message_type"] | null
          sender_id?: string | null
          text?: string | null
          ticket_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message_type?: Database["public"]["Enums"]["message_type"] | null
          sender_id?: string | null
          text?: string | null
          ticket_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      queues: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: number
          tag: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          tag?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          tag?: string | null
        }
        Relationships: []
      }
      test: {
        Row: {
          created_at: string
          id: number
          message: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          message?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          message?: string | null
        }
        Relationships: []
      }
      ticket_files: {
        Row: {
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: number
          ticket_id: number | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: number
          ticket_id?: number | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: number
          ticket_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_files_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_tags: {
        Row: {
          created_at: string
          id: number
          tag_id: number
          ticket_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          tag_id: number
          ticket_id: number
        }
        Update: {
          created_at?: string
          id?: number
          tag_id?: number
          ticket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_tags_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assignee: string | null
          created_at: string
          creator: string | null
          description: string | null
          id: number
          priority: Database["public"]["Enums"]["ticketpriority"]
          queue_id: number | null
          status: Database["public"]["Enums"]["ticketstatus"] | null
          title: string
          type: Database["public"]["Enums"]["tickettype"]
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          creator?: string | null
          description?: string | null
          id?: number
          priority?: Database["public"]["Enums"]["ticketpriority"]
          queue_id?: number | null
          status?: Database["public"]["Enums"]["ticketstatus"] | null
          title: string
          type?: Database["public"]["Enums"]["tickettype"]
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          creator?: string | null
          description?: string | null
          id?: number
          priority?: Database["public"]["Enums"]["ticketpriority"]
          queue_id?: number | null
          status?: Database["public"]["Enums"]["ticketstatus"] | null
          title?: string
          type?: Database["public"]["Enums"]["tickettype"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_queues: {
        Row: {
          created_at: string
          queue_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          queue_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          queue_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_queues_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_queues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          friendly_name: string | null
          id: string
          last_name: string | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          friendly_name?: string | null
          id: string
          last_name?: string | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          friendly_name?: string | null
          id?: string
          last_name?: string | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      message_type: "public" | "agent_only"
      ticketpriority: "low" | "medium" | "high" | "urgent"
      ticketstatus: "open" | "in_progress" | "closed" | "on_hold"
      tickettype: "bug" | "feature" | "support" | "inquiry"
      user_type: "customer" | "agent" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
