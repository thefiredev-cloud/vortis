# Cloudflare Deployment Checklist

Quick reference checklist for deploying Vortis with Cloudflare. Complete each phase in order.

**Estimated Time:** 30-45 minutes

---

## Pre-Deployment

### Domain & Accounts
- [ ] Domain registered and accessible
- [ ] Cloudflare account created (free tier okay)
- [ ] Vercel account created (free tier okay)
- [ ] GitHub repository ready
- [ ] Supabase project created
- [ ] Stripe account configured

### Environment Variables Ready
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `STRIPE_SECRET_KEY` (live key)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_STARTER_PRICE_ID`
- [ ] `STRIPE_PRO_PRICE_ID`
- [ ] `STRIPE_ENTERPRISE_PRICE_ID`

---

## Phase 1: Vercel Deployment (10 min)

### Initial Deploy
- [ ] Connected GitHub repo to Vercel
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Build command: `npm run build` (default)
- [ ] Node version: 22.x
- [ ] Added all environment variables
- [ ] Set `NEXT_PUBLIC_APP_URL` to Vercel URL initially
- [ ] Deployment successful
- [ ] Tested Vercel URL loads correctly

### Verification
- [ ] Homepage loads: `https://your-app.vercel.app`
- [ ] Auth pages load: `https://your-app.vercel.app/auth/login`
- [ ] No console errors in browser DevTools
- [ ] Assets load correctly (images, CSS)

---

## Phase 2: Cloudflare Setup (15 min)

### Add Domain
- [ ] Added domain to Cloudflare
- [ ] Selected Free plan (or Pro if desired)
- [ ] Noted Cloudflare nameservers

### Update Nameservers
- [ ] Logged into domain registrar
- [ ] Updated nameservers to Cloudflare's
- [ ] Saved changes
- [ ] Waited for Cloudflare to show "Active" (15-30 min)

### DNS Configuration
- [ ] Created CNAME for root: `@ → cname.vercel-dns.com`
- [ ] Set proxy status: Proxied (orange cloud)
- [ ] Created CNAME for www: `www → cname.vercel-dns.com`
- [ ] Set proxy status: Proxied (orange cloud)
- [ ] Verified DNS propagation: `dig yourdomain.com`

### SSL/TLS Setup
- [ ] Set encryption mode: Full (strict)
- [ ] Enabled Always Use HTTPS
- [ ] Enabled Automatic HTTPS Rewrites
- [ ] Set Minimum TLS: 1.2
- [ ] Enabled TLS 1.3
- [ ] Enabled HSTS:
  - [ ] Max Age: 15552000 (6 months)
  - [ ] Include subdomains: ON
  - [ ] Preload: ON (if committed to HTTPS)
- [ ] Enabled Certificate Transparency Monitoring

---

## Phase 3: Connect Custom Domain (5 min)

### Vercel Domain Setup
- [ ] Added custom domain in Vercel: `yourdomain.com`
- [ ] Added www domain: `www.yourdomain.com`
- [ ] Waited for SSL certificate provisioning
- [ ] Verified domain shows green checkmark
- [ ] Tested custom domain loads: `https://yourdomain.com`
- [ ] Verified SSL certificate valid (click padlock icon)

---

## Phase 4: Update URLs (10 min)

### Vercel Environment Variables
- [ ] Updated `NEXT_PUBLIC_APP_URL` to `https://yourdomain.com`
- [ ] Saved changes
- [ ] Redeployed application
- [ ] Verified deployment successful

### Google OAuth Configuration
- [ ] Opened Google Cloud Console
- [ ] Navigated to APIs & Services → Credentials
- [ ] Selected OAuth 2.0 Client ID
- [ ] Updated Authorized JavaScript origins:
  - [ ] `https://yourdomain.com`
  - [ ] `https://www.yourdomain.com`
- [ ] Updated Authorized redirect URIs:
  - [ ] `https://yourdomain.com/auth/callback`
  - [ ] `https://www.yourdomain.com/auth/callback`
