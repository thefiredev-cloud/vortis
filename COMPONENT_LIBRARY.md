# Vortis Component Library

Production-ready component patterns with hover states, focus indicators, and responsive breakpoints.

## Quick Start

```tsx
import { designTokens, featureColors, cn } from "@/lib/design-tokens";
```

---

## Buttons

### Primary CTA Button

```tsx
<button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black">
  Get Started Free
</button>

// Using design tokens
<button className={designTokens.button.primary}>
  Get Started Free
</button>
```

**States:**
- Hover: Darker gradient + scale(1.05)
- Active: scale(0.95)
- Focus: Ring indicator for keyboard navigation
- Touch: 44x44px minimum target

### Secondary Button

```tsx
<button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all hover:scale-105 touch-manipulation">
  Learn More
</button>
```

### Outlined Button

```tsx
<button className="px-6 py-3 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 rounded-lg font-semibold transition-all">
  View Details
</button>
```

### Gradient Button (Full Spectrum)

```tsx
<button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
  Start Trial
</button>
```

### Icon Button

```tsx
<button className="p-2 hover:bg-white/10 rounded-full transition-colors touch-manipulation" aria-label="Settings">
  <Settings className="h-5 w-5 text-slate-400" />
</button>
```

### Button Sizes

```tsx
// Small
<button className="px-4 py-2 text-sm ...">Small</button>

// Default
<button className="px-6 py-3 text-base ...">Default</button>

// Large
<button className="px-8 py-4 text-lg ...">Large</button>
```

---

## Cards

### Basic Feature Card

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-full hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
  <FileText className="h-10 w-10 text-emerald-400 mb-3 mx-auto" />
  <h3 className="text-lg font-semibold text-white mb-2 text-center">
    Card Title
  </h3>
  <p className="text-slate-400 text-sm text-center mb-3">
    Description text that provides context about this feature.
  </p>
  <div className="text-xs text-emerald-400/70 text-center font-medium">
    Additional metadata
  </div>
</div>
```

### Color Variant Cards

Each feature uses a distinct accent color:

```tsx
// Emerald - SEC Filings
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
  <FileText className="h-10 w-10 text-emerald-400 mb-3" />
  {/* content */}
</div>

// Cyan - Earnings Calls
<div className="... hover:border-cyan-500/50 hover:shadow-cyan-500/20 ...">
  <Mic className="h-10 w-10 text-cyan-400 mb-3" />
</div>

// Purple - Technical Indicators
<div className="... hover:border-purple-500/50 hover:shadow-purple-500/20 ...">
  <LineChart className="h-10 w-10 text-purple-400 mb-3" />
</div>

// Blue - 13F Filings
<div className="... hover:border-blue-500/50 hover:shadow-blue-500/20 ...">
  <Building2 className="h-10 w-10 text-blue-400 mb-3" />
</div>

// Pink - Private Markets
<div className="... hover:border-pink-500/50 hover:shadow-pink-500/20 ...">
  <Rocket className="h-10 w-10 text-pink-400 mb-3" />
</div>

// Orange - Research Tools
<div className="... hover:border-orange-500/50 hover:shadow-orange-500/20 ...">
  <Search className="h-10 w-10 text-orange-400 mb-3" />
</div>
```

### Pricing Card (Basic)

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 h-full hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
  <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
  <p className="text-slate-400 mb-6">Perfect for beginners</p>

  {/* Price */}
  <div className="mb-8">
    <span className="text-5xl font-bold text-white">$29</span>
    <span className="text-slate-400">/month</span>
  </div>

  {/* Features */}
  <ul className="space-y-4 mb-8">
    <li className="flex items-start space-x-3">
      <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
      <span className="text-slate-300">100 stock analyses/month</span>
    </li>
    <li className="flex items-start space-x-3">
      <Check className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
      <span className="text-slate-300">SEC filing summaries</span>
    </li>
  </ul>

  {/* CTA */}
  <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all hover:scale-105">
    Get Started
  </button>
</div>
```

### Pricing Card (Featured/Popular)

```tsx
<div className="bg-gradient-to-b from-emerald-500/20 to-cyan-500/10 backdrop-blur-xl border-2 border-emerald-500/70 rounded-2xl p-8 relative transform md:scale-105 shadow-2xl shadow-emerald-500/40 h-full">
  {/* Badge */}
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
    {/* More features... */}
  </ul>

  <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:scale-105 transition-all">
    Get Started
  </button>
</div>
```

### Dashboard Stats Card

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
  <p className="text-slate-400 text-sm mb-1">Analyses This Month</p>
  <p className="text-3xl font-bold text-white">42</p>
  <p className="text-xs text-emerald-400 mt-2">42 of 100 used</p>
