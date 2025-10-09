# Vortis Authentication Components

Production-ready Google OAuth UI components following Google's official branding guidelines and WCAG 2.1 AA accessibility standards.

## Overview

This authentication system replaces traditional email/password flows with streamlined Google OAuth, providing:

- **Secure**: OAuth 2.0 with Google's authentication infrastructure
- **Accessible**: Full keyboard navigation, ARIA labels, screen reader support
- **Responsive**: Touch-optimized, works on all devices
- **Branded**: Follows Google's identity branding guidelines
- **Error Handling**: User-friendly error messages with recovery options

## Components

### 1. GoogleSignInButton

Official Google Sign-In button with proper branding.

**Usage:**
```tsx
import { GoogleSignInButton } from '@/components/auth';

<GoogleSignInButton
  text="Continue with Google"
  redirectTo="/dashboard"
  onSignInStart={() => console.log('Sign-in started')}
  onError={(error) => console.error('Sign-in failed', error)}
/>
```

**Props:**
- `className?`: Custom styling
- `redirectTo?`: Redirect URL after authentication
- `onSignInStart?`: Callback when sign-in begins
- `onError?`: Error callback
- `text?`: Button text (default: "Continue with Google")
- `disabled?`: Disable button

**Features:**
- Official Google logo (SVG)
- Three states: default, loading, error
- 48px minimum height (touch-friendly)
- Follows Google's color palette (#4285F4)
- Loading spinner during OAuth flow
- Inline error messages

### 2. GoogleSignInButtonDark

Dark theme variant optimized for Vortis dark backgrounds.

**Usage:**
```tsx
import { GoogleSignInButtonDark } from '@/components/auth';

<GoogleSignInButtonDark
  text="Sign up with Google"
  onSignInStart={() => setLoading(true)}
  onError={(error) => setError(error.message)}
/>
```

**Differences from Light Variant:**
- Semi-transparent white background (`bg-white/10`)
- Backdrop blur effect
- White text color
- Glowing hover effect
- Better contrast on dark backgrounds

### 3. AuthLayout

Shared layout component for all auth pages.

**Usage:**
```tsx
import { AuthLayout } from '@/components/auth';

<AuthLayout
  title="Sign in to Vortis"
  subtitle="Access your trading dashboard"
>
  {/* Your auth content */}
</AuthLayout>
```

**Props:**
- `children`: Page content
- `title?`: Page title
- `subtitle?`: Description text
- `showBackLink?`: Show "Back to home" link (default: true)
- `className?`: Custom card styling

**Features:**
- Vortis logo with gradient
- Animated orb background
- Centered responsive layout
- Glass-morphism card design
- Back to home navigation

### 4. AuthCard

Standalone card component for custom layouts.

**Usage:**
```tsx
import { AuthCard } from '@/components/auth';

<AuthCard>
  <h2>Custom Auth Flow</h2>
  {/* Your content */}
</AuthCard>
```

### 5. AuthError

Comprehensive error display component.

**Usage:**
```tsx
import { AuthError } from '@/components/auth';

<AuthError
  error="Failed to authenticate"
  errorCode="access_denied"
  onRetry={() => window.location.reload()}
  showLoginLink={true}
/>
```

**Props:**
- `error?`: Error message
- `errorCode?`: Specific error code for custom handling
- `onRetry?`: Retry callback
- `showLoginLink?`: Show "Back to Login" button (default: true)
- `className?`: Custom styling

**Supported Error Codes:**
- `access_denied`: User cancelled OAuth
- `server_error`: Server-side issue
- `temporarily_unavailable`: Service down
- `invalid_request`: Malformed request
- `unauthorized_client`: App not authorized

**Features:**
- User-friendly error messages
- Technical details expandable section
- Retry button
- Return to login link
- Contact support link

### 6. InlineAuthError

Compact inline error for forms.

**Usage:**
```tsx
import { InlineAuthError } from '@/components/auth';

{error && <InlineAuthError error={error} className="mb-4" />}
```

## Pages

### Login Page (`/app/auth/login/page.tsx`)

**Route:** `/auth/login`

**Features:**
- Google Sign-In only
- URL error parameter handling
- Terms & Privacy links
- Sign-up redirect

**URL Parameters:**
- `?error=<message>`: Display error from OAuth callback

### Signup Page (`/app/auth/signup/page.tsx`)

**Route:** `/auth/signup`

**Features:**
- Benefits showcase (3 key features)
- Google Sign-In
- Terms acceptance notice
- Login redirect

**Benefits Displayed:**
- AI-Powered Analysis
- Real-Time Insights
- Professional Tools

### OAuth Callback Loading (`/app/auth/callback/loading.tsx`)

**Route:** `/auth/callback` (loading state)

**Features:**
- Animated Vortis logo
- Spinning progress indicator
- Status messages
- Animated dots

### Error Page (`/app/auth/error/page.tsx`)

