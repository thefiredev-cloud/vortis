"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { GradientText } from "@/components/ui/gradient-text";
import { Search, Zap, TrendingUp } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: "Enter Stock Ticker",
      description: "Simply enter any ticker symbol (e.g., AAPL, TSLA, NVDA)",
      color: "emerald",
    },
    {
      number: 2,
      icon: Zap,
      title: "AI Analysis",
      description: "We analyze 10 years of SEC filings, transcripts, and market data",
      color: "cyan",
    },
    {
      number: 3,
      icon: TrendingUp,
      title: "Get Insights",
      description: "Receive actionable insights in seconds, not hours",
      color: "purple",
    },
  ];

  return (
    <section className="py-16 md:py-20 safe-area-inset-bottom">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">
          <GradientText>How It Works</GradientText>
        </h2>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <FadeIn key={step.number} delay={0.1 * idx}>
                  <div className="text-center touch-manipulation">
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 bg-${step.color}-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6`}
                    >
                      <Icon className={`h-8 w-8 md:h-10 md:w-10 text-${step.color}-400`} />
                    </div>
                    <div
                      className={`text-2xl md:text-3xl font-bold text-${step.color}-400 mb-3`}
                    >
                      {step.number}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
