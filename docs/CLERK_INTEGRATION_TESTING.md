# Clerk Integration Testing

End-to-end integration testing scenarios for Clerk authentication in Vortis.

## Overview

Integration testing verifies that Clerk authentication works seamlessly with all Vortis features including dashboard access, stock analysis, Stripe payments, and subscription management.

---

## 1. New User Complete Journey

### Scenario 1.1: First-Time User Flow

**Objective:** Complete end-to-end journey for new user

**User Story:**
> As a new user, I want to sign up, access the dashboard, perform stock analysis, and subscribe to a plan.

**Steps:**

**1. Sign-Up (0:00)**
- Navigate to https://vortis.com
- Click "Get Started" or "Sign Up"
- Click "Continue with Google"
- Complete Google OAuth
- Expected: Redirect to `/dashboard`

**2. Dashboard First Load (0:10)**
- Dashboard loads with user name/image
- Welcome message displays
- Navigation menu visible
- Expected: All UI elements load correctly

**3. Explore Dashboard (0:30)**
- View dashboard sections
- Check user profile dropdown
- View subscription status (Free/Trial)
- Expected: Default subscription visible

**4. Perform Stock Analysis (1:00)**
- Navigate to stock analysis page
- Enter ticker symbol (e.g., "AAPL")
- Run analysis
- View results
- Expected: Analysis runs successfully (may be rate-limited on free plan)

**5. View Pricing (2:00)**
- Navigate to `/pricing`
- View subscription tiers
- Select "Pro" plan
- Click "Subscribe"
- Expected: Redirects to Stripe checkout

**6. Complete Payment (3:00)**
- Enter test card: 4242 4242 4242 4242
- Exp: 12/34, CVC: 123
- Complete purchase
- Expected: Success, redirect back to dashboard

**7. Verify Subscription (3:30)**
- Dashboard shows "Pro" subscription
- Can perform unlimited stock analysis
- Pro features unlocked
- Expected: All pro features accessible

**8. Sign Out (4:00)**
- Click profile menu
- Click "Sign Out"
- Expected: Redirect to homepage

**9. Sign Back In (4:15)**
- Navigate to `/sign-in`
- Click "Continue with Google"
- Quick re-authentication
- Expected: Land on `/dashboard` with subscription intact

**Expected Results:**
- ✓ Complete flow takes < 5 minutes
- ✓ No errors encountered
- ✓ All data persists correctly
- ✓ Subscription works immediately
- ✓ Re-authentication preserves state

**Checklist:**
- [ ] Sign-up successful
- [ ] Clerk profile created
- [ ] Supabase profile created
- [ ] Dashboard accessible
- [ ] Stock analysis works
- [ ] Stripe checkout works
- [ ] Subscription syncs
- [ ] Pro features unlock
- [ ] Sign-out works
- [ ] Sign-in restores session
- [ ] No errors in console
- [ ] No network failures

---

## 2. Stock Analysis with Authentication

### Scenario 2.1: Authenticated Stock Analysis

**Objective:** Verify stock analysis requires and uses authentication

**Pre-conditions:**
- User signed in
- Has active subscription

**Steps:**

**Test Protected Route:**
```bash
# Without auth
curl -I http://localhost:3000/api/stocks/analyze

# Expected: 401 Unauthorized
```

**With Authentication:**
1. Sign in
2. Navigate to stock analysis page
3. Enter ticker: "MSFT"
4. Click "Analyze"
5. API call includes auth token
6. Analysis returns data
7. Results displayed

**Verify Auth Token Sent:**
```javascript
// In browser DevTools > Network
// Find API request to /api/stocks/analyze
// Check Request Headers:
// Authorization: Bearer <token>
```

**Expected Results:**
- ✓ Unauthenticated requests blocked
- ✓ Authenticated requests succeed
- ✓ Auth token included in API calls
- ✓ User ID associated with analysis
- ✓ Rate limiting based on user plan

**Database Verification:**
```sql
-- Check analysis logged with user
SELECT * FROM stock_analyses
WHERE clerk_id = 'user_2abc123def456'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- ✓ Analysis records tied to user
- ✓ Timestamp recorded
- ✓ Ticker saved
- ✓ Results cached

---

### Scenario 2.2: Rate Limiting by Subscription Tier

**Objective:** Verify rate limits based on user's subscription

**Test Free Tier:**
1. Sign in as free user
2. Perform 5 stock analyses (free limit)
3. Attempt 6th analysis
4. Expected: Rate limit error

**Test Pro Tier:**
1. Sign in as pro user
2. Perform 20+ stock analyses
3. Expected: All succeed, no rate limit

**Verification:**
```typescript
// API route should check:
const user = await currentUser();
const subscription = await getSubscription(user.id);

if (subscription.tier === 'free' && analysisCount >= 5) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

**Expected Results:**
- ✓ Free users limited to X analyses
- ✓ Pro users have higher limits
- ✓ Enterprise users unlimited
- ✓ Clear error message on limit reached
- ✓ Prompt to upgrade shown

