# Clerk Authentication Flow Testing

Comprehensive test cases for Clerk authentication flows in Vortis.

## Test Environment Setup

**Prerequisites:**
- Clerk setup completed (see CLERK_SETUP_TESTING.md)
- Development server running: `npm run dev`
- Browser DevTools open (Console + Network tabs)
- Test Google account available

---

## 1. Sign Up with Google (New User)

### Test Case 1.1: New User Sign-Up via Google OAuth

**Objective:** Verify new user can create account using Google OAuth

**Pre-conditions:**
- User does not exist in Clerk
- Google account ready (not previously used)
- Clear browser cookies/storage

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click "Sign Up" or navigate to `/sign-up`
3. Click "Continue with Google" button
4. Google consent screen appears
5. Select Google account
6. Grant permissions
7. Wait for redirect

**Expected Results:**
- ✓ Google consent screen loads
- ✓ User sees permissions request (email, profile)
- ✓ After authorization, redirects to Vortis
- ✓ Lands on `/dashboard`
- ✓ User session established
- ✓ User appears in Clerk dashboard
- ✓ User profile data populated (name, email, image)

**Verification:**
```javascript
// Run in browser console after sign-up
console.log('Session:', document.cookie.includes('__session'));
```

**Checklist:**
- [ ] Sign-up button visible
- [ ] Google OAuth flow initiates
- [ ] Consent screen shows correct app name (Vortis)
- [ ] User authorizes successfully
- [ ] Redirects to /dashboard
- [ ] Dashboard shows user data
- [ ] User visible in Clerk dashboard
- [ ] Profile image displays
- [ ] Email correct
- [ ] Name correct

---

### Test Case 1.2: Sign-Up with Work Google Account

**Objective:** Test Google Workspace account sign-up

**Steps:**
1. Navigate to `/sign-up`
2. Click "Continue with Google"
3. Select work Google account (`user@company.com`)
4. Complete authorization

**Expected Results:**
- ✓ Work accounts accepted (unless domain restrictions set)
- ✓ Sign-up succeeds
- ✓ User created with work email

---

### Test Case 1.3: Sign-Up Cancellation

**Objective:** Verify graceful handling when user cancels OAuth

**Steps:**
1. Navigate to `/sign-up`
2. Click "Continue with Google"
3. On Google consent screen, click "Cancel"

**Expected Results:**
- ✓ Redirects back to `/sign-up`
- ✓ No error shown (or clear message)
- ✓ Can retry sign-up
- ✓ No partial user created in Clerk

---

## 2. Sign In with Google (Existing User)

### Test Case 2.1: Existing User Sign-In

**Objective:** Verify returning user can sign in

**Pre-conditions:**
- User already signed up
- Currently signed out
- Browser cookies cleared

**Steps:**
1. Navigate to `http://localhost:3000`
2. Click "Sign In" or navigate to `/sign-in`
3. Click "Continue with Google"
4. Google shows account picker
5. Select existing account
6. (May skip consent if previously granted)
7. Wait for redirect

**Expected Results:**
- ✓ Google account picker appears
- ✓ Previously used account visible
- ✓ May skip consent screen
- ✓ Redirects to `/dashboard`
- ✓ Session restored
- ✓ User data loaded
- ✓ Last sign-in timestamp updated in Clerk

**Verification:**
```javascript
// Check session cookie
document.cookie.split(';').find(c => c.includes('__session'))
```

**Checklist:**
- [ ] Sign-in page loads
- [ ] Google OAuth initiates
- [ ] Recognizes existing account
- [ ] Sign-in completes quickly
- [ ] Redirects to correct page
- [ ] Dashboard shows user data
- [ ] No duplicate users created

---

### Test Case 2.2: Sign-In After Session Expiry

**Objective:** Test sign-in after session timeout

**Steps:**
1. Sign in successfully
2. Wait for session to expire (or manually clear cookies)
3. Try to access `/dashboard`
4. Should redirect to `/sign-in`
5. Sign in again

**Expected Results:**
- ✓ Expired session detected
- ✓ Redirects to sign-in
- ✓ Can sign in again
- ✓ New session created
- ✓ Returns to intended page

---

### Test Case 2.3: Sign-In with Different Google Account

**Objective:** Verify sign-in with different account switches users

**Pre-conditions:**
- Currently signed in as User A
- Have access to User B's Google account

