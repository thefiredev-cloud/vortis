# Clerk Testing Checklist

Master checklist for Clerk authentication integration testing before deployment.

## Pre-Deployment Testing

Complete ALL sections before marking ready for production.

---

## 1. Clerk Configuration

### Dashboard Setup
- [ ] Clerk application created
- [ ] Application name set to "Vortis"
- [ ] Google OAuth provider enabled
- [ ] Google OAuth credentials configured
- [ ] Email provider configured (if applicable)
- [ ] Session settings configured
- [ ] User profile fields configured
- [ ] Webhooks created and active

### API Keys
- [ ] Publishable key obtained (`pk_test_` or `pk_live_`)
- [ ] Secret key obtained (`sk_test_` or `sk_live_`)
- [ ] Webhook signing secret obtained (`whsec_`)
- [ ] Keys match environment (test for dev, live for prod)
- [ ] Keys never committed to git
- [ ] Keys stored securely in environment variables

---

## 2. Environment Variables

### Local (.env.local)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set
- [ ] `CLERK_SECRET_KEY` set
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/dashboard`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/dashboard`
- [ ] `CLERK_WEBHOOK_SECRET` set
- [ ] All values are not placeholders
- [ ] File in `.gitignore`

### Production
- [ ] All Clerk environment variables configured
- [ ] Using production keys (`pk_live_`, `sk_live_`)
- [ ] Webhook secret matches production endpoint
- [ ] Variables set in hosting platform (Vercel, Railway, etc.)

---

## 3. Authentication Flow

### Sign-Up (New User)
- [ ] Sign-up page loads (`/sign-up`)
- [ ] "Continue with Google" button visible
- [ ] Google OAuth initiates
- [ ] Google consent screen appears
- [ ] User can approve permissions
- [ ] Redirects back to Vortis
- [ ] Lands on `/dashboard`
- [ ] User data populated (name, email, image)
- [ ] No console errors
- [ ] Complete flow < 30 seconds

### Sign-In (Existing User)
- [ ] Sign-in page loads (`/sign-in`)
- [ ] Google OAuth button visible
- [ ] OAuth flow initiates
- [ ] Existing account recognized
- [ ] May skip consent screen
- [ ] Redirects to `/dashboard`
- [ ] User data loads correctly
- [ ] Session restored
- [ ] Complete flow < 10 seconds

### Sign-Out
- [ ] Sign-out button works
- [ ] Session cleared
- [ ] Cookies removed
- [ ] Redirects to homepage or sign-in
- [ ] Cannot access `/dashboard` after sign-out
- [ ] Can sign back in successfully

---

## 4. Protected Routes

### Middleware Configuration
- [ ] `middleware.ts` file exists
- [ ] `clerkMiddleware` imported and used
- [ ] Public routes defined (`/`, `/pricing`, `/sign-in`, `/sign-up`)
- [ ] Protected routes require auth (`/dashboard`, etc.)
- [ ] Webhook routes public (`/api/webhooks/*`)
- [ ] Matcher pattern configured correctly

### Route Protection
- [ ] Unauthenticated users redirected from `/dashboard`
- [ ] Redirect goes to `/sign-in`
- [ ] After sign-in, returns to intended page
- [ ] API routes check authentication
- [ ] Return 401 for unauthenticated requests
- [ ] No sensitive data in HTML for unauthenticated users

---

## 5. Webhooks

### Configuration
- [ ] Webhook endpoint created in Clerk dashboard
- [ ] Endpoint URL correct (local: via CLI/ngrok, prod: https)
- [ ] Events selected: `user.created`, `user.updated`, `user.deleted`
- [ ] Webhook secret copied to `.env.local`
- [ ] Webhook shows as "Active" in Clerk dashboard

### Webhook Handler
- [ ] Route file exists: `/app/api/webhooks/clerk/route.ts`
- [ ] Imports `svix` for signature verification
- [ ] Verifies webhook signature
- [ ] Handles `user.created` event
- [ ] Handles `user.updated` event
- [ ] Handles `user.deleted` event
- [ ] Returns 200 on success
- [ ] Returns 400 on invalid signature
- [ ] Logs errors appropriately

### Webhook Testing
- [ ] Test event sent from Clerk dashboard
- [ ] Webhook received locally (via CLI or tunnel)
- [ ] Signature verification passes
- [ ] Events processed correctly
- [ ] Profile created/updated/deleted in database
- [ ] No errors in webhook processing
- [ ] Handles concurrent webhooks
- [ ] Idempotent (no duplicates on retry)

---

## 6. Database Sync

### Supabase Configuration
- [ ] Supabase project created
- [ ] `profiles` table exists
- [ ] Required columns: `id`, `clerk_id`, `email`, `full_name`, `avatar_url`
- [ ] Timestamps: `created_at`, `updated_at`, `deleted_at`
- [ ] Unique constraint on `clerk_id`
- [ ] Index on `clerk_id`
- [ ] RLS policies configured (or disabled for service role)

