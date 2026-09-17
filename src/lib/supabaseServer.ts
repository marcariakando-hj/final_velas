import { createClient, SupabaseClient } from "@supabase/supabase-js";

const serverSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serverSupabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

export const isServerSupabaseConfigured = Boolean(
  serverSupabaseUrl &&
  serverSupabaseKey &&
  !serverSupabaseUrl.includes("placeholder")
);

let serverClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured) return null;
  if (!serverClient) {
    serverClient = createClient(serverSupabaseUrl, serverSupabaseKey, {
      auth: { persistSession: false },
    });
  }
  return serverClient;
}
