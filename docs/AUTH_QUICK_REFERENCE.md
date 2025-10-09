# Vortis Authentication Quick Reference

Fast reference for testing authentication flows.

---

## Quick Start

```bash
# 1. Configure environment
cp .env.example .env.local
# Edit .env.local with real Supabase credentials

# 2. Start server
npm run dev

# 3. Open browser
open http://localhost:3000
```

---

## Test Credentials

```
Email: test-auth-{timestamp}@vortis.dev
Password: VortisTest123!
Full Name: Test User
```

---

## Key URLs

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Home page | No |
| `/auth/signup` | Create account | No |
| `/auth/login` | Sign in | No |
| `/auth/callback` | Email verification | No |
| `/dashboard` | Main dashboard | Yes |
| `/dashboard/analyze` | Stock analysis | Yes |

---

## Sign Up Flow

```
1. Navigate to /auth/signup
2. Fill form:
   - Full Name: Test User
   - Email: test-{timestamp}@vortis.dev
   - Password: VortisTest123!
   - Confirm Password: VortisTest123!
   - Check terms box
3. Click "Create account"
4. See "Check your email" message
5. Go to Supabase dashboard → Auth → Logs
6. Copy verification link
7. Open link in browser
8. Redirected to /dashboard
```

---

## Login Flow

```
1. Navigate to /auth/login
2. Enter:
   - Email: {verified-email}
   - Password: VortisTest123!
3. Click "Sign in"
4. Redirected to /dashboard
5. See user email in navigation
```

---

## Logout Flow

```
1. On /dashboard, click profile menu
2. Click "Logout"
3. Redirected to home page
4. Try accessing /dashboard → redirected to login
```

---

## Database Verification

### Check user created
```sql
SELECT email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'test-auth-{timestamp}@vortis.dev';
```

### Check profile auto-created
```sql
SELECT id, email, full_name, created_at
FROM public.profiles
WHERE email = 'test-auth-{timestamp}@vortis.dev';
```

### Check RLS enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';
```

### Check trigger exists
```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
```

### Check active sessions
```sql
SELECT user_id, created_at, expires_at
FROM auth.sessions
WHERE user_id = '{user-id}'
ORDER BY created_at DESC
LIMIT 1;
```

---

## Expected Validation Errors

| Scenario | Error Message |
|----------|---------------|
| Password < 8 chars | "Password must be at least 8 characters" |
| Passwords don't match | "Passwords do not match" |
| Invalid email format | Browser validation (HTML5) |
| Wrong password | "Invalid login credentials" |
| Email not found | "Invalid login credentials" |
| Email not verified | "Email not confirmed" |
| Duplicate email | "User already registered" |

---

## Session Cookie

**Name:** `sb-{project-ref}-auth-token`

**Check in DevTools:**
```
Application → Cookies → localhost → sb-*-auth-token
```

**Should contain:**
- JWT token
- Expiration date
- HttpOnly flag
- Secure flag (production)

---

## Middleware Behavior

| User State | Route | Action |
|------------|-------|--------|
| Logged out | `/dashboard` | Redirect to `/auth/login` |
| Logged out | `/auth/login` | Allow |
| Logged in | `/dashboard` | Allow |
| Logged in | `/auth/login` | Redirect to `/dashboard` |
| Any | `/` | Allow |

---

## RLS Testing

### Create two users
```
User 1: test-user-1@vortis.dev
User 2: test-user-2@vortis.dev
```

### Test isolation
```sql
-- Login as User 1
-- Try to query User 2's profile
SELECT * FROM public.profiles
WHERE email = 'test-user-2@vortis.dev';

-- Expected: 0 rows (blocked by RLS)

-- Query own profile
SELECT * FROM public.profiles
WHERE email = 'test-user-1@vortis.dev';

