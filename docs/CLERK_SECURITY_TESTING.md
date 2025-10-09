# Clerk Security Testing

Comprehensive security testing guide for Clerk authentication implementation.

## Overview

Security testing ensures protected routes are truly protected, sessions are secure, and user data is safeguarded against common vulnerabilities.

---

## 1. Protected Route Security

### Test 1.1: Unauthenticated Access Blocked

**Objective:** Verify unauthenticated users cannot access protected routes

**Test Routes:**
- `/dashboard`
- `/dashboard/settings`
- `/dashboard/subscription`
- `/api/user/*`

**Test Method 1: Browser (Incognito)**
```bash
# Open incognito window
# Navigate to: http://localhost:3000/dashboard
```

**Expected Results:**
- ✓ Immediate redirect to `/sign-in`
- ✓ No dashboard content visible
- ✓ No data leaked in HTML
- ✓ No API responses returned

**Test Method 2: cURL**
```bash
# Test without auth
curl -v http://localhost:3000/dashboard

# Expected:
# HTTP/1.1 307 Temporary Redirect
# Location: /sign-in
```

**Test API Routes:**
```bash
# Test protected API
curl -v http://localhost:3000/api/user/profile

# Expected:
# HTTP/1.1 401 Unauthorized
# Content: {"error":"Unauthorized"}
```

**Checklist:**
- [ ] All protected routes block unauthenticated access
- [ ] Redirects work correctly
- [ ] No sensitive data in HTML
- [ ] API returns 401, not 500
- [ ] Error messages don't leak info

---

### Test 1.2: Invalid Token Rejected

**Objective:** Verify invalid/expired tokens are rejected

**Test with Invalid Token:**
```bash
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer invalid_token_here"

# Expected: 401 Unauthorized
```

**Test with Expired Session:**
1. Sign in
2. Manually expire session (Clerk dashboard)
3. Try to access `/dashboard`
4. Expected: Redirect to sign-in

**Checklist:**
- [ ] Invalid tokens rejected
- [ ] Expired sessions detected
- [ ] No access with tampered tokens
- [ ] Clear error messages

---

## 2. Webhook Signature Validation

### Test 2.1: Valid Signature Accepted

**Objective:** Verify legitimate Clerk webhooks are accepted

**Steps:**
1. Trigger webhook from Clerk dashboard
2. Webhook handler receives request
3. Signature verification passes
4. Event processed

**Expected:**
- ✓ Returns 200 OK
- ✓ Event processed successfully

---

### Test 2.2: Invalid Signature Rejected

**Objective:** Verify tampered webhooks are rejected

**Test Invalid Signature:**
```bash
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_123" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: v1,invalid_signature_here" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "user_malicious",
      "email_addresses": [{"email_address": "hacker@evil.com"}]
    }
  }'

# Expected: 400 Bad Request
```

**Verify:**
- No profile created in database
- Error logged
- Request rejected immediately

**Checklist:**
- [ ] Invalid signatures rejected
- [ ] Tampered payloads blocked
- [ ] No database writes on failed verification
- [ ] Errors logged with details
- [ ] Returns appropriate status code

---

### Test 2.3: Replay Attack Prevention

**Objective:** Verify old webhooks can't be replayed

**Test:**
1. Capture valid webhook request (timestamp + signature)
2. Wait 10 minutes
3. Replay exact same request
4. Expected: Rejected (timestamp too old)

**Svix includes timestamp in signature:**
- Old timestamps rejected
- Prevents replay attacks

---

## 3. XSS Protection in User Data

### Test 3.1: Script Injection in User Names

**Objective:** Verify user input is sanitized

**Test:**
1. Create user with malicious name:
   - First name: `<script>alert('XSS')</script>`
   - Last name: `<img src=x onerror=alert('XSS')>`
2. Webhook syncs to Supabase
3. View profile on dashboard

**Expected Results:**
- ✓ Scripts not executed
- ✓ HTML escaped or sanitized
- ✓ Name displays as plain text
- ✓ No JavaScript execution

**Verify HTML Output:**
```html
<!-- Should be escaped -->
<div class="user-name">
  &lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;
</div>

<!-- NOT this -->
<div class="user-name">
  <script>alert('XSS')</script>
</div>
```

