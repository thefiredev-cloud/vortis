# Clerk Authentication Testing Checklist

Complete testing checklist for Clerk integration in Vortis.

## Pre-Testing Setup

### Environment Configuration

- [ ] `.env.local` exists with all required variables
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- [ ] `CLERK_SECRET_KEY` is set
- [ ] `CLERK_WEBHOOK_SECRET` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Development server running: `npm run dev`

### Database Verification

- [ ] Supabase migration applied successfully
- [ ] `profiles` table has `id` as TEXT column
- [ ] RLS policies updated for service role
- [ ] No auth triggers from Supabase Auth remain

### Clerk Dashboard Configuration

- [ ] Application created in Clerk Dashboard
- [ ] Google OAuth enabled
- [ ] Webhook endpoint configured
- [ ] Webhook subscribed to: user.created, user.updated, user.deleted
- [ ] Test mode keys being used for development

## Authentication Flow Tests

### Test 1: Sign Up with Google (New User)

**Steps:**
1. Open incognito/private browser window
2. Navigate to `http://localhost:3000/auth/signup`
3. Click "Continue with Google"
4. Select/enter Google account credentials
5. Complete OAuth consent screen
6. Wait for redirect

**Expected Results:**
- [ ] Clerk Google OAuth screen appears
- [ ] OAuth flow completes without errors
- [ ] Redirected to `/dashboard` after success
- [ ] User sees their name/avatar in dashboard
- [ ] Profile created in Supabase `profiles` table

**Verification Query:**
```sql
SELECT id, email, full_name, avatar_url, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- [ ] Record exists with Clerk user ID (format: `user_xxxxx`)
- [ ] Email matches Google account
- [ ] `full_name` populated
- [ ] `avatar_url` contains Google profile image
- [ ] `created_at` is recent

### Test 2: Sign In with Google (Existing User)

**Steps:**
1. Sign out if logged in
2. Navigate to `http://localhost:3000/auth/login`
3. Click "Continue with Google"
4. Select same Google account from Test 1
5. Wait for redirect

**Expected Results:**
- [ ] Google account picker appears
- [ ] OAuth completes without re-consent
- [ ] Redirected to `/dashboard`
- [ ] User data displays correctly
- [ ] No duplicate profile created in Supabase

**Verification Query:**
```sql
SELECT COUNT(*) as profile_count
FROM profiles
WHERE email = 'your-test-email@gmail.com';
```

**Expected:**
- [ ] `profile_count` = 1 (no duplicates)

### Test 3: Sign Out

**Steps:**
1. While logged in, click user avatar in top-right
2. Click "Sign out" from dropdown menu
3. Observe redirect

**Expected Results:**
- [ ] Dropdown menu appears on avatar click
- [ ] "Sign out" option visible
- [ ] Redirected to home page (`/`)
- [ ] No longer authenticated
- [ ] Session cleared

**Verification:**
- [ ] Navigate to `/dashboard`
- [ ] Confirm redirect to `/auth/login`

## Protected Route Tests

### Test 4: Dashboard Protection

**Steps:**
1. Open incognito window
2. Navigate directly to `http://localhost:3000/dashboard`
3. Observe behavior

**Expected Results:**
- [ ] Immediately redirected to `/auth/login`
- [ ] No flash of dashboard content
- [ ] Clean redirect without errors

### Test 5: Nested Route Protection

**Steps:**
1. While unauthenticated, try these URLs:
   - `/dashboard/analyze`
   - `/dashboard/watchlist`
   - `/dashboard/settings`
   - `/dashboard/billing`

**Expected Results:**
- [ ] All redirect to `/auth/login`
- [ ] No content accessible
- [ ] Consistent behavior across all routes

### Test 6: Public Route Access

**Steps:**
1. While unauthenticated, try these URLs:
   - `/`
   - `/pricing`
   - `/auth/login`
   - `/auth/signup`

**Expected Results:**
- [ ] All pages load without redirect
- [ ] No authentication required
- [ ] Content displays correctly

## Webhook Tests

### Test 7: User Created Webhook

**Steps:**
1. Create new test account via sign up flow
2. Check Clerk webhook logs immediately
3. Query Supabase for new profile

**Expected Results:**

