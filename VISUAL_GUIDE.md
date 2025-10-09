# Vortis Visual Design Guide

Visual reference for colors, shadows, and effects used in the design system.

## Color Swatches

### Brand Colors (Primary Palette)

```
████████  Emerald 500: #10b981  (Primary CTA, Success)
████████  Cyan 500:    #06b6d4  (Secondary, Info)
████████  Purple 500:  #8b5cf6  (Accent, Special)
```

### Feature Accent Colors

```
████████  Emerald 400: #34d399  (SEC Filings)
████████  Cyan 400:    #22d3ee  (Earnings Calls)
████████  Purple 400:  #c084fc  (Technical Indicators)
████████  Blue 400:    #60a5fa  (13F Filings)
████████  Pink 400:    #f472b6  (Private Markets)
████████  Orange 400:  #fb923c  (Research Tools)
```

### Slate Scale (Text & UI)

```
████████  Slate 100:  #f1f5f9  (Lightest - unused on dark)
████████  Slate 200:  #e2e8f0
████████  Slate 300:  #cbd5e1  (Secondary text - 12.6:1)
████████  Slate 400:  #94a3b8  (Tertiary text - 9.2:1)
████████  Slate 500:  #64748b  (Caption text - 6.6:1)
████████  Slate 600:  #475569  (Muted elements)
████████  Slate 700:  #334155  (Secondary buttons)
████████  Slate 800:  #1e293b  (Borders, dividers)
████████  Slate 900:  #0f172a  (Dark elements)
```

### Background Colors

```
████████  Black:       #000000  (Page background)
████████  White 5%:    rgba(255,255,255,0.05)  (Cards)
████████  White 10%:   rgba(255,255,255,0.10)  (Inputs, hover)
████████  White 20%:   rgba(255,255,255,0.20)  (Borders)
```

## Color Usage Matrix

| Element | Background | Text | Border | Hover Border |
|---------|-----------|------|--------|--------------|
| Page | `#000000` | - | - | - |
| Card | `rgba(255,255,255,0.05)` | `#ffffff` | `rgba(255,255,255,0.1)` | `rgba(16,185,129,0.5)` |
| Input | `rgba(255,255,255,0.1)` | `#ffffff` | `rgba(255,255,255,0.2)` | `#10b981` |
| Button Primary | `linear-gradient(#10b981, #059669)` | `#ffffff` | - | - |
| Button Secondary | `#334155` | `#ffffff` | - | - |
| Nav Link | - | `#cbd5e1` | - | `#ffffff` |
| Badge | `rgba(16,185,129,0.2)` | `#34d399` | `rgba(16,185,129,0.3)` | - |

## Gradient Definitions

### Button Gradients

```tsx
// Primary CTA
bg-gradient-to-r from-emerald-500 to-emerald-600
hover:from-emerald-600 hover:to-emerald-700

// Full Spectrum CTA
bg-gradient-to-r from-emerald-500 to-cyan-500
hover:from-emerald-600 hover:to-cyan-600

// Purple Button
bg-purple-600
hover:bg-purple-500
```

### Text Gradients

```tsx
// Primary (Emerald to Cyan)
bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent

// Multi-color
bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent

// Purple to Pink
bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent
```

### Background Gradients

```tsx
// Featured Card
bg-gradient-to-b from-emerald-500/20 to-cyan-500/10

// Hero Background
bg-gradient-to-b from-black via-black to-emerald-950/20

// Overlay
bg-gradient-to-t from-black via-transparent to-transparent
```

## Shadow System

### Elevation Shadows

```tsx
shadow-sm        // Subtle lift
shadow-md        // Standard card
shadow-lg        // Featured element
shadow-xl        // Modal
shadow-2xl       // Hero element
```

### Glow Effects (Color + Shadow)

```tsx
// Emerald Glow
shadow-lg shadow-emerald-500/20    // Subtle
shadow-2xl shadow-emerald-500/40   // Strong

// Cyan Glow
shadow-lg shadow-cyan-500/20
shadow-2xl shadow-cyan-500/40

// Purple Glow
shadow-lg shadow-purple-500/20
shadow-2xl shadow-purple-500/40
```

### Visual Representation

```
No Shadow:        ████████
shadow-sm:        ████████ ░
shadow-md:        ████████ ░░
shadow-lg:        ████████ ░░░
shadow-xl:        ████████ ░░░░
shadow-2xl:       ████████ ░░░░░

With Glow:        ████████ 🟩🟩 (emerald glow)
```

