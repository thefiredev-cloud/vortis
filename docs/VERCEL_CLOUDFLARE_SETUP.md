# Vercel + Cloudflare Setup Guide

Complete step-by-step guide for deploying Vortis to Vercel with Cloudflare as DNS/CDN/security layer.

**Time to complete:** 20-30 minutes

---

## Prerequisites

- [ ] Domain name registered (e.g., yourdomain.com)
- [ ] GitHub account with Vortis repository
- [ ] Vercel account (free tier works)
- [ ] Cloudflare account (free tier works)
- [ ] Supabase project created
- [ ] Stripe account configured

---

## Phase 1: Deploy to Vercel (10 minutes)

### Step 1.1: Connect GitHub Repository

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository: `vortis`
4. Vercel will auto-detect Next.js

### Step 1.2: Configure Build Settings

Vercel should auto-detect these settings:
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node Version: **22.x** (or latest LTS)

**DO NOT change these unless you know what you're doing.**

### Step 1.3: Configure Environment Variables

Click "Environment Variables" and add the following:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=price_your_starter_price
STRIPE_PRO_PRICE_ID=price_your_pro_price
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price

# Application URL (use Vercel URL for now, update later)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Critical:**
- Use **Production** environment for live keys
- Use **Preview** environment for test keys if you want
- DO NOT use `sk_test_` keys in production

### Step 1.4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://vortis-xxxx.vercel.app`
4. Test the deployment - make sure it loads

### Step 1.5: Verify Deployment

Test these URLs:
- `https://your-app.vercel.app` - Should load homepage
- `https://your-app.vercel.app/auth/login` - Should load login page
- `https://your-app.vercel.app/api/health` - Should return 200 OK (if you have health endpoint)

**If deployment fails:**
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Check for TypeScript errors in your code
- See "Troubleshooting" section below

---

## Phase 2: Configure Cloudflare DNS (10 minutes)

### Step 2.1: Add Domain to Cloudflare

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
2. Click "Add a Site"
3. Enter your domain: `yourdomain.com`
4. Choose Free plan
5. Click "Add Site"

### Step 2.2: Update Nameservers

Cloudflare will provide you with nameservers like:
```
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

**Update nameservers at your domain registrar:**

**GoDaddy:**
1. Go to Domain Settings
2. Click "Manage DNS"
3. Find "Nameservers" section
4. Click "Change"
5. Select "Custom nameservers"
6. Enter Cloudflare nameservers
7. Save

**Namecheap:**
1. Go to Domain List
2. Click "Manage" next to your domain
3. Find "Nameservers" section
4. Select "Custom DNS"
5. Enter Cloudflare nameservers
6. Save

**Other registrars:** Follow similar process

**DNS propagation takes 2-24 hours** but usually completes in 30 minutes to 2 hours.

### Step 2.3: Configure DNS Records in Cloudflare

Once nameservers are updated (Cloudflare will show "Active"):

1. Go to Cloudflare Dashboard → DNS → Records
2. Click "Add record"

**Add these records:**

**For root domain (yourdomain.com):**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**For www subdomain:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**Critical:**
- Orange cloud = Proxied through Cloudflare (CDN + security)
- Gray cloud = DNS only (no Cloudflare benefits)
- **Always use orange cloud** unless debugging

---

## Phase 3: Connect Domain to Vercel (5 minutes)

### Step 3.1: Add Custom Domain in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add"
3. Enter your domain: `yourdomain.com`
4. Click "Add"
5. Also add: `www.yourdomain.com`
6. Click "Add"

Vercel will show "Invalid Configuration" initially - this is normal.

### Step 3.2: Verify DNS Configuration

After DNS propagates (usually 15-30 minutes):
- Vercel will automatically verify the domain
- Status will change to "Valid Configuration"
- SSL certificate will be automatically provisioned

**Check status:**
- Vercel Dashboard → Domains → should show green checkmark
- Visit `https://yourdomain.com` - should load your app
- Visit `https://www.yourdomain.com` - should also work

---

