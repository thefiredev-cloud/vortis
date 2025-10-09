# Stripe Setup Guide for Vortis

Complete guide for configuring Stripe subscriptions with Vortis authentication system.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Vortis application running locally or deployed
- Access to Supabase project

## Step 1: Create Stripe Products

### 1.1 Navigate to Products

1. Log in to Stripe Dashboard: https://dashboard.stripe.com
2. Click **Products** in the left sidebar
3. Click **+ Add product**

### 1.2 Create Starter Plan

**Product Information**:
- **Name**: Vortis Starter
- **Description**: Perfect for beginners - 100 stock analyses per month
- **Image**: (Optional) Upload your product image

**Pricing**:
- **Pricing model**: Standard pricing
- **Price**: $29.00 USD
- **Billing period**: Monthly
- **Usage type**: Licensed (not metered)

**Advanced Settings**:
- **Statement descriptor**: VORTIS STARTER
- **Unit label**: subscription

Click **Save product**

**Copy the Price ID** (starts with `price_`): `price_xxxxxxxxxxxxx`

### 1.3 Create Pro Plan (POPULAR)

**Product Information**:
- **Name**: Vortis Pro
- **Description**: For serious traders - Unlimited analyses and advanced features
- **Image**: (Optional) Upload your product image

**Pricing**:
- **Price**: $99.00 USD
- **Billing period**: Monthly

**Advanced Settings**:
- **Statement descriptor**: VORTIS PRO

Click **Save product**

**Copy the Price ID**: `price_xxxxxxxxxxxxx`

### 1.4 Create Enterprise Plan

**Product Information**:
- **Name**: Vortis Enterprise
- **Description**: For institutions - Everything plus API access and dedicated support
- **Image**: (Optional) Upload your product image

**Pricing**:
- **Price**: $299.00 USD
- **Billing period**: Monthly

**Advanced Settings**:
- **Statement descriptor**: VORTIS ENTERPRISE

Click **Save product**

**Copy the Price ID**: `price_xxxxxxxxxxxxx`

## Step 2: Get API Keys

### 2.1 Secret and Publishable Keys

1. Navigate to **Developers** > **API keys**
2. Find **Secret key** (starts with `sk_test_` or `sk_live_`)
   - Click **Reveal test key**
   - Copy the key
3. Find **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Copy the key

**Store these in `.env.local`**:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

## Step 3: Create Webhook Endpoint

### 3.1 Add Endpoint

1. Navigate to **Developers** > **Webhooks**
2. Click **+ Add endpoint**

### 3.2 Configure Endpoint

**Endpoint URL**:
- **Local development**: Use Stripe CLI (see Step 4)
- **Production**: `https://yourdomain.com/api/stripe/webhook`

**Description**: Vortis subscription webhook handler

**Events to send**:

Select these events (click **Select events**):

**Checkout**:
- ✓ `checkout.session.completed`

**Customer**:
- ✓ `customer.subscription.created`
- ✓ `customer.subscription.updated`
- ✓ `customer.subscription.deleted`

**Invoice**:
- ✓ `invoice.payment_succeeded`
- ✓ `invoice.payment_failed`
- ✓ `invoice.upcoming`

Click **Add events** then **Add endpoint**

### 3.3 Get Webhook Secret

1. Click on your newly created webhook endpoint
2. Find **Signing secret**
3. Click **Reveal**
4. Copy the secret (starts with `whsec_`)

**Store in `.env.local`**:
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## Step 4: Local Development Setup

### 4.1 Install Stripe CLI

**macOS** (Homebrew):
```bash
brew install stripe/stripe-cli/stripe
```

**Windows** (Scoop):
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux**:
```bash
# Download from https://github.com/stripe/stripe-cli/releases
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### 4.2 Login to Stripe CLI

```bash
stripe login
```

This will open a browser to authorize the CLI.

### 4.3 Forward Webhooks to Local

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy this webhook secret to `.env.local`** (for local development only)

Keep this terminal window open while developing.

## Step 5: Update Environment Variables

Create or update `/vortis/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 6: Implement Checkout Button

Create a checkout button component to initiate subscriptions.

**File**: `/components/pricing/checkout-button.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  planName: "starter" | "pro" | "enterprise";
  priceId: string;
  className?: string;
  children: React.ReactNode;
}

export function CheckoutButton({
  planName,
  priceId,
  className,
  children,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Get current user
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/auth/login");
        return;
      }

      // Create checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          planName,
          userId: user.id,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        console.error("Checkout error:", error);
        alert("Failed to create checkout session");
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await import("@stripe/stripe-js").then((mod) =>
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      );

      if (stripe) {
        const { error: redirectError } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (redirectError) {
          console.error("Redirect error:", redirectError);
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

## Step 7: Create Checkout API Route

**File**: `/app/api/stripe/create-checkout/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { priceId, planName, userId } = await request.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        user_id: userId,
        plan_name: planName,
        price_id: priceId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_name: planName,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Create checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

## Step 8: Update Pricing Page

Update `/app/pricing/page.tsx` to use the checkout button:

