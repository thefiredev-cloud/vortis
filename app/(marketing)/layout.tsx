import { OrbBackground } from "@/components/ui/orb-background";
import { FloatingCTA } from "@/components/ui/floating-cta";
import { designTokens } from "@/lib/design-tokens";

/**
 * Marketing Layout - Public pages with consistent header/footer
 * Used for: home, pricing, etc.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={designTokens.layout.page}>
      <OrbBackground />

      <div className="relative z-10">
        {/* Page Content */}
        {children}

        {/* Floating CTA */}
        <FloatingCTA />

        {/* Footer */}
        <footer className="border-t border-slate-800 py-12">
          <div className={`${designTokens.container.default} text-center text-slate-400`}>
            <p>
              &copy; {new Date().getFullYear()} Vortis. Revolutionary AI-powered trading
              intelligence.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
