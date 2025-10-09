import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Settings,
  Star,
} from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";
import { designTokens } from "@/lib/design-tokens";

export default function DashboardLoading() {
  return (
    <div className={designTokens.layout.page}>
      <OrbBackground />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-slate-800 bg-black/50 backdrop-blur-xl safe-area-inset-top">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Vortis
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className={`${designTokens.loading.skeleton} h-4 w-32 hidden sm:block`} />
                <div className={`${designTokens.loading.skeleton} h-8 w-20`} />
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          <div className={designTokens.grid.dashboard}>
            {/* Sidebar Skeleton */}
            <aside className="lg:col-span-1" aria-label="Loading navigation">
              <div className={designTokens.card.base}>
                <nav className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10">
                    <LayoutDashboard className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                    <div className={`${designTokens.loading.skeleton} h-4 w-24`} />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-slate-600" aria-hidden="true" />
                    <div className={`${designTokens.loading.skeleton} h-4 w-20`} />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
                    <Star className="h-5 w-5 text-slate-600" aria-hidden="true" />
                    <div className={`${designTokens.loading.skeleton} h-4 w-20`} />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
                    <FileText className="h-5 w-5 text-slate-600" aria-hidden="true" />
                    <div className={`${designTokens.loading.skeleton} h-4 w-16`} />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg">
                    <Settings className="h-5 w-5 text-slate-600" aria-hidden="true" />
                    <div className={`${designTokens.loading.skeleton} h-4 w-16`} />
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="lg:col-span-3 space-y-6" aria-label="Loading dashboard content">
              {/* Welcome Card Skeleton */}
              <div className={designTokens.card.gradient}>
                <div className={`${designTokens.loading.skeleton} h-8 w-48 mb-2`} />
                <div className={`${designTokens.loading.skeleton} h-4 w-full max-w-md`} />
              </div>

              {/* Search Bar Skeleton */}
              <div className={designTokens.card.base}>
                <div className="relative">
                  <div className={`${designTokens.loading.skeleton} h-16 w-full rounded-xl`} />
                </div>
              </div>

              {/* Stats Grid Skeleton */}
              <div className={designTokens.grid.stats}>
                <div className={designTokens.card.dashboard}>
                  <div className={`${designTokens.loading.skeleton} h-4 w-32 mb-2`} />
                  <div className={`${designTokens.loading.skeleton} h-10 w-16 mb-2`} />
                  <div className={`${designTokens.loading.skeleton} h-3 w-24`} />
                </div>
                <div className={designTokens.card.dashboard}>
                  <div className={`${designTokens.loading.skeleton} h-4 w-32 mb-2`} />
                  <div className={`${designTokens.loading.skeleton} h-10 w-12 mb-2`} />
                  <div className={`${designTokens.loading.skeleton} h-3 w-20`} />
                </div>
                <div className={designTokens.card.dashboard}>
                  <div className={`${designTokens.loading.skeleton} h-4 w-24 mb-2`} />
                  <div className={`${designTokens.loading.skeleton} h-10 w-20 mb-2`} />
                  <div className={`${designTokens.loading.skeleton} h-3 w-16`} />
                </div>
              </div>

              {/* Recent Analyses Skeleton */}
              <div className={designTokens.card.base}>
                <div className="flex items-center justify-between mb-6">
                  <div className={`${designTokens.loading.skeleton} h-6 w-40`} />
                  <div className={`${designTokens.loading.skeleton} h-4 w-24`} />
                </div>

                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-lg"
                    >
                      <div className={`${designTokens.loading.skeleton} h-12 w-12 rounded-lg`} />
                      <div className="flex-1 space-y-2">
                        <div className={`${designTokens.loading.skeleton} h-5 w-32`} />
                        <div className={`${designTokens.loading.skeleton} h-4 w-48`} />
                      </div>
                      <div className={`${designTokens.loading.skeleton} h-8 w-20 rounded-lg`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart Placeholder Skeleton */}
              <div className={designTokens.card.base}>
                <div className={`${designTokens.loading.skeleton} h-6 w-40 mb-6`} />
                <div className={`${designTokens.loading.skeleton} h-64 w-full rounded-lg`} />
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 right-8 z-50" role="status" aria-live="polite">
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-lg shadow-lg">
          <div className={`${designTokens.loading.spinner} h-5 w-5`} aria-hidden="true" />
          <span className="text-sm text-emerald-400 font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    </div>
  );
}