---

## 3. Stripe Payment Integration

### Scenario 3.1: Subscribe to Paid Plan

**Objective:** Complete Stripe checkout flow with Clerk user

**Pre-conditions:**
- User signed in to Clerk
- Has Supabase profile

**Steps:**

**1. Initiate Checkout**
```typescript
// From pricing page
const response = await fetch('/api/stripe/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  }),
});

const { url } = await response.json();
window.location.href = url;
```

**2. Verify Checkout Session**
- Stripe checkout page loads
- User email pre-filled (from Clerk)
- Correct plan shown
- Correct price shown

**3. Complete Payment**
- Enter test card: 4242 4242 4242 4242
- Submit payment
- Stripe processes
- Redirects to success URL

**4. Webhook Processing**
- Stripe sends `checkout.session.completed` webhook
- Webhook handler:
  - Gets Clerk user ID from metadata
  - Creates subscription in Supabase
  - Links subscription to user profile

**5. Dashboard Update**
- Subscription badge shows "Pro"
- Pro features unlocked
- Subscription management available

**Expected Results:**
- ✓ Clerk user ID passed to Stripe
- ✓ Email pre-filled from Clerk
- ✓ Payment succeeds
- ✓ Webhook received and processed
- ✓ Subscription created in Supabase
- ✓ Subscription linked to correct user
- ✓ Dashboard updates immediately

**Verification:**
```sql
-- Check subscription created
SELECT *
FROM subscriptions
WHERE clerk_id = 'user_2abc123def456';

-- Expected:
clerk_id              | stripe_customer_id | stripe_subscription_id | status | plan
user_2abc123def456    | cus_abc123        | sub_xyz789             | active | pro
```

---

### Scenario 3.2: Subscription Management

**Objective:** User can manage existing subscription

**Steps:**

1. **Access Subscription Page**
   - Navigate to `/dashboard/subscription`
   - View current plan details
   - See billing date, amount, status

2. **Open Customer Portal**
   ```typescript
   const response = await fetch('/api/stripe/create-portal-session', {
     method: 'POST',
   });
   const { url } = await response.json();
   window.location.href = url;
   ```

3. **In Customer Portal:**
   - View subscription details
   - Can update payment method
   - Can upgrade/downgrade plan
   - Can cancel subscription

4. **Update Subscription**
   - Upgrade from Pro to Enterprise
   - Confirm change
   - Webhook `customer.subscription.updated` sent

5. **Verify Update**
   - Webhook updates Supabase
   - Dashboard reflects new plan
   - Enterprise features unlocked

**Expected Results:**
- ✓ Customer portal loads with correct user
- ✓ Subscription details accurate
- ✓ Can update payment method
- ✓ Plan changes sync to Supabase
- ✓ Dashboard updates correctly

---

## 4. User Profile Management

### Scenario 4.1: Update User Profile

**Objective:** Profile changes sync from Clerk to Supabase

**Steps:**

1. **View Profile**
   - Navigate to `/dashboard/settings`
   - Current name and image displayed

2. **Update in Clerk**
   - Go to Clerk User Button
   - Click "Manage Account"
   - Change first name
   - Upload new profile picture
   - Save

3. **Webhook Processing**
   - `user.updated` webhook sent
   - Webhook updates Supabase profile

4. **Verify Dashboard**
   - Refresh dashboard
   - New name visible
   - New image visible
   - All pages reflect changes

**Expected Results:**
- ✓ Changes saved in Clerk
- ✓ Webhook triggers
- ✓ Supabase profile updated
- ✓ Dashboard shows new data
- ✓ Sync completes < 3 seconds

---

## 5. Session Expiry Handling

### Scenario 5.1: Session Expiry During Activity

**Objective:** Handle session expiry gracefully

**Simulate:**
1. Sign in
2. Navigate to dashboard
3. Manually revoke session (Clerk dashboard)
4. Try to perform action (stock analysis)

**Expected Results:**
- ✓ Action fails with auth error
- ✓ Redirects to sign-in
- ✓ After re-sign-in, returns to intended page
- ✓ No data loss
- ✓ Clear error message

---

## 6. Multi-Tab Behavior

### Scenario 6.1: Sign-Out Syncs Across Tabs

**Objective:** Verify session state syncs across browser tabs

**Steps:**

1. **Open Multiple Tabs**
   - Tab 1: `/dashboard`
   - Tab 2: `/dashboard/settings`
   - Tab 3: Stock analysis page

2. **Sign Out in Tab 1**
   - Click sign-out
   - Tab 1 redirects to homepage

3. **Switch to Tab 2**
   - Try to navigate or interact
   - Should detect session ended

4. **Switch to Tab 3**
   - Try to run analysis
   - Should redirect to sign-in

**Expected Results:**
- ✓ All tabs detect sign-out
- ✓ All tabs redirect appropriately
- ✓ No stale authentication
- ✓ Consistent behavior

