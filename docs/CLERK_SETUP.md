# Clerk Setup Guide for Vortis

Complete setup instructions for Clerk authentication in Vortis.

## Prerequisites

- Node.js 22+ installed
- Next.js 15.x project running
- Supabase project created
- Vortis project cloned locally

## Step 1: Install Dependencies

The required packages should already be installed. Verify by checking `package.json`:

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.33.3",
    "svix": "^1.76.1"
  }
}
```

If not installed, run:

```bash
npm install @clerk/nextjs svix
```

## Step 2: Create Clerk Account

1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application
4. Choose "Next.js" as your framework
5. Name it "Vortis" or your preferred name

## Step 3: Configure Google OAuth in Clerk

### Enable Google Provider

1. In Clerk Dashboard, navigate to: **Configure > Social Connections**
2. Click **Add Social Connection**
3. Select **Google**
4. Toggle **Enabled** to ON

### Development Setup (Default Google)

For development, Clerk provides a default Google OAuth app:

1. No additional configuration needed
2. Works immediately for localhost:3000
3. Limited to Clerk's development keys

### Production Setup (Custom Google OAuth)

For production, you need your own Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External
   - App name: Vortis
   - Support email: your-email@example.com
   - Authorized domains: your-domain.com
6. Create OAuth Client ID:
   - Application type: Web application
   - Name: Vortis Production
   - Authorized JavaScript origins:
     - `https://your-domain.com`
   - Authorized redirect URIs:
     - `https://accounts.clerk.com/v1/oauth_callback`
7. Copy Client ID and Client Secret
8. In Clerk Dashboard, under Google settings:
   - Enable "Use custom credentials"
   - Paste Client ID and Client Secret
   - Save

## Step 4: Configure Clerk API Keys

### Get Your API Keys

1. In Clerk Dashboard, go to: **Configure > API Keys**
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Add to Environment Variables

Add to `/Users/tannerosterkamp/vortis/.env.local`:

```bash
# Clerk API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

## Step 5: Configure Clerk Appearance

The dark theme is already configured in `/app/layout.tsx`. To customize:

1. In Clerk Dashboard, go to: **Customize > Appearance**
2. Upload your logo (optional)
3. Select "Dark" base theme
4. Customize colors (optional - already set in code):
   - Primary color: `#10b981` (Emerald-500)
   - Background: `#000000`

## Step 6: Set Up Webhooks for Supabase Sync

### Why Webhooks?

Webhooks sync Clerk user data to your Supabase database, maintaining user profiles while using Clerk for authentication.

### Configure Webhook Endpoint

1. In Clerk Dashboard, go to: **Configure > Webhooks**
2. Click **Add Endpoint**
3. Enter your endpoint URL:
   - **Development**: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - **Production**: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Save the endpoint
6. Copy the **Signing Secret** (starts with `whsec_`)

### Add Webhook Secret to Environment

Add to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Testing Webhooks Locally

For local development, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in Clerk webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/clerk
```

## Step 7: Get Supabase Service Role Key

The webhook needs elevated permissions to create/update/delete user profiles.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your Vortis project
3. Go to: **Project Settings > API**
4. Copy the **service_role** key (not anon!)
5. Add to `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx
```

**IMPORTANT**: Never expose this key in client-side code! Only use in API routes and webhooks.

## Step 8: Run Database Migration

Apply the Clerk migration to modify your Supabase database:

```bash
# Using Supabase CLI (recommended)
npx supabase db push

# Or manually in Supabase Dashboard
# Go to SQL Editor and run:
# /Users/tannerosterkamp/vortis/supabase/migrations/20250109_clerk_migration.sql
```

This migration:
- Changes `profiles.id` from UUID to TEXT (for Clerk user IDs)
- Removes Supabase auth triggers
- Updates RLS policies
- Updates foreign keys in `subscriptions` table

## Step 9: Test Authentication Flow

### Test Sign Up

1. Start your app: `npm run dev`
2. Navigate to: `http://localhost:3000/auth/signup`
3. Click "Continue with Google"
4. Complete Google OAuth flow
5. Verify you're redirected to `/dashboard`
6. Check Supabase database:
   ```sql
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
   ```
7. Confirm profile was created with Clerk user ID

### Test Sign In

1. Sign out from dashboard
2. Navigate to: `http://localhost:3000/auth/login`
3. Click "Continue with Google"
4. Verify you're logged in and redirected to dashboard

### Test Webhook Events

1. Go to Clerk Dashboard > Webhooks
2. Click on your webhook endpoint
3. View recent events
4. Verify `user.created` event shows as successful
5. Check Supabase logs for any errors

### Test Protected Routes

1. In an incognito window, try to access: `http://localhost:3000/dashboard`
2. Verify you're redirected to `/auth/login`
3. Sign in and confirm you can access dashboard

## Step 10: Production Checklist

Before deploying to production:

### Clerk Configuration

- [ ] Switch to production instance in Clerk Dashboard
- [ ] Configure custom Google OAuth credentials
- [ ] Update webhook endpoint to production URL
- [ ] Test webhook is receiving events
- [ ] Configure custom email templates (optional)
- [ ] Set up custom domain (optional)

### Environment Variables

- [ ] Update all `pk_test_` and `sk_test_` to production keys
- [ ] Update webhook secret to production secret
- [ ] Verify all environment variables are set in hosting platform
- [ ] Never commit `.env.local` to git

### Database

- [ ] Run migration on production Supabase instance
- [ ] Verify RLS policies are correct
- [ ] Test user creation in production
- [ ] Set up database backups

### Testing

- [ ] Test complete auth flow in production
- [ ] Verify webhooks are working
- [ ] Test user profile updates
- [ ] Test user deletion (if applicable)
- [ ] Check error handling and logging

## Troubleshooting

### Webhook Not Working

1. Check webhook URL is correct in Clerk Dashboard
2. Verify `CLERK_WEBHOOK_SECRET` is set
3. Check Clerk webhook logs for errors
4. Verify Supabase service role key is correct
5. Check application logs for webhook handler errors

### Authentication Redirect Loop

1. Verify middleware configuration in `/middleware.ts`
2. Check that auth routes are in `isPublicRoute` matcher
3. Clear browser cookies and try again
4. Check Clerk Dashboard for any configuration issues

### User Profile Not Created

1. Check webhook events in Clerk Dashboard
2. Verify `user.created` event was sent
3. Check webhook response (should be 200)
4. Verify Supabase service role key has correct permissions
5. Check Supabase logs for SQL errors
6. Verify migration was applied correctly

### Google OAuth Not Working

1. Verify Google is enabled in Clerk Dashboard
2. For production, check Google OAuth credentials are correct
3. Verify authorized redirect URIs include Clerk's callback URL
4. Check Google Cloud Console for any errors
5. Try using Clerk's default Google provider first

## Support Resources

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Discord**: https://clerk.com/discord
- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

## Next Steps

After completing setup:

1. Customize Clerk components appearance
2. Add additional OAuth providers (GitHub, Microsoft, etc.)
3. Implement role-based access control (RBAC)
4. Set up user metadata and custom claims
5. Configure session management and security settings
