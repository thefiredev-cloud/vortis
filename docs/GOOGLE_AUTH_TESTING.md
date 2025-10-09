# Google OAuth Authentication Testing Guide

Comprehensive testing checklist for Vortis Google OAuth implementation.

## Pre-Testing Setup

### Required Configuration

Ensure these are completed before testing:

- [ ] Google OAuth client created in Google Cloud Console
- [ ] OAuth redirect URIs configured in Google Console
- [ ] Google provider enabled in Supabase Dashboard
- [ ] Client ID and Secret added to Supabase
- [ ] Supabase redirect URLs configured
- [ ] Environment variables set in `.env.local`
- [ ] Development server can be started without errors

### Verify Configuration

```bash
# 1. Check environment variables are loaded
npm run dev

# 2. In browser console on http://localhost:3000
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

# Both should return valid values (not undefined)
```

---

## Local Development Testing

### Test 1: Login Page Load

**URL:** `http://localhost:3000/auth/login`

**Expected:**
- [ ] Page loads without errors
- [ ] Vortis logo displays correctly
- [ ] "Sign in with Google" button is visible
- [ ] Google logo appears on button
- [ ] No console errors
- [ ] Background animations work
- [ ] Page is responsive on mobile

**Failure Indicators:**
- Button doesn't render
- Console shows missing component errors
- White screen or error page

---

### Test 2: Signup Page Load

**URL:** `http://localhost:3000/auth/signup`

**Expected:**
- [ ] Page loads successfully
- [ ] Benefits list displays (3 items with icons)
- [ ] "Sign up with Google" button visible
- [ ] Terms and Privacy links present
- [ ] "Already have an account?" link works
- [ ] Responsive design works

---

### Test 3: First-Time Sign-In Flow

**Steps:**
1. Navigate to `/auth/login`
2. Click "Sign in with Google"
3. Select a Google account you haven't used before
4. Grant requested permissions
5. Wait for redirect

**Expected:**
- [ ] Redirected to Google consent screen
- [ ] App name shows "Vortis" (or your configured name)
- [ ] Permissions request shows email and profile access
- [ ] After approval, redirected back to localhost
- [ ] URL contains `/auth/callback` briefly
- [ ] Final redirect to `/dashboard`
- [ ] User is logged in (can access dashboard)
- [ ] No error messages
- [ ] Session persists on page refresh

**Check Supabase:**
- [ ] New user created in Authentication > Users
- [ ] User has Google provider linked
- [ ] User metadata includes email and name

**Failure Indicators:**
- Stuck on callback page
- Redirected back to login with error
- Console shows OAuth errors
- User not created in Supabase

---

### Test 4: Returning User Sign-In

**Steps:**
1. Sign out if logged in
2. Navigate to `/auth/login`
3. Click "Sign in with Google"
4. Select the same Google account as before
5. (May skip consent if already granted)

**Expected:**
- [ ] Quick redirect (no consent screen if already approved)
- [ ] Immediate login
- [ ] Redirect to `/dashboard`
- [ ] User session active
- [ ] No duplicate users in Supabase

---

### Test 5: User Cancels Authentication

**Steps:**
1. Navigate to `/auth/login`
2. Click "Sign in with Google"
3. On Google consent screen, click "Cancel" or back button

**Expected:**
- [ ] Redirected back to `/auth/login`
- [ ] Error message displayed: "Access Denied" or similar
- [ ] User can try again
- [ ] No partial user creation in Supabase

---

### Test 6: Multiple Google Accounts

**Steps:**
1. Sign in with Google Account A
2. Sign out
3. Sign in with Google Account B
4. Sign out
5. Sign in with Google Account A again

**Expected:**
- [ ] Each account creates separate user in Supabase
- [ ] Switching accounts works seamlessly
- [ ] Correct user session loaded each time
- [ ] No session conflicts

---

### Test 7: Protected Route Access

**Test A: Unauthenticated Access**

**Steps:**
1. Ensure logged out (clear cookies)
2. Navigate to `http://localhost:3000/dashboard`

**Expected:**
- [ ] Automatically redirected to `/auth/login`
- [ ] Cannot access dashboard without auth

**Test B: Authenticated Access**

**Steps:**
1. Sign in with Google
2. Try accessing `/dashboard` directly

**Expected:**
- [ ] Dashboard loads successfully
- [ ] User data displayed
- [ ] No redirect to login

---

### Test 8: Auth Route Redirect When Logged In

**Steps:**
1. Sign in with Google
2. Try navigating to `/auth/login`
3. Try navigating to `/auth/signup`

