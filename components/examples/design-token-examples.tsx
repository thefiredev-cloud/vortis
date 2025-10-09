/**
 * Design Token Usage Examples
 * This file demonstrates how to use the Vortis design system in components
 */

import { designTokens, featureColors, cn } from "@/lib/design-tokens";
import { FileText, TrendingUp, Search, Check } from "lucide-react";

/**
 * Example 1: Feature Card using design tokens
 */
export function FeatureCardExample() {
  const color = featureColors.emerald;

  return (
    <div className={color.card}>
      <FileText className={cn("h-10 w-10 mb-3 mx-auto", color.icon)} />
      <h3 className={designTokens.text.subheading + " text-center"}>
        SEC Filing Insights
      </h3>
      <p className={cn(designTokens.text.small, "text-center mb-3")}>
        Analyze 10-K, 10-Q, and 8-K filings from 8,000+ companies.
      </p>
      <div className={cn(designTokens.text.caption, color.badge, "text-center font-medium")}>
        10+ years historical
      </div>
    </div>
  );
}

/**
 * Example 2: CTA Button variations
 */
export function ButtonExamples() {
  return (
    <div className="space-y-4">
      {/* Primary CTA */}
      <button className={designTokens.button.primary}>
        Get Started Free
      </button>

      {/* Secondary Button */}
      <button className={designTokens.button.secondary}>
        Learn More
      </button>

      {/* Outlined Button */}
      <button className={designTokens.button.outlined}>
        View Pricing
      </button>

      {/* Gradient Button */}
      <button className={designTokens.button.gradient}>
        Start Trial
      </button>

      {/* Ghost Button */}
      <button className={designTokens.button.ghost}>
        Cancel
      </button>
    </div>
  );
}

/**
 * Example 3: Form with search input
 */
export function SearchFormExample() {
  return (
    <div className={designTokens.card.base}>
      <h3 className={designTokens.text.heading + " mb-4"}>
        Search Stocks
      </h3>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Enter stock ticker (e.g., AAPL)"
          className={designTokens.input.search}
        />
      </div>

      {/* Regular Input */}
      <input
        type="text"
        placeholder="Company name"
        className={designTokens.input.default}
      />
    </div>
  );
}

/**
 * Example 4: Pricing Card with all features
 */
