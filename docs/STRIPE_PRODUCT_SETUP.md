# Stripe Product Setup Guide

Complete step-by-step guide to create and configure Stripe products for Vortis subscription plans.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option A: Automated Setup (Recommended)](#option-a-automated-setup-recommended)
3. [Option B: Manual Setup via Dashboard](#option-b-manual-setup-via-dashboard)
4. [Webhook Configuration](#webhook-configuration)
5. [Testing Guide](#testing-guide)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- Stripe account (sign up at https://stripe.com)
- Stripe API keys (Test mode for development)
- Node.js 22+ installed
- Vortis project cloned and dependencies installed

---

## Option A: Automated Setup (Recommended)

Use the provided setup script to create all products and prices automatically.

### Step 1: Get Stripe API Keys

#### Test Mode (Development)

1. Log in to Stripe Dashboard: https://dashboard.stripe.com
2. Toggle to **Test mode** (switch in top-right corner)
3. Navigate to **Developers** > **API keys**
4. Copy your **Secret key** (starts with `sk_test_`)
5. Copy your **Publishable key** (starts with `pk_test_`)

**Important**: Keep your secret key secure. Never commit it to version control.

### Step 2: Set Environment Variable

Before running the setup script, you need to set your Stripe secret key.

**Option 1: Export temporarily (Unix/macOS/Linux)**
```bash
export STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

**Option 2: Export temporarily (Windows PowerShell)**
```powershell
$env:STRIPE_SECRET_KEY="sk_test_your_actual_key_here"
```

**Option 3: Export temporarily (Windows CMD)**
```cmd
set STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

**Verify it's set:**
```bash
# Unix/macOS/Linux
echo $STRIPE_SECRET_KEY

# Windows PowerShell
echo $env:STRIPE_SECRET_KEY

# Windows CMD
echo %STRIPE_SECRET_KEY%
```

### Step 3: Run Setup Script

```bash
# Navigate to project root
cd /Users/tannerosterkamp/vortis

# Run the setup script
npx tsx scripts/setup-stripe-products.ts
```

### Step 4: Expected Output

You should see output similar to this:

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

### Step 5: Update Environment Variables

Copy the price IDs from the output and add them to your `.env.local` file:

**File**: `/Users/tannerosterkamp/vortis/.env.local`

```bash
# Add or update these lines
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here

# Price IDs from script output
STRIPE_STARTER_PRICE_ID=price_1QABCxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_1QABCyxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_1QABCzxxxxxxxxxx
```

### Step 6: Verify Products Created

1. Open Stripe Dashboard: https://dashboard.stripe.com
2. Ensure you're in **Test mode**
3. Navigate to **Products**
4. You should see three products:
   - **Vortis Starter** - $29.00/month
   - **Vortis Pro** - $99.00/month
   - **Vortis Enterprise** - $299.00/month

---

## Option B: Manual Setup via Dashboard

If you prefer to create products manually or the script fails, follow these steps.

### Create Starter Plan

1. Navigate to **Products** in Stripe Dashboard
2. Click **+ Add product**

**Product Details:**
- **Name**: Vortis Starter
- **Description**: Perfect for beginners exploring AI-powered stock analysis
- **Image**: (Optional) Upload product image
- **Statement descriptor**: VORTIS STARTER

**Pricing:**
- Click **Add pricing**
- **Price**: $29.00
- **Billing period**: Monthly
- **Usage type**: Recurring
- **Currency**: USD

**Metadata** (Optional):
- Key: `plan`, Value: `starter`

Click **Save product**

**Copy the Price ID** (starts with `price_`) from the pricing section.

### Create Pro Plan

Repeat the process with these details:

**Product Details:**
- **Name**: Vortis Pro
- **Description**: For serious traders who need unlimited analysis and advanced features
- **Statement descriptor**: VORTIS PRO

**Pricing:**
- **Price**: $99.00
- **Billing period**: Monthly

**Metadata:**
- Key: `plan`, Value: `pro`

**Copy the Price ID**

### Create Enterprise Plan

Repeat the process with these details:

**Product Details:**
- **Name**: Vortis Enterprise
- **Description**: For institutions requiring custom models and dedicated support
- **Statement descriptor**: VORTIS ENTERPRISE

**Pricing:**
- **Price**: $299.00
- **Billing period**: Monthly

**Metadata:**
- Key: `plan`, Value: `enterprise`

**Copy the Price ID**

### Update .env.local

Add all price IDs to your `.env.local` file as shown in Step 5 above.

---

## Webhook Configuration

Webhooks are essential for handling subscription events (payments, cancellations, etc.).

### Development: Stripe CLI

For local development, use the Stripe CLI to forward webhook events.

#### Install Stripe CLI

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Or use npm (all platforms):**
```bash
npm install -g stripe-cli
```

#### Authenticate Stripe CLI

```bash
stripe login
```

This opens a browser window to authorize the CLI with your Stripe account.

#### Forward Webhooks

Open a **separate terminal window** and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Expected output:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxx (^C to quit)
```

**Copy the webhook secret** and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxx
```

**Important**: Keep this terminal running while developing. Webhooks won't be received if it's stopped.

#### Test Webhook

In another terminal, trigger a test event:

```bash
stripe trigger checkout.session.completed
```

You should see the event logged in the Stripe CLI terminal.

### Production: Webhook Endpoint

For production, create a permanent webhook endpoint.

1. Navigate to **Developers** > **Webhooks**
2. Click **+ Add endpoint**

**Endpoint details:**
- **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
- **Description**: Vortis subscription webhook handler
- **Version**: Latest API version

**Select events to listen to:**

Click **Select events** and choose:

**Checkout events:**
- `checkout.session.completed`

**Customer events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Invoice events:**
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.upcoming`

Click **Add events** then **Add endpoint**

**Get webhook secret:**
1. Click on your newly created endpoint
2. Find **Signing secret**
3. Click **Reveal**
4. Copy the secret (starts with `whsec_`)
5. Add to production environment variables

---

## Testing Guide

Thoroughly test the integration before going live.

### Test Flow Checklist

#### 1. Start Development Environment

Terminal 1 - Development server:
```bash
cd /Users/tannerosterkamp/vortis
npm run dev
```

Terminal 2 - Stripe webhook listener:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### 2. Test Checkout Flow

1. Navigate to: http://localhost:3000/pricing
2. Click **Get Started** on any plan
3. Sign in if not authenticated
4. You'll be redirected to Stripe Checkout
5. Enter test card details (see below)
6. Complete payment
7. Verify redirect to success page

#### 3. Test Card Numbers

**Successful payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Requires 3D Secure authentication:**
- Card: `4000 0025 0000 3155`
- Complete authentication in test mode

**Payment declined:**
- Card: `4000 0000 0000 9995`
- Should show error message

**Insufficient funds:**
- Card: `4000 0000 0000 9995`

**More test cards**: https://stripe.com/docs/testing

#### 4. Verify Webhook Events

In your Stripe CLI terminal, you should see events like:

```
2025-10-09 12:34:56  --> checkout.session.completed [evt_xxx]
2025-10-09 12:34:57  --> customer.subscription.created [evt_xxx]
2025-10-09 12:34:58  --> invoice.payment_succeeded [evt_xxx]
```

#### 5. Verify Database Records

Check Supabase to ensure subscription data was created:

**Option 1: Supabase Dashboard**
1. Navigate to Table Editor
2. Check `subscriptions` table
3. Check `usage_tracking` table

**Option 2: SQL Query**
```sql
-- Check subscription created
SELECT * FROM subscriptions
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;

-- Check usage tracking
SELECT * FROM usage_tracking
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

#### 6. Test Subscription Management

1. Navigate to: http://localhost:3000/dashboard
2. Click **Manage Subscription**
3. Should redirect to Stripe Customer Portal
4. Test updating payment method
5. Test viewing invoices
6. Test canceling subscription (in test mode)

### Manual Webhook Testing

Trigger specific webhook events manually:

```bash
# Successful checkout
stripe trigger checkout.session.completed

# Payment succeeded
stripe trigger invoice.payment_succeeded

# Payment failed
stripe trigger invoice.payment_failed

# Subscription updated
stripe trigger customer.subscription.updated

# Subscription deleted
stripe trigger customer.subscription.deleted
```

### Testing Checklist

Before deploying to production, verify:

- [ ] All three products created in Stripe
- [ ] Price IDs added to `.env.local`
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to `.env.local`
- [ ] Checkout flow works for all plans
- [ ] Test card payments succeed
- [ ] Webhook events received and logged
- [ ] Database records created correctly
- [ ] User redirected to success page
- [ ] Subscription appears in dashboard
- [ ] Customer portal accessible
- [ ] Payment method update works
- [ ] Subscription cancellation works
- [ ] Email notifications sent (optional)

---

## Production Deployment

### Switch to Live Mode

When ready to accept real payments:

#### 1. Create Live Products

**Option A: Re-run setup script**
```bash
# Set live secret key
export STRIPE_SECRET_KEY=sk_live_your_live_key_here

# Run script
npx tsx scripts/setup-stripe-products.ts
```

**Option B: Manual creation**
- Repeat product creation steps in **Live mode**
- Ensure prices match test mode

#### 2. Get Live API Keys

1. Toggle to **Live mode** in Stripe Dashboard
2. Navigate to **Developers** > **API keys**
3. Copy **Live secret key** (starts with `sk_live_`)
4. Copy **Live publishable key** (starts with `pk_live_`)

#### 3. Create Production Webhook

1. Navigate to **Developers** > **Webhooks**
2. Ensure in **Live mode**
3. Click **+ Add endpoint**
4. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
5. Select same events as test mode
6. Copy webhook secret

#### 4. Update Production Environment

Update your production environment variables (Vercel/Railway/Netlify/etc.):

```bash
# Stripe API Keys (LIVE)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Webhook Secret (LIVE)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Price IDs (LIVE)
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx

# App URL (Production)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 5. Test Production Webhook

After deploying, test the webhook:

```bash
# Send test event to production
stripe trigger checkout.session.completed --live
```

Check webhook logs in Stripe Dashboard to verify delivery.

#### 6. Production Checklist

Before launching:

- [ ] Live products created in Stripe
- [ ] Live price IDs configured
- [ ] Live API keys set in production
- [ ] Production webhook endpoint created
- [ ] Webhook events delivered successfully
- [ ] Test purchase in production
- [ ] Database records created in production
- [ ] Email notifications configured
- [ ] Customer portal tested
- [ ] SSL certificate valid
- [ ] Error monitoring enabled
- [ ] Payment success/failure pages work

---

## Troubleshooting

### Script Fails to Run

**Error**: `Cannot find module 'stripe'`

**Solution**: Install dependencies
```bash
npm install
```

**Error**: `STRIPE_SECRET_KEY is not set`

**Solution**: Set environment variable before running script
```bash
export STRIPE_SECRET_KEY=sk_test_your_key_here
npx tsx scripts/setup-stripe-products.ts
```

**Error**: `No such file or directory: scripts/setup-stripe-products.ts`

**Solution**: Ensure you're in the project root
```bash
cd /Users/tannerosterkamp/vortis
```

### Webhook Not Receiving Events

**Symptom**: Events not appearing in Stripe CLI terminal

**Solutions**:
1. Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
2. Verify dev server is running on port 3000
3. Check webhook secret matches `.env.local`
4. Restart both Stripe CLI and dev server
5. Check firewall isn't blocking connections

**Check webhook endpoint**:
```bash
curl http://localhost:3000/api/stripe/webhook
```

Should return method not allowed (405), not 404.

### Checkout Session Creation Fails

**Symptom**: Error when clicking "Get Started" button

**Solutions**:

1. **Verify price IDs in .env.local**
   ```bash
   cat .env.local | grep STRIPE_.*_PRICE_ID
   ```
   Should show all three price IDs starting with `price_`

2. **Check browser console** for JavaScript errors

3. **Verify Stripe publishable key**
   - Should start with `pk_test_` (test mode)
   - Should be set in `.env.local`

4. **Ensure user is authenticated**
   - Checkout requires logged-in user
   - Check auth token in browser DevTools > Application > Cookies

5. **Check API route**
   ```bash
   curl -X POST http://localhost:3000/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -d '{"priceId":"price_test","planName":"starter"}'
   ```

### Database Not Updating

**Symptom**: Subscription not appearing in database after checkout

**Solutions**:

1. **Verify webhook received event**
   - Check Stripe CLI terminal for `checkout.session.completed` event
   - If not received, webhook forwarding isn't working

2. **Check webhook handler logs**
   - Look at dev server terminal for errors
   - Common: Database connection issues

3. **Verify Supabase credentials**
   ```bash
   cat .env.local | grep SUPABASE
   ```

4. **Check RLS policies**
   - Webhook uses service role, should bypass RLS
   - Verify service role key is set (if using)

5. **Manually query database**
   ```sql
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
   ```

### Customer Portal Not Working

**Symptom**: Error when clicking "Manage Subscription"

**Solutions**:

1. **Enable Customer Portal in Stripe**
   - Navigate to **Settings** > **Customer portal**
   - Enable all features
   - Click **Save changes**

2. **Verify stripe_customer_id exists**
   ```sql
   SELECT stripe_customer_id FROM subscriptions
   WHERE user_id = 'your-user-id';
   ```
   Should return a customer ID starting with `cus_`

3. **Check API route**
   ```bash
   curl -X POST http://localhost:3000/api/stripe/portal \
     -H "Cookie: your-auth-cookie"
   ```

### Environment Variable Issues

**Symptom**: Variables not loading

**Solutions**:

1. **Restart dev server** after changing `.env.local`

2. **Verify file location**
   ```bash
   ls -la /Users/tannerosterkamp/vortis/.env.local
   ```

3. **Check for typos**
   - Variable names must match exactly
   - No spaces around `=`
   - No quotes around values (usually)

4. **Verify public variables start with NEXT_PUBLIC_**
   - Client-side variables must have this prefix

### Test Card Not Working

**Symptom**: Test payment fails with valid test card

**Solutions**:

1. **Ensure in test mode**
   - Check Stripe Dashboard shows "Test mode"
   - API key should start with `sk_test_`

2. **Try basic test card**: `4242 4242 4242 4242`

3. **Check card details**
   - Expiry must be future date
   - CVC can be any 3 digits
   - Name can be anything

4. **Clear browser cache** and retry

---

## Product Details Reference

### Starter Plan

**Price**: $29/month
**Target**: Beginners exploring AI-powered stock analysis

**Features**:
- 100 stock analyses per month
- Basic market insights
- Email support
- Daily market updates

**Technical Limits** (in code):
```typescript
analyses: 100,
realTimeData: false,
advancedSignals: false,
priorityProcessing: false,
apiAccess: false
```

### Pro Plan

**Price**: $99/month
**Target**: Serious traders needing unlimited analysis

**Features**:
- Unlimited analyses
- Advanced trading signals
- Real-time data feeds
- Priority processing
- Portfolio optimization
- Priority support (24/7)

**Technical Limits** (in code):
```typescript
analyses: -1, // unlimited
realTimeData: true,
advancedSignals: true,
priorityProcessing: true,
apiAccess: false
```

### Enterprise Plan

**Price**: $299/month
**Target**: Institutions requiring custom solutions

**Features**:
- Everything in Pro
- Custom AI models
- API access
- White-label options
- Dedicated support team
- Custom integrations

**Technical Limits** (in code):
```typescript
analyses: -1, // unlimited
realTimeData: true,
advancedSignals: true,
priorityProcessing: true,
apiAccess: true,
customModels: true,
dedicatedSupport: true
```

---

## Quick Reference Commands

### Setup
```bash
# Export Stripe key (Unix/macOS)
export STRIPE_SECRET_KEY=sk_test_your_key_here

# Run setup script
npx tsx scripts/setup-stripe-products.ts
```

### Development
```bash
# Start dev server (Terminal 1)
npm run dev

# Start webhook listener (Terminal 2)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Testing
```bash
# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.deleted
```

### Verification
```bash
# Check environment variables
cat .env.local | grep STRIPE

# Test webhook endpoint
curl http://localhost:3000/api/stripe/webhook
```

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Supabase + Stripe Integration](https://supabase.com/docs/guides/integrations/stripe)

---

## Support

If you encounter issues not covered in this guide:

1. Check Stripe Dashboard logs: **Developers** > **Logs**
2. Check Stripe Dashboard webhooks: **Developers** > **Webhooks** > View logs
3. Review application logs in terminal
4. Check Supabase logs for database errors
5. Review the existing guide: `/docs/stripe-setup-guide.md`

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
**Script Location**: `/scripts/setup-stripe-products.ts`
