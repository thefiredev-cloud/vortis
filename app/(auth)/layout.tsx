import { OrbBackground } from "@/components/ui/orb-background";
import Link from "next/link";
import { designTokens, cn } from "@/lib/design-tokens";

/**
 * Auth Layout - Centered card layout for authentication pages
 * Used for: login, signup, forgot-password, reset-password
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn(designTokens.layout.page, "flex items-center justify-center")}>
      <OrbBackground />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <h1 className={cn("text-2xl font-bold", designTokens.gradient.text.primary)}>
            Vortis
          </h1>
        </Link>

        {/* Auth Card Content */}
        {children}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
