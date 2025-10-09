# Cloudflare Configuration Reference

Complete reference for Cloudflare settings optimized for Vortis Next.js application.

---

## SSL/TLS Settings

### Overview Tab

```
SSL/TLS encryption mode: Full (strict)
```

**Critical:** Must be "Full (strict)" to avoid redirect loops.

### Edge Certificates

```
Always Use HTTPS: ON
HTTP Strict Transport Security (HSTS):
  Status: Enabled
  Max Age: 15552000 (6 months)
  Include subdomains: ON
  Preload: ON (optional, permanent decision)
  No-Sniff Header: ON

Minimum TLS Version: TLS 1.2
Opportunistic Encryption: ON
TLS 1.3: ON
Automatic HTTPS Rewrites: ON
Certificate Transparency Monitoring: ON
```

### Origin Server

```
Authenticated Origin Pulls: OFF (not needed for Vercel)
```

### Client Certificates

```
Not required for standard deployment
```

---

## Firewall (Security)

### Settings

```
Security Level: Medium

Challenge Passage: 30 minutes
Browser Integrity Check: ON
Privacy Pass Support: ON
```

**Security Levels Explained:**
- **Essentially Off:** No protection
- **Low:** Only highest threat scores challenged
- **Medium:** Moderately suspicious visitors challenged (RECOMMENDED)
- **High:** All suspicious visitors challenged
- **I'm Under Attack:** All visitors challenged (temporary DDoS mitigation)

### Bots

```
Bot Fight Mode: ON (Free plan)

# Pro plan ($20/month) or higher:
Super Bot Fight Mode: ON
  Definitely automated: Block
  Verified bots: Allow
  Likely automated: Managed Challenge
```

### WAF Managed Rules (Pro plan and above)

```
Cloudflare Managed Ruleset: ON
  Action: Default (Block/Challenge based on rule)

Cloudflare OWASP Core Ruleset: ON
  Paranoia Level: PL2
  Score Threshold: Medium - 40 and higher

Cloudflare Exposed Credentials Check: ON
  Action: Managed Challenge
```

---

## Speed (Optimization)

### Auto Minify

```
JavaScript: ON
CSS: ON
HTML: ON
```

**Note:** Shouldn't interfere with Next.js since assets are already minified, but provides extra compression for any dynamic HTML.

### Brotli Compression

```
Brotli: ON
```

**Result:** 15-20% smaller than gzip for text assets.

### Early Hints

```
Early Hints: ON
```

**Result:** Browsers can start loading critical assets while waiting for full HTML response.

### Rocket Loader

```
Rocket Loader: OFF
```

**Critical:** Rocket Loader breaks React/Next.js. Always keep OFF.

### Mirage

```
Mirage: ON
```

**Result:** Lazy loads images based on network conditions. Works well with Next.js Image component.

### Polish

```
Polish: Lossless (or Lossy for more compression)

WebP: ON
AVIF: OFF (experimental, limited browser support)
```

**Recommendation:**
- **Lossless:** If image quality is critical (e.g., product photos, professional portfolio)
- **Lossy:** If file size is priority and slight quality loss is acceptable

**Note:** Next.js Image component already optimizes images. Cloudflare Polish is redundant but doesn't hurt.

### Mobile Redirect

```
Mobile Redirect: OFF
```

**Why:** Next.js handles responsive design. Mobile redirects are legacy technique.

---

## Caching

### Configuration

```
Caching Level: Standard
Browser Cache TTL: 4 hours
Crawlers Cache TTL: 4 hours

Always Online: ON
Development Mode: OFF (turn ON when debugging)
```

**Caching Level Options:**
- **No Query String:** Treats `?foo=bar` same as no query string (not recommended for dynamic sites)
- **Ignore Query String:** Delivers same resource regardless of query string
- **Standard:** Caches based on query string (RECOMMENDED)

**Browser Cache TTL:**
- Controls how long browsers cache resources
- 4 hours is good balance (updates propagate within half a day)
- Can increase to 1 day for very stable sites