**Steps:**
1. Sign out
2. Navigate to `/sign-in`
3. Click "Continue with Google"
4. Select different Google account (User B)
5. Complete sign-in

**Expected Results:**
- ✓ Previous session cleared
- ✓ New session created for User B
- ✓ Dashboard shows User B's data
- ✓ No data leakage from User A

---

## 3. Sign Out and Session Cleanup

### Test Case 3.1: Sign Out Flow

**Objective:** Verify complete sign-out

**Pre-conditions:**
- User signed in
- Session active

**Steps:**
1. Navigate to `/dashboard`
2. Click user profile menu
3. Click "Sign Out"
4. Observe redirect

**Expected Results:**
- ✓ Sign-out initiates
- ✓ Session cleared
- ✓ Cookies removed
- ✓ Redirects to `/` or `/sign-in`
- ✓ Cannot access `/dashboard` anymore
- ✓ Attempting to access protected routes redirects to sign-in

**Verification:**
```javascript
// After sign-out, check cookies
console.log('Session cookie exists:', document.cookie.includes('__session'));
// Should be false

// Try to access protected route
window.location.href = '/dashboard';
// Should redirect to /sign-in
```

**Checklist:**
- [ ] Sign-out button works
- [ ] Session cookie removed
- [ ] Local storage cleared (if used)
- [ ] Redirects appropriately
- [ ] Cannot access protected routes
- [ ] No lingering authentication

---

### Test Case 3.2: Sign Out from Multiple Tabs

**Objective:** Verify sign-out affects all tabs

**Steps:**
1. Open Vortis in two browser tabs
2. Both tabs show dashboard (signed in)
3. In Tab 1, sign out
4. Switch to Tab 2
5. Try to navigate or refresh

**Expected Results:**
- ✓ Tab 1 signs out successfully
- ✓ Tab 2 session also invalidated
- ✓ Tab 2 redirects to sign-in on next action
- ✓ Both tabs synchronized

---

## 4. Unauthorized Access to /dashboard

### Test Case 4.1: Direct URL Access (Signed Out)

**Objective:** Verify protected route blocks unauthenticated access

**Pre-conditions:**
- User signed out
- Browser cookies cleared

**Steps:**
1. Navigate directly to `http://localhost:3000/dashboard`
2. Observe behavior

**Expected Results:**
- ✓ Immediate redirect to `/sign-in`
- ✓ Dashboard does not flash/render
- ✓ After sign-in, returns to `/dashboard`

**Verification:**
```bash
# Test with curl
curl -I http://localhost:3000/dashboard

# Expected response:
# HTTP/1.1 307 Temporary Redirect
# Location: /sign-in
```

**Checklist:**
- [ ] Cannot access dashboard without auth
- [ ] Redirects to sign-in
- [ ] No data leakage
- [ ] No error screens
- [ ] Clean redirect

---

### Test Case 4.2: API Route Access (Signed Out)

**Objective:** Verify protected API routes require auth

**Steps:**
```bash
# Test protected API endpoint
curl -X GET http://localhost:3000/api/user/profile
```

**Expected Results:**
- ✓ Status: 401 Unauthorized
- ✓ Error message: "Not authenticated"
- ✓ No sensitive data returned

---

## 5. Redirect After Successful Login

### Test Case 5.1: Redirect to Dashboard After Sign-In

**Objective:** Verify default redirect after sign-in

**Steps:**
1. Sign out
2. Navigate to `/sign-in`
3. Sign in with Google
4. Observe landing page

**Expected Results:**
- ✓ Lands on `/dashboard`
- ✓ Matches `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`

---

### Test Case 5.2: Redirect to Intended Page After Sign-In

**Objective:** Verify redirect to originally requested page

**Steps:**
1. Sign out
2. Navigate to `/dashboard/settings` (or any protected route)
3. Middleware redirects to `/sign-in`
4. Complete sign-in

**Expected Results:**
- ✓ After sign-in, redirects back to `/dashboard/settings`
- ✓ Original intended destination restored

**Note:** This may require custom redirect handling:
```typescript
// In sign-in component
const { redirectUrl } = useSearchParams();
// After sign-in, redirect to redirectUrl
```

---

### Test Case 5.3: Redirect After Sign-Up

**Objective:** Verify first-time user redirect

**Steps:**
1. Sign up new user
2. Complete Google OAuth
3. Observe landing page

