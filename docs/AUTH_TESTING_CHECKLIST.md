# Vortis Authentication Testing Checklist

**Date:** 2025-10-09
**Project:** Vortis - AI Stock Analysis Platform
**Test Environment:** Development (localhost:3000)

## Prerequisites

### Environment Configuration
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured in `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured in `.env.local`
- [ ] Supabase project URL accessible
- [ ] Development server running (`npm run dev`)

### Database Setup
- [ ] `profiles` table exists with correct schema
- [ ] `handle_new_user()` trigger function deployed
- [ ] `on_auth_user_created` trigger active
- [ ] RLS policies enabled on `profiles` table
- [ ] UUID extension enabled

---

## Test Suite 1: Sign Up Flow

### 1.1 Navigate to Sign Up Page
**URL:** `http://localhost:3000/auth/signup`

- [ ] Page loads without errors
- [ ] Orb background displays correctly
- [ ] Form fields visible:
  - [ ] Full Name input
  - [ ] Email input
  - [ ] Password input
  - [ ] Confirm Password input
  - [ ] Terms & Conditions checkbox
- [ ] "Create account" button present
- [ ] "Already have an account?" link works

### 1.2 Client-Side Validation

**Test: Invalid email format**
- [ ] Enter: `test@invalid`
- [ ] HTML5 validation triggers
- [ ] Form does not submit

**Test: Password too short**
- [ ] Enter password: `short`
- [ ] Error message: "Password must be at least 8 characters"
- [ ] Form does not submit

**Test: Password mismatch**
- [ ] Password: `password123`
- [ ] Confirm: `password456`
- [ ] Error message: "Passwords do not match"
- [ ] Form does not submit

**Test: Missing required fields**
- [ ] Leave Full Name empty
- [ ] Submit form
- [ ] Browser validation prevents submission

### 1.3 Valid Sign Up

**Test credentials:**
- Full Name: `Test User`
- Email: `test-auth-{timestamp}@vortis.dev`
- Password: `TestPass123!`

**Actions:**
1. [ ] Enter valid test credentials
2. [ ] Check Terms & Conditions checkbox
3. [ ] Click "Create account" button

**Expected Results:**
- [ ] Loading state shows (spinner + "Creating account...")
- [ ] No error messages displayed
- [ ] Success screen appears with:
  - [ ] Green check icon
  - [ ] "Check your email" heading
  - [ ] Email address displayed
  - [ ] "Go to login" button

### 1.4 Database Verification (Sign Up)

**Query 1: Verify user in auth.users**
```sql
SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'test-auth-{timestamp}@vortis.dev'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- [ ] User record exists
- [ ] `email_confirmed_at` is NULL (unverified)
- [ ] `raw_user_meta_data` contains `full_name`

**Query 2: Verify profile auto-created**
```sql
SELECT id, email, full_name, created_at
FROM public.profiles
WHERE email = 'test-auth-{timestamp}@vortis.dev';
```

**Expected:**
- [ ] Profile record exists
- [ ] `id` matches `auth.users.id`
- [ ] `full_name` = "Test User"
- [ ] `created_at` timestamp present

**Query 3: Verify trigger executed**
```sql
SELECT
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

**Expected:**
- [ ] Trigger exists
- [ ] `enabled` = 'O' (origin)

---

## Test Suite 2: Email Verification

### 2.1 Check Supabase Email Logs

**Supabase Dashboard > Authentication > Logs**

- [ ] Confirmation email sent to test user
- [ ] Email contains verification link
- [ ] Link format: `{SUPABASE_URL}/auth/v1/verify?token=...&type=signup&redirect_to={APP_URL}/auth/callback`

### 2.2 Extract Verification Link

**Method 1: Supabase Dashboard**
- [ ] Copy link from Authentication > Logs

**Method 2: Query auth.identities**
```sql
SELECT * FROM auth.identities
WHERE email = 'test-auth-{timestamp}@vortis.dev';
```

### 2.3 Verify Email

**Actions:**
1. [ ] Open verification link in browser
2. [ ] Monitor network requests

**Expected Results:**
- [ ] Redirects to `/auth/callback?code=...`
- [ ] Callback route exchanges code for session
- [ ] Session cookie set in browser
- [ ] Final redirect to `/dashboard`
- [ ] Dashboard loads successfully

### 2.4 Database Verification (Post-Verification)

```sql
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'test-auth-{timestamp}@vortis.dev';
```

**Expected:**
- [ ] `email_confirmed_at` is NOT NULL
- [ ] `confirmed_at` timestamp present

---

## Test Suite 3: Login Flow

### 3.1 Login with Unverified Account

**Prerequisites:** User exists but email not verified

**URL:** `http://localhost:3000/auth/login`

**Actions:**
1. [ ] Enter unverified user credentials
2. [ ] Submit form

**Expected Results:**
- [ ] Error message displayed
- [ ] Message contains: "Email not confirmed" or similar
- [ ] User remains on login page
- [ ] No redirect occurs

### 3.2 Login with Verified Account

**Prerequisites:** User email verified

**Test credentials:**
- Email: `test-auth-{timestamp}@vortis.dev`
- Password: `TestPass123!`

