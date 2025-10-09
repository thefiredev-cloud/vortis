# Landing Components - Quick Reference

## Import Statement

```tsx
import {
  HeroSection,
  FeaturesGrid,
  StatsSection,
  HowItWorksSection,
  TestimonialsSection,
} from "@/components/landing";
```

## Component Signatures

### HeroSection
```tsx
<HeroSection
  onAnalyze={async (ticker: string) => {}}  // Optional
  headline="Trading Intelligence"           // Optional
  subheadline="Analyze stocks faster"       // Optional
/>
```

### FeaturesGrid
```tsx
<FeaturesGrid
  features={customFeatures}    // Optional - Feature[]
  title="Platform Features"    // Optional
  subtitle="Everything you need" // Optional
  columns={3}                  // Optional - 2 | 3
  className="my-8"            // Optional
/>
```

### StatsSection
```tsx
<StatsSection
  stats={customStats}         // Optional - Stat[]
  title="Platform Coverage"   // Optional
  subtitle="Real-time metrics" // Optional
  columns={3}                 // Optional - 2 | 3 | 4 | 6
  bordered={true}            // Optional - boolean
  className="my-8"           // Optional
/>
```

### HowItWorksSection
```tsx
<HowItWorksSection
  steps={customSteps}         // Optional - Step[]
  title="How It Works"        // Optional
  subtitle="Get started fast" // Optional
  showConnectors={true}       // Optional - boolean
  className="my-8"           // Optional
/>
```

### TestimonialsSection
```tsx
<TestimonialsSection
  testimonials={customTestimonials} // Optional - Testimonial[]
  title="Customer Reviews"          // Optional
  subtitle="What traders say"       // Optional
  columns={3}                       // Optional - 2 | 3
  bordered={true}                   // Optional - boolean
  className="my-8"                  // Optional
/>
```

## Type Definitions

### Feature
```typescript
interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  color: "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";
}
```

### Stat
```typescript
interface Stat {
  id: string;
  value: number;
  suffix?: string;    // e.g., "+", "k+", " Years"
  prefix?: string;    // e.g., "$", ">"
  label: string;
  delay?: number;     // Animation delay in seconds
}
```

### Step
```typescript
interface Step {
  id: string;
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  color: "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";
}
```

### Testimonial
```typescript
interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  gradient: string;    // e.g., "from-emerald-400 to-cyan-400"
  rating?: number;     // 1-5 stars
}
```

## Common Patterns

### Full Landing Page
```tsx
export default function Landing() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection />
      <FeaturesGrid />
      <StatsSection bordered />
      <HowItWorksSection />
      <TestimonialsSection bordered />
    </div>
  );
}
```

### With Background
```tsx
import { OrbBackground } from "@/components/ui/orb-background";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <OrbBackground />
      <div className="relative z-10">
        <HeroSection />
        <FeaturesGrid />
      </div>
    </div>
  );
}
```

### Custom Hero Handler
```tsx
const handleAnalyze = async (ticker: string) => {
  try {
    const response = await fetch(`/api/analyze/${ticker}`);
    const data = await response.json();
    window.location.href = `/dashboard/analyze/${ticker}`;
  } catch (error) {
    console.error("Analysis failed:", error);
  }
};

<HeroSection onAnalyze={handleAnalyze} />
```

### Custom Features
```tsx
import { Zap } from "lucide-react";

const features: Feature[] = [
  {
    id: "speed",
    icon: Zap,
    title: "Lightning Fast",
    description: "Results in under 2 seconds",
    badge: "<2s response",
    color: "emerald",
  },
];

<FeaturesGrid features={features} />
```

## Color Options

All components support these colors:
- `emerald` - Green tones
- `cyan` - Blue-green tones
- `purple` - Purple tones
- `blue` - Blue tones
- `pink` - Pink tones
- `orange` - Orange tones

## Grid Options

### FeaturesGrid
- `columns={2}` - 2 columns on desktop
- `columns={3}` - 2 on tablet, 3 on desktop (default)

### StatsSection
- `columns={2}` - 2 columns on all sizes
- `columns={3}` - 2 on tablet, 3 on desktop (default)
- `columns={4}` - 2 on tablet, 4 on desktop
- `columns={6}` - 2 on mobile, 3 on tablet, 6 on desktop

### TestimonialsSection
- `columns={2}` - 2 columns on desktop
- `columns={3}` - 2 on tablet, 3 on desktop (default)

## Styling Tips

### Custom Spacing
```tsx
<FeaturesGrid className="py-32" />  // More padding
<StatsSection className="my-16" />  // More margin
```

### Remove Borders
```tsx
<StatsSection bordered={false} />
<TestimonialsSection bordered={false} />
```

### Hide Connectors
```tsx
<HowItWorksSection showConnectors={false} />
```

## Accessibility

All components include:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

No additional configuration needed!

## Performance

Components are optimized by default:
- Viewport-triggered animations
- Minimal re-renders
- Lazy loading support
- No unnecessary computations

## Files Location

```
/components/landing/
├── hero-section.tsx
├── features-grid.tsx
├── stats-section.tsx
├── how-it-works-section.tsx
├── testimonials-section.tsx
├── index.tsx (use this for imports)
└── types.ts (type definitions)
```

## Preview URL

```
http://localhost:3000/landing-preview
```

## Need Help?

- See `README.md` for full API documentation
- See `EXAMPLES.md` for advanced patterns
- See `LANDING_COMPONENTS.md` for implementation guide