**React Automatic Escaping:**
- React escapes by default
- Use `dangerouslySetInnerHTML` carefully (avoid!)

**Checklist:**
- [ ] User names escaped in UI
- [ ] No script execution
- [ ] HTML tags displayed as text
- [ ] Image URLs validated
- [ ] No `dangerouslySetInnerHTML` used

---

### Test 3.2: SQL Injection Prevention

**Objective:** Verify parameterized queries prevent SQL injection

**Test:**
1. Create user with email: `'; DROP TABLE profiles; --`
2. Webhook syncs data
3. Verify database unaffected

**Expected:**
- ✓ Email stored literally (as string)
- ✓ No SQL executed
- ✓ Supabase client uses parameterized queries

**Supabase Client Protection:**
```typescript
// Safe - parameterized
await supabase
  .from('profiles')
  .insert({ email: userEmail }); // userEmail is sanitized

// UNSAFE - don't do this
await supabase.rpc('raw_sql', {
  query: `INSERT INTO profiles (email) VALUES ('${userEmail}')`
}); // Vulnerable to injection!
```

**Checklist:**
- [ ] All queries parameterized
- [ ] No string concatenation in queries
- [ ] Special characters handled correctly
- [ ] No raw SQL execution with user input

---

## 4. CSRF Protection

### Test 4.1: Clerk Session Cookies

**Objective:** Verify CSRF protection on Clerk session cookies

**Check Cookie Attributes:**
```javascript
// In browser DevTools > Application > Cookies
// Find __session cookie

// Should have:
// - HttpOnly: true (not accessible via JavaScript)
// - Secure: true (HTTPS only in production)
// - SameSite: Lax or Strict
```

**Expected Cookie:**
```
Name: __session
Value: [encrypted token]
Domain: yourdomain.com
HttpOnly: ✓
Secure: ✓
SameSite: Lax
```

**Test CSRF Attack:**
```html
<!-- Malicious site tries to make authenticated request -->
<form action="https://yourdomain.com/api/user/delete" method="POST">
  <input type="hidden" name="id" value="user_123" />
</form>
<script>document.forms[0].submit();</script>
```

**Expected:**
- ✓ Request blocked (SameSite prevents cookie from being sent)
- ✓ Clerk verifies origin
- ✓ No action taken

**Checklist:**
- [ ] Cookies have HttpOnly flag
- [ ] Cookies have Secure flag (production)
- [ ] SameSite attribute set
- [ ] Cross-origin requests blocked
- [ ] Origin validation works

---

## 5. Session Hijacking Prevention

### Test 5.1: Session Fixation Attack

**Objective:** Verify sessions cannot be fixed by attacker

**Attack Scenario:**
1. Attacker creates session
2. Tricks victim into using that session
3. Attacker gains access to victim's account

**Clerk Protection:**
- New session created on sign-in
- Old sessions invalidated
- Session IDs rotated

**Test:**
1. Get session ID before sign-in
2. Sign in
3. Verify session ID changed
4. Old session no longer valid

**Checklist:**
- [ ] Session ID changes on sign-in
- [ ] Old sessions invalidated
- [ ] Cannot reuse pre-sign-in session
- [ ] Session rotation works

---

### Test 5.2: Concurrent Session Handling

**Objective:** Verify multiple sessions handled securely

**Test:**
1. Sign in on Browser A
2. Sign in on Browser B (same user)
3. Both sessions should be independent
4. Sign out on Browser A
5. Browser B should remain signed in

**Expected:**
- ✓ Multiple sessions allowed (by default)
- ✓ Sessions independent
- ✓ Sign-out affects only current session

**Optional: Single Session Mode:**
- Configure Clerk to allow only one session
- Signing in elsewhere signs out previous session

---

## 6. Token Security

### Test 6.1: Token Encryption

**Objective:** Verify tokens are encrypted

**Check Session Token:**
```javascript
// In browser console
document.cookie.split(';').find(c => c.includes('__session'))

// Token should be encrypted/signed
// Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// NOT plaintext user data
```

**Expected:**
- ✓ Token is JWT format
- ✓ Payload is encrypted/signed
- ✓ Cannot decode to get sensitive info
- ✓ Tampering detected

---

### Test 6.2: Token Expiration

**Objective:** Verify tokens expire appropriately

