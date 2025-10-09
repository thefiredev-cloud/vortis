# Vortis Design System - Quick Reference

One-page cheat sheet for the most common design patterns.

## Colors

```tsx
// Brand
emerald-500: #10b981  // Primary CTA
cyan-500: #06b6d4     // Secondary
purple-500: #8b5cf6   // Accent

// Background
bg-black              // Page background
bg-white/5            // Card background
bg-white/10           // Input background

// Borders
border-white/10       // Default
border-white/20       // Input
border-emerald-500/50 // Hover

// Text
text-white            // Primary
text-slate-300        // Secondary
text-slate-400        // Tertiary
text-slate-500        // Caption
```

## Common Class Combinations

```tsx
// Glass Card
"bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"

// Glass Card Hover
"hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"

// Primary Button
"px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"

// Input
"w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"

// Gradient Text
"bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
```

## Using Design Tokens

```tsx
import { designTokens } from "@/lib/design-tokens";

// Instead of writing the full class string
<button className={designTokens.button.primary}>
  Get Started
</button>

// Cards
<div className={designTokens.card.hover}>
  {/* content */}
</div>

// Typography
<h1 className={designTokens.text.hero}>
  Title
</h1>
```

## Feature Colors

Each feature has a distinct color:

| Feature | Icon Color | Card Hover |
|---------|-----------|------------|
| SEC Filings | `text-emerald-400` | `hover:border-emerald-500/50` |
| Earnings | `text-cyan-400` | `hover:border-cyan-500/50` |
| Technical | `text-purple-400` | `hover:border-purple-500/50` |
| 13F | `text-blue-400` | `hover:border-blue-500/50` |
| Private | `text-pink-400` | `hover:border-pink-500/50` |
| Research | `text-orange-400` | `hover:border-orange-500/50` |

## Spacing Scale

```tsx
p-4   // 16px - Compact
p-6   // 24px - Standard card
p-8   // 32px - Large card

gap-4 // 16px - Tight grid
gap-6 // 24px - Standard grid
gap-8 // 32px - Loose grid

py-12 // 48px - Section start
py-16 // 64px - Standard section
py-20 // 80px - Large section
```

## Typography Scale

```tsx
// Hero: text-5xl sm:text-6xl md:text-7xl
// Title: text-4xl md:text-5xl
// Heading: text-2xl md:text-3xl
// Subheading: text-xl md:text-2xl
// Body: text-base md:text-lg
// Small: text-sm
// Caption: text-xs
```

## Grid Layouts

```tsx
// Features: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
// Pricing: grid md:grid-cols-3 gap-8
// Stats: grid grid-cols-1 md:grid-cols-3 gap-4
// Dashboard: grid grid-cols-1 lg:grid-cols-4 gap-6
```

## Hover States

```tsx
// Scale
hover:scale-105

// Background
hover:bg-slate-600
hover:bg-white/10

// Border + Shadow
hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20

// Text
hover:text-white
```

## Focus States

```tsx
// Button
focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black

// Input
focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50
```

## Responsive Breakpoints

```tsx
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

## Common Patterns

### Feature Card

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
  <Icon className="h-10 w-10 text-emerald-400 mb-3 mx-auto" />
  <h3 className="text-lg font-semibold text-white mb-2 text-center">Title</h3>
  <p className="text-slate-400 text-sm text-center">Description</p>
</div>
```

### Primary CTA

```tsx
<button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
  Get Started
</button>
```

### Input Field

```tsx
<input
  className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
  placeholder="Enter ticker..."
/>
```

### Badge

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
  AAPL
</span>
```

### Nav Link (Active)

```tsx
<Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400">
  <Icon className="h-5 w-5" />
  <span className="font-medium">Dashboard</span>
</Link>
```

### Nav Link (Inactive)

```tsx
<Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
  <Icon className="h-5 w-5" />
  <span>Analyses</span>
</Link>
```

## Z-Index Scale

```tsx
z-0   // Background (blobs, gradients)
z-10  // Content
z-40  // Overlay
z-50  // Modal
z-60  // Toast
```

## Shadows

```tsx
// Card shadows
shadow-lg shadow-emerald-500/20
shadow-2xl shadow-emerald-500/40

// Glow effects (cyan, purple)
shadow-lg shadow-cyan-500/20
shadow-lg shadow-purple-500/20
```

## Transitions

```tsx
transition-all duration-300  // Standard
transition-colors            // Text/background only
transition-transform         // Scale/position only
```

## Accessibility

```tsx
// Touch targets
touch-manipulation min-h-[44px] min-w-[44px]

// Focus visible
focus:outline-none focus:ring-2 focus:ring-emerald-500

// ARIA
aria-label="Descriptive text"

// Screen reader only
<span className="sr-only">Hidden text</span>
```

## iOS Safe Areas

```tsx
safe-area-inset-top
safe-area-inset-bottom
pt-safe-top
pb-safe-bottom
```

## Animation Classes

```tsx
animate-blob              // Floating blob effect
animate-pulse-slow        // Slow pulsing
animate-fade-in          // Fade in entrance
animate-slide-up         // Slide up entrance
```

## Import Paths

```tsx
// Design tokens
import { designTokens, featureColors, cn } from "@/lib/design-tokens";

// Icons (Lucide)
import { TrendingUp, FileText, Search } from "lucide-react";

// Components
import { AnimatedCard } from "@/components/ui/animated-card";
```

## Quick Copy Templates

### Empty File Structure

```tsx
import { designTokens } from "@/lib/design-tokens";
import { Icon } from "lucide-react";

export function ComponentName() {
  return (
    <div className={designTokens.layout.page}>
      <div className={designTokens.container.section}>
        {/* Content */}
      </div>
    </div>
  );
}
```

### Feature Card Grid

```tsx
<div className={designTokens.grid.features}>
  {features.map((feature) => (
    <div key={feature.id} className={designTokens.card.hover}>
      <Icon className="h-10 w-10 text-emerald-400 mb-3 mx-auto" />
      <h3 className="text-lg font-semibold text-white mb-2 text-center">
        {feature.title}
      </h3>
      <p className="text-slate-400 text-sm text-center">
        {feature.description}
      </p>
    </div>
  ))}
</div>
```