## Phase 4: Configure Cloudflare SSL/TLS (CRITICAL)

**Wrong SSL settings cause infinite redirect loops.**

### Step 4.1: Set SSL/TLS Encryption Mode

1. Go to Cloudflare Dashboard → SSL/TLS
2. Set encryption mode: **Full (strict)**

**Options explained:**
- **Off:** No encryption (NEVER use)
- **Flexible:** Cloudflare to user encrypted, Cloudflare to origin not encrypted (insecure)
- **Full:** Cloudflare to user encrypted, Cloudflare to origin encrypted with any cert (less secure)
- **Full (strict):** Cloudflare to user encrypted, Cloudflare to origin encrypted with valid cert (RECOMMENDED)

**Use Full (strict) always.** Vercel provides valid SSL certificates.

### Step 4.2: Enable Additional SSL Settings

In Cloudflare Dashboard → SSL/TLS:

```
Always Use HTTPS: ON
Automatic HTTPS Rewrites: ON
Minimum TLS Version: TLS 1.2
Opportunistic Encryption: ON
TLS 1.3: ON
```

### Step 4.3: Configure Edge Certificates

1. Go to SSL/TLS → Edge Certificates
2. Verify these settings:

```
Always Use HTTPS: ON
HTTP Strict Transport Security (HSTS): Enable (with preload)
  - Max Age: 6 months (recommended)
  - Include subdomains: ON
  - Preload: ON (only if you're sure)

Minimum TLS Version: 1.2
Opportunistic Encryption: ON
TLS 1.3: ON
Automatic HTTPS Rewrites: ON
Certificate Transparency Monitoring: ON
```

**HSTS Warning:**
- Once enabled with preload, it's VERY hard to undo
- Only enable preload if you're committed to HTTPS forever
- Safe to enable for new production apps

---

## Phase 5: Update Application URLs (5 minutes)

Now that your custom domain works, update environment variables:

### Step 5.1: Update Vercel Environment Variables

1. Vercel Dashboard → Settings → Environment Variables
2. Find `NEXT_PUBLIC_APP_URL`
3. Change from `https://your-app.vercel.app` to `https://yourdomain.com`
4. Click "Save"
5. **Redeploy:** Go to Deployments → three dots → "Redeploy"

### Step 5.2: Update Google OAuth Settings

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Navigate to: APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Update **Authorized JavaScript origins:**
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
5. Update **Authorized redirect URIs:**
   ```
   https://yourdomain.com/auth/callback
   https://www.yourdomain.com/auth/callback
   ```
6. Click "Save"

### Step 5.3: Update Supabase Auth Settings

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to: Authentication → URL Configuration
4. Update:
   ```
   Site URL: https://yourdomain.com
   Redirect URLs: https://yourdomain.com/auth/callback
                  https://www.yourdomain.com/auth/callback
   ```
5. Click "Save"

### Step 5.4: Update Stripe Webhook URL

1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Find your webhook or create new
3. Update endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. **Copy webhook secret** (starts with `whsec_`)
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
6. Redeploy

---

## Phase 6: Cloudflare Optimization (10 minutes)

### Step 6.1: Configure Caching Rules

1. Cloudflare Dashboard → Rules → Page Rules (or Cache Rules)
2. Create rule for static assets:

```
URL Pattern: yourdomain.com/_next/static/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year
```

3. Create rule for API routes:

```
URL Pattern: yourdomain.com/api/*
Settings:
  - Cache Level: Bypass
```

### Step 6.2: Enable Performance Features

Cloudflare Dashboard → Speed → Optimization:

```
Auto Minify:
  - JavaScript: ON
  - CSS: ON
  - HTML: ON

Brotli: ON
Early Hints: ON
Rocket Loader: OFF (can break React)
Mirage: ON
Polish: Lossless (or Lossy for smaller images)
```

**Rocket Loader warning:** Breaks most React apps. Keep OFF.

### Step 6.3: Configure Browser Cache TTL

Cloudflare Dashboard → Caching → Configuration:

```
Browser Cache TTL: 4 hours (recommended)
```

