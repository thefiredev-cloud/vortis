"use client";

import { AnimatedCounter } from "./animated-counter";
import { FadeIn } from "./fade-in";

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

function StatItem({ value, suffix = "", label, delay = 0 }: StatItemProps) {
  return (
    <FadeIn delay={delay} className="flex flex-col items-center">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-slate-400 text-sm md:text-base text-center">
        {label}
      </div>
    </FadeIn>
  );
}

export function StatBar() {
  return (
    <div className="relative py-16 border-y border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <StatItem
            value={8000}
            suffix="+"
            label="Public Companies"
            delay={0.1}
          />
          <StatItem
            value={10000}
            suffix="+"
            label="Stock Tickers"
            delay={0.2}
          />
          <StatItem
            value={10}
            suffix=" Years"
            label="Historical Data"
            delay={0.3}
          />
          <StatItem
            value={500}
            suffix="k+"
            label="Funding Deals"
            delay={0.4}
          />
        </div>
      </div>
    </div>
  );
}
