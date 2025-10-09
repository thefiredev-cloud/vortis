# Vortis Design System - Complete Index

Quick navigation to all design system documentation and implementation files.

## Getting Started

Start here if you're new to the design system:

1. **[DESIGN_SYSTEM_README.md](/Users/tannerosterkamp/vortis/DESIGN_SYSTEM_README.md)** - Overview and quick start
2. **[DESIGN_QUICK_REFERENCE.md](/Users/tannerosterkamp/vortis/DESIGN_QUICK_REFERENCE.md)** - One-page cheat sheet
3. **[lib/design-tokens.ts](/Users/tannerosterkamp/vortis/lib/design-tokens.ts)** - Import and use tokens

## Documentation Files

### Core Documentation

| File | Description | Use When |
|------|-------------|----------|
| **[DESIGN_SYSTEM_README.md](/Users/tannerosterkamp/vortis/DESIGN_SYSTEM_README.md)** | Complete overview, getting started guide | First time using system |
| **[DESIGN_SYSTEM.md](/Users/tannerosterkamp/vortis/DESIGN_SYSTEM.md)** | Comprehensive design system spec | Building new features |
| **[DESIGN_QUICK_REFERENCE.md](/Users/tannerosterkamp/vortis/DESIGN_QUICK_REFERENCE.md)** | One-page cheat sheet | Daily development |
| **[VISUAL_GUIDE.md](/Users/tannerosterkamp/vortis/VISUAL_GUIDE.md)** | Visual examples with diagrams | Understanding visual patterns |

### Component Documentation

| File | Description | Use When |
|------|-------------|----------|
| **[COMPONENT_LIBRARY.md](/Users/tannerosterkamp/vortis/COMPONENT_LIBRARY.md)** | Copy-paste component patterns | Building UI components |
| **[components/examples/design-token-examples.tsx](/Users/tannerosterkamp/vortis/components/examples/design-token-examples.tsx)** | Working code examples | Learning implementation |

### Accessibility

| File | Description | Use When |
|------|-------------|----------|
| **[ACCESSIBILITY_REPORT.md](/Users/tannerosterkamp/vortis/ACCESSIBILITY_REPORT.md)** | WCAG compliance guide | Ensuring accessibility |

## Implementation Files

### Configuration

| File | Purpose |
|------|---------|
| **[tailwind.config.ts](/Users/tannerosterkamp/vortis/tailwind.config.ts)** | Tailwind v4 configuration with custom tokens |
| **[postcss.config.mjs](/Users/tannerosterkamp/vortis/postcss.config.mjs)** | PostCSS configuration |
| **[app/globals.css](/Users/tannerosterkamp/vortis/app/globals.css)** | Global styles, animations, iOS optimizations |

### TypeScript Utilities

| File | Purpose |
|------|---------|
| **[lib/design-tokens.ts](/Users/tannerosterkamp/vortis/lib/design-tokens.ts)** | Design token constants and utility functions |

### Example Implementations

| File | Shows |
|------|-------|
| **[app/page.tsx](/Users/tannerosterkamp/vortis/app/page.tsx)** | Homepage with feature cards |
| **[app/pricing/page.tsx](/Users/tannerosterkamp/vortis/app/pricing/page.tsx)** | Pricing cards and layouts |
| **[app/dashboard/page.tsx](/Users/tannerosterkamp/vortis/app/dashboard/page.tsx)** | Dashboard layout and navigation |
| **[components/sections/enhanced-hero.tsx](/Users/tannerosterkamp/vortis/components/sections/enhanced-hero.tsx)** | Hero section with gradient text |
| **[components/ui/animated-card.tsx](/Users/tannerosterkamp/vortis/components/ui/animated-card.tsx)** | Animated card wrapper |
| **[components/ui/floating-cta.tsx](/Users/tannerosterkamp/vortis/components/ui/floating-cta.tsx)** | Floating CTA component |

## Quick Reference by Task

### I want to...

#### Build a new page

1. Read: [DESIGN_SYSTEM_README.md](/Users/tannerosterkamp/vortis/DESIGN_SYSTEM_README.md) - Basic structure section
2. Copy from: [app/page.tsx](/Users/tannerosterkamp/vortis/app/page.tsx)
3. Use tokens from: [lib/design-tokens.ts](/Users/tannerosterkamp/vortis/lib/design-tokens.ts)

