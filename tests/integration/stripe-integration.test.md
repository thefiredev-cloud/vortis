# Stripe Integration Test Plan

Comprehensive testing guide for Stripe payment integration in Vortis.

## Prerequisites

### Stripe Test Environment Setup

1. **Stripe Account**
   - [ ] Stripe test account created
   - [ ] Test mode enabled (toggle in top-right of dashboard)
   - [ ] Never use live keys during testing

2. **API Keys**
   - [ ] Secret key: `sk_test_...`
   - [ ] Publishable key: `pk_test_...`
   - [ ] Keys added to `.env.local`

3. **Products & Prices**
   - [ ] Three products created (Starter, Pro, Enterprise)
   - [ ] Price IDs added to `.env.local`
   - [ ] OR run: `npx tsx scripts/setup-stripe-products.ts`

4. **Webhook Endpoint**
   - [ ] Webhook created at `/api/stripe/webhook`
   - [ ] Webhook secret (`whsec_...`) added to `.env.local`
   - [ ] Events subscribed: `checkout.session.completed`, `customer.subscription.*`

---

## Test Suite 1: Product Setup

### Test 1.1: Verify Products Exist

**Steps:**
1. Visit Stripe Dashboard > Products
2. Verify products exist:
   - Starter Plan ($29/month)
   - Pro Plan ($99/month)
   - Enterprise Plan ($299/month)

**Verification:**
- [ ] All three products visible
- [ ] Correct pricing
- [ ] Recurring billing (monthly)
- [ ] Active status

---

### Test 1.2: Verify Price IDs

**Steps:**
1. Run environment validation:
   ```bash
   npx tsx scripts/check-env.ts --verbose
   ```

**Expected Results:**
- [ ] All price IDs start with `price_`
- [ ] No placeholder values
- [ ] Environment validation passes

---

## Test Suite 2: Checkout Flow

### Test 2.1: Create Checkout Session - Starter Plan

**Prerequisites:**
- User logged in as test user

**Steps:**
1. Navigate to `/pricing`
2. Click "Start Trial" on Starter plan
3. Observe redirect to Stripe Checkout

**Expected Results:**
- [ ] API call to `/api/stripe/checkout` succeeds
- [ ] Response includes `sessionId` and `url`
- [ ] Redirect to `checkout.stripe.com`
- [ ] Checkout page shows:
  - Correct plan (Starter - $29/month)
  - 7-day trial period
  - User email pre-filled
  - Payment form (card, billing address)

**Network Verification:**
```javascript
// Check Network tab
POST /api/stripe/checkout
Request: { "plan": "starter" }
Response: {
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

### Test 2.2: Complete Checkout - Success

**Steps:**
1. On Stripe Checkout page
2. Enter test card: `4242 4242 4242 4242`
3. Expiry: Any future date (e.g., `12/34`)
4. CVC: Any 3 digits (e.g., `123`)
5. ZIP: Any 5 digits (e.g., `12345`)
6. Click "Subscribe"

**Expected Results:**
- [ ] Payment processes successfully
- [ ] Redirect to `/dashboard?success=true`
- [ ] Success message displays
- [ ] Webhook received at `/api/stripe/webhook`
- [ ] Subscription created in database

**Database Verification:**
```sql
SELECT
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan_name,
  status,
  trial_end
