import { SignIn } from '@clerk/nextjs';
import { OrbBackground } from '@/components/ui/orb-background';

export const dynamic = 'force-dynamic';

/**
 * Login Page - Clerk Authentication
 *
 * Uses Clerk's pre-built SignIn component with custom dark theme.
 * Google OAuth is configured in the Clerk dashboard.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OrbBackground />

      <div className="relative z-10 w-full max-w-md">
        <SignIn
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
