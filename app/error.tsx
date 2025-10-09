"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";
import { designTokens } from "@/lib/design-tokens";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Log error to monitoring service
    console.error("Application error:", error);

    // Report to analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: false,
      });
    }
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Add delay for retry
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      reset();
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  const getUserFriendlyMessage = (errorMessage: string): string => {
    if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
      return "Network connection issue. Please check your internet and try again.";
    }
    if (errorMessage.includes("timeout")) {
      return "Request timed out. The server took too long to respond.";
    }
    if (errorMessage.includes("auth") || errorMessage.includes("unauthorized")) {
      return "Authentication error. Please sign in again.";
    }
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return "Resource not found. It may have been moved or deleted.";
    }
    if (errorMessage.includes("permission") || errorMessage.includes("403")) {
      return "Access denied. You don't have permission to view this content.";
    }
    return "An unexpected error occurred. Our team has been notified.";
  };

  const canRetry = retryCount < maxRetries;

  return (
    <div className={designTokens.layout.page}>
      <OrbBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className={designTokens.card.base}>
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 rounded-full">
                <AlertCircle className="h-16 w-16 text-red-400" aria-hidden="true" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className={`${designTokens.text.heading} text-center mb-4`}>
              Something went wrong
            </h1>

            {/* User-friendly message */}
            <p className={`${designTokens.text.body} text-center mb-6`}>
              {getUserFriendlyMessage(error.message)}
            </p>

            {/* Technical Details (collapsible) */}
            <details className="mb-6 bg-white/5 rounded-lg p-4">
              <summary className="cursor-pointer text-slate-400 text-sm font-medium hover:text-white transition-colors">
                Technical Details
              </summary>
              <div className="mt-3 space-y-2">
                <div className="bg-black/50 rounded p-3 font-mono text-xs text-red-400 overflow-x-auto">
                  <p className="break-all">{error.message}</p>
                </div>
                {error.digest && (
                  <p className="text-xs text-slate-500">
                    Error ID: {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer hover:text-slate-400">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 bg-black/50 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </details>

            {/* Retry Counter */}
            {retryCount > 0 && (
              <div className="mb-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                <span>Retry attempts: {retryCount} / {maxRetries}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {canRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={`${designTokens.button.primary} flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Retry loading the page"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
                      <span>Retrying...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" aria-hidden="true" />
                      <span>Try Again</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => window.history.back()}
                className={`${designTokens.button.secondary} flex-1 flex items-center justify-center gap-2`}
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                <span>Go Back</span>
              </button>

              <Link
                href="/dashboard"
                className={`${designTokens.button.outlined} flex-1 flex items-center justify-center gap-2`}
                aria-label="Return to dashboard"
              >
                <Home className="h-5 w-5" aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Help Section */}
            {!canRetry && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className={`${designTokens.text.small} text-center`}>
                  Still having issues?{" "}
                  <Link
                    href="/support"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Contact support
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className={designTokens.text.small}>
              Error persisting?{" "}
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = "/dashboard";
                  }
                }}
                className="text-emerald-400 hover:text-emerald-300 transition-colors underline"
              >
                Clear cache and restart
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
