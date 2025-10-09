import Link from 'next/link';
import { OrbBackground } from '@/components/ui/orb-background';
import { ReactNode } from 'react';

/**
 * Shared Authentication Layout
 *
 * Provides consistent layout for all auth pages (login, signup, etc.)
 * with Vortis branding, dark theme, and responsive design.
 */

interface AuthLayoutProps {
  /** Main content to render in the auth card */
  children: ReactNode;
  /** Optional title displayed above the card */
  title?: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Show back to home link */
  showBackLink?: boolean;
  /** Custom className for the card wrapper */
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showBackLink = true,
  className = '',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-12 px-6">
      {/* Animated background */}
      <OrbBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <Link
          href="/"
          className="flex items-center justify-center mb-8 group"
          aria-label="Vortis home"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent transition-all group-hover:scale-105">
            Vortis
          </h1>
        </Link>

        {/* Auth Card */}
        <div
          className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl ${className}`}
        >
          {/* Optional Title/Subtitle */}
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-slate-400 text-base md:text-lg">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Main Content */}
          {children}
        </div>

        {/* Back to Home Link */}
        {showBackLink && (
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-1"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Auth Card Component
 * For use within custom auth layouts
 */
export function AuthCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}