- [ ] Saved changes
- [ ] Waited 5 minutes for propagation

### Supabase Configuration
- [ ] Opened Supabase Dashboard
- [ ] Navigated to Authentication → URL Configuration
- [ ] Updated Site URL: `https://yourdomain.com`
- [ ] Added Redirect URLs:
  - [ ] `https://yourdomain.com/**`
  - [ ] `https://www.yourdomain.com/**`
- [ ] Saved changes

### Stripe Webhook
- [ ] Opened Stripe Dashboard → Webhooks
- [ ] Updated webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
- [ ] Copied new webhook secret
- [ ] Updated `STRIPE_WEBHOOK_SECRET` in Vercel
- [ ] Redeployed application
- [ ] Tested webhook with "Send test webhook"

---

## Phase 5: Cloudflare Optimization (15 min)

### Caching Rules
- [ ] Created Cache Rule: Cache Next.js static assets
  - [ ] Path contains: `/_next/static/`
  - [ ] Edge TTL: 1 month
  - [ ] Browser TTL: 1 year
- [ ] Created Cache Rule: Bypass API cache
  - [ ] Path starts with: `/api/`
  - [ ] Action: Bypass cache
- [ ] Created Cache Rule: Cache public assets (optional)
  - [ ] Extensions: jpg, png, gif, svg, css, js, woff
  - [ ] Edge TTL: 7 days
  - [ ] Browser TTL: 1 day

### Performance Settings
- [ ] Enabled Auto Minify:
  - [ ] JavaScript: ON
  - [ ] CSS: ON
  - [ ] HTML: ON
- [ ] Enabled Brotli compression
- [ ] Enabled Early Hints
- [ ] Confirmed Rocket Loader: OFF (critical)
- [ ] Enabled Mirage (optional)
- [ ] Set Browser Cache TTL: 4 hours

### Security Settings
- [ ] Set Security Level: Medium
- [ ] Enabled Bot Fight Mode
- [ ] Set Challenge Passage: 30 minutes
- [ ] Enabled Browser Integrity Check

### Transform Rules (Optional)
- [ ] Created rule to add security headers:
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: SAMEORIGIN
  - [ ] Referrer-Policy: strict-origin-when-cross-origin

### Rate Limiting (Pro Plan Only)
- [ ] Created rate limit for login: `/api/auth/login`
  - [ ] 5 requests per minute per IP
  - [ ] Action: Block for 1 hour
- [ ] Created rate limit for API: `/api/*`
  - [ ] 100 requests per 10 minutes per IP
  - [ ] Action: Challenge for 30 minutes
- [ ] Created rate limit for signup: `/api/auth/signup`
  - [ ] 3 requests per hour per IP
  - [ ] Action: Block for 1 hour

---

## Phase 6: Testing (15 min)

### DNS & SSL
- [ ] Verified DNS resolves: `dig yourdomain.com`
- [ ] Tested SSL: https://www.ssllabs.com/ssltest/
  - [ ] Grade: A or A+
- [ ] Checked security headers: https://securityheaders.com
  - [ ] Grade: B or higher

### Application Functionality
- [ ] Homepage loads without errors
- [ ] All pages load correctly (about, pricing, etc.)
- [ ] Images load from CDN
- [ ] CSS/JS loads correctly
- [ ] No console errors
- [ ] Mobile responsive working

### Authentication Flow
- [ ] Clicked "Sign In"
- [ ] Google OAuth button works
- [ ] Redirected to Google login
- [ ] Authorized application
- [ ] Redirected back to site
- [ ] Successfully authenticated
- [ ] Dashboard loads
- [ ] User data displays correctly
- [ ] Logout works

### API Routes
- [ ] Tested API endpoints (if any public ones)
- [ ] Verified responses correct
- [ ] Checked response times acceptable
- [ ] Confirmed not cached (check headers)