**Clerk Dashboard:**
- [ ] Navigate to: Configure > Webhooks > [Your Endpoint]
- [ ] See `user.created` event in recent logs
- [ ] Event status: Success (200)
- [ ] Response time < 2 seconds

**Supabase Database:**
```sql
SELECT *
FROM profiles
WHERE email = 'new-test-user@gmail.com';
```

- [ ] Profile exists
- [ ] All fields populated correctly
- [ ] `created_at` matches webhook timestamp

### Test 8: User Updated Webhook

**Steps:**
1. Sign in to Clerk User Dashboard (as test user)
2. Update profile (name or image)
3. Check webhook logs
4. Verify Supabase update

**Expected Results:**

**Clerk Dashboard:**
- [ ] `user.updated` event appears in logs
- [ ] Event status: Success (200)

**Supabase Database:**
```sql
SELECT full_name, avatar_url, updated_at
FROM profiles
WHERE email = 'test-user@gmail.com';
```

- [ ] Changes reflected in database
- [ ] `updated_at` timestamp updated

### Test 9: User Deleted Webhook (Optional)

**Steps:**
1. In Clerk Dashboard, navigate to: Users
2. Select test user
3. Click "Delete User"
4. Confirm deletion
5. Check webhook logs
6. Verify Supabase deletion

**Expected Results:**

**Clerk Dashboard:**
- [ ] `user.deleted` event in logs
- [ ] Event status: Success (200)

**Supabase Database:**
```sql
SELECT COUNT(*)
FROM profiles
WHERE email = 'deleted-user@gmail.com';
```

- [ ] Profile deleted (count = 0)
- [ ] Related subscriptions also deleted (cascade)

## User Interface Tests

### Test 10: Clerk Sign-In Component

**Steps:**
1. Navigate to `/auth/login`
2. Inspect the page

**Expected Results:**
- [ ] Clerk `<SignIn />` component renders
- [ ] Dark theme applied (matches Vortis)
- [ ] Google button visible
- [ ] Orb background shows behind form
- [ ] Component is centered and responsive
- [ ] No console errors

### Test 11: Clerk Sign-Up Component

**Steps:**
1. Navigate to `/auth/signup`
2. Inspect the page

**Expected Results:**
- [ ] Clerk `<SignUp />` component renders
- [ ] Dark theme applied
- [ ] Google button visible
- [ ] Orb background visible
- [ ] Links to login page work
- [ ] Mobile responsive

### Test 12: User Button in Dashboard

**Steps:**
1. Sign in and navigate to `/dashboard`
2. Click user avatar in top-right
3. Test dropdown menu

**Expected Results:**
- [ ] User avatar displays (Google profile picture)
- [ ] Avatar is clickable
- [ ] Dropdown menu appears on click
- [ ] Email displayed correctly
- [ ] "Manage account" link present
- [ ] "Sign out" button present
- [ ] Menu closes on outside click
- [ ] Dark theme styling consistent

### Test 13: Mobile Navigation

**Steps:**
1. Sign in to dashboard
2. Resize browser to mobile width (< 768px)
3. Test mobile menu

**Expected Results:**
- [ ] Hamburger menu icon appears
- [ ] Click opens mobile sidebar
- [ ] User avatar and email visible
- [ ] Navigation items listed
- [ ] All links functional
- [ ] "Sign out" button present
- [ ] Menu closes after navigation
- [ ] Touch targets are adequate (48px+)

## Error Handling Tests

### Test 14: Webhook Failure Handling

**Steps:**
1. Temporarily disable webhook endpoint
2. Create new user
3. Check error handling

**Expected Results:**
- [ ] User still authenticated in Clerk
- [ ] Can access dashboard
- [ ] Webhook retries automatically
- [ ] Error logged in Clerk dashboard
- [ ] Profile eventually syncs when endpoint restored

### Test 15: Database Connection Failure

**Steps:**
1. Temporarily set wrong Supabase credentials
2. Create new user
3. Check webhook logs

**Expected Results:**
- [ ] User authenticated in Clerk
- [ ] Webhook returns 500 error
- [ ] Error logged with details
- [ ] Clerk retries webhook
- [ ] No app crash

### Test 16: Invalid Webhook Signature

**Steps:**
1. Send POST request to `/api/webhooks/clerk` with invalid signature
2. Check response

**Expected Results:**
- [ ] Request rejected with 400 status
- [ ] Error: "Invalid webhook signature"
- [ ] No database operations performed
- [ ] Attempt logged for security