**Route:** `/auth/error`

**Features:**
- Full-page error display
- URL parameter parsing
- Retry functionality
- Navigation options

**URL Parameters:**
- `?error=<message>`: Error message
- `?error_code=<code>`: Error code
- `?error_description=<description>`: Detailed description

## OAuth Flow

1. **User clicks "Continue with Google"**
   - Button enters loading state
   - `onSignInStart` callback fires
   - Supabase initiates OAuth

2. **Google authentication**
   - User redirected to Google
   - User approves permissions
   - Google redirects to `/auth/callback?code=...`

3. **Callback processing** (`/app/auth/callback/route.ts`)
   - Exchange code for session
   - Success: Redirect to `/dashboard`
   - Error: Redirect to `/auth/login?error=...`

4. **Error handling**
   - Errors displayed inline
   - User can retry
   - Option to contact support

## Accessibility Features

All components include:

- **ARIA Labels**: Descriptive labels for screen readers
- **ARIA Live Regions**: Error announcements
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Visible focus rings
- **Touch Targets**: Minimum 48px height
- **Semantic HTML**: Proper heading hierarchy
- **Alt Text**: All icons have aria-hidden
- **Color Contrast**: WCAG AA compliant

## Design Tokens

Components use Vortis design system tokens:

```tsx
import { designTokens } from '@/lib/design-tokens';

// Example usage
className={designTokens.button.primary}
className={designTokens.card.base}
className={designTokens.text.heading}
```

## Google Branding Compliance

Follows official Google Identity Branding Guidelines:
https://developers.google.com/identity/branding-guidelines

**Button Specifications:**
- Official Google logo (4-color SVG)
- White background (#FFFFFF)
- Gray text (#757575)
- 1px border (#DADCE0)
- 4px border radius (or theme override)
- Roboto/system font
- 40px minimum height (48px recommended)

**Dark Theme Adjustments:**
- Semi-transparent white background
- White text for better contrast
- Maintains Google logo colors
- Subtle glow effect on hover

## Error Handling

### Network Errors
```tsx
<GoogleSignInButtonDark
  onError={(error) => {
    if (error.message.includes('network')) {
      // Handle network error
    }
  }}
/>
```

### OAuth Errors
Common errors automatically handled:
- `access_denied`: User cancelled
- `invalid_request`: Malformed request
- `server_error`: Server issue
- `temporarily_unavailable`: Service down

### Custom Error Handling
```tsx
const [error, setError] = useState<string | null>(null);

<GoogleSignInButtonDark
  onError={(err) => {
    // Custom logging
    console.error('Auth failed:', err);

    // Custom error message
    setError('Please try again or contact support');

    // Analytics
    trackAuthError(err);
  }}
/>
```

## Testing Checklist

- [ ] Click Google Sign-In button
- [ ] Verify redirect to Google
- [ ] Approve permissions
- [ ] Verify redirect to dashboard
- [ ] Test error states (cancel OAuth)
- [ ] Test keyboard navigation (Tab, Enter, Esc)
- [ ] Test screen reader (VoiceOver, NVDA)
- [ ] Test mobile responsiveness
- [ ] Test touch interactions
- [ ] Verify error messages display
- [ ] Test retry functionality
- [ ] Verify loading states
- [ ] Check console for errors
- [ ] Validate with axe DevTools

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Configuration

Enable Google OAuth in Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable Google provider
3. Add OAuth credentials from Google Cloud Console
4. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

## Security Considerations

- **PKCE Flow**: Uses Supabase's secure PKCE flow
- **State Parameter**: Automatic CSRF protection
- **HTTPOnly Cookies**: Session stored in HTTPOnly cookies
- **Token Refresh**: Automatic token refresh via Supabase
- **Redirect Validation**: Only whitelisted redirect URLs

## Migration from Email/Password

If migrating from email/password auth:

1. Keep existing user data intact
2. Users can sign in with Google using same email
3. Supabase links accounts automatically
4. Remove old password auth forms
5. Update documentation

## Future Enhancements

Potential additions:
- GitHub OAuth support
- LinkedIn OAuth support
- Apple Sign-In
- Multi-factor authentication
- Magic link fallback
- Remember device feature

## Troubleshooting

### Button doesn't respond
- Check browser console for errors
- Verify Supabase env variables
- Check Google OAuth configuration

### Redirect loop
- Verify callback URL in Supabase
- Check for middleware conflicts
- Review session handling

### Error: "Unauthorized client"
- Verify Google OAuth credentials
- Check authorized redirect URIs
- Ensure project is in production mode

### Styling issues
- Verify Tailwind CSS is configured
- Check for CSS conflicts
- Inspect with browser DevTools

## Support

For issues or questions:
- GitHub Issues: [Your repo]
- Email: support@vortis.com
- Documentation: /docs/authentication

## License

MIT License - Vortis Trading Intelligence Platform
