# Clerk Authentication & Routing Tests

## Environment Setup

Before testing, ensure you have set the following environment variables in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_WEBHOOK_SECRET=whsec_...
```

## Test Checklist

### Public Routes (No Auth Required)

- [ ] `/` - Homepage loads without authentication
- [ ] `/pricing` - Pricing page loads without authentication
- [ ] `/sign-in` - Clerk sign-in component renders
- [ ] `/sign-up` - Clerk sign-up component renders

### Protected Routes (Auth Required)

- [ ] `/dashboard` - Redirects to `/sign-in` when not authenticated
- [ ] `/dashboard/analyze` - Redirects to `/sign-in` when not authenticated
- [ ] `/dashboard/analyze/[ticker]` - Redirects to `/sign-in` when not authenticated
- [ ] `/dashboard/watchlist` - Redirects to `/sign-in` when not authenticated
- [ ] `/dashboard/reports` - Redirects to `/sign-in` when not authenticated
- [ ] `/dashboard/settings` - Redirects to `/sign-in` when not authenticated
- [ ] `/dashboard/billing` - Redirects to `/sign-in` when not authenticated

### Authentication Flow

- [ ] Sign-up flow:
  - [ ] Create new account via `/sign-up`
  - [ ] Email verification (if enabled)
  - [ ] Redirects to `/dashboard` after successful sign-up
  - [ ] User data is accessible via Clerk

- [ ] Sign-in flow:
  - [ ] Sign in via `/sign-in`
  - [ ] Redirects to `/dashboard` after successful sign-in
  - [ ] Session persists on page reload
  - [ ] User data displays correctly in dashboard

- [ ] Sign-out flow:
  - [ ] Click UserButton in navigation
  - [ ] Click "Sign out"
  - [ ] Redirects to `/` (homepage)
  - [ ] Session is cleared
  - [ ] Accessing `/dashboard` redirects to `/sign-in`

### Navigation & UI Components

- [ ] UserButton displays in desktop navigation
- [ ] UserButton displays in mobile navigation
- [ ] User email displays correctly in mobile menu
- [ ] UserButton dropdown works:
  - [ ] Manage account option available
  - [ ] Sign out option available
  - [ ] Custom styling applied

### API Routes Protection

- [ ] `/api/analyze/[ticker]` - Protected (requires auth)
- [ ] `/api/analyze` - Protected (requires auth)
- [ ] `/api/stripe/webhook` - Public (Stripe verifies)
- [ ] `/api/webhooks/clerk` - Public (Clerk verifies)

### Middleware Behavior

- [ ] Middleware runs on all routes (check matcher config)
- [ ] Public routes accessible without auth
- [ ] Protected routes require auth
- [ ] API routes respect protection rules
- [ ] Static files (images, CSS, JS) load without middleware

### Edge Cases

- [ ] Expired session redirects to sign-in
- [ ] Invalid token redirects to sign-in
- [ ] Direct URL access to protected routes redirects correctly
- [ ] Back button after sign-out doesn't show protected content
- [ ] Multiple tabs: sign-out in one tab affects all tabs

### Performance & UX

- [ ] Sign-in/sign-up pages load quickly (< 2s)
- [ ] No flash of unauthenticated content (FOUC)
- [ ] Smooth redirects (no double redirects)
- [ ] Loading states show during auth checks
- [ ] Error messages display for auth failures

## Testing Process

1. **Start Fresh**:
   ```bash
   # Clear cookies and localStorage
   # Open incognito/private window
   ```

2. **Test Public Routes**:
   - Visit each public route without signing in
   - Verify content loads correctly

3. **Test Protected Routes**:
   - Visit protected routes without signing in
   - Verify redirect to sign-in page

4. **Test Sign-Up**:
   - Create a new account
   - Verify email (if enabled)
   - Check redirect to dashboard
   - Verify user data in UI

5. **Test Sign-In**:
   - Sign out (if signed in)
   - Sign in with existing account
   - Verify redirect to dashboard
   - Check session persistence

6. **Test Navigation**:
   - Click all sidebar links
   - Click all mobile menu links
   - Verify UserButton functionality

7. **Test Sign-Out**:
   - Click UserButton
   - Click sign-out
   - Verify redirect to homepage
   - Try accessing protected route

## Known Issues

- None currently

## Notes

- Clerk manages session tokens automatically
- Middleware runs on edge runtime (fast)
- UserButton styling matches app theme
- All redirects use absolute paths

## Maintenance

Update this checklist when:
- Adding new protected routes
- Changing redirect URLs
- Modifying middleware configuration
- Adding new auth features
