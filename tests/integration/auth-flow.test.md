# Authentication Flow Integration Tests

This document outlines comprehensive manual and automated testing procedures for the Vortis authentication system.

## Test Environment Setup

### Prerequisites
- [ ] `.env.local` file configured with valid credentials
- [ ] Supabase project created and accessible
- [ ] Email confirmation configured in Supabase (disable for testing if needed)
- [ ] Development server running (`npm run dev`)
- [ ] Browser with dev tools open
- [ ] Network tab monitoring enabled

### Supabase Configuration for Testing

Navigate to Supabase Dashboard > Authentication > Settings:

**Email Auth Settings:**
- Enable email confirmations (production-like testing)
- OR disable email confirmations (faster iteration)

**URL Configuration:**
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

**Test User Setup:**
- Create 2-3 test users with known credentials
- Use disposable email service (e.g., mailinator.com) if testing email flow

---

## Test Suite 1: Sign Up Flow

### Test 1.1: Successful Sign Up (Email Confirmation Disabled)

**Steps:**
1. Navigate to `http://localhost:3000/auth/signup`
2. Fill in form:
   - Full Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "TestPass123!"
   - Confirm Password: "TestPass123!"
   - Check terms checkbox
3. Click "Create account"

**Expected Results:**
- [ ] Loading state displays (spinner + "Creating account...")
- [ ] Success page shows with email address
- [ ] "Check your email" message displayed
- [ ] Supabase creates user in auth.users table
- [ ] If email confirmation disabled: User can log in immediately

**Verification:**
```sql
-- Run in Supabase SQL Editor
SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'testuser@example.com';
```

**Console Checks:**
- [ ] No JavaScript errors
- [ ] No failed network requests
- [ ] Supabase cookies set (`sb-*` cookies present)

---

### Test 1.2: Sign Up with Email Confirmation Enabled

**Steps:**
1. Navigate to `/auth/signup`
2. Fill form with valid data
3. Submit form
4. Check email inbox
5. Click confirmation link in email

**Expected Results:**
- [ ] Success message shows "Check your email"
- [ ] Confirmation email received within 2 minutes
- [ ] Email contains valid confirmation link
- [ ] Clicking link redirects to `/auth/callback?code=...`
- [ ] Callback route exchanges code for session
- [ ] User redirected to `/dashboard`
- [ ] User is authenticated

**Verification:**
```sql
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'testuser@example.com';
-- email_confirmed_at should be populated after confirmation
```

---

### Test 1.3: Sign Up Validation Errors

**Test Cases:**

| Test | Input | Expected Error |
|------|-------|----------------|
| Empty fields | Leave all blank | HTML5 validation (required) |
| Invalid email | "notanemail" | HTML5 email validation |
| Short password | "Test123" | "Password must be at least 8 characters" |
| Password mismatch | password: "TestPass123!", confirm: "DifferentPass" | "Passwords do not match" |
| Unchecked terms | Don't check terms box | HTML5 validation (required checkbox) |
| Duplicate email | Use existing user email | Supabase error: "User already registered" |

**Steps for each test:**
1. Navigate to `/auth/signup`
2. Fill form with test input
3. Attempt submission

**Expected Results:**
- [ ] Error displays before submission (client-side) OR
- [ ] Error displays in red alert box (server-side)
- [ ] Form does not submit
- [ ] User remains on signup page
- [ ] Input fields retain entered values

---

### Test 1.4: Sign Up Network Failure

**Steps:**
1. Open browser dev tools > Network tab
2. Enable network throttling > Offline
3. Navigate to `/auth/signup`
4. Fill form and submit

**Expected Results:**
- [ ] Loading state displays
- [ ] After timeout, error message shows
- [ ] Error indicates network/connection issue
- [ ] User can retry submission

---

## Test Suite 2: Login Flow

### Test 2.1: Successful Login

**Prerequisites:**
- Test user exists with confirmed email

**Steps:**
1. Navigate to `http://localhost:3000/auth/login`
2. Enter email: "testuser@example.com"
3. Enter password: "TestPass123!"
4. Click "Sign in"

**Expected Results:**
- [ ] Loading state displays (spinner + "Signing in...")
- [ ] Redirect to `/dashboard`
- [ ] Dashboard page loads successfully
- [ ] User data displays correctly
- [ ] Session cookies set (`sb-*` cookies)
- [ ] No console errors

