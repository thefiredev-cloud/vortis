# Stripe Integration Testing Checklist

Comprehensive testing guide for Vortis Stripe subscription system.

## Pre-Testing Setup

### Environment Verification

- [ ] `.env.local` file exists in project root
- [ ] `STRIPE_SECRET_KEY` is set (starts with `sk_test_`)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set (starts with `pk_test_`)
- [ ] `STRIPE_WEBHOOK_SECRET` is set (starts with `whsec_`)
- [ ] All three `STRIPE_*_PRICE_ID` variables are set (start with `price_`)
- [ ] `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000`
- [ ] Supabase credentials are configured

### Service Verification

- [ ] Development server running: `npm run dev`
- [ ] Stripe CLI running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Can access: http://localhost:3000
- [ ] Can access pricing page: http://localhost:3000/pricing
- [ ] User account exists for testing

---

## Phase 1: Product Configuration

### Stripe Dashboard Verification

- [ ] Logged into Stripe Dashboard
- [ ] In **Test mode** (toggle in top-right)
- [ ] Navigate to **Products**
- [ ] "Vortis Starter" product exists
  - [ ] Price is $29.00/month
  - [ ] Recurring billing is enabled
  - [ ] Price ID copied and verified
- [ ] "Vortis Pro" product exists
  - [ ] Price is $99.00/month
  - [ ] Recurring billing is enabled
  - [ ] Price ID copied and verified
- [ ] "Vortis Enterprise" product exists
  - [ ] Price is $299.00/month
  - [ ] Recurring billing is enabled
  - [ ] Price ID copied and verified

### Price ID Verification

Run this command to verify price IDs are set:
```bash
cd /Users/tannerosterkamp/vortis
cat .env.local | grep STRIPE_.*_PRICE_ID
```

- [ ] All three price IDs are displayed
- [ ] All start with `price_`
- [ ] No placeholder values (e.g., `price_your_starter_price_id`)

---

## Phase 2: Checkout Flow Testing

### Test Starter Plan

1. Navigate to http://localhost:3000/pricing
2. Locate "Starter" plan card
3. Click "Get Started" button

**Expected behavior:**
- [ ] Redirects to Stripe Checkout
- [ ] Product name is "Vortis Starter"
- [ ] Price shows $29.00/month
- [ ] Email is pre-filled (if logged in)

4. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
   - Name: `Test User`

5. Click "Subscribe"

**Expected behavior:**
- [ ] Payment processes successfully
- [ ] Redirects to success page or dashboard
- [ ] URL contains `?success=true`
- [ ] Success message displayed

**Verify webhook received:**
- [ ] Stripe CLI shows `checkout.session.completed` event
- [ ] Stripe CLI shows `customer.subscription.created` event
- [ ] Stripe CLI shows `invoice.payment_succeeded` event
- [ ] No error messages in webhook logs

**Verify database:**
```sql
SELECT * FROM subscriptions
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC LIMIT 1;
```

- [ ] Record exists in `subscriptions` table
- [ ] `plan_name` is 'starter'
- [ ] `status` is 'active'
- [ ] `stripe_customer_id` starts with `cus_`
- [ ] `stripe_subscription_id` starts with `sub_`
- [ ] `current_period_start` is today
- [ ] `current_period_end` is ~30 days from now

```sql
SELECT * FROM usage_tracking
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC LIMIT 1;
```

- [ ] Record exists in `usage_tracking` table
- [ ] `plan_name` is 'starter'
- [ ] `analyses_used` is 0
- [ ] `analyses_limit` is 100

### Test Pro Plan

Repeat the above steps for Pro plan:

- [ ] Click "Get Started" on Pro plan
- [ ] Checkout shows "Vortis Pro"
- [ ] Price shows $99.00/month
- [ ] Payment succeeds with test card `4242 4242 4242 4242`
- [ ] Webhooks received
- [ ] Database record created with `plan_name` = 'pro'
- [ ] `analyses_limit` is -1 (unlimited)

