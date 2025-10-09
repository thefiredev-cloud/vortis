# Environment Variables Guide

Complete reference for all environment variables in Vortis.

## Quick Start

1. Copy `.env.local.example` to `.env.local` (if exists)
2. Or copy the template below
3. Fill in your actual values
4. Never commit `.env.local` to git (already in `.gitignore`)

## Environment Variables Template

```bash
# =====================================================
# CLERK AUTHENTICATION (REQUIRED)
# =====================================================

# Get from: https://dashboard.clerk.com > Configure > API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Get from: https://dashboard.clerk.com > Webhooks > [Endpoint] > Signing Secret
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# =====================================================
# SUPABASE DATABASE (REQUIRED)
# =====================================================

# Get from: https://supabase.com/dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx

# Service Role Key (for webhooks only - keep secure!)
# Get from: https://supabase.com/dashboard > Project Settings > API > service_role
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx

# =====================================================
# STRIPE PAYMENTS (OPTIONAL - for subscriptions)
# =====================================================

# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Product Price IDs (create in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx

# =====================================================
# APPLICATION CONFIGURATION
# =====================================================

# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production (update when deploying)
# NEXT_PUBLIC_APP_URL=https://your-domain.com

# =====================================================
# OPTIONAL: EXTERNAL APIS
# =====================================================

# Stock market data providers (uncomment if using)
# ALPHA_VANTAGE_API_KEY=xxxxxxxxxxxxx
# FMP_API_KEY=xxxxxxxxxxxxx
# POLYGON_API_KEY=xxxxxxxxxxxxx

# =====================================================
# OPTIONAL: MONITORING & ANALYTICS
# =====================================================

# Error tracking
# NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxxxxxxxxx

# Analytics
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXXXXX
# NEXT_PUBLIC_POSTHOG_KEY=xxxxxxxxxxxxx
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Detailed Variable Descriptions

### Clerk Authentication

#### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Required:** Yes
**Visibility:** Public (client-side)
**Format:** `pk_test_xxxxx` (test) or `pk_live_xxxxx` (production)

**Description:**
Clerk's publishable API key. Used in client-side code for authentication flows.

**Where to Get:**
1. Go to https://dashboard.clerk.com
2. Select your application
3. Navigate to: Configure > API Keys
4. Copy the "Publishable key"

**Example:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsudm9ydGlzLmFpJA
```

#### `CLERK_SECRET_KEY`

**Required:** Yes
**Visibility:** Private (server-side only)
**Format:** `sk_test_xxxxx` (test) or `sk_live_xxxxx` (production)

**Description:**
Clerk's secret API key. Used in server-side code for secure operations. Never expose this in client-side code.

**Where to Get:**
1. Same location as publishable key
2. Click "Show" next to "Secret key"
3. Copy the value

**Example:**
```
CLERK_SECRET_KEY=sk_test_1234567890abcdefghijklmnopqrstuvwxyz
```

**Security Note:**
- Never commit this to version control
- Never use in client-side code
- Rotate immediately if exposed

#### `CLERK_WEBHOOK_SECRET`

**Required:** Yes (for user sync)
**Visibility:** Private (server-side only)
**Format:** `whsec_xxxxx`

**Description:**
Used to verify webhook requests from Clerk are authentic. Critical for security.

**Where to Get:**
1. Go to Clerk Dashboard > Configure > Webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to: `user.created`, `user.updated`, `user.deleted`
5. Save endpoint
6. Copy the "Signing Secret"

**Example:**
```
CLERK_WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz1234567890
```

**Development Setup:**
For local testing, use ngrok:
```bash
# Start ngrok
ngrok http 3000

# Use ngrok URL in Clerk webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/clerk
```

### Supabase Database

#### `NEXT_PUBLIC_SUPABASE_URL`

**Required:** Yes
**Visibility:** Public (client-side)
**Format:** `https://xxxxx.supabase.co`

**Description:**
Your Supabase project URL. Used for database connections.

**Where to Get:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to: Project Settings > API
4. Copy "Project URL"

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://bgywvwxqrijncqgdwsle.supabase.co
```

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Required:** Yes
**Visibility:** Public (client-side)
**Format:** JWT token (long string)

**Description:**
Supabase anonymous key for database access. Safe to expose in client-side code (protected by RLS policies).

**Where to Get:**
1. Same location as project URL
2. Copy "anon" key (not service_role!)

**Example:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneXd2d3hxcmlqbmNxZ2R3c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNzAwOTcsImV4cCI6MjA3NDc0NjA5N30.rHVYlU-H83oR9l1ryju7pKq7JiyA_fBv_MDZFJR6_mk
```

#### `SUPABASE_SERVICE_ROLE_KEY`

**Required:** Yes (for webhooks)
**Visibility:** Private (server-side only)
**Format:** JWT token (long string)

**Description:**
Supabase service role key with full database access. Bypasses RLS policies. Use ONLY in secure server-side contexts (webhooks, API routes).

**Where to Get:**
1. Project Settings > API
2. Copy "service_role" key
3. **WARNING:** This key has full database access!

