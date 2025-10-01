import Link from "next/link";
import { Check, TrendingUp } from "lucide-react";
import { OrbBackground } from "@/components/ui/orb-background";
import { GradientText } from "@/components/ui/gradient-text";
import { BlurText } from "@/components/ui/blur-text";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ShinyButton } from "@/components/ui/shiny-button";
import { FeatureComparison } from "@/components/sections/feature-comparison";
import { TrustBadges } from "@/components/sections/trust-badges";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Orb Background */}
      <OrbBackground />

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">VORTIS</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Home
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

        {/* Pricing Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="text-white">Choose Your </span>
                <GradientText>Trading Plan</GradientText>
              </h1>
              <div className="text-xl text-slate-300 max-w-2xl mx-auto">
                <BlurText
                  text="Scale your trading strategy with comprehensive SEC filing analysis, regulatory tracking, and real-time market intelligence across all plans."
                  delay={0.3}
                />
              </div>
            </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <AnimatedCard delay={0.1}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-slate-400 mb-6">Perfect for beginners</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">100 stock analyses/month</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">SEC filing summaries (last 2 years)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">5 technical indicators (RSI, MACD, SMA, EMA, Volume)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Daily market alerts via email</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Access to 8,000+ public companies</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all hover:scale-105">
                Get Started
              </button>
              </div>
            </AnimatedCard>

            {/* Pro - Featured */}
            <AnimatedCard delay={0.2}>
              <div className="bg-gradient-to-b from-emerald-500/20 to-cyan-500/10 backdrop-blur-xl border-2 border-emerald-500/70 rounded-2xl p-8 relative transform md:scale-105 shadow-2xl shadow-emerald-500/40 h-full">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-slate-400 mb-6">For serious traders</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Unlimited stock analyses</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Full SEC filing access (10 years: 10-K, 10-Q, 8-K)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">20+ technical indicators with real-time updates</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Earnings transcript analysis (10 years)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">13F institutional holdings tracking</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Real-time alerts (SMS + Email)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Portfolio optimization tools</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Priority support (24/7)</span>
                </li>
              </ul>
              <ShinyButton className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg">
                Get Started
              </ShinyButton>
              </div>
            </AnimatedCard>

            {/* Enterprise */}
            <AnimatedCard delay={0.3}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-slate-400 mb-6">For institutions</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">$299</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Everything in Pro, plus:</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Private company data (3M+ companies)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Funding round tracking (500k+ deals)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">M&A transaction database (2M+ deals)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Full REST API access (unlimited calls)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Custom research requests</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">Dedicated account manager</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300">White-label options available</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all hover:scale-105">
                Contact Sales
              </button>
              </div>
            </AnimatedCard>
          </div>

          {/* Feature Comparison */}
          <FeatureComparison />

          {/* Trust Indicators */}
          <div className="mt-20 text-center">
            <p className="text-slate-400 mb-4">Trusted by traders worldwide</p>
            <p className="text-sm text-slate-500">
              All plans include 14-day money-back guarantee • Cancel anytime
            </p>
          </div>

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </div>
      </div>
    </div>
  );
}
