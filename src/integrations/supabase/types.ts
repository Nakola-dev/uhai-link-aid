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
      account_deletion_requests: {
        Row: {
          id: string
          user_id: string
          reason: string | null
          status: string
          requested_at: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          data_export_url: string | null
          data_export_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reason?: string | null
          status?: string
          requested_at?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          data_export_url?: string | null
          data_export_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reason?: string | null
          status?: string
          requested_at?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          data_export_url?: string | null
          data_export_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          id: string
          admin_user_id: string
          action_type: Database["public"]["Enums"]["admin_action_type"]
          entity_type: string
          entity_id: string | null
          description: string | null
          changes: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_user_id: string
          action_type: Database["public"]["Enums"]["admin_action_type"]
          entity_type: string
          entity_id?: string | null
          description?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_user_id?: string
          action_type?: Database["public"]["Enums"]["admin_action_type"]
          entity_type?: string
          entity_id?: string | null
          description?: string | null
          changes?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          id: string
          metric_type: string
          metric_key: string
          metric_value: number
          user_id: string | null
          session_id: string | null
          date_recorded: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          metric_type: string
          metric_key: string
          metric_value?: number
          user_id?: string | null
          session_id?: string | null
          date_recorded?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          metric_type?: string
          metric_key?: string
          metric_value?: number
          user_id?: string | null
          session_id?: string | null
          date_recorded?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          read_time: number | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          read_time?: number | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          read_time?: number | null
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      downloadable_materials: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_size: string | null
          file_type: string
          file_url: string
          id: string
          is_premium: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: string | null
          file_type: string
          file_url: string
          id?: string
          is_premium?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_size?: string | null
          file_type?: string
          file_url?: string
          id?: string
          is_premium?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string
          priority: number | null
          relationship: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone: string
          priority?: number | null
          relationship?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string
          priority?: number | null
          relationship?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emergency_organizations: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          type?: string | null
        }
        Relationships: []
      }
      data_access_logs: {
        Row: {
          id: string
          accessor_id: string
          accessed_user_id: string
          access_type: string
          resource_type: string
          resource_id: string | null
          fields_accessed: string[] | null
          access_context: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          accessor_id: string
          accessed_user_id: string
          access_type: string
          resource_type: string
          resource_id?: string | null
          fields_accessed?: string[] | null
          access_context?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          accessor_id?: string
          accessed_user_id?: string
          access_type?: string
          resource_type?: string
          resource_id?: string | null
          fields_accessed?: string[] | null
          access_context?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      legal_document_versions: {
        Row: {
          id: string
          document_type: string
          version: string
          title: string
          content: string
          summary_of_changes: string | null
          effective_date: string
          superseded_date: string | null
          published_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_type: string
          version: string
          title: string
          content: string
          summary_of_changes?: string | null
          effective_date: string
          superseded_date?: string | null
          published_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_type?: string
          version?: string
          title?: string
          content?: string
          summary_of_changes?: string | null
          effective_date?: string
          superseded_date?: string | null
          published_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_services: {
        Row: {
          id: string
          organization_id: string
          service_name: string
          service_description: string | null
          availability_hours: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          service_name: string
          service_description?: string | null
          availability_hours?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          service_name?: string
          service_description?: string | null
          availability_hours?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_services_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "emergency_organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          allergies: string[] | null
          blood_type: string | null
          chronic_conditions: string[] | null
          city: string | null
          county: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          full_name: string | null
          gender: string | null
          id: string
          medications: string[] | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          primary_hospital: string | null
          profile_photo_url: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          city?: string | null
          county?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          medications?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          primary_hospital?: string | null
          profile_photo_url?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          allergies?: string[] | null
          blood_type?: string | null
          chronic_conditions?: string[] | null
          city?: string | null
          county?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medications?: string[] | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          primary_hospital?: string | null
          profile_photo_url?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qr_access_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          completed: boolean
          created_at: string | null
          id: string
          last_watched_at: string | null
          progress_percentage: number
          tutorial_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          progress_percentage?: number
          tutorial_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          progress_percentage?: number
          tutorial_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webinars: {
        Row: {
          category: string | null
          created_at: string
          date_time: string
          description: string | null
          id: string
          image_url: string | null
          is_paid: boolean
          price: number | null
          speaker: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          date_time: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_paid?: boolean
          price?: number | null
          speaker: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          date_time?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_paid?: boolean
          price?: number | null
          speaker?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          severity: string
          description: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          severity?: string
          description?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          severity?: string
          description?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          id: string
          user_id: string
          consent_type: string
          consent_version: string
          granted: boolean
          granted_at: string | null
          revoked_at: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          consent_type: string
          consent_version: string
          granted?: boolean
          granted_at?: string | null
          revoked_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          consent_type?: string
          consent_version?: string
          granted?: boolean
          granted_at?: string | null
          revoked_at?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          incident_type: string | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          medical_context: Json | null
          responder_notes: string | null
          resolved_at: string | null
          severity: number
          status: string
          triggered_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          incident_type?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          medical_context?: Json | null
          responder_notes?: string | null
          resolved_at?: string | null
          severity?: number
          status?: string
          triggered_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          incident_type?: string | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          medical_context?: Json | null
          responder_notes?: string | null
          resolved_at?: string | null
          severity?: number
          status?: string
          triggered_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_incidents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          created_at: string
          delivered_at: string | null
          emergency_incident_id: string | null
          error_message: string | null
          external_id: string | null
          id: string
          message_text: string | null
          notification_type: string
          provider: string | null
          recipient_name: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          emergency_incident_id?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message_text?: string | null
          notification_type: string
          provider?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          emergency_incident_id?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message_text?: string | null
          notification_type?: string
          provider?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_emergency_incident_id_fkey"
            columns: ["emergency_incident_id"]
            isOneToOne: false
            referencedRelation: "emergency_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      qr_scans: {
        Row: {
          access_granted: boolean
          created_at: string
          denial_reason: string | null
          id: string
          ip_address: string | null
          last_scan_time: string | null
          qr_token_id: string
          responder_id: string | null
          responder_name: string | null
          scan_count: number
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          access_granted?: boolean
          created_at?: string
          denial_reason?: string | null
          id?: string
          ip_address?: string | null
          last_scan_time?: string | null
          qr_token_id: string
          responder_id?: string | null
          responder_name?: string | null
          scan_count?: number
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          access_granted?: boolean
          created_at?: string
          denial_reason?: string | null
          id?: string
          ip_address?: string | null
          last_scan_time?: string | null
          qr_token_id?: string
          responder_id?: string | null
          responder_name?: string | null
          scan_count?: number
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          created_at: string
          id: string
          messages: Json | null
          session_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json | null
          session_start?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json | null
          session_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_action_type: "create" | "update" | "delete" | "view" | "export"
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
      admin_action_type: ["create", "update", "delete", "view", "export"],
      app_role: ["admin", "user"],
    },
  },
} as const
