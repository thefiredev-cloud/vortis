# Cloudflare Security & Performance Optimization

Advanced configuration guide for maximizing security and performance with Cloudflare + Vercel + Next.js.

---

## Table of Contents

1. [Security Hardening](#security-hardening)
2. [Performance Optimization](#performance-optimization)
3. [Advanced Caching Strategies](#advanced-caching-strategies)
4. [DDoS Protection](#ddos-protection)
5. [Bot Management](#bot-management)
6. [Rate Limiting Strategies](#rate-limiting-strategies)
7. [Monitoring & Alerting](#monitoring--alerting)

---

## Security Hardening

### HTTP Security Headers

Add comprehensive security headers via Cloudflare Transform Rules.

**Create Transform Rule: Security Headers**

```
Cloudflare Dashboard → Rules → Transform Rules → HTTP Response Header Modifications
```

**Rule Configuration:**

```
When incoming requests match: All incoming requests

Then:
  Set static headers:

    # Prevent MIME type sniffing
    X-Content-Type-Options: nosniff

    # Clickjacking protection
    X-Frame-Options: SAMEORIGIN

    # Enable browser XSS protection
    X-XSS-Protection: 1; mode=block

    # Referrer policy
    Referrer-Policy: strict-origin-when-cross-origin

    # Permissions policy (disable unnecessary features)
    Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()
```

### Content Security Policy (CSP)

**For Vortis (with Supabase, Stripe, Google OAuth):**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com https://*.supabase.co;
  style-src 'self' 'unsafe-inline' https://accounts.google.com;
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://api.stripe.com https://accounts.google.com;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://accounts.google.com;
  frame-ancestors 'self';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
```

**Note:** Adjust based on your specific third-party integrations.

**Implementation Options:**

**Option 1: Cloudflare Transform Rule**
```
Add header: Content-Security-Policy
Value: [CSP string above]
```

**Option 2: Next.js Config (better for development)**
```typescript
// /Users/tannerosterkamp/vortis/next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com https://*.supabase.co",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com https://accounts.google.com",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  }
}
```

**CSP Reporting (Optional):**

Add to CSP:
```
report-uri https://yourdomain.com/api/csp-report;
report-to csp-endpoint;
```

Create API route to log violations:
```typescript
// app/api/csp-report/route.ts
export async function POST(request: Request) {
  const report = await request.json();
  console.error('CSP Violation:', report);
  // Log to your monitoring service
  return new Response('OK', { status: 200 });
}
```

### HSTS Configuration

**Strict Transport Security with Preloading:**

```
Cloudflare Dashboard → SSL/TLS → Edge Certificates → HSTS

Settings:
  Status: Enabled
  Max Age: 31536000 (1 year) - for production
  Include subdomains: ON
  Preload: ON (only if committed to HTTPS forever)
  No-Sniff Header: ON
```

**HSTS Preload Submission (Optional but Recommended):**

1. Visit: https://hstspreload.org
2. Enter your domain
3. Check requirements are met
4. Submit for preload list
5. Wait 2-3 months for inclusion in browsers

**Warning:** Preload is permanent. Only enable if you're certain your domain will always use HTTPS.

### IP Reputation & Geoblocking

**Block High-Risk Countries (if applicable):**

```
Cloudflare Dashboard → Security → WAF → Custom Rules

Rule: Block High-Risk Regions
When incoming requests match:
  Country is one of: [select high-risk countries you don't serve]
Then:
  Block
```

**Example (adjust based on your user base):**
```
Block countries with high bot traffic that you don't serve:
- CN (China) - if you don't have Chinese users
- RU (Russia) - if you don't serve Russian market
- KP (North Korea)
```

**Whitelist Known Good IPs:**

```
Rule: Whitelist Office IPs
When incoming requests match:
  IP address is in: your.office.ip.address
Then:
  Skip: All remaining rules
Priority: 1 (highest)
```

### API Security

**Require Authentication Headers:**

```typescript
// /Users/tannerosterkamp/vortis/middleware.ts or API routes
export async function middleware(request: NextRequest) {
  // For API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip auth check for webhooks (they have their own verification)
    if (request.nextUrl.pathname.includes('/webhook')) {
      return NextResponse.next();
    }

    // Require authentication for all other API routes
    const session = await getSession(request);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  return NextResponse.next();
}
```

### Webhook Security

**Stripe Webhook IP Whitelist:**

```
Cloudflare Dashboard → Security → WAF → Custom Rules

Rule: Stripe Webhook Whitelist
When incoming requests match:
  URI Path equals /api/stripe/webhook
  AND IP address is not in:
    3.18.12.63
    3.130.192.231
    13.235.14.237
    13.235.122.149
    18.211.135.69
    35.154.171.200
    52.15.183.38
    54.187.174.169
    54.187.205.235
    54.187.216.72
Then:
  Block
```

**Verify current IPs:** https://stripe.com/docs/ips

### Supabase Security

**API Key Protection:**

```typescript
// Never expose SUPABASE_SERVICE_ROLE_KEY in frontend
// Only use in server-side code (API routes, server actions)

// Frontend - use anon key (safe)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Backend - use service role (never expose)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // NOT PUBLIC
);
```

### Enable DNSSEC

```
Cloudflare Dashboard → DNS → Settings → DNSSEC

Enable DNSSEC:
  1. Click "Enable DNSSEC"
  2. Copy DS record
  3. Add to domain registrar
  4. Wait for validation (usually 1-24 hours)
```

**Why:** Protects against DNS spoofing and cache poisoning attacks.

---

## Performance Optimization

### Advanced Caching Configuration

**Tiered Caching (Pro Plan and Above):**

```
Cloudflare Dashboard → Caching → Tiered Cache

Tiered Cache: ON
```

**Result:** Reduces requests to origin by 60-80% by using Cloudflare's upper-tier cache.

### Cache Everything with Bypass Rules

**Strategy:**

1. Cache everything by default (aggressive)
2. Create specific bypass rules for dynamic content

**Page Rule 1: Cache HTML Pages**
```
URL: yourdomain.com/*
Settings:
  Cache Level: Cache Everything
  Edge Cache TTL: 5 minutes
  Browser Cache TTL: 5 minutes
Priority: 3 (lower priority)
```

**Page Rule 2: Bypass API Cache**
```
URL: yourdomain.com/api/*
Settings:
  Cache Level: Bypass
Priority: 1 (highest priority)
```

**Page Rule 3: Bypass Dashboard Cache**
```
URL: yourdomain.com/dashboard*
Settings:
  Cache Level: Bypass
Priority: 2
```

### Argo Smart Routing

```
Cloudflare Dashboard → Traffic → Argo

Argo Smart Routing: ON
Cost: $5/month + $0.10/GB
```

**Performance Improvement:**
- 30% faster on average
- Routes through fastest Cloudflare network paths
- Reduces packet loss
- Best for global user base

**ROI Calculation:**
```
If traffic > 50GB/month and global users:
  Cost: ~$10/month
  Time saved per user: ~200ms
  User experience improvement: Significant
  Recommended: Yes
```

### Image Optimization

**Option 1: Use Next.js Image Optimization (Default)**

```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={85} // 85 is good balance
  loading="lazy" // Lazy load offscreen images
  placeholder="blur" // Show blur while loading (optional)
  blurDataURL="data:image/..." // Blur placeholder data
/>
```

**Option 2: Cloudflare Polish (Pro Plan)**

```
Cloudflare Dashboard → Speed → Optimization

Polish: Lossless (or Lossy)
WebP: ON
```

**Comparison:**
- **Next.js:** More control, better for complex use cases
- **Cloudflare Polish:** Set it and forget it, works for all images
- **Best:** Use both (they don't conflict)

**Option 3: Cloudflare Images (Advanced)**

```
Cost: $5/month for 100,000 images
Benefits:
  - Automatic resizing
  - Format conversion (WebP, AVIF)
  - CDN delivery
  - Simpler than Next.js images for large catalogs
```

### Early Hints (HTTP 103)

```
Cloudflare Dashboard → Speed → Optimization

Early Hints: ON
```

**What it does:**
- Sends Link headers before full response
- Browser starts loading critical assets earlier
- Reduces time to interactive by 100-200ms

**Example header sent:**
```
HTTP/1.1 103 Early Hints
Link: </_next/static/css/app.css>; rel=preload; as=style
Link: </_next/static/js/app.js>; rel=preload; as=script
```

### HTTP/3 with QUIC

```
Cloudflare Dashboard → Network → HTTP/3 (with QUIC)

HTTP/3: ON
```

**Benefits:**
- Faster connection establishment
- Better mobile performance
- Handles packet loss better
- ~15% faster on mobile networks

### Prefetching Strategies

**Implement in Next.js:**

```typescript
// app/layout.tsx
import { prefetch } from 'next/navigation';

// Prefetch critical pages
export default function RootLayout({ children }) {
  useEffect(() => {
    // Prefetch dashboard when user lands on homepage
    if (isLoggedIn) {
      prefetch('/dashboard');
    }
  }, [isLoggedIn]);

  return <html>{children}</html>;
}
```

**Use Link with prefetch:**

```typescript
import Link from 'next/link';

<Link href="/dashboard" prefetch={true}>
  Go to Dashboard
</Link>
```

### Bundle Size Optimization

**Analyze bundle:**

```bash
cd /Users/tannerosterkamp/vortis

# Build with analysis
ANALYZE=true npm run build
```

**Common optimizations:**

```typescript
// 1. Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false // Don't server-side render if not needed
});

// 2. Import only what you need
import { Button } from '@/components/ui/button'; // Good
import * as UI from '@/components/ui'; // Bad (imports everything)

// 3. Remove unused dependencies
npm prune

// 4. Use lighter alternatives
// lodash → lodash-es or native methods
// moment → date-fns (90% smaller)
```

### Edge Caching for API Routes (Advanced)

For read-heavy APIs, cache at edge:

```typescript
// app/api/analyze/[symbol]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  const { symbol } = params;

  // Check cache first (implement with Cloudflare KV if using Workers)
  // Or use Vercel Edge Config

  const data = await fetchStockData(symbol);

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      // Cache for 5 minutes at edge
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      // Tell Cloudflare to cache
      'CDN-Cache-Control': 'public, max-age=300',
    },
  });
}
```

---

## Advanced Caching Strategies

### Stale-While-Revalidate

Serve stale content while fetching fresh:

```typescript
// In API route
headers: {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
}

// Explanation:
// - Cache for 60 seconds (fresh)
// - For next 300 seconds, serve stale while fetching fresh in background
// - User gets instant response, next user gets fresh data
```

### Vary Header for Different Content

```typescript
// Serve different content based on auth status
headers: {
  'Vary': 'Authorization, Cookie',
  'Cache-Control': 'private, max-age=300'
}
```

### Cache Segmentation

**Create different caches for different user types:**

```
Cloudflare Dashboard → Cache → Custom Cache Keys (Enterprise)

Segment cache by:
  - Cookie: user_tier (free, pro, enterprise)
  - Header: Accept-Language
  - Query string: version
```

---

## DDoS Protection

### Always-On Protection (Automatic)

Cloudflare provides automatic DDoS protection:
- Unmetered mitigation
- Protects against Layer 3/4 attacks (network)
- Protects against Layer 7 attacks (application)
- No configuration needed

### Under Attack Mode

For active attacks:

```
Cloudflare Dashboard → Overview → Quick Actions → Under Attack Mode

When enabled:
  - All visitors see JavaScript challenge before accessing site
  - Blocks most bots and attacks
  - Temporarily degrades user experience
  - Use only during active attacks
```

**Automate with API (Advanced):**

```bash
# Enable Under Attack Mode
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/security_level" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"under_attack"}'

# Disable after attack subsides
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/security_level" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"medium"}'
```

### Challenge Passage Tuning

```
Cloudflare Dashboard → Security → Settings

Challenge Passage: 30 minutes (recommended)
```

**Tuning:**
- **15 minutes:** More secure, more challenges
- **30 minutes:** Balanced (recommended)
- **1 hour:** Less challenges, less secure

---

## Bot Management

### Bot Fight Mode (Free)

```
Cloudflare Dashboard → Security → Bots

Bot Fight Mode: ON
```

**What it blocks:**
- Known bots
- Headless browsers
- Automated scripts
- Scrapers

**What it allows:**
- Verified bots (Google, Bing, etc.)
- Legitimate users

### Super Bot Fight Mode (Pro)

```
Settings:
  Definitely automated: Block
  Verified bots: Allow (search engines, monitoring tools)
  Likely automated: Managed Challenge
  JavaScript Detections: ON
```

**More granular control:**
- Static resource protection
- AI bot detection
- More accurate classification

### Custom Bot Rules

**Allow specific bots:**

```
Cloudflare Dashboard → Security → WAF → Custom Rules

Rule: Allow Monitoring Tools
When incoming requests match:
  User Agent contains "UptimeRobot"
  OR User Agent contains "Pingdom"
Then:
  Skip: Bot Fight Mode
```

**Block bad bots:**

```
Rule: Block Known Scrapers
When incoming requests match:
  User Agent contains "scrapy"
  OR User Agent contains "python-requests"
  OR User Agent contains "curl" (careful with this)
Then:
  Block
```

---

## Rate Limiting Strategies

### Endpoint-Specific Limits (Pro Plan)

**Login Protection:**

```
Cloudflare Dashboard → Security → WAF → Rate limiting rules

Rule: Login Rate Limit
Characteristics:
  - URI Path equals: /api/auth/login
  - Method: POST
Action: Block for 1 hour
When rate exceeds: 5 requests per 1 minute
Counting: Based on IP address
```

**API Protection:**

```
Rule: API Rate Limit
Characteristics:
  - URI Path starts with: /api/
  - Method: POST, PUT, DELETE
Action: Managed Challenge for 30 minutes
When rate exceeds: 100 requests per 10 minutes
Counting: Based on IP address
```

**Signup Protection:**

```
Rule: Signup Rate Limit
Characteristics:
  - URI Path equals: /api/auth/signup
  - Method: POST
Action: Block for 24 hours
When rate exceeds: 3 requests per 1 hour
Counting: Based on IP address
```

**Search/Analyze Rate Limit:**

```
Rule: Analyze Rate Limit
Characteristics:
  - URI Path starts with: /api/analyze/
  - Method: GET, POST
Action: Challenge for 15 minutes
When rate exceeds: 30 requests per 5 minutes
Counting: Based on IP + Cookie (to limit per user, not just IP)
```

### Gradual Rate Limiting

```
Rule 1: Warning (100 req/min)
  Action: Log only

Rule 2: Challenge (150 req/min)
  Action: Managed Challenge for 10 minutes

Rule 3: Block (200 req/min)
  Action: Block for 1 hour
```

---

## Monitoring & Alerting

### Critical Alerts

**SSL Certificate Expiration:**

```
Cloudflare Dashboard → Notifications

Alert: Universal SSL Certificate
When: 30 days before expiry
Send to: team@yourdomain.com
```

**Traffic Spike:**

```
Alert: Traffic Anomaly
When: Traffic increases 500% in 5 minutes
Send to: ops@yourdomain.com
```

**Error Rate Spike:**

```
Alert: HTTP Error Rate
When: >100 5xx errors in 5 minutes
Send to: dev@yourdomain.com
```

**Security Events:**

```
Alert: Security Events
When: >1000 threats blocked in 5 minutes
Send to: security@yourdomain.com
```

**Origin Health:**

```
Alert: Origin Unreachable
When: Origin server doesn't respond
Send to: ops@yourdomain.com
```

### Logging

**Enable Logpull (Pro and above):**

```bash
# Install logpull CLI
npm install -g cloudflare-logpull

# Pull logs
cloudflare-logpull \
  --zone-id=YOUR_ZONE_ID \
  --auth-key=YOUR_API_KEY \
  --start-time="2025-01-01T00:00:00Z" \
  --end-time="2025-01-01T01:00:00Z"
```

**Analyze logs:**

```bash
# Count requests by country
cat logs.json | jq '.ClientCountry' | sort | uniq -c | sort -rn

# Find slow requests
cat logs.json | jq 'select(.OriginResponseTime > 1000)'

# Find security threats
cat logs.json | jq 'select(.WAFAction != "pass")'
```

### Custom Metrics

**Track with Cloudflare Workers Analytics:**

```typescript
// In Cloudflare Worker (if using hybrid deployment)
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const start = Date.now();
    const response = await fetch(request);
    const duration = Date.now() - start;

    // Log custom metrics
    ctx.waitUntil(
      env.ANALYTICS.put(`response_time_${request.url}`, duration)
    );

    return response;
  }
};
```

---

## Performance Benchmarking

### Baseline Metrics

**Before Cloudflare:**
```
TTFB: 800ms
Load Time: 3.5s
LCP: 2.8s
FID: 150ms
CLS: 0.15
```

**After Cloudflare (Expected):**
```
TTFB: 400ms (50% improvement)
Load Time: 2.0s (43% improvement)
LCP: 1.5s (46% improvement)
FID: 80ms (47% improvement)
CLS: 0.05 (67% improvement)
```

### Continuous Monitoring

**Set up automated tests:**

```bash
# Use Lighthouse CI
npm install -g @lhci/cli

# Run tests
lhci autorun \
  --collect.url=https://yourdomain.com \
  --collect.numberOfRuns=3
```

**Create monitoring workflow:**

```yaml
# .github/workflows/performance.yml
name: Performance Monitoring
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: https://yourdomain.com
          uploadArtifacts: true
```

---

## Cost Optimization

### Free Tier Limits

**Cloudflare Free:**
- Unlimited bandwidth
- 100,000 Workers requests/day
- 3 Page Rules
- Basic DDoS protection
- Basic bot protection

**When to upgrade to Pro ($20/month):**
- Need more than 3 Page Rules
- Want advanced bot protection
- Need Web Application Firewall
- Want image optimization (Polish)
- Need 7-day analytics history
- Want email support

**When to upgrade to Business ($200/month):**
- Need 100% uptime SLA
- Want advanced DDoS protection
- Need 30-day analytics
- Want 24/7 chat support
- Need priority support

### Cost vs. Performance Trade-offs

| Feature | Cost | Performance Gain | Recommended |
|---------|------|------------------|-------------|
| Cloudflare Free | $0 | Baseline | Yes (start here) |
| Cloudflare Pro | $20/mo | +10-15% | Yes (for production) |
| Argo Smart Routing | $5 + $0.10/GB | +20-30% | If global users |
| Cloudflare Images | $5/mo | +5-10% | If many images |
| Tiered Caching | Free (Pro+) | +10-20% origin reduction | Yes (Pro+) |
| Load Balancing | $5/mo | Reliability | Only if multi-origin |

**Recommended for Vortis:**
- **Starting out:** Free tier ($0/month)
- **Production (< 1000 users):** Pro ($20/month)
- **Production (> 1000 users):** Pro + Argo ($30-40/month)
- **High traffic (> 10,000 users):** Business ($200/month)

---

## Security Checklist

Production security must-haves:
- [ ] SSL/TLS: Full (strict)
- [ ] HSTS enabled with preload
- [ ] All security headers configured
- [ ] CSP implemented and tested
- [ ] Bot Fight Mode enabled
- [ ] Rate limiting on sensitive endpoints
- [ ] Webhook IP whitelisting
- [ ] DNSSEC enabled
- [ ] Security monitoring alerts configured
- [ ] Regular security audits scheduled

---

## Performance Checklist

Production performance must-haves:
- [ ] Caching rules configured
- [ ] API routes bypass cache
- [ ] Static assets cached aggressively
- [ ] Auto Minify enabled
- [ ] Brotli compression enabled
- [ ] Early Hints enabled
- [ ] HTTP/3 enabled
- [ ] Images optimized
- [ ] Bundle size under 200KB (first load)
- [ ] TTFB < 600ms
- [ ] LCP < 2.5s
- [ ] Performance monitoring configured

---

**For setup instructions, see:** `/Users/tannerosterkamp/vortis/docs/VERCEL_CLOUDFLARE_SETUP.md`
