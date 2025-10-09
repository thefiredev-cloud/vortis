'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Google Sign-In Button Component
 *
 * Implements Google's official branding guidelines for OAuth sign-in.
 * Supports three states: default, loading, and error.
 *
 * @see https://developers.google.com/identity/branding-guidelines
 */

interface GoogleSignInButtonProps {
  /** Optional className for custom styling */
  className?: string;
  /** Redirect URL after successful authentication */
  redirectTo?: string;
  /** Callback fired on sign-in initiation */
  onSignInStart?: () => void;
  /** Callback fired on error */
  onError?: (error: Error) => void;
  /** Button text (defaults to "Continue with Google") */
  text?: string;
  /** Disable the button */
  disabled?: boolean;
}

export function GoogleSignInButton({
  className = '',
  redirectTo,
  onSignInStart,
  onError,
  text = 'Continue with Google',
  disabled = false,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    onSignInStart?.();

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError) {
        throw signInError;
      }

      // OAuth redirect will happen automatically, no need to set loading to false
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
      setIsLoading(false);

      const errorObj = err instanceof Error ? err : new Error(errorMessage);
      onError?.(errorObj);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleGoogleSignIn}
        disabled={disabled || isLoading}
        type="button"
        className="
          relative w-full
          flex items-center justify-center gap-3
          px-6 py-3 min-h-[48px]
          bg-white hover:bg-gray-50 active:bg-gray-100
          text-gray-700 font-medium text-base
          border border-gray-300
          rounded-lg
          transition-all duration-200
          hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none
          touch-manipulation
        "
        aria-label={text}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-gray-700" aria-hidden="true" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            {/* Google Logo SVG */}
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{text}</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div
          className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Dark Theme Variant of Google Sign-In Button
 * Optimized for dark backgrounds (Vortis theme)
 */
export function GoogleSignInButtonDark(props: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    props.onSignInStart?.();

    try {
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: props.redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
      setIsLoading(false);

      const errorObj = err instanceof Error ? err : new Error(errorMessage);
      props.onError?.(errorObj);
    }
  };

  return (
    <div className={props.className}>
      <button
        onClick={handleGoogleSignIn}
        disabled={props.disabled || isLoading}
        type="button"
        className="
          relative w-full
          flex items-center justify-center gap-3
          px-6 py-3 min-h-[48px]
          bg-white/10 hover:bg-white/[0.15] active:bg-white/20
          backdrop-blur-xl
          text-white font-semibold text-base
          border border-white/20 hover:border-white/30
          rounded-lg
          transition-all duration-200
          hover:shadow-lg hover:shadow-white/10
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-black
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/10 disabled:hover:shadow-none
          touch-manipulation
        "
        aria-label={props.text || 'Continue with Google'}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-white" aria-hidden="true" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            {/* Google Logo SVG */}
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{props.text || 'Continue with Google'}</span>
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div
          className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
