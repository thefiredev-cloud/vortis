"use client";

import { type LucideIcon, FileText, Mic, LineChart, Building2, Rocket, Search } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-card";

/**
 * Feature configuration type
 */
interface Feature {
  /** Unique identifier for the feature */
  id: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Additional metric or badge text */
  badge: string;
  /** Color theme for the feature card */
  color: "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";
}

/**
 * Default features configuration
 */
const DEFAULT_FEATURES: Feature[] = [
  {
    id: "sec-filings",
    icon: FileText,
    title: "10+ Years SEC Filings",
    description:
      "Analyze 10-K, 10-Q, and 8-K filings from 8,000+ companies. Extract revenue trends, risk factors, and management commentary in seconds.",
    badge: "10+ years historical",
    color: "emerald",
  },
  {
    id: "earnings-calls",
    icon: Mic,
    title: "Earnings Call Analysis",
    description:
      "Access and analyze earnings call transcripts with sentiment analysis. Track management tone and forward guidance instantly.",
    badge: "10 years of transcripts",
    color: "cyan",
  },
  {
    id: "technical-indicators",
    icon: LineChart,
    title: "20+ Technical Indicators",
    description:
      "RSI, MACD, Bollinger Bands, Moving Averages, Fibonacci Retracement, Ichimoku Cloud, and more—updated in real-time.",
    badge: "Real-time updates",
    color: "purple",
  },
  {
    id: "13f-filings",
    icon: Building2,
    title: "13F Filing Monitor",
    description:
      "Track what institutions are buying and selling. Monitor hedge fund positions and identify emerging investment trends.",
    badge: "Quarterly updates",
    color: "blue",
  },
  {
    id: "private-market",
    icon: Rocket,
    title: "Private Market Access",
    description:
      "Research 3M+ private companies, track 500k+ funding rounds, and monitor M&A activity across industries.",
    badge: "3M+ companies",
    color: "pink",
  },
  {
    id: "ultra-fast-research",
    icon: Search,
    title: "Ultra-Fast Research",
    description:
      "Comprehensive market research 8-10x faster than traditional methods. No rate limits, unlimited queries.",
    badge: "8-10x faster",
    color: "orange",
  },
];

/**
 * Map color names to Tailwind color classes
 */
const COLOR_CLASSES = {
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
    shadow: "shadow-emerald-500/20",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/50",
    shadow: "shadow-cyan-500/20",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/50",
    shadow: "shadow-purple-500/20",
  },
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    shadow: "shadow-blue-500/20",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-500/20",
    border: "border-pink-500/50",
    shadow: "shadow-pink-500/20",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/50",
    shadow: "shadow-orange-500/20",
  },
} as const;

interface FeatureCardProps {
  feature: Feature;
  delay?: number;
}

/**
 * Individual feature card component
 */
function FeatureCard({ feature, delay = 0 }: FeatureCardProps) {
  const Icon = feature.icon;
  const colors = COLOR_CLASSES[feature.color];

  return (
    <AnimatedCard delay={delay}>
      <article
        className={`
          group relative
          bg-white/5 backdrop-blur-xl
          border border-white/10
          hover:border-${feature.color}-500/50
          rounded-2xl p-6 md:p-8 h-full
          hover:shadow-lg hover:shadow-${feature.color}-500/20
          transition-all duration-300
          touch-manipulation
          active:scale-[0.98]
        `}
        aria-labelledby={`feature-${feature.id}-title`}
      >
        {/* Icon */}
        <div
          className={`
            w-14 h-14 md:w-16 md:h-16
            ${colors.bg}
            rounded-xl
            flex items-center justify-center
            mb-4 md:mb-6
            mx-auto
            group-hover:scale-110
            transition-transform duration-300
          `}
          aria-hidden="true"
        >
          <Icon className={`h-7 w-7 md:h-8 md:w-8 ${colors.text}`} />
        </div>

        {/* Title */}
        <h3
          id={`feature-${feature.id}-title`}
          className="text-lg md:text-xl font-bold text-white mb-3 text-center"
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-sm md:text-base text-center mb-4 leading-relaxed">
          {feature.description}
        </p>

        {/* Badge */}
        <div
          className={`
            inline-block
            px-3 py-1
            rounded-full
            text-xs font-semibold
            ${colors.text}
            ${colors.bg}
            mx-auto
            text-center
            w-full
          `}
          role="status"
          aria-label={feature.badge}
        >
          {feature.badge}
        </div>
      </article>
    </AnimatedCard>
  );
}

interface FeaturesGridProps {
  /** Custom features to display. If not provided, uses default features */
  features?: Feature[];
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** Number of columns in the grid (responsive) */
  columns?: 2 | 3;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Features grid component displaying product capabilities
 *
 * @example
 * ```tsx
 * <FeaturesGrid
 *   title="Platform Features"
 *   subtitle="Everything you need for stock analysis"
 *   columns={3}
 * />
 * ```
 */
export function FeaturesGrid({
  features = DEFAULT_FEATURES,
  title,
  subtitle,
  columns = 3,
  className = "",
}: FeaturesGridProps) {
  const gridCols = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={`py-16 md:py-24 ${className}`} aria-labelledby="features-heading">
      <div className="container mx-auto px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            {title && (
              <h2
                id="features-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed">{subtitle}</p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 ${gridCols} gap-6 md:gap-8 max-w-7xl mx-auto`}>
          {features.map((feature, idx) => (
            <FeatureCard key={feature.id} feature={feature} delay={0.1 + idx * 0.05} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Export types for external use
export type { Feature, FeaturesGridProps };