### Profile Creation
- [ ] New sign-up creates profile in Supabase
- [ ] Profile created within 3 seconds
- [ ] All fields populated correctly
- [ ] `clerk_id` matches Clerk user ID
- [ ] Email matches Clerk email
- [ ] Name matches Clerk name
- [ ] Avatar URL matches Clerk image
- [ ] No duplicate profiles created

### Profile Updates
- [ ] Name changes in Clerk sync to Supabase
- [ ] Email changes sync
- [ ] Image changes sync
- [ ] `updated_at` timestamp refreshed
- [ ] No duplicate rows created
- [ ] Updates complete within 3 seconds

### Profile Deletion
- [ ] User deletion triggers webhook
- [ ] Profile deleted or marked deleted
- [ ] Related data cleaned up
- [ ] No orphaned records

---

## 7. Integration Testing

### Clerk + Dashboard
- [ ] Dashboard loads for authenticated users
- [ ] User name displays
- [ ] Profile image shows
- [ ] Email displayed
- [ ] Navigation works
- [ ] All pages accessible

### Clerk + Stock Analysis
- [ ] Stock analysis requires authentication
- [ ] Unauthenticated requests blocked (401)
- [ ] User ID logged with analysis
- [ ] Rate limiting per user tier
- [ ] Analysis history tied to user

### Clerk + Stripe
- [ ] Checkout includes Clerk user ID
- [ ] Email pre-filled from Clerk
- [ ] Payment succeeds
- [ ] Subscription created in database
- [ ] Subscription linked to correct user
- [ ] Dashboard shows subscription status
- [ ] Can manage subscription

---

## 8. Security

### Authentication Security
- [ ] Invalid tokens rejected
- [ ] Expired sessions detected
- [ ] Session hijacking prevented
- [ ] CSRF protection enabled
- [ ] Secure cookie flags set (HttpOnly, Secure, SameSite)

### Webhook Security
- [ ] Webhook signature verification enforced
- [ ] Invalid signatures rejected (400)
- [ ] Tampered payloads blocked
- [ ] Replay attacks prevented
- [ ] Webhook secret not exposed

### Data Security
- [ ] XSS attacks prevented (input sanitized)
- [ ] SQL injection prevented (parameterized queries)
- [ ] Secret keys not in client code
- [ ] Publishable key safe to expose (by design)
- [ ] No sensitive data in error messages

### Privacy & Compliance
- [ ] Only necessary data collected
- [ ] User can delete account
- [ ] Data deletion complete
- [ ] Privacy policy linked
- [ ] Terms of service linked

---

## 9. Performance

### Page Load Times
- [ ] Homepage < 2.5s (LCP)
- [ ] Dashboard < 2.0s (authenticated)
- [ ] Sign-in page < 1.5s
- [ ] No layout shifts (CLS < 0.1)
- [ ] TTFB < 200ms

### Auth Performance
- [ ] Middleware auth check < 100ms
- [ ] Session creation < 500ms
- [ ] Sign-in flow < 3s (excluding user interaction)
- [ ] Token refresh automatic and seamless

### Webhook Performance
- [ ] Webhook processing < 300ms
- [ ] Signature verification < 50ms
- [ ] Database insert < 200ms
- [ ] Handles concurrent webhooks without errors

### Bundle Size
- [ ] Clerk SDK < 50 kB gzipped
- [ ] Homepage bundle < 100 kB
- [ ] Dashboard bundle < 150 kB
- [ ] No unnecessary Clerk code in bundle

---

## 10. Cross-Browser/Device Testing

### Desktop Browsers
- [ ] Chrome: Sign-up, sign-in, sign-out
- [ ] Firefox: Sign-up, sign-in, sign-out
- [ ] Safari: Sign-up, sign-in, sign-out
- [ ] Edge: Sign-up, sign-in, sign-out

### Mobile Devices
- [ ] iPhone Safari: Complete flow
- [ ] Android Chrome: Complete flow
- [ ] iPad Safari: Complete flow
- [ ] Mobile layout responsive
- [ ] Touch targets adequate size

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Semantic HTML used

---

## 11. Error Handling

### User Errors
- [ ] OAuth cancellation handled gracefully
- [ ] Network errors shown clearly
- [ ] Loading states displayed
- [ ] Error messages helpful
- [ ] Can retry failed actions

### System Errors
- [ ] Invalid API responses handled
- [ ] Database errors caught
- [ ] Webhook failures logged
- [ ] Clerk service downtime handled
- [ ] Fallback UI shown

---

## 12. Build & Deployment

### Build
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No build warnings
- [ ] All routes compiled

### Development
- [ ] Hot reload works
- [ ] Clerk CLI forwards webhooks (if used)
- [ ] Console logs helpful
- [ ] Error messages clear

### Production
- [ ] Environment variables set
- [ ] Using production Clerk keys
- [ ] HTTPS enforced
- [ ] Domain configured in Clerk
- [ ] Webhooks reach production server
- [ ] Monitoring enabled
- [ ] Error tracking enabled (Sentry, etc.)

---

## 13. Documentation

### Code Documentation
- [ ] Webhook handler commented
- [ ] Middleware explained
- [ ] API routes documented
- [ ] Complex logic explained

