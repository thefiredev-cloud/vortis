import Link from "next/link";
import { StockSearch } from "@/components/dashboard/stock-search";
import { TrendingUp } from "lucide-react";
import { designTokens } from "@/lib/design-tokens";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className={designTokens.card.gradient}>
        <h2 className={designTokens.text.heading}>Welcome back!</h2>
        <p className={designTokens.text.body}>
          Ready to analyze your next opportunity? Search for any stock ticker below.
        </p>
      </div>

      {/* Search Bar */}
      <StockSearch />

      {/* Stats Grid */}
      <div className={designTokens.grid.stats}>
        <div className={designTokens.card.base}>
          <p className={designTokens.text.small}>Analyses This Month</p>
          <p className="text-3xl font-bold text-white mt-1">0</p>
          <p className="text-xs text-emerald-400 mt-2">0 of 100 used</p>
        </div>
        <div className={designTokens.card.base}>
          <p className={designTokens.text.small}>Watchlist Items</p>
          <p className="text-3xl font-bold text-white mt-1">0</p>
        </div>
        <div className={designTokens.card.base}>
          <p className={designTokens.text.small}>Current Plan</p>
          <p className="text-3xl font-bold text-white mt-1">Free</p>
          <Link
            href="/pricing"
            className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 inline-block transition-colors"
          >
            Upgrade →
          </Link>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className={designTokens.card.base}>
        <h3 className={designTokens.text.subheading}>Recent Analyses</h3>
        <div className="text-center py-12 mt-4">
          <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className={designTokens.text.small}>No analyses yet</p>
          <p className="text-sm text-slate-500 mt-2">
            Search for a stock ticker above to get started
          </p>
        </div>
      </div>
    </div>
  );
}
