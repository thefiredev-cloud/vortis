# Clerk Performance Testing

Performance benchmarks and optimization testing for Clerk authentication in Vortis.

## Overview

This guide covers performance testing for authentication flows, page load times, and optimization strategies to ensure a fast user experience.

---

## 1. Page Load Time with Clerk

### Test 1.1: Homepage Load (Unauthenticated)

**Objective:** Measure homepage load time without authentication

**Steps:**
```bash
# Start dev server
cd /Users/tannerosterkamp/vortis
npm run dev

# In browser DevTools > Performance
# 1. Clear cache
# 2. Start recording
# 3. Navigate to http://localhost:3000
# 4. Stop recording when page fully loaded
```

**Benchmarks:**
- **Time to First Byte (TTFB):** < 200ms
- **First Contentful Paint (FCP):** < 1.0s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.0s
- **Cumulative Layout Shift (CLS):** < 0.1

**Clerk Impact:**
- Clerk scripts should load async/defer
- Minimal blocking on initial render

**Checklist:**
- [ ] TTFB < 200ms
- [ ] FCP < 1.0s
- [ ] LCP < 2.5s
- [ ] TTI < 3.0s
- [ ] No layout shifts from Clerk components

---

### Test 1.2: Dashboard Load (Authenticated)

**Objective:** Measure dashboard load time with authentication check

**Steps:**
1. Sign in
2. Clear browser cache (keep auth cookies)
3. Open DevTools > Performance
4. Navigate to `/dashboard`
5. Measure metrics

**Benchmarks:**
- **Auth Check:** < 100ms
- **First Paint:** < 800ms
- **Full Page Load:** < 2.0s
- **User Data Fetch:** < 500ms

**Network Waterfall:**
```
0ms    - Request /dashboard
50ms   - HTML response
100ms  - Auth verification (middleware)
150ms  - Fetch user data from Clerk
200ms  - Fetch profile from Supabase
300ms  - Render complete
```

**Measure with Code:**
```typescript
// Add to dashboard page
console.time('dashboard-load');

export default async function DashboardPage() {
  const { userId } = await auth();
  console.timeLog('dashboard-load', 'Auth checked');

  const user = await currentUser();
  console.timeLog('dashboard-load', 'User fetched');

  // Fetch Supabase data
  const profile = await getProfile(userId);
  console.timeLog('dashboard-load', 'Profile fetched');

  console.timeEnd('dashboard-load');

  return <Dashboard user={user} profile={profile} />;
}
```

**Expected Console Output:**
```
dashboard-load: 80ms Auth checked
dashboard-load: 150ms User fetched
dashboard-load: 250ms Profile fetched
dashboard-load: 300ms
```

**Checklist:**
- [ ] Auth check < 100ms
- [ ] User data fetch < 200ms
- [ ] Total load < 2s
- [ ] No blocking requests
- [ ] Data fetched in parallel where possible

---

## 2. Authentication Check Latency

### Test 2.1: Middleware Performance

**Objective:** Measure auth check overhead in middleware

**Test File:** `/Users/tannerosterkamp/vortis/scripts/test-middleware-perf.ts`

```typescript
import { NextRequest } from 'next/server';
import { performance } from 'perf_hooks';

async function testMiddlewarePerf() {
  const iterations = 100;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();

    // Simulate auth check
    const request = new NextRequest(new URL('http://localhost:3000/dashboard'));
    // Middleware auth check would happen here

    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log('Middleware Performance:');
  console.log(`  Average: ${avg.toFixed(2)}ms`);
  console.log(`  Min: ${min.toFixed(2)}ms`);
  console.log(`  Max: ${max.toFixed(2)}ms`);
}

testMiddlewarePerf();
```

**Benchmarks:**
- **Average:** < 50ms
- **P95:** < 100ms
- **P99:** < 150ms

**Optimization Tips:**
- Use Clerk's edge runtime
- Cache auth checks where possible
- Minimize database calls in middleware

---

### Test 2.2: Protected Route Access Speed

**Objective:** Measure time from request to authenticated response

**Steps:**
```bash
# Measure API route response time
curl -w "\nTime: %{time_total}s\n" \
  -H "Cookie: __session=your_session_token" \
  http://localhost:3000/api/user/profile
```

**Benchmarks:**
- **With Valid Session:** < 100ms
- **With Expired Session:** < 200ms (redirect)
- **Without Session:** < 50ms (immediate reject)

---

## 3. Sign-In Performance

### Test 3.1: Google OAuth Flow Speed

**Objective:** Measure complete sign-in flow duration

