# Clerk Migration Testing Checklist

## Pre-Migration Tests (Before Applying Migration)

### Database Backup
- [ ] Full database backup created
- [ ] Backup file verified (can be restored)
- [ ] Backup stored in secure location
- [ ] Backup timestamp documented

### Environment Setup
- [ ] Development environment ready
- [ ] Staging environment ready (if available)
- [ ] All environment variables documented
- [ ] Service role key accessible
- [ ] Clerk keys available

## Migration Application Tests

### Migration Execution
- [ ] Migration runs without errors in development
- [ ] All SQL statements complete successfully
- [ ] No timeout errors
- [ ] Migration time documented (for production planning)

### Schema Verification
- [ ] All `user_id` columns converted to TEXT
- [ ] `profiles.id` changed from UUID to TEXT
- [ ] Clerk-specific columns added to profiles
- [ ] Email column is nullable
- [ ] All indexes created successfully
- [ ] Foreign key to `auth.users` removed
- [ ] Service role RLS policies created

### Function Verification
- [ ] `upsert_user_from_clerk` function exists
- [ ] `delete_user_from_clerk` function exists
- [ ] `sync_clerk_user_metadata` function exists
- [ ] Functions can be called without errors
- [ ] Functions have correct parameters

### Trigger Verification
- [ ] `on_auth_user_created` trigger removed
- [ ] `update_*_updated_at` triggers still exist
- [ ] No orphaned triggers remain

## Application Code Tests

### Build & Compile
- [ ] Application builds without TypeScript errors
- [ ] No type mismatches for user IDs
- [ ] All imports resolve correctly
- [ ] No unused imports remain

### Admin Client Setup
- [ ] `supabaseAdmin` client created
- [ ] Service role key loaded correctly
- [ ] Admin client only used server-side
- [ ] Safety check prevents client-side usage

### Subscription Helpers
- [ ] `getUserSubscription` works with Clerk IDs
- [ ] `getUserUsage` works with Clerk IDs
- [ ] `incrementAnalysisUsage` increments correctly
- [ ] `getSubscriptionStatus` returns correct data
- [ ] All helper functions use admin client

## Webhook Tests

### Webhook Setup
- [ ] Webhook endpoint created (`/api/webhooks/clerk`)
- [ ] Webhook signature verification works
- [ ] Webhook secret environment variable set
- [ ] Clerk dashboard webhook configured
- [ ] Webhook events selected (created, updated, deleted)

### User Created Webhook
- [ ] Webhook receives `user.created` event
- [ ] User profile created in database
- [ ] Clerk user ID stored correctly
- [ ] Email stored correctly
- [ ] First name stored correctly
- [ ] Last name stored correctly
- [ ] Full name generated correctly
- [ ] Image URL stored correctly
- [ ] Username stored correctly
- [ ] Initial usage tracking created
- [ ] Free tier limits set correctly

### User Updated Webhook
- [ ] Webhook receives `user.updated` event
- [ ] Existing profile updated
- [ ] Email updated correctly
- [ ] Name fields updated correctly
- [ ] Image URL updated correctly
- [ ] Username updated correctly
- [ ] `updated_at` timestamp updated
- [ ] No duplicate profiles created

### User Deleted Webhook
- [ ] Webhook receives `user.deleted` event
- [ ] User profile deleted from database
- [ ] Related subscriptions deleted (cascade)
- [ ] Related stock analyses deleted (cascade)
- [ ] Related usage tracking deleted (cascade)
- [ ] Related watchlist items deleted (cascade)
- [ ] Related API usage deleted (cascade)
- [ ] No orphaned records remain

### Webhook Error Handling
- [ ] Invalid signature returns 400 error
- [ ] Missing headers return 400 error
- [ ] Database errors return 500 error
- [ ] Errors logged for debugging
- [ ] Failed webhooks visible in Clerk dashboard

## Authentication Flow Tests

