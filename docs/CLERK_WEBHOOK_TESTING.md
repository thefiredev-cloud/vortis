# Clerk Webhook Testing Guide

Complete guide to testing Clerk webhooks for user synchronization with Supabase.

## Overview

Clerk webhooks notify your application when user events occur:
- `user.created` - New user signs up
- `user.updated` - User updates profile
- `user.deleted` - User deletes account

These webhooks sync user data from Clerk to Supabase database.

---

## 1. Webhook Endpoint Setup

### 1.1 Verify Webhook Route Exists

**File:** Check for `/Users/tannerosterkamp/vortis/app/api/webhooks/clerk/route.ts`

**Expected Structure:**
```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  // Get webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify headers
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Handle events
  const { type, data } = evt;

  switch (type) {
    case 'user.created':
      await handleUserCreated(data);
      break;
    case 'user.updated':
      await handleUserUpdated(data);
      break;
    case 'user.deleted':
      await handleUserDeleted(data);
      break;
  }

  return new Response('Webhook received', { status: 200 });
}
```

**Checklist:**
- [ ] Webhook route file exists
- [ ] Imports svix for signature verification
- [ ] Handles POST requests
- [ ] Verifies webhook signature
- [ ] Handles user.created event
- [ ] Handles user.updated event
- [ ] Handles user.deleted event

---

## 2. Local Webhook Testing with Clerk CLI

### 2.1 Install and Configure Clerk CLI

**Install:**
```bash
cd /Users/tannerosterkamp/vortis
npm install -g @clerk/clerk-cli

# Or use via npx (no install needed)
npx @clerk/clerk-cli --version
```

**Verify Installation:**
```bash
clerk --version
# Should show version number
```

---

### 2.2 Start Local Webhook Forwarding

**Method 1: Clerk CLI (Recommended)**

**Steps:**
```bash
cd /Users/tannerosterkamp/vortis

# Start dev server in one terminal
npm run dev

# In another terminal, start Clerk tunnel
npx @clerk/clerk-cli dev
# Or if script exists in package.json:
npm run clerk:dev
```

**Expected Output:**
```
✓ Clerk development mode started
✓ Forwarding webhooks to: http://localhost:3000/api/webhooks/clerk
✓ Dashboard: https://dashboard.clerk.com/apps/[your-app-id]
```

**Checklist:**
- [ ] Clerk CLI installed
- [ ] Dev server running (port 3000)
- [ ] Clerk dev mode started
- [ ] Webhook forwarding active
- [ ] No connection errors

---

### 2.3 Test Webhook with Clerk CLI

**Trigger Test Webhook:**
```bash
# In Clerk dashboard, go to Webhooks
# Click your webhook endpoint
# Click "Send test event"
# Select event type (user.created)
# Send
```

**Monitor in Terminal:**
```
# Your dev server terminal should show:
POST /api/webhooks/clerk 200 in 45ms
```

**Check Application Logs:**
```bash
# If you added console.log in webhook handler:
# Should see:
Webhook received: user.created
User ID: user_123abc
Email: test@example.com
```

---

## 3. Ngrok/Cloudflare Tunnel Setup

### 3.1 Using Ngrok (Alternative Method)

**Install Ngrok:**
```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com
```

**Start Ngrok Tunnel:**
```bash
cd /Users/tannerosterkamp/vortis
npm run dev

# In another terminal:
ngrok http 3000
```

**Expected Output:**
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Configure in Clerk:**
1. Copy ngrok URL
2. Go to Clerk dashboard > Webhooks
3. Update endpoint URL: `https://abc123.ngrok.io/api/webhooks/clerk`
4. Save

**Checklist:**
- [ ] Ngrok installed
- [ ] Tunnel started
- [ ] HTTPS URL obtained
- [ ] Webhook endpoint updated in Clerk
- [ ] Endpoint shows as active

---

### 3.2 Using Cloudflare Tunnel (Alternative)

**Install Cloudflared:**
```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Or download from Cloudflare
```

**Start Tunnel:**
```bash
cloudflared tunnel --url http://localhost:3000
```

**Expected Output:**
```
Your quick Tunnel has been created:
https://xyz789.trycloudflare.com
```

**Configure in Clerk:**
1. Copy Cloudflare URL
2. Update Clerk webhook endpoint
3. Use: `https://xyz789.trycloudflare.com/api/webhooks/clerk`