### Test Enterprise Plan

Repeat the above steps for Enterprise plan:

- [ ] Click "Get Started" on Enterprise plan
- [ ] Checkout shows "Vortis Enterprise"
- [ ] Price shows $299.00/month
- [ ] Payment succeeds with test card `4242 4242 4242 4242`
- [ ] Webhooks received
- [ ] Database record created with `plan_name` = 'enterprise'
- [ ] `analyses_limit` is -1 (unlimited)

---

## Phase 3: Payment Scenarios

### Successful Payment (Already Tested)

Card: `4242 4242 4242 4242`
- [x] Payment succeeds
- [x] Subscription created

### 3D Secure Authentication

Card: `4000 0025 0000 3155`

- [ ] Checkout initiated
- [ ] 3D Secure modal appears
- [ ] Click "Complete" in modal
- [ ] Authentication succeeds
- [ ] Payment processes
- [ ] Subscription created

### Declined Payment

Card: `4000 0000 0000 9995`

- [ ] Checkout initiated
- [ ] Payment attempt made
- [ ] Error message appears: "Your card was declined"
- [ ] User remains on Checkout page
- [ ] No subscription created
- [ ] No webhook event received
- [ ] No database record created

### Insufficient Funds

Card: `4000 0000 0000 9995`

- [ ] Same behavior as declined payment above

### Expired Card

Card: `4000 0000 0000 0069`

- [ ] Checkout initiated
- [ ] Error message appears: "Your card has expired"
- [ ] Payment rejected
- [ ] No subscription created

---

## Phase 4: Webhook Event Handling

### Manual Event Triggering

Test each webhook event type manually:

**Checkout Completed:**
```bash
stripe trigger checkout.session.completed
```
- [ ] Event appears in Stripe CLI
- [ ] Dev server logs show event received
- [ ] No errors in logs

**Payment Succeeded:**
```bash
stripe trigger invoice.payment_succeeded
```
- [ ] Event received
- [ ] Subscription status updated to 'active'
- [ ] No errors

**Payment Failed:**
```bash
stripe trigger invoice.payment_failed
```
- [ ] Event received
- [ ] Subscription status updated to 'past_due'
- [ ] No errors

**Subscription Updated:**
```bash
stripe trigger customer.subscription.updated
```
- [ ] Event received
- [ ] Database record updated
- [ ] No errors

**Subscription Deleted:**
```bash
stripe trigger customer.subscription.deleted
```
- [ ] Event received
- [ ] Subscription status updated to 'canceled'
- [ ] No errors

### Webhook Endpoint Verification

Test webhook endpoint directly:

```bash
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'
```

- [ ] Returns status 400 (signature verification failed) - this is expected
- [ ] Does NOT return 404 (endpoint exists)
- [ ] Logs show signature verification error

### Webhook Security

- [ ] Webhook verifies signature before processing
- [ ] Invalid signatures are rejected with 400 status
- [ ] No sensitive data logged to console
- [ ] User metadata is validated before use

---

## Phase 5: Subscription Management

### Customer Portal Access

1. Complete a test subscription
2. Navigate to dashboard
3. Click "Manage Subscription" button

**Expected behavior:**
- [ ] Redirects to Stripe Customer Portal
- [ ] URL is `https://billing.stripe.com/p/session/test_*`
- [ ] Portal loads successfully
- [ ] Customer email is pre-filled
- [ ] Current subscription is displayed

### Update Payment Method

In Customer Portal:

1. Click "Update payment method"
2. Enter new test card: `5555 5555 5555 4444`
3. Click "Update"

**Expected behavior:**
- [ ] Payment method updates
- [ ] Confirmation message appears
- [ ] New card is shown as default

### View Invoices

In Customer Portal:

