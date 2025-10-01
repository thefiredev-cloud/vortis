"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OrbBackground } from "@/components/ui/orb-background";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Star,
  FileText,
  BarChart3,
  DollarSign,
  Activity,
  Calendar,
  CheckCircle,
  Minus,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// TypeScript interfaces for analysis data
interface TechnicalIndicators {
  rsi: number;
  macd: string;
  sma50: number;
  sma200: number;
}

interface Fundamentals {
  peRatio: number;
  epsGrowth: number;
  debtToEquity: number;
}

interface Sentiment {
  score: number;
  trend: string;
}

interface Analysis {
  recommendation: "BUY" | "SELL" | "HOLD";
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  technicalIndicators: TechnicalIndicators;
  fundamentals: Fundamentals;
  sentiment: Sentiment;
  summary: string;
}

interface AnalysisData {
  ticker: string;
  timestamp: string;
  analysis: Analysis;
}

interface ApiResponse {
  success: boolean;
  data: AnalysisData;
  error?: string;
}

// Skeleton loader components
function SkeletonCard() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-white/10 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-white/10 rounded w-1/2"></div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 animate-pulse">
        <div className="h-8 bg-white/10 rounded w-1/4 mb-4"></div>
        <div className="h-12 bg-white/10 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Large Card Skeleton */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
          <div className="h-4 bg-white/10 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