**Actions:**
1. [ ] Navigate to `/auth/login`
2. [ ] Enter verified credentials
3. [ ] Click "Sign in" button

**Expected Results:**
- [ ] Loading state shows ("Signing in...")
- [ ] No error messages
- [ ] Redirects to `/dashboard`
- [ ] Dashboard loads successfully
- [ ] User email displayed in navigation

### 3.3 Login Error Scenarios

**Test: Invalid email**
- [ ] Email: `nonexistent@test.com`
- [ ] Password: `anything`
- [ ] Error: "Invalid login credentials"

**Test: Wrong password**
- [ ] Email: `{valid-test-email}`
- [ ] Password: `WrongPassword123`
- [ ] Error: "Invalid login credentials"

**Test: Empty fields**
- [ ] Submit form with empty email
- [ ] Browser validation prevents submission

### 3.4 Session Verification

**Browser DevTools > Application > Cookies**

- [ ] `sb-{project-ref}-auth-token` cookie present
- [ ] Cookie contains JWT
- [ ] Cookie domain correct
- [ ] Cookie has expiration

**Verify session in database:**
```sql
SELECT user_id, created_at, expires_at
FROM auth.sessions
WHERE user_id = '{user-id}'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- [ ] Active session exists
- [ ] `expires_at` is in the future

---

## Test Suite 4: Protected Routes

### 4.1 Access Dashboard Without Login

**Prerequisites:** Clear all cookies/logout

**Actions:**
1. [ ] Clear browser cookies
2. [ ] Navigate directly to `http://localhost:3000/dashboard`

**Expected Results:**
- [ ] Middleware intercepts request
- [ ] Redirects to `/auth/login`
- [ ] Dashboard does not load

### 4.2 Access Dashboard With Login

**Prerequisites:** Valid session cookie exists

**Actions:**
1. [ ] Login successfully
2. [ ] Navigate to `/dashboard`

**Expected Results:**
- [ ] Dashboard loads immediately
- [ ] No redirect to login
- [ ] User data displayed
- [ ] Protected content accessible

### 4.3 Middleware Route Protection

**Test various protected routes:**

| Route | Logged Out | Logged In |
|-------|-----------|-----------|
| `/dashboard` | Redirect to `/auth/login` | Access granted |
| `/dashboard/analyze` | Redirect to `/auth/login` | Access granted |
| `/auth/login` | Access granted | Redirect to `/dashboard` |
| `/auth/signup` | Access granted | Redirect to `/dashboard` |
| `/` (home) | Access granted | Access granted |
| `/pricing` | Access granted | Access granted |

- [ ] All redirects work as expected
- [ ] No infinite redirect loops
- [ ] No console errors

---

## Test Suite 5: Logout Flow

### 5.1 Logout Action

**Prerequisites:** User logged in

**Actions:**
1. [ ] Navigate to `/dashboard`
2. [ ] Click logout button (in navigation menu)

**Expected Results:**
- [ ] Session cookie cleared
- [ ] Redirects to home page (`/`)
- [ ] Navigation shows "Login" button
- [ ] No user email displayed

### 5.2 Post-Logout Verification

**Browser DevTools > Application > Cookies**
- [ ] `sb-{project-ref}-auth-token` cookie removed

**Database verification:**
```sql
SELECT user_id, created_at, expires_at
FROM auth.sessions
WHERE user_id = '{user-id}'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- [ ] Session deleted OR
- [ ] `expires_at` set to past timestamp

### 5.3 Access Protected Routes After Logout

**Actions:**
1. [ ] After logout, try accessing `/dashboard`

**Expected Results:**
- [ ] Redirects to `/auth/login`
- [ ] Cannot access protected content

---

## Test Suite 6: Row Level Security (RLS)

### 6.1 Verify RLS Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

**Expected:**
- [ ] `rowsecurity` = true

### 6.2 Test Profile RLS Policies

**Create second test user:**
- Email: `test-auth-2-{timestamp}@vortis.dev`
- Password: `TestPass123!`

**Query as User 1:**
```sql
-- Set session to User 1
SET request.jwt.claim.sub = '{user-1-id}';

-- Try to view own profile
SELECT * FROM public.profiles WHERE id = '{user-1-id}';
-- Expected: SUCCESS (1 row)

