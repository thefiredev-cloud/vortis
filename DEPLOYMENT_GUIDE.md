# Vortis Deployment Guide

Complete guide to deploying Vortis to production.

---

## 📋 Pre-Deployment Checklist

### 1. Code Quality ✅
- [x] All security vulnerabilities fixed (happy-dom updated to 20.0.8)
- [x] Build passes successfully
- [x] 76/87 tests passing (88% pass rate)
- [x] All Stripe webhook tests passing
- [x] TypeScript compilation successful

### 2. Environment Setup ⚠️
- [ ] Database migrations applied (see below)
- [ ] Environment variables configured
- [ ] API keys validated
- [ ] Webhooks configured

### 3. Documentation ✅
- [x] `.env.example` created
- [x] Migration instructions documented
- [x] Production deployment guide available

---

## 🗄️ Database Setup (Required)

### Step 1: Apply Migrations via Supabase Dashboard

**Time Required**: 15-20 minutes

**Instructions**:
1. Navigate to: https://supabase.com/dashboard/project/bgywvwxqrijncqgdwsle
2. Click **SQL Editor** in the left sidebar
3. Apply the following migrations **in order**:

#### Migration 1: Core Schema Enhancements
```bash
File: supabase/migrations/20251009000001_enhance_core_schema.sql
```
- Adds: trial_start, trial_end, metadata to subscriptions
- Adds: company_name, phone, timezone, email_verified, last_login to profiles
- Adds: tags, sentiment, is_favorite, notes to stock_analyses
- Creates optimized indexes

**Verification**:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'subscriptions' AND column_name IN ('trial_start', 'trial_end', 'metadata');
-- Should return 3 rows
```

#### Migration 2: API Usage Tracking
```bash
File: supabase/migrations/20251009000002_create_api_usage_table.sql
```
- Creates: api_usage table
- Adds: check_rate_limit() function
- Adds: get_api_usage_stats() function

**Verification**:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'api_usage';
-- Should return 1 row
```

#### Migration 3: User Preferences
```bash
File: supabase/migrations/20251009000003_create_user_preferences_table.sql
```
- Creates: user_preferences table
- Adds: Auto-initialization trigger
- Adds: get_user_preferences() function

**Verification**:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'get_user_preferences';
-- Should return 1 row
```

#### Migration 4: Watchlist Alerts
```bash
File: supabase/migrations/20251009000004_create_watchlist_alerts_table.sql
```
- Creates: watchlist_alerts table
- Adds: check_watchlist_alerts() function
- Supports: Price, volume, and percent change alerts

**Verification**:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'watchlist_alerts';
-- Should return 1 row
```

#### Migration 5: Admin Views & Functions
```bash
File: supabase/migrations/20251009000005_create_admin_views_functions.sql
```
- Creates: subscription_analytics materialized view
- Adds: calculate_mrr() function
- Adds: get_churn_analytics() function
- Adds: cleanup_old_api_logs() function

**Verification**:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'subscription_analytics' AND table_type = 'MATERIALIZED VIEW';
-- Should return 1 row
```

#### Migration 6: Clerk Database Functions
```bash
File: supabase/migrations/20250109_clerk_database_functions.sql
```
- Creates: upsert_user_from_clerk() function
- Creates: delete_user_from_clerk() function

**Verification**:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name IN ('upsert_user_from_clerk', 'delete_user_from_clerk');
-- Should return 2 rows
```

### Step 2: Verify All Tables Exist

Run this query to verify all tables were created:

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Output** (minimum 8 tables):
- api_usage
- profiles
- stock_analyses
- subscriptions
- usage_tracking
- user_preferences
- watchlist
- watchlist_alerts

---

## 🔑 Environment Variables

### Step 3: Configure Production Environment

Use `.env.example` as a template. Set the following in your deployment platform (Netlify, Vercel, etc.):

#### Authentication (Clerk)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Get from**: https://dashboard.clerk.com

#### Database (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bgywvwxqrijncqgdwsle.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

**Get from**: https://supabase.com/dashboard/project/bgywvwxqrijncqgdwsle/settings/api

#### Payments (Stripe)
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

**Setup Process**:
1. Go to https://dashboard.stripe.com
2. Switch to **Live Mode** (toggle in sidebar)
3. Get API keys from: https://dashboard.stripe.com/apikeys
4. Create products: https://dashboard.stripe.com/products
5. Create prices for each product (Starter: $29/mo, Pro: $99/mo, Enterprise: $299/mo)
6. Copy price IDs to environment variables

#### Application
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🔗 Webhook Configuration

### Step 4: Configure Stripe Webhooks

1. Navigate to: https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Set Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy **Signing secret** to `STRIPE_WEBHOOK_SECRET`

### Step 5: Configure Clerk Webhooks

1. Navigate to: https://dashboard.clerk.com/apps/[your-app]/webhooks
2. Click **Add Endpoint**
3. Set Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
4. Select events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy **Signing secret** to `CLERK_WEBHOOK_SECRET`

---

## 🚀 Deployment

### Option 1: Netlify (Recommended - Already Configured)

The project includes Netlify configuration (`netlify.toml`).

**Steps**:
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy!

**Build Settings**:
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 22.x

### Option 2: Vercel