-- Expected: 1 row (allowed)
```

---

## Common Issues

### Issue: "Invalid Supabase URL"
**Fix:** Update `.env.local` with real Supabase URL

### Issue: Page keeps redirecting
**Fix:** Clear cookies, restart server

### Issue: Profile not created
**Fix:** Check trigger exists and is enabled

### Issue: Cannot access dashboard
**Fix:** Verify email first via confirmation link

### Issue: Session expired
**Fix:** Login again, session lasts 1 hour by default

---

## Performance Benchmarks

| Action | Expected Time |
|--------|---------------|
| Sign up | < 3 seconds |
| Login | < 2 seconds |
| Dashboard load | < 2 seconds |
| Middleware check | < 100ms |

---

## Supabase Dashboard Checks

### Auth Settings
```
Authentication → Settings → Email Templates
- Confirm signup template enabled
- Magic link template enabled
```

### User Management
```
Authentication → Users
- See all registered users
- Check email_confirmed_at status
- View user metadata
```

### Auth Logs
```
Authentication → Logs
- View all auth events
- Check email sent confirmation
- Copy verification links
```

### Database
```
Database → Tables
- Check profiles table
- Verify RLS policies
- Test queries
```

---

## Test Checklist (Minimal)

- [ ] Sign up with new email
- [ ] Verify email from Supabase logs
- [ ] Login with verified account
- [ ] Access dashboard successfully
- [ ] Logout
- [ ] Access dashboard → redirects to login
- [ ] Check profile created in database
- [ ] Verify RLS blocks other user's data

---

## Critical Paths

### Happy Path (Sign Up → Login)
```
1. /auth/signup → Create account
2. Check email message shown
3. Get verification link from Supabase
4. Click link → Redirected to /dashboard
5. Dashboard loads with user data
6. Logout
7. /auth/login → Sign in
8. Dashboard loads again
```

### Error Path (Wrong Password)
```
1. /auth/login
2. Enter wrong password
3. Error: "Invalid login credentials"
4. Fix password
5. Login successful
```

### Protection Path (Unauthenticated)
```
1. Clear cookies
2. Navigate to /dashboard
3. Redirected to /auth/login
4. Login
5. Redirected back to /dashboard
```

---

## SQL Snippets

### Clean up test users
```sql
-- Delete test users (cascade deletes profiles)
DELETE FROM auth.users
WHERE email LIKE 'test-%@vortis.dev';
```

### Check for orphaned profiles
```sql
SELECT p.*
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.id IS NULL;
```

### Count users by status
```sql
SELECT
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as verified,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unverified,
  COUNT(*) as total
FROM auth.users;
```

---

## Environment Variables

```bash
# Required for auth to work
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Files to Check

### Auth Pages
- `/app/auth/signup/page.tsx`
- `/app/auth/login/page.tsx`
- `/app/auth/callback/route.ts`

### Protected Pages
- `/app/dashboard/layout.tsx`
- `/app/dashboard/page.tsx`

### Configuration
- `/middleware.ts`
- `/lib/supabase/client.ts`
- `/lib/supabase/server.ts`

### Schema
- `/supabase/schema.sql`
- `/supabase/migrations/*.sql`

---

## Browser DevTools Shortcuts

### Check cookies
```
F12 → Application → Cookies → localhost
Look for: sb-*-auth-token
```

### Check network
```
F12 → Network → Filter: Fetch/XHR
Watch for: auth/v1/* requests
```

### Check console
```
F12 → Console
Look for: Supabase errors or warnings
```

### Check local storage
```
F12 → Application → Local Storage → localhost
Look for: supabase-auth-* keys
```

---

## Quick Debug Commands

```bash
# Check if server running
lsof -i :3000

# View server logs
npm run dev

# Check environment loaded
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"

# Test database connection (requires psql)
psql $DATABASE_URL -c "SELECT NOW();"
```

---

## Success Indicators

### Sign Up Success
- See "Check your email" screen
- User in auth.users table
- Profile in public.profiles table
- Email sent (Supabase logs)

### Login Success
- Redirect to /dashboard
- Cookie set in browser
- Session in database
- User email in nav

### Logout Success
- Cookie cleared
- Cannot access /dashboard
- Redirected to login
- Session deleted/expired

### RLS Success
- Can see own profile
- Cannot see others' profiles
- Can update own profile
- Cannot update others' profiles

---

## Test Duration Estimate

- **Quick smoke test:** 5 minutes
- **Basic auth flow:** 15 minutes
- **Complete test suite:** 2 hours
- **Database verification:** 10 minutes
- **RLS testing:** 20 minutes

---

## Contact for Help

- Environment issues → Check `.env.local`
- Database issues → Check Supabase dashboard
- Code issues → Check console errors
- Flow issues → Refer to AUTH_TESTING_CHECKLIST.md