---

## 4. Webhook Signature Verification

### Test Case 4.1: Valid Signature

**Objective:** Verify webhook with correct signature is accepted

**Steps:**
1. Trigger webhook from Clerk dashboard
2. Webhook handler receives request
3. Signature verification runs
4. Handler processes event

**Expected Results:**
- ✓ Signature verification passes
- ✓ Returns 200 OK
- ✓ Event processed
- ✓ Database updated (if applicable)

**Test Code:**
```typescript
// In webhook handler
try {
  const evt = wh.verify(body, {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  }) as WebhookEvent;
  console.log('✓ Signature verified');
} catch (err) {
  console.error('✗ Signature verification failed:', err);
}
```

---

### Test Case 4.2: Invalid Signature

**Objective:** Verify webhook with bad signature is rejected

**Steps:**
1. Send webhook with tampered signature
2. Observe rejection

**Test with curl:**
```bash
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_123" \
  -H "svix-timestamp: 1234567890" \
  -H "svix-signature: invalid_signature" \
  -d '{"type": "user.created", "data": {}}'
```

**Expected Results:**
- ✓ Returns 400 Bad Request
- ✓ Error: "Webhook verification failed"
- ✓ Event not processed
- ✓ Database not modified

---

### Test Case 4.3: Missing Headers

**Objective:** Verify missing svix headers are rejected

**Test:**
```bash
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"type": "user.created", "data": {}}'
```

**Expected Results:**
- ✓ Returns 400 Bad Request
- ✓ Error: "Missing svix headers"
- ✓ Event not processed

---

## 5. user.created Event Handling

### Test Case 5.1: New User Webhook

**Objective:** Verify user.created webhook creates Supabase profile

**Pre-conditions:**
- Webhook endpoint configured
- Supabase connection working
- User does not exist in Supabase

**Steps:**
1. Create new user in Clerk (via Google OAuth or dashboard)
2. Clerk sends `user.created` webhook
3. Webhook handler receives event
4. Handler creates profile in Supabase

**Webhook Payload Example:**
```json
{
  "type": "user.created",
  "data": {
    "id": "user_2abc123def456",
    "email_addresses": [
      {
        "email_address": "newuser@example.com",
        "id": "email_123"
      }
    ],
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://img.clerk.com/...",
    "created_at": 1234567890000,
    "updated_at": 1234567890000
  }
}
```

**Expected Results:**
- ✓ Webhook received (status 200)
- ✓ Signature verified
- ✓ User profile created in Supabase `profiles` table
- ✓ Profile data matches Clerk data:
  - `clerk_id` = `data.id`
  - `email` = `data.email_addresses[0].email_address`
  - `full_name` = `${data.first_name} ${data.last_name}`
  - `avatar_url` = `data.image_url`

**Verification SQL:**
```sql
SELECT * FROM profiles WHERE clerk_id = 'user_2abc123def456';
```

**Expected Row:**
```
clerk_id              | email                  | full_name | avatar_url
user_2abc123def456    | newuser@example.com    | John Doe  | https://...
```

**Checklist:**
- [ ] Webhook received
- [ ] Profile created in Supabase
- [ ] Email correct
- [ ] Name correct
- [ ] Avatar URL correct
- [ ] Timestamps set
- [ ] No duplicate profiles

---

### Test Case 5.2: Handle Missing Profile Data

**Objective:** Verify graceful handling of missing optional fields

**Webhook with Missing Fields:**
```json
{
  "type": "user.created",
  "data": {
    "id": "user_abc123",
    "email_addresses": [
      {
        "email_address": "minimal@example.com"
      }
    ],
    "first_name": null,
    "last_name": null,
    "image_url": null
  }
}
```

**Expected Results:**
- ✓ Profile still created
- ✓ `full_name` = null or empty
- ✓ `avatar_url` = null
- ✓ No errors thrown

---

## 6. user.updated Event Handling

### Test Case 6.1: User Profile Update Webhook

**Objective:** Verify user.updated webhook syncs changes to Supabase

**Pre-conditions:**
- User exists in both Clerk and Supabase
- Profile data currently in sync

**Steps:**
1. Update user in Clerk dashboard:
   - Change first name from "John" to "Johnny"
   - Update profile image
