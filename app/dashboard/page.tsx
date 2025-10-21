import Link from "next/link";
import { StockSearch } from "@/components/dashboard/stock-search";
import { Watchlist } from "@/components/dashboard/watchlist";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { TrendingUp, Search, Star, Zap } from "lucide-react";
import { designTokens } from "@/lib/design-tokens";

export default function DashboardPage() {
  // Mock data - in production, fetch from API
  const mockWatchlistItems: Array<{
    id: string;
    ticker: string;
    companyName: string;
    currentPrice: number;
    priceChange: number;
    percentChange: number;
    alertEnabled: boolean;
    alertPrice?: number;
  }> = [];

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

      {/* Stats Grid - Enhanced with AnalyticsCard */}
      <div className={designTokens.grid.stats}>
        <AnalyticsCard
          title="Analyses This Month"
          value="0 / 100"
          icon={Search}
          iconColor="text-emerald-400"
          description="Starter plan limit"
        />
        <AnalyticsCard
          title="Watchlist Items"
          value={mockWatchlistItems.length}
          icon={Star}
          iconColor="text-cyan-400"
          description="Stocks you're tracking"
        />
        <AnalyticsCard
          title="Current Plan"
          value="Free"
          icon={Zap}
          iconColor="text-purple-400"
          description={
            <Link
              href="/pricing"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Upgrade →
            </Link>
          }
        />
      </div>

      {/* Watchlist Section */}
      <Watchlist
        items={mockWatchlistItems}
        onAdd={(ticker) => {
          // TODO: Implement add to watchlist
          console.log('Add to watchlist:', ticker);
        }}
        onRemove={(id) => {
          // TODO: Implement remove from watchlist
          console.log('Remove from watchlist:', id);
        }}
        onToggleAlert={(id) => {
          // TODO: Implement toggle alert
          console.log('Toggle alert:', id);
        }}
      />

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
