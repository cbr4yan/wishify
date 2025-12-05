import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    return createClient("https://placeholder.supabase.co", "placeholder-key");
  }
  return createClient(supabaseUrl, supabaseKey);
}

export const supabase = getSupabaseClient();

// Tipos para la base de datos
export type Event = {
  id: string;
  name: string;
  secret_code: string;
  created_at: string;
};

export type Wishlist = {
  id: string;
  event_id: string | null;
  slug: string;
  name: string;
  secret_code: string;
  created_at: string;
};

export type Gift = {
  id: string;
  wishlist_id: string;
  name: string;
  reserved: boolean;
  created_at: string;
};
