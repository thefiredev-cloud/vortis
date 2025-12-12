"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  TrendingUp,
  Search,
  Clock,
} from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";
import { designTokens } from "@/lib/design-tokens";
import { toast } from "sonner";

interface AnalysisErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AnalysisError({ error, reset }: AnalysisErrorProps) {
  const params = useParams();
  const ticker = (params.ticker as string)?.toUpperCase() || "UNKNOWN";
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Log analysis-specific error
    console.error(`Analysis error for ${ticker}:`, error);

    // Report to analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: `Analysis Error (${ticker}): ${error.message}`,
        fatal: false,
      });
    }
  }, [error, ticker]);

  // Circuit breaker: prevent immediate retries
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRetry = async () => {
    if (countdown > 0) {
      toast.warning(`Please wait ${countdown} seconds before retrying`);
      return;
    }

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
    setCountdown(Math.ceil(delay / 1000));

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      reset();
      toast.success("Retrying analysis...");
    } catch (err) {
      console.error("Retry failed:", err);
      toast.error("Retry failed. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorType = (): {
    title: string;
    message: string;
    suggestion: string;
  } => {
    const msg = error.message.toLowerCase();

    if (msg.includes("not found") || msg.includes("invalid ticker")) {
      return {
        title: "Invalid Ticker Symbol",
        message: `${ticker} doesn't appear to be a valid stock ticker.`,
        suggestion: "Double-check the ticker symbol and try again.",
      };
    }

    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return {
        title: "Rate Limit Exceeded",
        message: "You've made too many analysis requests recently.",
        suggestion: "Please wait a few minutes before trying again.",
      };
    }

    if (msg.includes("timeout") || msg.includes("timed out")) {
      return {
        title: "Request Timed Out",
        message: `Analysis for ${ticker} took too long to complete.`,
        suggestion: "This ticker may be experiencing high traffic. Try again shortly.",
      };
    }

    if (msg.includes("network") || msg.includes("fetch failed")) {
      return {
        title: "Network Error",
        message: "Unable to connect to the analysis service.",
        suggestion: "Check your internet connection and try again.",
      };
    }

    if (msg.includes("quota") || msg.includes("limit exceeded")) {
      return {
        title: "Analysis Quota Exceeded",
        message: "You've reached your monthly analysis limit.",
        suggestion: "Upgrade your plan to analyze more stocks.",
      };
    }

    return {
      title: "Analysis Failed",
      message: `Unable to analyze ${ticker} at this time.`,
      suggestion: "Try again in a few moments or contact support if the issue persists.",
    };
  };

  const errorInfo = getErrorType();
  const canRetry = retryCount < maxRetries;

  return (
    <div className={designTokens.layout.page}>
      <OrbBackground />

      <div className="relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-slate-800 bg-black/50 backdrop-blur-xl safe-area-inset-top">
          <div className="container mx-auto px-6 py-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className={designTokens.card.base}>
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-500/10 rounded-full">
                  <AlertCircle
                    className="h-16 w-16 text-red-400"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Ticker Context */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                  <TrendingUp className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  <span className="text-white font-semibold text-lg">
                    {ticker}
                  </span>
                </div>
              </div>

              {/* Error Title */}
              <h1 className={`${designTokens.text.heading} text-center mb-4`}>
                {errorInfo.title}
              </h1>

              {/* Error Message */}
              <p className={`${designTokens.text.body} text-center mb-2`}>
                {errorInfo.message}
              </p>

              <p className={`${designTokens.text.small} text-center mb-6`}>
                {errorInfo.suggestion}
              </p>

              {/* Rate Limit Warning */}
              {errorInfo.title.includes("Rate Limit") && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                    <span className="font-medium">Cooling Down</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    To ensure fair usage, we limit the number of analyses per hour.
                    Your access will be restored shortly.
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
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Ticker: {ticker}</p>
                    <p>Retry Count: {retryCount} / {maxRetries}</p>
                    <p>Timestamp: {new Date().toISOString()}</p>
                  </div>
                </div>
              </details>

              {/* Retry Progress */}
              {retryCount > 0 && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">
                      Retry attempts: {retryCount} / {maxRetries}
                    </span>
                    {countdown > 0 && (
                      <span className="text-sm text-emerald-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        Wait {countdown}s
                      </span>
                    )}
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(retryCount / maxRetries) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {canRetry && (
                    <button
                      onClick={handleRetry}
                      disabled={isRetrying || countdown > 0}
                      className={`${designTokens.button.primary} flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label="Retry analysis"
                    >
                      {isRetrying ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" aria-hidden="true" />
                          <span>Retrying...</span>
                        </>
                      ) : countdown > 0 ? (
                        <>
                          <Clock className="h-5 w-5" aria-hidden="true" />
                          <span>Wait {countdown}s</span>
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
                    href="/dashboard"
                    className={`${designTokens.button.secondary} flex-1 flex items-center justify-center gap-2`}
                  >
                    <Search className="h-5 w-5" aria-hidden="true" />
                    <span>New Search</span>
                  </Link>
                </div>

                <Link
                  href="/dashboard"
                  className={`${designTokens.button.outlined} flex items-center justify-center gap-2`}
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  <span>Back to Dashboard</span>
                </Link>
              </div>

              {/* Upgrade Prompt for Quota Issues */}
              {errorInfo.title.includes("Quota") && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-center">
                    <p className={`${designTokens.text.body} mb-4`}>
                      Need more analyses?
                    </p>
                    <Link
                      href="/pricing"
                      className={`${designTokens.button.gradient} inline-flex items-center gap-2`}
                    >
                      View Pricing Plans
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className={designTokens.text.small}>
                Need help?{" "}
                <Link
                  href="/support"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Contact support
                </Link>
                {" or "}
                <Link
                  href="/docs"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  view documentation
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