This tells browsers how long to cache resources.

### Step 6.4: Enable Argo Smart Routing (Optional - Paid)

If you upgrade to Cloudflare Pro:
- Cloudflare Dashboard → Traffic → Argo
- Enable Argo Smart Routing
- Reduces latency by 30% on average
- Costs $5/month + $0.10 per GB

---

## Phase 7: Security Configuration (10 minutes)

### Step 7.1: Configure Security Level

Cloudflare Dashboard → Security → Settings:

```
Security Level: Medium (recommended)
```

**Levels:**
- **Essentially Off:** No protection (never use in production)
- **Low:** Challenges only most threatening visitors
- **Medium:** Challenges suspicious visitors (RECOMMENDED)
- **High:** Challenges all visitors with less-than-stellar reputation
- **I'm Under Attack:** Challenges all visitors (use only during DDoS)

### Step 7.2: Enable Bot Fight Mode

Cloudflare Dashboard → Security → Bots:

```
Bot Fight Mode: ON (Free plan)
```

**Paid plans:**
- Super Bot Fight Mode (Pro): $10/month, more accurate
- Bot Management (Enterprise): Custom pricing, ML-based

### Step 7.3: Configure WAF (Web Application Firewall)

**Free plan:**
- Cloudflare Dashboard → Security → WAF
- Managed rules are available on Pro plan and above

**Pro plan ($20/month):**
- Enable "Cloudflare Managed Ruleset"
- Enable "Cloudflare OWASP Core Ruleset"

### Step 7.4: Set Up Rate Limiting (Optional - Paid)

**Pro plan and above:**

1. Cloudflare Dashboard → Security → WAF → Rate limiting rules
2. Create rule for login endpoint:

```
Rule name: Login Rate Limit
If incoming requests match:
  - URL Path: /api/auth/login
  - Method: POST

Then:
  - Block for 1 hour
  - When rate exceeds: 5 requests per 1 minute
```

3. Create rule for API endpoints:

```
Rule name: API Rate Limit
If incoming requests match:
  - URL Path: /api/*
  - Method: ANY

Then:
  - Challenge (CAPTCHA) for 30 minutes
  - When rate exceeds: 100 requests per 1 minute
```

### Step 7.5: Configure Challenge Passage

Cloudflare Dashboard → Security → Settings:

```
Challenge Passage: 30 minutes
```

This controls how long a visitor who passes a challenge is trusted.

---

## Phase 8: Monitoring & Analytics (5 minutes)

### Step 8.1: Enable Cloudflare Analytics

Already enabled by default. View at:
- Cloudflare Dashboard → Analytics & Logs → Traffic

Shows:
- Requests over time
- Bandwidth usage
- Threats blocked
- Geographic distribution

### Step 8.2: Enable Web Analytics (Optional)

Privacy-friendly analytics without cookies:

1. Cloudflare Dashboard → Analytics & Logs → Web Analytics
2. Click "Enable Web Analytics"
3. Add site: `yourdomain.com`
4. Copy the JavaScript snippet
5. Add to your Next.js layout (optional, Vercel Analytics is better)

**Better option:** Use Vercel Analytics instead
- Vercel Dashboard → Analytics
- Free on Pro plan
- More Next.js-specific metrics

### Step 8.3: Set Up Alerts

Cloudflare Dashboard → Notifications:

Create alerts for:
- SSL/TLS certificate expiration
- Spike in traffic
- Spike in errors (5xx)
- Spike in threats
- Route health check failures

---

## Phase 9: Testing & Verification (10 minutes)

### Step 9.1: Test Domain Access

```bash
# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com

# Should show Cloudflare IPs
```

### Step 9.2: Test SSL/TLS

```bash
# Check SSL certificate
curl -vI https://yourdomain.com

# Look for:
# - SSL certificate: valid
# - Server: cloudflare
# - x-vercel-id: present (requests reaching Vercel)
```

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
- Should get A or A+ rating

### Step 9.3: Test Application Features

