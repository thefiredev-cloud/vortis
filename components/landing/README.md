# Landing Page Components

Production-ready, accessible React components for building high-converting landing pages. Built with React 19, TypeScript 5.7+, and Tailwind CSS 4.

## Features

- **Fully Typed**: Complete TypeScript interfaces and JSDoc documentation
- **Accessible**: WCAG 2.1 AA compliant with proper ARIA labels and keyboard navigation
- **Responsive**: Mobile-first design with touch-optimized interactions
- **Animated**: Smooth animations using Framer Motion
- **Customizable**: Flexible props for easy customization
- **Production-Ready**: Tested, performant, and optimized for production use

## Components

### 1. HeroSection

Main hero section with headline, stock ticker input, and popular stock quick buttons.

**Features:**
- Stock ticker input with validation
- Popular ticker quick selection buttons
- Loading and success states
- Error handling with visual feedback
- Accessible form with proper ARIA labels

**Usage:**
```tsx
import { HeroSection } from "@/components/landing";

<HeroSection
  onAnalyze={async (ticker) => {
    await analyzeStock(ticker);
  }}
  headline="Trading Intelligence"
  subheadline="Analyze stocks in seconds with AI"
/>
```

**Props:**
```typescript
interface HeroSectionProps {
  onAnalyze?: (ticker: string) => Promise<void>;
  headline?: string;
  subheadline?: string;
}
```

### 2. FeaturesGrid

Grid layout displaying 6 product features with icons, descriptions, and badges.

**Features:**
- Customizable number of columns (2 or 3)
- Color-coded feature cards
- Hover animations and interactions
- Icon support from Lucide React

**Usage:**
```tsx
import { FeaturesGrid } from "@/components/landing";

<FeaturesGrid
  title="Platform Features"
  subtitle="Everything you need"
  columns={3}
/>
```

**Props:**
```typescript
interface FeaturesGridProps {
  features?: Feature[];
  title?: string;
  subtitle?: string;
  columns?: 2 | 3;
  className?: string;
}

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  color: "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";
}
```

**Default Features:**
1. 10+ Years SEC Filings
2. Earnings Call Analysis
3. 20+ Technical Indicators
4. 13F Filing Monitor
5. Private Market Access
6. Ultra-Fast Research

### 3. StatsSection

Display key platform metrics with animated counters.

**Features:**
- Animated number counters
- Customizable grid layout (2, 3, 4, or 6 columns)
- Gradient text styling
- Viewport-triggered animations

**Usage:**
```tsx
import { StatsSection } from "@/components/landing";

<StatsSection
  title="Platform Coverage"
  columns={3}
  bordered={true}
/>
```

**Props:**
```typescript
interface StatsSectionProps {
  stats?: Stat[];
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4 | 6;
  bordered?: boolean;
  className?: string;
}

interface Stat {
  id: string;
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
}
```

**Default Stats:**
- 8,000+ Public Companies
- 10,000+ SEC Filings
- 10 Years Historical Data
- 500k+ Funding Deals
- 3M+ Private Companies
- 20+ Technical Indicators

### 4. HowItWorksSection

Step-by-step process explanation with icons and connectors.

**Features:**
- 3-step process visualization
- Optional connector arrows (desktop)
- Color-coded steps
- Responsive grid layout

**Usage:**
```tsx
import { HowItWorksSection } from "@/components/landing";

<HowItWorksSection
  title="How It Works"
  subtitle="Get started in 3 easy steps"
  showConnectors={true}
/>
```

**Props:**
```typescript
interface HowItWorksSectionProps {
  steps?: Step[];
  title?: string;
  subtitle?: string;
  showConnectors?: boolean;
  className?: string;
}

interface Step {
  id: string;
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  color: "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";
}
```

**Default Steps:**
1. Enter Stock Ticker
2. AI Analysis
3. Get Insights

### 5. TestimonialsSection

Customer testimonials with ratings and avatars.

**Features:**
- Star ratings
- Avatar support (URL or gradient)
- Quote styling with icon
- Responsive grid (2 or 3 columns)

**Usage:**
```tsx
import { TestimonialsSection } from "@/components/landing";

<TestimonialsSection
  title="Trusted by Traders"
  subtitle="What our customers say"
  columns={3}
/>
```

**Props:**
```typescript
interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  columns?: 2 | 3;
  bordered?: boolean;
  className?: string;
}

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  gradient: string;
  rating?: number;
}
```

## Complete Example

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

## Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ Proper semantic HTML (article, section, nav)
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader announcements
- ✅ Focus management
- ✅ Color contrast compliance
- ✅ Touch-friendly targets (44x44px minimum)

## Performance

- React.memo used for expensive renders
- useCallback for event handlers
- Optimized re-renders with proper dependency arrays
- Lazy loading for images
- Viewport-triggered animations to reduce initial load

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

## Testing

Run tests with:
```bash
npm test components/landing
```

## License

Private - Vortis Project

## Preview

View all components together:
```
http://localhost:3000/landing-preview
```