export function PricingCardExample() {
  return (
    <div className={designTokens.card.featured}>
      {/* Badge */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className={designTokens.badge.default + " uppercase"}>
          Most Popular
        </span>
      </div>

      {/* Header */}
      <h3 className={designTokens.text.heading + " mb-2"}>Pro</h3>
      <p className={designTokens.text.small + " mb-6"}>
        For serious traders
      </p>

      {/* Price */}
      <div className="mb-8">
        <span className="text-5xl font-bold text-white">$99</span>
        <span className={designTokens.text.small}>/month</span>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8">
        <li className="flex items-start space-x-3">
          <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <span className={designTokens.text.body}>Unlimited stock analyses</span>
        </li>
        <li className="flex items-start space-x-3">
          <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <span className={designTokens.text.body}>10 years of SEC filings</span>
        </li>
        <li className="flex items-start space-x-3">
          <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <span className={designTokens.text.body}>20+ technical indicators</span>
        </li>
      </ul>

      {/* CTA */}
      <button className={designTokens.button.gradient + " w-full"}>
        Get Started
      </button>
    </div>
  );
}

/**
 * Example 5: Dashboard Stats Grid
 */
export function StatsGridExample() {
  const stats = [
    { label: "Analyses This Month", value: "42", detail: "42 of 100 used" },
    { label: "Watchlist Items", value: "12", detail: "12 stocks tracked" },
    { label: "Current Plan", value: "Pro", detail: "Upgrade available →" },
  ];

  return (
    <div className={designTokens.grid.stats}>
      {stats.map((stat, index) => (
        <div key={index} className={designTokens.card.dashboard}>
          <p className={cn(designTokens.text.small, "mb-1")}>
            {stat.label}
          </p>
          <p className="text-3xl font-bold text-white">
            {stat.value}
          </p>
          <p className={cn(designTokens.text.caption, "text-emerald-400 mt-2")}>
            {stat.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 6: Navigation with active states
 */
export function NavigationExample() {
  const navItems = [
    { label: "Dashboard", icon: TrendingUp, active: true },
    { label: "Analyses", icon: FileText, active: false },
    { label: "Watchlist", icon: Search, active: false },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.label}
            href="#"
            className={item.active ? designTokens.nav.sidebarActive : designTokens.nav.sidebar}
          >
            <Icon className="h-5 w-5" />
            <span className={item.active ? "font-medium" : ""}>
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

/**
 * Example 7: Badge/Pill variations
 */
export function BadgeExamples() {
  return (
    <div className="flex flex-wrap gap-3">
      <span className={designTokens.badge.default}>AAPL</span>
      <span className={designTokens.badge.success}>Active</span>
      <span className={designTokens.badge.warning}>Pending</span>
      <span className={designTokens.badge.info}>New</span>
      <span className={designTokens.badge.purple}>Premium</span>
    </div>
  );
}

/**
 * Example 8: Hero Section with gradient text
 */
export function HeroExample() {
  return (
    <div className={designTokens.layout.centered}>
      <h1 className={designTokens.text.hero + " mb-6"}>
        <span>AI-Powered Stock</span>
        <br />
        <span className={designTokens.gradient.text.primary}>
          Trading Intelligence
        </span>
      </h1>
      <p className={cn(designTokens.text.bodyLarge, "mb-10 max-w-2xl mx-auto")}>
        Access comprehensive financial intelligence from 8,000+ public companies
        and 3M+ private companies.
      </p>
      <button className={designTokens.button.primary}>
        Get Started Free
      </button>
    </div>
  );
}

/**
 * Example 9: Loading States
 */
export function LoadingExample() {
  return (
    <div className="space-y-6">
      {/* Skeleton Loader */}
      <div className="space-y-2">
        <div className={cn(designTokens.loading.skeleton, "h-4 w-3/4")}></div>
        <div className={cn(designTokens.loading.skeleton, "h-4 w-1/2")}></div>
      </div>

      {/* Spinner */}
      <div className="flex items-center justify-center">
        <div className={cn(designTokens.loading.spinner, "h-8 w-8")}></div>
      </div>
    </div>
  );
}

/**
 * Example 10: Feature Grid with color variants
 */
export function FeatureGridExample() {
  const features = [
    { title: "SEC Filings", icon: FileText, color: "emerald", description: "Analyze 10-K, 10-Q filings" },
    { title: "Earnings Calls", icon: TrendingUp, color: "cyan", description: "Track management tone" },
    { title: "Technical Charts", icon: Search, color: "purple", description: "20+ indicators" },
  ] as const;

  return (
    <div className={designTokens.grid.features}>
      {features.map((feature) => {
        const Icon = feature.icon;
        const colors = featureColors[feature.color];

        return (
          <div key={feature.title} className={colors.card}>
            <Icon className={cn("h-10 w-10 mb-3 mx-auto", colors.icon)} />
            <h3 className={cn(designTokens.text.subheading, "text-center mb-2")}>
              {feature.title}
            </h3>
            <p className={cn(designTokens.text.small, "text-center")}>
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Example 11: Composed Card with all elements
 */
export function CompleteCardExample() {
  return (
    <div className={designTokens.card.gradient}>
      {/* Header with badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={designTokens.text.heading}>Stock Analysis</h3>
        <span className={designTokens.badge.success}>Live</span>
      </div>

      {/* Content */}
      <p className={cn(designTokens.text.body, "mb-6")}>
        Real-time market data and comprehensive analysis powered by AI.
      </p>

      {/* Divider */}
      <div className={cn(designTokens.divider.default, "my-6")}></div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className={designTokens.text.caption}>Price</p>
          <p className={designTokens.text.subheading}>$182.45</p>
        </div>
        <div>
          <p className={designTokens.text.caption}>Change</p>
          <p className="text-xl font-semibold text-emerald-400">+2.5%</p>
        </div>
      </div>

      {/* CTA */}
      <button className={designTokens.button.primary + " w-full"}>
        View Full Analysis
      </button>
    </div>
  );
}

/**
 * Example 12: Empty State
 */
export function EmptyStateExample() {
  return (
    <div className={designTokens.card.base}>
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <p className={cn(designTokens.text.body, "mb-2")}>
          No analyses yet
        </p>
        <p className={designTokens.text.small}>
          Search for a stock ticker above to get started
        </p>
      </div>
    </div>
  );
}

/**
 * Example 13: Using cn() utility for conditional classes
 */
export function ConditionalClassExample({ isActive }: { isActive: boolean }) {
  return (
    <button
      className={cn(
        designTokens.button.primary,
        isActive && "ring-2 ring-emerald-300",
        !isActive && "opacity-50"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}

/**
 * Example 14: Responsive Layout
 */
export function ResponsiveLayoutExample() {
  return (
    <div className={designTokens.layout.page}>
      <div className={designTokens.container.section}>
        {/* Header */}
        <div className={designTokens.layout.centered + " mb-16"}>
          <h1 className={designTokens.text.title}>Responsive Design</h1>
        </div>

        {/* Content Grid - stacks on mobile, 2 cols on tablet, 3 on desktop */}
        <div className={designTokens.grid.features}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={designTokens.card.hover}>
              <p className={designTokens.text.body}>Card {i}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
