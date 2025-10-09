"use client";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { FadeIn } from "@/components/ui/fade-in";
import { GradientText } from "@/components/ui/gradient-text";

/**
 * Statistic item configuration
 */
interface Stat {
  /** Unique identifier */
  id: string;
  /** Numeric value to display */
  value: number;
  /** Optional suffix (e.g., "+", "k+", " Years") */
  suffix?: string;
  /** Optional prefix (e.g., "$", ">") */
  prefix?: string;
  /** Label describing the statistic */
  label: string;
  /** Animation delay in seconds */
  delay?: number;
}

/**
 * Default statistics configuration
 */
const DEFAULT_STATS: Stat[] = [
  {
    id: "public-companies",
    value: 8000,
    suffix: "+",
    label: "Public Companies",
    delay: 0.1,
  },
  {
    id: "sec-filings",
    value: 10000,
    suffix: "+",
    label: "SEC Filings",
    delay: 0.2,
  },
  {
    id: "historical-years",
    value: 10,
    suffix: " Years",
    label: "Historical Data",
    delay: 0.3,
  },
  {
    id: "funding-deals",
    value: 500,
    suffix: "k+",
    label: "Funding Deals",
    delay: 0.4,
  },
  {
    id: "private-companies",
    value: 3,
    suffix: "M+",
    label: "Private Companies",
    delay: 0.5,
  },
  {
    id: "technical-indicators",
    value: 20,
    suffix: "+",
    label: "Technical Indicators",
    delay: 0.6,
  },
];

interface StatItemProps {
  stat: Stat;
}

/**
 * Individual statistic item with animated counter
 */
function StatItem({ stat }: StatItemProps) {
  return (
    <FadeIn delay={stat.delay} className="flex flex-col items-center">
      <div className="mb-3" aria-hidden="true">
        <GradientText
          className="text-4xl md:text-5xl lg:text-6xl"
          from="from-emerald-400"
          to="to-cyan-400"
          animate={false}
        >
          <AnimatedCounter
            value={stat.value}
            suffix={stat.suffix}
            prefix={stat.prefix}
            duration={2000}
          />
        </GradientText>
      </div>
      <p className="text-slate-400 text-sm md:text-base lg:text-lg text-center font-medium">
        {stat.label}
      </p>
      {/* Screen reader accessible version with full value */}
      <span className="sr-only">
        {stat.prefix}
        {stat.value.toLocaleString()}
        {stat.suffix} {stat.label}
      </span>
    </FadeIn>
  );
}

interface StatsSectionProps {
  /** Custom statistics to display. If not provided, uses default stats */
  stats?: Stat[];
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Number of columns in the grid (responsive) */
  columns?: 2 | 3 | 4 | 6;
  /** Show border on top and bottom */
  bordered?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Statistics section displaying key metrics with animated counters
 *
 * @example
 * ```tsx
 * <StatsSection
 *   title="Platform Coverage"
 *   stats={[
 *     { id: "users", value: 10000, suffix: "+", label: "Active Users" }
 *   ]}
 *   columns={4}
 * />
 * ```
 */
export function StatsSection({
  stats = DEFAULT_STATS,
  title,
  subtitle,
  columns = 3,
  bordered = true,
  className = "",
}: StatsSectionProps) {
  const gridColsMap = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    6: "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };

  const gridCols = gridColsMap[columns];
  const borderClasses = bordered ? "border-y border-white/10" : "";

  return (
    <section
      className={`relative py-16 md:py-20 ${borderClasses} ${className}`}
      aria-labelledby={title ? "stats-heading" : undefined}
    >
      <div className="container mx-auto px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            {title && (
              <h2
                id="stats-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              >
                <GradientText>{title}</GradientText>
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed">{subtitle}</p>
            )}
          </div>
        )}

        <div
          className={`grid grid-cols-2 ${gridCols} gap-8 md:gap-12 lg:gap-16 max-w-7xl mx-auto`}
          role="list"
          aria-label="Platform statistics"
        >
          {stats.map((stat) => (
            <div key={stat.id} role="listitem">
              <StatItem stat={stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Export types for external use
export type { Stat, StatsSectionProps };
