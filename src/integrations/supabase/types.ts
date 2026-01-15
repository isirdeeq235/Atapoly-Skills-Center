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
  public: {
    Tables: {
      applications: {
        Row: {
          admin_notes: string | null
          application_fee_paid: boolean
          created_at: string
          id: string
          program_id: string
          registration_fee_paid: boolean
          registration_number: string | null
          status: Database["public"]["Enums"]["application_status"]
          trainee_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          application_fee_paid?: boolean
          created_at?: string
          id?: string
          program_id: string
          registration_fee_paid?: boolean
          registration_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          trainee_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          application_fee_paid?: boolean
          created_at?: string
          id?: string
          program_id?: string
          registration_fee_paid?: boolean
          registration_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          created_at: string
          flutterwave_enabled: boolean
          flutterwave_public_key: string | null
          flutterwave_secret_key: string | null
          id: string
          paystack_enabled: boolean
          paystack_public_key: string | null
          paystack_secret_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          flutterwave_enabled?: boolean
          flutterwave_public_key?: string | null
          flutterwave_secret_key?: string | null
          id?: string
          paystack_enabled?: boolean
          paystack_public_key?: string | null
          paystack_secret_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          flutterwave_enabled?: boolean
          flutterwave_public_key?: string | null
          flutterwave_secret_key?: string | null
          id?: string
          paystack_enabled?: boolean
          paystack_public_key?: string | null
          paystack_secret_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          application_id: string
          created_at: string
          id: string
          metadata: Json | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          trainee_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          application_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_type: Database["public"]["Enums"]["payment_type"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          trainee_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          application_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_type?: Database["public"]["Enums"]["payment_type"]
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact: string | null
          full_name: string
          gender: string | null
          id: string
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          onboarding_completed: boolean | null
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact?: string | null
          full_name: string
          gender?: string | null
          id: string
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          application_fee: number
          created_at: string
          description: string | null
          duration: string | null
          enrolled_count: number
          id: string
          image_url: string | null
          instructor_id: string | null
          max_capacity: number | null
          registration_fee: number
          status: Database["public"]["Enums"]["program_status"]
          title: string
          updated_at: string
        }
        Insert: {
          application_fee?: number
          created_at?: string
          description?: string | null
          duration?: string | null
          enrolled_count?: number
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          max_capacity?: number | null
          registration_fee?: number
          status?: Database["public"]["Enums"]["program_status"]
          title: string
          updated_at?: string
        }
        Update: {
          application_fee?: number
          created_at?: string
          description?: string | null
          duration?: string | null
          enrolled_count?: number
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          max_capacity?: number | null
          registration_fee?: number
          status?: Database["public"]["Enums"]["program_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          id: string
          payment_id: string
          receipt_number: string
          storage_path: string | null
          trainee_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_id: string
          receipt_number: string
          storage_path?: string | null
          trainee_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_id?: string
          receipt_number?: string
          storage_path?: string | null
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          address: string | null
          certificate_signature_url: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          favicon_url: string | null
          id: string
          logo_url: string | null
          maintenance_mode: boolean
          site_name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          certificate_signature_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          maintenance_mode?: boolean
          site_name?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          certificate_signature_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          maintenance_mode?: boolean
          site_name?: string
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      generate_registration_number: {
        Args: { program_title: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      increment_enrolled_count: {
        Args: { program_id: string }
        Returns: undefined
      }
      is_admin_or_higher: { Args: { user_id: string }; Returns: boolean }
      is_instructor: { Args: { user_id: string }; Returns: boolean }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "instructor" | "trainee"
      application_status: "pending" | "approved" | "rejected"
      payment_provider: "paystack" | "flutterwave"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      payment_type: "application_fee" | "registration_fee"
      program_status: "draft" | "published" | "archived"
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
      app_role: ["super_admin", "admin", "instructor", "trainee"],
      application_status: ["pending", "approved", "rejected"],
      payment_provider: ["paystack", "flutterwave"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      payment_type: ["application_fee", "registration_fee"],
      program_status: ["draft", "published", "archived"],
    },
  },
} as const
