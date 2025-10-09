# Vortis Environment Setup Instructions

Complete guide to configure your `.env.local` file for Vortis development.

## Quick Start Checklist

- [ ] Copy `.env.example` to `.env.local` (DONE)
- [ ] Configure Supabase credentials
- [ ] Configure Stripe API keys
- [ ] Create Stripe products and get price IDs
- [ ] Configure webhook endpoint
- [ ] Validate configuration
- [ ] Start development server

---

## 1. Application Configuration (COMPLETED)

**Status:** ✅ Already configured

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

This is set correctly for local development. For production, update to your production domain (e.g., `https://vortis.app`).

---

## 2. Supabase Configuration

**Status:** ⏳ WAITING FOR POSTGRES-EXPERT AGENT

The following credentials need to be obtained from your Supabase project:

### Steps to Get Supabase Credentials:

1. **Visit Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard
   - Select your "vortis" project

2. **Get API Credentials:**
   - Go to **Settings** > **API**
   - Copy the following values:

```bash
# Project URL (under "Project URL")
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co

# Anon/Public Key (under "Project API keys")
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (long JWT token starting with eyJ)
```

### What to Update in `.env.local`:

Replace these placeholder lines:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

With your actual credentials from the dashboard.

### Validation:
- URL should start with `https://` and end with `.supabase.co`
- Anon key should start with `eyJ` (JWT format)
- Anon key should be 300+ characters long

---

## 3. Stripe API Keys Configuration

**Status:** ⚠️ REQUIRED - Manual setup needed

### Steps to Get Stripe API Keys:

1. **Visit Stripe Dashboard:**
   - Navigate to: https://dashboard.stripe.com/apikeys
   - Make sure you're in **Test Mode** (toggle in top-right)

2. **Get API Keys:**
   - Copy **Publishable key** (starts with `pk_test_`)
   - Click **Reveal test key** for **Secret key** (starts with `sk_test_`)

```bash
# Update these in .env.local:
STRIPE_SECRET_KEY=sk_test_[your_key_here]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your_key_here]
```

### Important Notes:
- Always use **test keys** (`sk_test_` and `pk_test_`) for development
- Never commit these keys to version control
- Both keys must be from the same mode (test/live)

---

## 4. Stripe Webhook Configuration

**Status:** ⚠️ REQUIRED - Set up after Stripe keys

### Option A: Local Development with Stripe CLI (RECOMMENDED)

1. **Install Stripe CLI:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward Webhook Events:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy Webhook Secret:**
   - The CLI will display: `whsec_...`
   - Update in `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_[secret_from_cli]
   ```

5. **Keep CLI Running:**
   - Leave the terminal window open while developing
   - Restart if you restart your Next.js server

### Option B: Production Webhook Setup

1. **Visit Stripe Dashboard:**
   - Navigate to: https://dashboard.stripe.com/webhooks

2. **Add Endpoint:**
   - Click **Add endpoint**
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Get Webhook Secret:**
   - After creating, click on the endpoint
   - Click **Reveal** under **Signing secret**
   - Copy the `whsec_...` value

---

## 5. Stripe Price IDs Configuration

**Status:** ⏳ WAITING FOR STRIPE SETUP AGENT

Stripe Price IDs identify the pricing plans in your Stripe account. You have two options:

### Option A: Automated Setup (RECOMMENDED)

Use the stripe-setup agent to automatically create products:

```bash
# This will be run by the stripe-setup agent
npx tsx scripts/setup-stripe-products.ts
```

The script will:
- Create 3 products in Stripe (Starter, Pro, Enterprise)
- Set up recurring monthly pricing
- Output the price IDs to add to `.env.local`

### Option B: Manual Setup via Stripe Dashboard

1. **Visit Stripe Products:**
   - Navigate to: https://dashboard.stripe.com/products

2. **Create Starter Plan ($29/month):**
   - Click **Add product**
   - Name: `Vortis Starter`
   - Description: `Essential stock analysis for individual investors`
   - Pricing: Recurring, Monthly, $29.00 USD
   - Click **Save product**
   - Copy the **Price ID** (starts with `price_`)

3. **Create Pro Plan ($99/month):**
   - Repeat with:
   - Name: `Vortis Pro`
   - Description: `Advanced analysis and unlimited insights`
   - Pricing: $99.00 USD monthly

4. **Create Enterprise Plan ($299/month):**
   - Name: `Vortis Enterprise`
   - Description: `Full platform access with priority support`
   - Pricing: $299.00 USD monthly

5. **Update `.env.local`:**
```bash
STRIPE_STARTER_PRICE_ID=price_[starter_id]
STRIPE_PRO_PRICE_ID=price_[pro_id]
STRIPE_ENTERPRISE_PRICE_ID=price_[enterprise_id]
```

### Validation:
- All price IDs should start with `price_`
- Use test mode price IDs for development
- Verify pricing matches your application (see `/src/components/Pricing.tsx`)