---

## 7. Error Scenarios

### Scenario 7.1: Webhook Failure Doesn't Block User

**Objective:** User can proceed even if webhook fails

**Simulate:**
1. Stop webhook endpoint (simulate server down)
2. Sign up new user
3. Clerk user created
4. Webhook fails (no Supabase profile)

**Verify:**
- User still signed in to Clerk
- Can access dashboard (with degraded features)
- Retry or backfill mechanism exists

**Recovery:**
1. Restore webhook endpoint
2. Clerk retries webhook
3. Profile created in Supabase
4. Full features restored

---

## 8. Mobile Responsiveness

### Scenario 8.1: Mobile Sign-Up Flow

**Objective:** Verify authentication works on mobile

**Devices to Test:**
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)

**Steps:**
1. Open Vortis on mobile
2. Tap "Sign Up"
3. Tap "Continue with Google"
4. Complete OAuth on mobile
5. Redirect back to app

**Expected Results:**
- ✓ OAuth flow works on mobile
- ✓ Redirect back to app works
- ✓ Dashboard mobile-responsive
- ✓ Can sign out on mobile
- ✓ Can sign back in

---

## 9. Cross-Browser Testing

### Scenario 9.1: Authentication Across Browsers

**Browsers to Test:**
- Chrome
- Firefox
- Safari
- Edge

**Test Each:**
1. Sign up flow
2. Sign in flow
3. Session persistence
4. Sign out
5. Dashboard access

**Expected Results:**
- ✓ Works in all browsers
- ✓ Consistent behavior
- ✓ No browser-specific bugs

---

## 10. Performance Under Load

### Scenario 10.1: Concurrent User Sign-Ups

**Objective:** Verify system handles multiple simultaneous sign-ups

**Simulate:**
```bash
# Create 10 test users concurrently
for i in {1..10}; do
  (
    # Sign up user via API or UI automation
    echo "Creating user $i"
  ) &
done
wait
```

**Verify:**
- All users created in Clerk
- All profiles created in Supabase
- No race conditions
- No duplicate profiles
- All data accurate

---

## 11. End-to-End Test Automation

**Test File:** `/Users/tannerosterkamp/vortis/tests/integration/clerk-e2e.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Clerk Integration E2E', () => {
  test('complete new user journey', async ({ page, context }) => {
    // 1. Sign up
    await page.goto('http://localhost:3000');
    await page.click('text=Sign Up');
    // Note: Google OAuth requires special handling or mocking

    // 2. Dashboard loads
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();

    // 3. Stock analysis
    await page.click('text=Stock Analysis');
    await page.fill('[data-testid="ticker-input"]', 'AAPL');
    await page.click('[data-testid="analyze-button"]');
    await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible();

    // 4. Subscription
    await page.click('text=Upgrade');
    // Stripe checkout would load here

    // 5. Sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sign Out');
    await expect(page).toHaveURL('/');
  });

  test('existing user sign-in and analysis', async ({ page }) => {
    // Mock existing user session
    await page.goto('http://localhost:3000/sign-in');
    // Complete sign-in

    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Perform analysis
    await page.click('text=Stock Analysis');
    await page.fill('[data-testid="ticker-input"]', 'MSFT');
    await page.click('[data-testid="analyze-button"]');

    // Verify results
    await expect(page.locator('[data-testid="analysis-results"]')).toContainText('MSFT');
  });
});
```

---

## 12. Integration Testing Checklist

**Before marking integration testing complete:**

### User Journey
- [ ] New user can sign up
- [ ] User redirected to dashboard
- [ ] Dashboard loads with user data
- [ ] Can perform stock analysis
- [ ] Can view pricing
- [ ] Can subscribe to plan
- [ ] Subscription works immediately
- [ ] Can sign out
- [ ] Can sign back in
- [ ] Session restores correctly

### Feature Integration
- [ ] Clerk auth protects routes
- [ ] Stock analysis requires auth
- [ ] Rate limiting works by tier
- [ ] Stripe checkout includes user data
- [ ] Subscriptions sync to Supabase
- [ ] Profile changes sync
- [ ] Subscription management works

### Data Consistency
- [ ] Clerk user → Supabase profile
- [ ] Stripe customer → Supabase subscription
- [ ] All IDs linked correctly
- [ ] No orphaned data
- [ ] Updates propagate correctly

### Error Handling
- [ ] Session expiry handled
- [ ] Webhook failures don't block user
- [ ] Network errors handled
- [ ] Clear error messages

### Performance
- [ ] Complete journey < 5 minutes
- [ ] No delays or hangs
- [ ] Webhooks process quickly
- [ ] Dashboard loads fast

### Cross-Platform
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works in all browsers
- [ ] Responsive design works

---

## 13. Next Steps

After completing integration testing:

1. **Performance Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_PERFORMANCE_TESTING.md`

2. **Security Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_SECURITY_TESTING.md`

3. **Manual Testing Guide**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_MANUAL_TESTING.md`
