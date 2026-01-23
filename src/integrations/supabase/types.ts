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
          batch_id: string | null
          completed_at: string | null
          completion_status: string | null
          created_at: string
          custom_field_values: Json | null
          id: string
          program_id: string
          registration_fee_paid: boolean
          registration_number: string | null
          resubmission_count: number | null
          status: Database["public"]["Enums"]["application_status"]
          submitted: boolean
          submitted_at: string | null
          trainee_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          application_fee_paid?: boolean
          batch_id?: string | null
          completed_at?: string | null
          completion_status?: string | null
          created_at?: string
          custom_field_values?: Json | null
          id?: string
          program_id: string
          registration_fee_paid?: boolean
          registration_number?: string | null
          resubmission_count?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted?: boolean
          submitted_at?: string | null
          trainee_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          application_fee_paid?: boolean
          batch_id?: string | null
          completed_at?: string | null
          completion_status?: string | null
          created_at?: string
          custom_field_values?: Json | null
          id?: string
          program_id?: string
          registration_fee_paid?: boolean
          registration_number?: string | null
          resubmission_count?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted?: boolean
          submitted_at?: string | null
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
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
      batches: {
        Row: {
          batch_name: string
          created_at: string
          end_date: string | null
          enrolled_count: number | null
          id: string
          max_capacity: number | null
          program_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          batch_name: string
          created_at?: string
          end_date?: string | null
          enrolled_count?: number | null
          id?: string
          max_capacity?: number | null
          program_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          batch_name?: string
          created_at?: string
          end_date?: string | null
          enrolled_count?: number | null
          id?: string
          max_capacity?: number | null
          program_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_template: {
        Row: {
          accent_color: string
          background_color: string
          body_template: string
          border_style: string
          created_at: string
          footer_text: string
          header_text: string
          id: string
          orientation: string
          paper_size: string
          show_certificate_number: boolean
          show_logo: boolean
          show_qr_code: boolean
          show_signature: boolean
          signature_name: string | null
          signature_title: string
          singleton: boolean
          subheader_text: string
          text_color: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          body_template?: string
          border_style?: string
          created_at?: string
          footer_text?: string
          header_text?: string
          id?: string
          orientation?: string
          paper_size?: string
          show_certificate_number?: boolean
          show_logo?: boolean
          show_qr_code?: boolean
          show_signature?: boolean
          signature_name?: string | null
          signature_title?: string
          singleton?: boolean
          subheader_text?: string
          text_color?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          body_template?: string
          border_style?: string
          created_at?: string
          footer_text?: string
          header_text?: string
          id?: string
          orientation?: string
          paper_size?: string
          show_certificate_number?: boolean
          show_logo?: boolean
          show_qr_code?: boolean
          show_signature?: boolean
          signature_name?: string | null
          signature_title?: string
          singleton?: boolean
          subheader_text?: string
          text_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          application_id: string
          batch_id: string | null
          certificate_number: string
          created_at: string
          id: string
          issued_at: string
          issued_by: string | null
          pdf_storage_path: string | null
          program_id: string
          trainee_id: string
        }
        Insert: {
          application_id: string
          batch_id?: string | null
          certificate_number: string
          created_at?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          pdf_storage_path?: string | null
          program_id: string
          trainee_id: string
        }
        Update: {
          application_id?: string
          batch_id?: string | null
          certificate_number?: string
          created_at?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          pdf_storage_path?: string | null
          program_id?: string
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_form_fields: {
        Row: {
          created_at: string
          display_order: number
          field_label: string
          field_name: string
          field_options: Json | null
          field_type: string
          form_type: string
          help_text: string | null
          id: string
          is_active: boolean
          is_required: boolean
          placeholder: string | null
          program_id: string | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_label: string
          field_name: string
          field_options?: Json | null
          field_type: string
          form_type: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          placeholder?: string | null
          program_id?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          display_order?: number
          field_label?: string
          field_name?: string
          field_options?: Json | null
          field_type?: string
          form_type?: string
          help_text?: string | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          placeholder?: string | null
          program_id?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_form_fields_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          available_placeholders: Json | null
          created_at: string
          description: string | null
          html_template: string
          id: string
          is_enabled: boolean
          subject_template: string
          template_key: string
          template_name: string
          updated_at: string
        }
        Insert: {
          available_placeholders?: Json | null
          created_at?: string
          description?: string | null
          html_template: string
          id?: string
          is_enabled?: boolean
          subject_template: string
          template_key: string
          template_name: string
          updated_at?: string
        }
        Update: {
          available_placeholders?: Json | null
          created_at?: string
          description?: string | null
          html_template?: string
          id?: string
          is_enabled?: boolean
          subject_template?: string
          template_key?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
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
      homepage_content: {
        Row: {
          created_at: string
          cta_button_link: string
          cta_button_text: string
          cta_subtitle: string
          cta_title: string
          feature_1_description: string
          feature_1_icon: string
          feature_1_title: string
          feature_2_description: string
          feature_2_icon: string
          feature_2_title: string
          feature_3_description: string
          feature_3_icon: string
          feature_3_title: string
          feature_4_description: string
          feature_4_icon: string
          feature_4_title: string
          features_subtitle: string
          features_title: string
          footer_about: string
          hero_badge_text: string
          hero_badge_visible: boolean
          hero_cta_link: string
          hero_cta_text: string
          hero_image_url: string | null
          hero_secondary_cta_link: string
          hero_secondary_cta_text: string
          hero_stat_1_label: string
          hero_stat_1_value: string
          hero_stat_2_label: string
          hero_stat_2_value: string
          hero_stat_3_label: string
          hero_stat_3_value: string
          hero_stats_visible: boolean
          hero_subtitle: string
          hero_title: string
          hero_trust_graduates_text: string
          hero_trust_rating: string
          hero_trust_reviews_count: string
          hero_trust_visible: boolean
          id: string
          show_how_it_works: boolean
          show_programs_section: boolean
          show_testimonials: boolean
          singleton: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_button_link?: string
          cta_button_text?: string
          cta_subtitle?: string
          cta_title?: string
          feature_1_description?: string
          feature_1_icon?: string
          feature_1_title?: string
          feature_2_description?: string
          feature_2_icon?: string
          feature_2_title?: string
          feature_3_description?: string
          feature_3_icon?: string
          feature_3_title?: string
          feature_4_description?: string
          feature_4_icon?: string
          feature_4_title?: string
          features_subtitle?: string
          features_title?: string
          footer_about?: string
          hero_badge_text?: string
          hero_badge_visible?: boolean
          hero_cta_link?: string
          hero_cta_text?: string
          hero_image_url?: string | null
          hero_secondary_cta_link?: string
          hero_secondary_cta_text?: string
          hero_stat_1_label?: string
          hero_stat_1_value?: string
          hero_stat_2_label?: string
          hero_stat_2_value?: string
          hero_stat_3_label?: string
          hero_stat_3_value?: string
          hero_stats_visible?: boolean
          hero_subtitle?: string
          hero_title?: string
          hero_trust_graduates_text?: string
          hero_trust_rating?: string
          hero_trust_reviews_count?: string
          hero_trust_visible?: boolean
          id?: string
          show_how_it_works?: boolean
          show_programs_section?: boolean
          show_testimonials?: boolean
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_button_link?: string
          cta_button_text?: string
          cta_subtitle?: string
          cta_title?: string
          feature_1_description?: string
          feature_1_icon?: string
          feature_1_title?: string
          feature_2_description?: string
          feature_2_icon?: string
          feature_2_title?: string
          feature_3_description?: string
          feature_3_icon?: string
          feature_3_title?: string
          feature_4_description?: string
          feature_4_icon?: string
          feature_4_title?: string
          features_subtitle?: string
          features_title?: string
          footer_about?: string
          hero_badge_text?: string
          hero_badge_visible?: boolean
          hero_cta_link?: string
          hero_cta_text?: string
          hero_image_url?: string | null
          hero_secondary_cta_link?: string
          hero_secondary_cta_text?: string
          hero_stat_1_label?: string
          hero_stat_1_value?: string
          hero_stat_2_label?: string
          hero_stat_2_value?: string
          hero_stat_3_label?: string
          hero_stat_3_value?: string
          hero_stats_visible?: boolean
          hero_subtitle?: string
          hero_title?: string
          hero_trust_graduates_text?: string
          hero_trust_rating?: string
          hero_trust_reviews_count?: string
          hero_trust_visible?: boolean
          id?: string
          show_how_it_works?: boolean
          show_programs_section?: boolean
          show_testimonials?: boolean
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      id_card_template: {
        Row: {
          background_color: string
          card_height: number
          card_width: number
          created_at: string
          custom_fields: Json | null
          footer_text: string
          header_text: string
          id: string
          show_batch: boolean
          show_emergency_contact: boolean
          show_logo: boolean
          show_photo: boolean
          show_program: boolean
          show_qr_code: boolean
          show_registration_number: boolean
          show_validity_date: boolean
          singleton: boolean
          text_color: string
          updated_at: string
        }
        Insert: {
          background_color?: string
          card_height?: number
          card_width?: number
          created_at?: string
          custom_fields?: Json | null
          footer_text?: string
          header_text?: string
          id?: string
          show_batch?: boolean
          show_emergency_contact?: boolean
          show_logo?: boolean
          show_photo?: boolean
          show_program?: boolean
          show_qr_code?: boolean
          show_registration_number?: boolean
          show_validity_date?: boolean
          singleton?: boolean
          text_color?: string
          updated_at?: string
        }
        Update: {
          background_color?: string
          card_height?: number
          card_width?: number
          created_at?: string
          custom_fields?: Json | null
          footer_text?: string
          header_text?: string
          id?: string
          show_batch?: boolean
          show_emergency_contact?: boolean
          show_logo?: boolean
          show_photo?: boolean
          show_program?: boolean
          show_qr_code?: boolean
          show_registration_number?: boolean
          show_validity_date?: boolean
          singleton?: boolean
          text_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          message_template: string
          template_key: string
          title_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          message_template: string
          template_key: string
          title_template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          message_template?: string
          template_key?: string
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
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
      payment_settings_public: {
        Row: {
          created_at: string
          flutterwave_enabled: boolean
          flutterwave_public_key: string | null
          id: string
          paystack_enabled: boolean
          paystack_public_key: string | null
          singleton: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          flutterwave_enabled?: boolean
          flutterwave_public_key?: string | null
          id?: string
          paystack_enabled?: boolean
          paystack_public_key?: string | null
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          flutterwave_enabled?: boolean
          flutterwave_public_key?: string | null
          id?: string
          paystack_enabled?: boolean
          paystack_public_key?: string | null
          singleton?: boolean
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
          custom_field_values: Json | null
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
          custom_field_values?: Json | null
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
          custom_field_values?: Json | null
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
      receipt_template: {
        Row: {
          created_at: string
          email_body_template: string
          email_subject_template: string
          footer_text: string
          header_text: string
          id: string
          include_qr_code: boolean
          organization_name: string
          primary_color: string
          secondary_color: string
          send_email_on_verification: boolean
          show_logo: boolean
          singleton: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_body_template?: string
          email_subject_template?: string
          footer_text?: string
          header_text?: string
          id?: string
          include_qr_code?: boolean
          organization_name?: string
          primary_color?: string
          secondary_color?: string
          send_email_on_verification?: boolean
          show_logo?: boolean
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_body_template?: string
          email_subject_template?: string
          footer_text?: string
          header_text?: string
          id?: string
          include_qr_code?: boolean
          organization_name?: string
          primary_color?: string
          secondary_color?: string
          send_email_on_verification?: boolean
          show_logo?: boolean
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
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
      role_permissions: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          permission_category: string
          permission_key: string
          permission_label: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          permission_category: string
          permission_key: string
          permission_label: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          permission_category?: string
          permission_key?: string
          permission_label?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
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
      theme_config: {
        Row: {
          accent_color: string
          accent_foreground: string
          background_color: string
          border_color: string
          card_color: string
          card_foreground: string
          created_at: string
          destructive_color: string
          destructive_foreground: string
          foreground_color: string
          id: string
          muted_color: string
          muted_foreground: string
          primary_color: string
          primary_foreground: string
          secondary_color: string
          secondary_foreground: string
          sidebar_accent: string
          sidebar_background: string
          sidebar_foreground: string
          sidebar_primary: string
          singleton: boolean
          updated_at: string
        }
        Insert: {
          accent_color?: string
          accent_foreground?: string
          background_color?: string
          border_color?: string
          card_color?: string
          card_foreground?: string
          created_at?: string
          destructive_color?: string
          destructive_foreground?: string
          foreground_color?: string
          id?: string
          muted_color?: string
          muted_foreground?: string
          primary_color?: string
          primary_foreground?: string
          secondary_color?: string
          secondary_foreground?: string
          sidebar_accent?: string
          sidebar_background?: string
          sidebar_foreground?: string
          sidebar_primary?: string
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          accent_color?: string
          accent_foreground?: string
          background_color?: string
          border_color?: string
          card_color?: string
          card_foreground?: string
          created_at?: string
          destructive_color?: string
          destructive_foreground?: string
          foreground_color?: string
          id?: string
          muted_color?: string
          muted_foreground?: string
          primary_color?: string
          primary_foreground?: string
          secondary_color?: string
          secondary_foreground?: string
          sidebar_accent?: string
          sidebar_background?: string
          sidebar_foreground?: string
          sidebar_primary?: string
          singleton?: boolean
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
      broadcast_announcement: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_role: string
          p_title: string
        }
        Returns: number
      }
      create_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_certificate_number: {
        Args: { program_title: string }
        Returns: string
      }
      generate_registration_number: {
        Args: { program_title: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_permission: {
        Args: { permission: string; user_id: string }
        Returns: boolean
      }
      increment_enrolled_count: {
        Args: { program_id: string }
        Returns: undefined
      }
      is_admin_or_higher: { Args: { user_id: string }; Returns: boolean }
      is_instructor: { Args: { user_id: string }; Returns: boolean }
      is_super_admin: { Args: { user_id: string }; Returns: boolean }
      issue_certificate: {
        Args: { p_application_id: string; p_issued_by?: string }
        Returns: string
      }
      notify_admins_new_application: {
        Args: {
          p_application_id: string
          p_program_title: string
          p_trainee_name: string
        }
        Returns: number
      }
      resubmit_application: {
        Args: { p_application_id: string }
        Returns: boolean
      }
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