**Verification:**
```javascript
// Run in browser console on dashboard
const { createClient } = await import('@supabase/supabase-js');
// Or check via Network tab for auth calls
```

---

### Test 2.2: Login with Invalid Credentials

**Test Cases:**

| Test | Email | Password | Expected Error |
|------|-------|----------|----------------|
| Wrong password | valid@email.com | WrongPass123 | "Invalid login credentials" |
| Wrong email | invalid@email.com | AnyPassword | "Invalid login credentials" |
| Unconfirmed email | unconfirmed@email.com | ValidPass | "Email not confirmed" (if enabled) |

**Steps:**
1. Navigate to `/auth/login`
2. Enter test credentials
3. Submit form

**Expected Results:**
- [ ] Error message displays in red alert box
- [ ] User remains on login page
- [ ] No redirect occurs
- [ ] Form fields cleared or retained (design choice)

---

### Test 2.3: Login Rate Limiting

**Steps:**
1. Navigate to `/auth/login`
2. Enter wrong password
3. Submit 5+ times rapidly

**Expected Results:**
- [ ] After threshold (Supabase default: ~5-10 attempts)
- [ ] Error: "Too many requests" or similar
- [ ] Temporary lockout (typically 1-2 minutes)
- [ ] Valid credentials fail during lockout
- [ ] Access restored after cooldown period

---

## Test Suite 3: Protected Routes & Middleware

### Test 3.1: Access Dashboard Without Authentication

**Steps:**
1. Ensure logged out (clear cookies or incognito window)
2. Navigate directly to `http://localhost:3000/dashboard`

**Expected Results:**
- [ ] Middleware intercepts request
- [ ] Redirect to `/auth/login`
- [ ] URL shows `/auth/login`
- [ ] Login page displays
- [ ] No dashboard content visible

**Console Verification:**
```javascript
// Check in Network tab
// Should see:
// - Request to /dashboard
// - 307 redirect response
// - Navigation to /auth/login
```

---

### Test 3.2: Access Auth Pages While Authenticated

**Steps:**
1. Log in as valid user
2. Navigate to `/auth/login`
3. Navigate to `/auth/signup`

**Expected Results:**
- [ ] Middleware intercepts request
- [ ] Redirect to `/dashboard`
- [ ] Dashboard displays
- [ ] Cannot access login/signup while authenticated

---

### Test 3.3: Middleware with Invalid Environment Variables

**Steps:**
1. Stop dev server
2. Temporarily modify `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   ```
3. Restart dev server
4. Navigate to `/dashboard`

**Expected Results:**
- [ ] Console warning: "Supabase credentials not configured"
- [ ] Middleware skips auth check
- [ ] Page loads (degrades gracefully)
- [ ] No crash or 500 error

**Restore:**
- Reset environment variables to valid values
- Restart server

---

## Test Suite 4: Session Management

### Test 4.1: Session Persistence

**Steps:**
1. Log in successfully
2. Navigate to `/dashboard`
3. Close browser tab (not entire browser)
4. Reopen browser and navigate to `http://localhost:3000/dashboard`

**Expected Results:**
- [ ] User remains logged in
- [ ] Dashboard loads without login prompt
- [ ] Session cookies persisted
- [ ] No authentication required

---

### Test 4.2: Session Expiry

**Steps:**
1. Log in successfully
2. Manually expire session (Supabase default: 1 hour)
   - Option A: Wait 1 hour (slow)
   - Option B: Modify session expiry in Supabase settings to 1 minute
   - Option C: Use browser dev tools to delete `sb-access-token` cookie
3. Navigate to protected page or refresh

**Expected Results:**
- [ ] Middleware detects expired session
- [ ] Redirect to `/auth/login`
- [ ] User must re-authenticate

---

### Test 4.3: Session Refresh

**Steps:**
1. Log in successfully
2. Keep browser open on `/dashboard`
3. Monitor Network tab
4. Wait for session refresh (Supabase default: every 50 minutes)

**Expected Results:**
- [ ] Background request to Supabase auth endpoint
- [ ] New access token received
- [ ] Session refreshed automatically
- [ ] User remains logged in without interruption

---

### Test 4.4: Concurrent Sessions

**Steps:**
1. Log in on Browser A (e.g., Chrome)
2. Log in with same user on Browser B (e.g., Firefox)
3. Perform actions on both browsers

**Expected Results:**
- [ ] Both sessions valid
- [ ] Both browsers can access protected routes
- [ ] Actions in Browser A don't affect Browser B
- [ ] Supabase supports multiple concurrent sessions