**Steps:**
1. Start on `/sign-in`
2. Click "Continue with Google"
3. Google consent screen loads
4. Approve
5. Redirect back to Vortis
6. Land on `/dashboard`

**Measure:**
```typescript
// Add to sign-in page
localStorage.setItem('sign-in-start', Date.now().toString());

// Add to dashboard page
const start = parseInt(localStorage.getItem('sign-in-start') || '0');
const duration = Date.now() - start;
console.log('Sign-in flow duration:', duration, 'ms');
localStorage.removeItem('sign-in-start');
```

**Benchmarks:**
- **Button Click → Google Consent:** < 1.0s
- **Google Consent → Approval:** User dependent
- **Approval → Dashboard Load:** < 2.0s
- **Total (excluding user interaction):** < 3.0s

**Breakdown:**
```
0ms     - Click "Continue with Google"
500ms   - Redirect to Google
[User approves]
1000ms  - Google callback to Clerk
1500ms  - Clerk creates session
2000ms  - Redirect to /dashboard
2500ms  - Dashboard loads
```

---

### Test 3.2: Session Creation Speed

**Objective:** Measure Clerk session creation time

**Monitor:**
- Network tab for Clerk API calls
- Look for `/v1/client/sessions` or similar
- Measure response time

**Benchmarks:**
- **Session Creation:** < 500ms
- **Token Generation:** < 200ms

---

## 4. Webhook Processing Time

### Test 4.1: Webhook Handler Performance

**Objective:** Measure webhook processing speed

**Add Timing to Webhook:**
```typescript
export async function POST(req: Request) {
  console.time('webhook-processing');

  console.time('webhook-verification');
  // Verify signature
  const evt = wh.verify(body, headers);
  console.timeEnd('webhook-verification');

  console.time('webhook-handler');
  switch (evt.type) {
    case 'user.created':
      console.time('create-profile');
      await handleUserCreated(evt.data);
      console.timeEnd('create-profile');
      break;
  }
  console.timeEnd('webhook-handler');

  console.timeEnd('webhook-processing');

  return new Response('OK', { status: 200 });
}
```

**Expected Output:**
```
webhook-verification: 15ms
create-profile: 120ms
webhook-handler: 125ms
webhook-processing: 145ms
```

**Benchmarks:**
- **Signature Verification:** < 50ms
- **Database Insert:** < 200ms
- **Total Processing:** < 300ms
- **Webhook Response:** < 500ms

---

### Test 4.2: Concurrent Webhook Handling

**Objective:** Test webhook processing under load

**Simulate:**
```bash
# Send multiple webhooks simultaneously
for i in {1..10}; do
  (curl -X POST http://localhost:3000/api/webhooks/clerk \
    -H "Content-Type: application/json" \
    -d '{"type":"user.created","data":{}}' &)
done
wait
```

**Benchmarks:**
- All webhooks complete < 1.0s
- No timeouts
- No errors
- Database handles concurrent writes

---

## 5. Database Sync Speed

### Test 5.1: Profile Creation Latency

**Objective:** Measure time from sign-up to profile availability

**Steps:**
1. Sign up new user
2. Note timestamp
3. Query Supabase for profile
4. Calculate latency

**Script:**
```typescript
const signupTime = Date.now();

// After sign-up
async function checkProfile(clerkId: string) {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_id', clerkId)
      .single();

    if (data) {
      const latency = Date.now() - signupTime;
      console.log(`Profile created in ${latency}ms`);
      return;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.error('Profile not created within 5 seconds');
}
```

**Benchmarks:**
- **P50 (median):** < 1.0s
- **P95:** < 2.0s
- **P99:** < 3.0s

---

## 6. Bundle Size Impact

### Test 6.1: Clerk Package Size

**Objective:** Measure Clerk's impact on bundle size

**Analyze Bundle:**
```bash
cd /Users/tannerosterkamp/vortis
npm run build

# Check build output for page sizes
# Look for Clerk-related chunks
```

**Expected Output:**
```
Route (app)                Size     First Load JS
┌ ○ /                      5 kB     90 kB
├ ○ /dashboard            12 kB     120 kB
└ ○ /sign-in               8 kB     95 kB

Clerk SDK: ~35 kB gzipped
```

**Benchmarks:**
- **Clerk SDK:** < 50 kB gzipped
- **Homepage with Clerk:** < 100 kB initial JS
- **Dashboard with Clerk:** < 150 kB

**Optimization:**
```typescript
// Use dynamic imports for Clerk UI components
import dynamic from 'next/dynamic';

const SignIn = dynamic(() => import('@clerk/nextjs').then(m => m.SignIn), {
  loading: () => <div>Loading...</div>,
});
```

