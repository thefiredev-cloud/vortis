"use client";

import { type LucideIcon, Search, Zap, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { GradientText } from "@/components/ui/gradient-text";

/**
 * Step configuration type
 */
interface Step {
  /** Unique identifier */
  id: string;
  /** Step number (1, 2, 3, etc.) */
  number: number;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Color theme for the step */
  color: "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";
}

/**
 * Default steps configuration
 */
const DEFAULT_STEPS: Step[] = [
  {
    id: "step-1",
    number: 1,
    icon: Search,
    title: "Enter Stock Ticker",
    description: "Simply enter any ticker symbol (e.g., AAPL, TSLA, NVDA)",
    color: "emerald",
  },
  {
    id: "step-2",
    number: 2,
    icon: Zap,
    title: "AI Analysis",
    description: "We analyze 10 years of SEC filings, transcripts, and market data",
    color: "cyan",
  },
  {
    id: "step-3",
    number: 3,
    icon: TrendingUp,
    title: "Get Insights",
    description: "Receive actionable insights in seconds, not hours",
    color: "purple",
  },
];

/**
 * Map color names to Tailwind color classes
 */
const COLOR_CLASSES = {
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/20",
    number: "text-emerald-400",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/20",
    number: "text-cyan-400",
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-500/20",
    number: "text-purple-400",
  },
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/20",
    number: "text-blue-400",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-500/20",
    number: "text-pink-400",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500/20",
    number: "text-orange-400",
  },
} as const;

interface StepCardProps {
  step: Step;
  delay?: number;
  showConnector?: boolean;
}

/**
 * Individual step card component
 */
function StepCard({ step, delay = 0, showConnector = false }: StepCardProps) {
  const Icon = step.icon;
  const colors = COLOR_CLASSES[step.color];

  return (
    <FadeIn delay={delay} className="relative">
      <article
        className="text-center touch-manipulation group"
        aria-labelledby={`step-${step.id}-title`}
      >
        {/* Icon Circle */}
        <div
          className={`
            w-20 h-20 md:w-24 md:h-24
            ${colors.bg}
            rounded-full
            flex items-center justify-center
            mx-auto mb-6
            group-hover:scale-110
            transition-transform duration-300
            shadow-lg shadow-${step.color}-500/20
          `}
          aria-hidden="true"
        >
          <Icon className={`h-10 w-10 md:h-12 md:w-12 ${colors.text}`} />
        </div>

        {/* Step Number */}
        <div
          className={`text-3xl md:text-4xl font-bold ${colors.number} mb-4`}
          aria-label={`Step ${step.number}`}
        >
          {step.number}
        </div>

        {/* Title */}
        <h3
          id={`step-${step.id}-title`}
          className="text-xl md:text-2xl font-bold text-white mb-3"
        >
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-sm mx-auto">
          {step.description}
        </p>
      </article>

      {/* Connector Arrow (hidden on mobile, shown on desktop between steps) */}
      {showConnector && (
        <div
          className="hidden lg:block absolute top-12 -right-12 w-24 h-1 bg-gradient-to-r from-white/20 to-transparent"
          aria-hidden="true"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white/20 border-b-4 border-b-transparent" />
        </div>
      )}
    </FadeIn>
  );
}

interface HowItWorksSectionProps {
  /** Custom steps to display. If not provided, uses default steps */
  steps?: Step[];
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** Show connectors between steps (desktop only) */
  showConnectors?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * How It Works section displaying a step-by-step process
 *
 * @example
 * ```tsx
 * <HowItWorksSection
 *   title="Get Started in 3 Steps"
 *   subtitle="Start analyzing stocks in under 60 seconds"
 *   showConnectors={true}
 * />
 * ```
 */
export function HowItWorksSection({
  steps = DEFAULT_STEPS,
  title = "How It Works",
  subtitle,
  showConnectors = true,
  className = "",
}: HowItWorksSectionProps) {
  return (
    <section
      className={`py-16 md:py-24 ${className}`}
      aria-labelledby="how-it-works-heading"
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2
            id="how-it-works-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            <GradientText>{title}</GradientText>
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Steps Grid */}
        <div className="max-w-6xl mx-auto">
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative"
            role="list"
            aria-label="Process steps"
          >
            {steps.map((step, idx) => (
              <div key={step.id} role="listitem" className="relative">
                <StepCard
                  step={step}
                  delay={0.1 * idx}
                  showConnector={showConnectors && idx < steps.length - 1}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Optional CTA */}
        <FadeIn delay={0.4 + steps.length * 0.1} className="text-center mt-12 md:mt-16">
          <p className="text-slate-400 text-base md:text-lg">
            Ready to get started? Try it now with any stock ticker.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// Export types for external use
export type { Step, HowItWorksSectionProps };
