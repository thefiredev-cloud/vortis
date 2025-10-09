# Migration Guide: Email/Password to Google OAuth

Guide for migrating existing email/password users to Google OAuth authentication.

## Overview

Vortis is transitioning from email/password authentication to Google OAuth for improved security and user experience. This guide covers how to handle existing users during the migration.

---

## Migration Strategy Options

### Option 1: Dual Authentication (Recommended for Gradual Migration)

**Description:** Temporarily support both email/password and Google OAuth, allowing users to migrate at their own pace.

**Pros:**
- No forced migration
- Users can transition when ready
- Minimal disruption
- Fallback if issues occur

**Cons:**
- More complex to maintain
- Two authentication flows to support
- Eventually requires full migration anyway

**Implementation:**
1. Enable both authentication providers in Supabase
2. Show both options on login/signup pages
3. Encourage Google OAuth with UI prompts
4. Set deprecation date for email/password
5. Notify users via email
6. Eventually disable email/password

---

### Option 2: Forced Migration with Account Linking (Recommended for Small User Base)

**Description:** Require all users to link their Google account to access their existing account.

**Pros:**
- Clean cut-over
- Simplified codebase
- Everyone on same auth method
- Better security immediately

**Cons:**
- Potential user friction
- Support burden during transition
- Risk of losing users who don't want Google

**Implementation:**
1. Deploy Google OAuth
2. On login attempt with email/password:
   - Show migration prompt
   - Require Google sign-in
   - Link accounts behind the scenes
3. Migrate all users within set timeframe
4. Disable email/password completely

---

### Option 3: New Users Only (Current Implementation)

**Description:** Google OAuth for new users only; existing users continue with email/password until account recreation.

**Pros:**
- Zero impact on existing users
- Simplest implementation
- No forced migration needed

**Cons:**
- Two auth systems indefinitely
- Security inconsistency
- Technical debt

**Status:** This is the current default behavior. Email/password is disabled in Supabase, so only Google OAuth works for new signups.

---

## Implementation Details

### For Dual Authentication (Option 1)

#### 1. Enable Email/Password in Supabase

```
1. Go to Supabase Dashboard
2. Navigate to Authentication > Providers
3. Find "Email" provider
4. Toggle "Enable Email provider" to ON
5. Configure email templates if needed
6. Save changes
```

#### 2. Update Login Page

```typescript
// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleSignInButtonDark } from "@/components/auth/google-sign-in-button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in to Vortis" subtitle="Access your dashboard">
      {/* Google OAuth - Recommended */}
      <div className="mb-6">
        <div className="mb-3 text-center">
          <span className="text-xs text-emerald-400 font-medium uppercase tracking-wide">
            Recommended
          </span>
        </div>
        <GoogleSignInButtonDark text="Continue with Google" />
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white/5 px-4 text-slate-400">
            Or use email (deprecated)
          </span>
        </div>
      </div>

      {/* Email/Password - Deprecated */}
      <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-400 text-xs">
          Email/password authentication will be disabled on [DATE]. Please sign in with Google.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20"
        >
          {isLoading ? "Signing in..." : "Sign in with Email"}
        </button>
      </form>
    </AuthLayout>
  );
}
```

#### 3. Add Migration Prompt

Create a modal/banner that appears for email/password users:

```typescript
// components/auth/migration-prompt.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function MigrationPrompt({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(true);

  // Only show for email/password users
  if (!user || user.app_metadata?.provider !== "email") {
    return null;
  }

  const handleMigrate = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/link-account`,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-xl z-50">
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
      >
        ✕
      </button>
      <h3 className="text-white font-semibold mb-2">
        Switch to Google Sign-In
      </h3>
      <p className="text-slate-300 text-sm mb-4">
        We're improving security by moving to Google authentication.
        Link your Google account to keep using Vortis.
      </p>
      <button
        onClick={handleMigrate}
        className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600"
      >
        Link Google Account
      </button>
    </div>
  );
}
```

---

### For Forced Migration (Option 2)

#### 1. Create Migration Flow

```typescript
// app/auth/migrate/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleSignInButtonDark } from "@/components/auth/google-sign-in-button";