### Cache Rules

**Rule 1: Cache Static Assets**
```
Rule name: Cache Next.js Static Assets
When incoming requests match:
  - Hostname: yourdomain.com
  - URI Path contains: /_next/static/

Then:
  - Cache status: Eligible for cache
  - Edge TTL: 1 month
  - Browser TTL: 1 year
```

**Rule 2: Bypass Cache for API Routes**
```
Rule name: Bypass API Cache
When incoming requests match:
  - Hostname: yourdomain.com
  - URI Path starts with: /api/

Then:
  - Cache status: Bypass cache
```

**Rule 3: Cache Public Assets**
```
Rule name: Cache Public Assets
When incoming requests match:
  - Hostname: yourdomain.com
  - File extension is one of: jpg, jpeg, png, gif, webp, svg, css, js, woff, woff2, ttf, eot

Then:
  - Cache status: Eligible for cache
  - Edge TTL: 7 days
  - Browser TTL: 1 day
```

**Rule 4: Cache HTML with Short TTL**
```
Rule name: Cache HTML Pages
When incoming requests match:
  - Hostname: yourdomain.com
  - URI Path ends with: /
  - OR File extension is one of: html

Then:
  - Cache status: Eligible for cache
  - Edge TTL: 5 minutes
  - Browser TTL: 5 minutes
```

**Priority Order (highest to lowest):**
1. Bypass API Cache (highest priority)
2. Cache Next.js Static Assets
3. Cache HTML Pages
4. Cache Public Assets (lowest priority)

---

## Page Rules (Legacy - Use Cache Rules instead)

**If using legacy Page Rules:**

**Rule 1: Cache Static Assets**
```
URL: yourdomain.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year
```

**Rule 2: Bypass API Cache**
```
URL: yourdomain.com/api/*
Settings:
  - Cache Level: Bypass
```

**Rule 3: Cache Public Assets**
```
URL: yourdomain.com/*.{jpg,jpeg,png,gif,webp,svg,css,js,woff,woff2}
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 7 days
  - Browser Cache TTL: 1 day
```

**Note:** Cloudflare is migrating from Page Rules to Cache Rules. Use Cache Rules for new configurations.

**Free plan limit:** 3 page rules
**Pro plan:** 20 page rules

---

## DNS

### Records

**Root Domain:**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**WWW Subdomain:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**Email (if using separate email provider):**
```
Type: MX
Name: @
Mail server: mail.yourprovider.com
Priority: 10
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**Email SPF Record:**
```
Type: TXT
Name: @
Content: v=spf1 include:_spf.yourprovider.com ~all
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**DKIM Record (from email provider):**
```
Type: TXT
Name: default._domainkey
Content: [provided by email provider]
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
Proxy status: DNS only (gray cloud)
TTL: Auto
```

### DNSSEC

```
DNSSEC: Enabled (recommended)
```

**Result:** Protects against DNS spoofing attacks.

---

## Network

### HTTP/2

```
HTTP/2: ON (enabled by default)
HTTP/2 to Origin: ON (if supported by origin)
```

### HTTP/3 (QUIC)

```
HTTP/3 (with QUIC): ON
```

**Result:** Faster connection establishment, better mobile performance.

### WebSockets

```
WebSockets: ON
```

**Note:** Needed if your app uses real-time features.

### gRPC

```
gRPC: OFF (unless you specifically use gRPC)
```

### Onion Routing

```
Onion Routing: OFF (unless you want Tor support)
```

### Pseudo IPv4

```
Add Pseudo IPv4: OFF
```

**Only enable if you have legacy systems that require IPv4 headers.**

---

## Scrape Shield

### Email Address Obfuscation

```
Email Address Obfuscation: ON
```

**Result:** Hides email addresses from scrapers in HTML.

### Server-side Excludes

```
Server-side Excludes: OFF (not needed for Next.js)
```

### Hotlink Protection

```
Hotlink Protection: OFF (unless you have issues with image theft)
```

**If enabled:** Other sites can't directly embed your images.

