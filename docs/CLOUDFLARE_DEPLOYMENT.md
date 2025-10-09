# Cloudflare Integration Guide for Vortis

## Overview

This guide covers three deployment scenarios for integrating Cloudflare with your Next.js 15 application. Choose the option that best fits your needs.

## Deployment Options Comparison

| Feature | Vercel + Cloudflare (Recommended) | Cloudflare Pages | Hybrid (Vercel + Workers) |
|---------|-----------------------------------|------------------|---------------------------|
| **Deployment Speed** | Fast (3-5 min) | Fast (3-5 min) | Medium (10-15 min) |
| **Edge Runtime** | Vercel Edge + Cloudflare CDN | Cloudflare Pages Functions | Cloudflare Workers |
| **Build Time** | ~2-3 min | ~2-3 min | ~3-5 min |
| **Cost (Free Tier)** | Free + Free | Free | Free + Free |
| **Setup Complexity** | Low | Medium | High |
| **Best For** | Most projects | Cloudflare-first teams | Advanced use cases |
| **OAuth Support** | Excellent | Good | Excellent |
| **Dynamic Routes** | Full support | Full support | Requires configuration |
| **ISR/SSR** | Full support | Limited | Full support |

---

## Option A: Vercel + Cloudflare DNS/Proxy (RECOMMENDED)

**When to use:**
- You want Vercel's excellent Next.js deployment experience
- You need Cloudflare's global CDN and security features
- You want the simplest setup with maximum compatibility

**Architecture:**
```
User Request → Cloudflare (DNS/Proxy/CDN/WAF) → Vercel (Next.js App) → Supabase (Database)
```

**Pros:**
- Best Next.js support (Vercel builds Next.js)
- Automatic deployments from GitHub
- Preview deployments for PRs
- Cloudflare CDN + security in front
- Zero config for ISR, SSR, API routes
- Free tier is generous

**Cons:**
- Two platforms to manage (minimal overhead)
- Cloudflare proxy can add 10-30ms latency (usually negligible)
- SSL/TLS configuration must be correct to avoid redirect loops

**See:** `VERCEL_CLOUDFLARE_SETUP.md` for detailed setup instructions

---

## Option B: Cloudflare Pages Deployment

**When to use:**
- You prefer single-platform management
- Your team is already Cloudflare-centric
- You want to minimize vendor dependencies
- You need Cloudflare Workers integration

**Architecture:**
```
User Request → Cloudflare Pages (Static + Functions) → Supabase (Database)
```

**Pros:**
- Single platform (Cloudflare only)
- Native Cloudflare Workers for serverless functions
- Free tier includes 500 builds/month, unlimited bandwidth
- Direct integration with Cloudflare services (R2, KV, D1)
- No intermediate proxy needed

**Cons:**
- Next.js support requires `@cloudflare/next-on-pages`
- Some Next.js features have limitations (Edge Runtime only)
- No automatic preview URLs like Vercel
- Build process is more manual
- Smaller community vs Vercel

### Cloudflare Pages Setup

#### 1. Install Build Adapter

```bash
npm install --save-dev @cloudflare/next-on-pages
```

#### 2. Update `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:dev": "npx @cloudflare/next-on-pages --watch",
    "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static"
  }
}
```

#### 3. Create `wrangler.toml`

```toml
name = "vortis"
compatibility_date = "2025-01-01"

[build]
command = "npm run pages:build"

[[pages_build_output_dir]]
directory = ".vercel/output/static"

# Environment variables (set via Cloudflare dashboard)
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# STRIPE_SECRET_KEY
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# STRIPE_WEBHOOK_SECRET
# NEXT_PUBLIC_APP_URL
```

#### 4. Update `next.config.ts` for Pages

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages
  output: 'export', // For static export
  // OR
  experimental: {
    runtime: 'edge', // For edge runtime
  },

  // Optional: Image optimization
  images: {
    unoptimized: true, // Cloudflare has its own image optimization
  },
};

export default nextConfig;
```

