# Clerk Setup Guide for Vortis

## Prerequisites

- Node.js 22+ installed
- Clerk account (free tier available)
- Access to Vortis codebase
- Environment variables access

## Step 1: Create Clerk Application

1. **Sign up for Clerk:**
   - Go to https://dashboard.clerk.com/sign-up
   - Create a new account or sign in

2. **Create New Application:**
   - Click "Create Application"
   - Name: "Vortis" (or "Vortis Dev" for development)
   - Choose authentication methods:
     - [x] Email
     - [x] Google (optional)
     - [x] GitHub (optional)

3. **Configure Application:**
   - Go to "User & Authentication" → "Email, Phone, Username"
   - Enable email as primary authentication
   - Configure email verification settings

## Step 2: Get API Keys

1. **Navigate to API Keys:**
   - In Clerk Dashboard, go to "API Keys"
   - Copy the keys shown

2. **Add to `.env.local`:**
   ```bash
   # Copy .env.example to .env.local if you haven't
   cp .env.example .env.local
   ```

3. **Update environment variables:**
   ```bash
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123...
   CLERK_SECRET_KEY=sk_test_xyz789...

   # These should already be correct:
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   ```

## Step 3: Configure Clerk Appearance

1. **In Clerk Dashboard → Customization → Theme:**
   - Base Theme: Dark
   - Primary Color: `#10b981` (Emerald-500)
   - Background: `#000000`

2. **Logo & Branding:**
   - Upload Vortis logo
   - Set application name: "Vortis"

## Step 4: Configure Routes

1. **In Clerk Dashboard → Paths:**
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - Home URL: `/`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

2. **Verify these match your `.env.local`**

## Step 5: Set Up Webhooks (Optional)

Webhooks allow you to sync Clerk user events to your Supabase database.

1. **In Clerk Dashboard → Webhooks:**
   - Click "Add Endpoint"
   - Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
   - Events to subscribe:
     - [x] user.created
     - [x] user.updated
     - [x] user.deleted
     - [x] session.created

2. **Get Signing Secret:**
   - Copy the webhook signing secret
   - Add to `.env.local`:
     ```bash
     CLERK_WEBHOOK_SECRET=whsec_abc123...
     ```

3. **For local development:**
   ```bash
   # Use Clerk CLI to forward webhooks
   npm run clerk:dev
   ```

## Step 6: Test Authentication

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test sign-up:**
   - Go to http://localhost:3000/sign-up
   - Create a test account
   - Verify email (if enabled)
   - Should redirect to `/dashboard`

3. **Test sign-in:**
   - Sign out (click UserButton → Sign out)
   - Go to http://localhost:3000/sign-in
   - Sign in with test account
   - Should redirect to `/dashboard`

4. **Test route protection:**
   - Sign out
   - Try to access http://localhost:3000/dashboard
   - Should redirect to `/sign-in`

## Step 7: Configure Email Templates (Optional)

1. **In Clerk Dashboard → Customization → Emails:**
   - Customize verification email
   - Customize magic link email
   - Customize password reset email

2. **Add Vortis branding:**
   - Use Vortis colors and logo
   - Match tone with app messaging

## Step 8: Set Up Social Authentication (Optional)

### Google OAuth

1. **In Clerk Dashboard → User & Authentication → Social Connections:**
   - Enable Google
   - Click "Set up" for custom OAuth credentials

2. **Google Cloud Console:**
   - Create OAuth 2.0 Client ID
   - Add authorized origins: `https://your-clerk-domain.clerk.accounts.dev`
   - Add redirect URIs from Clerk

3. **Add credentials to Clerk**

### GitHub OAuth

1. **In Clerk Dashboard → Social Connections:**
   - Enable GitHub
   - Click "Set up"

2. **GitHub Developer Settings:**
   - Create new OAuth App
   - Add callback URL from Clerk
   - Copy Client ID and Secret

3. **Add to Clerk Dashboard**

## Step 9: Production Setup