- [ ] Click "Invoices" or "Billing history"
- [ ] At least one invoice is listed
- [ ] Invoice shows correct amount
- [ ] Can download PDF invoice
- [ ] Invoice status is "Paid"

### Cancel Subscription

In Customer Portal:

1. Click "Cancel plan" or similar
2. Select cancellation reason (optional)
3. Confirm cancellation

**Expected behavior:**
- [ ] Confirmation modal appears
- [ ] After confirmation, subscription marked for cancellation
- [ ] Message shows: "Your subscription will end on [date]"
- [ ] Can still access features until period end

**Verify in database:**
```sql
SELECT status, cancel_at_period_end, current_period_end
FROM subscriptions
WHERE user_id = 'YOUR_USER_ID';
```

- [ ] `status` is still 'active'
- [ ] `cancel_at_period_end` is `true`
- [ ] `current_period_end` shows end date

**Verify webhook:**
- [ ] `customer.subscription.updated` event received
- [ ] Event data shows `cancel_at_period_end: true`

### Reactivate Subscription

In Customer Portal:

1. After canceling, look for "Reactivate" button
2. Click to reactivate

**Expected behavior:**
- [ ] Subscription reactivated
- [ ] `cancel_at_period_end` updated to `false`
- [ ] Confirmation message appears
- [ ] Webhook event received

---

## Phase 6: Edge Cases & Error Handling

### Unauthenticated User

1. Log out or open incognito window
2. Navigate to http://localhost:3000/pricing
3. Click "Get Started"

**Expected behavior:**
- [ ] Redirects to login page
- [ ] After login, redirects back to pricing or checkout
- [ ] Can complete checkout after authentication

### Expired Session

1. Start checkout flow
2. Let session sit idle for 30+ minutes
3. Try to complete payment

**Expected behavior:**
- [ ] Session expires
- [ ] Error message or redirect to restart
- [ ] No partial data created

### Duplicate Checkout Sessions

1. Create checkout session
2. Open in two browser tabs
3. Complete payment in first tab
4. Try to complete in second tab

**Expected behavior:**
- [ ] Second tab shows error or success (already completed)
- [ ] Only one subscription created
- [ ] No duplicate charges

### Missing Metadata

Test with invalid metadata by modifying checkout request:

**Expected behavior:**
- [ ] Checkout creation fails with validation error
- [ ] User sees error message
- [ ] No session created in Stripe
- [ ] No subscription created

### Database Connection Failure

Temporarily break database connection (e.g., wrong Supabase URL):

1. Create checkout session
2. Complete payment
3. Webhook fires

**Expected behavior:**
- [ ] Webhook returns 500 error
- [ ] Error logged in server console
- [ ] Stripe retries webhook (check Stripe dashboard)
- [ ] After fixing DB connection, retry succeeds

### Invalid Price ID

Set invalid price ID in `.env.local`:
```bash
STRIPE_STARTER_PRICE_ID=price_invalid
```

Restart server and try checkout:

**Expected behavior:**
- [ ] Checkout creation fails
- [ ] User sees error message
- [ ] Error logged to console
- [ ] No session created

---

## Phase 7: Performance & Security

### Performance Testing

**Checkout Speed:**
- [ ] Checkout page loads in < 2 seconds
- [ ] Stripe Checkout redirects in < 3 seconds
- [ ] Post-payment redirect completes in < 2 seconds

**Webhook Processing:**
- [ ] Webhook events process in < 500ms
- [ ] Database writes complete in < 1 second
- [ ] No timeout errors in logs

### Security Testing

**API Keys:**
- [ ] Secret key never exposed to client
- [ ] Publishable key only contains `pk_test_` or `pk_live_`
- [ ] No API keys in browser DevTools > Network
- [ ] No API keys in HTML source

**Webhook Signature:**
- [ ] All webhook requests verify signature
- [ ] Invalid signatures return 400
- [ ] No event processed without valid signature

