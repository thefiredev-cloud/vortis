# Vortis Environment Setup Guide

Complete step-by-step guide for configuring environment variables and preparing Vortis for development and production.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Required Services](#required-services)
3. [Environment Variables](#environment-variables)
4. [Validation](#validation)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local with your credentials
# See sections below for obtaining each value

# 3. Validate configuration
npx tsx scripts/check-env.ts

# 4. Start development server
npm run dev
```

---

## Required Services

### 1. Supabase (Authentication & Database)

**Purpose:** User authentication, database storage, row-level security

**Setup Steps:**

1. **Create Supabase Project**
   - Visit: https://supabase.com/dashboard
   - Click "New Project"
   - Choose organization
   - Set project name: `vortis-dev` (or your preference)
   - Set database password (save securely)
   - Choose region (closest to your users)
   - Click "Create new project"

2. **Get API Credentials**
   - Wait for project to finish setup (~2 minutes)
   - Navigate to: Settings > API
   - Copy values:
     - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
     - **anon/public key**: Long JWT starting with `eyJ...`

3. **Configure Authentication**
   - Navigate to: Authentication > Settings
   - **Site URL**: `http://localhost:3000` (dev) or your production URL
   - **Redirect URLs**: Add:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback` (production)
   - **Email Templates**: Customize (optional)
   - **Email Confirmations**:
     - Enable for production
     - Can disable for faster dev testing

4. **Database Schema**
   - Navigate to: SQL Editor
   - Run schema migrations if provided
   - Or create tables manually:

```sql
-- Example subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');
```

5. **Add to .env.local**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. Stripe (Payments & Subscriptions)

**Purpose:** Payment processing, subscription management, customer portal

**Setup Steps:**

1. **Create Stripe Account**
   - Visit: https://dashboard.stripe.com/register
   - Complete registration
   - Verify email
   - **Stay in Test Mode** (toggle in top-right corner)

2. **Get API Keys**
   - Navigate to: Developers > API keys
   - Copy keys (TEST keys for development):
     - **Secret key**: `sk_test_...`
     - **Publishable key**: `pk_test_...`
   - **IMPORTANT**: Never commit these keys to Git

3. **Create Products & Prices**

   **Option A: Use Setup Script (Recommended)**
   ```bash
   # After adding Stripe keys to .env.local
   npx tsx scripts/setup-stripe-products.ts
   ```

   **Option B: Manual Setup**
   - Navigate to: Products > Add Product
   - Create three products:

   | Product | Price | Billing |
   |---------|-------|---------|
   | Starter | $29 | Monthly recurring |
   | Pro | $99 | Monthly recurring |
   | Enterprise | $299 | Monthly recurring |

   - For each product, copy the **Price ID** (starts with `price_...`)

4. **Setup Webhook Endpoint**

   **For Local Development:**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe  # macOS
   # OR download from: https://stripe.com/docs/stripe-cli

   # Login to Stripe
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/stripe/webhook

   # This will output a webhook signing secret: whsec_...
   # Copy this to your .env.local
   ```

   **For Production:**
   - Navigate to: Developers > Webhooks
   - Click "Add endpoint"
   - Enter URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click "Add endpoint"
   - Copy **Signing secret**: `whsec_...`

5. **Add to .env.local**:
```bash
# API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (from products created above)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

---

### 3. Application Configuration

**Setup Steps:**

1. **Set Application URL**
   - Development: `http://localhost:3000`
   - Production: Your actual domain `https://yourdomain.com`

2. **Add to .env.local**:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Environment Variables

### Complete .env.local Template

```bash
# =====================================================
# SUPABASE CONFIGURATION
# =====================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =====================================================
# STRIPE CONFIGURATION
# =====================================================
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# =====================================================
# APPLICATION CONFIGURATION
# =====================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Variables

**Stock Data APIs** (at least one recommended for full functionality):

```bash
# Alpha Vantage
ALPHA_VANTAGE_API_KEY=your_api_key
# Get at: https://www.alphavantage.co/support/#api-key

# Financial Modeling Prep
FMP_API_KEY=your_api_key
# Get at: https://site.financialmodelingprep.com/developer/docs

# Polygon.io
POLYGON_API_KEY=your_api_key
# Get at: https://polygon.io/dashboard/api-keys
```

**Email Provider** (optional - Supabase handles emails by default):

```bash
# Resend.com
RESEND_API_KEY=re_...
# Get at: https://resend.com/api-keys
```

**Monitoring & Analytics** (optional but recommended for production):

```bash
# Sentry (error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
# Get at: https://sentry.io/settings/

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# Get at: https://analytics.google.com/

# PostHog (product analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
# Get at: https://posthog.com/settings/project
```

---

## Validation

### Automated Validation

Run the environment validation script:

```bash
# Basic validation
npx tsx scripts/check-env.ts

# Verbose output (shows all checks)
npx tsx scripts/check-env.ts --verbose

# Show setup guide
npx tsx scripts/check-env.ts --guide
```

**Expected Output:**
```
🔍 Validating environment variables...

============================================================
Environment Validation Results
============================================================

✅ All required environment variables are properly configured!

============================================================
```

**If validation fails:**
- Review error messages
- Check for typos in variable names
- Ensure no placeholder values remain
- Verify credentials are correct
- Run with `--guide` flag for help

### Manual Validation

**1. Test Supabase Connection**

```bash
# Using curl
curl -X GET "https://YOUR-PROJECT.supabase.co/rest/v1/" \
  -H "apikey: YOUR-ANON-KEY"

# Expected: JSON response (not 401 Unauthorized)
```

**2. Test Stripe Keys**

Visit Stripe Dashboard and verify:
- Test mode is enabled
- Keys are visible in Developers > API keys
- Products exist in Products section

**3. Test Application**

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:3000
# Click through app:
# - Home page loads
# - Navigate to /auth/signup
# - Navigate to /pricing
# - No console errors
```

---

## Troubleshooting

### Common Issues

#### Issue: "Supabase credentials not configured"

**Cause:** Environment variables not loaded or have placeholder values

**Solution:**
1. Verify `.env.local` exists in project root
2. Check variables don't contain `your_supabase_url` or similar placeholders
3. Restart dev server after changing `.env.local`
4. Run validation script: `npx tsx scripts/check-env.ts`

---

#### Issue: "Invalid Stripe API key"

**Cause:** Wrong key type or expired key

**Solution:**
1. Verify you're using **test** keys (`sk_test_...`, `pk_test_...`)
2. Ensure keys are copied completely (no truncation)
3. Check Stripe Dashboard > Developers > API keys
4. Generate new keys if needed

---

#### Issue: Webhook not receiving events

**Cause:** Webhook endpoint not configured or signing secret wrong

**Solution:**

**For Local Development:**
```bash
# Must run Stripe CLI forward command
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the signing secret it outputs to .env.local
```

**For Production:**
1. Verify webhook endpoint created in Stripe Dashboard
2. Check endpoint URL is correct and publicly accessible
3. Verify signing secret matches `.env.local`
4. Check webhook delivery attempts in Dashboard > Webhooks

---

#### Issue: "Invalid login credentials" for new user

**Cause:** Email confirmation required but not completed

**Solution:**
1. Check Supabase > Authentication > Settings
2. If email confirmations enabled:
   - Check spam folder for confirmation email
   - Or disable confirmations for testing:
     - Supabase Dashboard > Authentication > Settings
     - Uncheck "Enable email confirmations"
3. Verify email provider not blocking Supabase emails

---

#### Issue: Environment variables not loading

**Cause:** File not named correctly or not in right location

**Solution:**
1. Verify filename is exactly `.env.local` (note the leading dot)
2. File must be in project root (same directory as `package.json`)
3. Restart Next.js dev server after creating/modifying
4. Check file isn't `.env.local.txt` or similar
5. Verify file permissions (should be readable)

---

#### Issue: "Price ID not found" error

**Cause:** Price IDs don't match Stripe products

**Solution:**
1. Navigate to Stripe Dashboard > Products
2. Click on each product
3. Copy the Price ID (starts with `price_...`)
4. Update `.env.local` with correct IDs
5. Verify IDs don't have trailing spaces or quotes

---

### Verification Checklist

Before running tests or deploying, verify:

- [x] `.env.local` file exists in project root
- [x] All required variables set (no placeholders)
- [x] Supabase project created and accessible
- [x] Supabase redirect URLs configured
- [x] Stripe test mode enabled
- [x] Stripe products created with correct prices
- [x] Stripe webhook endpoint configured
- [x] Validation script passes: `npx tsx scripts/check-env.ts`
- [x] Dev server starts without errors: `npm run dev`
- [x] Can access home page: `http://localhost:3000`
- [x] Can navigate to signup: `http://localhost:3000/auth/signup`
- [x] No console errors in browser dev tools

---

## Security Best Practices

### Development

1. **Never commit `.env.local` to Git**
   - Already in `.gitignore`
   - Double-check before committing

2. **Use test keys in development**
   - Always use `sk_test_...` and `pk_test_...`
   - Never use production keys locally

3. **Keep credentials secure**
   - Don't share keys in Slack, email, etc.
   - Use environment variables, not hardcoded values
   - Rotate keys if accidentally exposed

### Production

1. **Use environment variables in hosting platform**
   - Vercel: Settings > Environment Variables
   - Railway: Variables tab
   - Netlify: Site settings > Build & deploy > Environment

2. **Switch to live Stripe keys**
   - Use `sk_live_...` and `pk_live_...`
   - Update webhook endpoint to production URL

3. **Enable HTTPS**
   - Required for production
   - Stripe requires HTTPS for live webhooks

4. **Set up monitoring**
   - Add Sentry DSN for error tracking
   - Configure analytics (Google Analytics, PostHog)
   - Monitor Stripe Dashboard for failed payments

5. **Review Stripe settings**
   - Enable customer emails
   - Set up invoice branding
   - Configure retry logic for failed payments
   - Review dispute settings

---

## Next Steps

After completing environment setup:

1. **Run validation**: `npx tsx scripts/check-env.ts`
2. **Start dev server**: `npm run dev`
3. **Run integration tests**: See `/tests/integration/auth-flow.test.md`
4. **Test Stripe integration**: See `/tests/integration/stripe-integration.test.md`
5. **Deploy to staging**: Test with production-like environment
6. **Deploy to production**: Switch to live keys and deploy

---

## Support

### Documentation
- Vortis Auth Tests: `/tests/integration/auth-flow.test.md`
- Stripe Tests: `/tests/integration/stripe-integration.test.md`
- Validation Script: `/scripts/check-env.ts`

### External Resources
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs
- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables

### Getting Help
- Run validation with guide: `npx tsx scripts/check-env.ts --guide`
- Check validation verbose output: `npx tsx scripts/check-env.ts --verbose`
- Review error messages in console
- Check service status pages:
  - Supabase: https://status.supabase.com/
  - Stripe: https://status.stripe.com/

---

## Appendix: Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJ...` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (server-side) | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (client-side) | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret | `whsec_...` |
| `STRIPE_STARTER_PRICE_ID` | Yes | Starter plan price ID | `price_...` |
| `STRIPE_PRO_PRICE_ID` | Yes | Pro plan price ID | `price_...` |
| `STRIPE_ENTERPRISE_PRICE_ID` | Yes | Enterprise plan price ID | `price_...` |
| `NEXT_PUBLIC_APP_URL` | Yes | Application base URL | `http://localhost:3000` |
| `ALPHA_VANTAGE_API_KEY` | No | Alpha Vantage API key | `ABC123...` |
| `FMP_API_KEY` | No | Financial Modeling Prep key | `abc123...` |
| `POLYGON_API_KEY` | No | Polygon.io API key | `abc123...` |
| `RESEND_API_KEY` | No | Resend.com API key | `re_...` |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry error tracking DSN | `https://...@sentry.io/...` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog analytics key | `phc_...` |

---

End of Environment Setup Guide