---

## Test Suite 5: Logout Flow

### Test 5.1: Successful Logout

**Prerequisites:**
- User logged in and on dashboard

**Steps:**
1. Navigate to `/dashboard`
2. Click logout button (check UI for location)
3. Confirm logout if prompted

**Expected Results:**
- [ ] Session terminated
- [ ] Cookies cleared (`sb-*` cookies removed)
- [ ] Redirect to `/` or `/auth/login`
- [ ] Attempting to access `/dashboard` requires login

**Verification:**
```javascript
// In browser console
document.cookie.split(';').filter(c => c.includes('sb-'))
// Should return empty array or no sb- cookies
```

---

### Test 5.2: Logout and Immediate Login

**Steps:**
1. Log out as per Test 5.1
2. Immediately navigate to `/auth/login`
3. Log in with same credentials

**Expected Results:**
- [ ] Login succeeds
- [ ] New session created
- [ ] User redirected to dashboard
- [ ] No stale session issues

---

## Test Suite 6: Password Reset Flow

### Test 6.1: Request Password Reset

**Steps:**
1. Navigate to `/auth/login`
2. Click "Forgot password?" link
3. Navigate to `/auth/forgot-password`
4. Enter valid email
5. Submit form

**Expected Results:**
- [ ] Success message displays
- [ ] Email sent to user inbox
- [ ] Email contains password reset link
- [ ] Link format: `/auth/reset-password?code=...`

---

### Test 6.2: Complete Password Reset

**Prerequisites:**
- Password reset email received

**Steps:**
1. Click reset link in email
2. Navigate to `/auth/reset-password?code=...`
3. Enter new password: "NewPassword123!"
4. Confirm new password
5. Submit form

**Expected Results:**
- [ ] Success message displays
- [ ] Password updated in Supabase
- [ ] Redirect to `/auth/login`
- [ ] Can log in with new password
- [ ] Cannot log in with old password

---

### Test 6.3: Reset Password Edge Cases

**Test Cases:**