---

## 7. API Route Performance

### Test 7.1: Authenticated API Endpoint Speed

**Objective:** Measure API route response time with auth

**Test Endpoint:**
```typescript
// app/api/user/profile/route.ts
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const start = Date.now();

  const { userId } = await auth();
  const authTime = Date.now() - start;

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(userId);
  const totalTime = Date.now() - start;

  console.log(`Auth: ${authTime}ms, Total: ${totalTime}ms`);

  return Response.json(profile);
}
```

**Benchmarks:**
- **Auth Check:** < 50ms
- **Data Fetch:** < 100ms
- **Total:** < 150ms

**Load Test:**
```bash
# Test with hey or apache bench
hey -n 100 -c 10 http://localhost:3000/api/user/profile

# Expected results:
# Mean latency: < 200ms
# P95: < 300ms
# Success rate: 100%
```

---

## 8. Memory and CPU Usage

### Test 8.1: Server Resource Usage

**Objective:** Monitor resource usage with Clerk

**Monitor During Load:**
```bash
# Start dev server
npm run dev

# In another terminal, monitor resources
top -pid $(pgrep -f "next-server")

# Or use node inspector
node --inspect node_modules/next/dist/bin/next dev
```

**Benchmarks:**
- **Idle Memory:** < 100 MB
- **Under Load:** < 300 MB
- **CPU (idle):** < 5%
- **CPU (load):** < 50%

---

## 9. Caching Optimization

### Test 9.1: Clerk Token Caching

**Objective:** Verify Clerk tokens are cached appropriately

**Check Cache Headers:**
```bash
curl -I http://localhost:3000/api/user/profile \
  -H "Cookie: __session=token"

# Look for:
# Cache-Control: private, max-age=0
```

**Clerk Session Caching:**
- Clerk caches session data internally
- Tokens refreshed automatically
- No unnecessary refetches

---

## 10. Performance Monitoring in Production

### Test 10.1: Real User Monitoring (RUM)

**Setup Monitoring:**
```typescript
// Add to app/layout.tsx
import { useEffect } from 'react';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Track page load performance
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        // Send to analytics
        fetch('/api/analytics/performance', {
          method: 'POST',
          body: JSON.stringify({
            pageLoadTime,
            ttfb: perfData.responseStart - perfData.navigationStart,
            domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          }),
        });
      });
    }
  }, []);

  return <html>{children}</html>;
}
```

---

## 11. Performance Test Checklist

**Before marking performance testing complete:**

### Page Load
- [ ] Homepage loads < 2.5s
- [ ] Dashboard loads < 2.0s (authenticated)
- [ ] TTFB < 200ms
- [ ] LCP < 2.5s
- [ ] No layout shifts

### Authentication
- [ ] Auth check < 100ms
- [ ] Sign-in flow < 3s (excl. user input)
- [ ] Session creation < 500ms
- [ ] Middleware overhead < 50ms

### Webhooks
- [ ] Webhook processing < 300ms
- [ ] Signature verification < 50ms
- [ ] Database insert < 200ms
- [ ] Handles concurrent webhooks

### Database Sync
- [ ] Profile creation < 1s (median)
- [ ] Profile creation < 3s (P99)
- [ ] Updates sync < 2s

### Bundle Size
- [ ] Clerk SDK < 50 kB gzipped
- [ ] Homepage bundle < 100 kB
- [ ] Dashboard bundle < 150 kB

### API Performance
- [ ] API auth check < 50ms
- [ ] API total response < 150ms
- [ ] Handles 100+ req/s

### Resources
- [ ] Memory usage < 300 MB
- [ ] CPU usage < 50% under load
- [ ] No memory leaks

---

## 12. Optimization Recommendations

### Implement Edge Runtime
```typescript
// Use Edge Runtime for auth checks
export const runtime = 'edge';

import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  // ...
}
```

### Use Server Components
```typescript
// Fetch auth on server, no client JS needed
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId } = await auth();
  // Server-side rendering, fast!
}
```

### Optimize Clerk Script Loading
```typescript
// In app/layout.tsx
<head>
  <Script
    src="https://[clerk-frontend-api].clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    strategy="afterInteractive" // Don't block rendering
  />
</head>
```

### Cache User Data
```typescript
// Cache user profile data
import { cache } from 'react';

export const getProfile = cache(async (userId: string) => {
  // Cached for the duration of the request
  return await supabase.from('profiles').select('*').eq('clerk_id', userId).single();
});
```

---

## Next Steps

After completing performance testing:

1. **Security Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_SECURITY_TESTING.md`

2. **Manual Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_MANUAL_TESTING.md`
