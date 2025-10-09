# Cloudflare Troubleshooting Guide

Complete troubleshooting guide for common Cloudflare + Vercel + Next.js issues.

---

## Table of Contents

1. [SSL/TLS Issues](#ssltls-issues)
2. [Redirect Loops](#redirect-loops)
3. [DNS Issues](#dns-issues)
4. [Caching Issues](#caching-issues)
5. [Authentication Issues](#authentication-issues)
6. [API Route Issues](#api-route-issues)
7. [Performance Issues](#performance-issues)
8. [Security Blocks](#security-blocks)
9. [Deployment Issues](#deployment-issues)
10. [Webhook Issues](#webhook-issues)

---

## SSL/TLS Issues

### Issue: Infinite Redirect Loop

**Symptoms:**
- Browser shows "ERR_TOO_MANY_REDIRECTS"
- Site redirects indefinitely
- Never loads

**Cause:**
- Incorrect SSL/TLS mode in Cloudflare
- Cloudflare trying to connect via HTTP, Vercel forcing HTTPS

**Diagnosis:**
```bash
curl -I https://yourdomain.com
# Look for Location headers that redirect back to same URL
```

**Solution:**

1. **Fix SSL Mode:**
   ```
   Cloudflare Dashboard → SSL/TLS → Overview
   Change to: Full (strict)
   ```

2. **Wait 30 seconds** for changes to propagate

3. **Clear browser cache:**
   ```
   Chrome: Ctrl+Shift+Delete → Clear all time
   Firefox: Ctrl+Shift+Delete → Everything
   Safari: Cmd+Option+E
   ```

4. **Test in incognito/private window**

5. **Verify Vercel SSL:**
   ```
   Vercel Dashboard → Project → Settings → Domains
   Ensure domain shows green checkmark
   ```

**Prevention:**
- Always use "Full (strict)" mode
- Never use "Flexible" mode (insecure)

---

### Issue: 525 SSL Handshake Failed

**Symptoms:**
- Cloudflare error page
- "Error 525: SSL handshake failed between Cloudflare and the origin server"

**Cause:**
- Vercel SSL certificate not ready yet
- Cloudflare trying to connect before cert provisioned
- Certificate mismatch

**Diagnosis:**
```bash
# Check Vercel SSL status
curl -vI https://your-app.vercel.app 2>&1 | grep "SSL certificate"

# Check direct connection
openssl s_client -connect your-app.vercel.app:443 -servername your-app.vercel.app
```

**Solution:**

1. **Wait for Vercel SSL:**
   - Usually takes 5-10 minutes after domain added
   - Check Vercel dashboard for SSL status

2. **Temporarily downgrade SSL mode:**
   ```
   Cloudflare Dashboard → SSL/TLS
   Change to: Full (not strict)
   ```

3. **Test if site loads**

4. **Once working, upgrade back:**
   ```
   Change to: Full (strict)
   ```

5. **Clear Cloudflare cache:**
   ```
   Cloudflare Dashboard → Caching → Purge Everything
   ```

**Prevention:**
- Wait for Vercel to show green checkmark before enabling Cloudflare proxy
- Add domain to Vercel first, then configure Cloudflare

---

### Issue: Mixed Content Warnings

**Symptoms:**
- Console shows "Mixed Content" warnings
- Some assets load via HTTP instead of HTTPS
- Broken lock icon in browser

**Cause:**
- Hardcoded HTTP URLs in code
- External resources loaded via HTTP

**Diagnosis:**
```bash
# Check browser console (F12)
# Look for: "Mixed Content: The page at 'https://...' was loaded over HTTPS"
```

**Solution:**

1. **Enable Automatic HTTPS Rewrites:**
   ```
   Cloudflare Dashboard → SSL/TLS → Edge Certificates
   Automatic HTTPS Rewrites: ON
   ```

2. **Find hardcoded HTTP URLs in code:**
   ```bash
   cd /Users/tannerosterkamp/vortis
   grep -r "http://" --include="*.tsx" --include="*.ts" --include="*.js"
   ```

3. **Update URLs to HTTPS or use protocol-relative URLs:**
   ```typescript
   // Bad
   const url = "http://example.com/image.jpg";

   // Good
   const url = "https://example.com/image.jpg";

   // Better (protocol-relative)
   const url = "//example.com/image.jpg";
   ```

4. **Update Content Security Policy:**
   ```typescript
   // next.config.ts
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/:path*',
           headers: [
             {
               key: 'Content-Security-Policy',
               value: "upgrade-insecure-requests"
             }
           ]
         }
       ]
     }
   }
   ```

**Prevention:**
- Always use HTTPS URLs
- Enable "Always Use HTTPS" in Cloudflare
- Use protocol-relative URLs for external resources

---

### Issue: Certificate Transparency Error

**Symptoms:**
- "NET::ERR_CERTIFICATE_TRANSPARENCY_REQUIRED"
- SSL error in some browsers (especially Chrome)

**Cause:**
- Certificate Transparency not enabled

**Solution:**
```
Cloudflare Dashboard → SSL/TLS → Edge Certificates
Certificate Transparency Monitoring: ON
```

Wait 5 minutes and test again.

---

## Redirect Loops

### Issue: Too Many Redirects After Login

**Symptoms:**
- Login succeeds
- Redirect to dashboard fails with redirect loop

**Cause:**
- `NEXT_PUBLIC_APP_URL` mismatch
- Middleware redirect logic issue
- Cookie domain mismatch

**Diagnosis:**
```bash
# Check environment variable
# In Vercel Dashboard → Settings → Environment Variables
# NEXT_PUBLIC_APP_URL should match your domain

# Check cookies
# Browser DevTools → Application → Cookies
# Verify cookies are set for correct domain
```

**Solution:**

1. **Update environment variable:**
   ```
   Vercel Dashboard → Settings → Environment Variables
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

2. **Redeploy:**
   ```
   Vercel Dashboard → Deployments → Redeploy
   ```

3. **Clear cookies:**
   ```
   Browser DevTools → Application → Cookies
   Delete all cookies for your domain
   ```

4. **Check middleware:**
   ```typescript
   // /Users/tannerosterkamp/vortis/middleware.ts
   // Verify redirect logic doesn't create loops
   ```

5. **Test authentication flow**

---

### Issue: WWW vs Non-WWW Redirect Loop

**Symptoms:**
- `www.yourdomain.com` redirects to `yourdomain.com` indefinitely
- Or vice versa

**Cause:**
- Conflicting redirects between Cloudflare and Vercel
- DNS misconfiguration

**Solution:**

1. **Choose primary domain** (www or non-www)

2. **Configure in Vercel:**
   ```
   Vercel Dashboard → Settings → Domains
   Set primary domain
   Enable redirect from alternate
   ```

3. **Configure in Cloudflare:**
   ```
   # Option A: Redirect www to non-www
   Page Rule: www.yourdomain.com/*
   Forwarding URL: 301, https://yourdomain.com/$1

   # Option B: Redirect non-www to www
   Page Rule: yourdomain.com/*
   Forwarding URL: 301, https://www.yourdomain.com/$1
   ```

4. **Ensure both domains have DNS records:**
   ```
   @ → cname.vercel-dns.com (Proxied)
   www → cname.vercel-dns.com (Proxied)
   ```

**Prevention:**
- Decide on primary domain before setup
- Configure redirects in one place (preferably Vercel)

---

## DNS Issues

### Issue: DNS Not Propagating

**Symptoms:**
- Domain doesn't resolve
- "DNS_PROBE_FINISHED_NXDOMAIN" error
- Works on some devices but not others

**Cause:**
- Nameservers not updated at registrar
- DNS records not configured
- Propagation delay

**Diagnosis:**
```bash
# Check nameservers
dig NS yourdomain.com

# Should show Cloudflare nameservers like:
# alice.ns.cloudflare.com
# bob.ns.cloudflare.com

# Check DNS records
dig A yourdomain.com
dig CNAME yourdomain.com

# Check from different locations
# Use: https://www.whatsmydns.net
```

**Solution:**

1. **Verify nameservers at registrar:**
   - Login to domain registrar
   - Check DNS/Nameserver settings
   - Ensure Cloudflare nameservers are set

2. **Wait for propagation:**
   - Usually 15 minutes to 2 hours
   - Can take up to 48 hours in rare cases

3. **Clear local DNS cache:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Windows
   ipconfig /flushdns

   # Linux
   sudo systemd-resolve --flush-caches
   ```

4. **Test with direct DNS query:**
   ```bash
   # Query Cloudflare DNS directly
   dig @1.1.1.1 yourdomain.com
   ```

5. **Verify Cloudflare shows "Active":**
   ```
   Cloudflare Dashboard → Overview
   Status should show "Active" not "Pending"
   ```

**Prevention:**
- Update nameservers as first step
- Wait for "Active" status before configuring records

---

### Issue: DNS Pointing to Wrong Server

**Symptoms:**
- Domain loads but shows wrong site
- Old site still showing after migration
- 404 errors on valid routes

**Cause:**
- DNS records pointing to old server
- Incorrect CNAME target

**Solution:**

1. **Check DNS records:**
   ```
   Cloudflare Dashboard → DNS → Records
   ```

2. **Update CNAME records:**
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com (NOT old IP or server)
   Proxy: ON (orange cloud)
   ```

3. **Do same for www:**
   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy: ON
   ```

4. **Remove old A/AAAA records:**
   - Delete any A records pointing to old IPs
   - Delete any AAAA records (unless specifically needed)

5. **Purge Cloudflare cache:**
   ```
   Cloudflare Dashboard → Caching → Purge Everything
   ```

6. **Wait 5 minutes and test**

---

## Caching Issues

### Issue: Old Content Still Showing

**Symptoms:**
- Deployed new version but old content shows
- Changes not visible after deployment
- Inconsistent content between page loads

**Cause:**
- Cloudflare caching old version
- Browser caching
- Edge cache not purged

**Diagnosis:**
```bash
# Check cache status
curl -I https://yourdomain.com | grep cf-cache-status
# HIT = served from cache
# MISS = not in cache
# EXPIRED = cache expired
# DYNAMIC = not cached

# Check cache headers
curl -I https://yourdomain.com | grep -i cache
```

**Solution:**

1. **Purge Cloudflare cache:**
   ```
   Cloudflare Dashboard → Caching → Purge Everything
   ```

2. **For specific pages only:**
   ```
   Cloudflare Dashboard → Caching → Custom Purge
   Enter specific URLs
   ```

3. **Clear browser cache:**
   ```
   Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   ```

4. **Wait 2-3 minutes** for edge nodes to update

5. **Test in incognito window**

6. **Verify Vercel deployment:**
   ```
   Vercel Dashboard → Deployments
   Ensure latest deployment is "Ready"
   ```

**Prevention:**

1. **Configure proper cache rules:**
   ```
   # Don't cache HTML aggressively
   HTML pages: 5 minute TTL
   API routes: Bypass cache
   Static assets: Long TTL (okay to cache)
   ```

2. **Use cache busting for assets:**
   - Next.js does this automatically with `/_next/static/`

3. **Enable Development Mode when debugging:**
   ```
   Cloudflare Dashboard → Caching → Configuration
   Development Mode: ON (for 3 hours)
   ```

---

### Issue: API Routes Being Cached

**Symptoms:**
- API returns stale data
- Same response on every request
- Dynamic data not updating

**Cause:**
- Cloudflare caching API responses
- Cache rules too aggressive

**Diagnosis:**
```bash
# Check if API is cached
curl -I https://yourdomain.com/api/your-endpoint
# Look for: cf-cache-status: HIT (bad for APIs)
```

**Solution:**

1. **Create cache rule to bypass API:**
   ```
   Cloudflare Dashboard → Rules → Cache Rules
   Create rule:
     If: URI Path starts with /api/
     Then: Cache status = Bypass cache
   ```

2. **Or use Page Rule (legacy):**
   ```
   URL: yourdomain.com/api/*
   Setting: Cache Level = Bypass
   ```

3. **Purge cache:**
   ```
   Cloudflare Dashboard → Caching → Purge Everything
   ```

4. **Add cache-control headers in API routes:**
   ```typescript
   // In your API route
   return new Response(JSON.stringify(data), {
     headers: {
       'Content-Type': 'application/json',
       'Cache-Control': 'no-store, no-cache, must-revalidate',
     },
   });
   ```

**Prevention:**
- Always bypass cache for `/api/*` routes
- Set proper `Cache-Control` headers
- Test API caching after Cloudflare setup

---

### Issue: Static Assets Not Caching

**Symptoms:**
- Slow load times
- High bandwidth usage
- `cf-cache-status: MISS` for static assets

**Cause:**
- Cache rules not configured
- Assets marked as uncacheable

**Solution:**

1. **Create cache rule for static assets:**
   ```
   Cloudflare Dashboard → Rules → Cache Rules
   Create rule:
     If: URI Path contains /_next/static/
     Then:
       Cache status: Eligible for cache
       Edge TTL: 1 month
       Browser TTL: 1 year
   ```

2. **Enable cache for file extensions:**
   ```
   Create rule:
     If: File extension is one of jpg,jpeg,png,gif,webp,svg,css,js,woff,woff2
     Then:
       Cache status: Eligible for cache
       Edge TTL: 7 days
       Browser TTL: 1 day
   ```

3. **Verify caching working:**
   ```bash
   # First request (should be MISS)
   curl -I https://yourdomain.com/_next/static/xxx.js | grep cf-cache-status

   # Second request (should be HIT)
   curl -I https://yourdomain.com/_next/static/xxx.js | grep cf-cache-status
   ```

---

## Authentication Issues

### Issue: OAuth Callback Fails

**Symptoms:**
- Google OAuth redirects to error page
- "redirect_uri_mismatch" error
- OAuth fails after custom domain setup

**Cause:**
- Google OAuth not configured for custom domain
- Redirect URI mismatch

**Diagnosis:**
```bash
# Check redirect URI in error message
# Compare with configured URIs in Google Console
```

**Solution:**

1. **Update Google OAuth settings:**
   ```
   Google Cloud Console → APIs & Services → Credentials
   Select OAuth 2.0 Client ID
   ```

2. **Add authorized origins:**
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

3. **Add authorized redirect URIs:**
   ```
   https://yourdomain.com/auth/callback
   https://www.yourdomain.com/auth/callback
   ```

4. **Save and wait 5 minutes** for changes to propagate

5. **Clear browser cookies and test**

**Prevention:**
- Update OAuth settings before pointing domain
- Test OAuth immediately after domain setup

---

### Issue: Session Cookies Not Working

**Symptoms:**
- Login succeeds but user logged out on next request
- Session not persisting
- "Unauthorized" errors after login

**Cause:**
- Cookie domain mismatch
- Secure cookie flag without HTTPS
- SameSite attribute issues

**Diagnosis:**
```bash
# Check cookies in browser DevTools
# Application → Cookies → yourdomain.com
# Verify cookies are present and correct domain
```

**Solution:**

1. **Check Supabase cookie settings:**
   ```typescript
   // In Supabase client initialization
   // Should use proper cookie options
   {
     cookies: {
       domain: 'yourdomain.com', // or leave blank for auto
       secure: true, // HTTPS only
       sameSite: 'lax',
     }
   }
   ```

2. **Verify HTTPS is enabled:**
   ```
   Cloudflare → SSL/TLS → Always Use HTTPS: ON
   ```

3. **Clear cookies and test:**
   ```
   Browser DevTools → Application → Cookies
   Clear all → Test login again
   ```

4. **Check middleware cookie handling:**
   ```typescript
   // /Users/tannerosterkamp/vortis/middleware.ts
   // Verify cookies are properly forwarded
   ```

---

### Issue: Supabase Auth Not Working

**Symptoms:**
- "Invalid auth credentials" errors
- Auth redirects fail
- Session not created

**Cause:**
- Supabase redirect URLs not configured
- Site URL mismatch
- CORS issues

**Solution:**

1. **Update Supabase auth settings:**
   ```
   Supabase Dashboard → Authentication → URL Configuration
   Site URL: https://yourdomain.com
   ```

2. **Add redirect URLs:**
   ```
   Redirect URLs:
     https://yourdomain.com/**
     https://www.yourdomain.com/**
   ```

3. **Update CORS origins if needed:**
   ```
   Supabase Dashboard → Settings → API
   Additional Allowed Origins:
     https://yourdomain.com
     https://www.yourdomain.com
   ```

4. **Update environment variable:**
   ```
   Vercel → Settings → Environment Variables
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

5. **Redeploy and test**

---

## API Route Issues

### Issue: API Routes Return 403 Forbidden

**Symptoms:**
- API calls fail with 403
- "Access Denied" from Cloudflare

**Cause:**
- Cloudflare WAF blocking requests
- Bot protection too aggressive
- Rate limiting triggered

**Diagnosis:**
```bash
# Check Cloudflare Firewall Events
# Cloudflare Dashboard → Security → Events
# Look for blocked requests to /api/*
```

**Solution:**

1. **Check firewall events:**
   ```
   Cloudflare Dashboard → Security → Events
   Filter by: your domain, /api/*
   Identify rule causing blocks
   ```

2. **Whitelist API routes if needed:**
   ```
   Cloudflare Dashboard → Security → WAF → Custom Rules
   Create rule:
     If: URI Path starts with /api/
     Then: Skip: All remaining rules
   ```

3. **Adjust security level:**
   ```
   Cloudflare Dashboard → Security → Settings
   Security Level: Medium (or lower if still issues)
   ```

4. **Whitelist your IP during testing:**
   ```
   Create rule:
     If: IP address equals your.ip.address.here
     Then: Skip: All remaining rules
   ```

---

### Issue: API Routes Timeout

**Symptoms:**
- API requests hang
- 524 timeout errors from Cloudflare
- Slow API response times

**Cause:**
- Vercel function timeout
- Cloudflare proxy timeout (100 seconds)
- Slow database queries

**Diagnosis:**
```bash
# Test direct to Vercel (bypass Cloudflare)
curl -w "@curl-format.txt" https://your-app.vercel.app/api/endpoint

# curl-format.txt:
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

**Solution:**

1. **Check Vercel function logs:**
   ```
   Vercel Dashboard → Project → Logs
   Look for timeout errors
   ```

2. **Optimize slow API routes:**
   ```typescript
   // Add proper error handling and timeouts
   // Optimize database queries
   // Add request caching if appropriate
   ```

3. **Increase Vercel timeout (Pro plan):**
   ```
   // vercel.json
   {
     "functions": {
       "api/**/*.ts": {
         "maxDuration": 60
       }
     }
   }
   ```

4. **Consider moving long-running tasks to background:**
   - Use Vercel Cron Jobs
   - Or external job queue (BullMQ, etc.)

---

## Performance Issues

### Issue: Slow First Page Load

**Symptoms:**
- Initial page load takes >3 seconds
- TTFB (Time to First Byte) high
- Users complain about slowness

**Cause:**
- Extra hop through Cloudflare proxy
- Origin slow
- No caching configured

**Diagnosis:**
```bash
# Test TTFB
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Test without Cloudflare (direct to Vercel)
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.vercel.app

# Compare times
```

**Solution:**

1. **Enable Argo Smart Routing (if Pro plan):**
   ```
   Cloudflare Dashboard → Traffic → Argo
   Enable Argo Smart Routing
   Cost: $5/month + $0.10/GB
   ```

2. **Optimize Vercel deployment:**
   ```typescript
   // Enable React Server Components
   // Optimize images with next/image
   // Implement proper caching
   ```

3. **Configure aggressive caching:**
   ```
   Cache static assets with long TTL
   Use stale-while-revalidate for dynamic content
   ```

4. **Enable Early Hints:**
   ```
   Cloudflare Dashboard → Speed → Optimization
   Early Hints: ON
   ```

5. **Monitor Core Web Vitals:**
   ```
   Use Vercel Speed Insights
   Or Cloudflare Web Analytics
   ```

---

### Issue: Images Load Slowly

**Symptoms:**
- Images take >2 seconds to load
- Large image file sizes
- Poor mobile performance

**Cause:**
- Unoptimized images
- Not using CDN effectively
- Missing next/image optimization

**Solution:**

1. **Ensure using next/image:**
   ```typescript
   import Image from 'next/image';

   <Image
     src="/image.jpg"
     alt="Description"
     width={800}
     height={600}
     loading="lazy"
     quality={85}
   />
   ```

2. **Enable Cloudflare Polish (optional, paid):**
   ```
   Cloudflare Dashboard → Speed → Optimization
   Polish: Lossless (or Lossy)
   WebP: ON
   ```

3. **Use WebP/AVIF formats:**
   ```typescript
   // Next.js automatically serves WebP when supported
   // Ensure your images folder has optimized versions
   ```

4. **Lazy load offscreen images:**
   ```typescript
   <Image loading="lazy" />
   ```

5. **Use Cloudflare Images (advanced, paid):**
   ```
   Cloudflare Dashboard → Images
   $5/month for 100,000 images
   Better optimization than Next.js in some cases
   ```

---

## Security Blocks

### Issue: Legitimate Users Blocked

**Symptoms:**
- Users report "Access Denied" errors
- Challenge pages shown to real users
- High bounce rate

**Cause:**
- Security level too high
- Bot protection too aggressive
- False positives

**Solution:**

1. **Lower security level:**
   ```
   Cloudflare Dashboard → Security → Settings
   Security Level: Low or Medium
   ```

2. **Adjust Bot Fight Mode:**
   ```
   Free plan: Can only ON/OFF
   Pro plan: Fine-tune Super Bot Fight Mode
   ```

3. **Whitelist specific IPs/countries:**
   ```
   Cloudflare Dashboard → Security → WAF → Custom Rules
   Create allow rule for legitimate traffic
   ```

4. **Review firewall events:**
   ```
   Security → Events
   Identify false positives
   Create exceptions
   ```

---

### Issue: Stripe Webhooks Blocked

**Symptoms:**
- Webhooks not received
- Stripe shows delivery failures
- Subscriptions not created

**Cause:**
- Cloudflare blocking Stripe IPs
- Bot protection interfering
- WAF rules blocking POST requests

**Diagnosis:**
```bash
# Check Stripe webhook logs
# Stripe Dashboard → Webhooks → View logs
# Look for 403/blocked responses
```

**Solution:**

1. **Whitelist Stripe IPs:**
   ```
   Cloudflare Dashboard → Security → WAF → Custom Rules
   Create rule:
     If: URI Path equals /api/stripe/webhook
     AND IP address is in: [Stripe IP list]
     Then: Skip all remaining rules
   ```

2. **Stripe IP ranges:**
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

3. **Verify current IPs:** https://stripe.com/docs/ips

4. **Test webhook:**
   ```
   Stripe Dashboard → Webhooks → Send test webhook
   ```

---

## Deployment Issues

### Issue: Build Fails After Adding Cloudflare

**Symptoms:**
- Vercel build succeeds but site doesn't work
- Cloudflare Pages build fails
- TypeScript errors about Cloudflare types

**Cause:**
- Incorrect build configuration
- Missing dependencies
- Environment variable issues

**Solution:**

**If using Vercel (Option A):**
- Cloudflare doesn't affect builds
- Check Vercel build logs
- Verify environment variables

**If using Cloudflare Pages (Option B):**

1. **Check build command:**
   ```
   npm run pages:build
   ```

2. **Verify dependencies:**
   ```bash
   npm install --save-dev @cloudflare/next-on-pages
   ```

3. **Check build output:**
   ```
   .vercel/output/static should exist after build
   ```

---

## Webhook Issues

### Issue: All Webhooks Failing

**Symptoms:**
- No webhooks received from any provider
- Stripe, Supabase, etc. all failing

**Cause:**
- Webhooks being blocked by Cloudflare
- POST requests blocked
- Rate limiting triggered

**Solution:**

1. **Create webhook bypass rule:**
   ```
   Cloudflare Dashboard → Security → WAF → Custom Rules
   Create rule:
     If: URI Path starts with /api/webhooks/
     OR URI Path starts with /api/stripe/webhook
     Then: Skip all remaining rules
   ```

2. **Temporarily disable bot protection:**
   ```
   Security → Bots → Bot Fight Mode: OFF
   Test if webhooks work
   If yes, create specific allows
   ```

3. **Check rate limiting:**
   ```
   Security → WAF → Rate limiting rules
   Ensure webhooks not caught by rate limits
   ```

4. **Whitelist webhook providers:**
   ```
   Create allow rules for known IPs:
   - Stripe: See Stripe IP list
   - GitHub: See GitHub IP list
   - Etc.
   ```

---

## Emergency Procedures

### Issue: Site Completely Down

**Quick triage:**

1. **Check Cloudflare status:**
   - https://www.cloudflarestatus.com

2. **Check Vercel status:**
   - https://www.vercel-status.com

3. **Bypass Cloudflare temporarily:**
   ```
   Cloudflare Dashboard → DNS
   Change proxy status to DNS only (gray cloud)
   Wait 5 minutes
   Test site directly
   ```

4. **If site works without Cloudflare:**
   - Issue is Cloudflare config
   - Review recent changes
   - Check firewall events

5. **If site still doesn't work:**
   - Issue is Vercel/origin
   - Check Vercel logs
   - Check recent deployments

---

### Issue: Under DDoS Attack

**Immediate actions:**

1. **Enable "Under Attack" mode:**
   ```
   Cloudflare Dashboard → Overview
   Quick Actions → Under Attack Mode
   ```

2. **All visitors will see challenge page before accessing site**

3. **Review attack patterns:**
   ```
   Security → Events
   Analytics → Traffic
   ```

4. **Create specific blocks if needed:**
   ```
   Security → WAF → Custom Rules
   Block specific countries/IPs/user agents
   ```

5. **Once attack subsides:**
   ```
   Disable "Under Attack" mode
   Return Security Level to Medium
   ```

---

## Diagnostic Commands Reference

```bash
# DNS checks
dig yourdomain.com
nslookup yourdomain.com
host yourdomain.com

# SSL checks
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
curl -vI https://yourdomain.com

# Cache checks
curl -I https://yourdomain.com | grep -i cache
curl -I https://yourdomain.com | grep cf-

# Performance checks
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Trace route
traceroute yourdomain.com
mtr yourdomain.com

# Check from different locations
# Use: https://www.webpagetest.org
# Or: https://tools.keycdn.com/performance
```

---

## Support Escalation

**Community Support:**
- Cloudflare Community: https://community.cloudflare.com
- Vercel Discord: https://vercel.com/discord

**Paid Support:**
- Cloudflare Pro: Email support
- Cloudflare Business: 24/7 chat support
- Vercel Pro: Email support

**Emergency:**
- Cloudflare Enterprise: Phone support + TAM
- Vercel Enterprise: Dedicated support

---

## Prevention Checklist

Before going live:
- [ ] SSL/TLS set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] Cache rules configured
- [ ] API routes bypass cache
- [ ] OAuth redirects updated
- [ ] Webhook IPs whitelisted
- [ ] Security level appropriate
- [ ] Rate limiting configured
- [ ] Monitoring alerts set up
- [ ] Test all features after setup
- [ ] Document custom configuration
- [ ] Create rollback plan

---

**For setup instructions, see:** `VERCEL_CLOUDFLARE_SETUP.md`
**For configuration reference, see:** `CLOUDFLARE_CONFIG_REFERENCE.md`