### User Documentation
- [ ] Setup guide written
- [ ] Environment variables documented
- [ ] Deployment steps documented
- [ ] Troubleshooting guide available

---

## 14. Testing Documentation

### Test Coverage
- [ ] Setup testing completed (CLERK_SETUP_TESTING.md)
- [ ] Auth flow testing completed (CLERK_AUTH_TESTING.md)
- [ ] Webhook testing completed (CLERK_WEBHOOK_TESTING.md)
- [ ] Database sync testing completed (CLERK_DB_SYNC_TESTING.md)
- [ ] Integration testing completed (CLERK_INTEGRATION_TESTING.md)
- [ ] Performance testing completed (CLERK_PERFORMANCE_TESTING.md)
- [ ] Security testing completed (CLERK_SECURITY_TESTING.md)
- [ ] Manual testing completed (CLERK_MANUAL_TESTING.md)

### Test Results
- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No critical issues
- [ ] Minor issues documented
- [ ] Environment testing matrix completed

---

## 15. Pre-Production Checklist

### Final Verification
- [ ] All above sections completed
- [ ] Staging environment tested
- [ ] Smoke tests on production
- [ ] Rollback plan documented
- [ ] Team trained on new auth system
- [ ] Support documentation ready

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Webhook delivery monitored
- [ ] User analytics enabled
- [ ] Alerts configured for critical errors

### Backup Plan
- [ ] Database backups configured
- [ ] Rollback procedure documented
- [ ] Previous version available
- [ ] Emergency contacts listed

---

## 16. Sign-Off

### Technical Lead
**Name:** _______________________
**Date:** _______________________
**Signature:** _______________________

**Certification:**
I certify that:
- [ ] All tests have been completed
- [ ] All critical issues resolved
- [ ] System is ready for production
- [ ] Documentation is complete
- [ ] Team is prepared for launch

---

### QA Lead
**Name:** _______________________
**Date:** _______________________
**Signature:** _______________________

**Certification:**
I certify that:
- [ ] All test cases executed
- [ ] No critical bugs remain
- [ ] Performance meets requirements
- [ ] Security audit passed
- [ ] Ready for production deployment

---

### Product Owner
**Name:** _______________________
**Date:** _______________________
**Signature:** _______________________

**Certification:**
I certify that:
- [ ] Features meet requirements
- [ ] User experience is satisfactory
- [ ] Business goals achieved
- [ ] Risks acceptable
- [ ] Approved for deployment

---

## 17. Post-Deployment Verification

**After Production Deployment:**

### Immediate Checks (First Hour)
- [ ] Sign-up flow works in production
- [ ] Sign-in flow works in production
- [ ] Dashboard loads correctly
- [ ] Webhooks delivered successfully
- [ ] No errors in monitoring
- [ ] Performance meets targets

### First 24 Hours
- [ ] Monitor error rates
- [ ] Check webhook delivery success rate
- [ ] Verify database sync working
- [ ] Review user feedback
- [ ] Check analytics for issues
- [ ] No rollback needed

### First Week
- [ ] Performance stable
- [ ] Error rate acceptable
- [ ] User satisfaction good
- [ ] No security incidents
- [ ] System scaling well

---

## 18. Related Documentation

**Testing Guides:**
- [Clerk Setup Testing](/Users/tannerosterkamp/vortis/docs/CLERK_SETUP_TESTING.md)
- [Authentication Flow Testing](/Users/tannerosterkamp/vortis/docs/CLERK_AUTH_TESTING.md)
- [Webhook Testing](/Users/tannerosterkamp/vortis/docs/CLERK_WEBHOOK_TESTING.md)
- [Database Sync Testing](/Users/tannerosterkamp/vortis/docs/CLERK_DB_SYNC_TESTING.md)
- [Integration Testing](/Users/tannerosterkamp/vortis/docs/CLERK_INTEGRATION_TESTING.md)
- [Performance Testing](/Users/tannerosterkamp/vortis/docs/CLERK_PERFORMANCE_TESTING.md)
- [Security Testing](/Users/tannerosterkamp/vortis/docs/CLERK_SECURITY_TESTING.md)
- [Manual Testing Guide](/Users/tannerosterkamp/vortis/docs/CLERK_MANUAL_TESTING.md)

**Support Documentation:**
- [Troubleshooting Guide](/Users/tannerosterkamp/vortis/docs/CLERK_TROUBLESHOOTING.md)
- [Environment Testing Matrix](/Users/tannerosterkamp/vortis/docs/CLERK_ENV_TESTING.md)

**Test Files:**
- [Auth Tests](/Users/tannerosterkamp/vortis/tests/clerk/auth.test.ts)
- [Webhook Tests](/Users/tannerosterkamp/vortis/tests/clerk/webhook.test.ts)
- [Integration Tests](/Users/tannerosterkamp/vortis/tests/clerk/integration.test.ts)

---

## Notes

Use this checklist before EVERY deployment:
- [ ] Development to Staging
- [ ] Staging to Production
- [ ] Hotfixes to Production
- [ ] After major updates

Keep this checklist updated as system evolves.

**Last Updated:** 2025-10-09
**Version:** 1.0
**Maintained By:** Vortis Engineering Team