// Main page component
function AnalysisPageContent() {
  const params = useParams();
  const router = useRouter();
  const ticker = params.ticker as string;

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    if (!ticker) return;

    async function fetchAnalysis() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticker: ticker.toUpperCase() }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch analysis");
        }

        const result: ApiResponse = await response.json();

        if (result.success && result.data) {
          setAnalysisData(result.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching analysis:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load analysis"
        );
        toast.error(
          err instanceof Error ? err.message : "Failed to load analysis"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [ticker]);

  // Check if stock is in watchlist
  useEffect(() => {
    async function checkWatchlist() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("watchlist")
            .select("id")
            .eq("user_id", user.id)
            .eq("ticker", ticker.toUpperCase())
            .single();

          setIsInWatchlist(!!data);
        }
      } catch (err) {
        // Not in watchlist or error checking
        setIsInWatchlist(false);
      }
    }

    checkWatchlist();
  }, [ticker]);

  const handleSaveToWatchlist = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please sign in to save to watchlist");
        router.push("/auth/login");
        return;
      }

      if (isInWatchlist) {
        // Remove from watchlist
        const { error } = await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("ticker", ticker.toUpperCase());

        if (error) throw error;

        setIsInWatchlist(false);
        toast.success(`${ticker.toUpperCase()} removed from watchlist`);
      } else {
        // Add to watchlist
        const { error } = await supabase.from("watchlist").insert({
          user_id: user.id,
          ticker: ticker.toUpperCase(),
          current_price: analysisData?.analysis.currentPrice || 0,
        });

        if (error) throw error;

        setIsInWatchlist(true);
        toast.success(`${ticker.toUpperCase()} added to watchlist`);
      }
    } catch (err) {
      console.error("Error updating watchlist:", err);
      toast.error("Failed to update watchlist");
    } finally {
      setIsSaving(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "BUY":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "SELL":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "HOLD":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "BUY":
        return <TrendingUp className="h-5 w-5" />;
      case "SELL":
        return <TrendingDown className="h-5 w-5" />;
      case "HOLD":
        return <Minus className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return "text-emerald-400";
    if (score >= 0.4) return "text-yellow-400";
    return "text-red-400";
  };

  const getSentimentBadge = (trend: string) => {
    const colors: Record<string, string> = {
      Positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Neutral: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Negative: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return colors[trend] || colors.Neutral;
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <OrbBackground />
        <div className="relative z-10">
          {/* Breadcrumb */}
          <div className="border-b border-slate-800 bg-black/50 backdrop-blur-xl safe-area-inset-top">
            <div className="container mx-auto px-6 py-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit touch-manipulation"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Error Content */}
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Analysis Failed
                </h2>
                <p className="text-slate-300 mb-6">{error}</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors touch-manipulation"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all touch-manipulation"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <OrbBackground />

      <div className="relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-slate-800 bg-black/50 backdrop-blur-xl safe-area-inset-top">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors touch-manipulation"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>

              {!loading && analysisData && (
                <ShinyButton
                  onClick={handleSaveToWatchlist}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all touch-manipulation ${
                    isInWatchlist
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star
                      className={`h-4 w-4 ${
                        isInWatchlist ? "fill-current" : ""
                      }`}
                    />
                  )}
                  <span className="hidden sm:inline">
                    {isInWatchlist ? "Remove from Watchlist" : "Save to Watchlist"}
                  </span>
                </ShinyButton>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            analysisData && (
              <div className="space-y-6">
                {/* Company Header */}
                <AnimatedCard delay={0.1}>
                  <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                          {analysisData.ticker}
                        </h1>
                        <div className="flex items-center gap-4">
                          <p className="text-3xl font-semibold text-emerald-400">
                            $
                            {analysisData.analysis.currentPrice.toFixed(2)}
                          </p>
                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getRecommendationColor(
                              analysisData.analysis.recommendation
                            )}`}
                          >
                            {getRecommendationIcon(
                              analysisData.analysis.recommendation
                            )}
                            <span className="font-semibold">
                              {analysisData.analysis.recommendation}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">
                          Target Price: $
                          {analysisData.analysis.targetPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <p className="text-sm text-slate-400 mb-2">
                          Confidence Score
                        </p>
                        <div className="relative w-24 h-24">
                          <svg className="w-24 h-24 -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-white/10"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${
                                2 * Math.PI * 40 * analysisData.analysis.confidence
                              } ${2 * Math.PI * 40}`}
                              className="text-emerald-400 transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {Math.round(analysisData.analysis.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Technical Indicators Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <AnimatedCard delay={0.2}>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 touch-manipulation hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Activity className="h-5 w-5 text-purple-400" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                          RSI
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {analysisData.analysis.technicalIndicators.rsi.toFixed(
                          1
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {analysisData.analysis.technicalIndicators.rsi > 70
                          ? "Overbought"
                          : analysisData.analysis.technicalIndicators.rsi < 30
                          ? "Oversold"
                          : "Neutral"}
                      </p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard delay={0.25}>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 touch-manipulation hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-cyan-400" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                          MACD
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {analysisData.analysis.technicalIndicators.macd}
                      </p>
                      <p className="text-xs text-slate-500">Signal</p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard delay={0.3}>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 touch-manipulation hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-emerald-400" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                          SMA 50
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        $
                        {analysisData.analysis.technicalIndicators.sma50.toFixed(
                          2
                        )}
                      </p>
                      <p className="text-xs text-slate-500">50-Day Average</p>
                    </div>
                  </AnimatedCard>

                  <AnimatedCard delay={0.35}>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 touch-manipulation hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-orange-400" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">
                          SMA 200
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        $
                        {analysisData.analysis.technicalIndicators.sma200.toFixed(
                          2
                        )}
                      </p>
                      <p className="text-xs text-slate-500">200-Day Average</p>
                    </div>
                  </AnimatedCard>
                </div>

                {/* Fundamentals Section */}
                <AnimatedCard delay={0.4}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <DollarSign className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        Fundamental Analysis
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p className="text-slate-400 text-sm">P/E Ratio</p>
                        <p className="text-2xl font-bold text-white">
                          {analysisData.analysis.fundamentals.peRatio.toFixed(
                            2
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          Price to Earnings
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-slate-400 text-sm">EPS Growth</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          +
                          {analysisData.analysis.fundamentals.epsGrowth.toFixed(
                            1
                          )}
                          %
                        </p>
                        <p className="text-xs text-slate-500">Year over Year</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-slate-400 text-sm">
                          Debt to Equity
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {analysisData.analysis.fundamentals.debtToEquity.toFixed(
                            2
                          )}
                        </p>
                        <p className="text-xs text-slate-500">Leverage Ratio</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* SEC Filings Section */}
                <AnimatedCard delay={0.45}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <FileText className="h-6 w-6 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        Recent SEC Filings
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          type: "10-Q",
                          date: "2025-09-15",
                          title: "Quarterly Report",
                        },
                        {
                          type: "8-K",
                          date: "2025-08-28",
                          title: "Current Report",
                        },
                        {
                          type: "10-K",
                          date: "2025-06-30",
                          title: "Annual Report",
                        },
                      ].map((filing, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors touch-manipulation"
                        >
                          <div className="flex items-center gap-4">
                            <div className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded font-mono text-sm font-semibold">
                              {filing.type}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {filing.title}
                              </p>
                              <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(filing.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                            View →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedCard>

                {/* Earnings Highlights */}
                <AnimatedCard delay={0.5}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        Earnings Highlights
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-slate-400 text-sm mb-2">
                          Last Quarter
                        </p>
                        <p className="text-2xl font-bold text-white mb-1">
                          $1.32 EPS
                        </p>
                        <div className="flex items-center gap-2 text-emerald-400 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Beat by $0.08</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-slate-400 text-sm mb-2">
                          Next Earnings
                        </p>
                        <p className="text-2xl font-bold text-white mb-1">
                          Oct 24, 2025
                        </p>
                        <p className="text-slate-500 text-sm">
                          Estimated: $1.45 EPS
                        </p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Overall Sentiment */}
                <AnimatedCard delay={0.55}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-pink-500/10 rounded-lg">
                        <Activity className="h-6 w-6 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        Market Sentiment
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`text-5xl font-bold ${getSentimentColor(
                              analysisData.analysis.sentiment.score
                            )}`}
                          >
                            {Math.round(
                              analysisData.analysis.sentiment.score * 100
                            )}
                            %
                          </div>
                          <div
                            className={`px-4 py-2 rounded-lg border font-semibold ${getSentimentBadge(
                              analysisData.analysis.sentiment.trend
                            )}`}
                          >
                            {analysisData.analysis.sentiment.trend}
                          </div>
                        </div>

                        {/* Sentiment Bar */}
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 transition-all duration-1000"
                            style={{
                              width: `${
                                analysisData.analysis.sentiment.score * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* AI Summary */}
                <AnimatedCard delay={0.6}>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">🤖</span>
                      AI Analysis Summary
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-lg">
                      {analysisData.analysis.summary}
                    </p>
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Generated on{" "}
                        {new Date(analysisData.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pb-8">
                  <button className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                    Download Full Report
                  </button>
                  <button className="flex-1 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                    Share Analysis
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Error boundary wrapper
export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <AnalysisPageContent />
    </Suspense>
  );
}
