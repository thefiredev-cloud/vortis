# VORTIS - Quick Start to Production

**Goal:** Get from current state to production deployment in 1-3 days

---

## Prerequisites

- Node.js 22+ installed
- npm or yarn
- Git configured
- Supabase account
- Stripe account (test mode)
- Vercel/Netlify account (for deployment)

---

## Phase 1: Environment Setup (2 hours)

### Step 1: Supabase Setup (30 min)

1. **Create Project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: "vortis"
   - Database password: (save securely)
   - Region: Choose closest to your users
   - Click "Create new project"

2. **Get Credentials:**
   - Wait for project to finish provisioning
   - Go to Settings > API
   - Copy these values:
     - Project URL
     - Anon (public) key
     - Service role key (show and copy)

3. **Update .env.local:**
   ```bash
   # Open .env.local and replace:
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # ADD THIS LINE
   ```

4. **Deploy Schema:**
   - In Supabase Dashboard, go to SQL Editor
   - Click "New query"
   - Copy entire contents of `/supabase/schema.sql`
   - Paste and click "Run"
   - Verify "Success. No rows returned"

5. **Run Migrations (in order):**
   - Copy contents of `/supabase/migrations/20251009000001_enhance_core_schema.sql`
   - Run in SQL Editor
   - Repeat for all 5 migration files in order

6. **Verify Tables:**
   - Go to Table Editor
   - You should see: profiles, subscriptions, stock_analyses, usage_tracking, etc.

7. **Configure Auth:**
   - Go to Authentication > Settings
   - Site URL: `http://localhost:3000` (change to production later)
   - Redirect URLs: Add `http://localhost:3000/auth/callback`
   - Save

### Step 2: Stripe Setup (30 min)

1. **Get API Keys:**
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy "Publishable key" (starts with pk_test_)
   - Click "Reveal test key" for Secret key (starts with sk_test_)

2. **Update .env.local:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

3. **Create Products (Automated):**
   ```bash
   # In your terminal
   npx tsx scripts/setup-stripe-products.ts
   ```

4. **Copy Price IDs:**
   - Script will output 3 price IDs
   - Copy them to .env.local:
   ```bash
   STRIPE_STARTER_PRICE_ID=price_xxxxx
   STRIPE_PRO_PRICE_ID=price_xxxxx
   STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
   ```

5. **Set Up Webhook (Local Testing):**
   ```bash
   # Install Stripe CLI (if not installed)
   brew install stripe/stripe-cli/stripe  # macOS
   # or download from https://stripe.com/docs/stripe-cli

   # Login
   stripe login

   # Forward webhooks
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

6. **Copy Webhook Secret:**
   - Stripe CLI will show: `whsec_xxxxx`
   - Copy to .env.local:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### Step 3: Validate (5 min)

```bash
# Run validation script
npx tsx scripts/check-env.ts --verbose

# Should show all green checks ✅
```

### Step 4: Test Build (5 min)

```bash
# Clean install
rm -rf .next node_modules
npm install

# Build
npm run build

# Should complete without errors
```

---

## Phase 2: Local Testing (1 hour)

### Test Checklist

```bash
# Start dev server
npm run dev

# In another terminal, keep Stripe webhook listener running
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

**Browser Tests:**

