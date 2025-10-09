import { FileText, Mic, LineChart, Building2, Rocket, Search } from "lucide-react";
export const dynamic = 'force-dynamic';
import { OrbBackground } from "@/components/ui/orb-background";
import { AnimatedCard } from "@/components/ui/animated-card";
import { StatBar } from "@/components/ui/stat-bar";
import { FloatingCTA } from "@/components/ui/floating-cta";
import { EnhancedHero } from "@/components/sections/enhanced-hero";
import { SocialProof } from "@/components/sections/social-proof";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { TrustBadges } from "@/components/sections/trust-badges";

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Orb Background */}
      <OrbBackground />

      {/* Content */}
      <div className="relative z-10">
        {/* Enhanced Hero Section */}
        <EnhancedHero />

        {/* Features Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedCard delay={0.1}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                    <FileText className="h-10 w-10 text-emerald-400 mb-3 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">
                      Instant SEC Filing Insights
                    </h3>
                    <p className="text-slate-400 text-sm text-center mb-3">
                      Analyze 10-K, 10-Q, and 8-K filings from 8,000+ companies. Extract revenue trends, risk factors, and management commentary in seconds.
                    </p>
                    <div className="text-xs text-emerald-400/70 text-center font-medium">
                      10+ years historical
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.15}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                    <Mic className="h-10 w-10 text-cyan-400 mb-3 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">
                      Earnings Call Analysis
                    </h3>
                    <p className="text-slate-400 text-sm text-center mb-3">
                      Access and analyze earnings call transcripts with sentiment analysis. Track management tone and forward guidance instantly.
                    </p>
                    <div className="text-xs text-cyan-400/70 text-center font-medium">
                      10 years of transcripts
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.2}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                    <LineChart className="h-10 w-10 text-purple-400 mb-3 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">
                      20+ Technical Indicators
                    </h3>
                    <p className="text-slate-400 text-sm text-center mb-3">
                      RSI, MACD, Bollinger Bands, Moving Averages, Fibonacci Retracement, Ichimoku Cloud, and more—updated in real-time.
                    </p>
                    <div className="text-xs text-purple-400/70 text-center font-medium">
                      Real-time updates
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.25}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                    <Building2 className="h-10 w-10 text-blue-400 mb-3 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">
                      13F Filing Monitor
                    </h3>
                    <p className="text-slate-400 text-sm text-center mb-3">
                      Track what institutions are buying and selling. Monitor hedge fund positions and identify emerging investment trends.
                    </p>
                    <div className="text-xs text-blue-400/70 text-center font-medium">
                      Quarterly updates
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.3}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
                    <Rocket className="h-10 w-10 text-pink-400 mb-3 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">
                      Private Market Access
                    </h3>
                    <p className="text-slate-400 text-sm text-center mb-3">
                      Research 3M+ private companies, track 500k+ funding rounds, and monitor M&A activity across industries.
                    </p>
                    <div className="text-xs text-pink-400/70 text-center font-medium">
                      3M+ companies
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={0.35}>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300">
                    <Search className="h-10 w-10 text-orange-400 mb-3 mx-auto" />
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">
                      Ultra-Fast Research
                    </h3>
                    <p className="text-slate-400 text-sm text-center mb-3">
                      Comprehensive market research 8-10x faster than traditional methods. No rate limits, unlimited queries.
                    </p>
                    <div className="text-xs text-orange-400/70 text-center font-medium">
                      8-10x faster
                    </div>
                  </div>
                </AnimatedCard>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <StatBar />

        {/* Social Proof */}
        <SocialProof />

        {/* How It Works */}
        <HowItWorks />

        {/* Testimonials */}
        <Testimonials />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Floating CTA */}
        <FloatingCTA />

        {/* Footer */}
        <footer className="border-t border-slate-800 py-12">
          <div className="container mx-auto px-6 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} Vortis. Revolutionary AI-powered trading intelligence.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