2. Clerk sends `user.updated` webhook
3. Webhook handler updates Supabase profile

**Webhook Payload:**
```json
{
  "type": "user.updated",
  "data": {
    "id": "user_2abc123def456",
    "email_addresses": [
      {
        "email_address": "newuser@example.com"
      }
    ],
    "first_name": "Johnny",
    "last_name": "Doe",
    "image_url": "https://img.clerk.com/.../new-image.jpg",
    "updated_at": 1234567999000
  }
}
```

**Expected Results:**
- ✓ Webhook received (status 200)
- ✓ Supabase profile updated
- ✓ `full_name` now "Johnny Doe"
- ✓ `avatar_url` updated to new image
- ✓ `updated_at` timestamp updated

**Verification SQL:**
```sql
SELECT full_name, avatar_url, updated_at
FROM profiles
WHERE clerk_id = 'user_2abc123def456';
```

**Checklist:**
- [ ] Webhook received
- [ ] Profile updated (not duplicated)
- [ ] Name changes synced
- [ ] Image URL updated
- [ ] Timestamp updated
- [ ] No errors

---

### Test Case 6.2: Email Update

**Objective:** Verify email changes sync to Supabase

**Steps:**
1. User changes email in Clerk
2. Webhook sent with new email
3. Supabase profile email updated

**Expected Results:**
- ✓ Email updated in Supabase
- ✓ Old email replaced
- ✓ No duplicate profiles

---

## 7. user.deleted Event Handling

### Test Case 7.1: User Deletion Webhook

**Objective:** Verify user.deleted webhook removes/marks user in Supabase

**Pre-conditions:**
- User exists in both Clerk and Supabase

**Steps:**
1. Delete user in Clerk dashboard
2. Clerk sends `user.deleted` webhook
3. Webhook handler processes deletion

**Webhook Payload:**
```json
{
  "type": "user.deleted",
  "data": {
    "id": "user_2abc123def456",
    "deleted": true
  }
}
```

**Expected Results (Option 1: Soft Delete):**
- ✓ Webhook received
- ✓ Profile marked as deleted (`deleted_at` timestamp set)
- ✓ Profile not physically removed
- ✓ User data retained for compliance

**Expected Results (Option 2: Hard Delete):**
- ✓ Webhook received
- ✓ Profile physically deleted from database
- ✓ All related user data removed

**Verification SQL (Soft Delete):**
```sql
SELECT deleted_at FROM profiles WHERE clerk_id = 'user_2abc123def456';
-- Should return timestamp, not null
```

**Verification SQL (Hard Delete):**
```sql
SELECT * FROM profiles WHERE clerk_id = 'user_2abc123def456';
-- Should return 0 rows
```

**Checklist:**
- [ ] Webhook received
- [ ] User handled appropriately (soft or hard delete)
- [ ] Related data cleaned up
- [ ] No orphaned records
- [ ] Deletion logged

---

## 8. Error Scenarios

### Test Case 8.1: Database Connection Failure

**Objective:** Verify webhook handles database errors gracefully

**Simulate:**
```typescript
// Temporarily break Supabase connection
// Or disconnect from network
```

**Expected Results:**
- ✓ Webhook returns 500 error
- ✓ Clerk retries webhook (automatic)
- ✓ Error logged
- ✓ No data corruption

**Clerk Retry Behavior:**
- Clerk automatically retries failed webhooks
- Exponential backoff
- Up to 10 attempts
- Manual retry option in dashboard

---

### Test Case 8.2: Invalid Webhook Data

**Objective:** Verify handler validates webhook data

**Test Payload with Missing Required Fields:**
```json
{
  "type": "user.created",
  "data": {
    "id": null,
    "email_addresses": []
  }
}
```

**Expected Results:**
- ✓ Validation error caught
- ✓ Returns 400 Bad Request
- ✓ No database write attempted
- ✓ Error logged with details

---

### Test Case 8.3: Duplicate Webhook Delivery

**Objective:** Verify idempotent webhook handling

**Scenario:**
- Same webhook delivered twice (Clerk retry)
- Should not create duplicate profiles

**Expected Results:**
- ✓ First webhook: Creates profile
- ✓ Second webhook: Updates existing profile (or skips)
- ✓ No duplicate profiles created
- ✓ Both webhooks return 200

