# Clerk Environment Testing Matrix

Comprehensive testing matrix across development, staging, and production environments.

## Environment Overview

| Environment | Purpose | Clerk Keys | Domain | Database |
|-------------|---------|------------|--------|----------|
| **Local** | Development | `pk_test_` | localhost:3000 | Dev Supabase |
| **Staging** | Pre-production testing | `pk_test_` | staging.vortis.com | Staging Supabase |
| **Production** | Live application | `pk_live_` | vortis.com | Prod Supabase |

---

## 1. Authentication Testing Matrix

### Sign-Up Flow

| Test | Local | Staging | Production | Notes |
|------|-------|---------|------------|-------|
| New user sign-up | ☐ | ☐ | ☐ | |
| Google OAuth flow | ☐ | ☐ | ☐ | |
| Redirect to dashboard | ☐ | ☐ | ☐ | |
| Profile created in DB | ☐ | ☐ | ☐ | |
| Email confirmation | ☐ | ☐ | ☐ | If enabled |
| Error handling | ☐ | ☐ | ☐ | |

**Environment-Specific Checks:**

**Local:**
- [ ] Uses test Google OAuth client
- [ ] Webhooks forwarded via Clerk CLI or ngrok
- [ ] Test Supabase project connected
- [ ] Console logs visible

**Staging:**
- [ ] Uses staging Google OAuth client
- [ ] Webhooks endpoint accessible: `https://staging.vortis.com/api/webhooks/clerk`
- [ ] Staging database isolated from production
- [ ] Monitoring enabled

**Production:**
- [ ] Uses production Google OAuth client
- [ ] Webhooks endpoint secure and monitored
- [ ] Production database backups configured
- [ ] Error tracking enabled (Sentry, etc.)

---

### Sign-In Flow

| Test | Local | Staging | Production | Notes |
|------|-------|---------|------------|-------|
| Existing user sign-in | ☐ | ☐ | ☐ | |
| Session creation | ☐ | ☐ | ☐ | |
| Dashboard loads | ☐ | ☐ | ☐ | |
| User data fetched | ☐ | ☐ | ☐ | |
| Subscription status shown | ☐ | ☐ | ☐ | |
| Multiple sessions | ☐ | ☐ | ☐ | |

---

### Sign-Out Flow

| Test | Local | Staging | Production | Notes |
|------|-------|---------|------------|-------|
| Sign-out button works | ☐ | ☐ | ☐ | |
| Session cleared | ☐ | ☐ | ☐ | |
| Cookies removed | ☐ | ☐ | ☐ | |
| Redirect to homepage | ☐ | ☐ | ☐ | |
| Cannot access dashboard | ☐ | ☐ | ☐ | |

---

## 2. Webhook Testing Matrix

### Webhook Configuration

| Configuration | Local | Staging | Production |
|---------------|-------|---------|------------|
| **Endpoint URL** | ☐ Via Clerk CLI<br>☐ Via ngrok/tunnel | ☐ https://staging.vortis.com/api/webhooks/clerk | ☐ https://vortis.com/api/webhooks/clerk |
| **Signing Secret** | ☐ `whsec_` (test) | ☐ `whsec_` (staging) | ☐ `whsec_` (production) |
| **Events** | ☐ user.created<br>☐ user.updated<br>☐ user.deleted | ☐ user.created<br>☐ user.updated<br>☐ user.deleted | ☐ user.created<br>☐ user.updated<br>☐ user.deleted |
| **Status** | ☐ Active | ☐ Active | ☐ Active |

---

### Webhook Events

| Event | Local | Staging | Production | Notes |
|-------|-------|---------|------------|-------|
| **user.created** | | | | |
| Webhook received | ☐ | ☐ | ☐ | |
| Signature verified | ☐ | ☐ | ☐ | |
| Profile created | ☐ | ☐ | ☐ | |
| Data accurate | ☐ | ☐ | ☐ | |
| Latency < 3s | ☐ | ☐ | ☐ | |
| **user.updated** | | | | |
| Webhook received | ☐ | ☐ | ☐ | |
| Profile updated | ☐ | ☐ | ☐ | |
| No duplicates | ☐ | ☐ | ☐ | |
| **user.deleted** | | | | |
| Webhook received | ☐ | ☐ | ☐ | |
| Profile deleted/marked | ☐ | ☐ | ☐ | |
| Related data cleaned | ☐ | ☐ | ☐ | |