**Expected Results:**
- ✓ Lands on `/dashboard`
- ✓ Matches `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- ✓ Welcome message may display
- ✓ Profile data populated

---

## 6. Redirect After Logout

### Test Case 6.1: Sign-Out Redirect Destination

**Objective:** Verify redirect after sign-out

**Steps:**
1. Sign in
2. Navigate to `/dashboard`
3. Click "Sign Out"
4. Observe redirect

**Expected Results:**
- ✓ Redirects to `/` (homepage)
- ✓ Or redirects to `/sign-in`
- ✓ No error messages
- ✓ Clean landing page

---

## 7. Multiple Tabs/Browsers

### Test Case 7.1: Sign-In Syncs Across Tabs

**Objective:** Verify session syncs across browser tabs

**Steps:**
1. Open Tab 1: Navigate to `/sign-in`
2. Open Tab 2: Navigate to `/` (homepage)
3. In Tab 1: Complete sign-in
4. Switch to Tab 2: Navigate to `/dashboard`

**Expected Results:**
- ✓ Tab 2 recognizes signed-in session
- ✓ No need to sign in again
- ✓ Both tabs show authenticated state

---

### Test Case 7.2: Sign-Out Syncs Across Tabs

**Objective:** Verify sign-out affects all tabs

**Steps:**
1. Sign in
2. Open Tab 1: `/dashboard`
3. Open Tab 2: `/dashboard/settings`
4. In Tab 1: Sign out
5. In Tab 2: Try to interact or refresh

**Expected Results:**
- ✓ Tab 2 session also cleared
- ✓ Tab 2 redirects to sign-in
- ✓ No stale authentication

---

### Test Case 7.3: Different Browsers (Same User)

**Objective:** Verify independent sessions per browser

**Steps:**
1. Browser A (Chrome): Sign in as User 1
2. Browser B (Firefox): Sign in as User 1
3. Browser A: Sign out
4. Browser B: Still signed in

**Expected Results:**
- ✓ Each browser has independent session
- ✓ Sign-out in one doesn't affect other
- ✓ User can be signed in to multiple browsers

---

## 8. Session Persistence

### Test Case 8.1: Session Persists After Page Refresh

**Objective:** Verify session survives refresh

**Steps:**
1. Sign in
2. Navigate to `/dashboard`
3. Refresh page (F5)
4. Observe state

**Expected Results:**
- ✓ Still signed in after refresh
- ✓ No redirect to sign-in
- ✓ Dashboard reloads with user data
- ✓ No re-authentication needed

---

### Test Case 8.2: Session Persists After Browser Restart

**Objective:** Verify long-term session persistence

**Steps:**
1. Sign in
2. Close browser completely
3. Reopen browser
4. Navigate to `http://localhost:3000/dashboard`

**Expected Results:**
- ✓ Still signed in (if "Remember me" enabled)
- ✓ Dashboard loads without sign-in
- ✓ Session cookie persists

**Note:** Behavior depends on Clerk session settings:
- Short sessions: Sign-out on browser close
- Long sessions: Persist for days/weeks

---

### Test Case 8.3: Session Expiry and Refresh

**Objective:** Verify automatic session refresh

**Steps:**
1. Sign in
2. Wait near session expiry time (check Clerk settings)
3. Make a request (navigate, API call)
4. Observe behavior

**Expected Results:**
- ✓ Session automatically refreshed
- ✓ No sign-out
- ✓ User remains authenticated
- ✓ Seamless experience

---

## 9. Token Refresh

### Test Case 9.1: Automatic Token Refresh

**Objective:** Verify JWT token refreshes automatically

**Pre-conditions:**
- Clerk session configured with token refresh

**Steps:**
1. Sign in
2. Open browser DevTools > Application > Cookies
3. Note `__session` cookie value
4. Wait for token expiry time
5. Make an authenticated request
6. Check `__session` cookie again

**Expected Results:**
- ✓ Token refreshes before expiry
- ✓ New token issued
- ✓ No interruption to user
- ✓ Session remains valid

---

### Test Case 9.2: Token Refresh Failure Handling

**Objective:** Verify behavior when token refresh fails

**Steps:**
1. Sign in
2. Manually invalidate session (Clerk dashboard: revoke session)
3. Try to access protected route