---

## Traffic (Pro plan and above)

### Argo Smart Routing

```
Argo Smart Routing: ON
Cost: $5/month + $0.10/GB
```

**Result:** Reduces latency by 30% on average by routing through fastest Cloudflare paths.

**When to enable:**
- You have global users
- You need lowest possible latency
- You're willing to pay for performance

### Load Balancing

```
Load Balancing: OFF (not needed with Vercel)
```

**Only needed if:**
- You have multiple origin servers
- You're doing blue/green deployments manually
- You need geographic routing

### Waiting Room

```
Waiting Room: OFF (Enterprise feature)
```

**Use case:** Queue users during high-traffic events (e.g., product launches, ticket sales)

---

## Rules

### Transform Rules

**Managed Transforms:**
```
Add security headers: ON
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
```

**HTTP Response Header Modifications:**

**Add HSTS Header (if not using Edge Certificate HSTS):**
```
Rule name: Add HSTS Header
When incoming requests match: All incoming requests
Then:
  Set static:
    Header name: Strict-Transport-Security
    Value: max-age=15552000; includeSubDomains; preload
```

**Add CSP Header (Content Security Policy):**
```
Rule name: Add CSP Header
When incoming requests match: All incoming requests
Then:
  Set static:
    Header name: Content-Security-Policy
    Value: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' *.supabase.co *.stripe.com; frame-src 'self' *.stripe.com;
```

**Note:** Adjust CSP based on your specific third-party integrations.

**Add Permissions Policy Header:**
```
Rule name: Add Permissions Policy
When incoming requests match: All incoming requests
Then:
  Set static:
    Header name: Permissions-Policy
    Value: geolocation=(), microphone=(), camera=()
```

### Rate Limiting Rules (Pro plan and above)

**Login Protection:**
```
Rule name: Login Rate Limit
When incoming requests match:
  - URI Path equals: /api/auth/login
  - Method equals: POST

Then:
  - Block for: 1 hour
  - When rate exceeds: 5 requests per 1 minute per IP
  - Also matching: Same IP address
```

**API Protection:**
```
Rule name: API Rate Limit
When incoming requests match:
  - URI Path starts with: /api/
  - Method is one of: POST, PUT, DELETE

Then:
  - Managed Challenge for: 30 minutes
  - When rate exceeds: 100 requests per 10 minutes per IP
  - Also matching: Same IP address
```

**Signup Protection:**
```
Rule name: Signup Rate Limit
When incoming requests match:
  - URI Path equals: /api/auth/signup
  - Method equals: POST

Then:
  - Block for: 1 hour
  - When rate exceeds: 3 requests per 1 hour per IP
  - Also matching: Same IP address
```

**Stripe Webhook Protection:**
```
Rule name: Webhook IP Whitelist
When incoming requests match:
  - URI Path equals: /api/stripe/webhook
  - IP address is not in: [Stripe IP ranges]

Then:
  - Block
```

**Stripe IP ranges** (as of 2025):
```
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
```

**Note:** Verify current Stripe IPs at: https://stripe.com/docs/ips

---

## Analytics & Logs

### Web Analytics

```
Web Analytics: ON (optional, free)
```

**Setup:**
1. Enable in dashboard
2. Add JavaScript beacon to your site (optional, Vercel Analytics is better)

**Features:**
- Privacy-friendly (no cookies)
- Core Web Vitals
- Page views
- Referrers
- Countries

### Logs (Enterprise)

```
Logpush: OFF (Enterprise only)
Logpull: Available on Pro and above
```

**Logpull API:**
- Download logs for last 7 days
- Useful for debugging
- Requires API token

---

## Workers

### Workers Routes (for hybrid deployment)

```
Route: yourdomain.com/api/analyze/*
Worker: api-worker
```

**Only needed for Option C (Hybrid) deployment.**

---

## Notifications

### Recommended Alerts

**SSL/TLS:**
```
Alert: SSL/TLS Certificate Expiration
Notification: 30 days before expiry
```

