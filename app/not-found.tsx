import Link from "next/link";
import { Home, ArrowLeft, Search, TrendingUp } from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";
import { designTokens } from "@/lib/design-tokens";

export default function NotFound() {
  return (
    <div className={designTokens.layout.page}>
      <OrbBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="max-w-3xl w-full text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="relative inline-block">
              <h1 className="text-9xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                404
              </h1>
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-purple-500/30 -z-10 animate-blob" />
            </div>
          </div>

          {/* Message */}
          <h2 className={`${designTokens.text.heading} mb-4`}>
            Page Not Found
          </h2>
          <p className={`${designTokens.text.body} mb-8 max-w-xl mx-auto`}>
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>

          {/* Quick Links */}
          <div className={`${designTokens.card.base} mb-8`}>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <Home className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Dashboard</p>
                  <p className="text-sm text-slate-400">Your main hub</p>
                </div>
              </Link>

              <Link
                href="/dashboard/analyses"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Analyses</p>
                  <p className="text-sm text-slate-400">View your reports</p>
                </div>
              </Link>

              <Link
                href="/"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <ArrowLeft className="h-5 w-5 text-purple-400" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Home</p>
                  <p className="text-sm text-slate-400">Back to start</p>
                </div>
              </Link>

              <Link
                href="/pricing"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                  <Search className="h-5 w-5 text-orange-400" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Pricing</p>
                  <p className="text-sm text-slate-400">View plans</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className={`${designTokens.button.primary} inline-flex items-center justify-center gap-2`}
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              <span>Go to Dashboard</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className={`${designTokens.button.secondary} inline-flex items-center justify-center gap-2`}
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Help Text */}
          <p className={`${designTokens.text.small} mt-8`}>
            Need help?{" "}
            <Link
              href="/support"
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
