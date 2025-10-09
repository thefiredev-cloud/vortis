/**
 * Vortis Design Tokens
 * Composed Tailwind utility classes for consistent design patterns
 */

export const designTokens = {
  // Container
  container: {
    default: "container mx-auto px-6",
    section: "container mx-auto px-6 py-16",
    sectionLg: "container mx-auto px-6 py-20",
  },

  // Cards
  card: {
    base: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6",
    hover: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300",
    featured: "bg-gradient-to-b from-emerald-500/20 to-cyan-500/10 backdrop-blur-xl border-2 border-emerald-500/70 rounded-2xl p-8 shadow-2xl shadow-emerald-500/40",
    dashboard: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6",
    gradient: "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl p-6",
  },

  // Buttons
  button: {
    primary: "px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 touch-manipulation",
    secondary: "px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all hover:scale-105 touch-manipulation",
    outlined: "px-6 py-3 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 rounded-lg font-semibold transition-all touch-manipulation",
    ghost: "px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors touch-manipulation",
    icon: "p-2 hover:bg-white/10 rounded-full transition-colors touch-manipulation",
    gradient: "px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30 touch-manipulation",
    purple: "px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all hover:scale-105 touch-manipulation",
  },

  // Form Elements
  input: {
    default: "w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all",
    search: "w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all",
    error: "w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-red-500/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50 transition-all",
  },

  // Typography
  text: {
    hero: "text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight",
    title: "text-4xl md:text-5xl font-bold text-white",
    heading: "text-2xl md:text-3xl font-bold text-white",
    subheading: "text-xl md:text-2xl font-semibold text-white",
    body: "text-base md:text-lg text-slate-300",
    bodyLarge: "text-lg md:text-xl text-slate-300",
    small: "text-sm text-slate-400",
    caption: "text-xs text-slate-500",
  },

  // Gradients
  gradient: {
    text: {
      primary: "bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent",
      multi: "bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent",
      purple: "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent",
    },
    bg: {
      primary: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      full: "bg-gradient-to-r from-emerald-500 to-cyan-500",
      subtle: "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10",
      hero: "bg-gradient-to-b from-black via-black to-emerald-950/20",
    },
  },

  // Badges/Pills
  badge: {
    default: "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    success: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400",
    warning: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400",
    info: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400",
    purple: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400",
  },

  // Navigation
  nav: {
    top: "container mx-auto px-6 py-6 safe-area-inset-top",
    link: "text-slate-300 hover:text-white transition-colors",
    linkActive: "text-white font-medium",
    sidebar: "flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors",
    sidebarActive: "flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors",
  },

  // Loading States
  loading: {
    skeleton: "animate-pulse bg-white/10 rounded",
    spinner: "border-4 border-emerald-500 border-t-transparent rounded-full animate-spin",
  },

  // Feature Cards (with color variants)
  feature: {
    emerald: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300",
    cyan: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300",
    purple: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300",
    blue: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300",
    pink: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300",
    orange: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300",
  },

  // Grids
  grid: {
    features: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    pricing: "grid md:grid-cols-3 gap-8",
    dashboard: "grid grid-cols-1 lg:grid-cols-4 gap-6",
    stats: "grid grid-cols-1 md:grid-cols-3 gap-4",
  },

  // Layouts
  layout: {
    page: "min-h-screen bg-black relative overflow-hidden",
    section: "relative z-10",
    centered: "max-w-4xl mx-auto text-center",
    content: "max-w-6xl mx-auto",
  },

  // Animations
  animation: {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up",
    scaleIn: "animate-scale-in",
    blob: "animate-blob",
  },

  // Overlays
  overlay: {
    dark: "absolute inset-0 bg-black/50 backdrop-blur-sm",
    gradient: "absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent",
  },

  // Dividers
  divider: {
    default: "border-t border-slate-800",
    thick: "border-t-2 border-slate-700",
    gradient: "h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent",
  },
} as const;

/**
 * Utility function to combine design tokens with custom classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Color mappings for feature icons
 */
export const featureColors = {
  emerald: {
    icon: "text-emerald-400",
    card: designTokens.feature.emerald,
    badge: "text-emerald-400/70",
  },
  cyan: {
    icon: "text-cyan-400",
    card: designTokens.feature.cyan,
    badge: "text-cyan-400/70",
  },
  purple: {
    icon: "text-purple-400",
    card: designTokens.feature.purple,
    badge: "text-purple-400/70",
  },
  blue: {
    icon: "text-blue-400",
    card: designTokens.feature.blue,
    badge: "text-blue-400/70",
  },
  pink: {
    icon: "text-pink-400",
    card: designTokens.feature.pink,
    badge: "text-pink-400/70",
  },
  orange: {
    icon: "text-orange-400",
    card: designTokens.feature.orange,
    badge: "text-orange-400/70",
  },
} as const;

/**
 * Responsive breakpoint helpers
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Common transition durations
 */
export const transitions = {
  fast: "transition-all duration-150",
  default: "transition-all duration-300",
  slow: "transition-all duration-500",
} as const;

/**
 * Z-index scale
 */
export const zIndex = {
  background: 0,
  content: 10,
  overlay: 40,
  modal: 50,
  toast: 60,
  tooltip: 70,
} as const;