**Check Token Expiration:**
1. Sign in
2. Note session start time
3. Wait for token expiry (check Clerk settings)
4. Try to make authenticated request

**Expected:**
- ✓ Token expires after configured time
- ✓ Refresh token used to get new token
- ✓ Expired tokens rejected
- ✓ User prompted to re-authenticate if needed

**Clerk Token Refresh:**
- Access tokens: Short-lived (minutes)
- Refresh tokens: Long-lived (days/weeks)
- Automatic refresh before expiry

---

## 7. API Key Security

### Test 7.1: Publishable Key Exposure

**Objective:** Verify publishable key is safe to expose

**Clerk Keys:**
- **Publishable Key (`pk_test_`)**: Safe to expose (client-side)
- **Secret Key (`sk_test_`)**: NEVER expose (server-side only)

**Test:**
```bash
# Check public JavaScript bundles
curl http://localhost:3000/_next/static/chunks/main.js | grep -o "pk_test_[a-zA-Z0-9]*"

# Expected: pk_test_ key visible (OK)

# Check for secret key (SHOULD NOT EXIST)
curl http://localhost:3000/_next/static/chunks/main.js | grep -o "sk_test_[a-zA-Z0-9]*"

# Expected: No results (secret key not exposed)
```

**Verification:**
```bash
# Check .env.local is in .gitignore
grep -q ".env.local" .gitignore && echo "✓ Protected" || echo "✗ Exposed"
```

**Checklist:**
- [ ] Publishable key in client code (OK)
- [ ] Secret key NOT in client code
- [ ] Secret key NOT in git
- [ ] `.env.local` in `.gitignore`
- [ ] Secret key only in server-side code

---

### Test 7.2: Webhook Secret Security

**Objective:** Verify webhook secret is protected

**Check:**
```bash
# Webhook secret should NEVER be in client code
curl http://localhost:3000/_next/static/chunks/main.js | grep "whsec_"

# Expected: No results
```

**Verify Server-Side Only:**
```typescript
// ✓ GOOD - server-side only
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  // This code runs server-side only
}

// ✗ BAD - don't do this
'use client';
const secret = process.env.CLERK_WEBHOOK_SECRET; // Exposed to client!
```

**Checklist:**
- [ ] Webhook secret not in client code
- [ ] Webhook secret not in git
- [ ] Only used in server-side code
- [ ] Environment variable properly configured

---

## 8. Data Privacy Compliance

### Test 8.1: Data Minimization

**Objective:** Verify only necessary data is collected

**Review User Data Collection:**
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles';
```

**Expected:**
- Only essential fields: id, clerk_id, email, name, image
- No sensitive data (SSN, financial info, etc.)
- No excessive tracking

**Checklist:**
- [ ] Only necessary data collected
- [ ] No sensitive data stored
- [ ] Data retention policy defined
- [ ] User can request data deletion

---

### Test 8.2: Right to Deletion

**Objective:** Verify user deletion removes all data

**Test:**
1. Create test user
2. User creates subscription, performs analyses
3. Delete user in Clerk
4. Webhook processes deletion
5. Verify all user data removed

**SQL Verification:**
```sql
-- Profile should be deleted or marked deleted
SELECT * FROM profiles WHERE clerk_id = 'user_deleted123';

-- Related data should be cleaned up
SELECT * FROM subscriptions WHERE clerk_id = 'user_deleted123';
SELECT * FROM stock_analyses WHERE clerk_id = 'user_deleted123';
```

**Expected:**
- ✓ Profile deleted/anonymized
- ✓ Subscriptions cancelled
- ✓ Personal data removed
- ✓ Compliance with GDPR/CCPA

---

## 9. Rate Limiting and DoS Protection

### Test 9.1: Sign-In Rate Limiting

**Objective:** Verify rate limiting on sign-in attempts

**Test:**
```bash
# Attempt multiple sign-ins rapidly
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -d "email=test@example.com&password=wrong"
done
```

**Expected:**
- ✓ After X failed attempts, temporarily blocked
- ✓ Error message: "Too many attempts, try again later"
- ✓ Legitimate users not affected

**Clerk Built-In Protection:**
- Automatic rate limiting
- Bot detection
- CAPTCHA for suspicious activity

---

### Test 9.2: Webhook DoS Protection

**Objective:** Verify webhook endpoint can't be flooded

**Test:**
```bash
# Send many invalid webhooks
for i in {1..100}; do
  (curl -X POST http://localhost:3000/api/webhooks/clerk \
    -d '{"invalid":"data"}' &)