FROM subscriptions
WHERE user_id = '[USER_ID]';
```

Expected data:
- `stripe_customer_id`: `cus_...`
- `stripe_subscription_id`: `sub_...`
- `plan_name`: `starter`
- `status`: `trialing` or `active`
- `trial_end`: 7 days from now

---

### Test 2.3: Complete Checkout - Cancellation

**Steps:**
1. Start checkout flow
2. On Stripe Checkout page, click back button or close tab

**Expected Results:**
- [ ] User returns to pricing page
- [ ] URL shows `/pricing?canceled=true`
- [ ] Message: "Checkout canceled" (if implemented)
- [ ] No subscription created
- [ ] No charge made

---

### Test 2.4: Checkout with Existing Customer

**Prerequisites:**
- User previously completed checkout (has `stripe_customer_id`)

**Steps:**
1. User subscribes to Starter plan
2. Cancels subscription
3. Starts new checkout for Pro plan

**Expected Results:**
- [ ] Existing `stripe_customer_id` reused
- [ ] No duplicate customer created
- [ ] Checkout shows saved payment methods (if any)
- [ ] Email pre-filled

**Code Coverage:**
```typescript
// Verify in /app/api/stripe/checkout/route.ts
// Lines 32-39: Check for existing customer
```

---

## Test Suite 3: Test Cards

### Test 3.1: Successful Payment Cards

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| 4242 4242 4242 4242 | Visa | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 3782 822463 10005 | Amex | Success |

**Steps for each:**
1. Complete checkout with test card
2. Verify successful payment

---

### Test 3.2: Declined Payment Cards

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| 4000 0000 0000 0002 | Declined | Card declined error |
| 4000 0000 0000 9995 | Insufficient funds | Insufficient funds error |
| 4000 0000 0000 0069 | Expired card | Expired card error |

**Steps for each:**
1. Complete checkout with test card
2. Verify error displays
3. User remains on checkout page
4. No subscription created

---

### Test 3.3: Special Test Cards

| Card Number | Description | Expected Result |
|-------------|-------------|-----------------|
| 4000 0025 0000 3155 | Requires authentication (3D Secure) | Modal prompt for authentication |
| 4000 0000 0000 0341 | Charge succeeds, dispute later | Success (can test disputes) |

**Steps:**
1. Use card requiring authentication
2. Complete 3D Secure flow
3. Verify payment succeeds after authentication

---

## Test Suite 4: Webhooks

### Test 4.1: Webhook Setup Verification

**Steps:**
1. Visit Stripe Dashboard > Developers > Webhooks
2. Locate webhook endpoint
3. Check configuration

**Verification:**
- [ ] Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
- [ ] Status: Enabled
- [ ] Events subscribed:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

---

### Test 4.2: Test Webhook Locally (Stripe CLI)

**Setup:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Steps:**
1. Run local dev server: `npm run dev`
2. Run Stripe CLI forward command
3. Complete a test checkout
4. Observe webhook events in terminal

**Expected Results:**
- [ ] Webhook events displayed in CLI
- [ ] Server receives and processes events
- [ ] Status: `200 OK`
- [ ] Database updated correctly

---

### Test 4.3: Webhook Signature Verification

**Steps:**
1. Send webhook without valid signature:
```bash
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "checkout.session.completed", "data": {}}'
```

**Expected Results:**
- [ ] Webhook rejected
- [ ] Error: Invalid signature
- [ ] Status: `400 Bad Request`
- [ ] No database changes

---

### Test 4.4: Webhook Event Handling

**Test Events:**

| Event | Trigger | Expected Database Update |
|-------|---------|--------------------------|
| `checkout.session.completed` | Complete checkout | Insert new subscription |
| `customer.subscription.updated` | Change plan | Update subscription record |
| `customer.subscription.deleted` | Cancel subscription | Set status to 'canceled' |
| `invoice.payment_succeeded` | Successful payment | Update billing period |
| `invoice.payment_failed` | Failed payment | Set status to 'past_due' |

**Steps:**
1. Use Stripe CLI to trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

2. Verify database updates after each event

---

## Test Suite 5: Subscription Management

### Test 5.1: View Active Subscription

**Prerequisites:**
- User has active subscription

**Steps:**
1. Log in as subscribed user
2. Navigate to `/dashboard`
3. View subscription details

**Expected Results:**
- [ ] Current plan displayed (Starter/Pro/Enterprise)
- [ ] Billing period shown (e.g., "Renews on Jan 15, 2025")
- [ ] Trial status shown (if applicable)
- [ ] "Manage Subscription" button visible

---

### Test 5.2: Access Customer Portal

**Steps:**
1. On dashboard, click "Manage Subscription"
2. API call to `/api/stripe/portal` or `/api/stripe/create-portal`
3. Redirect to Stripe Customer Portal

**Expected Results:**
- [ ] Redirect to `billing.stripe.com/p/session/...`
- [ ] Portal shows:
  - Current subscription
  - Payment method
  - Billing history
  - Invoice downloads
  - Update payment method option
  - Cancel subscription option

**Network Verification:**
```javascript
POST /api/stripe/portal
Response: {
  "url": "https://billing.stripe.com/p/session/..."
}
```

---

### Test 5.3: Update Payment Method

**Steps:**
1. Access Customer Portal (Test 5.2)
2. Click "Update payment method"
3. Enter new test card: `5555 5555 5555 4444`
4. Save changes

**Expected Results:**
- [ ] Payment method updated in Stripe
- [ ] Confirmation message in portal
- [ ] Next invoice will use new card

**Verification in Stripe Dashboard:**
- Customer > Payment methods
- Should show new card ending in 4444

---

### Test 5.4: Change Subscription Plan

**Steps:**
1. User has Starter plan
2. Navigate to `/pricing`
3. Click "Upgrade" on Pro plan
4. Complete checkout

**Expected Results:**
- [ ] Subscription upgraded immediately
- [ ] Prorated charge for difference
- [ ] Webhook: `customer.subscription.updated`
- [ ] Database: `plan_name` updated to 'pro'

**Verification:**
```sql
SELECT plan_name, status, current_period_end
FROM subscriptions
WHERE user_id = '[USER_ID]';
-- plan_name should be 'pro'
```

---

### Test 5.5: Cancel Subscription

**Steps:**
1. Access Customer Portal
2. Click "Cancel subscription"
3. Confirm cancellation
4. Select reason (optional)
5. Complete cancellation

**Expected Results:**
- [ ] Subscription canceled (end of billing period)
- [ ] Confirmation email sent
- [ ] Webhook: `customer.subscription.updated` (cancel_at_period_end: true)
- [ ] Access maintained until period end
- [ ] Database: status updated

**Immediate Cancellation Test:**
- [ ] Cancel subscription immediately
- [ ] Access revoked immediately
- [ ] Webhook: `customer.subscription.deleted`
- [ ] Database: status = 'canceled'

---

## Test Suite 6: Trial Periods

### Test 6.1: Start Trial

**Steps:**
1. New user signs up
2. Subscribes to any plan
3. Receives 7-day trial

**Expected Results:**
- [ ] No charge at checkout
- [ ] `trial_end` set to 7 days from now
- [ ] Status: `trialing`
- [ ] Full access to features during trial

**Database Verification:**
```sql
SELECT
  status,
  trial_end,
  current_period_start
