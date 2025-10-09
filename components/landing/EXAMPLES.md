# Landing Components - Usage Examples

Comprehensive examples for all landing page components.

## Basic Usage

### Complete Landing Page

```tsx
"use client";

import { OrbBackground } from "@/components/ui/orb-background";
import {
  HeroSection,
  FeaturesGrid,
  StatsSection,
  HowItWorksSection,
  TestimonialsSection,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <OrbBackground />
      <div className="relative z-10">
        <HeroSection />
        <FeaturesGrid />
        <StatsSection bordered />
        <HowItWorksSection />
        <TestimonialsSection bordered />
      </div>
    </div>
  );
}
```

## Advanced Customization

### 1. Custom Hero with Analytics Tracking

```tsx
import { HeroSection } from "@/components/landing";
import { trackEvent } from "@/lib/analytics";

export default function CustomHero() {
  const handleAnalyze = async (ticker: string) => {
    // Track user interaction
    trackEvent("stock_analysis_started", { ticker });

    try {
      // Make API call
      const response = await fetch(`/api/analyze/${ticker}`);
      const data = await response.json();

      // Navigate to results
      window.location.href = `/dashboard/analyze/${ticker}`;

      // Track success
      trackEvent("stock_analysis_completed", { ticker });
    } catch (error) {
      // Track error
      trackEvent("stock_analysis_failed", { ticker, error: error.message });
      throw error;
    }
  };

  return (
    <HeroSection
      onAnalyze={handleAnalyze}
      headline="Smarter Trading"
      subheadline="Make data-driven decisions with AI-powered stock analysis"
    />
  );
}
```

### 2. Custom Features with Different Icons

```tsx
import { FeaturesGrid, type Feature } from "@/components/landing";
import { Zap, Shield, Clock, Database, TrendingUp, Users } from "lucide-react";

const customFeatures: Feature[] = [
  {
    id: "speed",
    icon: Zap,
    title: "Lightning Fast",
    description: "Get results in under 2 seconds",
    badge: "<2s response time",
    color: "emerald",
  },
  {
    id: "security",
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your data is encrypted and secure",
    badge: "256-bit encryption",
    color: "cyan",
  },
  {
    id: "realtime",
    icon: Clock,
    title: "Real-Time Data",
    description: "Live market data updates every second",
    badge: "1s updates",
    color: "purple",
  },
  {
    id: "data",
    icon: Database,
    title: "Massive Dataset",
    description: "Access to petabytes of financial data",
    badge: "10+ PB data",
    color: "blue",
  },
  {
    id: "ai",
    icon: TrendingUp,
    title: "AI-Powered Insights",
    description: "Machine learning models analyze patterns",
    badge: "GPT-4 powered",
    color: "pink",
  },
  {
    id: "community",
    icon: Users,
    title: "Active Community",
    description: "Join 50,000+ professional traders",
    badge: "50k+ users",
    color: "orange",
  },
];

export default function CustomFeatures() {
  return (
    <FeaturesGrid
      features={customFeatures}
      title="Why Choose Vortis?"
      subtitle="Built for professional traders who demand the best"
      columns={3}
    />
  );
}
```

### 3. Dynamic Stats from API

```tsx
"use client";

import { useEffect, useState } from "react";
import { StatsSection, type Stat } from "@/components/landing";

export default function DynamicStats() {
  const [stats, setStats] = useState<Stat[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/platform-stats");
        const data = await response.json();

        const dynamicStats: Stat[] = [
          {
            id: "users",
            value: data.totalUsers,
            suffix: "+",
            label: "Active Users",
            delay: 0.1,
          },
          {
            id: "analyses",
            value: data.totalAnalyses,
            suffix: "k+",
            label: "Analyses Run",
            delay: 0.2,
          },
          {
            id: "companies",
            value: data.companiesTracked,
            suffix: "+",
            label: "Companies Tracked",
            delay: 0.3,
          },
          {
            id: "accuracy",
            value: data.accuracyPercent,
            suffix: "%",
            label: "Prediction Accuracy",
            delay: 0.4,
          },
        ];

        setStats(dynamicStats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading stats...</div>;
  }

  return (
    <StatsSection
      stats={stats}
      title="Platform Statistics"
      subtitle="Real-time metrics updated daily"
      columns={4}
      bordered
    />
  );
}
```