---

## 3. Database Integration Matrix

### Supabase Connection

| Test | Local | Staging | Production |
|------|-------|---------|------------|
| Connection establishes | ☐ | ☐ | ☐ |
| Queries execute | ☐ | ☐ | ☐ |
| RLS policies work | ☐ | ☐ | ☐ |
| Indexes present | ☐ | ☐ | ☐ |
| Backups configured | N/A | ☐ | ☐ |

---

### Profile Management

| Test | Local | Staging | Production |
|------|-------|---------|------------|
| Profile creates on sign-up | ☐ | ☐ | ☐ |
| Profile updates sync | ☐ | ☐ | ☐ |
| No duplicate profiles | ☐ | ☐ | ☐ |
| Profile deletion works | ☐ | ☐ | ☐ |
| Data consistency | ☐ | ☐ | ☐ |

---

## 4. API Routes Testing Matrix

### Protected Routes

| Route | Local | Staging | Production | Expected Status |
|-------|-------|---------|------------|-----------------|
| `/api/user/profile` (authed) | ☐ | ☐ | ☐ | 200 |
| `/api/user/profile` (unauthed) | ☐ | ☐ | ☐ | 401 |
| `/api/stocks/analyze` (authed) | ☐ | ☐ | ☐ | 200 |
| `/api/stocks/analyze` (unauthed) | ☐ | ☐ | ☐ | 401 |
| `/api/stripe/create-checkout` | ☐ | ☐ | ☐ | 200 |

---

## 5. Integration Testing Matrix

### Clerk + Stripe

| Test | Local | Staging | Production |
|------|-------|---------|------------|
| Checkout includes user ID | ☐ | ☐ | ☐ |
| Customer created with email | ☐ | ☐ | ☐ |
| Subscription syncs to DB | ☐ | ☐ | ☐ |
| User sees subscription status | ☐ | ☐ | ☐ |
| Can manage subscription | ☐ | ☐ | ☐ |

---

### Clerk + Stock Analysis

| Test | Local | Staging | Production |
|------|-------|---------|------------|
| Analysis requires auth | ☐ | ☐ | ☐ |
| User ID logged with analysis | ☐ | ☐ | ☐ |
| Rate limiting per user tier | ☐ | ☐ | ☐ |
| History tied to user | ☐ | ☐ | ☐ |

---

## 6. Performance Testing Matrix

### Load Times

| Metric | Local Target | Staging Target | Production Target |
|--------|--------------|----------------|-------------------|
| Homepage (unauthed) | < 2s | < 1.5s | < 1s |
| Dashboard (authed) | < 3s | < 2s | < 1.5s |
| Auth check (middleware) | < 100ms | < 80ms | < 50ms |
| Sign-in flow | < 5s | < 4s | < 3s |
| Webhook processing | < 500ms | < 400ms | < 300ms |

**Test Results:**

| Metric | Local | Staging | Production | Pass/Fail |
|--------|-------|---------|------------|-----------|
| Homepage | ___s | ___s | ___s | ☐ |
| Dashboard | ___s | ___s | ___s | ☐ |
| Auth check | ___ms | ___ms | ___ms | ☐ |
| Sign-in | ___s | ___s | ___s | ☐ |
| Webhook | ___ms | ___ms | ___ms | ☐ |

---

## 7. Security Testing Matrix

### Security Checks

