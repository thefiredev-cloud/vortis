'use client';

import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { designTokens } from '@/lib/design-tokens';

/**
 * Authentication Error Component
 *
 * Displays user-friendly error messages for OAuth failures
 * with actionable recovery options.
 */

interface AuthErrorProps {
  /** Error message to display */
  error?: string | null;
  /** Error code for specific handling */
  errorCode?: string;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Show return to login link */
  showLoginLink?: boolean;
  /** Custom className */
  className?: string;
}

// User-friendly error messages
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  access_denied: {
    title: 'Access Denied',
    description:
      'You cancelled the sign-in process or denied access. Please try again if you want to sign in.',
  },
  server_error: {
    title: 'Server Error',
    description:
      'Something went wrong on our end. Please try again in a few moments.',
  },
  temporarily_unavailable: {
    title: 'Service Temporarily Unavailable',
    description:
      'The authentication service is temporarily unavailable. Please try again shortly.',
  },
  invalid_request: {
    title: 'Invalid Request',
    description:
      'There was a problem with the authentication request. Please try signing in again.',
  },
  unauthorized_client: {
    title: 'Unauthorized',
    description:
      'This application is not authorized to perform this action. Please contact support.',
  },
  default: {
    title: 'Authentication Failed',
    description:
      'We encountered an issue signing you in. Please try again or contact support if the problem persists.',
  },
};

export function AuthError({
  error,
  errorCode,
  onRetry,
  showLoginLink = true,
  className = '',
}: AuthErrorProps) {
  // Get appropriate error message
  const errorInfo =
    ERROR_MESSAGES[errorCode || ''] || ERROR_MESSAGES.default;

  // Don't render if no error
  if (!error && !errorCode) {
    return null;
  }

  return (
    <div className={className}>
      {/* Error Card */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        {/* Error Icon */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
            </div>
          </div>

          {/* Error Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">
              {errorInfo.title}
            </h3>
            <p className="text-slate-300 text-sm mb-1">
              {errorInfo.description}
            </p>
            {error && (
              <details className="mt-2">
                <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300 transition-colors">
                  Technical details
                </summary>
                <p className="mt-2 text-xs text-slate-400 font-mono bg-black/20 rounded p-2 break-words">
                  {error}
                </p>
              </details>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {/* Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className={`${designTokens.button.primary} flex items-center justify-center gap-2`}
              aria-label="Retry authentication"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Try Again</span>
            </button>
          )}

          {/* Return to Login */}
          {showLoginLink && (
            <Link
              href="/auth/login"
              className={`${designTokens.button.secondary} flex items-center justify-center gap-2`}
              aria-label="Return to login page"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-400">
          Need help?{' '}
          <a
            href="mailto:support@vortis.com"
            className="text-emerald-400 hover:text-emerald-300 transition-colors underline"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Inline Error Message Component
 * For displaying errors within forms
 */
export function InlineAuthError({
  error,
  className = '',
}: {
  error?: string | null;
  className?: string;
}) {
  if (!error) return null;

  return (
    <div
      className={`p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-sm text-red-400 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
}