</div>
```

### Welcome Card (Gradient Background)

```tsx
<div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-6">
  <h2 className="text-2xl font-bold text-white mb-2">
    Welcome back!
  </h2>
  <p className="text-slate-300">
    Ready to analyze your next opportunity?
  </p>
</div>
```

---

## Form Elements

### Text Input

```tsx
<input
  type="text"
  placeholder="Enter stock ticker..."
  className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
/>
```

### Search Input with Icon

```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
  <input
    type="text"
    placeholder="Search stocks..."
    className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
  />
</div>
```

### Input with Button

```tsx
<div className="flex gap-3">
  <input
    type="text"
    placeholder="Enter stock ticker..."
    className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all"
  />
  <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
    Analyze
  </button>
</div>
```

### Input States

```tsx
// Default
<input className="... border-white/20 ..." />

// Focus
<input className="... focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 ..." />

// Error
<input className="... border-red-500/50 focus:border-red-500 focus:ring-red-500/50 ..." />
```

---

## Badges & Pills

### Stock Symbol Badge

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
  AAPL
</span>
```

### Status Badges

```tsx
// Success/Active
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
  Active
</span>

// Warning
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
  Pending
</span>

// Info
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
  New
</span>

// Premium/Special
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
  Premium
</span>
```

### Badge with Icon

```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
  <CheckCircle className="h-3 w-3" />
  Verified
</span>
```

---

## Navigation

### Top Navigation Bar

```tsx
<nav className="container mx-auto px-6 py-6 safe-area-inset-top">
  <div className="flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center space-x-2">
      <TrendingUp className="h-8 w-8 text-emerald-400" />
      <span className="text-2xl font-bold text-white">VORTIS</span>
    </div>

    {/* Nav Items */}
    <div className="flex items-center space-x-4 md:space-x-6">
      <Link
        href="/pricing"
        className="text-slate-300 hover:text-white transition-colors text-sm md:text-base"
      >
        Pricing
      </Link>
      <Link
        href="/dashboard"
        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 text-sm md:text-base touch-manipulation"
      >
        Get Started
      </Link>
    </div>
  </div>
</nav>
```

### Top Nav with Border

```tsx
<nav className="border-b border-slate-800 bg-black/50 backdrop-blur-xl safe-area-inset-top">
  <div className="container mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      {/* content */}
    </div>
  </div>
</nav>
```

### Sidebar Navigation

```tsx
<aside className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
  <nav className="space-y-2">
    {/* Active Item */}
    <Link
      href="/dashboard"
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors"
    >
      <LayoutDashboard className="h-5 w-5" />
      <span className="font-medium">Dashboard</span>
    </Link>

    {/* Inactive Items */}
    <Link
      href="/dashboard/analyses"
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      <TrendingUp className="h-5 w-5" />
      <span>Analyses</span>
    </Link>

    <Link
      href="/dashboard/watchlist"
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      <Star className="h-5 w-5" />
      <span>Watchlist</span>
    </Link>
  </nav>
</aside>
```

---

## Typography

### Hero Title

```tsx
<h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
  <span className="text-white">AI-Powered Stock</span>
  <br />
  <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
    Trading Intelligence
  </span>
</h1>
```

### Section Title

```tsx
<h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
  Choose Your <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Trading Plan</span>
</h2>
```

### Card Title

```tsx
<h3 className="text-2xl font-bold text-white mb-2">
  Card Title
</h3>
```

### Body Text Hierarchy

```tsx
// Primary body text
<p className="text-lg md:text-xl text-slate-300">
  Main description or introduction text.
</p>

// Secondary body text
<p className="text-base text-slate-400">
  Supporting information or details.
</p>

// Caption/Metadata
<p className="text-sm text-slate-500">
  Additional context or metadata.
</p>

// Small print
<p className="text-xs text-slate-600">
  Fine print or disclaimer text.
</p>
```

### Gradient Text

```tsx
// Primary gradient (Emerald to Cyan)
<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
  Gradient Text
</span>

// Multi-color gradient
<span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
  Multi-color Gradient
</span>

// Purple to Pink
<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
  Purple Gradient
</span>
```

---

## Layout Patterns

### Container with Centered Content

```tsx
<div className="container mx-auto px-6 py-20">
  <div className="max-w-4xl mx-auto text-center">
    {/* Centered content */}
  </div>
</div>
```

### Feature Grid (3 columns on desktop)

```tsx
<div className="container mx-auto px-6 py-16">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Feature cards */}
    </div>
  </div>
</div>
```

### Pricing Grid (3 columns)

