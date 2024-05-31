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
      admin: {
        Row: {
          address: string | null
          id: string
        }
        Insert: {
          address?: string | null
          id?: string
        }
        Update: {
          address?: string | null
          id?: string
        }
        Relationships: []
      }
      participantStatus: {
        Row: {
          created_at: string
          id: string
          participant_address: string
          pool_id: number | null
          status: number
        }
        Insert: {
          created_at?: string
          id?: string
          participant_address?: string
          pool_id?: number | null
          status?: number
        }
        Update: {
          created_at?: string
          id?: string
          participant_address?: string
          pool_id?: number | null
          status?: number
        }
        Relationships: []
      }
      pool: {
        Row: {
          co_host_addresses: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          event_timestamp: string | null
          host_address: string | null
          link_to_rules: string | null
          pool_id: number
          pool_image_url: string | null
          pool_name: string | null
          price: number | null
          soft_cap: number | null
        }
        Insert: {
          co_host_addresses?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_timestamp?: string | null
          host_address?: string | null
          link_to_rules?: string | null
          pool_id?: number
          pool_image_url?: string | null
          pool_name?: string | null
          price?: number | null
          soft_cap?: number | null
        }
        Update: {
          co_host_addresses?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_timestamp?: string | null
          host_address?: string | null
          link_to_rules?: string | null
          pool_id?: number
          pool_image_url?: string | null
          pool_name?: string | null
          price?: number | null
          soft_cap?: number | null
        }
        Relationships: []
      }
      test: {
        Row: {
          address: string
          created_at: string
          data: string | null
          id: number
        }
        Insert: {
          address: string
          created_at?: string
          data?: string | null
          id?: number
        }
        Update: {
          address?: string
          created_at?: string
          data?: string | null
          id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          auth: Json | null
          created_at: string
          id: string | null
        }
        Insert: {
          address: string
          auth?: Json | null
          created_at?: string
          id?: string | null
        }
        Update: {
          address?: string
          auth?: Json | null
          created_at?: string
          id?: string | null
        }
        Relationships: []
      }
      usersDisplay: {
        Row: {
          address: string
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          address: string
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Update: {
          address?: string
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
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
      [_ in never]: never
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