**Example:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx
```

**Security Warning:**
- Bypasses ALL RLS policies
- Has full database access (read, write, delete)
- Never use in client-side code
- Never commit to version control
- Rotate immediately if exposed

**Use Cases:**
- Clerk webhook (creating/updating user profiles)
- Admin API routes
- Scheduled background jobs
- Database migrations

### Stripe Payments

#### `STRIPE_SECRET_KEY`

**Required:** Optional (for payments)
**Visibility:** Private (server-side only)
**Format:** `sk_test_xxxxx` or `sk_live_xxxxx`

**Description:**
Stripe API secret key for processing payments.

**Where to Get:**
1. Go to https://dashboard.stripe.com/apikeys
2. Copy "Secret key"

**Example:**
```
STRIPE_SECRET_KEY=sk_test_51234567890abcdefghijklmnopqrstuvwxyz
```

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Required:** Optional (for payments)
**Visibility:** Public (client-side)
**Format:** `pk_test_xxxxx` or `pk_live_xxxxx`

**Description:**
Stripe publishable key for client-side payment forms.

**Example:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnopqrstuvwxyz
```

#### `STRIPE_WEBHOOK_SECRET`

**Required:** Optional (for payment events)
**Visibility:** Private (server-side only)
**Format:** `whsec_xxxxx`

**Description:**
Stripe webhook signing secret for verifying webhook authenticity.

**Where to Get:**
1. Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Copy signing secret

**Example:**
```
STRIPE_WEBHOOK_SECRET=whsec_abcdefghijklmnopqrstuvwxyz1234567890
```

#### Price IDs

**Required:** Optional (for subscription plans)
**Visibility:** Private (server-side only)
**Format:** `price_xxxxx`

**Description:**
Stripe price IDs for different subscription tiers.

**Where to Get:**
1. Stripe Dashboard > Products
2. Create product: "Vortis Starter", "Vortis Pro", etc.
3. Add recurring price
4. Copy price ID

**Example:**
```
STRIPE_STARTER_PRICE_ID=price_1234567890abcdefghij
STRIPE_PRO_PRICE_ID=price_0987654321zyxwvutsrq
STRIPE_ENTERPRISE_PRICE_ID=price_abcd1234efgh5678ijkl
```

### Application Configuration

#### `NEXT_PUBLIC_APP_URL`

**Required:** Yes
**Visibility:** Public (client-side)
**Format:** URL (with protocol)

**Description:**
Base URL of your application. Used for redirects and webhooks.

**Examples:**
```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://vortis.ai

# Staging
NEXT_PUBLIC_APP_URL=https://staging.vortis.ai
```

## Environment-Specific Configurations

### Development (`.env.local`)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- Use test mode keys (pk_test_, sk_test_)
- Use localhost URLs
- Enable debug logging
- Use ngrok for webhooks

### Staging (`.env.staging` or hosting platform)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_APP_URL=https://staging.vortis.ai
```

- Can use test mode keys
- Use staging domain URLs
- Enable detailed logging
- Test webhooks with real endpoints

### Production (Hosting platform only)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_APP_URL=https://vortis.ai
```

- Use live mode keys (pk_live_, sk_live_)
- Use production domain URLs
- Enable error tracking (Sentry)
- Configure monitoring

## Security Best Practices

### What to Keep Secret

**NEVER expose in client-side code:**
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Any API keys without `NEXT_PUBLIC_` prefix

**Safe to expose (but still don't commit):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`

### Rotation Schedule

**Immediate rotation if:**
- Key exposed in version control
- Key exposed in client-side code
- Suspected security breach
- Team member leaves with access

**Regular rotation:**
- Every 90 days: All secret keys
- Every 30 days: Webhook secrets
- After major security updates

### Verification Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in git history
- [ ] Secrets not in client-side bundles
- [ ] Different keys for dev/staging/production
- [ ] Team members have individual access
- [ ] Secrets stored in secure password manager
- [ ] Production secrets only on hosting platform
- [ ] Webhook secrets verified on both ends

## Troubleshooting

### "Missing environment variable" Error

**Symptom:** Application won't start or shows error

**Solution:**
1. Check `.env.local` exists
2. Verify variable names match exactly (case-sensitive)
3. Restart development server after changes
4. Clear Next.js cache: `rm -rf .next`

### Webhook Signature Verification Failed

**Symptom:** Webhook returns 400 error

**Solution:**
1. Verify `CLERK_WEBHOOK_SECRET` is correct
2. Check webhook URL in Clerk Dashboard matches your endpoint
3. Ensure secret starts with `whsec_`
4. Try regenerating webhook secret

### Database Connection Failed

**Symptom:** Cannot connect to Supabase

**Solution:**
1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Test connection in Supabase dashboard
4. Check project is not paused (free tier)

### Authentication Not Working

**Symptom:** Cannot sign in or redirects fail

**Solution:**
1. Verify both Clerk keys are set
2. Check keys match your Clerk application
3. Ensure using correct environment (test vs live)
4. Clear browser cookies and try again

## Need Help?

- Check application logs
- Review Clerk Dashboard logs
- Check Supabase logs
- Verify all variables are set correctly
- Try with fresh `.env.local` file
- Contact support with specific error messages