**Implementation:**
```typescript
// Use upsert instead of insert
await supabase
  .from('profiles')
  .upsert({
    clerk_id: data.id,
    email: data.email_addresses[0].email_address,
    // ... other fields
  }, {
    onConflict: 'clerk_id' // Unique constraint
  });
```

---

## 9. Retry Logic Testing

### Test Case 9.1: Clerk Automatic Retry

**Objective:** Verify Clerk retries failed webhooks

**Steps:**
1. Temporarily stop dev server (simulate downtime)
2. Create user in Clerk
3. Webhook delivery fails
4. Restart dev server
5. Clerk retries webhook

**Expected Results:**
- ✓ Initial delivery fails (server down)
- ✓ Clerk marks webhook as failed in dashboard
- ✓ Clerk retries after delay
- ✓ Retry succeeds when server is back
- ✓ Profile created

**Monitor in Clerk Dashboard:**
- Go to **Webhooks > [Your Endpoint]**
- See failed attempts
- See successful retry

---

### Test Case 9.2: Manual Retry from Dashboard

**Objective:** Test manual webhook retry

**Steps:**
1. Find failed webhook in Clerk dashboard
2. Click failed attempt
3. Click "Resend"
4. Monitor application

**Expected Results:**
- ✓ Webhook resent
- ✓ Received by application
- ✓ Processed successfully
- ✓ Dashboard shows success

---

## 10. Webhook Monitoring and Debugging

### 10.1 Add Logging to Webhook Handler

**Enhanced Webhook Logging:**
```typescript
export async function POST(req: Request) {
  console.log('=== Webhook Received ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // ... signature verification ...

    const { type, data } = evt;
    console.log('Event Type:', type);
    console.log('User ID:', data.id);

    switch (type) {
      case 'user.created':
        console.log('Creating profile for:', data.email_addresses[0]?.email_address);
        await handleUserCreated(data);
        console.log('✓ Profile created');
        break;
      // ... other cases ...
    }

    console.log('=== Webhook Processed Successfully ===');
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('=== Webhook Error ===');
    console.error(err);
    return new Response('Error', { status: 500 });
  }
}
```

---

### 10.2 Webhook Testing Checklist

**Before marking webhook testing complete:**

### Setup
- [ ] Webhook route implemented
- [ ] Svix package installed
- [ ] Webhook secret configured
- [ ] Endpoint registered in Clerk dashboard
- [ ] Signature verification working

### Event Handling
- [ ] user.created creates Supabase profile
- [ ] user.updated syncs changes to Supabase
- [ ] user.deleted handles deletion appropriately
- [ ] All required fields mapped correctly
- [ ] Optional fields handled gracefully

### Security
- [ ] Signature verification enforced
- [ ] Invalid signatures rejected
- [ ] Missing headers rejected
- [ ] Webhook secret not exposed

### Reliability
- [ ] Database errors handled
- [ ] Invalid data validated
- [ ] Idempotent processing (no duplicates)
- [ ] Clerk retries work
- [ ] Manual retry works

### Monitoring
- [ ] Logging implemented
- [ ] Errors captured
- [ ] Success/failure tracked
- [ ] Dashboard shows webhook status

---

## 11. Production Webhook Setup

### 11.1 Configure Production Endpoint

**Steps:**
1. Deploy application to production
2. Get production URL
3. In Clerk dashboard, add production webhook:
   - URL: `https://yourdomain.com/api/webhooks/clerk`
   - Events: user.created, user.updated, user.deleted
4. Copy production webhook secret
5. Add to production environment variables

**Environment Variables:**
```bash
# Production
CLERK_WEBHOOK_SECRET=whsec_live_...
```

---

### 11.2 Test Production Webhooks

**Steps:**
1. Create test user in production Clerk instance
2. Monitor webhook delivery in Clerk dashboard
3. Verify profile created in production Supabase
4. Check application logs

**Checklist:**
- [ ] Production webhook endpoint active
- [ ] HTTPS enabled
- [ ] Webhook secret configured
- [ ] Test event succeeds
- [ ] Real user creation works
- [ ] Monitoring in place

---

## Next Steps

After completing webhook testing:

1. **Database Sync Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_DB_SYNC_TESTING.md`

2. **Integration Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_INTEGRATION_TESTING.md`

3. **Performance Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_PERFORMANCE_TESTING.md`