**Expected Results:**
- ✓ Refresh fails
- ✓ Redirects to sign-in
- ✓ Clear error message (optional)
- ✓ User can sign in again

---

## 10. Error Scenarios

### Test Case 10.1: Network Error During Sign-In

**Objective:** Verify handling of network failures

**Steps:**
1. Start sign-in flow
2. Disable network (DevTools > Network > Offline)
3. Click "Continue with Google"
4. Observe behavior

**Expected Results:**
- ✓ Error message displays
- ✓ "Network error" or similar
- ✓ Can retry when network restored
- ✓ No broken state

---

### Test Case 10.2: Google OAuth Service Down

**Objective:** Verify handling when Google is unavailable

**Steps:**
1. Simulate Google outage (block Google domains)
2. Try to sign in with Google
3. Observe error handling

**Expected Results:**
- ✓ Timeout or error message
- ✓ Clear explanation to user
- ✓ Option to retry
- ✓ App remains functional

---

### Test Case 10.3: Invalid OAuth Response

**Objective:** Verify handling of malformed OAuth responses

**Note:** Difficult to simulate without test tools

**Expected Results:**
- ✓ Clerk handles gracefully
- ✓ User sees error message
- ✓ Redirect back to sign-in
- ✓ No partial authentication

---

## 11. Performance Testing

### Test Case 11.1: Sign-In Performance

**Objective:** Measure sign-in speed

**Steps:**
1. Sign out
2. Open DevTools > Network
3. Clear cache
4. Navigate to `/sign-in`
5. Click "Continue with Google"
6. Complete OAuth flow
7. Measure time to dashboard load

**Benchmarks:**
- OAuth redirect: < 2 seconds
- Session creation: < 1 second
- Dashboard load: < 3 seconds total

**Test with:**
```javascript
console.time('sign-in');
// Complete sign-in flow
console.timeEnd('sign-in');
```

---

### Test Case 11.2: Page Load with Auth Check

**Objective:** Measure auth check overhead

**Steps:**
1. Already signed in
2. Navigate to `/dashboard`
3. Measure time with DevTools Performance

**Benchmarks:**
- Initial HTML: < 500ms
- Auth verification: < 100ms
- Full page load: < 2 seconds

---

## 12. Test Automation Example

**File:** `/Users/tannerosterkamp/vortis/tests/integration/auth.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Clerk Authentication', () => {
  test('redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('allows access to dashboard when authenticated', async ({ page, context }) => {
    // Set auth cookie (from previous sign-in)
    await context.addCookies([{
      name: '__session',
      value: 'test_session_token',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('sign out clears session', async ({ page }) => {
    // Assuming signed in
    await page.goto('http://localhost:3000/dashboard');
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="sign-out"]');

    // Verify redirect
    await expect(page).toHaveURL(/\/(sign-in)?$/);

    // Verify cannot access dashboard
    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL(/.*sign-in/);
  });
});
```

---

## Test Execution Checklist

**Before marking authentication testing complete:**

### Sign-Up
- [ ] New user can sign up with Google
- [ ] User data syncs correctly
- [ ] Redirect to dashboard works
- [ ] User appears in Clerk dashboard

### Sign-In
- [ ] Existing user can sign in
- [ ] Session restored correctly
- [ ] User data loads
- [ ] Last sign-in timestamp updates

### Sign-Out
- [ ] Sign-out clears session
- [ ] Cookies removed
- [ ] Redirects appropriately
- [ ] Cannot access protected routes

### Session Management
- [ ] Session persists on refresh
- [ ] Session syncs across tabs
- [ ] Token refreshes automatically
- [ ] Session expiry handled gracefully

### Security
- [ ] Unauthenticated users blocked from /dashboard
- [ ] Protected API routes require auth
- [ ] No data leakage between users
- [ ] Sign-out is complete and secure

### Performance
- [ ] Sign-in completes < 3 seconds
- [ ] Auth check < 100ms
- [ ] Page loads smooth
- [ ] No flickering or loading states

### Error Handling
- [ ] Network errors handled
- [ ] OAuth cancellation handled
- [ ] Invalid states handled
- [ ] Clear error messages

---

## Next Steps

After completing authentication flow testing:

1. **Webhook Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_WEBHOOK_TESTING.md`

2. **Database Sync Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_DB_SYNC_TESTING.md`

3. **Integration Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_INTEGRATION_TESTING.md`