### 4. Custom How It Works with 5 Steps

```tsx
import { HowItWorksSection, type Step } from "@/components/landing";
import { UserPlus, CreditCard, Search, Zap, CheckCircle } from "lucide-react";

const customSteps: Step[] = [
  {
    id: "signup",
    number: 1,
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up in 30 seconds with email or Google",
    color: "emerald",
  },
  {
    id: "subscribe",
    number: 2,
    icon: CreditCard,
    title: "Choose Plan",
    description: "Select the plan that fits your needs",
    color: "cyan",
  },
  {
    id: "search",
    number: 3,
    icon: Search,
    title: "Search Stocks",
    description: "Enter any stock ticker to begin analysis",
    color: "purple",
  },
  {
    id: "analyze",
    number: 4,
    icon: Zap,
    title: "AI Analysis",
    description: "Our AI processes years of financial data instantly",
    color: "blue",
  },
  {
    id: "decide",
    number: 5,
    icon: CheckCircle,
    title: "Make Decision",
    description: "Review insights and make informed trades",
    color: "pink",
  },
];

export default function ExtendedProcess() {
  return (
    <HowItWorksSection
      steps={customSteps}
      title="Your Path to Better Trading"
      subtitle="From signup to successful trading in 5 simple steps"
      showConnectors={false}
    />
  );
}
```

### 5. Testimonials with Real API Data

```tsx
"use client";

import { useEffect, useState } from "react";
import { TestimonialsSection, type Testimonial } from "@/components/landing";

export default function DynamicTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const response = await fetch("/api/testimonials?featured=true&limit=6");
      const data = await response.json();

      const formattedTestimonials: Testimonial[] = data.map(
        (t: any, idx: number) => ({
          id: t.id,
          quote: t.content,
          name: t.authorName,
          role: t.authorRole,
          company: t.authorCompany,
          avatarUrl: t.authorAvatar,
          gradient: GRADIENT_COLORS[idx % GRADIENT_COLORS.length],
          rating: t.rating,
        })
      );

      setTestimonials(formattedTestimonials);
    };

    fetchTestimonials();
  }, []);

  return (
    <TestimonialsSection
      testimonials={testimonials}
      title="What Our Users Say"
      subtitle="Real feedback from professional traders"
      columns={3}
      bordered
    />
  );
}

const GRADIENT_COLORS = [
  "from-emerald-400 to-cyan-400",
  "from-cyan-400 to-blue-400",
  "from-purple-400 to-pink-400",
  "from-pink-400 to-rose-400",
  "from-orange-400 to-red-400",
  "from-blue-400 to-indigo-400",
];
```

## Responsive Design Examples

### Mobile-Optimized Hero

```tsx
export default function MobileHero() {
  return (
    <HeroSection
      headline="AI Stock Analysis"
      subheadline="Professional trading intelligence in your pocket. Analyze any stock in seconds."
      onAnalyze={async (ticker) => {
        // Mobile-optimized flow
        if (window.innerWidth < 768) {
          // Show bottom sheet on mobile
          showMobileAnalysisSheet(ticker);
        } else {
          // Navigate to dashboard on desktop
          window.location.href = `/dashboard/analyze/${ticker}`;
        }
      }}
    />
  );
}
```

### Compact Stats for Mobile

```tsx
import { StatsSection } from "@/components/landing";

export default function CompactStats() {
  return (
    <StatsSection
      columns={2} // 2 columns on mobile, automatically responsive
      bordered={false}
      className="py-8 md:py-16" // Smaller padding on mobile
    />
  );
}
```

## Integration Examples

### With Next.js App Router

