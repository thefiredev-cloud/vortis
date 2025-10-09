# Google OAuth Components - Usage Examples

## Basic Examples

### 1. Simple Login Page

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';
import { AuthLayout } from '@/components/auth';

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue">
      <GoogleSignInButtonDark />
    </AuthLayout>
  );
}
```

### 2. Login with Error Handling

```tsx
'use client';

import { useState } from 'react';
import { GoogleSignInButtonDark, InlineAuthError } from '@/components/auth';
import { AuthLayout } from '@/components/auth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthLayout title="Sign in to Vortis">
      {error && <InlineAuthError error={error} className="mb-4" />}

      <GoogleSignInButtonDark
        onSignInStart={() => setError(null)}
        onError={(err) => setError(err.message)}
      />
    </AuthLayout>
  );
}
```

### 3. Signup with Benefits

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';
import { AuthLayout } from '@/components/auth';
import { Sparkles } from 'lucide-react';

const BENEFITS = [
  {
    icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
    title: 'Feature 1',
    description: 'Amazing feature description',
  },
  // ... more benefits
];

export default function SignupPage() {
  return (
    <AuthLayout title="Get started" subtitle="Create your account">
      {/* Benefits List */}
      <div className="mb-6 space-y-3">
        {BENEFITS.map((benefit, i) => (
          <div key={i} className="flex gap-3">
            {benefit.icon}
            <div>
              <h3 className="text-white font-medium">{benefit.title}</h3>
              <p className="text-slate-400 text-sm">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      <GoogleSignInButtonDark text="Sign up with Google" />
    </AuthLayout>
  );
}
```

### 4. Custom Redirect

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';

export default function CustomPage() {
  return (
    <GoogleSignInButtonDark
      text="Continue with Google"
      redirectTo="/onboarding"
    />
  );
}
```

### 5. Light Theme Button

```tsx
'use client';

import { GoogleSignInButton } from '@/components/auth';

export default function LightThemePage() {
  return (
    <div className="bg-white p-8">
      <GoogleSignInButton text="Sign in with Google" />
    </div>
  );
}
```

## Advanced Examples

### 6. With Analytics Tracking

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';

export default function LoginPage() {
  const handleSignInStart = () => {
    // Track sign-in attempt
    analytics.track('Sign In Started', {
      method: 'google',
      timestamp: new Date().toISOString(),
    });
  };

  const handleError = (error: Error) => {
    // Track sign-in error
    analytics.track('Sign In Failed', {
      method: 'google',
      error: error.message,
    });
  };

  return (
    <GoogleSignInButtonDark
      onSignInStart={handleSignInStart}
      onError={handleError}
    />
  );
}
```

### 7. With Loading State Management

```tsx
'use client';

import { useState } from 'react';
import { GoogleSignInButtonDark } from '@/components/auth';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      {isLoading && (
        <div className="mb-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mx-auto" />
          <p className="text-sm text-slate-400 mt-2">Redirecting to Google...</p>
        </div>
      )}

      <GoogleSignInButtonDark
        onSignInStart={() => setIsLoading(true)}
        disabled={isLoading}
      />
    </div>
  );
}
```

### 8. Error Page with Full Recovery

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { AuthError } from '@/components/auth';
import { AuthLayout } from '@/components/auth';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code');

  const handleRetry = () => {
    router.push('/auth/login');
  };

  return (
    <AuthLayout showBackLink={false}>
      <AuthError
        error={error}
        errorCode={errorCode}
        onRetry={handleRetry}
      />
    </AuthLayout>
  );
}
```

### 9. Multi-Provider Auth (Future)

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';
import { AuthLayout } from '@/components/auth';
import { Github } from 'lucide-react';

export default function LoginPage() {
  return (
    <AuthLayout title="Sign in">
      <div className="space-y-3">
        <GoogleSignInButtonDark />

        {/* Future: GitHub OAuth */}
        <button className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-3">
          <Github className="h-5 w-5" />
          <span>Continue with GitHub</span>
        </button>
      </div>
    </AuthLayout>
  );
}
```

### 10. Custom Styled Button

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';

export default function CustomStyledLogin() {
  return (
    <GoogleSignInButtonDark
      className="max-w-sm mx-auto"
      text="Continue with Google"
    />
  );
}
```

## Component Composition Examples

### 11. Auth Modal

```tsx
'use client';

import { useState } from 'react';
import { GoogleSignInButtonDark, AuthCard } from '@/components/auth';
import { X } from 'lucide-react';

export function AuthModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        <AuthCard>
          <h2 className="text-2xl font-bold text-white mb-6">Sign in required</h2>
          <GoogleSignInButtonDark />
        </AuthCard>
      </div>
    </div>
  );
}
```

### 12. Inline Auth CTA

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';

export function InlineAuthCTA() {
  return (
    <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
      <h3 className="text-2xl font-bold text-white mb-2">
        Ready to get started?
      </h3>
      <p className="text-slate-400 mb-6">
        Sign in to access advanced features and save your analysis.
      </p>
      <GoogleSignInButtonDark className="max-w-sm mx-auto" />
    </div>
  );
}
```

## Testing Examples

### 13. Component Test (React Testing Library)

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GoogleSignInButtonDark } from '@/components/auth';

