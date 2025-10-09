# Clerk Installation and Setup Guide

## Overview

This guide walks you through installing and configuring Clerk authentication for Vortis.

**Estimated Time:** 30-45 minutes

## Step 1: Install Clerk Package

The required packages have been installed:

```bash
cd /Users/tannerosterkamp/vortis
npm install  # Dependencies already added to package.json
```

**Installed:**
- `@clerk/nextjs` v6.33.3
- `svix` v1.76.1

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# =====================================================
# CLERK AUTHENTICATION
# Get these from: https://dashboard.clerk.com
# Configure > API Keys
# =====================================================

# Clerk API Keys (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk Auth URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Clerk Webhook Secret (for Supabase sync)
# Get from: https://dashboard.clerk.com > Webhooks
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 3: Create Clerk Account and Configure

1. **Sign up for Clerk**: Go to https://clerk.com and create an account
2. **Create a new application** in the Clerk dashboard
3. **Enable Google OAuth**:
   - Navigate to: Configure > Social Connections
   - Enable Google
   - Add authorized domains (localhost:3000 for dev)
4. **Copy API Keys**:
   - Navigate to: Configure > API Keys
   - Copy Publishable Key and Secret Key to `.env.local`
5. **Configure Appearance** (optional):
   - Navigate to: Customize > Appearance
   - Set theme to dark to match Vortis

## Step 4: Test Installation

After installation, verify Clerk is properly configured by checking:
- [ ] Environment variables are set
- [ ] Google OAuth is enabled in Clerk dashboard
- [ ] Application runs without errors

## Next Steps

After completing these steps, the migration scripts will handle:
- Wrapping your app with ClerkProvider
- Replacing auth pages with Clerk components
- Updating middleware for Clerk authentication
- Setting up Clerk → Supabase sync webhook