```tsx
// app/page.tsx
import { Suspense } from "react";
import {
  HeroSection,
  FeaturesGrid,
  StatsSection,
  HowItWorksSection,
  TestimonialsSection,
} from "@/components/landing";
import { OrbBackground } from "@/components/ui/orb-background";

export const metadata = {
  title: "Vortis - AI-Powered Stock Trading Intelligence",
  description: "Analyze stocks 10x faster with AI-powered insights",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      <OrbBackground />
      <div className="relative z-10">
        <HeroSection />
        <FeaturesGrid />
        <Suspense fallback={<LoadingStats />}>
          <StatsSection bordered />
        </Suspense>
        <HowItWorksSection />
        <TestimonialsSection bordered />
      </div>
    </main>
  );
}

function LoadingStats() {
  return <div className="h-64 animate-pulse bg-white/5" />;
}
```

### With React Query

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { StatsSection } from "@/components/landing";

export default function QueryStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) return <div>Loading...</div>;

  return <StatsSection stats={stats} />;
}
```

## Accessibility Examples

### Keyboard Navigation

```tsx
// All components support keyboard navigation by default
// Tab through interactive elements
// Enter/Space to activate buttons
// Escape to close modals (if applicable)

<HeroSection
  onAnalyze={async (ticker) => {
    // This is keyboard accessible
    await analyzeStock(ticker);
  }}
/>
```

### Screen Reader Support

```tsx
// All components include proper ARIA labels
// Screen readers will announce:
// - Section headings
// - Button purposes
// - Loading states
// - Error messages
// - Success confirmations

<TestimonialsSection
  title="Customer Reviews" // Announced as heading
  testimonials={testimonials}
/>
```

## Performance Optimization

### Code Splitting

```tsx
import dynamic from "next/dynamic";

const HeroSection = dynamic(() =>
  import("@/components/landing").then((mod) => mod.HeroSection)
);
const FeaturesGrid = dynamic(() =>
  import("@/components/landing").then((mod) => mod.FeaturesGrid)
);

export default function OptimizedPage() {
  return (
    <>
      <HeroSection />
      <FeaturesGrid />
    </>
  );
}
```

### Lazy Loading Sections

```tsx
"use client";

import { useInView } from "react-intersection-observer";
import { TestimonialsSection } from "@/components/landing";

export default function LazyTestimonials() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView && <TestimonialsSection />}
    </div>
  );
}
```

## Testing Examples

### Unit Tests

```tsx
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/landing";

describe("HeroSection", () => {
  it("renders headline and subheadline", () => {
    render(
      <HeroSection
        headline="Test Headline"
        subheadline="Test Subheadline"
      />
    );

    expect(screen.getByText(/Test Headline/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Subheadline/i)).toBeInTheDocument();
  });

  it("calls onAnalyze when form submitted", async () => {
    const handleAnalyze = jest.fn();
    render(<HeroSection onAnalyze={handleAnalyze} />);

    const input = screen.getByPlaceholderText(/Enter stock ticker/i);
    const button = screen.getByText(/Analyze Now/i);

    await userEvent.type(input, "AAPL");
    await userEvent.click(button);

    expect(handleAnalyze).toHaveBeenCalledWith("AAPL");
  });
});
```

## Common Patterns

### CTA Section

```tsx
import { FadeIn } from "@/components/ui/fade-in";
import { ShinyButton } from "@/components/ui/shiny-button";

export function CTASection() {
  return (
    <section className="py-20 border-y border-white/10">
      <div className="container mx-auto px-6 text-center">
        <FadeIn>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of traders who analyze stocks 10x faster
          </p>
          <ShinyButton className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl">
            Start Free Trial
          </ShinyButton>
        </FadeIn>
      </div>
    </section>
  );
}
```

### Social Proof Banner

```tsx
import { TrendingUp } from "lucide-react";

export function SocialProofBanner() {
  return (
    <div className="bg-emerald-500/10 border-y border-emerald-500/20 py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-300">
            <span className="text-emerald-400 font-semibold">8,234</span>{" "}
            traders analyzed stocks today
          </span>
        </div>
      </div>
    </div>
  );
}
```