### Stripe Integration
- [ ] Visited pricing page
- [ ] Clicked "Subscribe" on test plan
- [ ] Redirected to Stripe Checkout
- [ ] Completed test payment (use 4242 4242 4242 4242)
- [ ] Redirected back to success page
- [ ] Verified subscription created in Stripe Dashboard
- [ ] Checked webhook received
- [ ] Confirmed subscription in database

### Caching Verification
- [ ] Tested static asset caching:
  ```bash
  curl -I https://yourdomain.com/_next/static/xxx.js | grep cf-cache-status
  # First: MISS, Second: HIT
  ```
- [ ] Tested API not cached:
  ```bash
  curl -I https://yourdomain.com/api/your-endpoint | grep cf-cache-status
  # Should be: DYNAMIC or MISS
  ```
- [ ] Tested HTML caching (if configured)

### Performance Testing
- [ ] Tested from WebPageTest: https://www.webpagetest.org
  - [ ] TTFB < 600ms
  - [ ] Load time < 3s
  - [ ] Performance score > 80
- [ ] Tested from multiple locations (US, EU, Asia)
- [ ] Verified Core Web Vitals acceptable

### Cross-Browser Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested in Edge
- [ ] Tested on mobile (iOS/Android)

---

## Phase 7: Monitoring Setup (10 min)

### Cloudflare Alerts
- [ ] Configured alert: SSL/TLS certificate expiration
- [ ] Configured alert: Spike in traffic (5x in 5 min)
- [ ] Configured alert: Spike in 5xx errors (>100 in 5 min)
- [ ] Configured alert: Spike in threats (>1000 in 5 min)
- [ ] Verified notification email correct

### Vercel Monitoring
- [ ] Enabled Vercel Analytics (if Pro plan)
- [ ] Set up deployment notifications
- [ ] Configured error alerts

### External Monitoring (Optional)
- [ ] Set up UptimeRobot or similar
- [ ] Monitor: `https://yourdomain.com`
- [ ] Check interval: 5 minutes
- [ ] Alert contacts configured

---

## Phase 8: Documentation (5 min)

### Record Configuration
- [ ] Documented Cloudflare settings used
- [ ] Saved cache rules configuration
- [ ] Recorded security settings
- [ ] Noted any custom Page Rules
- [ ] Documented rate limiting rules

### Credentials
- [ ] Saved Cloudflare credentials securely
- [ ] Saved Vercel credentials
- [ ] Documented all environment variables
- [ ] Created backup of settings

### Team Access
- [ ] Added team members to Cloudflare (if any)
- [ ] Added team members to Vercel (if any)
- [ ] Set appropriate permissions

---

## Post-Deployment (24 hours)

### Monitor for Issues
- [ ] Watched Cloudflare Analytics for anomalies
- [ ] Checked Vercel logs for errors
- [ ] Reviewed security events in Cloudflare
- [ ] Verified no user complaints

### Performance Review
- [ ] Reviewed page load times
- [ ] Checked cache hit ratio (should be >80% for static)
- [ ] Analyzed bandwidth usage
- [ ] Reviewed Core Web Vitals

### Security Review
- [ ] Checked for blocked threats
- [ ] Verified no false positives (legitimate users blocked)
- [ ] Reviewed rate limiting effectiveness
- [ ] Confirmed no security warnings

---

## Week 1 Tasks

### Regular Monitoring
- [ ] Daily: Check Cloudflare Analytics
- [ ] Daily: Review Vercel deployment logs
- [ ] Daily: Test critical user flows
- [ ] Weekly: Review performance metrics
- [ ] Weekly: Check for Cloudflare/Vercel updates

### Optimization
- [ ] Identify slow pages and optimize
- [ ] Review cache hit ratio and adjust rules
- [ ] Analyze user behavior and improve UX
- [ ] Review security events and tune rules

---

## Rollback Plan (In Case of Emergency)

### If Site Breaks:

1. **Immediate Actions:**
   - [ ] Disable Cloudflare proxy (gray cloud in DNS)
   - [ ] Site should work directly via Vercel
   - [ ] Identify what broke

2. **Common Fixes:**
   - [ ] SSL/TLS mode → Full (strict)
   - [ ] Purge Cloudflare cache
   - [ ] Disable recent cache rules
   - [ ] Temporarily disable Bot Fight Mode
   - [ ] Check Vercel deployment status

3. **If Still Broken:**
   - [ ] Rollback Vercel deployment
   - [ ] Revert environment variables
   - [ ] Check Supabase/Stripe settings

4. **Once Fixed:**
   - [ ] Re-enable Cloudflare proxy
   - [ ] Test thoroughly
   - [ ] Document what went wrong

---

## Success Criteria

Your deployment is successful when:

- [ ] Domain loads via HTTPS with valid SSL (A+ rating)
- [ ] All pages load without errors
- [ ] Google OAuth authentication works
- [ ] Stripe payments process correctly
- [ ] Webhooks received and processed
- [ ] Static assets served from Cloudflare CDN
- [ ] API routes not cached
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Mobile experience smooth
- [ ] Security grade B+ or higher
- [ ] Monitoring alerts working
- [ ] Team has access to all platforms

---

## Maintenance Schedule

### Daily
- Check Cloudflare Analytics for anomalies
- Review any security alerts

### Weekly
- Review Vercel deployment logs
- Check performance metrics
- Test critical user flows
- Review security events

### Monthly
- Audit environment variables
- Review and optimize cache rules
- Check SSL certificate status
- Review rate limiting effectiveness
- Update documentation

### Quarterly
- Performance audit from multiple locations
- Security audit (WAF rules, etc.)
- Review and optimize costs
- Test disaster recovery

---

## Resources

**Setup Guides:**
- `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_DEPLOYMENT.md` - Overview of options
- `/Users/tannerosterkamp/vortis/docs/VERCEL_CLOUDFLARE_SETUP.md` - Detailed setup
- `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_CONFIG_REFERENCE.md` - Configuration reference
- `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_TROUBLESHOOTING.md` - Troubleshooting guide

**External Resources:**
- Vercel Docs: https://vercel.com/docs
- Cloudflare Docs: https://developers.cloudflare.com
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Stripe Docs: https://stripe.com/docs

**Testing Tools:**
- SSL Test: https://www.ssllabs.com/ssltest/
- Security Headers: https://securityheaders.com
- DNS Check: https://www.whatsmydns.net
- Performance: https://www.webpagetest.org
- Speed Test: https://tools.keycdn.com/performance

**Status Pages:**
- Cloudflare: https://www.cloudflarestatus.com
- Vercel: https://www.vercel-status.com
- Stripe: https://status.stripe.com
- Supabase: https://status.supabase.com

---

## Notes

**Timing Considerations:**
- DNS propagation: 15 minutes to 48 hours (usually 30 min - 2 hours)
- SSL certificate provisioning: 5-10 minutes
- Cloudflare cache updates: 2-5 minutes
- OAuth changes: 5 minutes
- Vercel deployment: 2-5 minutes

**Cost Estimate (Free Tier):**
- Cloudflare Free: $0/month
- Vercel Hobby: $0/month (100GB bandwidth)
- Total: $0/month

**Cost Estimate (Production - Recommended):**
- Cloudflare Pro: $20/month
- Vercel Pro: $20/month
- Argo Smart Routing: $5/month + usage
- Total: ~$45-50/month

**Team Size:**
- 1 person can complete this in 45-60 minutes
- Have 2 people for verification and faster troubleshooting

**Best Time to Deploy:**
- Weekday morning (Tuesday-Thursday)
- When you have 2-3 hours available
- Not during peak traffic times
- When support teams available if needed

---

**Print this checklist and mark off items as you complete them. Good luck with your deployment!**
