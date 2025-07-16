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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          password_hash: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password_hash: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          password_hash?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
          user_username: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          user_username?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          user_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          kpis: Json | null
          name: string
          objectives: string | null
          results: Json | null
          start_date: string | null
          status: string | null
          target_audience: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kpis?: Json | null
          name: string
          objectives?: string | null
          results?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kpis?: Json | null
          name?: string
          objectives?: string | null
          results?: Json | null
          start_date?: string | null
          status?: string | null
          target_audience?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_passwords: {
        Row: {
          attachments: Json | null
          cliente: string
          created_at: string
          id: string
          observacoes: string | null
          plataforma: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          cliente: string
          created_at?: string
          id?: string
          observacoes?: string | null
          plataforma: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          cliente?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          plataforma?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_passwords_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      column_config: {
        Row: {
          column_id: string
          column_name: string
          column_type: string
          created_at: string
          id: string
          is_default: boolean | null
          module: string
          user_id: string | null
        }
        Insert: {
          column_id: string
          column_name: string
          column_type: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          module: string
          user_id?: string | null
        }
        Update: {
          column_id?: string
          column_name?: string
          column_type?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          module?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "column_config_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          client_id: string | null
          content: string | null
          created_at: string
          id: string
          metadata: Json | null
          platform: string | null
          project_id: string | null
          published_date: string | null
          scheduled_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          project_id?: string | null
          published_date?: string | null
          scheduled_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          platform?: string | null
          project_id?: string | null
          published_date?: string | null
          scheduled_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      content_data: {
        Row: {
          created_at: string
          group_color: string | null
          group_id: string
          group_name: string
          id: string
          is_expanded: boolean | null
          item_data: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_color?: string | null
          group_id: string
          group_name: string
          id?: string
          is_expanded?: boolean | null
          item_data: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_color?: string | null
          group_id?: string
          group_name?: string
          id?: string
          is_expanded?: boolean | null
          item_data?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          order_index: number
          project_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          order_index: number
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          order_index?: number
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_to: string | null
          budget: number | null
          client_id: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          priority: string | null
          progress: number | null
          start_date: string | null
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          budget?: number | null
          client_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          budget?: number | null
          client_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          priority?: string | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          campaign_id: string | null
          client_id: string | null
          created_at: string
          data: Json
          generated_at: string
          id: string
          name: string
          period_end: string | null
          period_start: string | null
          project_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          client_id?: string | null
          created_at?: string
          data: Json
          generated_at?: string
          id?: string
          name: string
          period_end?: string | null
          period_start?: string | null
          project_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          client_id?: string | null
          created_at?: string
          data?: Json
          generated_at?: string
          id?: string
          name?: string
          period_end?: string | null
          period_start?: string | null
          project_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sites_data: {
        Row: {
          created_at: string
          group_color: string | null
          group_id: string
          group_name: string
          id: string
          is_expanded: boolean | null
          item_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_color?: string | null
          group_id: string
          group_name: string
          id?: string
          is_expanded?: boolean | null
          item_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_color?: string | null
          group_id?: string
          group_name?: string
          id?: string
          is_expanded?: boolean | null
          item_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      status_config: {
        Row: {
          created_at: string
          id: string
          module: string
          status_color: string
          status_id: string
          status_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module: string
          status_color: string
          status_id: string
          status_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module?: string
          status_color?: string
          status_id?: string
          status_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_config_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      task_columns: {
        Row: {
          column_color: string
          column_id: string
          column_order: number
          column_title: string
          created_at: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          column_color?: string
          column_id: string
          column_order?: number
          column_title: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          column_color?: string
          column_id?: string
          column_order?: number
          column_title?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_columns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          client_id: string | null
          completed_date: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          project_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          client_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          client_id?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks_data: {
        Row: {
          column_color: string | null
          column_id: string
          column_title: string
          created_at: string
          id: string
          task_data: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          column_color?: string | null
          column_id: string
          column_title: string
          created_at?: string
          id?: string
          task_data: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          column_color?: string | null
          column_id?: string
          column_title?: string
          created_at?: string
          id?: string
          task_data?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      traffic_data: {
        Row: {
          created_at: string
          group_color: string | null
          group_id: string
          group_name: string
          id: string
          is_expanded: boolean | null
          item_data: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_color?: string | null
          group_id: string
          group_name: string
          id?: string
          is_expanded?: boolean | null
          item_data: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_color?: string | null
          group_id?: string
          group_name?: string
          id?: string
          is_expanded?: boolean | null
          item_data?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traffic_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