1. **Create Production Instance:**
   - In Clerk Dashboard, create new application
   - Name: "Vortis Production"
   - Get production API keys

2. **Set Production Environment Variables:**
   ```bash
   # In your hosting platform (Vercel, Railway, etc.)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_SECRET_KEY=sk_live_...
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

3. **Update Clerk Production Settings:**
   - Set production URLs
   - Configure webhook endpoint
   - Test authentication flow

## Step 10: Migration from Supabase (If Needed)

If you have existing Supabase users:

1. **Export Supabase users:**
   ```bash
   # Use Supabase dashboard or CLI
   supabase db dump --table auth.users
   ```

2. **Import to Clerk:**
   - Use Clerk's user import API
   - Or manually via Clerk Dashboard

3. **Map user IDs:**
   - Update your database to map Supabase user IDs to Clerk user IDs
   - Or use a migration script

## Troubleshooting

### "Invalid publishable key" error

**Solution:** Verify environment variables are set correctly and server is restarted.

```bash
# Check if variables are loaded
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Restart dev server
npm run dev
```

### Redirect loop after sign-in

**Solution:** Check that redirect URLs match in both Clerk Dashboard and `.env.local`.

### Webhooks not working locally

**Solution:** Use Clerk CLI to forward webhooks to localhost.

```bash
npm run clerk:dev
```

### UserButton not showing

**Solution:** Ensure component is client-side (has `"use client"` directive).

### Session not persisting

**Solution:** Check that cookies are enabled and domain is correct.

## Security Best Practices

1. **Never commit `.env.local`:**
   - Already in `.gitignore`
   - Use environment variables in production

2. **Rotate keys regularly:**
   - Especially if keys are exposed
   - Update in both Clerk Dashboard and hosting platform

3. **Enable MFA for admin accounts:**
   - Protect your Clerk Dashboard account
   - Encourage users to enable MFA

4. **Monitor authentication logs:**
   - Check Clerk Dashboard → Logs
   - Set up alerts for suspicious activity

5. **Use production keys in production:**
   - Never use test keys in production
   - Test keys have rate limits

## Performance Optimization

1. **Enable caching:**
   - Clerk automatically caches auth tokens
   - Configure cache TTL in middleware

2. **Optimize bundle size:**
   - UserButton is already code-split
   - Only import Clerk components where needed

3. **Use Server Components:**
   - Keep auth checks in Server Components
   - Only use Client Components for interactive UI

## Support & Resources

- **Clerk Documentation:** https://clerk.com/docs
- **Clerk Discord:** https://clerk.com/discord
- **Next.js Integration:** https://clerk.com/docs/quickstarts/nextjs
- **Vortis Docs:** `/docs/CLERK_MIGRATION_SUMMARY.md`

## Quick Commands

```bash
# Start dev server
npm run dev

# Start with Clerk webhook forwarding
npm run clerk:dev

# Sync users (if using custom script)
npm run clerk:sync

# Build for production
npm run build

# Start production server
npm start
```

## Verification Checklist

Before going to production:

- [ ] Clerk account created
- [ ] Application configured
- [ ] API keys added to `.env.local`
- [ ] Sign-up flow tested
- [ ] Sign-in flow tested
- [ ] Sign-out flow tested
- [ ] Route protection tested
- [ ] UserButton working
- [ ] Webhooks configured (optional)
- [ ] Social auth configured (optional)
- [ ] Email templates customized (optional)
- [ ] Production instance created
- [ ] Production environment variables set
- [ ] Production authentication tested

## Next Steps

After completing setup:

1. Test all authentication flows
2. Run full test suite (see `CLERK_ROUTING_TESTS.md`)
3. Update API routes to use Clerk auth
4. Configure monitoring and alerts
5. Deploy to production
6. Monitor authentication metrics

## Notes

- Keep Clerk Dashboard and app in sync
- Test changes in development first
- Monitor auth logs after deployment
- Have rollback plan ready
- Document any custom configuration