| Test | Scenario | Expected Behavior |
|------|----------|-------------------|
| Invalid code | Modify URL code parameter | Error: "Invalid or expired reset link" |
| Expired code | Use old reset link (>1 hour) | Error: "Reset link has expired" |
| Reused code | Use reset link twice | Second use fails |
| Invalid email | Request reset for non-existent email | Success message (security: don't reveal if email exists) |

---

## Test Suite 7: Callback Route

### Test 7.1: OAuth Callback Success

**Steps:**
1. Trigger email confirmation or password reset
2. Click link in email
3. Observe callback route handling

**Expected Results:**
- [ ] URL: `/auth/callback?code=...&next=/dashboard`
- [ ] Code exchanged for session
- [ ] Cookies set
- [ ] Redirect to `next` parameter or `/dashboard`
- [ ] User authenticated

**Code Coverage:**
```typescript
// Verify in /app/auth/callback/route.ts
// Lines 4-14: Code extraction and exchange
```

---

### Test 7.2: Callback with Missing Code

**Steps:**
1. Navigate directly to `/auth/callback` (no code parameter)

**Expected Results:**
- [ ] No code in URL
- [ ] Redirect to `/auth/login?error=Could not authenticate user`
- [ ] Error message displays on login page

---

### Test 7.3: Callback with Invalid Code

**Steps:**
1. Navigate to `/auth/callback?code=invalid_code_12345`

**Expected Results:**
- [ ] Code exchange fails
- [ ] Supabase returns error
- [ ] Redirect to `/auth/login?error=...`
- [ ] Error message shows

---

## Test Suite 8: Database Integration

### Test 8.1: User Creation in Database

**Steps:**
1. Sign up new user
2. Check Supabase database

**Verification SQL:**
```sql
-- Verify user in auth schema
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = 'testuser@example.com';

-- Check if subscriptions table exists and user profile created
SELECT * FROM public.subscriptions WHERE user_id = '[USER_ID]';
```

**Expected Results:**
- [ ] User exists in `auth.users`
- [ ] `full_name` in user metadata
- [ ] `email_confirmed_at` populated (if confirmation enabled)
- [ ] Profile/subscription record may exist (check schema)

---

### Test 8.2: RLS (Row Level Security) Policies

**Setup:**
1. Create test query in Supabase SQL Editor
2. Test as authenticated user vs. anonymous

**Verification SQL:**
```sql
-- As authenticated user (using Supabase client)
SELECT * FROM subscriptions WHERE user_id = '[CURRENT_USER_ID]';

-- Should return only current user's subscription

-- Attempt to access other user's data
SELECT * FROM subscriptions WHERE user_id = '[OTHER_USER_ID]';
-- Should return no rows (RLS blocks access)
```

**Expected Results:**
- [ ] Users can only access their own data
- [ ] RLS policies enforce data isolation
- [ ] Anonymous users cannot access protected data

---

### Test 8.3: Database Connection Failure

**Steps:**
1. Temporarily use invalid Supabase URL in `.env.local`
2. Restart dev server
3. Attempt to sign up or log in

**Expected Results:**
- [ ] Network request fails
- [ ] Error message displays
- [ ] User informed of connection issue
- [ ] No app crash

**Restore:**
- Reset Supabase URL
- Restart server

---

## Test Suite 9: Security Tests

### Test 9.1: SQL Injection Attempts

**Steps:**
1. Navigate to `/auth/login`
2. Enter email: `admin' OR '1'='1`
3. Enter password: `anything`
4. Submit form

**Expected Results:**
- [ ] Login fails
- [ ] No SQL injection occurs
- [ ] Supabase client properly escapes inputs
- [ ] Error: "Invalid login credentials"

---

### Test 9.2: XSS (Cross-Site Scripting) Attempts

**Steps:**
1. Navigate to `/auth/signup`
2. Enter full name: `<script>alert('XSS')</script>`
3. Complete signup

**Expected Results:**
- [ ] Script not executed
- [ ] Name stored as plain text
- [ ] React escapes HTML by default
- [ ] No alert popup

**Verification:**
```sql
SELECT raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE email = '[TEST_EMAIL]';
-- Should show literal "<script>..." string
```

---

### Test 9.3: CSRF Protection

**Verification:**
- [ ] Supabase handles CSRF tokens internally
- [ ] All state-changing requests use POST
- [ ] Cookies have `SameSite` attribute
- [ ] No GET requests modify data

**Check in Network Tab:**
```
Cookie attributes should include:
- HttpOnly
- Secure (in production)
- SameSite=Lax or Strict
```

---

### Test 9.4: Password Security

**Requirements:**
- [ ] Minimum 8 characters enforced
- [ ] Passwords hashed (never stored plain text)
- [ ] Supabase uses bcrypt or similar
- [ ] Password not visible in network requests

**Verification:**
```sql
-- Passwords are NOT stored in auth.users
-- Supabase stores encrypted in internal table
SELECT * FROM auth.users;
-- Should NOT have a readable password column
```

---

## Test Suite 10: Performance & Monitoring

### Test 10.1: Authentication Speed

**Metrics to Track:**
- Time to complete login: < 1 second (excluding network)
- Time to verify session: < 200ms
- Middleware execution time: < 100ms

**Tools:**
- Browser DevTools > Performance tab
- Network tab > Timing breakdown

**Expected Results:**
- [ ] Login/signup feels instant
- [ ] No noticeable lag on protected routes
- [ ] Middleware adds minimal overhead

---

### Test 10.2: Error Handling & Logging

**Steps:**
1. Trigger various error conditions (wrong password, network failure, etc.)
2. Check browser console
3. Check server logs (if applicable)

**Expected Results:**
- [ ] Errors logged to console in development
- [ ] User-friendly error messages displayed
- [ ] No sensitive information in client-side logs
- [ ] Stack traces helpful for debugging

---

## Test Suite 11: Edge Cases

### Test 11.1: Multiple Rapid Requests

**Steps:**
1. Programmatically trigger multiple login requests
2. Use browser console:
```javascript
for (let i = 0; i < 5; i++) {
  fetch('/api/auth/login', { method: 'POST', ... });
}
```

**Expected Results:**
- [ ] Supabase handles concurrent requests
- [ ] No race conditions
- [ ] Either all succeed or all fail with proper errors

---

### Test 11.2: Browser Back Button

**Steps:**
1. Log in successfully
2. Navigate to dashboard
3. Click browser back button
4. Reaches login page
5. Click browser forward button

**Expected Results:**
- [ ] Middleware handles navigation correctly
- [ ] If authenticated, redirects to dashboard from login page
- [ ] No auth state confusion

---

### Test 11.3: Session Across Subdomains

**Steps:**
1. If app uses subdomains, log in on `app.vortis.com`
2. Navigate to `api.vortis.com` (or other subdomain)

**Expected Results:**
- [ ] Session valid across subdomains (if cookie domain set correctly)
- [ ] OR session isolated per subdomain (if intended)

---

## Test Suite 12: Mobile & Responsive

### Test 12.1: Mobile Device Authentication

**Steps:**
1. Open app on mobile device or responsive mode
2. Test signup, login, logout flows

**Expected Results:**
- [ ] Forms usable on mobile
- [ ] Touch targets adequate size (48x48px minimum)
- [ ] Virtual keyboard doesn't obscure inputs
- [ ] Autocomplete works correctly (email, password)
- [ ] Proper input types: `type="email"`, `type="password"`

---

### Test 12.2: Password Manager Integration

**Steps:**
1. Use browser with password manager (1Password, LastPass, etc.)
2. Navigate to login page
3. Use autofill

**Expected Results:**
- [ ] Password manager detects login form
- [ ] Credentials autofill correctly
- [ ] Form submits successfully
- [ ] Password manager offers to save credentials

---

## Automated Testing Recommendations

### Unit Tests (Jest / Vitest)

```typescript
// Example test structure
describe('Authentication Utils', () => {
  test('validates email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });

  test('validates password strength', () => {
    expect(isStrongPassword('Test123!')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
  });
});
```

### Integration Tests (Playwright / Cypress)

```typescript
// Example Playwright test
test('user can sign up and log in', async ({ page }) => {
  await page.goto('/auth/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'TestPass123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### API Tests (Supertest)

```typescript
// Example API test
describe('POST /api/auth/login', () => {
  it('returns 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(response.status).toBe(401);
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Auth Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Validate environment
        run: npx tsx scripts/check-env.ts
      - name: Run tests
        run: npm test
```

---

## Test Reporting Template

### Test Execution Summary

| Date | Tester | Environment | Total Tests | Passed | Failed | Notes |
|------|--------|-------------|-------------|--------|--------|-------|
| YYYY-MM-DD | Name | Dev/Staging | 50 | 48 | 2 | See issues below |

### Issues Found

| Test ID | Severity | Description | Status | Resolution |
|---------|----------|-------------|--------|------------|
| 2.1 | High | Login fails with special chars in password | Open | Investigate URL encoding |
| 5.1 | Low | Logout button hard to find on mobile | Closed | Improved UI |

---

## Checklist: Pre-Production Validation

Before deploying to production, ensure:

- [ ] All critical tests (marked HIGH priority) pass
- [ ] Email confirmation flow tested end-to-end
- [ ] Password reset flow tested end-to-end
- [ ] Session management works correctly
- [ ] RLS policies enforced
- [ ] Rate limiting configured
- [ ] Error messages user-friendly (no stack traces)
- [ ] HTTPS enforced in production
- [ ] Environment variables validated
- [ ] Monitoring/logging configured (Sentry, etc.)
- [ ] Load testing completed (100+ concurrent users)
- [ ] Security audit passed
- [ ] GDPR/privacy compliance verified

---

## Support & Troubleshooting

### Common Issues

**Issue: "Invalid login credentials" for valid user**
- Check email confirmation status
- Verify password hasn't been reset
- Check for typos in email

**Issue: Redirect loop on protected routes**
- Verify middleware configuration
- Check cookie settings
- Ensure environment variables set

**Issue: Session not persisting**
- Check cookie attributes
- Verify Supabase URL is HTTPS (production)
- Check browser cookie settings

**Issue: Email not received**
- Check spam folder
- Verify Supabase email settings
- Check email provider (some block Supabase emails)

### Debug Commands

```bash
# Check environment variables
npx tsx scripts/check-env.ts --verbose

# Test Supabase connection
curl -X GET "https://YOUR-PROJECT.supabase.co/rest/v1/" \
  -H "apikey: YOUR-ANON-KEY"

# View Supabase logs
# Go to Supabase Dashboard > Logs > Auth Logs
```

---

## Conclusion

This comprehensive test suite ensures the Vortis authentication system is:
- Secure
- Reliable
- User-friendly
- Production-ready

Execute these tests regularly (on each PR, before releases) to maintain high quality and catch regressions early.

For questions or issues, refer to:
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Next.js Auth Guide: https://nextjs.org/docs/authentication
- Project README: /Users/tannerosterkamp/vortis/README.md
