import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 *
 * Uses service role key to bypass Row Level Security (RLS).
 * ONLY use this on the server-side (API routes, server actions, etc.)
 *
 * NEVER expose service role key to client-side code!
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Helper function to safely use admin client
 * Validates that we're in a server context
 */
export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error(
      "supabaseAdmin should only be used in server-side code (API routes, server actions, etc.)"
    );
  }

  return supabaseAdmin;
}