**Traffic:**
```
Alert: Spike in Traffic
Threshold: 5x normal traffic in 5 minutes
```

**Errors:**
```
Alert: Spike in 5xx Errors
Threshold: >100 errors in 5 minutes
```

**Security:**
```
Alert: Spike in Threats Blocked
Threshold: >1000 threats in 5 minutes
```

**Origin:**
```
Alert: Origin Health Check Failure
Notification: Immediate
```

---

## Custom Pages

### Error Pages

**Customize error pages:**

1. Cloudflare Dashboard → Custom Pages
2. Upload custom HTML for:
   - 500 Class Errors (server errors)
   - 1000 Class Errors (DNS errors)
   - WAF Block
   - Rate Limiting Block
   - Under Attack Challenge
   - IP/Country Block

**Example 500 error page:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Service Temporarily Unavailable</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #333; margin: 0 0 1rem 0; }
    p { color: #666; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>We'll be right back</h1>
    <p>Our service is temporarily unavailable. Please try again in a few moments.</p>
  </div>
</body>
</html>
```

---

## Best Practices Summary

### Security
- SSL/TLS: Full (strict) always
- HSTS: Enabled with 6-month max-age
- Security Level: Medium
- Bot Fight Mode: ON
- WAF: Enabled (Pro plan)
- Rate Limiting: Enabled for login/signup (Pro plan)

### Performance
- Auto Minify: All ON
- Brotli: ON
- Early Hints: ON
- Rocket Loader: OFF (breaks React)
- HTTP/3: ON
- Argo: Consider for global apps (paid)

### Caching
- Static assets: Cache everything, long TTL
- API routes: Bypass cache
- HTML: Short TTL (5 min) or bypass
- Browser Cache TTL: 4 hours

### Monitoring
- Enable all relevant alerts
- Monitor analytics daily
- Review security events weekly
- Check SSL expiry monthly

---

## Configuration Export

Cloudflare doesn't have native config export, but you can document your settings:

```bash
# Install Cloudflare CLI
npm install -g wrangler

# Login
wrangler login

# Get zone ID
wrangler whoami

# Use Cloudflare API to export settings (advanced)
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

**Better option:** Use Terraform for infrastructure as code:
- https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs

---

## Quick Reference Table

| Setting | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| **SSL/TLS** | Basic | Advanced | Advanced | Custom |
| **DDoS Protection** | Unmetered | Unmetered | Unmetered | Advanced |
| **WAF** | Basic | Managed | Managed | Advanced |
| **Bot Management** | Basic | Super | Super | Advanced |
| **Rate Limiting** | No | Yes | Yes | Yes |
| **Page Rules** | 3 | 20 | 50 | 125 |
| **Argo Smart Routing** | Paid | Paid | Paid | Included |
| **Load Balancing** | No | Paid | Paid | Included |
| **Analytics** | 24hrs | 7 days | 30 days | 365 days |
| **Support** | Community | Email | 24/7 Chat | Phone + TAM |
| **Price/month** | $0 | $20 | $200 | Custom |

---

## Terraform Configuration Example

If you want infrastructure as code:

```hcl
terraform {
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

resource "cloudflare_zone_settings_override" "vortis" {
  zone_id = var.zone_id

  settings {
    ssl = "strict"
    always_use_https = "on"
    min_tls_version = "1.2"
    tls_1_3 = "on"
    automatic_https_rewrites = "on"
    security_level = "medium"
    brotli = "on"
    http3 = "on"
    browser_cache_ttl = 14400
  }
}

resource "cloudflare_page_rule" "cache_static" {
  zone_id = var.zone_id
  target = "${var.domain}/_next/static/*"
  priority = 1

  actions {
    cache_level = "cache_everything"
    edge_cache_ttl = 2592000
    browser_cache_ttl = 31536000
  }
}
```

Save to `cloudflare.tf` and manage via:
```bash
terraform init
terraform plan
terraform apply
```

---

**For detailed setup instructions, see:** `VERCEL_CLOUDFLARE_SETUP.md`