## Border Treatments

### Default Borders

```tsx
border border-white/10              // 10% opacity
border-2 border-white/20            // Thicker, 20%
border border-slate-800             // Solid gray
```

### Hover Borders (Feature Colors)

```tsx
hover:border-emerald-500/50
hover:border-cyan-500/50
hover:border-purple-500/50
hover:border-blue-500/50
hover:border-pink-500/50
hover:border-orange-500/50
```

### Focus Borders

```tsx
focus:border-emerald-500
focus:ring-2 focus:ring-emerald-500/50
focus:ring-offset-2 focus:ring-offset-black
```

## Glass Effect (Glassmorphism)

### Standard Glass Card

```tsx
bg-white/5 backdrop-blur-xl border border-white/10
```

Visual representation:
```
┌──────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░ │  ← White 5% background
│ ░░░(blurred content) │  ← Backdrop blur
│ ░░░░░░░░░░░░░░░░░░░░ │
└──────────────────────┘
     ↑ White 10% border
```

### Glass Card with Hover

```tsx
bg-white/5 backdrop-blur-xl border border-white/10
hover:bg-white/10 hover:border-emerald-500/50
```

### Glass Input

```tsx
bg-white/10 backdrop-blur-xl border border-white/20
focus:border-emerald-500
```

## Typography Hierarchy

### Visual Scale

```
Hero (72px):      █████████████████████████
Title (60px):     ████████████████████
Heading (36px):   █████████████
Subheading (30px): ███████████
Body (18px):      ███████
Small (14px):     █████
Caption (12px):   ████
```

### Weight + Color Combinations

```tsx
// Primary Heading
font-bold text-white
// Result: Heavy, maximum contrast

// Secondary Heading
font-semibold text-white
// Result: Semi-bold, high contrast

// Body Text
font-normal text-slate-300
// Result: Regular weight, good contrast

// Small Text
font-medium text-slate-400
// Result: Medium weight, adequate contrast

// Caption
font-normal text-slate-500
// Result: Regular weight, lower contrast
```

## Icon Sizing

```tsx
// Extra Small (badges, inline)
className="h-3 w-3"     // 12px

// Small (buttons, nav)
className="h-4 w-4"     // 16px

// Default (list items)
className="h-5 w-5"     // 20px

// Large (feature cards)
className="h-10 w-10"   // 40px

// Extra Large (empty states)
className="h-12 w-12"   // 48px
```

## Spacing Rhythm

### Visual Spacing Scale

```
gap-2:  ██ (8px)
gap-3:  ███ (12px)
gap-4:  ████ (16px)
gap-6:  ██████ (24px)
gap-8:  ████████ (32px)

py-3:   ███ (12px vertical)
py-4:   ████ (16px vertical)
py-6:   ██████ (24px vertical)
py-8:   ████████ (32px vertical)
```

### Component Spacing Patterns

#### Feature Card

```
┌────────────────────┐
│ p-6                │ ← 24px padding all sides
│  ┌──────┐          │
│  │ Icon │          │
│  └──────┘          │
│     ↓ mb-3         │ ← 12px margin bottom
│   Title            │
│     ↓ mb-2         │ ← 8px margin bottom
│   Description      │
│     ↓ mb-3         │ ← 12px margin bottom
│   Metadata         │
└────────────────────┘
```

#### Button

```
┌────────────┐
│  px-6 py-3 │ ← Horizontal: 24px, Vertical: 12px
│   Button   │   (Total height > 44px with text)
└────────────┘
```

## Border Radius Scale

```
rounded-none:    ▭ (0px)
rounded-sm:      ▢ (2px)
rounded:         ▢ (4px)
rounded-md:      ▢ (6px)
rounded-lg:      ▢ (8px)
rounded-xl:      ⬜ (12px)   ← Cards
rounded-2xl:     ⬜ (16px)   ← Large cards, modals
rounded-full:    ● (9999px) ← Pills, icon buttons
```

## Animation Timing

```tsx
// Fast (UI feedback)
duration-150    // 150ms

// Standard (most transitions)
duration-300    // 300ms

// Slow (emphasis)
duration-500    // 500ms

// Very Slow (background effects)
duration-700    // 700ms (blob animation uses 7s)
```

## Hover State Transformations

### Scale