#### Create a new component

1. Reference: [COMPONENT_LIBRARY.md](/Users/tannerosterkamp/vortis/COMPONENT_LIBRARY.md)
2. Copy patterns from: [components/examples/design-token-examples.tsx](/Users/tannerosterkamp/vortis/components/examples/design-token-examples.tsx)
3. Use tokens: Import from `@/lib/design-tokens`

#### Style a button

1. Quick ref: [DESIGN_QUICK_REFERENCE.md](/Users/tannerosterkamp/vortis/DESIGN_QUICK_REFERENCE.md) - Common Patterns
2. Full patterns: [COMPONENT_LIBRARY.md](/Users/tannerosterkamp/vortis/COMPONENT_LIBRARY.md) - Buttons section
3. Use: `designTokens.button.primary`

#### Style a card

1. Quick ref: [DESIGN_QUICK_REFERENCE.md](/Users/tannerosterkamp/vortis/DESIGN_QUICK_REFERENCE.md) - Feature Card
2. Full patterns: [COMPONENT_LIBRARY.md](/Users/tannerosterkamp/vortis/COMPONENT_LIBRARY.md) - Cards section
3. Use: `designTokens.card.hover`

#### Choose colors

1. Visual: [VISUAL_GUIDE.md](/Users/tannerosterkamp/vortis/VISUAL_GUIDE.md) - Color Swatches
2. Usage: [DESIGN_SYSTEM.md](/Users/tannerosterkamp/vortis/DESIGN_SYSTEM.md) - Color Palette
3. Accessibility: [ACCESSIBILITY_REPORT.md](/Users/tannerosterkamp/vortis/ACCESSIBILITY_REPORT.md) - Color Contrast

#### Set up forms

1. Patterns: [COMPONENT_LIBRARY.md](/Users/tannerosterkamp/vortis/COMPONENT_LIBRARY.md) - Form Elements
2. Examples: [components/examples/design-token-examples.tsx](/Users/tannerosterkamp/vortis/components/examples/design-token-examples.tsx) - SearchFormExample
3. Use: `designTokens.input.default`

#### Add animations

1. Guide: [DESIGN_SYSTEM.md](/Users/tannerosterkamp/vortis/DESIGN_SYSTEM.md) - Utilities section
2. Config: [tailwind.config.ts](/Users/tannerosterkamp/vortis/tailwind.config.ts) - Animation definitions
3. CSS: [app/globals.css](/Users/tannerosterkamp/vortis/app/globals.css) - Keyframes

#### Ensure accessibility

1. Report: [ACCESSIBILITY_REPORT.md](/Users/tannerosterkamp/vortis/ACCESSIBILITY_REPORT.md)
2. Focus states: [COMPONENT_LIBRARY.md](/Users/tannerosterkamp/vortis/COMPONENT_LIBRARY.md) - Accessibility section
3. Touch targets: [app/globals.css](/Users/tannerosterkamp/vortis/app/globals.css) - Touch optimization

#### Make it responsive

1. Breakpoints: [DESIGN_QUICK_REFERENCE.md](/Users/tannerosterkamp/vortis/DESIGN_QUICK_REFERENCE.md) - Responsive Breakpoints
2. Patterns: [COMPONENT_LIBRARY.md](/Users/tannerosterkamp/vortis/COMPONENT_LIBRARY.md) - Responsive Utilities
3. Grids: Use `designTokens.grid.*`

## Common Imports

### Every Component Should Import

```tsx
import { designTokens, cn } from "@/lib/design-tokens";
```

### For Feature Cards

```tsx
import { designTokens, featureColors } from "@/lib/design-tokens";
import { FileText, TrendingUp, Search } from "lucide-react";
```

### For Animated Components

```tsx
import { motion } from "framer-motion";
import { designTokens } from "@/lib/design-tokens";
```

## Design System Structure