## Performance Tests

### Test 17: Authentication Speed

**Metric:** Time from Google OAuth consent to dashboard load

**Steps:**
1. Clear browser cache
2. Sign out
3. Start timer
4. Sign in with Google
5. Measure time to dashboard ready

**Expected Results:**
- [ ] OAuth redirect: < 2 seconds
- [ ] Dashboard load: < 3 seconds
- [ ] Total flow: < 5 seconds
- [ ] No perceived lag

### Test 18: Webhook Processing Speed

**Metric:** Time from user creation to profile in database

**Steps:**
1. Monitor webhook logs timestamp
2. Create new user
3. Query database for profile
4. Calculate latency

**Expected Results:**
- [ ] Webhook received: < 500ms after creation
- [ ] Profile created: < 1 second total
- [ ] No timeout errors

## Browser Compatibility Tests

### Test 19: Cross-Browser Testing

**Browsers to Test:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**For Each Browser:**
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Dashboard loads correctly
- [ ] User button functional
- [ ] Sign out works
- [ ] No console errors

### Test 20: Mobile Browser Testing

**Devices/Emulators:**
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile responsive view (DevTools)

**For Each Device:**
- [ ] Google OAuth flow completes
- [ ] Dashboard navigation works
- [ ] Touch targets are appropriate
- [ ] No layout issues

## Security Tests

### Test 21: Session Persistence

**Steps:**
1. Sign in to dashboard
2. Close browser tab
3. Reopen and navigate to `/dashboard`

**Expected Results:**
- [ ] Still authenticated
- [ ] No re-login required
- [ ] Session data intact

**Steps (Continued):**
4. Wait 24+ hours (or adjust Clerk session lifetime)
5. Try accessing dashboard

**Expected Results:**
- [ ] Session expired
- [ ] Redirected to login
- [ ] Can re-authenticate

### Test 22: CSRF Protection

**Steps:**
1. Try accessing protected routes via different origins
2. Test webhook endpoint with external requests

**Expected Results:**
- [ ] Middleware blocks unauthorized requests
- [ ] Webhook validates signature
- [ ] No cross-site attacks possible

### Test 23: Data Privacy

**Steps:**
1. Check network requests in DevTools
2. Verify no sensitive data exposed

**Expected Results:**
- [ ] No passwords in requests (OAuth only)
- [ ] Session tokens are httpOnly
- [ ] API keys not in client-side code
- [ ] Webhook secret not exposed
- [ ] Service role key only in API routes

## Rollback Tests

### Test 24: Environment Variable Removal

**Steps:**
1. Remove Clerk environment variables
2. Restart application
3. Observe behavior

**Expected Results:**
- [ ] Application starts but shows errors
- [ ] Clear error messages in console
- [ ] No crashes or undefined behavior

### Test 25: Webhook Endpoint Unavailable

**Steps:**
1. Delete webhook route file
2. Create new user in Clerk

**Expected Results:**
- [ ] User created in Clerk
- [ ] Webhook returns 404
- [ ] Clerk logs error
- [ ] No profile created in Supabase
- [ ] User can still authenticate

## Post-Testing Verification

### Final Checklist

- [ ] All authentication flows working
- [ ] Webhooks syncing correctly
- [ ] Protected routes secure
- [ ] Public routes accessible
- [ ] UI matches Vortis dark theme
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Database sync working
- [ ] Performance acceptable
- [ ] Cross-browser compatible

### Documentation Updated

- [ ] README updated with Clerk info
- [ ] Environment variable template complete
- [ ] Setup guide reviewed
- [ ] Testing checklist completed
- [ ] Migration notes documented

### Cleanup Tasks

- [ ] Remove old Supabase auth code
- [ ] Delete unused auth components
- [ ] Update dependencies
- [ ] Clear test users from database
- [ ] Archive old documentation

## Test Results Summary

**Date:** _____________
**Tester:** _____________
**Version:** _____________

**Total Tests:** 25
**Passed:** ____
**Failed:** ____
**Skipped:** ____

**Critical Issues:**
-
-

**Minor Issues:**
-
-

**Notes:**
-
-

**Sign-Off:**
- [ ] All critical tests passing
- [ ] Ready for production deployment
- [ ] Team notified of changes
