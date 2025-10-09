# Stripe Product Setup - Execution Guide

Step-by-step execution guide for setting up Stripe products for Vortis.

## Current Status

- [x] Stripe integration code complete
- [x] Setup script ready at `/scripts/setup-stripe-products.ts`
- [x] Documentation complete
- [ ] Products created in Stripe
- [ ] Environment variables configured
- [ ] Webhooks configured
- [ ] Integration tested

---

## Execution Steps

### Step 1: Get Stripe Account Ready (5 min)

1. Open Stripe Dashboard: https://dashboard.stripe.com
2. Toggle to **Test mode** (switch in top-right corner)
3. Navigate to **Developers** > **API keys**
4. Keep this tab open for the next steps

---

### Step 2: Run Setup Script (2 min)

Open terminal and run:

```bash
# Navigate to project
cd /Users/tannerosterkamp/vortis

# Set Stripe secret key (copy from dashboard)
export STRIPE_SECRET_KEY=sk_test_PASTE_YOUR_KEY_HERE

# Verify it's set
echo $STRIPE_SECRET_KEY

# Run setup script
npx tsx scripts/setup-stripe-products.ts
```

**Expected Output:**
```
🚀 Setting up Vortis Stripe products...

Creating Starter product...
✅ Starter created: price_1QABCxxxxxxxxxxx

Creating Pro product...
✅ Pro created: price_1QABCyxxxxxxxxxx

Creating Enterprise product...
✅ Enterprise created: price_1QABCzxxxxxxxxxx

📋 Add these to your .env.local file:

STRIPE_STARTER_PRICE_ID=price_1QABCxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_1QABCyxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_1QABCzxxxxxxxxxx

✨ Stripe products created successfully!
```

If you see this output, the script succeeded. Copy the three price IDs for the next step.

---

### Step 3: Update Environment Variables (2 min)

Edit `/Users/tannerosterkamp/vortis/.env.local` and add/update:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_FROM_DASHBOARD
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_FROM_DASHBOARD

# Price IDs (from script output above)
STRIPE_STARTER_PRICE_ID=price_1QABCxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_1QABCyxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_1QABCzxxxxxxxxxx

# App URL (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Where to find the keys:**
- Go to Stripe Dashboard > Developers > API keys
- **Secret key**: Click "Reveal test key" button, starts with `sk_test_`
- **Publishable key**: Already visible, starts with `pk_test_`

---

### Step 4: Verify Products Created (1 min)

1. In Stripe Dashboard, navigate to **Products**
2. You should see three new products:
   - **Vortis Starter** - $29.00/month
   - **Vortis Pro** - $99.00/month
   - **Vortis Enterprise** - $299.00/month
3. Click on each to verify the prices match

---

### Step 5: Setup Webhooks for Development (3 min)

**Install Stripe CLI** (if not already installed):

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

**Authenticate:**

```bash
stripe login
```

This opens a browser to authorize. Click "Allow access".

**Start webhook listener:**

Open a NEW terminal window and run:

```bash
cd /Users/tannerosterkamp/vortis
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Expected output:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxx (^C to quit)
```

**Copy the webhook secret** (starts with `whsec_`) and add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
```

**IMPORTANT**: Keep this terminal window open. Webhooks won't work if you close it.

---

### Step 6: Start Development Server (1 min)

Open ANOTHER terminal window:

```bash
cd /Users/tannerosterkamp/vortis
npm run dev
```

Wait for:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

---

### Step 7: Test the Integration (5 min)

**Test Checkout Flow:**

1. Open browser: http://localhost:3000/pricing
2. Click **Get Started** on the Starter plan
3. Sign in if prompted
4. You should be redirected to Stripe Checkout
5. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
   - Name: `Test User`
6. Click "Subscribe"
7. Should redirect back to your app with success message

**Verify Webhooks:**

In your Stripe CLI terminal (from Step 5), you should see:

```
2025-10-09 12:34:56  --> checkout.session.completed [evt_xxx]
2025-10-09 12:34:57  --> customer.subscription.created [evt_xxx]
2025-10-09 12:34:58  --> invoice.payment_succeeded [evt_xxx]
```

If you see these events, webhooks are working correctly.

**Verify Database:**

Check Supabase dashboard or run query:

```sql
SELECT * FROM subscriptions
ORDER BY created_at DESC LIMIT 1;
```

Should show your new subscription with `status = 'active'`.

---

## You're Done!

If all steps completed successfully:

- [x] Products created in Stripe
- [x] Environment variables configured
- [x] Webhooks working
- [x] Test checkout succeeded
- [x] Database updated

---

## Next Steps

### For Continued Development

1. Keep the Stripe CLI terminal running while developing
2. Test all three plans (Starter, Pro, Enterprise)
3. Test the Customer Portal:
   - Go to dashboard
   - Click "Manage Subscription"
   - Should open Stripe Customer Portal
4. Review testing checklist: `/docs/STRIPE_TESTING_CHECKLIST.md`

### For Production Deployment

When ready to accept real payments:

1. Follow production guide: `/docs/STRIPE_PRODUCT_SETUP.md#production-deployment`
2. Create live products (re-run script with live key)
3. Configure production webhook
4. Update production environment variables
5. Test with small real purchase

---

## Troubleshooting

### Script Fails

**Error**: `STRIPE_SECRET_KEY is not set`

```bash
# Make sure to export it first
export STRIPE_SECRET_KEY=sk_test_your_key_here
npx tsx scripts/setup-stripe-products.ts
```

### Webhook Not Receiving Events

**Check Stripe CLI is running:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Check webhook secret in .env.local:**
```bash
cat .env.local | grep STRIPE_WEBHOOK_SECRET
```

**Restart both terminals** (Stripe CLI and dev server)

### Checkout Button Does Nothing

**Verify price IDs are set:**
```bash
cat .env.local | grep STRIPE_.*_PRICE_ID
```

All three should be set and start with `price_`

**Restart dev server** after changing `.env.local`

### Database Not Updating

- Verify Stripe CLI shows webhook events
- Check dev server terminal for errors
- Verify Supabase credentials in `.env.local`
- Check RLS policies in Supabase

---

## Documentation Reference

**Quick guides:**
- `/docs/STRIPE_QUICK_START.md` - Fast setup reference
- `/docs/STRIPE_SETUP_SUMMARY.md` - Complete overview

**Detailed guides:**
- `/docs/STRIPE_PRODUCT_SETUP.md` - Comprehensive setup
- `/docs/STRIPE_TESTING_CHECKLIST.md` - Complete testing

**Integration guides:**
- `/docs/stripe-setup-guide.md` - UI integration examples

---

## Support

**Stripe Dashboard**: https://dashboard.stripe.com
**Stripe Docs**: https://stripe.com/docs
**Test Cards**: https://stripe.com/docs/testing

**Project files:**
- Script: `/scripts/setup-stripe-products.ts`
- Stripe config: `/lib/stripe.ts`
- Webhook handler: `/app/api/stripe/webhook/route.ts`

---

**Created**: 2025-10-09
**Project**: Vortis Stock Analysis Platform
**Status**: Ready to Execute