done
wait
```

**Expected:**
- ✓ Invalid requests rejected quickly
- ✓ No resource exhaustion
- ✓ Server remains responsive
- ✓ Rate limiting applied

---

## 10. Environment-Specific Security

### Test 10.1: Production vs Development Keys

**Objective:** Verify correct keys used per environment

**Check Development:**
```bash
# .env.local should have test keys
grep "pk_test_" .env.local && echo "✓ Test keys" || echo "✗ Wrong keys"
```

**Check Production:**
```bash
# Production environment should have live keys
# Via hosting platform (Vercel, Railway, etc.)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

**Checklist:**
- [ ] Development uses test keys
- [ ] Production uses live keys
- [ ] Keys never mixed
- [ ] Clear separation

---

### Test 10.2: HTTPS Enforcement

**Objective:** Verify HTTPS enforced in production

**Test Production:**
```bash
# Try HTTP (should redirect to HTTPS)
curl -I http://yourdomain.com

# Expected:
# HTTP/1.1 301 Moved Permanently
# Location: https://yourdomain.com
```

**Secure Cookies:**
- Only sent over HTTPS
- Not accessible via HTTP

**Checklist:**
- [ ] HTTPS enforced in production
- [ ] HTTP redirects to HTTPS
- [ ] Cookies have Secure flag
- [ ] No mixed content warnings

---

## 11. Security Test Checklist

**Before marking security testing complete:**

### Authentication
- [ ] Unauthenticated users cannot access protected routes
- [ ] Invalid tokens rejected
- [ ] Expired sessions detected
- [ ] Session hijacking prevented
- [ ] CSRF protection working

### Webhooks
- [ ] Valid signatures accepted
- [ ] Invalid signatures rejected
- [ ] Replay attacks prevented
- [ ] Webhook secret protected
- [ ] DoS protection in place

### Data Security
- [ ] XSS attacks prevented
- [ ] SQL injection prevented
- [ ] User data sanitized
- [ ] No sensitive data in client code
- [ ] Encryption used for sensitive data

### Tokens and Keys
- [ ] Tokens encrypted/signed
- [ ] Token expiration works
- [ ] Automatic token refresh
- [ ] Secret keys not exposed
- [ ] Publishable keys safe to expose

### Privacy
- [ ] Only necessary data collected
- [ ] User can delete account
- [ ] Data deletion is complete
- [ ] GDPR/CCPA compliant

### Infrastructure
- [ ] HTTPS enforced (production)
- [ ] Secure cookie flags set
- [ ] Rate limiting in place
- [ ] Correct keys per environment
- [ ] No security warnings

---

## 12. Security Best Practices

### Implementation Checklist

**Middleware:**
```typescript
// ✓ GOOD
import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware();

// ✗ BAD - don't bypass auth
export default function middleware() {
  return NextResponse.next(); // No auth check!
}
```

**API Routes:**
```typescript
// ✓ GOOD - always check auth
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... proceed
}

// ✗ BAD - no auth check
export async function GET() {
  // Anyone can access!
  return Response.json({ data: sensitiveData });
}
```

**Environment Variables:**
```bash
# ✓ GOOD
CLERK_SECRET_KEY=sk_test_...  # In .env.local (not committed)

# ✗ BAD
CLERK_SECRET_KEY=sk_test_...  # Hardcoded in source
```

---

## 13. Vulnerability Scanning

### Automated Security Scan

**Run npm audit:**
```bash
cd /Users/tannerosterkamp/vortis
npm audit

# Fix vulnerabilities
npm audit fix
```

**Expected:**
```
found 0 vulnerabilities
```

**Dependency Security:**
- Keep Clerk package updated
- Monitor for security advisories
- Update dependencies regularly

---

## Next Steps

After completing security testing:

1. **Manual Testing Guide**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_MANUAL_TESTING.md`

2. **Troubleshooting Guide**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_TROUBLESHOOTING.md`

3. **Testing Checklist**
   - See: `/Users/tannerosterkamp/vortis/CLERK_TESTING_CHECKLIST.md`
