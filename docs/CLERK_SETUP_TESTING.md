# Clerk Setup Testing Guide

Complete guide to verifying your Clerk authentication setup for Vortis.

## Prerequisites

- Clerk account created (https://dashboard.clerk.com)
- Vortis project configured
- Local development environment ready

## 1. Dashboard Configuration Verification

### 1.1 Verify Clerk Application

**Steps:**
1. Navigate to https://dashboard.clerk.com
2. Select your Vortis application
3. Go to **Configure > API Keys**

**Expected Results:**
- Publishable Key visible (starts with `pk_test_` or `pk_live_`)
- Secret Key visible (starts with `sk_test_` or `sk_live_`)
- Keys match your environment (test vs production)

**Test Checklist:**
- [ ] Application created in Clerk dashboard
- [ ] Publishable key present
- [ ] Secret key present
- [ ] Keys match intended environment (test/production)
- [ ] Application name matches "Vortis"

---

### 1.2 Verify Google OAuth Configuration

**Steps:**
1. In Clerk dashboard, go to **User & Authentication > Social Connections**
2. Locate **Google** provider
3. Verify configuration status

**Expected Results:**
- Google provider enabled
- Client ID configured
- Client Secret configured
- OAuth consent screen configured

**Test Checklist:**
- [ ] Google provider enabled (toggle ON)
- [ ] Client ID present (format: `*.apps.googleusercontent.com`)
- [ ] Client Secret configured
- [ ] Clerk handles OAuth redirect automatically
- [ ] No configuration warnings displayed

---

### 1.3 Verify Sign-in/Sign-up Settings

**Steps:**
1. Go to **User & Authentication > Email, Phone, Username**
2. Review authentication methods
3. Go to **Paths** settings

**Expected Results:**
- Email address enabled
- Google OAuth enabled
- Sign-in and Sign-up paths configured

**Test Checklist:**
- [ ] Email authentication enabled
- [ ] Google OAuth enabled
- [ ] Sign-in URL: `/sign-in`
- [ ] Sign-up URL: `/sign-up`
- [ ] After sign-in URL: `/dashboard`
- [ ] After sign-up URL: `/dashboard`

---

### 1.4 Verify User Management Settings

**Steps:**
1. Go to **User & Authentication > Restrictions**
2. Review user restrictions
3. Check email domain settings

**Expected Results:**
- Restrictions configured as needed
- Test users can be created
- Email verification settings correct

**Test Checklist:**
- [ ] Email verification enabled/disabled as intended
- [ ] No domain restrictions (unless required)
- [ ] Sign-up mode allows new users
- [ ] Session settings configured

---

## 2. Environment Variables Validation

### 2.1 Check Local Environment

**Test File:** `/Users/tannerosterkamp/vortis/.env.local`

**Required Variables:**
```bash
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook (for Supabase sync)
CLERK_WEBHOOK_SECRET=whsec_...
```

**Verify Variables:**
```bash
cd /Users/tannerosterkamp/vortis

# Check for required variables
grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local && echo "✓ Publishable Key" || echo "✗ Missing"
grep -q "CLERK_SECRET_KEY" .env.local && echo "✓ Secret Key" || echo "✗ Missing"
grep -q "CLERK_WEBHOOK_SECRET" .env.local && echo "✓ Webhook Secret" || echo "✗ Missing"
```

**Expected Output:**
```
✓ Publishable Key
✓ Secret Key
✓ Webhook Secret
```

**Test Checklist:**
- [ ] `.env.local` file exists
- [ ] All Clerk variables present
- [ ] Keys are not placeholder values
- [ ] Publishable key starts with `pk_test_` or `pk_live_`
- [ ] Secret key starts with `sk_test_` or `sk_live_`
- [ ] Webhook secret starts with `whsec_`
- [ ] No trailing spaces or extra quotes

---

### 2.2 Verify Environment Loading

**Create Test Script:** `/Users/tannerosterkamp/vortis/scripts/test-clerk-env.ts`

```typescript
/**
 * Test Clerk Environment Variables
 *
 * Verifies that all required Clerk environment variables
 * are properly configured and loaded.
 */

const requiredVars = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
  webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
  afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
};

console.log('Clerk Environment Variables Test\n');

let hasErrors = false;

// Test Publishable Key
if (!requiredVars.publishableKey) {
  console.error('✗ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing');
  hasErrors = true;
} else if (!requiredVars.publishableKey.startsWith('pk_')) {
  console.error('✗ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY has invalid format');
  hasErrors = true;
} else {
  const env = requiredVars.publishableKey.startsWith('pk_test_') ? 'TEST' : 'LIVE';
  console.log(`✓ Publishable Key [${env}]`);
}

// Test Secret Key
if (!requiredVars.secretKey) {
  console.error('✗ CLERK_SECRET_KEY is missing');
  hasErrors = true;
} else if (!requiredVars.secretKey.startsWith('sk_')) {
  console.error('✗ CLERK_SECRET_KEY has invalid format');
  hasErrors = true;
} else {
  const env = requiredVars.secretKey.startsWith('sk_test_') ? 'TEST' : 'LIVE';
  console.log(`✓ Secret Key [${env}]`);
}

// Test Webhook Secret
if (!requiredVars.webhookSecret) {
  console.error('✗ CLERK_WEBHOOK_SECRET is missing');
  hasErrors = true;
} else if (!requiredVars.webhookSecret.startsWith('whsec_')) {
  console.error('✗ CLERK_WEBHOOK_SECRET has invalid format');
  hasErrors = true;
} else {
  console.log('✓ Webhook Secret');
}

// Test URL configurations
const urlTests = [
  { name: 'Sign In URL', value: requiredVars.signInUrl, expected: '/sign-in' },
  { name: 'Sign Up URL', value: requiredVars.signUpUrl, expected: '/sign-up' },
  { name: 'After Sign In URL', value: requiredVars.afterSignInUrl, expected: '/dashboard' },
  { name: 'After Sign Up URL', value: requiredVars.afterSignUpUrl, expected: '/dashboard' },
];

urlTests.forEach(test => {
  if (!test.value) {
    console.error(`✗ ${test.name} is missing`);
    hasErrors = true;
  } else if (test.value !== test.expected) {
    console.warn(`⚠ ${test.name}: ${test.value} (expected: ${test.expected})`);
  } else {
    console.log(`✓ ${test.name}: ${test.value}`);
  }
});

// Summary
console.log();
if (hasErrors) {
  console.error('❌ Environment configuration has errors');
  process.exit(1);
} else {
  console.log('✅ All Clerk environment variables configured correctly');
}
```

**Run Test:**
```bash
cd /Users/tannerosterkamp/vortis
npx tsx scripts/test-clerk-env.ts
```

**Expected Output:**
```
Clerk Environment Variables Test

✓ Publishable Key [TEST]
✓ Secret Key [TEST]
✓ Webhook Secret
✓ Sign In URL: /sign-in
✓ Sign Up URL: /sign-up
✓ After Sign In URL: /dashboard
✓ After Sign Up URL: /dashboard

✅ All Clerk environment variables configured correctly
```

---

## 3. Google OAuth Configuration

### 3.1 Configure Google Cloud Console

**Steps:**
1. Go to https://console.cloud.google.com
2. Create/Select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials

**OAuth Consent Screen:**
- App name: Vortis
- User support email: your@email.com
- Developer contact: your@email.com
- Scopes: email, profile, openid

**OAuth Client ID:**
- Application type: Web application
- Name: Vortis (Clerk)
- Authorized JavaScript origins:
  - `https://your-clerk-frontend-api.clerk.accounts.dev`
  - `http://localhost:3000` (for development)
- Authorized redirect URIs:
  - `https://your-clerk-frontend-api.clerk.accounts.dev/v1/oauth_callback`

**Test Checklist:**
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Authorized origins include Clerk domain
- [ ] Redirect URI includes Clerk callback

---

### 3.2 Link Google OAuth to Clerk

**Steps:**
1. In Clerk dashboard, go to **User & Authentication > Social Connections**
2. Click **Google**
3. Enable Google provider
4. Choose "Use custom credentials"
5. Paste Client ID from Google Console
6. Paste Client Secret from Google Console
7. Save

**Expected Results:**
- Google provider shows as "Enabled"
- Custom credentials configured
- No error messages

**Test Checklist:**
- [ ] Google provider enabled in Clerk
- [ ] Custom credentials option selected
- [ ] Client ID matches Google Console
- [ ] Client Secret configured
- [ ] Save successful
- [ ] No configuration warnings

---

### 3.3 Test OAuth Redirect URLs

**Verify Clerk Frontend API:**

**Steps:**
1. In Clerk dashboard, go to **Configure > API Keys**
2. Note your "Frontend API" value
3. Verify format: `clerk.your-domain.12345.lcl.dev` or `your-app.clerk.accounts.dev`

**Add to Google Console:**
```
Authorized JavaScript origins:
https://clerk.your-domain.12345.lcl.dev

Authorized redirect URIs:
https://clerk.your-domain.12345.lcl.dev/v1/oauth_callback
```

**Test Checklist:**
- [ ] Frontend API identified
- [ ] Origin added to Google Console
- [ ] Redirect URI added to Google Console
- [ ] URLs match exactly (no trailing slashes)

---

## 4. Webhook Endpoint Testing

### 4.1 Create Clerk Webhook Endpoint

**Steps:**
1. In Clerk dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter endpoint URL (for production): `https://yourdomain.com/api/webhooks/clerk`
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Create endpoint
6. Copy signing secret (starts with `whsec_`)

**For Development (Local Testing):**
- Use Clerk CLI: `npm run clerk:dev`
- Or use ngrok/Cloudflare Tunnel

**Test Checklist:**
- [ ] Webhook endpoint created
- [ ] Endpoint URL configured
- [ ] Events selected (user.created, user.updated, user.deleted)
- [ ] Signing secret copied to `.env.local`
- [ ] Endpoint status shows "Active"

---

### 4.2 Verify Webhook Secret

**Update `.env.local`:**
```bash
CLERK_WEBHOOK_SECRET=whsec_your_signing_secret_here
```

**Test Format:**
```bash
cd /Users/tannerosterkamp/vortis
node -e "console.log(process.env.CLERK_WEBHOOK_SECRET?.startsWith('whsec_') ? '✓ Valid' : '✗ Invalid')"
```

**Expected Output:**
```
✓ Valid
```

---

## 5. Development Keys vs Production Keys

### 5.1 Environment Separation

**Development (.env.local):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Production (.env.production or Platform ENV):**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Important Differences:**
- Test keys: `pk_test_` / `sk_test_` - For development
- Live keys: `pk_live_` / `sk_live_` - For production
- Separate webhook secrets per environment
- Different Google OAuth credentials (optional but recommended)

**Test Checklist:**
- [ ] Test keys used in development
- [ ] Live keys configured for production
- [ ] Keys never committed to git
- [ ] Separate Clerk applications for dev/prod (recommended)
- [ ] Environment-specific webhook endpoints

---

### 5.2 Verify Key Environments

**Check Current Environment:**
```typescript
// Add to any page temporarily for testing
console.log('Clerk Environment:',
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_')
    ? 'TEST'
    : 'LIVE'
);
```

**Expected Results:**
- Development: Shows "TEST"
- Production: Shows "LIVE"

---

## 6. Test User Creation

### 6.1 Create Test User in Clerk Dashboard

**Method 1: Clerk Dashboard**

**Steps:**
1. Go to **Users** in Clerk dashboard
2. Click **Create User**
3. Fill in:
   - Email: `test@vortis.dev`
   - Password: `TestPassword123!`
   - First name: Test
   - Last name: User
4. Click **Create**

**Expected Results:**
- User appears in user list
- User ID generated (starts with `user_`)
- Email shows as verified (if manually created)

**Test Checklist:**
- [ ] User created successfully
- [ ] User ID format: `user_[alphanumeric]`
- [ ] Email verified
- [ ] Timestamp present
- [ ] No error messages

---

### 6.2 Create Test User via Google OAuth

**Steps:**
1. Start development server: `npm run dev`
2. Navigate to http://localhost:3000/sign-in
3. Click "Continue with Google"
4. Authorize with Google account
5. Verify redirect to dashboard

**Expected Results:**
- OAuth consent screen appears
- User authorizes Vortis
- Redirect back to Vortis
- User created in Clerk
- Session established
- Dashboard loads

**Test Checklist:**
- [ ] Google OAuth button visible
- [ ] OAuth flow initiates
- [ ] Google consent screen shows
- [ ] Authorization succeeds
- [ ] Redirect to /dashboard
- [ ] User visible in Clerk dashboard
- [ ] User data populated (name, email, image)

---

### 6.3 Verify Test User in Clerk

**Steps:**
1. Go to Clerk dashboard > **Users**
2. Find newly created user
3. Click on user to view details

**Expected User Data:**
- User ID
- Email address
- First name / Last name
- Profile image (if Google OAuth)
- Authentication method (Google)
- Last sign-in timestamp
- Created timestamp

---

## 7. Middleware Configuration Testing

### 7.1 Verify Middleware Setup

**File:** `/Users/tannerosterkamp/vortis/middleware.ts`

**Verify Public Routes:**
```typescript
const isPublicRoute = createRouteMatcher([
  '/',              // Homepage
  '/pricing',       // Pricing page
  '/auth/login',    // Custom login (if used)
  '/auth/signup',   // Custom signup (if used)
  '/sign-in(.*)',   // Clerk sign-in
  '/sign-up(.*)',   // Clerk sign-up
  '/api/stripe/webhook',     // Stripe webhooks
  '/api/webhooks(.*)',       // All webhooks
])
```

**Test Checklist:**
- [ ] Middleware file exists
- [ ] `clerkMiddleware` imported
- [ ] Public routes defined
- [ ] `/dashboard` NOT in public routes
- [ ] Webhook routes are public
- [ ] `auth.protect()` called for protected routes

---

### 7.2 Test Public Route Access

**Test Routes:**
```bash
# Should be accessible without auth:
curl -I http://localhost:3000/
curl -I http://localhost:3000/pricing
curl -I http://localhost:3000/sign-in
curl -I http://localhost:3000/api/webhooks/clerk
```

**Expected Results:**
- Status: 200 OK (not 307 redirect)
- No authentication required

---

### 7.3 Test Protected Route Access

**Without Authentication:**
```bash
curl -I http://localhost:3000/dashboard
```

**Expected Result:**
- Status: 307 Temporary Redirect
- Location: `/sign-in`

**With Authentication:**
1. Sign in via browser
2. Access `/dashboard`

**Expected Result:**
- Status: 200 OK
- Dashboard loads
- User data visible

---

## 8. Build and Type Checking

### 8.1 TypeScript Compilation

**Test:**
```bash
cd /Users/tannerosterkamp/vortis
npx tsc --noEmit
```

**Expected Result:**
```
No errors found.
```

**Common Errors to Fix:**
- Missing Clerk types
- Incorrect auth() usage
- Invalid middleware configuration

---

### 8.2 Next.js Build

**Test:**
```bash
cd /Users/tannerosterkamp/vortis
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                Size     First Load JS
┌ ○ /                      [size]   [size]
├ ○ /dashboard            [size]   [size]
└ ○ /sign-in              [size]   [size]
```

**Test Checklist:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No middleware errors
- [ ] All routes compiled
- [ ] Clerk integration successful

---

## 9. Setup Verification Checklist

**Complete before proceeding to authentication testing:**

### Clerk Dashboard
- [ ] Application created
- [ ] API keys obtained (publishable + secret)
- [ ] Google OAuth provider enabled
- [ ] Google credentials configured
- [ ] Webhook endpoint created
- [ ] Webhook secret obtained

### Google Cloud Console
- [ ] OAuth client created
- [ ] Authorized origins configured
- [ ] Redirect URIs configured
- [ ] Client ID copied to Clerk
- [ ] Client Secret copied to Clerk

### Environment Configuration
- [ ] `.env.local` created
- [ ] All Clerk variables set
- [ ] No placeholder values
- [ ] Keys match environment (test/live)
- [ ] Webhook secret configured

### Code Configuration
- [ ] Clerk middleware configured
- [ ] Public routes defined
- [ ] Protected routes configured
- [ ] Sign-in/Sign-up components installed
- [ ] TypeScript builds successfully

### Test Users
- [ ] Test user created in Clerk
- [ ] Can sign in via Google OAuth
- [ ] User data syncs correctly
- [ ] Dashboard accessible when authenticated

---

## 10. Troubleshooting Common Issues

### Issue: "Clerk publishable key not found"

**Symptoms:**
- Error on page load
- "Missing publishable key" message

**Solutions:**
1. Verify `.env.local` exists
2. Check variable name: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. Ensure value starts with `pk_test_` or `pk_live_`
4. Restart dev server: `npm run dev`
5. Clear `.next` cache: `rm -rf .next`

---

### Issue: Google OAuth fails

**Symptoms:**
- OAuth redirect fails
- "Redirect URI mismatch" error

**Solutions:**
1. Verify Clerk Frontend API URL
2. Add Frontend API to Google Console authorized origins
3. Add callback URL to Google Console redirect URIs
4. Format: `https://[frontend-api].clerk.accounts.dev/v1/oauth_callback`
5. Save changes in both Clerk and Google Console
6. Wait 5-10 minutes for Google changes to propagate

---

### Issue: Middleware blocks all routes

**Symptoms:**
- All routes redirect to sign-in
- Can't access homepage

**Solutions:**
1. Check `isPublicRoute` matcher in middleware
2. Ensure `/` is included
3. Verify `auth.protect()` only called for non-public routes
4. Test with: `console.log('Is Public:', isPublicRoute(request))`

---

### Issue: Build fails with Clerk errors

**Symptoms:**
- TypeScript errors about Clerk types
- Build fails at compile time

**Solutions:**
1. Install Clerk package: `npm install @clerk/nextjs`
2. Verify version compatibility with Next.js 15
3. Check imports: `from '@clerk/nextjs/server'` (not `/client` in server components)
4. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

---

## 11. Next Steps

After completing setup testing:

1. **Authentication Flow Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_AUTH_TESTING.md`
   - Test sign-up, sign-in, sign-out flows

2. **Webhook Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_WEBHOOK_TESTING.md`
   - Test user sync to Supabase

3. **Integration Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_INTEGRATION_TESTING.md`
   - End-to-end user journeys

4. **Security Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_SECURITY_TESTING.md`
   - Verify protection mechanisms

---

## Support Resources

- **Clerk Documentation:** https://clerk.com/docs
- **Next.js Integration:** https://clerk.com/docs/quickstarts/nextjs
- **Google OAuth Setup:** https://clerk.com/docs/authentication/social-connections/google
- **Webhooks Guide:** https://clerk.com/docs/integrations/webhooks
- **Troubleshooting:** `/Users/tannerosterkamp/vortis/docs/CLERK_TROUBLESHOOTING.md`
