import Link from "next/link";
import { ArrowRight, TrendingUp, Zap, Shield, BarChart3 } from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";
import { GradientText } from "@/components/ui/gradient-text";
import { BlurText } from "@/components/ui/blur-text";
import { ShinyButton } from "@/components/ui/shiny-button";
import { FadeIn } from "@/components/ui/fade-in";
import { AnimatedCard } from "@/components/ui/animated-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Orb Background */}
      <OrbBackground />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative">
          {/* Navigation */}
          <nav className="container mx-auto px-6 py-6">
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
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-white">AI-Powered Stock</span>
                <br />
                <GradientText>Trading Intelligence</GradientText>
              </h1>

              <div className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
                <BlurText
                  text="Advanced AI-powered platform that analyzes SEC filings, regulatory compliance, and real-time market data to deliver institutional-grade trading intelligence."
                  delay={0.5}
                />
              </div>

              {/* Free Trial CTA */}
              <FadeIn delay={1.2} className="max-w-2xl mx-auto mb-20">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    <GradientText animate={false}>Try Vortis Free</GradientText>
                  </h3>
                  <p className="text-slate-300 mb-6">
                    Get 1 free stock analysis to experience the power of AI-driven trading insights
                  </p>
                  <FreeTrialForm />
                </div>
              </FadeIn>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-8">
                <AnimatedCard delay={0.1}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 h-full hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                    <Zap className="h-12 w-12 text-emerald-400 mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      SEC Filing Analysis
                    </h3>
                    <p className="text-slate-400">
                      Instant insights from 10-K, 10-Q, and 8-K filings with AI-powered pattern detection
                    </p>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.2}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 h-full hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                    <Shield className="h-12 w-12 text-cyan-400 mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Regulatory Tracking
                    </h3>
                    <p className="text-slate-400">
                      Real-time monitoring of compliance changes and regulatory updates that impact your holdings
                    </p>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.3}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8 h-full hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                    <BarChart3 className="h-12 w-12 text-purple-400 mb-4 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Market Intelligence
                    </h3>
                    <p className="text-slate-400">
                      Comprehensive analysis of market trends, insider trading, and institutional movements
                    </p>
                  </div>
                </AnimatedCard>
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
    </div>
  );
}

function FreeTrialForm() {
  return (
    <form className="flex flex-col sm:flex-row gap-4">
      <input
        type="text"
        placeholder="Enter stock ticker (e.g., AAPL)"
        className="flex-1 px-6 py-3 bg-white/5 backdrop-blur border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
      />
      <ShinyButton
        type="submit"
        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg flex items-center justify-center space-x-2"
      >
        <span>Analyze Now</span>
        <ArrowRight className="h-5 w-5" />
      </ShinyButton>
    </form>
  );
}