describe('GoogleSignInButtonDark', () => {
  it('renders with default text', () => {
    render(<GoogleSignInButtonDark />);
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<GoogleSignInButtonDark text="Sign up with Google" />);
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });

  it('calls onSignInStart when clicked', () => {
    const handleStart = jest.fn();
    render(<GoogleSignInButtonDark onSignInStart={handleStart} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleStart).toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<GoogleSignInButtonDark disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state', async () => {
    render(<GoogleSignInButtonDark />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Button should show loading text
    expect(await screen.findByText('Connecting to Google...')).toBeInTheDocument();
  });

  it('displays error message', () => {
    const { rerender } = render(<GoogleSignInButtonDark />);

    // Simulate error
    const handleError = jest.fn();
    rerender(<GoogleSignInButtonDark onError={handleError} />);

    // Trigger error state (you'd need to mock Supabase for real test)
    // expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
```

### 14. E2E Test (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('Google OAuth flow', async ({ page }) => {
  // Navigate to login
  await page.goto('/auth/login');

  // Click Google Sign-In button
  await page.click('button:has-text("Continue with Google")');

  // Should redirect to Google (in real test, you'd mock this)
  await expect(page).toHaveURL(/accounts\.google\.com/);

  // After OAuth (mocked), should redirect to dashboard
  // await expect(page).toHaveURL('/dashboard');
});

test('handles OAuth cancellation', async ({ page }) => {
  await page.goto('/auth/login');

  // Simulate OAuth error
  await page.goto('/auth/callback?error=access_denied');

  // Should show error message
  await expect(page.locator('role=alert')).toContainText('cancelled');
});
```

## Accessibility Examples

### 15. Screen Reader Optimized

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';

export default function AccessibleLogin() {
  return (
    <main role="main" aria-labelledby="login-title">
      <h1 id="login-title" className="sr-only">
        Sign in to Vortis Trading Platform
      </h1>

      <div className="space-y-4">
        <p className="text-slate-400" id="login-description">
          Use your Google account to sign in securely.
        </p>

        <GoogleSignInButtonDark aria-describedby="login-description" />
      </div>
    </main>
  );
}
```

### 16. Keyboard Navigation Test

```tsx
// Test keyboard navigation
test('keyboard navigation works', async ({ page }) => {
  await page.goto('/auth/login');

  // Tab to button
  await page.keyboard.press('Tab');

  // Focus should be on Google Sign-In button
  const button = page.locator('button:has-text("Continue with Google")');
  await expect(button).toBeFocused();

  // Enter should trigger sign-in
  await page.keyboard.press('Enter');

  // Should initiate OAuth flow
  await expect(page).toHaveURL(/accounts\.google\.com/);
});
```

## Environment-Specific Examples

### 17. Development Mode with Debug

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';

export default function DevLogin() {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div>
      <GoogleSignInButtonDark
        onSignInStart={() => {
          if (isDev) console.log('[DEV] Sign-in started');
        }}
        onError={(error) => {
          if (isDev) console.error('[DEV] Sign-in error:', error);
        }}
      />

      {isDev && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
          <strong>Dev Mode:</strong> Check console for debug logs
        </div>
      )}
    </div>
  );
}
```

### 18. Staging Environment Notice

```tsx
'use client';

import { GoogleSignInButtonDark } from '@/components/auth';

export default function StagingLogin() {
  const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging';

  return (
    <div>
      {isStaging && (
        <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded text-sm text-orange-400">
          <strong>Staging Environment:</strong> This is not production data
        </div>
      )}

      <GoogleSignInButtonDark />
    </div>
  );
}
```

## Integration Examples

### 19. With Form Validation

```tsx
'use client';

import { useState } from 'react';
import { GoogleSignInButtonDark } from '@/components/auth';

export default function SignupWithTerms() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="space-y-4">
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-slate-400">
          I agree to the Terms of Service and Privacy Policy
        </span>
      </label>

      <GoogleSignInButtonDark disabled={!agreedToTerms} />

      {!agreedToTerms && (
        <p className="text-xs text-slate-500 text-center">
          Please accept the terms to continue
        </p>
      )}
    </div>
  );
}
```

### 20. With Marketing Campaign Tracking

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { GoogleSignInButtonDark } from '@/components/auth';

export default function CampaignLogin() {
  const searchParams = useSearchParams();
  const utm_source = searchParams.get('utm_source');
  const utm_campaign = searchParams.get('utm_campaign');

  return (
    <GoogleSignInButtonDark
      redirectTo={`/dashboard?welcome=true&source=${utm_source || 'direct'}`}
      onSignInStart={() => {
        // Track campaign sign-in
        if (typeof window !== 'undefined' && utm_campaign) {
          localStorage.setItem('signup_campaign', utm_campaign);
        }
      }}
    />
  );
}
```

## Common Patterns

### Pattern 1: Error Recovery Flow
```tsx
error → display message → retry button → clear error → try again
```

### Pattern 2: Loading State
```tsx
idle → loading → (success | error) → idle
```

### Pattern 3: Redirect Flow
```tsx
login → OAuth → callback → exchange code → redirect to dashboard
```

### Pattern 4: Error Display
```tsx
inline error (form) → full page error (critical) → toast (minor)
```

## Best Practices

1. **Always handle errors**: Provide `onError` callback
2. **Clear errors on retry**: Reset error state before new attempt
3. **Show loading states**: Indicate when OAuth is in progress
4. **Accessible labels**: Include descriptive ARIA labels
5. **Test keyboard nav**: Ensure full keyboard accessibility
6. **Mobile-friendly**: Use touch-optimized sizes (48px+)
7. **Error recovery**: Provide clear path to retry or get help
8. **Analytics**: Track sign-in attempts and errors
9. **Environment aware**: Different behavior for dev/staging/prod
10. **Graceful degradation**: Handle network failures gracefully
