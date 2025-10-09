# Vortis Authentication System Documentation

## Overview

Vortis uses a comprehensive authentication system powered by Supabase Auth with Stripe subscription integration. The system provides secure user authentication, session management, and subscription-based access control.

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

1. SIGN UP FLOW
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  User    │────▶│ Supabase │────▶│  Email   │────▶│ Callback │
   │ Sign Up  │     │   Auth   │     │  Verify  │     │  Handler │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
        │                                                     │
        └─────────────────────────────────────────────────────┘
                              │
                              ▼
                        ┌──────────┐
                        │Dashboard │
                        └──────────┘

2. SIGN IN FLOW
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  User    │────▶│ Supabase │────▶│  Session │────▶│Dashboard │
   │ Sign In  │     │   Auth   │     │  Cookie  │     │          │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘

3. PROTECTED ROUTES
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Access  │────▶│Middleware│────▶│ Verify   │
   │Protected │     │  Check   │     │  Session │
   └──────────┘     └──────────┘     └──────────┘
        │                                  │
        │ No Session                       │ Has Session
        ▼                                  ▼
   ┌──────────┐                      ┌──────────┐
   │  Login   │                      │  Grant   │
   │   Page   │                      │  Access  │
   └──────────┘                      └──────────┘
```

## Components

### 1. Supabase Client Configuration

**Location**: `/lib/supabase/client.ts`, `/lib/supabase/server.ts`

**Client-side client** (Browser):
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Server-side client**:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { /* Set cookies */ }
      }
    }
  );
}
```

### 2. Middleware (Route Protection)

**Location**: `/middleware.ts`

**Protected Paths**: `/dashboard/*`
**Auth Paths**: `/auth/login`, `/auth/signup`

**Behavior**:
- Protected routes → Redirect to `/auth/login` if unauthenticated
- Auth routes → Redirect to `/dashboard` if authenticated
- Session refresh on every request

### 3. Authentication Routes

#### Sign Up (`/app/auth/signup/page.tsx`)

**Features**:
- Email/password registration
- Password confirmation validation
- Full name collection
- Email verification flow
- Redirects to email confirmation page

**Validation**:
- Password minimum 8 characters
- Password match confirmation
- Terms & conditions acceptance

#### Sign In (`/app/auth/login/page.tsx`)

**Features**:
- Email/password authentication
- Error handling with user feedback
- Auto-redirect to dashboard on success
- Loading states with Loader2 icon

#### Callback Handler (`/app/auth/callback/route.ts`)

**Purpose**: Handles email verification links
**Flow**:
1. Receives verification code from email
2. Exchanges code for session
3. Redirects to dashboard or specified path

### 4. Protected Dashboard

**Location**: `/app/dashboard/page.tsx`

**Server-side Protection**:
```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  redirect("/auth/login");
}
```

**Features**:
- User email display
- Sign out functionality
- Subscription status display

## Stripe Integration

### Subscription Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SUBSCRIPTION FLOW                               │
└─────────────────────────────────────────────────────────────────────┘

1. USER SUBSCRIBES
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Pricing │────▶│  Stripe  │────▶│ Payment  │────▶│ Checkout │
   │   Page   │     │ Checkout │     │  Success │     │ Complete │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                             │
                                                             ▼
                                                       ┌──────────┐
                                                       │ Webhook  │
                                                       └──────────┘
                                                             │
                    ┌────────────────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────────────────────┐
   │           DATABASE UPDATES                              │
   ├────────────────────────────────────────────────────────┤
   │  1. Create subscription record                         │
   │  2. Set subscription status to 'active'                │
   │  3. Create usage_tracking record                       │
   │  4. Link stripe_customer_id to user                    │
   └────────────────────────────────────────────────────────┘

2. SUBSCRIPTION EVENTS
   ┌──────────────────────┐
   │ Stripe Webhook       │
   └──────────────────────┘
             │
             ├─▶ checkout.session.completed → Create subscription
             ├─▶ customer.subscription.updated → Update status
             ├─▶ customer.subscription.deleted → Cancel subscription
             ├─▶ invoice.payment_succeeded → Renew subscription
             └─▶ invoice.payment_failed → Mark past_due