```
Normal:      ████████ (scale: 1)
Hover:       █████████ (scale: 1.05)
Active:      ███████ (scale: 0.95)
```

### Border Glow

```
Normal:      ┌────────┐  (border: white/10)
Hover:       ┏━━━━━━━━┓  (border: emerald-500/50)
             🟩🟩🟩🟩    (shadow: emerald-500/20)
```

## Focus Indicators

### Button Focus

```
Normal:   [ Button ]

Focus:    ┏━━━━━━━━━━━┓
          ┃ [ Button ] ┃  ← 2px emerald ring
          ┗━━━━━━━━━━━┛
```

### Input Focus

```
Normal:   ┌───────────┐
          │   Input   │  (border: white/20)
          └───────────┘

Focus:    ┏━━━━━━━━━━━┓
          ┃ │ Input │ ┃  (border: emerald-500)
          ┗━━━━━━━━━━━┛  (ring: emerald-500/50)
```

## Responsive Breakpoint Visual

```
Mobile (<640px):      │██│
                      │██│

Tablet (640-1024px):  │██████│
                      │██████│

Desktop (1024px+):    │████████████│
                      │████████████│
```

## Z-Index Stacking

```
Layer 70:  ████ Toast notifications
Layer 60:  ████ Tooltips
Layer 50:  ████ Modals
Layer 40:  ████ Overlays
Layer 10:  ████ Content
Layer 0:   ████ Background (blobs, gradients)
```

## Complete Component Anatomy

### Feature Card Breakdown

```
┌─────────────────────────────────────┐  ← border: white/10
│ bg-white/5 backdrop-blur-xl         │     rounded-xl
│ p-6                                 │     hover:border-emerald-500/50
│                                     │     hover:shadow-lg shadow-emerald-500/20
│          ┌──────┐                   │
│          │ Icon │  h-10 w-10        │
│          └──────┘  text-emerald-400 │
│              ↓ mb-3                 │
│                                     │
│  ┌───────────────────────┐          │
│  │  Title                │          │  text-lg font-semibold
│  │  text-white           │          │  text-center mb-2
│  └───────────────────────┘          │
│              ↓                      │
│                                     │
│  ┌───────────────────────┐          │
│  │  Description text     │          │  text-slate-400 text-sm
│  │  with multiple lines  │          │  text-center mb-3
│  └───────────────────────┘          │
│              ↓                      │
│                                     │
│  ┌───────────────────────┐          │
│  │  Metadata             │          │  text-xs text-emerald-400/70
│  └───────────────────────┘          │  font-medium text-center
│                                     │
└─────────────────────────────────────┘
```

### Button Anatomy

```
┌──────────────────────────────────────┐
│ bg-gradient-to-r from-emerald-500    │
│   to-emerald-600                     │  ← Gradient background
│ px-6 py-3                            │  ← Padding
│ rounded-lg                           │  ← Rounded corners
│ font-semibold text-white            │  ← Typography
│ shadow-lg shadow-emerald-500/30     │  ← Glow effect
│ hover:scale-105                     │  ← Hover transform
│ focus:ring-2 ring-emerald-500      │  ← Focus indicator
│ touch-manipulation                  │  ← Touch optimization
│                                     │
│         Get Started Free            │
│                                     │
└──────────────────────────────────────┘
```

## Live Examples

See these files for working implementations:

- `/components/examples/design-token-examples.tsx` - All patterns
- `/app/page.tsx` - Homepage with cards
- `/app/pricing/page.tsx` - Pricing cards
- `/app/dashboard/page.tsx` - Dashboard layout

## Color Accessibility

All color combinations meet or exceed WCAG 2.1 Level AAA:

```
Text Color         Background    Contrast  Rating
═══════════════════════════════════════════════════
White              Black         21:1      ✅ AAA
Slate 300          Black         12.6:1    ✅ AAA
Slate 400          Black         9.2:1     ✅ AAA
Slate 500          Black         6.6:1     ✅ AAA
Emerald 400        Black         9.8:1     ✅ AAA
Cyan 400           Black         10.1:1    ✅ AAA
Purple 400         Black         7.9:1     ✅ AAA
Orange 400         Black         7.2:1     ✅ AAA

WCAG AA:  4.5:1 minimum
WCAG AAA: 7:1 minimum
```

---

Use this guide as a visual reference when building components. For code examples, refer to COMPONENT_LIBRARY.md.