**Steps**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
# ... (repeat for all env vars)
```

### Option 3: Self-Hosted

**Requirements**:
- Node.js 22+
- PM2 or similar process manager

**Steps**:
```bash
# Build
npm run build

# Start
npm start

# Or with PM2
pm2 start npm --name "vortis" -- start
```

---

## ✅ Post-Deployment Verification

### Step 6: Verify Deployment

#### Test 1: Homepage Loads
```bash
curl https://your-domain.com
# Should return 200 OK
```

#### Test 2: Authentication Works
1. Navigate to `/dashboard`
2. Should redirect to Clerk sign-in
3. Sign in with test account
4. Should redirect back to dashboard

#### Test 3: Rate Limiting Works
```bash
# Test analyze endpoint (10 per hour limit)
for i in {1..15}; do
  curl -X POST https://your-domain.com/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"ticker":"AAPL"}' \
    -i | grep -E "(HTTP|X-RateLimit)"
done

# Expected:
# - First 10 requests: HTTP 200
# - Requests 11-15: HTTP 429
# - X-RateLimit-Remaining header decreases
```

#### Test 4: Database Connection
1. Sign in to application
2. Run a stock analysis
3. Check Supabase dashboard for new row in `stock_analyses` table

#### Test 5: Webhooks Working
```bash
# Test Stripe webhook
stripe trigger checkout.session.completed

# Check logs for successful processing
```

---

## 📊 Monitoring & Maintenance

### Step 7: Set Up Monitoring

**Metrics to Track**:
- API response times
- Rate limit hit rate (should be < 5%)
- Database query performance
- Error rates
- User sign-ups and conversions

**Recommended Tools**:
- Vercel Analytics (if using Vercel)
- Netlify Analytics (if using Netlify)
- Sentry for error tracking
- Supabase Dashboard for database monitoring

### Maintenance Schedule

**Daily**:
- Monitor error logs
- Check rate limit violations

**Weekly**:
```sql
-- Clean up old API logs
SELECT cleanup_old_api_logs(90);
```

**Monthly**:
```sql
-- Refresh subscription analytics
SELECT refresh_subscription_analytics();

-- Review churn analytics
SELECT * FROM get_churn_analytics(30);
```

---

## 🔒 Security Checklist

### Step 8: Security Verification

- [ ] All API routes have rate limiting
- [ ] Stripe webhooks verify signatures
- [ ] Clerk webhooks verify signatures
- [ ] RLS (Row Level Security) enabled on all tables
- [ ] Service role key not exposed to client
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Environment variables not committed to git

---

## 🐛 Troubleshooting

### Issue: Build Fails
**Solution**: Ensure all environment variables are set. The build can succeed without them, but features will be disabled.

### Issue: Database Connection Fails
**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is valid
3. Ensure Supabase project is not paused

### Issue: Authentication Not Working
**Solution**:
1. Verify Clerk publishable key starts with `pk_live_` or `pk_test_`
2. Check Clerk secret key is set correctly
3. Ensure allowed URLs are configured in Clerk dashboard

### Issue: Rate Limiting Not Working
**Solution**:
1. Check that rate limiter is initialized in route handlers
2. Verify headers (`x-forwarded-for`) are being passed by your hosting platform
3. Review logs for rate limit violations

### Issue: Webhooks Failing
**Solution**:
1. Verify webhook signatures are being validated
2. Check webhook secrets are correct
3. Ensure endpoint URLs are publicly accessible
4. Review webhook logs in Stripe/Clerk dashboard

---

## 📈 Performance Optimization

### Optional: Upgrade to Redis Rate Limiting

**When to Upgrade**:
- Running multiple instances (horizontal scaling)
- Memory usage for rate limiting > 100MB
- Need rate limits to persist across restarts

**Setup** (Upstash Redis):
1. Create account at https://upstash.com
2. Create Redis database
3. Add to environment variables:
   ```bash
   UPSTASH_REDIS_REST_URL=https://...upstash.io
   UPSTASH_REDIS_REST_TOKEN=...
   ```
4. Uncomment Redis implementation in `lib/rate-limit.ts`
5. Redeploy

---

## 🎯 Success Criteria

Deployment is successful when:

- ✅ Homepage loads without errors
- ✅ User can sign up/sign in via Clerk
- ✅ Stock analysis works and saves to database
- ✅ Rate limiting is enforced (429 after limit)
- ✅ Payments work (test with Stripe test mode first)
- ✅ Webhooks process successfully
- ✅ No console errors in browser
- ✅ Build completes in < 2 minutes
- ✅ Page load time < 3 seconds

---

## 📚 Additional Resources

- **Production Guide**: `/docs/PRODUCTION_DEPLOYMENT.md`
- **Rate Limiting**: `/docs/RATE_LIMITING.md`
- **Environment Setup**: `/docs/ENVIRONMENT_SETUP.md`
- **Migration Guide**: `/supabase/migrations/README.md`
- **Quick Start**: `/docs/quickstart/QUICK_START.md`

---

## 🆘 Support

**Need Help?**
1. Check logs in your hosting platform dashboard
2. Review Supabase logs for database errors
3. Check Clerk dashboard for auth issues
4. Review Stripe dashboard for payment issues
5. Consult project documentation in `/docs`

---

**Deployment Timeline**: 1-2 hours (including database setup and testing)

**Last Updated**: October 25, 2025