```

### Pricing Plans

**Location**: `/lib/stripe.ts`

| Plan       | Price/mo | Analyses | Features |
|------------|----------|----------|----------|
| Free       | $0       | 10       | Basic features |
| Starter    | $29      | 100      | SEC filings (2y), 5 indicators |
| Pro        | $99      | Unlimited| Full SEC (10y), 20+ indicators, Real-time alerts |
| Enterprise | $299     | Unlimited| Everything + API, Private data, Custom research |

### Webhook Handler

**Location**: `/app/api/stripe/webhook/route.ts`

**Events Handled**:

1. **checkout.session.completed**
   - Creates subscription record in database
   - Links Stripe customer to user
   - Initializes usage tracking

2. **customer.subscription.updated**
   - Updates subscription status
   - Updates billing period dates
   - Handles plan changes

3. **customer.subscription.deleted**
   - Sets status to 'canceled'
   - Maintains subscription data for records

4. **invoice.payment_succeeded**
   - Activates subscription
   - Updates billing period
   - Resets usage counters

5. **invoice.payment_failed**
   - Marks subscription as 'past_due'
   - Triggers notification flow

## Database Schema

### Users Table (Managed by Supabase Auth)

```sql
-- Supabase automatically creates auth.users table
-- Extended with user_metadata:
{
  "full_name": "User's full name"
}
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  plan_name TEXT NOT NULL CHECK (plan_name IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### Usage Tracking Table

```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  analyses_used INTEGER DEFAULT 0,
  analyses_limit INTEGER NOT NULL, -- -1 for unlimited
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_period UNIQUE (user_id, period_start)
);

-- Indexes
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Usage tracking policies
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
  ON usage_tracking FOR ALL
  USING (auth.role() = 'service_role');
```

## Environment Variables

### Required Environment Variables

**Location**: `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (Created in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Application URL (for webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### 1. Supabase Setup

```bash
# Install Supabase CLI
npm install @supabase/supabase-js @supabase/ssr @supabase/auth-helpers-nextjs

# Get credentials from: https://supabase.com/dashboard
# Project Settings > API > Project URL and anon key
```

### 2. Database Migration

```sql
-- Run this SQL in Supabase SQL Editor
-- Create tables (see Database Schema section)

-- Enable email confirmation
-- Dashboard > Authentication > Settings > Enable Email Confirmations
```

### 3. Stripe Setup

```bash
# Install Stripe SDK
npm install stripe @stripe/stripe-js

# Create products in Stripe Dashboard:
# 1. Go to Products → Create Product
# 2. Add recurring prices: $29, $99, $299
# 3. Copy Price IDs to .env.local

# Setup webhook endpoint:
# 1. Stripe Dashboard → Developers → Webhooks
# 2. Add endpoint: https://yourapp.com/api/stripe/webhook
# 3. Select events:
#    - checkout.session.completed
#    - customer.subscription.updated
#    - customer.subscription.deleted
#    - invoice.payment_succeeded
#    - invoice.payment_failed
# 4. Copy webhook secret to .env.local
```

### 4. Email Configuration (Supabase)

```
Supabase Dashboard → Authentication → Email Templates

Customize:
- Confirmation email
- Password reset email
- Magic link email

Set redirect URLs:
- Site URL: https://yourapp.com
- Redirect URLs: https://yourapp.com/auth/callback
```

## Usage Examples

### Check if User is Authenticated (Server Component)

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <div>Protected content for {user.email}</div>;
}
```

### Check Subscription Status

```typescript
import { createClient } from '@/lib/supabase/server';

export async function getSubscription(userId: string) {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  return subscription;
}
```

### Check Usage Limits

```typescript
export async function canPerformAnalysis(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!usage) return false;

  // -1 means unlimited
  if (usage.analyses_limit === -1) return true;

  return usage.analyses_used < usage.analyses_limit;
}
```

### Increment Usage

```typescript
export async function incrementAnalysis(userId: string) {
  const supabase = await createClient();

  const { data: usage } = await supabase
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!usage) throw new Error('Usage tracking not found');

  await supabase
    .from('usage_tracking')
    .update({ analyses_used: usage.analyses_used + 1 })
    .eq('user_id', userId);
}
```

### Sign Out (Server Action)

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
```

## Security Best Practices

### 1. Session Management
- Sessions are stored in HTTP-only cookies
- Automatic session refresh via middleware
- 1-hour session expiration with refresh tokens

### 2. Row Level Security (RLS)
- All database tables use RLS policies
- Users can only access their own data
- Service role bypasses RLS for webhooks

### 3. Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development/production
- Rotate keys regularly

### 4. Webhook Security
- Verify Stripe webhook signatures
- Use webhook secrets from Stripe Dashboard
- Log all webhook events for audit trail

### 5. Password Requirements
- Minimum 8 characters enforced
- Supabase handles password hashing (bcrypt)
- Optional: Add password complexity rules

## Testing

### Test User Registration

```bash
# 1. Start development server
npm run dev

# 2. Navigate to http://localhost:3000/auth/signup
# 3. Register with test email
# 4. Check email for confirmation link
# 5. Click link to verify
# 6. Should redirect to /dashboard
```

### Test Stripe Webhooks (Local)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.deleted
```

## Troubleshooting

### Common Issues

**1. "Invalid signature" on webhook**
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Check webhook endpoint URL is correct
- Ensure raw body is used (no JSON parsing before verification)

**2. User not redirected after email verification**
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Verify redirect URL in Supabase Dashboard includes `/auth/callback`
- Check browser console for errors

**3. Session expires immediately**
- Verify cookie settings in Supabase client
- Check middleware is not interfering with cookies
- Ensure `sameSite` and `secure` flags are correct

**4. RLS policies blocking queries**
- Verify user is authenticated (`auth.uid()` returns value)
- Check policy conditions match query
- Use service role key for admin operations

## Migration Guide

### From Email/Password Only to OAuth

Add OAuth providers in Supabase:

```typescript
// Add to login page
const handleOAuth = async (provider: 'google' | 'github') => {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
};
```

### From Free to Paid Plans

When user upgrades:

```typescript
// Create Stripe checkout session
const session = await stripe.checkout.sessions.create({
  customer_email: user.email,
  line_items: [{ price: PRICING_PLANS.pro.priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  metadata: {
    user_id: user.id,
    plan_name: 'pro'
  }
});
```

## Monitoring and Analytics

### Key Metrics to Track

1. **Authentication Metrics**
   - Sign-up conversion rate
   - Email verification rate
   - Login success rate
   - Session duration

2. **Subscription Metrics**
   - Conversion rate by plan
   - Monthly recurring revenue (MRR)
   - Churn rate
   - Upgrade/downgrade rates

3. **Usage Metrics**
   - Analyses per user
   - Feature adoption
   - API usage
   - Peak usage times

### Logging

All authentication and subscription events are logged:
- Successful/failed login attempts
- Subscription changes
- Payment failures
- Usage limit exceeded

## Support and Maintenance

### Regular Tasks

1. **Daily**: Monitor webhook failures
2. **Weekly**: Review failed payments
3. **Monthly**: Audit user subscriptions
4. **Quarterly**: Rotate API keys

### Backup Strategy

Supabase automatic backups:
- Point-in-time recovery (7 days)
- Daily snapshots (30 days)
- Export critical data weekly

## File Structure Reference

```
/vortis
├── app/
│   ├── auth/
│   │   ├── login/page.tsx           # Login page
│   │   ├── signup/page.tsx          # Sign up page
│   │   └── callback/route.ts        # Email verification handler
│   ├── api/
│   │   └── stripe/
│   │       └── webhook/route.ts     # Stripe webhook handler
│   └── dashboard/
│       └── page.tsx                 # Protected dashboard
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   └── server.ts                # Server Supabase client
│   └── stripe.ts                    # Stripe configuration
├── middleware.ts                    # Route protection
└── .env.local                       # Environment variables (not in git)
```

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