FROM subscriptions
WHERE user_id = '[USER_ID]';

-- status should be 'trialing'
-- trial_end should be ~7 days from now
```

---

### Test 6.2: Trial Ends Successfully

**Steps:**
1. Wait for trial to end (or manually adjust trial_end)
2. Stripe automatically charges card

**Expected Results:**
- [ ] Webhook: `invoice.payment_succeeded`
- [ ] Status changes from `trialing` to `active`
- [ ] User charged full amount
- [ ] Access continues uninterrupted

---

### Test 6.3: Trial Ends - Payment Failed

**Steps:**
1. Start trial with card that will decline
2. Wait for trial to end

**Expected Results:**
- [ ] Webhook: `invoice.payment_failed`
- [ ] Status: `past_due`
- [ ] User receives email notification
- [ ] Access may be restricted (depending on settings)
- [ ] Stripe retries payment (configurable)

---

## Test Suite 7: Failed Payments

### Test 7.1: Renewal Payment Fails

**Steps:**
1. User has active subscription
2. Card on file expires or is declined
3. Renewal date arrives

**Expected Results:**
- [ ] Webhook: `invoice.payment_failed`
- [ ] Status: `past_due`
- [ ] Email sent to user
- [ ] Stripe retries payment (default: 4 attempts over 2 weeks)
- [ ] User can update payment method

---

### Test 7.2: Update Payment Method After Failure

**Steps:**
1. Payment failed (Test 7.1)
2. User accesses Customer Portal
3. Updates payment method
4. Stripe retries payment

**Expected Results:**
- [ ] Payment succeeds with new card
- [ ] Status: `active`
- [ ] Webhook: `invoice.payment_succeeded`
- [ ] Access restored

---

## Test Suite 8: Refunds & Disputes

### Test 8.1: Issue Refund

**Steps:**
1. Locate payment in Stripe Dashboard
2. Click "Refund"
3. Select full or partial refund
4. Confirm refund

**Expected Results:**
- [ ] Refund processed
- [ ] Webhook: `charge.refunded`
- [ ] Subscription status depends on settings:
  - May remain active until period end
  - OR cancel immediately

---

### Test 8.2: Handle Dispute

**Steps:**
1. Use test card: `4000 0000 0000 0259` (creates dispute)
2. Complete payment
3. Dispute automatically created

**Expected Results:**
- [ ] Webhook: `charge.dispute.created`
- [ ] Notification sent to admin
- [ ] Funds held by Stripe
- [ ] Can respond to dispute in dashboard

---

## Test Suite 9: Security & Validation

### Test 9.1: Unauthorized API Access

**Steps:**
1. Log out or use incognito window
2. Attempt to call `/api/stripe/checkout`:
```bash
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan": "pro"}'
```

**Expected Results:**
- [ ] Status: `401 Unauthorized`
- [ ] Error: "Unauthorized"
- [ ] No checkout session created

---

### Test 9.2: Invalid Plan Name

**Steps:**
1. Log in as valid user
2. Call checkout API with invalid plan:
```bash
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: [AUTH_COOKIES]" \
  -d '{"plan": "invalid_plan"}'
