import { SignUp } from '@clerk/nextjs';
import { OrbBackground } from '@/components/ui/orb-background';

/**
 * Sign Up Page - Clerk Authentication
 *
 * Uses Clerk's pre-built SignUp component with custom dark theme.
 * Includes Google OAuth configured in the Clerk dashboard.
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OrbBackground />

      <div className="relative z-10 w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl",
            }
          }}
        />
      </div>
    </div>
  );
}
