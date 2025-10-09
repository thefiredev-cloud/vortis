"use client";
export const dynamic = 'force-dynamic';

import { OrbBackground } from "@/components/ui/orb-background";
import {
  HeroSection,
  FeaturesGrid,
  StatsSection,
  HowItWorksSection,
  TestimonialsSection,
} from "@/components/landing";

/**
 * Landing Preview Page
 *
 * Demonstrates all landing page components in a single view.
 * This page showcases the complete landing page experience with all sections.
 */
export default function LandingPreviewPage() {
  const handleAnalyze = async (ticker: string) => {
    console.log("Analyzing ticker:", ticker);
    // Navigate to analysis page
    window.location.href = `/dashboard/analyze/${ticker}`;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Orbs */}
      <OrbBackground />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section with Stock Ticker Input */}
        <HeroSection
          onAnalyze={handleAnalyze}
          headline="Trading Intelligence"
          subheadline="Access comprehensive financial intelligence from 8,000+ public companies and 3M+ private companies. Analyze 10 years of SEC filings, earnings transcripts, and institutional holdings—all in seconds."
        />

        {/* Features Grid - 6 Feature Cards */}
        <FeaturesGrid
          title="Comprehensive Stock Analysis Platform"
          subtitle="Everything you need to make informed trading decisions, powered by AI"
          columns={3}
        />

        {/* Stats Section - Key Metrics */}
        <StatsSection
          title="Platform Coverage"
          subtitle="Comprehensive data coverage across public and private markets"
          columns={3}
          bordered={true}
        />

        {/* How It Works - 3 Step Process */}
        <HowItWorksSection
          title="How It Works"
          subtitle="Start analyzing stocks in under 60 seconds"
          showConnectors={true}
        />

        {/* Testimonials - Social Proof */}
        <TestimonialsSection
          title="Trusted by Professional Traders"
          subtitle="See what traders and investors say about Vortis"
          columns={3}
          bordered={true}
        />

        {/* Footer */}
        <footer className="border-t border-white/10 py-16 bg-black/50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              {/* Footer Content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                {/* Company */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4">Vortis</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    AI-powered stock trading intelligence for professional traders and investors.
                  </p>
                </div>

                {/* Product */}
                <div>
                  <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/dashboard"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        Dashboard
                      </a>
                    </li>
                    <li>
                      <a
                        href="/pricing"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        Features
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#about"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="#contact"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        Contact
                      </a>
                    </li>
                    <li>
                      <a
                        href="#careers"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        Careers
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#privacy"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#terms"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a
                        href="#disclaimer"
                        className="text-slate-400 hover:text-white text-sm transition-colors"
                      >
                        Disclaimer
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-8 border-t border-white/10 text-center">
                <p className="text-slate-400 text-sm">
                  &copy; {new Date().getFullYear()} Vortis. All rights reserved. Revolutionary
                  AI-powered trading intelligence.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
