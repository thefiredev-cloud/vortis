# Stripe Setup - Complete Summary

Quick reference guide for Vortis Stripe integration setup and deployment.

## What's Been Prepared

### 1. Setup Script
**Location**: `/Users/tannerosterkamp/vortis/scripts/setup-stripe-products.ts`

Automated script that creates all three subscription products in Stripe:
- Vortis Starter ($29/month)
- Vortis Pro ($99/month)
- Vortis Enterprise ($299/month)

### 2. Documentation

**Main Guide**: `/docs/STRIPE_PRODUCT_SETUP.md` (19 KB)
- Comprehensive setup instructions
- Automated and manual setup options
- Webhook configuration
- Testing procedures
- Troubleshooting guide

**Quick Start**: `/docs/STRIPE_QUICK_START.md` (3.2 KB)
- 5-minute setup guide
- Essential commands only
- For developers who know Stripe

**Testing Checklist**: `/docs/STRIPE_TESTING_CHECKLIST.md` (14 KB)
- Complete testing procedure
- 10 testing phases
- Edge cases and security tests
- Sign-off checklist

**Existing Guide**: `/docs/stripe-setup-guide.md` (16 KB)
- Original comprehensive guide
- UI integration examples
- Customer Portal setup

---

## Quick Setup (5 Minutes)

### Prerequisites
- Stripe account created
- Terminal open at project root

### Commands

```bash
# 1. Get Stripe test key from dashboard
# https://dashboard.stripe.com > Developers > API keys

# 2. Set the key
export STRIPE_SECRET_KEY=sk_test_your_key_here

# 3. Run setup script
npx tsx scripts/setup-stripe-products.ts

# 4. Copy output price IDs to .env.local
# STRIPE_STARTER_PRICE_ID=price_xxx
# STRIPE_PRO_PRICE_ID=price_xxx
# STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# 5. Setup webhooks for local development
brew install stripe/stripe-cli/stripe  # macOS
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 6. Copy webhook secret to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_xxx

# 7. Start development
npm run dev
```

---

## Products Created

### Starter Plan
- **Price**: $29/month
- **Target**: Beginners
- **Limits**: 100 analyses/month
- **Features**:
  - 100 stock analyses per month
  - Basic market insights
  - Email support
  - Daily market updates

### Pro Plan
- **Price**: $99/month
- **Target**: Serious traders
- **Limits**: Unlimited analyses
- **Features**:
  - Unlimited analyses
  - Advanced trading signals
  - Real-time data feeds
  - Priority processing
  - Portfolio optimization
  - Priority support (24/7)

### Enterprise Plan
- **Price**: $299/month
- **Target**: Institutions
- **Limits**: Unlimited + API access
- **Features**:
  - Everything in Pro
  - Custom AI models
  - API access
  - White-label options
  - Dedicated support team
  - Custom integrations

---

## Environment Variables Needed

### Required for Development

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (from setup script)
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Required for Production

Same as above, but with live Stripe keys:
- `STRIPE_SECRET_KEY=sk_live_xxx`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`
- `STRIPE_WEBHOOK_SECRET=whsec_xxx` (from production webhook)
- `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
- Live price IDs from live mode products

---

## Testing

### Quick Test Flow

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Browser:
# 1. Visit: http://localhost:3000/pricing
# 2. Click "Get Started" on any plan
# 3. Sign in
# 4. Use test card: 4242 4242 4242 4242
# 5. Complete checkout
# 6. Verify redirect and subscription created
```

### Test Cards

| Card Number         | Purpose                  | Result                        |
|---------------------|--------------------------|-------------------------------|
| 4242 4242 4242 4242 | Successful payment       | Payment succeeds              |
| 4000 0025 0000 3155 | 3D Secure required       | Authentication modal appears  |
| 4000 0000 0000 9995 | Declined payment         | Payment fails with error      |

**For all cards:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Verification

After successful test checkout:

**Check Stripe Dashboard:**
- Products > View customers
- Should see test customer with active subscription

**Check Database:**
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
SELECT * FROM usage_tracking ORDER BY created_at DESC LIMIT 1;
```

**Check Webhook Logs:**
- Stripe CLI terminal should show events received
- Dev server logs should show webhook processing

---

## Deployment to Production

### Step 1: Create Live Products

```bash
# Get live secret key from Stripe Dashboard (Live mode)
export STRIPE_SECRET_KEY=sk_live_your_live_key

# Run setup script in live mode
npx tsx scripts/setup-stripe-products.ts
```