```
vortis/
├── Documentation
│   ├── DESIGN_SYSTEM_README.md         # Start here
│   ├── DESIGN_SYSTEM.md                # Full spec
│   ├── DESIGN_QUICK_REFERENCE.md       # Cheat sheet
│   ├── VISUAL_GUIDE.md                 # Visual examples
│   ├── COMPONENT_LIBRARY.md            # Component patterns
│   ├── ACCESSIBILITY_REPORT.md         # A11y guide
│   └── DESIGN_SYSTEM_INDEX.md          # This file
│
├── Configuration
│   ├── tailwind.config.ts              # Tailwind config
│   ├── postcss.config.mjs              # PostCSS config
│   └── app/globals.css                 # Global styles
│
├── Implementation
│   ├── lib/
│   │   └── design-tokens.ts            # Token utilities
│   │
│   ├── components/
│   │   ├── ui/                         # Base UI components
│   │   │   ├── animated-card.tsx
│   │   │   ├── floating-cta.tsx
│   │   │   └── ...
│   │   │
│   │   ├── sections/                   # Section components
│   │   │   ├── enhanced-hero.tsx
│   │   │   └── ...
│   │   │
│   │   └── examples/                   # Example usage
│   │       └── design-token-examples.tsx
│   │
│   └── app/                            # Page implementations
│       ├── page.tsx                    # Homepage
│       ├── pricing/page.tsx            # Pricing
│       └── dashboard/page.tsx          # Dashboard
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-09 | Initial design system release |

## Color Palette at a Glance

```tsx
// Brand
emerald-500: #10b981  // Primary
cyan-500: #06b6d4     // Secondary
purple-500: #8b5cf6   // Accent

// Feature Colors
emerald-400: #34d399  // SEC
cyan-400: #22d3ee     // Earnings
purple-400: #c084fc   // Technical
blue-400: #60a5fa     // 13F
pink-400: #f472b6     // Private
orange-400: #fb923c   // Research

// Text
text-white            // Primary
text-slate-300        // Secondary
text-slate-400        // Tertiary
text-slate-500        // Caption
```

## Most Used Design Tokens

```tsx
// Buttons
designTokens.button.primary
designTokens.button.secondary
designTokens.button.outlined

// Cards
designTokens.card.base
designTokens.card.hover
designTokens.card.featured

// Inputs
designTokens.input.default
designTokens.input.search

// Typography
designTokens.text.hero
designTokens.text.title
designTokens.text.body

// Layout
designTokens.container.section
designTokens.grid.features
designTokens.layout.page
```

## Design Principles

1. **Dark-First:** Optimized for dark theme with vibrant accents
2. **Glassmorphism:** Frosted glass effects for depth
3. **High Contrast:** WCAG AAA compliant text (7:1+ ratios)
4. **Touch-Optimized:** 44x44px minimum targets (iOS HIG)
5. **Responsive:** Mobile-first with logical breakpoints
6. **Accessible:** Keyboard nav, screen reader support, focus indicators
7. **Performant:** GPU-optimized animations, lazy loading

## Testing Checklist

Before deploying new components:

- [ ] Check [ACCESSIBILITY_REPORT.md](/Users/tannerosterkamp/vortis/ACCESSIBILITY_REPORT.md) for requirements
- [ ] Verify color contrast with tools
- [ ] Test keyboard navigation
- [ ] Verify 44x44px touch targets on mobile
- [ ] Test with screen reader
- [ ] Check responsive breakpoints
- [ ] Verify hover/focus states
- [ ] Test on iOS Safari

## Support

For questions or issues with the design system:

1. Check this index for relevant documentation
2. Review [DESIGN_QUICK_REFERENCE.md](/Users/tannerosterkamp/vortis/DESIGN_QUICK_REFERENCE.md) for quick answers
3. Reference [COMPONENT_LIBRARY.md](/Users/tannerosterkamp/vortis/COMPONENT_LIBRARY.md) for patterns
4. Look at working examples in `/components/examples/`

## Contributing

When adding to the design system:

1. Update relevant MD files
2. Add examples to `design-token-examples.tsx`
3. Update this index if needed
4. Follow existing patterns in [DESIGN_SYSTEM.md](/Users/tannerosterkamp/vortis/DESIGN_SYSTEM.md)
5. Ensure accessibility compliance

---

**Design System Version:** 1.0.0
**Last Updated:** 2025-10-09
**Maintained by:** Vortis Team
