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
      credit_ledger: {
        Row: {
          created_at: string
          delta: number
          id: string
          metadata: Json | null
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          metadata?: Json | null
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          metadata?: Json | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      generation_jobs: {
        Row: {
          aspect_ratio: string | null
          attempts: number
          completed_at: string | null
          created_at: string
          credits_cost: number
          credits_refunded: boolean
          duration_seconds: number | null
          error_message: string | null
          id: string
          kind: string
          model: string | null
          prompt: string
          provider_job_id: string | null
          resolution: string | null
          result_text: string | null
          status: string
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aspect_ratio?: string | null
          attempts?: number
          completed_at?: string | null
          created_at?: string
          credits_cost?: number
          credits_refunded?: boolean
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          kind: string
          model?: string | null
          prompt: string
          provider_job_id?: string | null
          resolution?: string | null
          result_text?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aspect_ratio?: string | null
          attempts?: number
          completed_at?: string | null
          created_at?: string
          credits_cost?: number
          credits_refunded?: boolean
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          kind?: string
          model?: string | null
          prompt?: string
          provider_job_id?: string | null
          resolution?: string | null
          result_text?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          created_at: string
          event_key: string
          event_type: string | null
          id: string
          payload: Json
          processed: boolean
          processing_error: string | null
          tx_ref: string | null
        }
        Insert: {
          created_at?: string
          event_key: string
          event_type?: string | null
          id?: string
          payload: Json
          processed?: boolean
          processing_error?: string | null
          tx_ref?: string | null
        }
        Update: {
          created_at?: string
          event_key?: string
          event_type?: string | null
          id?: string
          payload?: Json
          processed?: boolean
          processing_error?: string | null
          tx_ref?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          billing_interval: string
          created_at: string
          currency: string
          failure_reason: string | null
          flw_transaction_id: string | null
          id: string
          plan_id: string | null
          raw_response: Json | null
          status: string
          subscription_id: string | null
          tx_ref: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          billing_interval?: string
          created_at?: string
          currency: string
          failure_reason?: string | null
          flw_transaction_id?: string | null
          id?: string
          plan_id?: string | null
          raw_response?: Json | null
          status?: string
          subscription_id?: string | null
          tx_ref: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_interval?: string
          created_at?: string
          currency?: string
          failure_reason?: string | null
          flw_transaction_id?: string | null
          id?: string
          plan_id?: string | null
          raw_response?: Json | null
          status?: string
          subscription_id?: string | null
          tx_ref?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          locale: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          locale?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          code: string
          created_at: string
          currency: string
          description_en: string | null
          description_fr: string | null
          flw_plan_id_monthly: string | null
          flw_plan_id_yearly: string | null
          id: string
          is_active: boolean
          is_popular: boolean
          monthly_credits: number
          monthly_price: number
          name: string
          sort_order: number
          updated_at: string
          yearly_price: number
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          description_en?: string | null
          description_fr?: string | null
          flw_plan_id_monthly?: string | null
          flw_plan_id_yearly?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          monthly_credits: number
          monthly_price: number
          name: string
          sort_order?: number
          updated_at?: string
          yearly_price: number
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          description_en?: string | null
          description_fr?: string | null
          flw_plan_id_monthly?: string | null
          flw_plan_id_yearly?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          monthly_credits?: number
          monthly_price?: number
          name?: string
          sort_order?: number
          updated_at?: string
          yearly_price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_interval: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          flw_customer_email: string | null
          flw_plan_id: string | null
          flw_subscription_id: string | null
          id: string
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          billing_interval?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          flw_customer_email?: string | null
          flw_plan_id?: string | null
          flw_subscription_id?: string | null
          id?: string
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_interval?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          flw_customer_email?: string | null
          flw_plan_id?: string | null
          flw_subscription_id?: string | null
          id?: string
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          monthly_allowance: number
          reset_at: string | null
          updated_at: string
          used_this_period: number
          user_id: string
        }
        Insert: {
          balance?: number
          monthly_allowance?: number
          reset_at?: string | null
          updated_at?: string
          used_this_period?: number
          user_id: string
        }
        Update: {
          balance?: number
          monthly_allowance?: number
          reset_at?: string | null
          updated_at?: string
          used_this_period?: number
          user_id?: string
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
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: { _amount: number; _reason: string; _user_id: string }
        Returns: Json
      }
      expire_due_subscriptions: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refund_credits: {
        Args: { _amount: number; _reason: string; _user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
