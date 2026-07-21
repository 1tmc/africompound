// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const globalForSupabase = globalThis as unknown as {
  supabaseInstance?: SupabaseClient<Database>;
};

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!globalForSupabase.supabaseInstance) {
    globalForSupabase.supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return globalForSupabase.supabaseInstance;
};

export const supabase = getSupabaseClient();