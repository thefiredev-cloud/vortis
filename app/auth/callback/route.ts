import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * OAuth Callback Handler
 *
 * Handles the OAuth callback from Google after user authentication.
 * Exchanges authorization code for session and redirects appropriately.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  // Check for OAuth errors from provider
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors (user cancelled, access denied, etc.)
  if (error) {
    const errorMessage = encodeURIComponent(
      errorDescription || 'Authentication was cancelled or denied'
    );
    return NextResponse.redirect(
      new URL(`/auth/login?error=${errorMessage}&error_code=${error}`, request.url)
    );
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        // Success - redirect to intended destination
        return NextResponse.redirect(new URL(next, request.url));
      }

      // Handle exchange errors
      const errorMessage = encodeURIComponent(
        exchangeError.message || 'Failed to complete authentication'
      );
      return NextResponse.redirect(
        new URL(`/auth/login?error=${errorMessage}`, request.url)
      );
    } catch (err) {
      // Catch unexpected errors
      const errorMessage = encodeURIComponent(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
      return NextResponse.redirect(
        new URL(`/auth/login?error=${errorMessage}`, request.url)
      );
    }
  }

  // No code provided - invalid callback
  return NextResponse.redirect(
    new URL("/auth/login?error=Invalid authentication callback", request.url)
  );
}