**Expected:**
- [ ] Both routes redirect to `/dashboard`
- [ ] Cannot access login/signup when authenticated

---

### Test 9: Session Persistence

**Steps:**
1. Sign in with Google
2. Refresh the page (F5)
3. Close browser tab and reopen
4. Restart browser completely

**Expected:**
- [ ] Page refresh: User stays logged in
- [ ] Tab close/reopen: Session persists
- [ ] Browser restart: Session may persist (depends on browser settings)

---

### Test 10: Sign Out

**Steps:**
1. Sign in with Google
2. Navigate to dashboard
3. Click sign out button (if implemented)
4. Try accessing protected routes

**Expected:**
- [ ] User logged out successfully
- [ ] Redirected to home or login page
- [ ] Session cleared
- [ ] Cannot access protected routes
- [ ] Cookies cleared from browser

---

### Test 11: Forgot Password Page

**Steps:**
1. Navigate to `/auth/forgot-password`

**Expected:**
- [ ] Page loads with informational message
- [ ] Explains Google OAuth is used
- [ ] Shows "Go to login" button
- [ ] Auto-redirects to login after 5 seconds
- [ ] Links to Google Account Recovery

---

### Test 12: Error Handling

**Test A: Network Error**

**Steps:**
1. Disconnect internet
2. Try signing in with Google

**Expected:**
- [ ] Error message displayed
- [ ] User-friendly explanation
- [ ] Option to retry

**Test B: Supabase Connection Error**

**Steps:**
1. Temporarily use invalid Supabase URL in env
2. Try signing in

**Expected:**
- [ ] Graceful error handling
- [ ] Error message displayed
- [ ] No app crash

---

### Test 13: Responsive Design

**Devices to Test:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (414x896)

**Elements to Check:**
- [ ] Login/signup pages fully visible
- [ ] Buttons are touch-friendly (min 48px)
- [ ] Text is readable
- [ ] No horizontal scrolling
- [ ] Images/logos scaled properly

---

### Test 14: Browser Compatibility

**Browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Test:**
- [ ] Google OAuth flow works
- [ ] Redirects work correctly
- [ ] Cookies persist
- [ ] UI renders correctly

---

### Test 15: Accessibility

**Tools:**
- Chrome Lighthouse
- axe DevTools

**Checklist:**
- [ ] All buttons have accessible labels
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Focus indicators visible
- [ ] Error messages are announced

---

### Test 16: Performance

**Steps:**
1. Run Lighthouse audit on login page
2. Check network tab during OAuth flow

**Expected:**
- [ ] Lighthouse Performance score > 90
- [ ] Page load < 2 seconds
- [ ] OAuth redirect < 3 seconds
- [ ] No unnecessary network requests
- [ ] Images optimized

---

## Production Testing

### Pre-Deployment Checklist

- [ ] Production Google OAuth client created
- [ ] Production redirect URIs configured
- [ ] Production Supabase project configured
- [ ] Environment variables set in hosting platform
- [ ] HTTPS enabled (required for OAuth)
- [ ] Domain verified in Google Console
- [ ] OAuth consent screen verified (if public)

---

### Test 17: Production Sign-In

**URL:** `https://your-production-domain.com/auth/login`

**Steps:**
1. Visit production login page
2. Sign in with Google
3. Verify full flow works

**Expected:**
- [ ] HTTPS connection (padlock in browser)
- [ ] OAuth flow completes successfully
- [ ] Redirects to production dashboard
- [ ] Session persists
- [ ] No mixed content warnings

---

### Test 18: Production Error Scenarios

**Test A: Invalid Redirect URI**

**Setup:**
1. Temporarily misconfigure redirect URI in Google Console
2. Try signing in

**Expected:**
- [ ] Clear error message
- [ ] User can report issue
- [ ] No server crash

**Test B: Rate Limiting**

**Steps:**
1. Attempt multiple rapid sign-ins

**Expected:**
- [ ] Rate limiting applies if configured
- [ ] User sees appropriate message
- [ ] Service remains available

---

## Security Testing

### Test 19: Session Security

**Checklist:**
- [ ] Session cookies are HTTP-only
- [ ] Cookies are Secure (HTTPS only)
- [ ] SameSite attribute set
- [ ] Session timeout configured
- [ ] CSRF protection enabled (Supabase handles this)

**Verify:**
```javascript
// In browser DevTools > Application > Cookies
// Check sb-*-auth-token cookies have:
- HttpOnly: true
- Secure: true
- SameSite: Lax or Strict
```