```

**Expected Results:**
- [ ] Status: `400 Bad Request`
- [ ] Error: "Invalid plan"
- [ ] No checkout session created

---

### Test 9.3: Webhook Replay Attack

**Steps:**
1. Capture valid webhook payload
2. Replay same webhook 2+ times

**Expected Results:**
- [ ] Stripe signature prevents replay
- [ ] OR idempotency keys prevent duplicate processing
- [ ] Database not updated twice

---

## Test Suite 10: Edge Cases

### Test 10.1: Rapid Subscription Changes

**Steps:**
1. Subscribe to Starter
2. Immediately upgrade to Pro
3. Immediately upgrade to Enterprise
4. Immediately cancel

**Expected Results:**
- [ ] All webhooks processed in order
- [ ] Final state correct (canceled Enterprise)
- [ ] Prorated charges calculated correctly
- [ ] No race conditions

---

### Test 10.2: User Deletes Account

**Steps:**
1. User has active subscription
2. User deletes account (if feature exists)

**Expected Results:**
- [ ] Subscription canceled in Stripe
- [ ] Customer record retained (for Stripe compliance)
- [ ] User data deleted per policy
- [ ] No orphaned subscriptions

---

### Test 10.3: Concurrent Checkouts

**Steps:**
1. Open two browser tabs
2. Start checkout in both tabs simultaneously
3. Complete both checkouts

**Expected Results:**
- [ ] Only one subscription created (most recent)
- [ ] OR both subscriptions created if different plans
- [ ] No duplicate customers

---

## Test Suite 11: Monitoring & Logs

### Test 11.1: Stripe Dashboard Logs

**Steps:**
1. Visit Stripe Dashboard > Developers > Logs
2. Filter by recent events

**Verification:**
- [ ] All API calls logged
- [ ] Request/response bodies visible
- [ ] Errors clearly identified
- [ ] Webhooks delivery status shown

---

### Test 11.2: Application Logs

**Steps:**
1. Check server logs during Stripe operations
2. Look for custom log statements

**Expected Results:**
- [ ] Stripe API calls logged
- [ ] Webhook events logged
- [ ] Errors logged with context
- [ ] No sensitive data (full card numbers, secrets)

**Example Log Format:**
```
[2025-01-15 10:30:45] Stripe checkout initiated: plan=pro, user=user_123
[2025-01-15 10:31:02] Stripe checkout completed: session=cs_test_abc123
[2025-01-15 10:31:05] Webhook received: checkout.session.completed
[2025-01-15 10:31:06] Subscription created: sub_xyz789
```

---

## Test Suite 12: Performance

### Test 12.1: Checkout Creation Speed

**Metrics:**
- Target: < 1 second to create checkout session

**Steps:**
1. Click "Subscribe" button
2. Measure time until redirect

**Expected Results:**
- [ ] Checkout session created quickly
- [ ] Loading state displays immediately
- [ ] No timeout errors

---

### Test 12.2: Webhook Processing Speed

**Metrics:**
- Target: < 500ms to process webhook

**Steps:**
1. Send test webhook
2. Measure processing time in logs

**Expected Results:**
- [ ] Webhook acknowledged within 500ms
- [ ] Database updated within 1 second
- [ ] Stripe receives 200 OK promptly (prevents retries)

---

## Automated Testing Recommendations

### API Tests (Jest)

```typescript
describe('POST /api/stripe/checkout', () => {
  it('creates checkout session for authenticated user', async () => {
    const response = await request(app)
      .post('/api/stripe/checkout')
      .set('Cookie', validAuthCookie)
      .send({ plan: 'starter' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sessionId');
    expect(response.body.sessionId).toMatch(/^cs_test_/);
  });

  it('rejects unauthenticated requests', async () => {
    const response = await request(app)
      .post('/api/stripe/checkout')
      .send({ plan: 'starter' });

    expect(response.status).toBe(401);
  });
});
```

### Webhook Tests

```typescript
describe('POST /api/stripe/webhook', () => {
  it('processes checkout.session.completed event', async () => {
    const event = constructTestEvent('checkout.session.completed');
    const signature = generateStripeSignature(event);

    const response = await request(app)
      .post('/api/stripe/webhook')
      .set('stripe-signature', signature)
      .send(event);

    expect(response.status).toBe(200);

    // Verify database updated
    const subscription = await db.subscriptions.findByUserId(userId);
    expect(subscription.status).toBe('active');
  });
});
```

---

## Stripe CLI Commands Reference

```bash
# Login to Stripe
stripe login

# List products
stripe products list

# List prices
stripe prices list

# Create test customer
stripe customers create --email="test@example.com"

# Create test subscription
stripe subscriptions create \
  --customer=cus_xxx \
  --items[0][price]=price_xxx

# Trigger webhook events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# Listen to webhooks locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# View webhook logs
stripe webhooks logs

# Test webhook endpoint
stripe webhooks test --endpoint-id=we_xxx
```

---

## Pre-Production Checklist

Before going live with Stripe:

- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real card (small amount)
- [ ] Verify webhooks in production environment
- [ ] Set up email receipts
- [ ] Configure retry logic for failed payments
- [ ] Set up monitoring (Sentry, DataDog, etc.)
- [ ] Review Stripe Dashboard settings:
  - [ ] Branding (logo, colors)
  - [ ] Email receipts enabled
  - [ ] Customer portal branding
  - [ ] Dispute notifications
- [ ] Tax settings configured (if applicable)
- [ ] Compliance requirements met (PCI, etc.)
- [ ] Backup/disaster recovery plan
- [ ] Load testing completed

---

## Troubleshooting

### Common Issues

**Webhook not received:**
- Check webhook URL is publicly accessible
- Verify webhook secret in `.env.local`
- Check Stripe Dashboard > Webhooks > Delivery attempts
- Ensure server returns 200 OK quickly

**Payment fails in test mode:**
- Use correct test card numbers
- Check Stripe Dashboard > Logs for error details
- Verify API keys are test keys (`sk_test_`, `pk_test_`)

**Database not updating:**
- Check webhook is processing successfully
- Verify database connection
- Check for errors in server logs
- Ensure database schema matches expectations

**Customer created twice:**
- Check for race conditions in checkout flow
- Verify code checks for existing customer_id
- Review logic in `/app/api/stripe/checkout/route.ts`

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Stripe Testing**: https://stripe.com/docs/testing
- **Webhook Guide**: https://stripe.com/docs/webhooks
- **Customer Portal**: https://stripe.com/docs/billing/subscriptions/customer-portal

---

## Test Execution Log Template

| Test ID | Date | Result | Time | Notes |
|---------|------|--------|------|-------|
| 2.1 | 2025-01-15 | PASS | 5s | Checkout created successfully |
| 2.2 | 2025-01-15 | PASS | 8s | Payment succeeded, webhook received |
| 5.5 | 2025-01-15 | FAIL | - | Cancellation not updating status, investigating |

---

End of Stripe Integration Test Plan
