import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 *
 * Uses service role key to bypass Row Level Security (RLS).
 * ONLY use this on the server-side (API routes, server actions, etc.)
 *
 * NEVER expose service role key to client-side code!
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

export const supabaseAdmin: SupabaseClient | null = (
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
) ? createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
) : null;

/**
 * Helper function to safely use admin client
 * Validates that we're in a server context and that Supabase is configured
 */
export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error(
      "supabaseAdmin should only be used in server-side code (API routes, server actions, etc.)"
    );
  }

  if (!supabaseAdmin) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return supabaseAdmin;
}