export default function MigratePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // If already using Google, redirect to dashboard
  if (user?.app_metadata?.provider === "google") {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <AuthLayout
      title="Account Migration Required"
      subtitle="We've upgraded to more secure Google authentication"
    >
      <div className="space-y-6">
        {/* Why Migration */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-blue-400 font-medium mb-2">Why are we doing this?</h3>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>✓ Enhanced security with Google's infrastructure</li>
            <li>✓ No more passwords to remember</li>
            <li>✓ Faster sign-in process</li>
            <li>✓ Two-factor authentication built-in</li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="text-slate-400 text-sm space-y-2">
          <p>To continue using Vortis:</p>
          <ol className="list-decimal list-inside ml-2 space-y-1">
            <li>Click the button below to sign in with Google</li>
            <li>Use the same email address ({user?.email})</li>
            <li>Your account will be automatically linked</li>
          </ol>
        </div>

        {/* Migration Button */}
        <GoogleSignInButtonDark text="Migrate to Google Account" />

        {/* Help */}
        <div className="text-center text-xs text-slate-500">
          Having trouble?{" "}
          <a
            href="mailto:support@vortis.com"
            className="text-emerald-400 hover:text-emerald-300 underline"
          >
            Contact support
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
```

#### 2. Add Migration Middleware

```typescript
// middleware.ts - Add to existing middleware

// After getting user
if (user) {
  // Check if user needs to migrate
  if (
    user.app_metadata?.provider === "email" &&
    !request.nextUrl.pathname.startsWith("/auth/migrate")
  ) {
    return NextResponse.redirect(new URL("/auth/migrate", request.url));
  }
}
```

#### 3. Handle Account Linking

```typescript
// app/auth/link-account/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // User is now using Google OAuth
  // Original email/password auth is automatically replaced
  return NextResponse.redirect(new URL("/dashboard?migrated=true", request.url));
}
```

---

## User Communication

### Email Template: Migration Announcement

```
Subject: Important: Switching to Google Sign-In

Hi [User Name],

We're making Vortis more secure and easier to use!

Starting [DATE], we're switching to Google authentication. This means:
✓ No more passwords to remember
✓ Enhanced security
✓ Faster sign-in

What you need to do:
1. Visit vortis.com/auth/login
2. Click "Sign in with Google"
3. Use your current email: [user@example.com]

Your data and settings will remain exactly the same.

Need help? Reply to this email or visit our help center.

Thanks,
The Vortis Team
```

### In-App Banner

```typescript
// components/migration-banner.tsx
export function MigrationBanner() {
  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-emerald-400 text-sm">
          <strong>Action required:</strong> Switch to Google Sign-In by [DATE].
        </p>
        <a
          href="/auth/migrate"
          className="text-white bg-emerald-500 px-4 py-1 rounded-lg text-sm hover:bg-emerald-600"
        >
          Migrate Now
        </a>
      </div>
    </div>
  );
}
```

---

## Database Considerations

### Checking User Auth Providers

```sql
-- Query to find email/password users
SELECT
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_app_meta_data->>'provider' as provider
FROM auth.users
WHERE raw_app_meta_data->>'provider' = 'email';

-- Count users by provider
SELECT
  raw_app_meta_data->>'provider' as provider,
  COUNT(*) as user_count
FROM auth.users
GROUP BY raw_app_meta_data->>'provider';
```

### Linking Accounts Manually (If Needed)

If a user has both email and Google accounts:

```sql
-- Find duplicate accounts by email
SELECT email, COUNT(*) as account_count
FROM auth.users
GROUP BY email
HAVING COUNT(*) > 1;