### Sign Up Flow
- [ ] User can sign up via Clerk
- [ ] Clerk creates user successfully
- [ ] Webhook creates profile in database
- [ ] User redirected to correct page
- [ ] Session established correctly
- [ ] User data accessible in app

### Sign In Flow
- [ ] User can sign in via Clerk
- [ ] Clerk authenticates successfully
- [ ] Session established correctly
- [ ] User data loaded from database
- [ ] Redirected to correct page

### Sign Out Flow
- [ ] User can sign out
- [ ] Session cleared correctly
- [ ] User redirected to public page
- [ ] Protected routes inaccessible after signout

### Protected Routes
- [ ] Unauthenticated users redirected to sign-in
- [ ] Authenticated users can access protected routes
- [ ] User data loads on protected routes
- [ ] Authorization checks work correctly

## Database Operation Tests

### Profile Operations
- [ ] Get user profile by Clerk ID
- [ ] Update user profile
- [ ] Profile fields save correctly
- [ ] Profile timestamps update correctly
- [ ] Profile queries perform well

### Subscription Operations
- [ ] Get user subscription by Clerk ID
- [ ] Create subscription for Clerk user
- [ ] Update subscription for Clerk user
- [ ] Delete subscription for Clerk user
- [ ] Subscription status resolves correctly
- [ ] Foreign key constraints work

### Stock Analysis Operations
- [ ] Create stock analysis for Clerk user
- [ ] Get user's stock analyses
- [ ] Filter analyses by ticker
- [ ] Sort analyses by date
- [ ] Update analysis (mark favorite, etc.)
- [ ] Delete analysis
- [ ] Foreign key constraints work

### Usage Tracking Operations
- [ ] Get current usage for Clerk user
- [ ] Increment usage counter
- [ ] Usage limits enforced correctly
- [ ] Period boundaries work correctly
- [ ] Usage resets at period end
- [ ] Free tier: 10 analyses limit works
- [ ] Pro tier: correct limit applied
- [ ] Enterprise tier: unlimited works

### Watchlist Operations
- [ ] Add stock to watchlist
- [ ] Get user's watchlist
- [ ] Update watchlist item
- [ ] Remove stock from watchlist
- [ ] Duplicate prevention works
- [ ] Foreign key constraints work

### API Usage Tracking
- [ ] API calls logged correctly
- [ ] User ID recorded correctly
- [ ] Response times tracked
- [ ] Rate limiting works
- [ ] Statistics queries work

## Performance Tests

### Query Performance
- [ ] Profile lookup by ID < 50ms
- [ ] Subscription lookup < 50ms
- [ ] Stock analyses query < 100ms
- [ ] Watchlist query < 100ms
- [ ] Usage tracking query < 50ms

### Index Usage
- [ ] `idx_profiles_clerk_user_id` used
- [ ] `idx_subscriptions_user_status` used
- [ ] `idx_stock_analyses_user_ticker` used
- [ ] `idx_watchlist_user_id` used
- [ ] No sequential scans on large tables

### Webhook Performance
- [ ] Webhook processes in < 1 second
- [ ] Database writes complete quickly
- [ ] No timeout errors
- [ ] Concurrent webhooks handled correctly

## Integration Tests

### Stripe Integration
- [ ] Create Stripe customer with Clerk user ID
- [ ] Create subscription with Clerk user ID
- [ ] Webhook updates database correctly
- [ ] Subscription status syncs correctly
- [ ] Cancel subscription works

### Stock Analysis Integration
- [ ] User can request stock analysis
- [ ] Usage checked before analysis
- [ ] Analysis saved with Clerk user ID
- [ ] Usage incremented after analysis
- [ ] Analysis history displays correctly

### Watchlist Integration
- [ ] Add to watchlist from analysis page
- [ ] Watchlist displays on dashboard
- [ ] Price updates work
- [ ] Remove from watchlist works
- [ ] Alerts work (if implemented)

## Security Tests

### Service Role Key
- [ ] Service role key not exposed to client
- [ ] Service role key not in client bundle
- [ ] Service role key not in browser console
- [ ] Service role key only in server environment