-- Try to view other user's profile
SELECT * FROM public.profiles WHERE id = '{user-2-id}';
-- Expected: NO ROWS (blocked by RLS)
```

**Test results:**
- [ ] User can view own profile
- [ ] User cannot view other profiles
- [ ] User can update own profile
- [ ] User cannot update other profiles

### 6.3 RLS Policy Verification

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

**Expected policies:**
- [ ] "Users can view their own profile" (SELECT)
- [ ] "Users can update their own profile" (UPDATE)
- [ ] Both use `auth.uid() = id` check

---

## Test Suite 7: Error Scenarios

### 7.1 Duplicate Email Registration

**Actions:**
1. [ ] Register user with email `duplicate@test.com`
2. [ ] Try to register again with same email

**Expected:**
- [ ] Error message: "User already registered"
- [ ] Form does not submit
- [ ] No second user created

### 7.2 Expired Session

**Simulate expired session:**
1. [ ] Login successfully
2. [ ] Wait for session timeout (or manually expire in DB)
3. [ ] Try to access `/dashboard`

**Expected:**
- [ ] Middleware detects invalid session
- [ ] Redirects to `/auth/login`
- [ ] Error message (optional): "Session expired"

### 7.3 Invalid Session Token

**Actions:**
1. [ ] Login successfully
2. [ ] Manually corrupt session cookie
3. [ ] Try to access `/dashboard`

**Expected:**
- [ ] Redirects to `/auth/login`
- [ ] No server errors
- [ ] Session cleared

### 7.4 Concurrent Sessions

**Actions:**
1. [ ] Login from Browser 1
2. [ ] Login from Browser 2 (same user)
3. [ ] Verify both sessions work

**Expected:**
- [ ] Both sessions valid
- [ ] No session conflict
- [ ] Both can access dashboard

### 7.5 Database Connection Failure

**Simulate:** Temporarily stop Supabase or use invalid URL

**Expected:**
- [ ] Graceful error handling
- [ ] User-friendly error message
- [ ] No application crash
- [ ] Middleware allows public routes

---

## Test Suite 8: Password Reset Flow

### 8.1 Forgot Password Request

**URL:** `http://localhost:3000/auth/forgot-password`

**Actions:**
1. [ ] Navigate to forgot password page
2. [ ] Enter registered email
3. [ ] Submit form

**Expected Results:**
- [ ] Success message displayed
- [ ] Email sent to user
- [ ] Reset link in email

### 8.2 Reset Password

**Actions:**
1. [ ] Click reset link from email
2. [ ] Redirects to `/auth/reset-password?token=...`
3. [ ] Enter new password
4. [ ] Submit form

**Expected Results:**
- [ ] Password updated successfully
- [ ] Can login with new password
- [ ] Old password no longer works

### 8.3 Invalid Reset Token

**Actions:**
1. [ ] Use expired or invalid token
2. [ ] Try to reset password

**Expected:**
- [ ] Error message: "Invalid or expired token"
- [ ] Password not changed

---

## Performance & Security Tests

### 9.1 Performance

- [ ] Sign up completes in < 3 seconds
- [ ] Login completes in < 2 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] Middleware adds < 100ms latency
- [ ] No unnecessary database queries

### 9.2 Security

- [ ] Passwords not visible in network requests
- [ ] JWT tokens properly signed
- [ ] Session cookies have HttpOnly flag
- [ ] Session cookies have Secure flag (production)
- [ ] CSRF protection enabled
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (sanitized inputs)

### 9.3 Accessibility

- [ ] All forms keyboard accessible
- [ ] Tab order logical
- [ ] Error messages announced by screen readers
- [ ] Labels associated with inputs
- [ ] Focus indicators visible

---

## Database Queries for Testing

### Quick Status Check

```sql
-- Count all users
SELECT COUNT(*) as total_users FROM auth.users;

-- Count verified users
SELECT COUNT(*) as verified_users
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;

-- Count profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Check for orphaned profiles
SELECT p.id, p.email
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;

-- Check for missing profiles
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

### Active Sessions

```sql
SELECT
  u.email,
  s.created_at,
  s.expires_at,
  (s.expires_at > NOW()) as is_active
FROM auth.sessions s
JOIN auth.users u ON s.user_id = u.id
ORDER BY s.created_at DESC
LIMIT 10;
```

### Recent Signups

```sql
SELECT
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;
```

---

## Test Execution Log

### Test Run Information

**Test Date:** ___________
**Tester:** ___________
**Environment:** ___________
**Supabase Project:** ___________

### Pass/Fail Summary

| Test Suite | Total Tests | Passed | Failed | Notes |
|-----------|-------------|--------|--------|-------|
| 1. Sign Up Flow | | | | |
| 2. Email Verification | | | | |
| 3. Login Flow | | | | |
| 4. Protected Routes | | | | |
| 5. Logout Flow | | | | |
| 6. RLS | | | | |
| 7. Error Scenarios | | | | |
| 8. Password Reset | | | | |
| 9. Performance & Security | | | | |

### Critical Issues Found

**Issue #1:**
- Description:
- Severity:
- Steps to Reproduce:
- Expected vs Actual:
- Fix Required:

### Non-Critical Issues

**Issue #1:**
- Description:
- Impact:
- Priority:

---

## Sign-Off

**Authentication System Status:** [ ] PASS / [ ] FAIL
**Production Ready:** [ ] YES / [ ] NO
**Signed:** ___________
**Date:** ___________

---

## Next Steps

If all tests pass:
1. [ ] Deploy migrations to production
2. [ ] Update environment variables in production
3. [ ] Run smoke tests in production
4. [ ] Monitor error logs for 24 hours
5. [ ] Enable monitoring/alerts

If tests fail:
1. [ ] Document all failures
2. [ ] Prioritize critical bugs
3. [ ] Create fix tickets
4. [ ] Re-test after fixes
5. [ ] Update this checklist based on findings
