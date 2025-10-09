# Stripe Quick Start - 5 Minute Setup

Fast-track guide to get Stripe products configured for Vortis.

## Before You Start

- [ ] Stripe account created
- [ ] Stripe Dashboard open in browser
- [ ] Terminal open in `/Users/tannerosterkamp/vortis`

---

## Step 1: Get Test API Key (2 min)

1. Open: https://dashboard.stripe.com
2. Toggle to **Test mode** (top-right corner)
3. Click **Developers** > **API keys**
4. Copy **Secret key** (starts with `sk_test_`)
5. Copy **Publishable key** (starts with `pk_test_`)

---

## Step 2: Run Setup Script (1 min)

```bash
# Set your Stripe key
export STRIPE_SECRET_KEY=sk_test_PASTE_YOUR_KEY_HERE

# Run the setup script
npx tsx scripts/setup-stripe-products.ts
```

Expected output:
```
✅ Starter created: price_xxx
✅ Pro created: price_xxx
✅ Enterprise created: price_xxx
```

---

## Step 3: Update .env.local (1 min)

Add these to `/Users/tannerosterkamp/vortis/.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Price IDs (from script output)
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
```

---

## Step 4: Setup Webhooks (1 min)

**Option A: Stripe CLI (Recommended for dev)**
```bash
# Install (macOS)
brew install stripe/stripe-cli/stripe

# Authenticate
stripe login

# Start listening (keep this terminal open)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_xxx` secret and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**Option B: Manual webhook (Production)**
See full guide: `/docs/STRIPE_PRODUCT_SETUP.md#webhook-configuration`

---

## Step 5: Test It (1 min)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start webhook listener (if using Stripe CLI)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Browser: Test checkout
# 1. Visit: http://localhost:3000/pricing
# 2. Click "Get Started"
# 3. Sign in if needed
# 4. Use test card: 4242 4242 4242 4242
# 5. Complete checkout
```

---

## Test Cards

**Success**: `4242 4242 4242 4242`
**Decline**: `4000 0000 0000 9995`
**3D Secure**: `4000 0025 0000 3155`

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits

---

## Verify Setup

- [ ] Three products visible in Stripe Dashboard > Products
- [ ] Checkout flow redirects to Stripe
- [ ] Test payment succeeds
- [ ] Webhook events appear in Stripe CLI terminal
- [ ] User redirected back to app after payment

---

## Done!

**Next Steps:**
- Review full guide: `/docs/STRIPE_PRODUCT_SETUP.md`
- Setup Customer Portal: `/docs/stripe-setup-guide.md#step-10`
- Test subscription management
- Deploy to production

---

## Troubleshooting

**Script fails?**
```bash
npm install
export STRIPE_SECRET_KEY=sk_test_xxx
npx tsx scripts/setup-stripe-products.ts
```

**Webhook not working?**
```bash
# Restart Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Restart dev server
npm run dev
```

**Environment variables not loading?**
```bash
# Restart dev server after changing .env.local
npm run dev
```

---

**Full Documentation**: `/docs/STRIPE_PRODUCT_SETUP.md`
**Need Help?** Check Troubleshooting section in full guide