**User Authorization:**
- [ ] Cannot create checkout for another user's ID
- [ ] Cannot access another user's subscription data
- [ ] Customer portal requires authentication
- [ ] RLS policies enforce user isolation

---

## Phase 8: Data Integrity

### Subscription Data Consistency

For each test subscription, verify all data matches:

**Stripe Dashboard:**
1. Navigate to **Customers**
2. Find test customer
3. Check subscription details

**Database:**
```sql
SELECT * FROM subscriptions WHERE stripe_customer_id = 'cus_xxx';
```

**Verify matches:**
- [ ] Customer ID
- [ ] Subscription ID
- [ ] Plan name
- [ ] Status
- [ ] Current period start
- [ ] Current period end
- [ ] Price ID

### Usage Tracking Accuracy

After creating subscription:

```sql
SELECT * FROM usage_tracking WHERE user_id = 'YOUR_USER_ID';
```

- [ ] Record created automatically
- [ ] `analyses_used` starts at 0
- [ ] `analyses_limit` matches plan (100 for Starter, -1 for Pro/Enterprise)
- [ ] `period_start` is today
- [ ] `period_end` is ~30 days from now

### Timestamp Accuracy

- [ ] All timestamps are in UTC
- [ ] `created_at` matches payment time
- [ ] `current_period_start` matches Stripe data
- [ ] `current_period_end` matches Stripe data

---

## Phase 9: User Experience

### Checkout Flow UX

- [ ] Pricing page loads quickly
- [ ] Plan features are clearly displayed
- [ ] Buttons have hover states
- [ ] Loading states show during checkout creation
- [ ] Stripe Checkout is mobile-responsive
- [ ] Can complete checkout on mobile device

### Post-Purchase UX

- [ ] Success message is clear and friendly
- [ ] Dashboard shows active subscription
- [ ] Usage stats are displayed correctly
- [ ] Can easily access Customer Portal
- [ ] Invoices are accessible

### Error Handling UX

- [ ] Payment errors show clear messages
- [ ] Network errors are handled gracefully
- [ ] User can retry failed payments
- [ ] No technical jargon in error messages
- [ ] Contact support info shown on errors

---

## Phase 10: Documentation Verification

- [ ] `/docs/STRIPE_PRODUCT_SETUP.md` is accurate
- [ ] `/docs/STRIPE_QUICK_START.md` works as described
- [ ] All commands in docs run without errors
- [ ] Screenshots (if any) match current UI
- [ ] Links to Stripe docs are valid
- [ ] Troubleshooting section covers encountered issues

---

## Final Checklist

Before deploying to production:

### Test Mode Completion
- [ ] All tests in this checklist pass
- [ ] No errors in console during normal flow
- [ ] Webhook events process successfully
- [ ] Database records are accurate
- [ ] Customer Portal works correctly

### Code Review
- [ ] No hardcoded API keys
- [ ] Environment variables properly used
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate (no sensitive data)
- [ ] TypeScript types are correct

### Production Readiness
- [ ] Live Stripe products created
- [ ] Live API keys obtained
- [ ] Production webhook endpoint created
- [ ] Production environment variables set
- [ ] SSL certificate valid
- [ ] Domain verified

### Monitoring Setup
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Webhook failure alerts configured
- [ ] Payment failure monitoring active
- [ ] Database performance monitored

---

## Test Results Log

**Test Date**: _______________
**Tester**: _______________
**Environment**: Test / Production

**Results Summary:**
- Total Tests: _____ / _____
- Passed: _____
- Failed: _____
- Skipped: _____

**Critical Issues Found:**
1.
2.
3.

**Non-Critical Issues:**
1.
2.
3.

**Notes:**


**Sign-off:**
- [ ] Ready for production deployment
- [ ] Needs additional testing
- [ ] Blocked by issues (list above)

---

**Last Updated**: 2025-10-09
**Version**: 1.0.0
