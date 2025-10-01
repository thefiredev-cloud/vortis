import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrbBackground } from "@/components/ui/orb-background";
import { StockSearch } from "@/components/dashboard/stock-search";
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Star,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <OrbBackground />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-slate-800 bg-black/50 backdrop-blur-xl safe-area-inset-top">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Vortis
                </h1>
              </Link>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400 hidden sm:block">
                  {user.email}
                </span>
                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors touch-manipulation"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <nav className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link
                    href="/dashboard/analyses"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span>Analyses</span>
                  </Link>
                  <Link
                    href="/dashboard/watchlist"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Star className="h-5 w-5" />
                    <span>Watchlist</span>
                  </Link>
                  <Link
                    href="/dashboard/reports"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Reports</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3 space-y-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome back!
                </h2>
                <p className="text-slate-300">
                  Ready to analyze your next opportunity? Search for any stock ticker below.
                </p>
              </div>

              {/* Search Bar */}
              <StockSearch />

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-1">Analyses This Month</p>
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-xs text-emerald-400 mt-2">0 of 100 used</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-1">Watchlist Items</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-1">Current Plan</p>
                  <p className="text-3xl font-bold text-white">Free</p>
                  <Link
                    href="/pricing"
                    className="text-xs text-emerald-400 hover:text-emerald-300 mt-2 inline-block"
                  >
                    Upgrade →
                  </Link>
                </div>
              </div>

              {/* Recent Analyses */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Recent Analyses
                </h3>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-2">No analyses yet</p>
                  <p className="text-sm text-slate-500">
                    Search for a stock ticker above to get started
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
