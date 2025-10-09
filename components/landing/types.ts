/**
 * Type definitions for landing page components
 * @module components/landing/types
 */

import type { LucideIcon } from "lucide-react";

/**
 * Feature card configuration
 */
export interface Feature {
  /** Unique identifier for the feature */
  id: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Additional metric or badge text */
  badge: string;
  /** Color theme for the feature card */
  color: "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";
}

/**
 * Statistic item configuration
 */
export interface Stat {
  /** Unique identifier */
  id: string;
  /** Numeric value to display */
  value: number;
  /** Optional suffix (e.g., "+", "k+", " Years") */
  suffix?: string;
  /** Optional prefix (e.g., "$", ">") */
  prefix?: string;
  /** Label describing the statistic */
  label: string;
  /** Animation delay in seconds */
  delay?: number;
}

/**
 * Step in a process configuration
 */
export interface Step {
  /** Unique identifier */
  id: string;
  /** Step number (1, 2, 3, etc.) */
  number: number;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Color theme for the step */
  color: "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";
}

/**
 * Testimonial configuration
 */
export interface Testimonial {
  /** Unique identifier */
  id: string;
  /** Testimonial quote/content */
  quote: string;
  /** Person's name */
  name: string;
  /** Person's role/title */
  role: string;
  /** Optional company name */
  company?: string;
  /** Avatar URL (optional) */
  avatarUrl?: string;
  /** Avatar gradient (when no avatarUrl provided) */
  gradient: string;
  /** Rating out of 5 (optional) */
  rating?: number;
}

/**
 * Common color theme type used across components
 */
export type ColorTheme = "emerald" | "cyan" | "purple" | "blue" | "pink" | "orange";

/**
 * Grid column options
 */
export type GridColumns = 2 | 3 | 4 | 6;