-- Merge user data manually
-- (This requires custom logic based on your schema)
```

**Important:** Supabase doesn't automatically merge accounts with the same email. You may need to:
1. Identify duplicate accounts
2. Migrate user data from old account to new
3. Delete old account
4. Communicate with affected users

---

## Timeline Example

### Week 1: Announcement
- Deploy Google OAuth alongside email/password
- Send announcement email to all users
- Add in-app banner about migration

### Week 2-4: Migration Period
- Monitor migration progress
- Send reminder emails to non-migrated users
- Provide support for issues

### Week 4: Final Notice
- Email non-migrated users with 1-week deadline
- Increase urgency of in-app banners

### Week 5: Cutover
- Disable email/password authentication
- Force remaining users to migrate on next login
- Monitor for support tickets

### Week 6: Cleanup
- Remove email/password code
- Archive old authentication logic
- Update documentation

---

## Rollback Plan

If migration causes issues:

### Immediate Rollback

1. **Re-enable email/password:**
   ```
   Supabase Dashboard > Authentication > Providers > Email > Enable
   ```

2. **Revert code:**
   ```bash
   git revert [migration-commit-hash]
   git push origin main
   ```

3. **Notify users:**
   - Post status update
   - Apologize for inconvenience
   - Provide new timeline

### Partial Rollback

Keep Google OAuth but re-enable email/password temporarily:
- Both methods work
- Continue migration more slowly
- Fix issues before next attempt

---

## Success Metrics

Track these during migration:

- **Migration Rate:** % of users migrated to Google
- **Support Tickets:** Issues related to auth
- **Sign-in Success Rate:** Should remain >98%
- **User Retention:** Ensure no significant drop-off
- **Time to Sign In:** Should decrease with Google OAuth

**Target:** 95%+ users migrated within 4 weeks

---

## FAQs for Users

### Q: Why do I need to use Google?
A: Google OAuth provides better security, faster sign-in, and eliminates the need to remember passwords.

### Q: What if I don't have a Google account?
A: Google accounts are free. Visit google.com/gmail to create one in minutes.

### Q: What if I use a different email for Google?
A: Contact support@vortis.com and we'll help link your accounts.

### Q: Will my data be deleted?
A: No, all your data, settings, and history will remain exactly as it is.

### Q: Can I still use my old password?
A: After [DATE], email/password authentication will be disabled. Please migrate before then.

### Q: Is this secure?
A: Yes! Google OAuth is more secure than traditional passwords and includes built-in two-factor authentication.

---

## Technical Support Playbook

### Issue: "I can't sign in with Google"

**Troubleshooting:**
1. Verify user's Google account email matches Vortis account
2. Check if Google OAuth is enabled in Supabase
3. Verify redirect URIs in Google Console
4. Check browser cookies are enabled
5. Try incognito mode

**Resolution:**
- Manually link accounts if needed
- Provide step-by-step screenshots
- Offer live support call if necessary

### Issue: "I have two accounts now"

**Cause:** User created new account with Google instead of linking existing

**Resolution:**
1. Identify both accounts in Supabase
2. Export data from old account
3. Import to new account (if possible)
4. Delete old account
5. Confirm with user

### Issue: "Error: Redirect URI mismatch"

**Cause:** Configuration issue in Google Console

**Resolution:**
1. Check Google Console redirect URIs
2. Ensure exact match with Supabase callback URL
3. Verify HTTPS in production
4. Clear browser cache
5. Try again

---

## Post-Migration Cleanup

After 100% migration:

### 1. Remove Email/Password Code

```bash
# Remove unused imports and functions
# Update login/signup pages to only show Google
# Remove password reset flow
# Clean up unused components
```

### 2. Disable Provider in Supabase

```
Supabase Dashboard > Authentication > Providers > Email > Disable
```

### 3. Update Documentation

- Remove password-related docs
- Update onboarding guides
- Revise support articles

### 4. Archive Migration Code

```bash
git tag migration-complete
git push --tags
```

---

## Lessons Learned

Document your experience for future reference:

- What went well?
- What challenges did you face?
- How many users needed support?
- How long did it actually take?
- What would you do differently?

---

Last Updated: 2025-10-09
Version: 1.0.0
