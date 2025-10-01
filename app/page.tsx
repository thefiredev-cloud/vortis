import Link from "next/link";
import { ArrowRight, TrendingUp, Zap, Shield, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">VORTIS</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/pricing"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-6 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              AI-Powered Stock
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Trading Intelligence
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Harness the power of Claude Sonnet 4.5 and Octagon MCP to make
              data-driven trading decisions. Revolutionary AI that analyzes
              markets in real-time.
            </p>

            {/* Free Trial CTA */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl font-bold text-white mb-4">
                Try Vortis Free
              </h3>
              <p className="text-slate-300 mb-6">
                Get 1 free stock analysis to experience the power of AI-driven
                trading insights
              </p>
              <FreeTrialForm />
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <Zap className="h-12 w-12 text-emerald-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Real-Time Analysis
                </h3>
                <p className="text-slate-400">
                  Instant market insights powered by advanced AI algorithms
                </p>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <Shield className="h-12 w-12 text-cyan-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Risk Management
                </h3>
                <p className="text-slate-400">
                  Smart risk assessment to protect your investments
                </p>
              </div>
              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <BarChart3 className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Advanced Metrics
                </h3>
                <p className="text-slate-400">
                  Comprehensive data visualization and trend analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <div className="container mx-auto px-6 text-center text-slate-400">
          <p>&copy; 2025 Vortis. Revolutionary AI-powered trading intelligence.</p>
        </div>
      </footer>
    </div>
  );
}

function FreeTrialForm() {
  return (
    <form className="flex flex-col sm:flex-row gap-4">
      <input
        type="text"
        placeholder="Enter stock ticker (e.g., AAPL)"
        className="flex-1 px-6 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
      />
      <button
        type="submit"
        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group"
      >
        <span>Analyze Now</span>
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
}