1. **Homepage (http://localhost:3000)**
   - [ ] Page loads without errors
   - [ ] All sections visible
   - [ ] Animations working
   - [ ] "Get Started" button works

2. **Pricing (http://localhost:3000/pricing)**
   - [ ] All 3 tiers displayed
   - [ ] Prices showing correctly
   - [ ] Features listed

3. **Sign Up Flow:**
   - [ ] Go to http://localhost:3000/auth/signup
   - [ ] Fill form (use real email you can access)
   - [ ] Click "Sign Up"
   - [ ] Check email for confirmation (if enabled)
   - [ ] Confirm email (click link)

4. **Login:**
   - [ ] Go to http://localhost:3000/auth/login
   - [ ] Enter credentials
   - [ ] Click "Log In"
   - [ ] Should redirect to /dashboard

5. **Dashboard:**
   - [ ] Welcome message shows
   - [ ] Stats display (should show 0)
   - [ ] Search bar present

6. **Stock Analysis:**
   - [ ] Type "AAPL" in search
   - [ ] Click search or press Enter
   - [ ] Navigate to /dashboard/analyze/AAPL
   - [ ] Charts load (with mock data)
   - [ ] Metrics display

7. **Payment Flow:**
   - [ ] Click "Upgrade" or go to /pricing
   - [ ] Click "Start Trial" on any plan
   - [ ] Checkout modal opens
   - [ ] Fill test card: `4242 4242 4242 4242`
   - [ ] Expiry: any future date
   - [ ] CVC: any 3 digits
   - [ ] ZIP: any 5 digits
   - [ ] Click "Subscribe"
   - [ ] Check Stripe CLI terminal - should show webhook received
   - [ ] Should redirect to /dashboard?success=true

8. **Verify Subscription:**
   - [ ] Go to Supabase Dashboard > Table Editor > subscriptions
   - [ ] Should see new row with your user_id
   - [ ] Check usage_tracking table - should have new row

9. **Logout:**
   - [ ] Click logout in dashboard
   - [ ] Should redirect to /auth/login
   - [ ] Try accessing /dashboard
   - [ ] Should redirect to /auth/login

10. **Password Reset (Optional):**
    - [ ] Go to /auth/forgot-password
    - [ ] Enter email
    - [ ] Check email for reset link
    - [ ] Click link
    - [ ] Enter new password

**All tests passing? Proceed to Phase 3.**

---

## Phase 3: Staging Deployment (1 hour)

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "feat: ready for deployment"
   git push origin main
   ```

3. **Deploy:**
   ```bash
   vercel
   # Follow prompts
   # Select: Yes to "Set up and deploy"
   # Select: No to "Link to existing project" (first time)
   # Accept defaults for framework and settings
   ```

4. **Add Environment Variables:**
   - Go to Vercel Dashboard > Project > Settings > Environment Variables
   - Add ALL variables from .env.local (except NEXT_PUBLIC_APP_URL)
   - For each variable:
     - Name: (e.g., NEXT_PUBLIC_SUPABASE_URL)
     - Value: (paste value)
     - Environment: Production, Preview, Development (select all)
   - Click "Add" for each

5. **Add Production URL:**
   - After deployment, copy the production URL (e.g., vortis-xxx.vercel.app)
   - Add environment variable:
     - Name: NEXT_PUBLIC_APP_URL
     - Value: https://vortis-xxx.vercel.app
   - Redeploy: `vercel --prod`

6. **Update Supabase:**
   - Go to Supabase > Authentication > URL Configuration
   - Site URL: https://vortis-xxx.vercel.app
   - Redirect URLs: Add https://vortis-xxx.vercel.app/auth/callback

7. **Update Stripe Webhook (Production):**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Endpoint URL: https://vortis-xxx.vercel.app/api/stripe/webhook
   - Select events:
     - checkout.session.completed
     - customer.subscription.created
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.paid
     - invoice.payment_failed
   - Click "Add endpoint"
   - Copy "Signing secret"
   - Add to Vercel environment variables:
     - Name: STRIPE_WEBHOOK_SECRET
     - Value: (new webhook secret)
   - Redeploy

8. **Test Staging:**
   - Visit https://vortis-xxx.vercel.app
   - Run through all tests from Phase 2
   - Verify everything works in production environment

### Option B: Deploy to Netlify

1. **Create netlify.toml:**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Push to GitHub:**
   ```bash
   git add netlify.toml
   git commit -m "feat: add netlify config"
   git push origin main
   ```

3. **Deploy:**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Connect to GitHub
   - Select vortis repository
   - Build settings should auto-detect
   - Click "Deploy site"

4. **Add Environment Variables:**
   - Go to Site settings > Environment variables
   - Add all variables from .env.local
   - Click "Save"
   - Trigger new deployment

5. **Update Supabase & Stripe:**
   - Follow steps 6-7 from Vercel instructions above
   - Use your Netlify URL instead

---

## Phase 4: Integrate Real Market Data (1-2 days)

**This phase can be done after staging deployment**

### Option A: Octagon MCP (Recommended)

1. **Configure Octagon MCP:**
   - Ensure Octagon MCP server is running
   - Test connection

2. **Update Analysis API:**
   ```typescript
   // File: /app/api/analyze/[ticker]/route.ts
   // Find the mock data section and replace with:

   import { octagonMcp } from '@/lib/octagon-mcp';

   async function getStockData(ticker: string) {
     try {
       const data = await octagonMcp.getStockData({
         ticker,
         includeFinancials: true,
         includeTechnicals: true,
         includeNews: true,
       });

       return data;
     } catch (error) {
       console.error('Octagon MCP error:', error);
       throw new Error('Failed to fetch stock data');
     }
   }
   ```

3. **Test Locally:**
   ```bash
   npm run dev
   # Visit /dashboard/analyze/AAPL
   # Should show real data now
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "feat: integrate Octagon MCP for real market data"
   git push origin main
   # Auto-deploys to Vercel/Netlify
   ```

### Option B: Alternative Data Providers

1. **Sign up for API key:**
   - Alpha Vantage: https://www.alphavantage.co/support/#api-key
   - Financial Modeling Prep: https://site.financialmodelingprep.com/developer/docs
   - Polygon.io: https://polygon.io

2. **Add API key to environment:**
   ```bash
   # .env.local
   ALPHA_VANTAGE_API_KEY=your_key
   # or
   FMP_API_KEY=your_key
   # or
   POLYGON_API_KEY=your_key
   ```

3. **Implement in API route:**
   ```typescript
   // Example with Alpha Vantage
   const response = await fetch(
     `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
   );
   const data = await response.json();
   ```

---

## Phase 5: Production Hardening (1-2 days)

### 1. Error Monitoring

```bash
# Install Sentry
npm install @sentry/nextjs

# Run setup
npx @sentry/wizard@latest -i nextjs

# Add DSN to environment variables
```

### 2. Analytics (Optional)

```bash
# Google Analytics
# Add to .env.local:
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# PostHog (alternative)
npm install posthog-js
```

### 3. Security Hardening

- [ ] Enable email verification in Supabase (production)
- [ ] Add rate limiting to API routes
- [ ] Review and tighten RLS policies
- [ ] Enable HTTPS only (should be automatic on Vercel)
- [ ] Set up CSP headers

### 4. Performance Optimization

- [ ] Run Lighthouse audit
- [ ] Optimize images (already using next/image)
- [ ] Enable caching strategy
- [ ] Consider Redis for API caching

### 5. Monitoring Setup

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure Vercel analytics
- [ ] Set up database backups (Supabase auto-backups)
- [ ] Create status page (optional)

---

## Phase 6: Production Launch

### Pre-Launch Checklist

- [ ] All tests passing
- [ ] Real market data working
- [ ] Error monitoring active
- [ ] Backups configured
- [ ] SSL certificate valid
- [ ] Custom domain configured (if applicable)
- [ ] DNS propagated
- [ ] Email sending working
- [ ] Payment processing tested in production
- [ ] Webhook delivery confirmed

### Switch to Live Stripe (When Ready)

1. **Get Live Keys:**
   - Go to https://dashboard.stripe.com/apikeys (switch to Live mode)
   - Copy live keys

2. **Update Environment:**
   - In Vercel/Netlify, update:
     - STRIPE_SECRET_KEY (live key)
     - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live key)

3. **Create Live Products:**
   ```bash
   # Update .env.local with live key first
   npx tsx scripts/setup-stripe-products.ts
   # Copy new live price IDs to production environment
   ```

4. **Update Live Webhook:**
   - Create new webhook in live mode
   - Update STRIPE_WEBHOOK_SECRET in production

### Launch!

```bash
# Make any final changes
git add .
git commit -m "feat: production launch"
git push origin main

# Auto-deploys to production
# Visit your domain and celebrate! 🎉
```

---

## Post-Launch Monitoring

### Week 1

- [ ] Monitor error rates (Sentry dashboard)
- [ ] Check Stripe webhook delivery (should be 100%)
- [ ] Monitor sign-up conversion rate
- [ ] Check payment success rate
- [ ] Review user feedback
- [ ] Monitor API response times
- [ ] Check database performance

### Month 1

- [ ] Review analytics data
- [ ] Analyze user behavior
- [ ] Identify drop-off points
- [ ] Optimize slow queries
- [ ] Address user feedback
- [ ] Plan feature improvements

---

## Troubleshooting

### Build Fails

**Error:** "supabaseKey is required"
**Fix:** Add SUPABASE_SERVICE_ROLE_KEY to environment

**Error:** ESLint warnings blocking build
**Fix:** Add to next.config.js:
```javascript
eslint: {
  ignoreDuringBuilds: true, // temporary
}
```

### Auth Not Working

**Check:**
- Supabase URL and keys correct in environment
- Redirect URLs configured in Supabase
- Site URL matches your domain
- Cookies enabled in browser

### Payments Failing

**Check:**
- Stripe keys are for correct mode (test vs live)
- Webhook secret matches the endpoint
- Webhook endpoint accessible from internet
- CORS not blocking requests

### Database Errors

**Check:**
- RLS policies enabled
- User has proper permissions
- Tables created successfully
- Indexes exist

---

## Quick Commands Reference

```bash
# Development
npm run dev                              # Start dev server
npm run build                            # Build for production
npm run lint                             # Run ESLint

# Environment
npx tsx scripts/check-env.ts             # Validate environment
npx tsx scripts/setup-stripe-products.ts # Create Stripe products

# Stripe
stripe login                             # Login to Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook  # Forward webhooks
stripe trigger checkout.session.completed # Test webhook

# Deployment
vercel                                   # Deploy to Vercel
vercel --prod                            # Deploy to production
vercel logs                              # View logs

# Git
git status                               # Check status
git add .                                # Stage all changes
git commit -m "feat: description"        # Commit with message
git push origin main                     # Push to GitHub
```

---

## Success Metrics

### Immediate (Day 1)
- [ ] Environment configured
- [ ] Local testing passing
- [ ] Staging deployed

### Short-term (Week 1)
- [ ] Real data integrated
- [ ] Production deployed
- [ ] First test user signed up
- [ ] First payment processed

### Medium-term (Month 1)
- [ ] 10+ active users
- [ ] 1+ paying customer
- [ ] < 1% error rate
- [ ] < 2s page load

---

## Estimated Timeline

| Phase | Duration | Blocking |
|-------|----------|----------|
| Environment Setup | 2 hours | Yes |
| Local Testing | 1 hour | Yes |
| Staging Deployment | 1 hour | Yes |
| Real Market Data | 1-2 days | No |
| Production Hardening | 1-2 days | No |
| Production Launch | 1 hour | Yes |

**Minimum to launch:** 4-5 hours (Phases 1-3)
**Recommended timeline:** 1-3 days (All phases)

---

## Support

**Documentation:**
- Full Report: `../reports/FINAL_VERIFICATION_REPORT.md`
- Next Steps: `../reports/NEXT_STEPS.md`
- Deployment Guide: `../reports/DEPLOYMENT_READY.md`

**Help:**
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs
- Vercel: https://vercel.com/docs
- Next.js: https://nextjs.org/docs

**Common Issues:**
See Troubleshooting section above

---

**You're ready to launch Vortis! Good luck! 🚀**

---

**Last Updated:** 2025-10-09
**Document Version:** 1.0
