# Vortis Authentication & Stripe Integration - Quick Start

Fast setup guide to get authentication and subscriptions running in Vortis.

## Prerequisites

- Node.js 22+ installed
- Supabase account
- Stripe account
- Git

## 5-Minute Setup

### 1. Clone and Install

```bash
cd /Users/tannerosterkamp/vortis
npm install
```

### 2. Supabase Setup (2 minutes)

**Create Project**:
1. Go to https://supabase.com/dashboard
2. Create new project
3. Wait for database to initialize

**Get Credentials**:
1. Go to Project Settings > API
2. Copy `Project URL`
3. Copy `anon/public key`

**Run Database Migration**:
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents of `/docs/database-schema.sql`
3. Paste and run the SQL

**Configure Email**:
1. Go to Authentication > URL Configuration
2. Set Site URL: `http://localhost:3000`
3. Add Redirect URL: `http://localhost:3000/auth/callback`

### 3. Stripe Setup (2 minutes)

**Create Products**:
1. Go to https://dashboard.stripe.com/products
2. Create 3 products:
   - Starter: $29/month
   - Pro: $99/month
   - Enterprise: $299/month
3. Copy each Price ID (starts with `price_`)

**Get API Keys**:
1. Go to Developers > API keys
2. Copy Secret key (starts with `sk_test_`)
3. Copy Publishable key (starts with `pk_test_`)

### 4. Environment Variables (1 minute)

Create `.env.local` in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx... # Get from Step 5

# Price IDs
STRIPE_STARTER_PRICE_ID=price_xxx...
STRIPE_PRO_PRICE_ID=price_xxx...
STRIPE_ENTERPRISE_PRICE_ID=price_xxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Stripe Webhook (Local Development)

**Terminal 1** - Start app:
```bash
npm run dev
```

**Terminal 2** - Stripe CLI:
```bash
# Install Stripe CLI (if not installed)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret from CLI output to `.env.local` as `STRIPE_WEBHOOK_SECRET`

Restart the dev server (Terminal 1).

## Test the Setup

### Test Authentication

1. Go to `http://localhost:3000/auth/signup`
2. Create account with your email
3. Check email for verification link
4. Click link to verify
5. Should redirect to dashboard

### Test Subscription

1. Go to `http://localhost:3000/pricing`
2. Click "Get Started" on any plan
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., 12/34)
5. CVC: Any 3 digits (e.g., 123)
6. Complete checkout
7. Should redirect to dashboard

### Verify Database

Check Supabase Dashboard > Table Editor:

**Subscriptions Table**:
- Should see your subscription record
- Status should be "active"

**Usage Tracking Table**:
- Should see usage record for your plan

## File Structure

```
/vortis
├── app/
│   ├── auth/
│   │   ├── login/page.tsx              ✓ Complete
│   │   ├── signup/page.tsx             ✓ Complete
│   │   └── callback/route.ts           ✓ Complete
│   ├── api/
│   │   └── stripe/
│   │       ├── webhook/route.ts        ✓ Complete
│   │       ├── create-checkout/route.ts ✓ New
│   │       └── create-portal/route.ts   ✓ New
│   ├── dashboard/page.tsx              ✓ Complete
│   └── pricing/page.tsx                ✓ Complete
├── components/
│   ├── pricing/
│   │   └── checkout-button.tsx         ✓ New
│   └── dashboard/
│       └── manage-subscription-button.tsx ✓ New
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ✓ Complete
│   │   └── server.ts                   ✓ Complete
│   └── stripe.ts                       ✓ Complete
├── middleware.ts                       ✓ Complete
├── docs/
│   ├── auth-system-documentation.md    ✓ New
│   ├── database-schema.sql             ✓ New
│   ├── stripe-setup-guide.md           ✓ New
│   └── QUICK_START.md                  ✓ This file
└── .env.local                          ⚠ Create this
```

## Common Issues

### "Invalid API key"
- Check `.env.local` has correct Stripe keys
- Ensure no extra spaces in keys
- Restart dev server after adding keys

### "Webhook signature verification failed"
- Ensure Stripe CLI is running
- Copy webhook secret from CLI output
- Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`
- Restart dev server

### Email verification not working
- Check Supabase redirect URLs include `/auth/callback`
- Verify email templates are enabled
- Check spam folder

### Can't access dashboard
- Clear browser cookies
- Check middleware.ts is not blocking
- Verify Supabase credentials

## Next Steps

1. **Update Pricing Page**: Add checkout buttons to pricing cards
2. **Add Settings Page**: Create `/app/dashboard/settings/page.tsx`
3. **Display Subscription**: Show user's plan in dashboard
4. **Usage Tracking**: Implement analysis counters
5. **Production Deploy**: Follow production setup guide

## Production Checklist

Before deploying to production:

- [ ] Switch Stripe to live mode
- [ ] Create production Stripe products
- [ ] Update environment variables with live keys
- [ ] Create production webhook endpoint
- [ ] Test live payment flow
- [ ] Enable email confirmations in Supabase
- [ ] Configure custom domain for emails
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Review RLS policies
- [ ] Test all auth flows
- [ ] Add rate limiting
- [ ] Enable 2FA (optional)

## Stripe Test Cards

**Successful Payment**:
- Card: `4242 4242 4242 4242`
- Any future expiry, any CVC

**Requires Authentication**:
- Card: `4000 0025 0000 3155`

**Declined**:
- Card: `4000 0000 0000 9995`

**Insufficient Funds**:
- Card: `4000 0000 0000 9995`

## Useful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test webhook
stripe trigger checkout.session.completed

# View Stripe events
stripe events list

# Supabase local development
npx supabase start
npx supabase db reset
```

## Resources

- **Full Documentation**: `/docs/auth-system-documentation.md`
- **Database Schema**: `/docs/database-schema.sql`
- **Stripe Guide**: `/docs/stripe-setup-guide.md`
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js 15 Docs**: https://nextjs.org/docs

## Support

If you encounter issues:

1. Check console for errors
2. Review Stripe webhook logs
3. Check Supabase logs
4. Review this guide
5. Check full documentation

## Architecture Overview

```
User Request
     │
     ├─▶ Public Routes (/, /pricing)
     │   └─▶ Direct Access
     │
     ├─▶ Auth Routes (/auth/*)
     │   ├─▶ Login/Signup Forms
     │   └─▶ Supabase Auth API
     │
     ├─▶ Protected Routes (/dashboard/*)
     │   ├─▶ Middleware Check
     │   ├─▶ Session Validation
     │   └─▶ Grant/Deny Access
     │
     └─▶ API Routes (/api/*)
         ├─▶ /api/stripe/webhook
         │   └─▶ Update Database
         ├─▶ /api/stripe/create-checkout
         │   └─▶ Create Stripe Session
         └─▶ /api/stripe/create-portal
             └─▶ Customer Portal
```

## Subscription Flow

```
1. User clicks "Get Started"
2. CheckoutButton validates auth
3. API creates Stripe session
4. User completes payment
5. Stripe sends webhook
6. Webhook handler updates DB
7. User sees updated plan
```

## Security Features

- HTTP-only cookies for sessions
- Row Level Security (RLS) on all tables
- Webhook signature verification
- CSRF protection via Supabase
- Secure password hashing (bcrypt)
- Email verification required
- API route authentication
- Environment variable protection

---

**Setup Time**: ~5 minutes
**Last Updated**: 2025-10-09
**Status**: Production Ready
