# Google OAuth Quick Start

## 5-Minute Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Enable Google OAuth in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Add Client ID from Google Cloud Console
4. Add Client Secret from Google Cloud Console
5. Note the callback URL: `https://[project].supabase.co/auth/v1/callback`

### 3. Configure Google Cloud Console

1. Go to https://console.cloud.google.com
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `https://[project].supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to Supabase

### 4. Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000/auth/login

Click "Continue with Google" → Should redirect to Google → Approve → Redirects back

### 5. Demo Page

Visit: http://localhost:3000/auth-demo

Test all components and states visually.

## Usage Examples

### Basic Login Page

```tsx
import { GoogleSignInButtonDark, AuthLayout } from '@/components/auth';

export default function LoginPage() {
  return (
    <AuthLayout title="Sign in" subtitle="Welcome back">
      <GoogleSignInButtonDark />
    </AuthLayout>
  );
}
```

### With Error Handling

```tsx
'use client';

import { useState } from 'react';
import { GoogleSignInButtonDark, InlineAuthError } from '@/components/auth';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error && <InlineAuthError error={error} />}
      <GoogleSignInButtonDark
        onError={(err) => setError(err.message)}
        onSignInStart={() => setError(null)}
      />
    </div>
  );
}
```

## Component Imports

```tsx
// Individual imports
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { GoogleSignInButtonDark } from '@/components/auth/google-sign-in-button';
import { AuthLayout } from '@/components/auth/auth-layout';
import { AuthError } from '@/components/auth/auth-error';

// Or use index
import {
  GoogleSignInButton,
  GoogleSignInButtonDark,
  AuthLayout,
  AuthError,
  InlineAuthError,
} from '@/components/auth';
```

## Common Props

### GoogleSignInButtonDark

```tsx
<GoogleSignInButtonDark
  text="Sign up with Google"        // Button text
  redirectTo="/dashboard"            // Where to go after auth
  onSignInStart={() => {...}}        // Called when clicked
  onError={(err) => {...}}           // Called on error
  disabled={false}                   // Disable button
  className="custom-class"           // Custom styling
/>
```

### AuthLayout

```tsx
<AuthLayout
  title="Welcome"                    // Page title
  subtitle="Sign in to continue"    // Description
  showBackLink={true}                // Show back to home link
>
  {/* Your content */}
</AuthLayout>
```

## OAuth Flow

```
User clicks button
     ↓
Redirect to Google
     ↓
User approves
     ↓
Redirect to /auth/callback?code=...
     ↓
Exchange code for session
     ↓
Redirect to /dashboard (or error page)
```

## Error Handling

Errors automatically display inline. Handle them:

```tsx
<GoogleSignInButtonDark
  onError={(error) => {
    // Log to error service
    console.error('Auth failed:', error);

    // Track in analytics
    analytics.track('Auth Error', { message: error.message });

    // Show custom message
    setErrorMessage('Please try again or contact support');
  }}
/>
```

## Troubleshooting

**Problem**: Button doesn't work
- Check browser console for errors
- Verify `.env.local` has correct values
- Restart dev server (`npm run dev`)

**Problem**: Redirects to wrong page
- Check `redirectTo` prop
- Verify callback route exists (`/app/auth/callback/route.ts`)

**Problem**: "Unauthorized client" error
- Verify Google Cloud Console redirect URI
- Check Supabase callback URL matches
- Ensure Client ID/Secret are correct

**Problem**: Styling looks broken
- Verify Tailwind CSS is running
- Check for CSS conflicts
- Clear browser cache

## Testing Checklist

- [ ] Click button → Redirects to Google
- [ ] Approve permissions → Redirects to dashboard
- [ ] Cancel OAuth → Error displays
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Mobile responsive
- [ ] No console errors

## Next Steps

1. Customize button text for your brand
2. Add analytics tracking
3. Customize error messages
4. Add email confirmation (optional)
5. Configure rate limiting in Supabase
6. Set up monitoring/alerts

## Full Documentation

- **Component API**: `/components/auth/README.md`
- **Examples**: `/components/auth/EXAMPLES.md`
- **Implementation**: `/components/auth/IMPLEMENTATION_SUMMARY.md`
- **Checklist**: `../../docs/oauth/GOOGLE_OAUTH_CHECKLIST.md`

## Support

- GitHub Issues: [Your repo]
- Email: support@vortis.com
- Supabase Docs: https://supabase.com/docs/guides/auth