1. **Homepage:** Visit `https://yourdomain.com`
   - Should load correctly
   - No console errors
   - Assets load from CDN

2. **Authentication:**
   - Click "Sign In"
   - Test Google OAuth flow
   - Should redirect correctly
   - Should authenticate successfully

3. **Dashboard:**
   - After login, visit dashboard
   - Should load user data
   - Check browser console for errors

4. **API Routes:**
   - Test any API endpoints
   - Check response times (should be faster than before)
   - Verify data integrity

5. **Stripe Integration:**
   - Visit pricing page
   - Click "Subscribe"
   - Complete test payment
   - Verify webhook received

### Step 9.4: Test Caching

```bash
# First request (should be MISS)
curl -I https://yourdomain.com/_next/static/xxx.js
# Look for: cf-cache-status: MISS

# Second request (should be HIT)
curl -I https://yourdomain.com/_next/static/xxx.js
# Look for: cf-cache-status: HIT
```

### Step 9.5: Test from Different Locations

Use tools:
- https://www.webpagetest.org
- https://tools.keycdn.com/performance
- https://www.uptrends.com/tools/website-speed-test

Test from multiple locations (US, EU, Asia) to verify CDN is working.

### Step 9.6: Test Security

**SSL Test:**
- https://www.ssllabs.com/ssltest/
- Should get A+ rating

**Security Headers Test:**
- https://securityheaders.com/?q=https://yourdomain.com
- Should get B or higher

**Bot Protection Test:**
- Try accessing site from curl/wget
- Should see challenge page (if Bot Fight Mode enabled)

---

## Phase 10: Post-Deployment Checklist

- [ ] Domain resolves correctly
- [ ] SSL certificate is valid (A+ rating)
- [ ] Homepage loads without errors
- [ ] Google OAuth works
- [ ] Stripe payments work
- [ ] Webhook receives events
- [ ] Dashboard loads after login
- [ ] All API routes functional
- [ ] Assets served from Cloudflare CDN
- [ ] Static assets cached correctly
- [ ] API routes not cached
- [ ] Bot protection enabled
- [ ] Security level set to Medium
- [ ] HSTS enabled
- [ ] Monitoring alerts configured
- [ ] Vercel environment variables updated
- [ ] Google OAuth redirects updated
- [ ] Supabase redirects updated
- [ ] Stripe webhook URL updated

---

## Troubleshooting

### Issue: Infinite Redirect Loop

**Symptoms:**
- Browser shows "too many redirects" error
- Site never loads

**Causes:**
- Wrong SSL/TLS mode in Cloudflare

**Solution:**
1. Cloudflare Dashboard → SSL/TLS
2. Change to "Full (strict)"
3. Wait 30 seconds
4. Clear browser cache
5. Try again

### Issue: 525 SSL Handshake Failed

**Symptoms:**
- Cloudflare error page
- "Error 525: SSL handshake failed"

**Causes:**
- Vercel SSL certificate not ready
- Cloudflare trying to connect before cert provisioned

**Solution:**
1. Wait 5-10 minutes for Vercel SSL cert
2. Verify domain in Vercel dashboard shows green checkmark
3. Try again
4. If still failing, temporarily set Cloudflare SSL to "Full" (not strict)
5. Once working, change back to "Full (strict)"

### Issue: OAuth Callback Fails

**Symptoms:**
- Google OAuth redirects to error page
- "redirect_uri_mismatch" error

**Causes:**
- Google OAuth not configured for custom domain

**Solution:**
1. Google Cloud Console → Credentials
2. Update authorized redirect URIs
3. Add: `https://yourdomain.com/auth/callback`
4. Save and try again

### Issue: Stripe Webhooks Not Received

**Symptoms:**
- Payments succeed but subscriptions not created
- No webhook events in Stripe dashboard

**Causes:**
- Webhook URL not updated
- Wrong webhook secret

**Solution:**
1. Stripe Dashboard → Webhooks
2. Update endpoint URL to custom domain
3. Copy new webhook secret
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel
5. Redeploy