### Step 2: Configure Production Webhook

1. Stripe Dashboard > Developers > Webhooks
2. Switch to Live mode
3. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook secret

### Step 3: Update Production Environment

In your hosting provider (Vercel/Railway/Netlify):

```bash
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 4: Test Production

1. Make small test purchase in live mode
2. Verify webhook delivery in Stripe Dashboard
3. Check database records created
4. Test Customer Portal
5. Test subscription cancellation
6. Monitor for 24 hours

---

## Troubleshooting Quick Reference

### Script Won't Run

```bash
# Check Node.js version (needs 22+)
node --version

# Install dependencies
npm install

# Verify tsx is installed
npx tsx --version

# Set Stripe key and retry
export STRIPE_SECRET_KEY=sk_test_xxx
npx tsx scripts/setup-stripe-products.ts
```

### Webhooks Not Working

```bash
# Verify Stripe CLI is running
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Check webhook secret matches .env.local
cat .env.local | grep STRIPE_WEBHOOK_SECRET

# Restart both dev server and Stripe CLI
```

### Checkout Fails

```bash
# Verify price IDs are set
cat .env.local | grep STRIPE_.*_PRICE_ID

# Check all are set and start with "price_"
# Restart dev server after changing .env.local
npm run dev
```

### Database Not Updating

```bash
# Verify Supabase credentials
cat .env.local | grep SUPABASE

# Check webhook events in Stripe CLI
# Look for errors in dev server terminal
# Verify database connection in Supabase dashboard
```

---

## File Locations

### Scripts
- `/scripts/setup-stripe-products.ts` - Product creation script

### Documentation
- `/docs/STRIPE_PRODUCT_SETUP.md` - Main comprehensive guide
- `/docs/STRIPE_QUICK_START.md` - 5-minute quick start
- `/docs/STRIPE_TESTING_CHECKLIST.md` - Complete testing guide
- `/docs/stripe-setup-guide.md` - Original detailed guide

### Integration Code
- `/lib/stripe.ts` - Stripe client and pricing config
- `/app/api/stripe/webhook/route.ts` - Webhook handler
- `/app/api/stripe/checkout/route.ts` - Checkout session creation
- `/app/api/stripe/portal/route.ts` - Customer Portal session

### Configuration
- `/.env.example` - Environment variable template
- `/.env.local` - Your local environment (not in git)

---

## Next Steps

### Immediate (Development)
1. [ ] Run setup script
2. [ ] Configure webhooks for local dev
3. [ ] Test checkout flow
4. [ ] Verify database integration
5. [ ] Test Customer Portal

### Before Production
1. [ ] Complete testing checklist
2. [ ] Create live products
3. [ ] Configure production webhook
4. [ ] Set production environment variables
5. [ ] Test with real card (small amount)
6. [ ] Enable monitoring/alerts

### Post-Launch
1. [ ] Monitor webhook delivery
2. [ ] Track failed payments
3. [ ] Review customer feedback
4. [ ] Optimize conversion rates
5. [ ] Update documentation as needed

---

## Support Resources

### Stripe Documentation
- Main docs: https://stripe.com/docs
- Testing: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks
- CLI: https://stripe.com/docs/cli

### Project Documentation
- Main guide: See `/docs/STRIPE_PRODUCT_SETUP.md`
- Quick start: See `/docs/STRIPE_QUICK_START.md`
- Testing: See `/docs/STRIPE_TESTING_CHECKLIST.md`

### Dashboard Links
- Stripe Dashboard: https://dashboard.stripe.com
- API Keys: https://dashboard.stripe.com/apikeys
- Webhooks: https://dashboard.stripe.com/webhooks
- Products: https://dashboard.stripe.com/products
- Customers: https://dashboard.stripe.com/customers

---

## Summary

**Setup Time**: ~5-10 minutes
**Testing Time**: ~30-60 minutes
**Production Deployment**: ~15-30 minutes

**Total Time to Launch**: 1-2 hours

**What You Get:**
- Three subscription tiers configured
- Automated webhook handling
- Customer Portal for self-service
- Usage tracking integrated
- Comprehensive testing suite
- Production-ready integration

**You're Ready When:**
- [ ] All tests pass
- [ ] Webhooks processing correctly
- [ ] Database records accurate
- [ ] Customer Portal accessible
- [ ] Documentation reviewed
- [ ] Production variables set

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
**Status**: Ready for Setup