---

## 6. Optional: External Stock Data APIs

**Status:** ℹ️ OPTIONAL - Enhance stock analysis features

If you want real-time stock data, configure one or more providers:

### Alpha Vantage (Free Tier Available)

1. Visit: https://www.alphavantage.co/support/#api-key
2. Sign up for a free API key
3. Add to `.env.local`:
```bash
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

### Financial Modeling Prep

1. Visit: https://financialmodelingprep.com/developer/docs/
2. Sign up and get API key
3. Add to `.env.local`:
```bash
FMP_API_KEY=your_api_key_here
```

### Polygon.io

1. Visit: https://polygon.io/
2. Sign up for free tier
3. Add to `.env.local`:
```bash
POLYGON_API_KEY=your_api_key_here
```

---

## 7. Optional: Email Configuration

**Status:** ℹ️ OPTIONAL - Supabase handles emails by default

Only needed if you want custom transactional emails:

### Resend.com (Recommended)

1. Visit: https://resend.com/
2. Sign up and create API key
3. Add to `.env.local`:
```bash
RESEND_API_KEY=re_your_api_key
```

---

## 8. Optional: Monitoring & Analytics

**Status:** ℹ️ OPTIONAL - Add after initial setup

### Sentry (Error Tracking)

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### Google Analytics

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### PostHog (Product Analytics)

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Validation

### Run Environment Check

After configuring your variables, validate the setup:

```bash
npx tsx scripts/check-env.ts
```

### Verbose Output

For detailed validation information:

```bash
npx tsx scripts/check-env.ts --verbose
```

### Show Setup Guide

Display quick reference guide:

```bash
npx tsx scripts/check-env.ts --guide
```

### Expected Output (Success)

```
============================================================
Environment Validation Results
============================================================

✅ All required environment variables are properly configured!

============================================================
```

---

## Common Issues & Solutions

### Issue: "NEXT_PUBLIC_SUPABASE_URL contains placeholder value"

**Solution:** You haven't updated the Supabase credentials yet. Follow section 2 to get real values.

### Issue: "Stripe keys mismatch: secret and publishable keys must both be test or both be live"

**Solution:** Make sure both keys are from the same environment:
- Development: Use `sk_test_` and `pk_test_`
- Production: Use `sk_live_` and `pk_live_`

### Issue: Webhook secret not working

**Solution:**
- For local development: Make sure Stripe CLI is running
- For production: Verify webhook endpoint is accessible
- Restart your Next.js server after updating

### Issue: Environment variables not loading

**Solution:**
1. Ensure file is named `.env.local` (not `.env.local.txt`)
2. File must be in project root directory
3. Restart Next.js dev server: `npm run dev`
4. For server variables, they load only on server restart

---

## Security Checklist

- [ ] `.env.local` is listed in `.gitignore`
- [ ] Never commit API keys to version control
- [ ] Use test keys for development
- [ ] Rotate keys if accidentally exposed
- [ ] Use different keys for staging/production
- [ ] Enable webhook signature verification
- [ ] Set up proper CORS policies in Supabase

---

## Next Steps

After completing environment setup:

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Authentication:**
   - Navigate to http://localhost:3000
   - Try signing up with email
   - Verify Supabase connection

3. **Test Stripe Integration:**
   - Go to pricing page
   - Click "Choose Plan"
   - Complete test payment (use card: 4242 4242 4242 4242)
   - Verify webhook events in Stripe CLI

4. **Run Full Test Suite:**
   ```bash
   npm test
   ```

---

## Configuration Summary

Required variables for basic functionality:

```bash
# Supabase (Authentication & Database)
NEXT_PUBLIC_SUPABASE_URL=           [WAITING: postgres-expert agent]
NEXT_PUBLIC_SUPABASE_ANON_KEY=      [WAITING: postgres-expert agent]

# Stripe (Payments)
STRIPE_SECRET_KEY=                  [TODO: Get from Stripe dashboard]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= [TODO: Get from Stripe dashboard]
STRIPE_WEBHOOK_SECRET=              [TODO: Get from Stripe CLI]

# Stripe Price IDs (Products)
STRIPE_STARTER_PRICE_ID=            [WAITING: stripe-setup agent]
STRIPE_PRO_PRICE_ID=                [WAITING: stripe-setup agent]
STRIPE_ENTERPRISE_PRICE_ID=         [WAITING: stripe-setup agent]

# Application
NEXT_PUBLIC_APP_URL=                [DONE: http://localhost:3000]
```

---

## Support

If you encounter issues:

1. Check this guide for common solutions
2. Run `npx tsx scripts/check-env.ts --verbose` for details
3. Verify all services (Supabase, Stripe) are accessible
4. Check Next.js server logs for errors

---

**Last Updated:** 2025-10-09
**Vortis Version:** 1.0.0
