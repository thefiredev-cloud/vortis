# Vortis Environment Configuration Summary

**Date:** 2025-10-09
**Project:** /Users/tannerosterkamp/vortis
**Status:** Configuration In Progress (1/9 required variables set)

---

## Configuration Overview

### What's Been Done

1. **File Setup**
   - `.env.local` file exists (copied from `.env.example`)
   - `NEXT_PUBLIC_APP_URL` set to `http://localhost:3000` (correct for dev)

2. **Documentation Created**
   - `/docs/ENV_SETUP_INSTRUCTIONS.md` - Comprehensive setup guide
   - `/ENV_SETUP_STATUS.md` - Current status tracking
   - `/scripts/quick-setup.sh` - Interactive validation script
   - Updated `/docs/README.md` with environment setup reference

3. **Validation Tools Ready**
   - `/scripts/check-env.ts` - Full validation script
   - `/scripts/setup-stripe-products.ts` - Automated Stripe product creation
   - `/scripts/quick-setup.sh` - Quick status checker

---

## What Needs to be Configured

### PRIORITY 1: Supabase (Required for Auth & Database)

**Status:** WAITING FOR postgres-expert AGENT

```bash
# Get these from: https://supabase.com/dashboard > vortis project > Settings > API

NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[long-jwt-token]
```

**Validation:**
- URL starts with `https://` and ends with `.supabase.co`
- Anon key starts with `eyJ` (JWT format)
- Anon key is 300+ characters

**Action:** Wait for postgres-expert agent to provide these values, or manually retrieve from Supabase dashboard.

---

### PRIORITY 2: Stripe API Keys (Required for Payments)

**Status:** MANUAL SETUP REQUIRED

```bash
# Get these from: https://dashboard.stripe.com/apikeys (use Test Mode)

STRIPE_SECRET_KEY=sk_test_[your-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your-key]
```

**Steps:**
1. Visit https://dashboard.stripe.com/apikeys
2. Toggle to **Test mode** (top-right)
3. Copy **Publishable key** (`pk_test_...`)
4. Click **Reveal test key** for **Secret key** (`sk_test_...`)
5. Update both in `.env.local`

**Validation:**
- Both keys must be test keys (`sk_test_` and `pk_test_`)
- Or both must be live keys (never mix test and live)

---

### PRIORITY 3: Stripe Webhook Secret (Required for Payment Events)

**Status:** REQUIRES STRIPE CLI SETUP

```bash
# For local development:
STRIPE_WEBHOOK_SECRET=whsec_[from-cli]
```

**Steps for Local Development:**
1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhook events (keep this running):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the `whsec_...` secret displayed by the CLI

5. Update `STRIPE_WEBHOOK_SECRET` in `.env.local`

**Important:** Keep the Stripe CLI terminal window open while developing.

---

### PRIORITY 4: Stripe Price IDs (Required for Checkout)

**Status:** WAITING FOR stripe-setup AGENT OR MANUAL CREATION

```bash
STRIPE_STARTER_PRICE_ID=price_[starter-id]
STRIPE_PRO_PRICE_ID=price_[pro-id]
STRIPE_ENTERPRISE_PRICE_ID=price_[enterprise-id]
```

**Option A: Automated (RECOMMENDED)**
```bash
# After setting up Stripe API keys:
npx tsx scripts/setup-stripe-products.ts
```

This script will:
- Create 3 products in Stripe (Starter $29, Pro $99, Enterprise $299)
- Set up recurring monthly billing
- Output the price IDs to add to `.env.local`

**Option B: Manual**
1. Visit https://dashboard.stripe.com/products
2. Create each product with monthly recurring price
3. Copy the price IDs (start with `price_`)
4. Add to `.env.local`

**Validation:**
- All price IDs start with `price_`
- Use test mode price IDs for development

---

## Quick Commands

### Check Configuration Status
```bash
./scripts/quick-setup.sh
```

### Run Full Validation
```bash
npx tsx scripts/check-env.ts
```

### Create Stripe Products (after API keys are set)
```bash
npx tsx scripts/setup-stripe-products.ts
```

### Start Development Server (after all required vars are set)
```bash
npm run dev
```

---

## Configuration Workflow

```
Step 1: Supabase Credentials
    └─> Wait for postgres-expert agent
        OR manually from dashboard
        └─> Update NEXT_PUBLIC_SUPABASE_URL
        └─> Update NEXT_PUBLIC_SUPABASE_ANON_KEY

Step 2: Stripe API Keys
    └─> Visit https://dashboard.stripe.com/apikeys
        └─> Update STRIPE_SECRET_KEY
        └─> Update NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Step 3: Stripe Webhook
    └─> Install & run Stripe CLI
        └─> stripe listen --forward-to localhost:3000/api/stripe/webhook
        └─> Update STRIPE_WEBHOOK_SECRET

Step 4: Stripe Products
    └─> Run: npx tsx scripts/setup-stripe-products.ts
        OR create manually in dashboard
        └─> Update all price IDs

Step 5: Validate
    └─> Run: npx tsx scripts/check-env.ts
        └─> Should show all green ✓

Step 6: Start Development
    └─> Run: npm run dev
        └─> Test at http://localhost:3000
```

---

## Environment Variables Checklist

Required for basic functionality:

- [x] `NEXT_PUBLIC_APP_URL` - DONE
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - PENDING (postgres-expert agent)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - PENDING (postgres-expert agent)
- [ ] `STRIPE_SECRET_KEY` - TODO (manual setup)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - TODO (manual setup)
- [ ] `STRIPE_WEBHOOK_SECRET` - TODO (Stripe CLI setup)
- [ ] `STRIPE_STARTER_PRICE_ID` - PENDING (stripe-setup agent or script)
- [ ] `STRIPE_PRO_PRICE_ID` - PENDING (stripe-setup agent or script)
- [ ] `STRIPE_ENTERPRISE_PRICE_ID` - PENDING (stripe-setup agent or script)

**Progress:** 1/9 required variables (11% complete)

---

## Documentation Reference

All documentation is available at:

- **Complete Setup Guide:** `/Users/tannerosterkamp/vortis/docs/ENV_SETUP_INSTRUCTIONS.md`
- **Status Tracking:** `/Users/tannerosterkamp/vortis/ENV_SETUP_STATUS.md`
- **Quick Reference:** Run `./scripts/quick-setup.sh`
- **Docs Index:** `/Users/tannerosterkamp/vortis/docs/README.md`

---

## Expected Output After Full Configuration

When running `npx tsx scripts/check-env.ts`, you should see:

```
============================================================
Environment Validation Results
============================================================

✅ All required environment variables are properly configured!

============================================================
```

---

## Next Actions

### Immediate
1. **Wait for postgres-expert agent** to provide Supabase credentials
2. **Manually get Stripe API keys** from https://dashboard.stripe.com/apikeys

### After Getting Stripe Keys
3. **Set up Stripe webhook** with Stripe CLI
4. **Run automated product setup:** `npx tsx scripts/setup-stripe-products.ts`

### Final Steps
5. **Validate configuration:** `npx tsx scripts/check-env.ts`
6. **Start development:** `npm run dev`
7. **Test authentication** at http://localhost:3000
8. **Test payment flow** at http://localhost:3000/pricing

---

## Support Resources

- Detailed instructions: `/docs/ENV_SETUP_INSTRUCTIONS.md`
- Supabase docs: https://supabase.com/docs
- Stripe docs: https://stripe.com/docs
- Stripe CLI docs: https://stripe.com/docs/stripe-cli

---

**Configuration will be complete when all 9 required variables are set and validation passes.**