#### 5. Deploy to Cloudflare Pages

**Option A: GitHub Integration (Recommended)**

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Root directory: `/`
   - Framework preset: `Next.js`

5. Add environment variables in Pages settings
6. Deploy

**Option B: Direct Upload**

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build and deploy
npm run pages:build
wrangler pages deploy .vercel/output/static --project-name=vortis
```

#### 6. Configure Custom Domain

1. Cloudflare Dashboard → Pages → Your Project → Custom domains
2. Add your domain
3. Cloudflare automatically configures DNS

#### 7. Update Environment Variables

Set in Cloudflare Dashboard → Pages → Settings → Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### 8. Configure OAuth Redirects

Update Google OAuth settings:
- Authorized redirect URIs: `https://yourdomain.com/auth/callback`

Update Supabase Auth settings:
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/auth/callback`

---

## Option C: Hybrid (Vercel + Cloudflare Workers)

**When to use:**
- You need advanced edge computing capabilities
- You want to offload specific API routes to Cloudflare Workers
- You need Cloudflare-specific features (R2, KV, D1) alongside Next.js
- You have geographically distributed users and need ultra-low latency

**Architecture:**
```
User Request → Cloudflare Workers (API routes) → Vercel (Next.js UI) → Supabase
                ↓
         Cloudflare R2/KV/D1
```

**Pros:**
- Best of both worlds
- Ultra-low latency for API routes via Workers
- Access to Cloudflare's edge storage (R2, KV, D1)
- Vercel handles Next.js rendering
- Advanced routing capabilities

**Cons:**
- Most complex setup
- Two deployment pipelines
- Higher maintenance overhead
- Need to manage routing between platforms
- Debugging can be challenging

### Hybrid Setup

#### 1. Deploy Next.js to Vercel

Follow Option A setup (see `VERCEL_CLOUDFLARE_SETUP.md`)

#### 2. Create Cloudflare Workers for API Routes

```bash
# Create workers directory
mkdir cloudflare-workers
cd cloudflare-workers

# Initialize Worker
npm create cloudflare@latest api-worker
# Choose: TypeScript, Fetch handler
```

#### 3. Create Worker for Specific Routes

`cloudflare-workers/src/index.ts`:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle /api/analyze/* routes at edge
    if (url.pathname.startsWith('/api/analyze')) {
      return handleAnalyze(request, env);
    }

    // Proxy everything else to Vercel
    return fetch(`https://your-app.vercel.app${url.pathname}${url.search}`, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  },
};