### Issue: Assets Not Loading from CDN

**Symptoms:**
- Images/CSS not loading
- Console shows 404 errors

**Causes:**
- Cloudflare caching too aggressive
- Vercel assets not uploaded

**Solution:**
1. Clear Cloudflare cache: Dashboard → Caching → Purge Everything
2. Redeploy from Vercel
3. Wait 2-3 minutes
4. Try again

### Issue: Slow API Response Times

**Symptoms:**
- API routes slower than before Cloudflare

**Causes:**
- API routes being cached (bad)
- Extra hop through Cloudflare

**Solution:**
1. Create Page Rule to bypass cache for `/api/*`
2. Verify rule is active
3. Test again
4. Consider Cloudflare Workers for edge API if still slow

### Issue: Dashboard Not Loading After Login

**Symptoms:**
- Login succeeds
- Redirect to dashboard fails or shows blank page

**Causes:**
- `NEXT_PUBLIC_APP_URL` not updated
- Supabase redirects misconfigured

**Solution:**
1. Verify `NEXT_PUBLIC_APP_URL` in Vercel matches custom domain
2. Redeploy after changing env var
3. Check Supabase redirect URLs
4. Clear browser cache and cookies
5. Try again

---

## Performance Optimization Tips

### 1. Enable HTTP/2 Server Push (Free)

Cloudflare Dashboard → Speed → Optimization:
- HTTP/2 to Origin: ON (if Vercel supports, which it does)

### 2. Use Cloudflare Images (Paid)

Offload image optimization to Cloudflare:
- Cloudflare Dashboard → Images
- $5/month for 100,000 images
- Better compression than Next.js Image Optimization

### 3. Enable Argo Smart Routing (Paid)

Reduce latency by 30% on average:
- Cloudflare Dashboard → Traffic → Argo
- $5/month + $0.10/GB
- Routes traffic through fastest Cloudflare network paths

### 4. Use Cloudflare Workers for Edge API

Move critical API routes to the edge:
- See `CLOUDFLARE_DEPLOYMENT.md` → Option C
- Ultra-low latency (10-50ms globally)
- Access to KV/R2/D1 for edge storage

### 5. Configure Tiered Caching (Free on Pro)

Cloudflare Dashboard → Caching → Tiered Cache:
- Reduces origin requests by using Cloudflare's upper-tier cache
- Free on Pro plan and above

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check Cloudflare Analytics for unusual traffic
- Review security events (blocked threats)

**Monthly:**
- Review Cloudflare Page Rules effectiveness
- Check SSL certificate expiry (auto-renewed, but verify)
- Review Vercel deployment logs for errors

**Quarterly:**
- Audit environment variables for outdated keys
- Review and update rate limiting rules
- Test disaster recovery (redeploy from scratch)

**Yearly:**
- Review Cloudflare plan (upgrade if needed)
- Audit all security settings
- Performance test from multiple locations

---

## Next Steps

1. **Monitor for 24 hours:**
   - Watch Cloudflare Analytics
   - Check Vercel logs
   - Test from different devices/locations

2. **Set up monitoring:**
   - Configure uptime monitoring (UptimeRobot, Pingdom)
   - Set up error tracking (Sentry)
   - Enable Vercel Speed Insights

3. **Optimize further:**
   - Review `CLOUDFLARE_PERFORMANCE.md`
   - Consider upgrading to Pro plan for better features
   - Implement advanced caching strategies

4. **Security hardening:**
   - Review `CLOUDFLARE_SECURITY.md`
   - Enable additional security features
   - Set up DDoS alerts

---

## Support

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Support: support@vercel.com (Pro plan)
- Discord: https://vercel.com/discord

**Cloudflare Support:**
- Documentation: https://developers.cloudflare.com
- Community: https://community.cloudflare.com
- Support: Email (Pro plan and above)

**Emergency Issues:**
- Temporarily disable Cloudflare proxy (gray cloud) to isolate issue
- Check Vercel status: https://www.vercel-status.com
- Check Cloudflare status: https://www.cloudflarestatus.com
