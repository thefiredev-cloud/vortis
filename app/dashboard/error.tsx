"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, LogOut, Shield } from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";
import { designTokens } from "@/lib/design-tokens";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Log dashboard-specific error
    console.error("Dashboard error:", error);

    // Report to analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: `Dashboard Error: ${error.message}`,
        fatal: false,
      });
    }
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      reset();
    } catch (err) {
      console.error("Retry failed:", err);
      toast.error("Retry failed. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) throw signOutError;

      toast.success("Signed out successfully");
      router.push("/auth/login");
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Failed to sign out");
      setIsSigningOut(false);
    }
  };

  const isAuthError =
    error.message.includes("auth") ||
    error.message.includes("unauthorized") ||
    error.message.includes("token") ||
    error.message.includes("session");

  const getUserFriendlyMessage = (): string => {
    if (isAuthError) {
      return "Your session may have expired. Please sign in again to continue.";
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
      return "Unable to load dashboard data. Please check your connection.";
    }
    if (error.message.includes("permission") || error.message.includes("403")) {
      return "You don't have permission to access this resource.";
    }
    return "An error occurred while loading your dashboard.";
  };

  const canRetry = retryCount < maxRetries && !isAuthError;

  return (
    <div className={designTokens.layout.page}>
      <OrbBackground />

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-slate-800 bg-black/50 backdrop-blur-xl safe-area-inset-top">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Vortis
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className={designTokens.card.base}>
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${isAuthError ? 'bg-orange-500/10' : 'bg-red-500/10'}`}>
                {isAuthError ? (
                  <Shield className="h-16 w-16 text-orange-400" aria-hidden="true" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-red-400" aria-hidden="true" />
                )}
              </div>
            </div>

            {/* Error Title */}
            <h1 className={`${designTokens.text.heading} text-center mb-4`}>
              {isAuthError ? "Authentication Required" : "Dashboard Error"}
            </h1>

            {/* User-friendly message */}
            <p className={`${designTokens.text.body} text-center mb-6`}>
              {getUserFriendlyMessage()}
            </p>

            {/* Auth Error Warning */}
            {isAuthError && (
              <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <p className="text-sm text-orange-400 text-center">
                  For your security, please sign in again to continue.
                </p>
              </div>
            )}

            {/* Technical Details */}
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
              </div>
            </details>

            {/* Retry Counter */}
            {retryCount > 0 && canRetry && (
              <div className="mb-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                <span>Retry attempts: {retryCount} / {maxRetries}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              {isAuthError ? (
                <>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={`${designTokens.button.primary} flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label="Sign out and return to login"
                  >
                    {isSigningOut ? (
                      <>
                        <LogOut className="h-5 w-5 animate-pulse" aria-hidden="true" />
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-5 w-5" aria-hidden="true" />
                        <span>Sign Out & Return to Login</span>
                      </>
                    )}
                  </button>
                  <Link
                    href="/"
                    className={`${designTokens.button.secondary} flex items-center justify-center gap-2`}
                  >
                    <Home className="h-5 w-5" aria-hidden="true" />
                    <span>Go to Home</span>
                  </Link>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  {canRetry && (
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className={`${designTokens.button.primary} flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label="Retry loading dashboard"
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

                  <Link
                    href="/"
                    className={`${designTokens.button.secondary} flex-1 flex items-center justify-center gap-2`}
                  >
                    <Home className="h-5 w-5" aria-hidden="true" />
                    <span>Go to Home</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={`${designTokens.button.outlined} flex-1 flex items-center justify-center gap-2 disabled:opacity-50`}
                    aria-label="Sign out"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Help Section */}
            {!canRetry && !isAuthError && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className={`${designTokens.text.small} text-center`}>
                  Issue persisting?{" "}
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

          {/* Additional Actions */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = "/auth/login";
                }
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors underline"
            >
              Clear cache and sign in again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
