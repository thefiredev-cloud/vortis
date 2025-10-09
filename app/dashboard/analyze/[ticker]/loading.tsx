import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  BarChart3,
  DollarSign,
  FileText,
  Star,
} from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";
import { designTokens } from "@/lib/design-tokens";

export default function AnalysisLoading() {
  // Server component - no hooks needed
  // The actual ticker will be shown once the page loads

  return (
    <div className={designTokens.layout.page}>
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
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to Dashboard</span>
              </Link>

              <div className={`${designTokens.loading.skeleton} h-10 w-40 rounded-lg`} />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="space-y-6" role="status" aria-label="Loading stock analysis">
            {/* Company Header Skeleton */}
            <div className={designTokens.card.gradient}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className={`${designTokens.loading.skeleton} h-10 w-32 mb-4`} />
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`${designTokens.loading.skeleton} h-8 w-24`} />
                    <div className={`${designTokens.loading.skeleton} h-10 w-24 rounded-lg`} />
                  </div>
                  <div className={`${designTokens.loading.skeleton} h-4 w-48`} />
                </div>

                <div className="flex flex-col items-end">
                  <div className={`${designTokens.loading.skeleton} h-4 w-32 mb-2`} />
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
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`${designTokens.loading.skeleton} h-8 w-12`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Indicators Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Activity, color: "purple" },
                { icon: TrendingUp, color: "cyan" },
                { icon: BarChart3, color: "emerald" },
                { icon: BarChart3, color: "orange" },
              ].map((item, index) => (
                <div
                  key={index}
                  className={designTokens.card.base}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 bg-${item.color}-500/10 rounded-lg`}>
                      <item.icon className={`h-5 w-5 text-${item.color}-400`} aria-hidden="true" />
                    </div>
                    <div className={`${designTokens.loading.skeleton} h-4 w-16`} />
                  </div>
                  <div className={`${designTokens.loading.skeleton} h-8 w-20 mb-2`} />
                  <div className={`${designTokens.loading.skeleton} h-3 w-24`} />
                </div>
              ))}
            </div>

            {/* Fundamentals Section Skeleton */}
            <div className={designTokens.card.base}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-400" aria-hidden="true" />
                </div>
                <div className={`${designTokens.loading.skeleton} h-6 w-48`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className={`${designTokens.loading.skeleton} h-4 w-24`} />
                    <div className={`${designTokens.loading.skeleton} h-8 w-16`} />
                    <div className={`${designTokens.loading.skeleton} h-3 w-32`} />
                  </div>
                ))}
              </div>
            </div>

            {/* SEC Filings Section Skeleton */}
            <div className={designTokens.card.base}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-400" aria-hidden="true" />
                </div>
                <div className={`${designTokens.loading.skeleton} h-6 w-40`} />
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`${designTokens.loading.skeleton} h-8 w-16 rounded`} />
                      <div className="flex-1 space-y-2">
                        <div className={`${designTokens.loading.skeleton} h-4 w-32`} />
                        <div className={`${designTokens.loading.skeleton} h-3 w-24`} />
                      </div>
                    </div>
                    <div className={`${designTokens.loading.skeleton} h-4 w-16`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Highlights Skeleton */}
            <div className={designTokens.card.base}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Star className="h-6 w-6 text-green-400" aria-hidden="true" />
                </div>
                <div className={`${designTokens.loading.skeleton} h-6 w-40`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-lg space-y-3">
                    <div className={`${designTokens.loading.skeleton} h-4 w-24`} />
                    <div className={`${designTokens.loading.skeleton} h-8 w-32`} />
                    <div className={`${designTokens.loading.skeleton} h-4 w-28`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Market Sentiment Skeleton */}
            <div className={designTokens.card.base}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Activity className="h-6 w-6 text-pink-400" aria-hidden="true" />
                </div>
                <div className={`${designTokens.loading.skeleton} h-6 w-36`} />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`${designTokens.loading.skeleton} h-12 w-20`} />
                    <div className={`${designTokens.loading.skeleton} h-10 w-24 rounded-lg`} />
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 animate-pulse"
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary Skeleton */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤖</span>
                <div className={`${designTokens.loading.skeleton} h-6 w-48`} />
              </div>
              <div className="space-y-3">
                <div className={`${designTokens.loading.skeleton} h-4 w-full`} />
                <div className={`${designTokens.loading.skeleton} h-4 w-full`} />
                <div className={`${designTokens.loading.skeleton} h-4 w-3/4`} />
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className={`${designTokens.loading.skeleton} h-3 w-40`} />
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 pb-8">
              <div className={`${designTokens.loading.skeleton} flex-1 h-14 rounded-lg`} />
              <div className={`${designTokens.loading.skeleton} flex-1 h-14 rounded-lg`} />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 right-8 z-50" role="status" aria-live="polite">
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-lg shadow-lg">
          <div className={`${designTokens.loading.spinner} h-5 w-5`} aria-hidden="true" />
          <span className="text-sm text-emerald-400 font-medium">
            Analyzing stock...
          </span>
        </div>
      </div>
    </div>
  );
}
