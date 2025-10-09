# Vortis Design System

Comprehensive Tailwind CSS design system for the Vortis stock trading platform.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Utilities](#utilities)
6. [Accessibility](#accessibility)

---

## Color Palette

### Brand Colors

```tsx
// Primary brand colors
emerald-500: #10b981  // Primary CTA, success states
cyan-500: #06b6d4     // Secondary accent
purple-500: #8b5cf6   // Tertiary accent
```

### Theme Colors

```css
/* Dark Theme (Primary) */
--background: #000000
--foreground: #ededed
--card-bg: rgba(255, 255, 255, 0.05)
--border: rgba(255, 255, 255, 0.1)

/* Light Theme */
--background: #ffffff
--foreground: #171717
```

### Semantic Colors

| Usage | Light | Dark | Class |
|-------|-------|------|-------|
| Background | `#ffffff` | `#000000` | `bg-black` |
| Card | - | `rgba(255,255,255,0.05)` | `bg-white/5` |
| Border Default | - | `rgba(255,255,255,0.1)` | `border-white/10` |
| Border Hover | - | `rgba(16,185,129,0.5)` | `border-emerald-500/50` |
| Text Primary | `#171717` | `#ededed` | `text-white` |
| Text Secondary | - | `#94a3b8` | `text-slate-400` |
| Text Muted | - | `#64748b` | `text-slate-500` |

### Feature Accent Colors

Each feature uses a distinct color for visual hierarchy:

```tsx
emerald-400: #34d399  // SEC Filings
cyan-400: #22d3ee     // Earnings Calls
purple-400: #c084fc   // Technical Indicators
blue-400: #60a5fa     // 13F Filings
pink-400: #f472b6     // Private Markets
orange-400: #fb923c   // Research Tools
```

### Usage Examples

```tsx
// Primary CTA Button
className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"

// Feature Card
className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50"

// Gradient Text
className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"

// Shadow Glow
className="shadow-lg shadow-emerald-500/20"
```

---

## Typography

### Font Families

```tsx
--font-geist-sans: "Geist", system-ui, sans-serif
--font-geist-mono: "Geist Mono", monospace
```

### Type Scale

#### Display Sizes (Headers)

| Name | Size | Line Height | Letter Spacing | Usage |
|------|------|-------------|----------------|-------|
| `display-2xl` | 72px | 1.0 | -0.02em | Hero titles |
| `display-xl` | 60px | 1.0 | -0.02em | Section headers |
| `display-lg` | 48px | 1.1 | -0.02em | Page titles |
| `display-md` | 36px | 1.2 | -0.01em | Card headers |
| `display-sm` | 30px | 1.3 | -0.01em | Sub-headers |

#### Body Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| `body-xl` | 20px | 1.75 | Large body text |
| `body-lg` | 18px | 1.75 | Default body text |
| `body-md` | 16px | 1.5 | Standard text |
| `body-sm` | 14px | 1.5 | Secondary text |
| `body-xs` | 12px | 1.5 | Captions, metadata |

### Typography Classes

```tsx
// Hero Title
className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight"

// Section Title
className="text-4xl md:text-5xl font-bold text-white mb-6"

// Card Title
className="text-2xl font-bold text-white mb-2"

// Body Text
className="text-lg text-slate-300"

// Caption/Metadata
className="text-xs text-emerald-400/70 font-medium"
```

---

## Spacing & Layout

### Container Widths

```tsx
max-w-6xl   // 72rem (1152px) - Standard content
max-w-4xl   // 56rem (896px) - Hero content
max-w-2xl   // 42rem (672px) - Forms, narrow content
```

### Spacing Scale

```tsx
// Component Spacing
p-6        // Card padding (24px)
p-8        // Large card padding (32px)
gap-6      // Grid gap (24px)
space-y-6  // Vertical spacing (24px)

// Section Spacing
py-16      // Section vertical padding (64px)
py-20      // Large section padding (80px)
py-24      // Extra large section padding (96px)
```

### Safe Area Insets (iOS)

```tsx
// Custom spacing for notch/home indicator
className="safe-area-inset-top"
className="safe-area-inset-bottom"

// Or use padding
className="pt-safe-top pb-safe-bottom"
```

### Grid Layouts

```tsx
// Feature Cards
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Pricing Cards
className="grid md:grid-cols-3 gap-8"

// Dashboard Layout
className="grid grid-cols-1 lg:grid-cols-4 gap-6"
```

---

## Components

### Buttons

#### Primary CTA

```tsx
<button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30">
  Get Started
</button>
```

#### Secondary Button

```tsx
<button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all hover:scale-105">
  Learn More
</button>
```

#### Outlined Button

```tsx
<button className="px-6 py-3 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 rounded-lg font-semibold transition-all">
  View Details
</button>
```

#### Icon Button

```tsx
<button className="p-2 hover:bg-white/10 rounded-full transition-colors touch-manipulation">
  <Settings className="h-5 w-5 text-slate-400" />
</button>
```

### Cards

#### Feature Card

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
  <Icon className="h-10 w-10 text-emerald-400 mb-3 mx-auto" />
  <h3 className="text-lg font-semibold text-white mb-2 text-center">
    Card Title
  </h3>
  <p className="text-slate-400 text-sm text-center mb-3">
    Description text
  </p>
  <div className="text-xs text-emerald-400/70 text-center font-medium">
    Metadata
  </div>
</div>
```

#### Pricing Card (Featured)

```tsx
<div className="bg-gradient-to-b from-emerald-500/20 to-cyan-500/10 backdrop-blur-xl border-2 border-emerald-500/70 rounded-2xl p-8 relative transform md:scale-105 shadow-2xl shadow-emerald-500/40">
  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full">
    MOST POPULAR
  </div>
  {/* Content */}
</div>
```

#### Dashboard Card

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
  <p className="text-slate-400 text-sm mb-1">Label</p>
  <p className="text-3xl font-bold text-white">Value</p>
  <p className="text-xs text-emerald-400 mt-2">Detail</p>
</div>
```

### Form Elements

#### Input Field

```tsx
<input
  type="text"
  placeholder="Enter stock ticker..."
  className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
/>
```

#### Search Input

```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
  <input
    type="text"
    placeholder="Search stocks..."
    className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
  />
</div>
```

### Badges/Pills

#### Stock Symbol Badge

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
  AAPL
</span>
```

#### Status Badge

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
  Active
</span>
```

### Navigation

#### Top Navigation

```tsx
<nav className="container mx-auto px-6 py-6 safe-area-inset-top">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <TrendingUp className="h-8 w-8 text-emerald-400" />
      <span className="text-2xl font-bold text-white">VORTIS</span>
    </div>
    <div className="flex items-center space-x-4 md:space-x-6">
      <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors text-sm md:text-base">
        Pricing
      </Link>
      <Link href="/dashboard" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium transition-all hover:scale-105">
        Get Started
      </Link>
    </div>
  </div>
</nav>
```

#### Sidebar Navigation

```tsx
<nav className="space-y-2">
  <Link
    href="/dashboard"
    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors"
  >
    <LayoutDashboard className="h-5 w-5" />
    <span className="font-medium">Dashboard</span>
  </Link>
  <Link
    href="/dashboard/analyses"
    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
  >
    <TrendingUp className="h-5 w-5" />
    <span>Analyses</span>
  </Link>
</nav>
```

### Loading States

#### Skeleton Loader

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-white/10 rounded w-1/2"></div>
</div>
```

#### Spinner

```tsx
<div className="flex items-center justify-center">
  <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
</div>
```

---

## Utilities

### Gradient Text

```tsx
// Primary Gradient
className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"

// Multi-color Gradient
className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent"
```

### Glass Effect (Glassmorphism)

```tsx
className="bg-white/5 backdrop-blur-xl border border-white/10"

// With hover
className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
```

### Shadow Glow Effects

```tsx
// Emerald glow
className="shadow-lg shadow-emerald-500/20"
className="shadow-2xl shadow-emerald-500/40"

// Cyan glow
className="shadow-lg shadow-cyan-500/20"

// Purple glow
className="shadow-lg shadow-purple-500/20"
```

### Animations

```tsx
// Fade in on view
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
```

```tsx
// Hover scale
<motion.div
  whileHover={{ scale: 1.03 }}
  transition={{ duration: 0.2 }}
>
```

```tsx
// Blob animation (background)
className="animate-blob"
className="animate-blob animation-delay-2000"
className="animate-blob animation-delay-4000"
```

### Responsive Breakpoints

```tsx
// Mobile first approach
sm: 640px   // @media (min-width: 640px)
md: 768px   // @media (min-width: 768px)
lg: 1024px  // @media (min-width: 1024px)
xl: 1280px  // @media (min-width: 1280px)
2xl: 1536px // @media (min-width: 1536px)

// Usage
className="text-sm md:text-base lg:text-lg"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## Accessibility

### Focus Indicators

```tsx
// Keyboard focus
className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"

// Input focus
className="focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
```

### Touch Targets (iOS)

```tsx
// Minimum 44x44px touch target
className="touch-manipulation min-h-[44px] min-w-[44px]"

// Remove tap highlight
className="touch-manipulation [-webkit-tap-highlight-color:transparent]"
```

### Screen Reader Text

```tsx
<span className="sr-only">Screen reader only text</span>
```

### Reduced Motion

```tsx
// Automatically handled in globals.css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### ARIA Labels

```tsx
<button aria-label="Close notification">
  <X className="h-5 w-5" />
</button>

<input
  type="search"
  aria-label="Search stock tickers"
  placeholder="Search..."
/>
```

---

## Composition Examples

### Hero Section

```tsx
<div className="container mx-auto px-6 pt-12 md:pt-20 pb-24 md:pb-32">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
      <span className="text-white">AI-Powered Stock</span>
      <br />
      <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        Trading Intelligence
      </span>
    </h1>
    <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
      Access comprehensive financial intelligence from 8,000+ public companies.
    </p>
    <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
      Get Started Free
    </button>
  </div>
</div>
```

### Feature Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
    <FileText className="h-10 w-10 text-emerald-400 mb-3 mx-auto" />
    <h3 className="text-lg font-semibold text-white mb-2 text-center">
      SEC Filing Insights
    </h3>
    <p className="text-slate-400 text-sm text-center">
      Analyze 10-K, 10-Q, and 8-K filings instantly.
    </p>
  </div>
  {/* More cards... */}
</div>
```

### Pricing Card with Badge

```tsx
<div className="bg-gradient-to-b from-emerald-500/20 to-cyan-500/10 backdrop-blur-xl border-2 border-emerald-500/70 rounded-2xl p-8 relative transform md:scale-105 shadow-2xl shadow-emerald-500/40">
  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full">
    MOST POPULAR
  </div>
  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
  <p className="text-slate-400 mb-6">For serious traders</p>
  <div className="mb-8">
    <span className="text-5xl font-bold text-white">$99</span>
    <span className="text-slate-400">/month</span>
  </div>
  <ul className="space-y-4 mb-8">
    <li className="flex items-start space-x-3">
      <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
      <span className="text-slate-300">Unlimited stock analyses</span>
    </li>
  </ul>
  <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:scale-105 transition-all">
    Get Started
  </button>
</div>
```

---

## Color Contrast Ratios

All text colors meet WCAG AA standards:

- `text-white` on `bg-black`: 21:1
- `text-slate-300` on `bg-black`: 9.8:1
- `text-slate-400` on `bg-black`: 7.1:1
- `text-emerald-400` on `bg-black`: 6.9:1

---

## Performance Considerations

1. Use `backdrop-blur-xl` sparingly (GPU intensive)
2. Prefer `transform` and `opacity` for animations
3. Use `will-change` for complex animations
4. Lazy load images and components
5. Minimize shadow-glow effects on mobile

---

## Design Tokens Reference

Quick reference for common patterns:

```tsx
// Spacing
container px-6 py-16

// Cards
bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6

// Hover States
hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20

// Transitions
transition-all duration-300

// Text Hierarchy
text-white (primary)
text-slate-300 (secondary)
text-slate-400 (tertiary)

// Gradients
from-emerald-500 to-cyan-500
from-emerald-400 to-cyan-400
```
