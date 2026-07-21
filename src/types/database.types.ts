// src/types/database.types.ts

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          title: string | null;
          rules: string | null;
          contract_text: string | null;
          subdomain_slug: string | null;
        };
        Insert: {
          id?: string;
          title?: string | null;
          rules?: string | null;
          contract_text?: string | null;
          subdomain_slug?: string | null;
        };
        Update: {
          id?: string;
          title?: string | null;
          rules?: string | null;
          contract_text?: string | null;
          subdomain_slug?: string | null;
        };
      };
      rooms: {
        Row: {
          id: string;
          property_id: string;
          room_number: string;
          status: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          room_number: string;
          status: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          room_number?: string;
          status?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          room_id: string;
          start_date: string;
          end_date: string;
          status: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          start_date: string;
          end_date: string;
          status: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          start_date?: string;
          end_date?: string;
          status?: string;
        };
      };
      profiles: {
        Row: {
          first_name: string | null;
          last_name: string | null;
          email: string | null;
        };
        Insert: {
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
        };
        Update: {
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
        };
      };
    };
  };
}

export type PropertyRow = Database['public']['Tables']['properties']['Row'];
export type RoomRow = Database['public']['Tables']['rooms']['Row'];

export interface Room {
  id: string;
  room_number: string;
  status: string;
}

export interface ContractInfo {
  id: string;
  start_date: string;
  end_date: string;
  profiles?: { first_name: string | null; last_name: string | null; email: string | null } | null;
}