### RLS Policies
- [ ] Anon key cannot read other users' data
- [ ] Anon key cannot write any data
- [ ] Service role can read all data
- [ ] Service role can write all data
- [ ] Policies enforced correctly

### Webhook Security
- [ ] Signature verification required
- [ ] Invalid signatures rejected
- [ ] Replayed webhooks prevented (Svix handles this)
- [ ] Unauthorized requests rejected

### Authorization Checks
- [ ] Users can only access their own data (app-level)
- [ ] API routes check Clerk session
- [ ] Server actions check Clerk session
- [ ] Unauthorized requests return 401

## Error Handling Tests

### Database Errors
- [ ] Connection errors handled gracefully
- [ ] Query errors logged correctly
- [ ] User sees friendly error message
- [ ] App doesn't crash on DB error

### Webhook Errors
- [ ] Database errors don't crash webhook
- [ ] Errors returned with correct status code
- [ ] Errors logged for debugging
- [ ] Clerk retries failed webhooks

### Network Errors
- [ ] Timeout errors handled
- [ ] Connection errors handled
- [ ] User sees retry option
- [ ] Partial failures handled correctly

## Edge Cases

### User Data
- [ ] User with no email works
- [ ] User with no name works
- [ ] User with very long name works
- [ ] User with special characters in name works
- [ ] User with existing email works (update)

### Concurrent Operations
- [ ] Multiple webhooks for same user
- [ ] Simultaneous usage increments
- [ ] Concurrent subscription updates
- [ ] Race conditions handled

### Data Migration
- [ ] Empty database migration works
- [ ] Database with existing data migrates correctly
- [ ] Large database migration completes
- [ ] No data loss during migration

## Rollback Tests

### Rollback Preparation
- [ ] Rollback migration file exists
- [ ] Rollback steps documented
- [ ] Backup restoration tested
- [ ] Rollback time estimated

### Rollback Execution (in dev only!)
- [ ] Rollback migration runs successfully
- [ ] All Clerk columns removed
- [ ] UUIDs restored
- [ ] Supabase Auth trigger restored
- [ ] RLS policies restored
- [ ] Foreign keys restored

## Production Readiness

### Documentation
- [ ] Migration guide reviewed
- [ ] Verification queries documented
- [ ] Rollback plan documented
- [ ] Team trained on new flow
- [ ] FAQ document created

### Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Webhook monitoring set up
- [ ] Database monitoring set up
- [ ] Performance monitoring set up
- [ ] Alerts configured

### Deployment Plan
- [ ] Deployment window scheduled
- [ ] Maintenance mode plan ready
- [ ] Rollback triggers defined
- [ ] Communication plan ready
- [ ] Team availability confirmed

### Post-Deployment
- [ ] Verify webhook deliveries
- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Verify user sign-ups work
- [ ] Test critical user flows
- [ ] Monitor for 24-48 hours

## Sign-Off

### Development Environment
- [ ] All tests passed
- [ ] No blocking issues
- [ ] Performance acceptable
- [ ] Team sign-off obtained

### Staging Environment (if applicable)
- [ ] All tests passed
- [ ] End-to-end flows verified
- [ ] Load testing completed
- [ ] Stakeholder approval obtained

### Production Ready
- [ ] All environments tested
- [ ] Documentation complete
- [ ] Team trained
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Go/No-Go decision made

---

## Test Results Log

### Development Environment
- **Date Tested**: _____________
- **Tester**: _____________
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _____________

### Staging Environment
- **Date Tested**: _____________
- **Tester**: _____________
- **Result**: ☐ Pass ☐ Fail
- **Notes**: _____________

### Production Deployment
- **Date Deployed**: _____________
- **Deployed By**: _____________
- **Result**: ☐ Success ☐ Rolled Back
- **Notes**: _____________

## Issues Tracker

| Issue # | Description | Severity | Status | Resolution |
|---------|-------------|----------|--------|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

**Note:** This checklist should be completed in order. Do not proceed to production without passing all critical tests in development and staging environments.