```typescript
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { PRICING_PLANS } from "@/lib/stripe";

// Inside pricing cards:
<CheckoutButton
  planName="starter"
  priceId={PRICING_PLANS.starter.priceId}
  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg"
>
  Get Started
</CheckoutButton>
```

## Step 9: Test the Integration

### 9.1 Test Card Numbers

Use these test card numbers in Stripe Checkout:

**Successful payment**:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment requires authentication**:
- Card: `4000 0025 0000 3155`

**Payment declined**:
- Card: `4000 0000 0000 9995`

### 9.2 Test Flow

1. Start development server:
```bash
npm run dev
```

2. Start Stripe CLI listener (separate terminal):
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. Navigate to pricing page: `http://localhost:3000/pricing`

4. Click **Get Started** on any plan

5. Sign in if not authenticated

6. Enter test card details in Stripe Checkout

7. Complete payment

8. Verify webhook events in Stripe CLI terminal

9. Check database for subscription record:
```sql
SELECT * FROM subscriptions WHERE user_id = 'your-user-id';
SELECT * FROM usage_tracking WHERE user_id = 'your-user-id';
```

### 9.3 Trigger Test Events

Manually trigger webhook events:

```bash
# Successful checkout
stripe trigger checkout.session.completed

# Payment succeeded
stripe trigger invoice.payment_succeeded

# Payment failed
stripe trigger invoice.payment_failed

# Subscription deleted
stripe trigger customer.subscription.deleted
```

## Step 10: Customer Portal Setup

Allow users to manage their subscriptions.

### 10.1 Enable Customer Portal

1. Navigate to **Settings** > **Customer portal**
2. Configure portal settings:
   - ✓ Allow customers to update payment methods
   - ✓ Allow customers to update billing information
   - ✓ Allow customers to cancel subscriptions
   - ✓ Allow customers to view invoices

3. Click **Save changes**

### 10.2 Create Portal API Route

**File**: `/app/api/stripe/create-portal/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get customer's subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Create portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
```

### 10.3 Add Manage Subscription Button

```typescript
"use client";

export function ManageSubscriptionButton() {
  const handleManage = async () => {
    const response = await fetch("/api/stripe/create-portal", {
      method: "POST",
    });

    const { url } = await response.json();

    if (url) {
      window.location.href = url;
    }
  };

  return (
    <button onClick={handleManage} className="...">
      Manage Subscription
    </button>
  );
}
```

## Step 11: Production Deployment

### 11.1 Switch to Live Mode

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Create new products and prices in live mode
3. Get live API keys (starts with `sk_live_` and `pk_live_`)
4. Create new webhook endpoint with production URL
5. Update production environment variables

### 11.2 Production Environment Variables

Update your production environment (Vercel/Railway/etc):

```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx (from production webhook)
STRIPE_STARTER_PRICE_ID=price_xxxxxxxxxxxxx (live price ID)
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx (live price ID)
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx (live price ID)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 11.3 Verify Production Webhook

1. Make a test subscription in production
2. Check webhook logs in Stripe Dashboard
3. Verify database records are created
4. Test customer portal access

## Troubleshooting

### Webhook Not Receiving Events

**Issue**: Webhook endpoint returns errors or events aren't processed

**Solutions**:
1. Verify webhook endpoint URL is correct
2. Check webhook secret matches `.env.local`
3. Ensure webhook is active in Stripe Dashboard
4. Check server logs for errors
5. Verify database connection

### Checkout Session Creation Fails

**Issue**: Error when clicking "Get Started" button

**Solutions**:
1. Verify price IDs are correct in `.env.local`
2. Check Stripe secret key is valid
3. Ensure user is authenticated
4. Check browser console for errors
5. Verify API route is accessible

### Database Not Updating

**Issue**: Subscription/usage tables not updating after checkout

**Solutions**:
1. Check webhook is receiving events
2. Verify Supabase credentials are correct
3. Check RLS policies allow service_role to insert
4. Review webhook handler logs
5. Ensure metadata is passed correctly

### Local Webhook Testing Issues

**Issue**: Stripe CLI not forwarding events

**Solutions**:
1. Ensure Stripe CLI is logged in: `stripe login`
2. Verify forwarding URL: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Check development server is running on port 3000
4. Try restarting Stripe CLI

## Best Practices

1. **Use Test Mode**: Always test thoroughly in test mode before going live
2. **Webhook Security**: Always verify webhook signatures
3. **Error Handling**: Log all webhook events for debugging
4. **Idempotency**: Handle duplicate webhook events gracefully
5. **Metadata**: Always include user_id in checkout session metadata
6. **Customer Portal**: Enable for better user experience
7. **Email Notifications**: Configure Stripe email notifications
8. **Analytics**: Track conversion rates and failed payments
9. **Monitoring**: Set up alerts for failed webhooks
10. **Documentation**: Keep this guide updated with any changes

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Reference](https://stripe.com/docs/cli)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Supabase + Stripe Guide](https://supabase.com/docs/guides/integrations/stripe)

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
