"use client";

import { useState, useCallback, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import { BlurText } from "@/components/ui/blur-text";
import { FadeIn } from "@/components/ui/fade-in";
import { LiveCounter } from "@/components/ui/live-counter";
import { ShinyButton } from "@/components/ui/shiny-button";

/**
 * Popular stock tickers for quick access
 */
const POPULAR_TICKERS = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"] as const;

type PopularTicker = typeof POPULAR_TICKERS[number];

interface TickerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: string;
  disabled?: boolean;
}

/**
 * Stock ticker input with validation and popular tickers
 */
function TickerInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  isSuccess,
  error,
  disabled = false,
}: TickerInputProps) {
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit();
    },
    [onSubmit]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value.toUpperCase());
    },
    [onChange]
  );

  const handleTickerClick = useCallback(
    (ticker: PopularTicker) => {
      if (!disabled && !isLoading && !isSuccess) {
        onChange(ticker);
      }
    },
    [disabled, isLoading, isSuccess, onChange]
  );

  const inputClasses = `
    w-full px-6 py-4 bg-white/5 backdrop-blur-xl
    border ${error ? "border-red-500/50" : isSuccess ? "border-emerald-500/50" : "border-white/10"}
    rounded-xl text-white placeholder-slate-400
    focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    text-lg font-medium
  `;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="Enter stock ticker (e.g., AAPL)"
            disabled={disabled || isLoading || isSuccess}
            className={inputClasses}
            maxLength={5}
            aria-label="Stock ticker symbol"
            aria-invalid={!!error}
            aria-describedby={error ? "ticker-error" : undefined}
            autoComplete="off"
            autoCapitalize="characters"
          />
          {isSuccess && (
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 icon-animate-enter"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
          )}
          {error && !isSuccess && (
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 icon-animate-enter"
              aria-hidden="true"
            >
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
          )}
        </div>

        <ShinyButton
          type="submit"
          disabled={disabled || isLoading || isSuccess || !!error || !value}
          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] transition-all duration-200"
          aria-label={isLoading ? "Analyzing stock" : "Analyze stock"}
        >
          {isLoading ? (
            <>
              <div
                className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label="Loading"
              />
              <span>Analyzing...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              <span>Success!</span>
            </>
          ) : (
            <>
              <span>Analyze Now</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </>
          )}
        </ShinyButton>
      </form>

      {error && (
        <p
          id="ticker-error"
          className="text-red-400 text-sm mt-3 ml-2 error-message-enter"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm text-slate-400 font-medium">Popular:</span>
        {POPULAR_TICKERS.map((ticker) => (
          <button
            key={ticker}
            type="button"
            onClick={() => handleTickerClick(ticker)}
            disabled={disabled || isLoading || isSuccess}
            className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
            aria-label={`Analyze ${ticker}`}
          >
            {ticker}
          </button>
        ))}
      </div>
    </div>
  );
}

interface NavigationProps {
  /** Additional CSS classes for the navigation container */
  className?: string;
}

/**
 * Top navigation bar with logo and links
 */
function Navigation({ className = "" }: NavigationProps) {
  return (
    <nav className={`container mx-auto px-6 py-6 ${className}`} aria-label="Main navigation">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Vortis home">
          <TrendingUp
            className="h-8 w-8 text-emerald-400 group-hover:text-emerald-300 transition-colors"
            aria-hidden="true"
          />
          <span className="text-2xl font-bold text-white group-hover:text-emerald-50 transition-colors">
            VORTIS
          </span>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/pricing"
            className="text-slate-300 hover:text-white transition-colors text-sm md:text-base font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 text-sm md:text-base touch-manipulation"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

interface HeroSectionProps {
  /** Callback when stock analysis is triggered */
  onAnalyze?: (ticker: string) => Promise<void>;
  /** Custom headline */
  headline?: string;
  /** Custom subheadline */
  subheadline?: string;
}

/**
 * Hero section component with stock ticker input, popular stocks, and CTA
 *
 * @example
 * ```tsx
 * <HeroSection
 *   onAnalyze={async (ticker) => {
 *     await analyzeStock(ticker);
 *   }}
 * />
 * ```
 */
export function HeroSection({
  onAnalyze,
  headline = "AI-Powered Stock Trading Intelligence",
  subheadline = "Access comprehensive financial intelligence from 8,000+ public companies and 3M+ private companies. Analyze 10 years of SEC filings, earnings transcripts, and institutional holdings—all in seconds.",
}: HeroSectionProps) {
  const [ticker, setTicker] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateTicker = useCallback((value: string): string => {
    if (value.length === 0) return "";
    if (value.length > 5) return "Ticker must be 5 characters or less";
    if (!/^[A-Z]+$/.test(value)) return "Ticker must contain only letters";
    return "";
  }, []);

  const handleTickerChange = useCallback(
    (value: string) => {
      const upperValue = value.toUpperCase();
      setTicker(upperValue);
      setError(validateTicker(upperValue));
      setSuccess(false);
    },
    [validateTicker]
  );

  const handleSubmit = useCallback(async () => {
    const validationError = validateTicker(ticker);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (ticker.length === 0) {
      setError("Please enter a stock ticker");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (onAnalyze) {
        await onAnalyze(ticker);
      } else {
        // Default behavior: navigate to dashboard
        window.location.href = `/dashboard/analyze/${ticker}`;
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTicker("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze stock");
    } finally {
      setIsLoading(false);
    }
  }, [ticker, validateTicker, onAnalyze]);

  return (
    <div className="relative min-h-screen">
      <Navigation />

      <div className="container mx-auto px-6 pt-12 md:pt-20 pb-24 md:pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Live Counter Badge */}
          <FadeIn delay={0.2} className="mb-6 md:mb-8 flex justify-center">
            <LiveCounter />
          </FadeIn>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 leading-tight">
            <span className="text-white">AI-Powered Stock</span>
            <br />
            <GradientText>{headline.split("AI-Powered Stock ")[1] || headline}</GradientText>
          </h1>

          {/* Subheadline */}
          <div className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-12 md:mb-16 max-w-3xl mx-auto">
            <BlurText text={subheadline} delay={0.5} />
          </div>

          {/* Stock Ticker Input */}
          <FadeIn delay={0.8}>
            <div className="mb-16 md:mb-20">
              <TickerInput
                value={ticker}
                onChange={handleTickerChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                isSuccess={success}
                error={error}
              />
            </div>
          </FadeIn>

          {/* Value Proposition */}
          <FadeIn delay={1.0}>
            <p className="text-slate-400 text-sm md:text-base">
              Join thousands of traders who analyze stocks 10x faster with Vortis
            </p>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
