# Google OAuth Authentication Setup Guide

Complete guide to configure Google OAuth authentication for Vortis using Supabase.

## Table of Contents
1. [Google Cloud Console Setup](#google-cloud-console-setup)
2. [Supabase Configuration](#supabase-configuration)
3. [Environment Variables](#environment-variables)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: `Vortis` (or your preferred name)
5. Click "Create"

### Step 2: Configure OAuth Consent Screen

1. In the left sidebar, navigate to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace account)
3. Click "Create"

**App Information:**
- App name: `Vortis`
- User support email: Your email address
- Developer contact email: Your email address

**Scopes:**
- Add the following scopes:
  - `./auth/userinfo.email`
  - `./auth/userinfo.profile`
  - `openid`

**Test Users (Development Only):**
- Add your email and any test user emails
- Required while app is in "Testing" status

Click "Save and Continue" through all steps.

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: **Web application**
4. Name: `Vortis Web Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
https://bgywvwxqrijncqgdwsle.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

**Important:** The first URI is your Supabase project's callback URL. Replace `bgywvwxqrijncqgdwsle` with your Supabase project reference ID.

5. Click "Create"
6. **Save your credentials:**
   - Client ID: `xxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxx`

---

## Supabase Configuration

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **Vortis**
3. Navigate to **Authentication** > **Providers**

### Step 2: Enable Google Provider

1. Find "Google" in the provider list
2. Toggle "Enable Sign in with Google" to **ON**

**Configuration:**
- **Client ID (for OAuth):** Paste your Google Client ID
- **Client Secret (for OAuth):** Paste your Google Client Secret
- **Authorized Client IDs:** Leave empty (optional, for server-side auth)

3. Click "Save"

### Step 3: Configure Redirect URLs

1. Navigate to **Authentication** > **URL Configuration**
2. Verify these settings:

**Site URL:**
```
http://localhost:3000
```
(Update to production URL when deploying)

**Redirect URLs:**
```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

### Step 4: Disable Email/Password Authentication (Optional)

If you want Google-only authentication:

1. Navigate to **Authentication** > **Providers**
2. Find "Email" provider
3. Toggle "Enable Email provider" to **OFF**
4. Click "Save"

**Note:** This will prevent new email/password signups. Existing email/password users can still sign in.

---

## Environment Variables

Your `.env.local` already has the required Supabase credentials:

```bash
# Supabase Configuration (Already Set)
NEXT_PUBLIC_SUPABASE_URL=https://bgywvwxqrijncqgdwsle.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**No additional environment variables needed!** Google OAuth credentials are configured in Supabase Dashboard, not in your application code.

### Production Environment Variables

When deploying to production:

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Add production redirect URLs in both:
   - Google Cloud Console
   - Supabase Dashboard

---

## Testing

### Local Development Testing

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to login page:**
   ```
   http://localhost:3000/auth/login
   ```

3. **Click "Sign in with Google"**
   - You'll be redirected to Google's sign-in page
   - Select your Google account
   - Grant permissions (first time only)

4. **Verify successful authentication:**
   - You should be redirected to `/dashboard`
   - Check browser console for any errors
   - Verify session in Application > Cookies

### Testing Checklist

- [ ] Login page displays Google Sign-In button
- [ ] Clicking button redirects to Google
- [ ] Google consent screen displays correct app name
- [ ] After authentication, redirects to dashboard
- [ ] User session persists on page refresh
- [ ] Protected routes remain protected
- [ ] Logout functionality works
- [ ] Error states display properly

### Test Different Scenarios

1. **First-time user:**
   - Signs in with Google for the first time
   - User profile is created in Supabase
   - Redirects to dashboard

2. **Returning user:**
   - Signs in with previously used Google account
   - Immediately redirects to dashboard

3. **User cancels authentication:**
   - Clicks "Cancel" on Google consent screen
   - Returns to login page with error message

4. **Multiple Google accounts:**
   - User can select different Google account
   - Each account creates separate user in Supabase

---

## Troubleshooting

### Common Issues

#### 1. "Redirect URI mismatch" error

**Problem:** Google OAuth error about redirect URI not matching.

**Solution:**
- Verify redirect URIs in Google Cloud Console exactly match:
  ```
  https://bgywvwxqrijncqgdwsle.supabase.co/auth/v1/callback
  ```
- No trailing slashes
- Use your actual Supabase project reference ID
- Wait 5 minutes after updating Google Console settings

#### 2. "OAuth client not found" error

**Problem:** Invalid Client ID or Client Secret.

**Solution:**
- Double-check credentials in Supabase Dashboard
- Ensure no extra spaces when copying
- Regenerate credentials if needed in Google Cloud Console

#### 3. User lands on login page after clicking Google Sign-In

**Problem:** OAuth callback not working.

**Solution:**
- Check callback route exists at `/app/auth/callback/route.ts`
- Verify Supabase redirect URLs are configured
- Check browser console for errors
- Ensure cookies are enabled

#### 4. "App is not verified" warning

**Problem:** Google shows verification warning for unverified apps.

**Solution (Development):**
- Click "Advanced" > "Go to Vortis (unsafe)"
- This is normal for apps in testing mode
- Add test users in Google Cloud Console

**Solution (Production):**
- Submit app for Google OAuth verification
- Navigate to OAuth consent screen > Publishing status
- Click "Publish App" and follow verification process

#### 5. Session not persisting

**Problem:** User is logged out on page refresh.

**Solution:**
- Check if cookies are enabled in browser
- Verify middleware is not blocking session cookies
- Check Supabase session configuration
- Ensure HTTPS in production (required for secure cookies)

#### 6. "Unable to get user session" error

**Problem:** Session exchange fails in callback.

**Solution:**
- Check callback route code
- Verify Supabase client configuration
- Check network tab for failed requests
- Ensure Supabase project is active

### Debug Checklist

When authentication fails:

1. **Check Browser Console:**
   - Look for JavaScript errors
   - Check network requests (especially `/auth/v1/callback`)

2. **Verify Configuration:**
   - Google Cloud Console redirect URIs
   - Supabase provider settings
   - Environment variables loaded correctly

3. **Test Supabase Connection:**
   ```bash
   # In browser console on your site
   const supabase = createClient()
   const { data, error } = await supabase.auth.getSession()
   console.log('Session:', data, 'Error:', error)
   ```

4. **Check Supabase Logs:**
   - Navigate to Supabase Dashboard > Logs
   - Filter by "auth" to see authentication attempts
   - Look for error messages

### Getting Help

If you're still experiencing issues:

1. **Supabase Discord:** [discord.supabase.com](https://discord.supabase.com)
2. **Supabase GitHub Discussions:** [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. **Google OAuth Documentation:** [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)

---

## Security Considerations

### Production Checklist

- [ ] Use HTTPS for all redirect URIs
- [ ] Remove localhost URIs from Google Cloud Console
- [ ] Verify OAuth consent screen information is accurate
- [ ] Submit app for verification if public
- [ ] Enable Supabase email confirmations if needed
- [ ] Configure proper CORS settings
- [ ] Set up monitoring for failed auth attempts
- [ ] Implement rate limiting on auth endpoints
- [ ] Review Supabase Row Level Security policies
- [ ] Backup your Google OAuth credentials securely

### Best Practices

1. **Never commit credentials to git**
   - Google Client Secret should only be in Supabase Dashboard
   - No credentials in frontend code

2. **Use environment-specific configs**
   - Separate Google OAuth clients for dev/staging/prod
   - Different redirect URIs per environment

3. **Monitor authentication logs**
   - Set up alerts for unusual auth patterns
   - Review Supabase auth logs regularly

4. **Keep dependencies updated**
   - Update `@supabase/ssr` regularly
   - Monitor security advisories

---

## Migration from Email/Password

If you have existing email/password users:

### Option 1: Account Linking (Manual)

Users must:
1. Sign in with Google
2. Contact support to link accounts
3. You manually merge accounts in Supabase

### Option 2: Dual Authentication (Temporary)

1. Keep email/password authentication enabled
2. Encourage users to switch to Google
3. Eventually deprecate email/password

### Option 3: Force Migration

1. Email users about the change
2. Provide migration deadline
3. Require Google sign-in after deadline
4. Offer support for account recovery

---

## Next Steps

After completing setup:

1. **Test thoroughly** using the testing checklist above
2. **Deploy to staging** environment for additional testing
3. **Set up production** Google OAuth client
4. **Configure production** Supabase settings
5. **Deploy to production** and verify
6. **Monitor authentication** logs for issues
7. **Gather user feedback** on auth experience

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase SSR Package](https://github.com/supabase/ssr)

---

Last Updated: 2025-10-09
Version: 1.0.0
