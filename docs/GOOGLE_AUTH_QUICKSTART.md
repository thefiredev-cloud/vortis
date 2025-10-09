# Google OAuth Quick Start Guide

Fast setup guide for Vortis Google OAuth authentication. For detailed documentation, see [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md).

## 5-Minute Setup

### Step 1: Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create new project: "Vortis"
3. **APIs & Services** > **OAuth consent screen**:
   - User type: External
   - App name: Vortis
   - Add your email
   - Add scopes: email, profile, openid
4. **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Type: Web application
   - Authorized redirect URIs:
     ```
     https://bgywvwxqrijncqgdwsle.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```
5. **Save** Client ID and Client Secret

### Step 2: Supabase Dashboard

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your Vortis project
3. **Authentication** > **Providers** > **Google**:
   - Enable: ON
   - Paste Client ID
   - Paste Client Secret
   - Save

### Step 3: Environment Variables (Already Set)

Your `.env.local` already has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bgywvwxqrijncqgdwsle.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

No additional variables needed!

### Step 4: Test

```bash
npm run dev
```

Visit `http://localhost:3000/auth/login` and click "Sign in with Google"

---

## File Structure

All authentication files are in place:

```
vortis/
├── app/
│   └── auth/
│       ├── login/page.tsx          ✅ Google OAuth only
│       ├── signup/page.tsx         ✅ Google OAuth only
│       ├── forgot-password/page.tsx ✅ Info page with redirect
│       └── callback/route.ts       ✅ OAuth callback handler
├── components/
│   └── auth/
│       ├── google-sign-in-button.tsx   ✅ Google button (light)
│       ├── auth-layout.tsx             ✅ Shared auth layout
│       └── auth-error.tsx              ✅ Error handling
├── middleware.ts                   ✅ Session management
└── docs/
    ├── GOOGLE_AUTH_SETUP.md        ✅ Detailed setup guide
    ├── GOOGLE_AUTH_TESTING.md      ✅ Testing checklist
    ├── GOOGLE_AUTH_MIGRATION.md    ✅ Migration guide
    └── GOOGLE_AUTH_QUICKSTART.md   ✅ This file
```

---

## Authentication Flow

```
User clicks "Sign in with Google"
       ↓
Google consent screen
       ↓
User approves
       ↓
/auth/callback?code=xxx
       ↓
Exchange code for session
       ↓
Redirect to /dashboard
       ↓
User logged in
```

---

## Troubleshooting

### "Redirect URI mismatch"
**Fix:** Verify exact URL in Google Console matches:
```
https://bgywvwxqrijncqgdwsle.supabase.co/auth/v1/callback
```

### "OAuth client not found"
**Fix:** Double-check Client ID/Secret in Supabase Dashboard

### "User stuck on callback page"
**Fix:** Check `/app/auth/callback/route.ts` for errors

### "Session not persisting"
**Fix:** Ensure cookies enabled in browser, check middleware.ts

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Check environment variables loaded
npm run dev
# Then in browser console:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

# View Supabase logs
# Visit: https://supabase.com/dashboard/project/bgywvwxqrijncqgdwsle/logs

# Test authentication
# Visit: http://localhost:3000/auth/login
```

---

## Production Deployment

Before deploying:

1. **Create production Google OAuth client:**
   - Different credentials than dev
   - Update redirect URIs to production domain

2. **Update Supabase redirect URLs:**
   - Add production domain to allowed URLs

3. **Set environment variables in hosting platform:**
   - Same Supabase credentials work for prod
   - Or create separate Supabase prod project

4. **Verify HTTPS enabled:**
   - Required for OAuth in production

5. **Test thoroughly:**
   - Use testing checklist in GOOGLE_AUTH_TESTING.md

---

## Key Features Implemented

- ✅ Google OAuth authentication
- ✅ Login page with Google Sign-In
- ✅ Signup page with benefits list
- ✅ OAuth callback handling
- ✅ Error handling and display
- ✅ Session management via middleware
- ✅ Protected route enforcement
- ✅ Responsive design (mobile-friendly)
- ✅ Accessibility (WCAG compliant)
- ✅ Loading states
- ✅ Auto-redirect for logged-in users
- ✅ Forgot password page (info only)
- ✅ Dark theme integration

---

## What's NOT Included

- ❌ Email/password authentication (removed)
- ❌ Password reset flow (not applicable)
- ❌ Email verification flow (Google handles this)
- ❌ Multi-factor authentication (use Google's 2FA)
- ❌ Social providers besides Google

If you need any of these, see migration guide or contact support.

---

## Next Steps

1. **Complete Google Cloud setup** (Step 1 above)
2. **Configure Supabase** (Step 2 above)
3. **Test locally** (Step 4 above)
4. **Review testing checklist:** [GOOGLE_AUTH_TESTING.md](./GOOGLE_AUTH_TESTING.md)
5. **Deploy to staging**
6. **Test in production**
7. **Monitor authentication logs**

---

## Support & Resources

- **Detailed Setup:** [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
- **Testing Guide:** [GOOGLE_AUTH_TESTING.md](./GOOGLE_AUTH_TESTING.md)
- **Migration Guide:** [GOOGLE_AUTH_MIGRATION.md](./GOOGLE_AUTH_MIGRATION.md)
- **Supabase Auth Docs:** [supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **Google OAuth Docs:** [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)

---

## Configuration Checklist

Before going live:

- [ ] Google OAuth client created
- [ ] OAuth consent screen configured
- [ ] Redirect URIs added to Google Console
- [ ] Google provider enabled in Supabase
- [ ] Client ID/Secret added to Supabase
- [ ] Tested login flow locally
- [ ] Verified session persistence
- [ ] Tested error scenarios
- [ ] Mobile responsive confirmed
- [ ] Production OAuth client ready
- [ ] Production redirect URIs configured
- [ ] Monitoring/analytics set up

---

Last Updated: 2025-10-09
Version: 1.0.0
Ready to deploy: ✅