---

### Test 20: Authorization

**Steps:**
1. Sign in as User A
2. Copy session token
3. Sign out
4. Manually inject User A's token
5. Try accessing User B's data (if multi-tenant)

**Expected:**
- [ ] Each user only accesses their own data
- [ ] No cross-user data leakage
- [ ] Supabase RLS policies enforced

---

## Monitoring & Analytics

### Test 21: Error Tracking

**Setup:**
1. Configure error tracking (Sentry, etc.)
2. Trigger various errors
3. Check if errors are logged

**Expected:**
- [ ] Failed authentications logged
- [ ] OAuth errors captured
- [ ] User context included
- [ ] Stack traces available

---

### Test 22: Analytics

**Events to Track:**
- [ ] Sign-in initiated
- [ ] Sign-in successful
- [ ] Sign-in failed
- [ ] Sign-up initiated
- [ ] Sign-up completed
- [ ] User cancels OAuth

---

## Edge Cases

### Test 23: Concurrent Sessions

**Steps:**
1. Sign in on Browser A
2. Sign in on Browser B (same account)
3. Sign out on Browser A
4. Check Browser B

**Expected:**
- [ ] Multiple sessions allowed (typical for OAuth)
- [ ] Each browser maintains independent session
- [ ] Sign out on one doesn't affect others (unless configured)

---

### Test 24: Account Deletion

**Steps:**
1. Delete user from Supabase Dashboard
2. Try signing in with that Google account again

**Expected:**
- [ ] New user account created
- [ ] Previous data not accessible
- [ ] No errors during recreation

---

### Test 25: Google Account Changes

**Scenario A: User Changes Email**

**Expected:**
- [ ] User can still sign in
- [ ] Google account ID remains same
- [ ] Email updated in Supabase

**Scenario B: User Revokes App Access**

**Steps:**
1. Go to Google Account > Security > Third-party apps
2. Revoke Vortis access
3. Try signing in to Vortis

**Expected:**
- [ ] User prompted to grant access again
- [ ] Can re-authorize
- [ ] Account reconnected

---

## Rollback Plan

If issues are found in production:

### Immediate Actions

1. **Disable Google OAuth (Emergency):**
   - Remove Google Sign-In button
   - Show maintenance message
   - Preserve existing sessions

2. **Rollback to Previous Version:**
   ```bash
   # Revert to last stable commit
   git revert HEAD
   git push origin main

   # Or roll back deployment
   # (Railway, Vercel, etc.)
   ```

3. **Communicate with Users:**
   - Post status update
   - Provide ETA for fix
   - Offer alternative contact method

---

## Post-Launch Monitoring

### First 24 Hours

**Metrics to Watch:**
- [ ] Authentication success rate (target: >98%)
- [ ] Average sign-in time (target: <3 seconds)
- [ ] Error rate (target: <2%)
- [ ] Failed OAuth attempts
- [ ] Support tickets related to auth

**Dashboards:**
- Supabase Authentication logs
- Google OAuth metrics (Google Cloud Console)
- Application error tracking
- User analytics

---

## Troubleshooting Quick Reference

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Redirect URI mismatch | Misconfigured Google Console | Verify exact URI match |
| User stuck on callback | Callback route error | Check server logs |
| No consent screen | Already authorized | Revoke access and retry |
| Session lost on refresh | Cookie settings | Verify HTTP-only, Secure |
| Mobile issues | Responsive design bug | Test on actual devices |
| Slow OAuth flow | Network latency | Check Supabase region |

---

## Success Criteria

Before marking implementation complete:

- [ ] All 25 tests passing
- [ ] Zero critical issues
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Team trained on troubleshooting
- [ ] Monitoring configured
- [ ] Rollback plan tested

---

## Testing Schedule

**Development:**
- Run Tests 1-16 before each commit
- Full suite before PR

**Staging:**
- Complete all tests (1-25)
- Load testing if high traffic expected
- Security scan

**Production:**
- Tests 17-18 immediately after deploy
- Tests 19-25 within first week
- Continuous monitoring

---

## Resources

- **Supabase Logs:** `https://supabase.com/dashboard/project/[your-project-id]/logs`
- **Google OAuth Metrics:** Google Cloud Console > APIs & Services > Credentials
- **Test Google Account:** Create dedicated test accounts for QA
- **Browser DevTools:** Network tab for debugging OAuth flow
- **Supabase CLI:** For local debugging

---

Last Updated: 2025-10-09
Version: 1.0.0
Maintained by: Vortis Development Team
