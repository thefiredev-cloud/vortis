# Clerk Troubleshooting Guide

Common issues, error messages, and solutions for Clerk authentication integration.

## Table of Contents

1. [Setup Issues](#1-setup-issues)
2. [Authentication Errors](#2-authentication-errors)
3. [Webhook Problems](#3-webhook-problems)
4. [Database Sync Issues](#4-database-sync-issues)
5. [Performance Issues](#5-performance-issues)
6. [Build and Deployment Errors](#6-build-and-deployment-errors)

---

## 1. Setup Issues

### Issue: "Clerk publishable key not found"

**Symptoms:**
```
Error: Clerk: Publishable key not found. Please ensure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set in your environment variables.
```

**Causes:**
- Environment variable not set
- Variable name misspelled
- `.env.local` not loaded
- Using placeholder value

**Solutions:**

1. **Check Environment File:**
```bash
cd /Users/tannerosterkamp/vortis
cat .env.local | grep CLERK_PUBLISHABLE
```

2. **Verify Variable Name:**
```bash
# Correct variable name:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Common mistakes:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (missing)
# CLERK_PUBLISHABLE_KEY (missing NEXT_PUBLIC_)
# NEXT_PUBLIC_CLERK_API_KEY (wrong name)
```

3. **Restart Dev Server:**
```bash
# After changing .env.local, always restart
npm run dev
```

4. **Check for Placeholder:**
```bash
# Make sure it's not:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

5. **Verify Key Format:**
```bash
# Should start with:
# pk_test_... (development)
# pk_live_... (production)
```

**Prevention:**
- Copy `.env.example` to `.env.local`
- Get actual keys from Clerk dashboard
- Never commit `.env.local` to git

---

### Issue: "clerk is not defined" or Module Not Found

**Symptoms:**
```
ReferenceError: clerk is not defined
```
or
```
Module not found: Can't resolve '@clerk/nextjs'
```

**Causes:**
- Clerk package not installed
- Wrong import path
- Package version mismatch

**Solutions:**

1. **Install Clerk Package:**
```bash
cd /Users/tannerosterkamp/vortis
npm install @clerk/nextjs
```

2. **Verify Installation:**
```bash
npm list @clerk/nextjs
# Should show: @clerk/nextjs@6.33.3 or similar
```

3. **Check Import Paths:**
```typescript
// ✓ Correct
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignIn, SignUp } from '@clerk/nextjs';

// ✗ Wrong
import { auth } from '@clerk/nextjs'; // Missing /server
import { SignIn } from '@clerk/react'; // Wrong package
```

4. **Clear Cache and Reinstall:**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

---

### Issue: Middleware Not Working

**Symptoms:**
- All routes redirect to sign-in
- Or no routes protected at all

**Causes:**
- Middleware not configured
- Public routes not defined
- Matcher pattern wrong

**Solutions:**

1. **Check Middleware File Exists:**
```bash
ls -la /Users/tannerosterkamp/vortis/middleware.ts
```

2. **Verify Middleware Content:**
```typescript
// Should have:
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

3. **Verify Matcher Config:**
```typescript
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

4. **Restart Server:**
```bash
# Middleware changes require restart
npm run dev
```

---

## 2. Authentication Errors

### Issue: Google OAuth Fails - "Redirect URI Mismatch"

**Symptoms:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request does not match the ones authorized for the OAuth client.
```

**Causes:**
- Redirect URI not configured in Google Console
- Clerk Frontend API URL changed
- Typo in redirect URI

**Solutions:**

1. **Get Clerk Frontend API:**
   - Go to Clerk dashboard > Configure > API Keys
   - Copy "Frontend API" value
   - Example: `clerk.your-app.12345.lcl.dev`

2. **Add to Google Cloud Console:**
   - Go to https://console.cloud.google.com
   - APIs & Services > Credentials
   - Edit OAuth 2.0 Client ID
   - Add to Authorized redirect URIs:
   ```
   https://clerk.your-app.12345.lcl.dev/v1/oauth_callback
   ```

3. **Check for Typos:**
   - No trailing slash
   - Correct subdomain
   - HTTPS (not HTTP)

4. **Wait for Propagation:**
   - Google changes take 5-10 minutes
   - Clear browser cache
   - Try again

---

### Issue: "Session token is invalid"

**Symptoms:**
- Signed in but can't access protected routes
- "Invalid session" errors
- Constant redirects to sign-in

**Causes:**
- Session expired
- Token tampered
- Clock skew between servers
- Clerk secret key mismatch

**Solutions:**

1. **Sign Out and Back In:**
   - Complete sign-out
   - Clear cookies
   - Sign back in

2. **Check Secret Key:**
```bash
# Verify in .env.local:
CLERK_SECRET_KEY=sk_test_...

# Must match Clerk dashboard key
```

3. **Verify System Time:**
```bash
date
# Check if time is correct
# JWT tokens use timestamps
```

4. **Check Session Settings in Clerk:**
   - Clerk dashboard > Sessions
   - Verify session duration
   - Check token lifetime

---

### Issue: Sign-In Button Does Nothing

**Symptoms:**
- Click "Continue with Google"
- Nothing happens
- No error in console

**Causes:**
- JavaScript not loaded
- Clerk script blocked
- Ad blocker interference
- CORS issue

**Solutions:**

1. **Check Console for Errors:**
   - Open DevTools > Console
   - Look for any errors
   - Check Network tab for failed requests

2. **Disable Ad Blocker:**
   - Temporarily disable browser extensions
   - Try sign-in again

3. **Check Clerk Script Loaded:**
```javascript
// In console:
console.log(window.Clerk);
// Should show Clerk object, not undefined
```

4. **Verify Network Requests:**
   - Open DevTools > Network
   - Click sign-in button
   - Look for requests to clerk.com
   - Check for any failures

5. **Check for CORS Issues:**
   - Look for CORS errors in console
   - Verify allowed origins in Clerk dashboard

---

## 3. Webhook Problems

### Issue: Webhook Signature Verification Failed

**Symptoms:**
```
Error: Webhook verification failed
```
or
```
400 Bad Request: Invalid signature
```

**Causes:**
- Wrong webhook secret
- Clerk secret not set
- Signature verification code error
- Request body consumed twice

**Solutions:**

1. **Verify Webhook Secret:**
```bash
# Check .env.local:
CLERK_WEBHOOK_SECRET=whsec_...

# Must start with whsec_
# Get from Clerk dashboard > Webhooks > [Your endpoint] > Signing Secret
```

2. **Check Webhook Handler:**
```typescript
// Make sure webhook secret is loaded:
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
}
```

3. **Don't Consume Body Twice:**
```typescript
// ✓ GOOD - read body once
const payload = await req.json();
const body = JSON.stringify(payload);
const evt = wh.verify(body, headers);

// ✗ BAD - body already consumed
const payload = await req.json(); // First read
const evt = wh.verify(await req.json(), headers); // Second read - fails!
```

4. **Test with Clerk Dashboard:**
   - Go to Webhooks > [Your endpoint]
   - Click "Send test event"
   - Check if verification passes

---

### Issue: Webhooks Not Received Locally

**Symptoms:**
- User created in Clerk
- No webhook received
- Profile not created in Supabase

**Causes:**
- Local server not accessible from internet
- Webhook endpoint URL wrong
- Firewall blocking requests

**Solutions:**

1. **Use Clerk CLI:**
```bash
cd /Users/tannerosterkamp/vortis
npx @clerk/clerk-cli dev

# This forwards webhooks from Clerk to localhost
```

2. **Or Use Ngrok:**
```bash
# Start local server
npm run dev

# In another terminal:
ngrok http 3000

# Copy ngrok URL to Clerk webhook endpoint
# Example: https://abc123.ngrok.io/api/webhooks/clerk
```

3. **Or Use Cloudflare Tunnel:**
```bash
cloudflared tunnel --url http://localhost:3000

# Copy Cloudflare URL to Clerk webhook endpoint
```

4. **Verify Endpoint URL:**
   - Clerk dashboard > Webhooks
   - Check endpoint URL is correct
   - Test endpoint with "Send test event"

---

### Issue: Webhook Received but Profile Not Created

**Symptoms:**
- Webhook returns 200 OK
- But no profile in Supabase

**Causes:**
- Database connection error
- Missing required fields
- RLS policies blocking insert
- Webhook handler code error

**Solutions:**

1. **Check Webhook Logs:**
```typescript
// Add logging to webhook handler:
console.log('Webhook received:', evt.type);
console.log('User data:', evt.data);

try {
  const result = await supabase.from('profiles').insert({...});
  console.log('Insert result:', result);
} catch (err) {
  console.error('Insert error:', err);
}
```

2. **Verify Supabase Connection:**
```bash
# Check environment variables:
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# Or
SUPABASE_SERVICE_ROLE_KEY=eyJ... (for bypassing RLS)
```

3. **Check RLS Policies:**
```sql
-- Disable RLS temporarily for testing:
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Or add policy for service role:
CREATE POLICY "Service role can insert" ON profiles
FOR INSERT
TO service_role
USING (true);
```

4. **Test Insert Manually:**
```typescript
// Test Supabase insert directly:
const { data, error } = await supabase
  .from('profiles')
  .insert({
    clerk_id: 'test_user_123',
    email: 'test@example.com',
  });

console.log('Data:', data);
console.log('Error:', error);
```

---

## 4. Database Sync Issues

### Issue: User Exists in Clerk, Not in Supabase

**Symptoms:**
- User can sign in
- Dashboard loads
- But profile query returns null

**Causes:**
- Webhook failed during sign-up
- Database was down
- Sync never triggered

**Solutions:**

1. **Manually Create Profile:**
```sql
INSERT INTO profiles (clerk_id, email, full_name)
VALUES ('user_2abc123', 'user@example.com', 'John Doe');
```

2. **Run Backfill Script:**
```typescript
// scripts/backfill-profiles.ts
import { clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function backfill() {
  const users = await clerkClient.users.getUserList({ limit: 500 });

  for (const user of users) {
    await supabase.from('profiles').upsert({
      clerk_id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      full_name: `${user.firstName} ${user.lastName}`.trim(),
      avatar_url: user.imageUrl,
    }, { onConflict: 'clerk_id' });
  }
}

backfill();
```

```bash
npx tsx scripts/backfill-profiles.ts
```

3. **Retry Failed Webhooks:**
   - Go to Clerk dashboard > Webhooks
   - Find failed webhooks
   - Click "Resend"

---

### Issue: Duplicate Profiles Created

**Symptoms:**
- Same user has multiple profile rows
- Queries return multiple results

**Causes:**
- No unique constraint on clerk_id
- Webhook sent multiple times
- Race condition in webhook handler

**Solutions:**

1. **Add Unique Constraint:**
```sql
-- Add constraint if missing:
ALTER TABLE profiles
ADD CONSTRAINT profiles_clerk_id_unique UNIQUE (clerk_id);
```

2. **Use Upsert Instead of Insert:**
```typescript
// ✓ GOOD - upsert prevents duplicates
await supabase
  .from('profiles')
  .upsert({
    clerk_id: user.id,
    email: user.email,
  }, { onConflict: 'clerk_id' });

// ✗ BAD - insert creates duplicates
await supabase
  .from('profiles')
  .insert({
    clerk_id: user.id,
    email: user.email,
  });
```

3. **Clean Up Duplicates:**
```sql
-- Keep oldest profile, delete rest
DELETE FROM profiles a
USING profiles b
WHERE a.id > b.id
AND a.clerk_id = b.clerk_id;
```

---

## 5. Performance Issues

### Issue: Slow Page Loads with Clerk

**Symptoms:**
- Pages take > 3 seconds to load
- Dashboard slow to render
- Auth check delays page

**Solutions:**

1. **Use Server Components:**
```typescript
// ✓ GOOD - server component, fast
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId } = await auth(); // Fast on server
  return <Dashboard userId={userId} />;
}

// ✗ SLOW - client component, slower
'use client';
import { useUser } from '@clerk/nextjs';

export default function DashboardPage() {
  const { user } = useUser(); // Client-side fetch
  return <Dashboard user={user} />;
}
```

2. **Enable Edge Runtime:**
```typescript
export const runtime = 'edge';

export async function GET() {
  const { userId } = await auth();
  // Runs on edge, faster
}
```

3. **Cache User Data:**
```typescript
import { cache } from 'react';

export const getUser = cache(async (userId: string) => {
  // Cached for request duration
  return await supabase.from('profiles').select('*').eq('clerk_id', userId).single();
});
```

4. **Optimize Bundle Size:**
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const ClerkComponents = dynamic(() => import('@clerk/nextjs'));
```

---

## 6. Build and Deployment Errors

### Issue: Build Fails with Clerk Type Errors

**Symptoms:**
```
Type error: Property 'userId' does not exist on type 'Auth'
```

**Solutions:**

1. **Update TypeScript:**
```bash
npm install -D typescript@latest
```

2. **Check Imports:**
```typescript
// Correct imports for Next.js 15:
import { auth, currentUser } from '@clerk/nextjs/server';
```

3. **Clean Build:**
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

---

### Issue: Production Deployment - "Unauthorized"

**Symptoms:**
- Works in development
- 401 errors in production
- Can't sign in

**Solutions:**

1. **Check Production Keys:**
```bash
# Make sure production uses pk_live_/sk_live_
# NOT pk_test_/sk_test_
```

2. **Verify Environment Variables:**
   - Hosting platform (Vercel/Railway/etc.)
   - Add all Clerk env vars
   - Use production keys

3. **Check Domains:**
   - Clerk dashboard > Domains
   - Add production domain
   - Match exactly (www vs non-www)

4. **HTTPS Required:**
   - Production must use HTTPS
   - Clerk requires secure connection

---

## 7. Quick Diagnostic Commands

### Check Setup

```bash
# Check all Clerk env vars
cd /Users/tannerosterkamp/vortis
grep "CLERK" .env.local

# Expected output:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
# CLERK_WEBHOOK_SECRET=whsec_...
```

### Test API Connection

```bash
# Test protected API route
curl -I http://localhost:3000/api/user/profile

# Expected: 401 Unauthorized (when not signed in)
```

### Check Build

```bash
# Verify build succeeds
npm run build

# Expected: No errors
```

### Check Webhook

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 (missing headers) or 200 if handled
```

---

## 8. Getting Help

### Clerk Support

- **Documentation:** https://clerk.com/docs
- **Discord:** https://clerk.com/discord
- **Support:** support@clerk.com

### Debug Checklist

Before asking for help, collect:
- [ ] Exact error message
- [ ] Browser console errors
- [ ] Network tab (failed requests)
- [ ] Clerk version: `npm list @clerk/nextjs`
- [ ] Next.js version: `npm list next`
- [ ] Environment (dev/production)
- [ ] Steps to reproduce

---

## Next Steps

- Review complete testing checklist: `/Users/tannerosterkamp/vortis/CLERK_TESTING_CHECKLIST.md`
- Check environment testing matrix: `/Users/tannerosterkamp/vortis/docs/CLERK_ENV_TESTING.md`
