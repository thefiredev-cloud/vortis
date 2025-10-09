# Cloudflare Quick Start

**Deploy Vortis with Cloudflare in 30 minutes.**

---

## What You Need

- Domain name
- Cloudflare account (free)
- Vercel account (free)
- 30 minutes

---

## Quick Decision: Which Deployment Option?

### Option A: Vercel + Cloudflare (RECOMMENDED)

**Choose if:**
- You want the easiest setup
- You're familiar with Vercel
- You need maximum Next.js compatibility

**Time:** 30 minutes

**Follow:** `/Users/tannerosterkamp/vortis/docs/VERCEL_CLOUDFLARE_SETUP.md`

---

### Option B: Cloudflare Pages

**Choose if:**
- You prefer single-platform management
- You're Cloudflare-first
- You want tighter Workers integration

**Time:** 45 minutes

**Follow:** `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_DEPLOYMENT.md` → Option B

---

### Option C: Hybrid (Advanced)

**Choose if:**
- You need ultra-low latency APIs
- You want edge computing with Workers
- You're comfortable with complexity

**Time:** 2-3 hours

**Follow:** `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_DEPLOYMENT.md` → Option C

---

## Recommended Path: Vercel + Cloudflare

### 3-Minute Overview

1. **Deploy to Vercel** (10 min)
   - Connect GitHub repo
   - Add environment variables
   - Deploy

2. **Setup Cloudflare** (10 min)
   - Add domain to Cloudflare
   - Update nameservers at registrar
   - Configure DNS records
   - Set SSL to "Full (strict)"

3. **Connect Domain** (5 min)
   - Add custom domain in Vercel
   - Wait for SSL provisioning
   - Test site loads

4. **Update URLs** (5 min)
   - Update `NEXT_PUBLIC_APP_URL`
   - Update Google OAuth redirects
   - Update Supabase redirects
   - Update Stripe webhook URL

---

## Essential Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Critical Settings

### Cloudflare SSL/TLS

**MUST BE SET CORRECTLY:**

```
Cloudflare Dashboard → SSL/TLS → Overview
Encryption mode: Full (strict)

SSL/TLS → Edge Certificates
Always Use HTTPS: ON
Minimum TLS Version: 1.2
```

**Wrong setting = infinite redirect loop**

---

### Cloudflare Caching

**Cache static assets, NOT API routes:**

```
Create Cache Rule:
  If: Path starts with /api/
  Then: Bypass cache

Create Cache Rule:
  If: Path contains /_next/static/
  Then: Cache everything, 1 month TTL
```

---

## Testing Checklist

After deployment, verify:

- [ ] `https://yourdomain.com` loads without errors
- [ ] SSL shows green padlock (A or A+ rating)
- [ ] Google OAuth login works
- [ ] Dashboard loads after login
- [ ] Stripe payment works (test mode)
- [ ] Webhook received from Stripe
- [ ] Images/assets load from Cloudflare CDN
- [ ] No console errors in browser DevTools

**Test in incognito window to avoid cache issues.**

---

## Common Issues & Fixes

### Issue: Infinite Redirect Loop

**Fix:**
```
Cloudflare → SSL/TLS → Full (strict)
Wait 30 seconds
Clear browser cache
```

### Issue: OAuth Fails

**Fix:**
```
Google Cloud Console → Credentials
Update redirect URIs:
  https://yourdomain.com/auth/callback
  https://www.yourdomain.com/auth/callback
```

### Issue: Stripe Webhooks Not Received

**Fix:**
```
Stripe Dashboard → Webhooks
Update URL: https://yourdomain.com/api/stripe/webhook
Copy new secret
Update STRIPE_WEBHOOK_SECRET in Vercel
Redeploy
```

### Issue: Old Content Still Showing

**Fix:**
```
Cloudflare → Caching → Purge Everything
Wait 2-3 minutes
Hard refresh browser (Ctrl+Shift+R)
```

---

## Cost Estimate

### Free Tier (Perfect for Starting)

- Cloudflare Free: $0/month
- Vercel Hobby: $0/month
- **Total: $0/month**

**Limits:**
- 100GB Vercel bandwidth
- Unlimited Cloudflare bandwidth
- 100 Vercel build hours/month
- Good for < 1000 users

### Production (Recommended)

- Cloudflare Pro: $20/month
- Vercel Pro: $20/month
- **Total: $40/month**

**Benefits:**
- Advanced security (WAF, advanced bot protection)
- Email support
- More Page Rules
- Better analytics

### High Performance

- Cloudflare Pro: $20/month
- Vercel Pro: $20/month
- Argo Smart Routing: ~$10/month
- **Total: $50/month**

**Benefits:**
- 30% faster globally
- Best for international users
- Recommended for > 5000 users

---

## Next Steps After Deployment

### Day 1
- Monitor Cloudflare Analytics for issues
- Test all user flows
- Check Vercel logs for errors

### Week 1
- Review cache hit ratio (should be >80%)
- Check security events
- Optimize slow pages

### Month 1
- Review costs
- Analyze performance metrics
- Consider upgrading to Pro if on Free tier
- Set up proper monitoring (UptimeRobot, Sentry)

---

## Documentation

**Setup Guides:**
- **Detailed Setup:** `/Users/tannerosterkamp/vortis/docs/VERCEL_CLOUDFLARE_SETUP.md`
- **All Options:** `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_DEPLOYMENT.md`
- **Configuration:** `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_CONFIG_REFERENCE.md`
- **Troubleshooting:** `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_TROUBLESHOOTING.md`
- **Security & Performance:** `/Users/tannerosterkamp/vortis/docs/CLOUDFLARE_SECURITY_PERFORMANCE.md`

**Checklist:**
- **Deployment Checklist:** `CLOUDFLARE_DEPLOYMENT_CHECKLIST.md`

---

## Support

**Issues?**

1. Check troubleshooting guide first
2. Test with Cloudflare proxy disabled (gray cloud)
3. Check Vercel deployment logs
4. Review Cloudflare firewall events

**Still stuck?**

- Cloudflare Community: https://community.cloudflare.com
- Vercel Discord: https://vercel.com/discord
- Documentation: See guides above

---

## Pro Tips

1. **Always set SSL to "Full (strict)"** - most common issue is wrong SSL mode

2. **Test in incognito** - avoid cache confusion during setup

3. **Update OAuth FIRST** - before pointing users to new domain

4. **Enable Development Mode** when debugging - bypasses cache for 3 hours

5. **Monitor for 24 hours** after deployment - catch issues early

6. **Document your settings** - makes troubleshooting easier

7. **Start with Free tier** - upgrade when you need more features

8. **Purge cache after deployments** - ensures users see latest version

9. **Whitelist webhook IPs** - prevents Stripe/other webhooks from being blocked

10. **Set up alerts** - know about issues before users complain

---

## Success Metrics

Your deployment is successful when:

- SSL rating: A or A+
- TTFB: < 600ms
- Page load: < 3 seconds
- Uptime: > 99.9%
- No OAuth failures
- Webhooks 100% delivered
- Cache hit ratio: > 80%
- No security blocks of legitimate users

---

**Ready to deploy?**

Start with: `/Users/tannerosterkamp/vortis/docs/VERCEL_CLOUDFLARE_SETUP.md`

Or use checklist: `CLOUDFLARE_DEPLOYMENT_CHECKLIST.md`