async function handleAnalyze(request: Request, env: Env): Promise<Response> {
  // Your edge logic here
  // Access to env.KV, env.R2, env.D1, etc.

  const data = await env.KV.get('cache-key');

  return new Response(JSON.stringify({ data }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

#### 4. Deploy Worker

```bash
wrangler deploy
```

#### 5. Configure DNS Routing

In Cloudflare Dashboard:

1. **DNS Settings:**
   - A/AAAA record: Point to Vercel (or use CNAME)
   - Proxy through Cloudflare (orange cloud)

2. **Workers Routes:**
   - Route: `yourdomain.com/api/analyze/*` → Worker
   - Route: `yourdomain.com/*` → Origin (Vercel)

#### 6. Environment Variables

**Vercel:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Cloudflare Workers:**
```bash
# Set via wrangler
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_KEY
```

---

## Cost Comparison

### Option A: Vercel + Cloudflare
- **Vercel Free Tier:** 100GB bandwidth, 100 build hours/month
- **Cloudflare Free Tier:** Unlimited bandwidth, DDoS protection, basic WAF
- **Total Monthly Cost (Free Tier):** $0
- **Paid (Small Business):** Vercel Pro ($20) + Cloudflare Pro ($20) = $40/month

### Option B: Cloudflare Pages
- **Free Tier:** 500 builds/month, unlimited bandwidth, 100,000 Workers requests/day
- **Total Monthly Cost (Free Tier):** $0
- **Paid (Small Business):** Cloudflare Pages Pro ($20/month), Workers Paid ($5/month + usage)

### Option C: Hybrid
- **Vercel Free Tier:** Same as Option A
- **Cloudflare Workers:** 100,000 requests/day free, $5/10M requests after
- **Total Monthly Cost (Free Tier):** $0
- **Paid (Small Business):** Vercel Pro ($20) + Workers Paid ($5-20) = $25-40/month

---

## Performance Comparison

### Time to First Byte (TTFB)

**Option A (Vercel + Cloudflare):**
- Static pages: 50-150ms
- SSR pages: 200-400ms
- API routes: 100-300ms

**Option B (Cloudflare Pages):**
- Static pages: 30-100ms
- Edge functions: 50-150ms
- API routes: 80-200ms

**Option C (Hybrid):**
- Static pages: 50-150ms
- Edge API routes: 20-80ms (fastest)
- SSR pages: 200-400ms

### Global Latency

All options benefit from global CDN:
- Cloudflare: 200+ data centers
- Vercel: 100+ edge locations

Expected latency to nearest edge: 10-50ms

---

## Security Features Comparison

| Feature | Option A | Option B | Option C |
|---------|----------|----------|----------|
| DDoS Protection | Yes (Cloudflare) | Yes (Cloudflare) | Yes (Cloudflare) |
| WAF | Yes (Cloudflare) | Yes (Cloudflare) | Yes (Cloudflare) |
| Rate Limiting | Yes (Cloudflare) | Yes (Workers) | Yes (Workers) |
| Bot Protection | Yes (Cloudflare) | Yes (Cloudflare) | Yes (Cloudflare) |
| SSL/TLS | Yes (Both) | Yes (Cloudflare) | Yes (Both) |
| Vercel Firewall | Yes (Pro plan) | N/A | Yes (Pro plan) |

---

## Recommendation by Use Case

### Use Option A (Vercel + Cloudflare) If:
- You're building a standard SaaS application
- You want the fastest time to production
- You need maximum Next.js compatibility
- Your team is familiar with Vercel
- You want automatic preview deployments
- **Best for: 90% of projects**

### Use Option B (Cloudflare Pages) If:
- You're already using Cloudflare for other services
- You want single-platform management
- You need tight integration with Workers/R2/KV/D1
- You're cost-conscious (stays free longer)
- Your app is primarily static with some dynamic routes
- **Best for: Cloudflare-first teams, static-heavy apps**

### Use Option C (Hybrid) If:
- You need ultra-low latency for specific API routes
- You're using Cloudflare-specific features (R2, KV, D1)
- You have complex edge computing requirements
- You have geographically distributed users
- Your team can manage multi-platform complexity
- **Best for: Enterprise apps, global user bases, advanced edge computing**

---

## Next Steps

- **For Option A:** Follow `VERCEL_CLOUDFLARE_SETUP.md`
- **For Option B:** See configuration above + `CLOUDFLARE_PAGES_CHECKLIST.md`
- **For Option C:** Requires custom implementation based on your needs

---

## Support & Resources

### Vercel Documentation
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Environment Variables: https://vercel.com/docs/environment-variables
- Custom Domains: https://vercel.com/docs/custom-domains

### Cloudflare Documentation
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Workers: https://developers.cloudflare.com/workers/
- DNS Setup: https://developers.cloudflare.com/dns/
- SSL/TLS: https://developers.cloudflare.com/ssl/

### Next.js on Cloudflare Pages
- Official Guide: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- @cloudflare/next-on-pages: https://github.com/cloudflare/next-on-pages

---

## Troubleshooting

See `CLOUDFLARE_TROUBLESHOOTING.md` for common issues and solutions.
