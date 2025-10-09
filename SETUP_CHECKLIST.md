# Vortis Setup Checklist

Quick reference for setting up and testing Vortis authentication and payment systems.

## Environment Setup

### 1. Initial Setup
- [ ] Copy `.env.example` to `.env.local`
  ```bash
  cp .env.example .env.local
  ```

### 2. Supabase Configuration
- [ ] Create Supabase project at https://supabase.com/dashboard
- [ ] Copy Project URL to `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy Anon Key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Configure redirect URLs in Supabase:
  - Site URL: `http://localhost:3000`
  - Redirect: `http://localhost:3000/auth/callback`
- [ ] Run database schema (see `/docs/DATABASE_SCHEMA.md`)
- [ ] Configure email settings (enable/disable confirmations)

### 3. Stripe Configuration
- [ ] Create Stripe account (test mode)
- [ ] Copy Secret Key to `STRIPE_SECRET_KEY`
- [ ] Copy Publishable Key to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Create products OR run setup script:
  ```bash
  npx tsx scripts/setup-stripe-products.ts
  ```
- [ ] Copy Price IDs to:
  - `STRIPE_STARTER_PRICE_ID`
  - `STRIPE_PRO_PRICE_ID`
  - `STRIPE_ENTERPRISE_PRICE_ID`
- [ ] Setup webhook endpoint:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```
- [ ] Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. Application Configuration
- [ ] Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### 5. Validation
- [ ] Run environment validation:
  ```bash
  npx tsx scripts/check-env.ts --verbose
  ```
- [ ] Verify all checks pass

### 6. Start Development
- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Open browser: `http://localhost:3000`

---

## Authentication Testing

### Quick Test Flow
- [ ] Navigate to `/auth/signup`
- [ ] Create test account
- [ ] Check email for confirmation (if enabled)
- [ ] Log in at `/auth/login`
- [ ] Access `/dashboard` (should load)
- [ ] Log out
- [ ] Try accessing `/dashboard` again (should redirect to login)

### Full Test Suite
- [ ] Follow `/tests/integration/auth-flow.test.md`
- [ ] Execute Test Suites 1-5 minimum
- [ ] Document any failures

---

## Stripe Testing

### Quick Test Flow
- [ ] Log in as test user
- [ ] Navigate to `/pricing`
- [ ] Click "Start Trial" on any plan
- [ ] Complete checkout with test card: `4242 4242 4242 4242`
- [ ] Verify redirect to `/dashboard?success=true`
- [ ] Check webhook received (Stripe CLI output)
- [ ] Verify subscription in database

### Test Cards
- **Success:** `4242 4242 4242 4242`
- **Declined:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

### Full Test Suite
- [ ] Follow `/tests/integration/stripe-integration.test.md`
- [ ] Execute Test Suites 1-5 minimum
- [ ] Test webhook delivery
- [ ] Document any failures

---

## Pre-Production Checklist

### Environment
- [ ] All required variables set and validated
- [ ] No placeholder values remain
- [ ] Switch to live Stripe keys (production)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Update Supabase redirect URLs to production

### Security
- [ ] Environment variables in hosting platform (not in code)
- [ ] HTTPS enabled
- [ ] Stripe webhook endpoint publicly accessible
- [ ] RLS policies enabled in Supabase
- [ ] Email confirmations enabled (production)

### Testing
- [ ] All auth tests passing
- [ ] All Stripe tests passing
- [ ] Webhook delivery verified
- [ ] Payment processing tested
- [ ] Mobile responsive tests completed

### Monitoring
- [ ] Error tracking configured (Sentry recommended)
- [ ] Analytics configured (optional)
- [ ] Stripe Dashboard alerts set up
- [ ] Supabase monitoring configured

### Documentation
- [ ] Team onboarded on setup process
- [ ] Troubleshooting guide reviewed
- [ ] Test credentials documented (securely)

---

## Common Issues

**"Supabase credentials not configured"**
- Check `.env.local` exists
- Verify no placeholder values
- Restart dev server

**"Invalid Stripe API key"**
- Ensure using test keys (`sk_test_`, `pk_test_`)
- Verify keys copied completely
- Check no trailing spaces

**Webhook not received**
- Stripe CLI running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Webhook secret in `.env.local` matches CLI output
- Dev server running

**Payment succeeds but subscription not created**
- Check webhook delivery in Stripe Dashboard
- Check server logs for errors
- Verify database connection
- Ensure webhook secret correct

---

## Quick Commands Reference

```bash
# Validate environment
npx tsx scripts/check-env.ts

# Show setup guide
npx tsx scripts/check-env.ts --guide

# Start dev server
npm run dev

# Forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Setup Stripe products
npx tsx scripts/setup-stripe-products.ts

# Stripe CLI test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

---

## Documentation

- **Environment Setup:** `/docs/ENVIRONMENT_SETUP.md`
- **Auth Testing:** `/tests/integration/auth-flow.test.md`
- **Stripe Testing:** `/tests/integration/stripe-integration.test.md`
- **Full Report:** `/docs/TESTING_SETUP_REPORT.md`
- **Validation Script:** `/scripts/check-env.ts`

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Stripe Testing:** https://stripe.com/docs/testing
- **Next.js Docs:** https://nextjs.org/docs

---

Last Updated: 2025-10-09
