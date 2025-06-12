export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      charging_sessions: {
        Row: {
          charger_id: number;
          created_at: string | null;
          current_charge: number;
          estimated_end_time: string;
          id: string;
          start_time: string | null;
          status: string | null;
          target_charge: number;
          user_id: string;
        };
        Insert: {
          charger_id: number;
          created_at?: string | null;
          current_charge: number;
          estimated_end_time: string;
          id?: string;
          start_time?: string | null;
          status?: string | null;
          target_charge: number;
          user_id: string;
        };
        Update: {
          charger_id?: number;
          created_at?: string | null;
          current_charge?: number;
          estimated_end_time?: string;
          id?: string;
          start_time?: string | null;
          status?: string | null;
          target_charge?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "charging_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      queue_entries: {
        Row: {
          created_at: string | null;
          current_charge: number;
          id: string;
          position: number;
          target_charge: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          current_charge: number;
          id?: string;
          position: number;
          target_charge: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          current_charge?: number;
          id?: string;
          position?: number;
          target_charge?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "queue_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          preferred_charge_percentage: number | null;
          tesla_model: string;
          tesla_year: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id: string;
          name: string;
          preferred_charge_percentage?: number | null;
          tesla_model: string;
          tesla_year: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          preferred_charge_percentage?: number | null;
          tesla_model?: string;
          tesla_year?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