```tsx
<div className="grid md:grid-cols-3 gap-8">
  {/* Pricing cards */}
</div>
```

### Dashboard Layout (Sidebar + Main)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Sidebar - 1 column */}
  <aside className="lg:col-span-1">
    {/* Sidebar content */}
  </aside>

  {/* Main Content - 3 columns */}
  <main className="lg:col-span-3">
    {/* Main content */}
  </main>
</div>
```

### Stats Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Stat cards */}
</div>
```

---

## Loading States

### Skeleton Loader

```tsx
<div className="space-y-3 animate-pulse">
  <div className="h-4 bg-white/10 rounded w-3/4"></div>
  <div className="h-4 bg-white/10 rounded w-1/2"></div>
  <div className="h-4 bg-white/10 rounded w-5/6"></div>
</div>
```

### Spinner

```tsx
<div className="flex items-center justify-center">
  <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
</div>
```

### Loading Card

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-white/10 rounded w-1/4"></div>
    <div className="h-8 bg-white/10 rounded w-1/2"></div>
    <div className="space-y-2">
      <div className="h-3 bg-white/10 rounded"></div>
      <div className="h-3 bg-white/10 rounded w-5/6"></div>
    </div>
  </div>
</div>
```

---

## Empty States

### Basic Empty State

```tsx
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
  <div className="text-center py-12">
    <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
    <p className="text-slate-400 mb-2">No analyses yet</p>
    <p className="text-sm text-slate-500">
      Search for a stock ticker above to get started
    </p>
  </div>
</div>
```

### Empty State with CTA

```tsx
<div className="text-center py-16">
  <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-white mb-2">
    No watchlist items
  </h3>
  <p className="text-slate-400 mb-6">
    Start building your watchlist by analyzing stocks
  </p>
  <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
    Analyze Your First Stock
  </button>
</div>
```

---

## Dividers

### Default Divider

```tsx
<div className="border-t border-slate-800"></div>
```

### Thick Divider

```tsx
<div className="border-t-2 border-slate-700"></div>
```

### Gradient Divider

```tsx
<div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
```

### Divider with Text

```tsx
<div className="relative my-8">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-slate-800"></div>
  </div>
  <div className="relative flex justify-center">
    <span className="px-4 text-sm text-slate-400 bg-black">or</span>
  </div>
</div>
```

---

## Responsive Utilities

### Mobile/Desktop Navigation Toggle

```tsx
// Show on mobile, hide on desktop
<div className="block lg:hidden">
  {/* Mobile menu */}
</div>

// Hide on mobile, show on desktop
<div className="hidden lg:block">
  {/* Desktop menu */}
</div>
```

### Responsive Text Sizing

```tsx
<h1 className="text-5xl sm:text-6xl md:text-7xl">
  Responsive Title
</h1>

<p className="text-sm md:text-base lg:text-lg">
  Responsive body text
</p>
```

### Responsive Spacing

```tsx
<div className="px-4 md:px-6 lg:px-8">
  {/* Responsive horizontal padding */}
</div>

<div className="py-12 md:py-16 lg:py-20">
  {/* Responsive vertical padding */}
</div>
```

### Responsive Grid Columns

```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>

// 1 column mobile, 4 columns desktop
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {/* Grid items */}
</div>
```

---

## Accessibility Features

### Focus Indicators

All interactive elements have visible focus states:

```tsx
// Button focus
<button className="... focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black">

// Input focus
<input className="... focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50">

// Link focus
<a className="... focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:rounded-lg">
```

### Touch Targets (iOS/Mobile)

All touch targets meet 44x44px minimum:

```tsx
<button className="touch-manipulation min-h-[44px] min-w-[44px] ...">
  <Icon className="h-5 w-5" />
</button>
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

### Screen Reader Only Text

```tsx
<span className="sr-only">
  Loading stock data...
</span>
```

---

## Animations

### Fade In Animation

```tsx
<div className="animate-fade-in">
  {/* Content fades in */}
</div>
```

### Slide Up Animation

```tsx
<div className="animate-slide-up">
  {/* Content slides up */}
</div>
```

### Blob Animation (Background)

```tsx
<div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
<div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
<div className="absolute bottom-0 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
```

---

## Production Checklist

- [ ] All buttons have hover states
- [ ] All interactive elements have focus indicators
- [ ] Touch targets are minimum 44x44px
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Responsive breakpoints tested (mobile, tablet, desktop)
- [ ] Loading states implemented
- [ ] Empty states handled
- [ ] Error states styled
- [ ] ARIA labels added where needed
- [ ] Reduced motion preferences respected
- [ ] iOS safe area insets applied
