# Vortis Setup Guide

## Prerequisites

- Node.js 22+
- npm or yarn
- Supabase account
- Stripe account
- Netlify account (for deployment)

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project called "vortis"
2. Once created, go to Project Settings > API
3. Copy your project URL and anon key
4. Go to SQL Editor and run the schema from `supabase/schema.sql`

## Step 2: Stripe Setup

1. Install tsx for running TypeScript scripts:
   ```bash
   npm install -D tsx
   ```

2. Create a `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

3. Add your Stripe secret key to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```

4. Run the Stripe setup script:
   ```bash
   npx tsx scripts/setup-stripe-products.ts
   ```

5. Copy the output price IDs to your `.env.local` file

6. Set up Stripe webhook:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
   - Copy webhook signing secret to `.env.local`

## Step 3: Environment Variables

Complete your `.env.local` file with all credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs (from setup script)
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Install Dependencies

```bash
npm install
npm install -D tsx
```

## Step 5: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 6: Octagon MCP Integration

Octagon MCP should be configured globally. The API route at `/api/analyze` will use it for real stock data.

To test the connection, ensure Octagon MCP server is running and accessible.

## Step 7: Deploy to Netlify

1. Push code to GitHub (already done)
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Select GitHub and choose the `vortis` repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add all environment variables from `.env.local`
7. Deploy!

## Step 8: Domain Setup

1. Purchase `vortis.ai` domain
2. In Netlify, go to Domain settings
3. Add custom domain `vortis.ai`
4. Update DNS records as instructed

## Testing

1. **Free Analysis**: Go to homepage, enter a stock ticker (e.g., AAPL), click "Analyze Now"
2. **Pricing**: Visit `/pricing` to see the three tiers
3. **Stripe Checkout**: Click "Get Started" on any pricing tier (requires Stripe test mode)

## Supabase Database Functions

Add this function to Supabase SQL Editor for usage tracking:

```sql
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE usage_tracking
  SET analyses_used = analyses_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND period_end > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Troubleshooting

### Supabase Connection Issues
- Verify URL and keys in `.env.local`
- Check Supabase project status
- Ensure RLS policies are set correctly

### Stripe Webhook Issues
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook secret matches

### MCP Connection Issues
- Ensure Octagon MCP server is running
- Check MCP configuration in Claude settings

## Next Steps

1. Implement actual Octagon MCP integration in `/app/api/analyze/route.ts`
2. Build authentication UI (login/signup pages)
3. Create dashboard for authenticated users
4. Add payment checkout flow
5. Implement usage tracking UI
6. Add admin panel for monitoring

## Support

For issues, check:
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