| Test | Local | Staging | Production |
|------|-------|---------|------------|
| HTTPS enforced | N/A | ☐ | ☐ |
| Secure cookies | ☐ | ☐ | ☐ |
| CSRF protection | ☐ | ☐ | ☐ |
| XSS prevention | ☐ | ☐ | ☐ |
| SQL injection prevention | ☐ | ☐ | ☐ |
| Webhook signature verification | ☐ | ☐ | ☐ |
| Invalid tokens rejected | ☐ | ☐ | ☐ |
| Secret keys not exposed | ☐ | ☐ | ☐ |

---

## 8. Environment Configuration Checklist

### Local Environment

**File:** `/Users/tannerosterkamp/vortis/.env.local`

```bash
# Clerk (Test Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase (Dev Project)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Checklist:**
- [ ] All variables set
- [ ] Test keys used
- [ ] Dev database connected
- [ ] File in `.gitignore`

---

### Staging Environment

**Hosting Platform:** (Vercel/Railway/etc.)

```bash
# Clerk (Test or Staging Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_staging_...

# Supabase (Staging Project)
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://staging.vortis.com
```

**Checklist:**
- [ ] Separate from production
- [ ] Test data safe to delete
- [ ] Monitoring enabled
- [ ] Can test destructive operations

---

### Production Environment

**Hosting Platform:** (Vercel/Railway/etc.)

```bash
# Clerk (Live Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_live_...

# Supabase (Production Project)
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (Live Keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# App URL
NEXT_PUBLIC_APP_URL=https://vortis.com
```

**Checklist:**
- [ ] Live keys only
- [ ] Database backups enabled
- [ ] Error tracking (Sentry, etc.)
- [ ] Monitoring/alerts configured
- [ ] All webhooks point to production
- [ ] SSL/HTTPS enforced

---

## 9. Cross-Environment Test Scenarios

### Scenario 1: Local Development → Staging Deployment

**Test:**
1. Develop feature locally with test keys
2. Test thoroughly in local environment
3. Deploy to staging
4. Verify staging uses staging keys
5. Test end-to-end in staging
6. Verify webhooks work in staging

**Checklist:**
- [ ] Feature works locally
- [ ] Staging deployment successful
- [ ] Staging environment variables correct
- [ ] No local dependencies
- [ ] Webhooks reach staging server
- [ ] Data isolated from production

---

### Scenario 2: Staging → Production Promotion

**Test:**
1. Complete testing in staging
2. Verify all tests pass
3. Update production environment variables
4. Deploy to production
5. Smoke test production
6. Monitor for errors

**Checklist:**
- [ ] Staging tests all pass
- [ ] Production keys configured
- [ ] Database migrations applied
- [ ] Webhooks point to production
- [ ] Google OAuth production credentials
- [ ] Monitoring active
- [ ] Rollback plan ready

---

## 10. Environment-Specific Issue Tracking

### Issues by Environment

| Issue | Local | Staging | Production | Resolution |
|-------|-------|---------|------------|------------|
| | | | | |
| | | | | |
| | | | | |

---

## 11. Testing Sign-Off

### Local Environment

**Tester:** _______________
**Date:** _______________
**Status:** PASS / FAIL

**Sign-off Criteria:**
- [ ] All auth flows work
- [ ] Webhooks forward correctly
- [ ] Database syncs
- [ ] No console errors

**Signature:** _______________

---

### Staging Environment

**Tester:** _______________
**Date:** _______________
**Status:** PASS / FAIL

**Sign-off Criteria:**
- [ ] All local tests pass in staging
- [ ] Performance acceptable
- [ ] Security checks pass
- [ ] Ready for production

**Signature:** _______________

---

### Production Environment

**Tester:** _______________
**Date:** _______________
**Status:** PASS / FAIL

**Sign-off Criteria:**
- [ ] Smoke tests pass
- [ ] No errors in monitoring
- [ ] User feedback positive
- [ ] Rollback not needed

**Signature:** _______________

---

## 12. Next Steps

After completing environment testing:

1. **Review Testing Checklist**
   - See: `/Users/tannerosterkamp/vortis/CLERK_TESTING_CHECKLIST.md`

2. **Prepare for Production**
   - Verify all production keys
   - Enable monitoring
   - Set up alerts
   - Document deployment process
