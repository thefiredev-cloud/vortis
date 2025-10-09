"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { GradientText } from "@/components/ui/gradient-text";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Quote } from "lucide-react";

/**
 * Testimonial configuration type
 */
interface Testimonial {
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
 * Default testimonials configuration
 */
const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "testimonial-michael",
    quote:
      "Vortis has completely changed how I analyze stocks. What used to take hours now takes seconds. The SEC filing insights are incredible.",
    name: "Michael Chen",
    role: "Day Trader",
    gradient: "from-emerald-400 to-cyan-400",
    rating: 5,
  },
  {
    id: "testimonial-sarah",
    quote:
      "The earnings transcript analysis saved me from a bad investment. I found red flags in management tone that I would have missed otherwise.",
    name: "Sarah Martinez",
    role: "Portfolio Manager",
    company: "Apex Capital",
    gradient: "from-cyan-400 to-blue-400",
    rating: 5,
  },
  {
    id: "testimonial-james",
    quote:
      "As a professional trader, having access to 10 years of data and 20+ technical indicators in one platform is a game-changer. Worth every penny.",
    name: "James Anderson",
    role: "Hedge Fund Analyst",
    gradient: "from-purple-400 to-pink-400",
    rating: 5,
  },
];

interface StarRatingProps {
  rating: number;
  maxRating?: number;
}

/**
 * Star rating display component
 */
function StarRating({ rating, maxRating = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-1 justify-center mb-4" role="img" aria-label={`${rating} out of ${maxRating} stars`}>
      {Array.from({ length: maxRating }, (_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-slate-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  delay?: number;
}

/**
 * Individual testimonial card component
 */
function TestimonialCard({ testimonial, delay = 0 }: TestimonialCardProps) {
  return (
    <AnimatedCard delay={delay}>
      <article
        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-6 md:p-8 h-full transition-all duration-300 touch-manipulation active:scale-[0.98]"
        aria-labelledby={`testimonial-${testimonial.id}-name`}
      >
        {/* Quote Icon */}
        <div className="mb-4" aria-hidden="true">
          <Quote className="h-8 w-8 text-emerald-400/30" />
        </div>

        {/* Rating */}
        {testimonial.rating && <StarRating rating={testimonial.rating} />}

        {/* Quote */}
        <blockquote className="text-slate-300 mb-6 text-sm md:text-base leading-relaxed italic">
          "{testimonial.quote}"
        </blockquote>

        {/* Author Info */}
        <footer className="flex items-center gap-4 pt-4 border-t border-white/10">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {testimonial.avatarUrl ? (
              <img
                src={testimonial.avatarUrl}
                alt=""
                className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r ${testimonial.gradient} rounded-full`}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Name and Role */}
          <div className="flex-1 min-w-0">
            <p
              id={`testimonial-${testimonial.id}-name`}
              className="text-white font-semibold text-sm md:text-base truncate"
            >
              {testimonial.name}
            </p>
            <p className="text-slate-400 text-xs md:text-sm truncate">
              {testimonial.role}
              {testimonial.company && ` • ${testimonial.company}`}
            </p>
          </div>
        </footer>
      </article>
    </AnimatedCard>
  );
}

interface TestimonialsSectionProps {
  /** Custom testimonials to display. If not provided, uses default testimonials */
  testimonials?: Testimonial[];
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Number of columns in the grid (responsive) */
  columns?: 2 | 3;
  /** Show border on top */
  bordered?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Testimonials section displaying customer reviews and feedback
 *
 * @example
 * ```tsx
 * <TestimonialsSection
 *   title="What Traders Say"
 *   subtitle="Join thousands of satisfied customers"
 *   columns={3}
 * />
 * ```
 */
export function TestimonialsSection({
  testimonials = DEFAULT_TESTIMONIALS,
  title = "Trusted by Traders",
  subtitle,
  columns = 3,
  bordered = true,
  className = "",
}: TestimonialsSectionProps) {
  const gridCols = columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3";
  const borderClasses = bordered ? "border-t border-white/10" : "";

  return (
    <section
      className={`py-16 md:py-24 ${borderClasses} ${className}`}
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <h2
            id="testimonials-heading"
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            <GradientText>{title}</GradientText>
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div
          className={`grid grid-cols-1 ${gridCols} gap-6 md:gap-8 max-w-7xl mx-auto`}
          role="list"
          aria-label="Customer testimonials"
        >
          {testimonials.map((testimonial, idx) => (
            <div key={testimonial.id} role="listitem">
              <TestimonialCard testimonial={testimonial} delay={0.1 * idx} />
            </div>
          ))}
        </div>

        {/* Optional Footer Text */}
        <FadeIn delay={0.4 + testimonials.length * 0.1} className="text-center mt-12 md:mt-16">
          <p className="text-slate-400 text-sm md:text-base">
            Join thousands of traders who trust Vortis for their stock analysis
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// Export types for external use
export type { Testimonial, TestimonialsSectionProps };
