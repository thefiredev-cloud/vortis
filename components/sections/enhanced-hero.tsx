"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { GradientText } from "@/components/ui/gradient-text";
import { BlurText } from "@/components/ui/blur-text";
import { FadeIn } from "@/components/ui/fade-in";
import { EnhancedFreeTrialForm } from "./enhanced-free-trial";
import { LiveCounter } from "@/components/ui/live-counter";

export function EnhancedHero() {
  return (
    <div className="relative">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 safe-area-inset-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-emerald-400" />
            <span className="text-2xl font-bold text-white">VORTIS</span>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link
              href="/pricing"
              className="text-slate-300 hover:text-white transition-colors text-sm md:text-base"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 text-sm md:text-base touch-manipulation"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-6 pt-12 md:pt-20 pb-24 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Live Counter Badge */}
          <FadeIn delay={0.2} className="mb-6 md:mb-8 flex justify-center">
            <LiveCounter />
          </FadeIn>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">AI-Powered Stock</span>
            <br />
            <GradientText>Trading Intelligence</GradientText>
          </h1>

          <div className="text-lg md:text-xl text-slate-300 mb-10 md:mb-12 max-w-2xl mx-auto">
            <BlurText
              text="Access comprehensive financial intelligence from 8,000+ public companies and 3M+ private companies. Analyze 10 years of SEC filings, earnings transcripts, and institutional holdings—all in seconds."
              delay={0.5}
            />
          </div>

          {/* Enhanced Free Trial CTA */}
          <FadeIn delay={1.2} className="max-w-2xl mx-auto mb-16 md:mb-20">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl shadow-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                <GradientText animate={false}>Try Vortis Free</GradientText>
              </h3>
              <p className="text-slate-300 text-sm md:text-base mb-6">
                Get 1 free stock analysis with instant SEC filing insights and
                technical indicators
              </p>
              <EnhancedFreeTrialForm />
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
