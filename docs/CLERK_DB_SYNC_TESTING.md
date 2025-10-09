# Clerk Database Sync Testing

Comprehensive testing guide for Clerk-to-Supabase user data synchronization.

## Overview

This guide covers testing the synchronization between Clerk (authentication) and Supabase (database) to ensure user data remains consistent across both systems.

---

## 1. Database Schema Verification

### 1.1 Verify Profiles Table Schema

**Check Supabase Schema:**

**Expected Table:** `profiles`

**Required Columns:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX idx_profiles_clerk_id ON profiles(clerk_id);
```

**Verify in Supabase:**
1. Go to Supabase dashboard
2. Navigate to **Table Editor**
3. Find `profiles` table
4. Verify columns exist

**SQL Verification:**
```sql
-- Check table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'profiles'
);

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles';
```

**Expected Output:**
```
column_name  | data_type                    | is_nullable
-------------+------------------------------+------------
id           | uuid                         | NO
clerk_id     | text                         | NO
email        | text                         | NO
full_name    | text                         | YES
avatar_url   | text                         | YES
created_at   | timestamp with time zone     | YES
updated_at   | timestamp with time zone     | YES
deleted_at   | timestamp with time zone     | YES
```

**Checklist:**
- [ ] `profiles` table exists
- [ ] `clerk_id` column (TEXT, UNIQUE, NOT NULL)
- [ ] `email` column (TEXT, NOT NULL)
- [ ] `full_name` column (TEXT, nullable)
- [ ] `avatar_url` column (TEXT, nullable)
- [ ] Timestamps: `created_at`, `updated_at`, `deleted_at`
- [ ] Unique constraint on `clerk_id`
- [ ] Index on `clerk_id`

---

## 2. New User Profile Creation

### Test Case 2.1: Sign-Up Creates Profile

**Objective:** Verify new user sign-up creates Supabase profile

**Pre-conditions:**
- Webhook configured and active
- User does not exist in Clerk or Supabase

**Steps:**
1. Navigate to `/sign-up`
2. Click "Continue with Google"
3. Complete Google OAuth (new account)
4. Redirect to dashboard
5. Wait 2-3 seconds for webhook processing

**Verification in Clerk:**
1. Go to Clerk dashboard > **Users**
2. Find newly created user
3. Note `User ID` (e.g., `user_2abc123def456`)

**Verification in Supabase:**
```sql
-- Query by Clerk ID
SELECT * FROM profiles
WHERE clerk_id = 'user_2abc123def456';
```

**Expected Results:**
- ✓ Profile row exists
- ✓ `clerk_id` matches Clerk User ID
- ✓ `email` matches Google account email
- ✓ `full_name` matches Google account name
- ✓ `avatar_url` contains Google profile image URL
- ✓ `created_at` timestamp present
- ✓ `updated_at` timestamp present
- ✓ `deleted_at` is NULL

**Example Row:**
```
id           | 12345678-1234-1234-1234-123456789012
clerk_id     | user_2abc123def456
email        | john.doe@gmail.com
full_name    | John Doe
avatar_url   | https://img.clerk.com/.../profile.jpg
created_at   | 2025-10-09 10:30:00+00
updated_at   | 2025-10-09 10:30:00+00
deleted_at   | NULL
```

**Checklist:**
- [ ] Profile created within 5 seconds of sign-up
- [ ] All fields populated correctly
- [ ] Email matches Clerk
- [ ] Name matches Clerk
- [ ] Avatar URL valid and accessible
- [ ] No duplicate profiles

---

### Test Case 2.2: Profile Data Matches Clerk Data

**Objective:** Verify 100% data accuracy between Clerk and Supabase

**Steps:**
1. Get user data from Clerk API:
```typescript
import { clerkClient } from '@clerk/nextjs/server';

const user = await clerkClient.users.getUser('user_2abc123def456');
console.log('Clerk Data:', {
  id: user.id,
  email: user.emailAddresses[0]?.emailAddress,
  firstName: user.firstName,
  lastName: user.lastName,
  imageUrl: user.imageUrl,
});
```

2. Get profile from Supabase:
```sql
SELECT clerk_id, email, full_name, avatar_url
FROM profiles
WHERE clerk_id = 'user_2abc123def456';
```

3. Compare all fields

**Expected Results:**
```
Clerk:
- id: user_2abc123def456
- email: john.doe@gmail.com
- firstName: John
- lastName: Doe
- imageUrl: https://img.clerk.com/.../profile.jpg

Supabase:
- clerk_id: user_2abc123def456
- email: john.doe@gmail.com
- full_name: John Doe
- avatar_url: https://img.clerk.com/.../profile.jpg

Match: ✓ 100%
```

**Checklist:**
- [ ] IDs match
- [ ] Emails match exactly
- [ ] Names match (combined first + last)
- [ ] Image URLs match
- [ ] No data loss
- [ ] No data corruption

---

### Test Case 2.3: Handle Missing Optional Fields

**Objective:** Verify sync works with minimal data

**Scenario:** User signs up but has no name or image

**Clerk Data:**
```json
{
  "id": "user_minimal123",
  "emailAddresses": [{"emailAddress": "minimal@test.com"}],
  "firstName": null,
  "lastName": null,
  "imageUrl": null
}
```

**Expected Supabase Profile:**
```
clerk_id     | user_minimal123
email        | minimal@test.com
full_name    | NULL (or empty string)
avatar_url   | NULL
```

**Expected Results:**
- ✓ Profile still created
- ✓ Required fields present (clerk_id, email)
- ✓ Optional fields NULL or empty
- ✓ No errors thrown

---

## 3. User Update Synchronization

### Test Case 3.1: Name Update Syncs

**Objective:** Verify name changes in Clerk sync to Supabase

**Pre-conditions:**
- User exists in both systems
- Initial data in sync

**Steps:**
1. In Clerk dashboard, go to user profile
2. Change first name from "John" to "Johnny"
3. Save
4. Wait 2-3 seconds for webhook
5. Check Supabase

**SQL Verification:**
```sql
SELECT full_name, updated_at
FROM profiles
WHERE clerk_id = 'user_2abc123def456';
```

**Expected Results:**
- ✓ `full_name` updated to "Johnny Doe"
- ✓ `updated_at` timestamp refreshed
- ✓ Other fields unchanged
- ✓ No duplicate rows created

**Checklist:**
- [ ] Name change detected by webhook
- [ ] Supabase profile updated (not inserted)
- [ ] New name matches Clerk
- [ ] Updated timestamp changed
- [ ] Sync completed within 5 seconds

---

### Test Case 3.2: Email Update Syncs

**Objective:** Verify email changes sync correctly

**Steps:**
1. User changes email in Clerk
2. Webhook triggers
3. Supabase email updated

**Expected Results:**
- ✓ Email updated in Supabase
- ✓ Old email replaced
- ✓ No conflicts with existing emails (if unique constraint)

---

### Test Case 3.3: Image URL Update

**Objective:** Verify profile image changes sync

**Steps:**
1. User updates profile picture in Clerk
2. Webhook sends new `imageUrl`
3. Supabase `avatar_url` updated

**SQL Verification:**
```sql
SELECT avatar_url, updated_at
FROM profiles
WHERE clerk_id = 'user_2abc123def456';
```

**Expected Results:**
- ✓ `avatar_url` updated to new URL
- ✓ New image URL is valid
- ✓ Image accessible via URL
- ✓ `updated_at` timestamp refreshed

---

### Test Case 3.4: Multiple Rapid Updates

**Objective:** Verify system handles multiple quick updates

**Steps:**
1. Update user name
2. Immediately update email
3. Immediately update image
4. All within 10 seconds

**Expected Results:**
- ✓ All webhooks received
- ✓ All updates applied
- ✓ Final state matches latest Clerk data
- ✓ No lost updates
- ✓ No conflicting updates

---

## 4. Profile Data Consistency Checks

### Test Case 4.1: Data Integrity Check

**Objective:** Ensure all Clerk users have Supabase profiles

**SQL Query:**
```sql
-- Count profiles
SELECT COUNT(*) as profile_count FROM profiles;
```

**Compare with Clerk:**
```typescript
import { clerkClient } from '@clerk/nextjs/server';

const userList = await clerkClient.users.getUserList();
console.log('Clerk user count:', userList.length);
```

**Expected Results:**
- ✓ Counts match (or Supabase >= Clerk if soft deletes enabled)
- ✓ Every Clerk user has Supabase profile

**Reconciliation Query:**
```sql
-- Find profiles without corresponding Clerk user (orphaned)
-- Manual check in Clerk dashboard required
SELECT clerk_id, email, created_at
FROM profiles
ORDER BY created_at DESC;
```

---

### Test Case 4.2: Check for Duplicate Profiles

**Objective:** Ensure no duplicate profiles exist

**SQL Query:**
```sql
-- Check for duplicate clerk_ids
SELECT clerk_id, COUNT(*) as count
FROM profiles
GROUP BY clerk_id
HAVING COUNT(*) > 1;
```

**Expected Results:**
- ✓ Query returns 0 rows (no duplicates)

**If Duplicates Found:**
```sql
-- Identify duplicates
SELECT * FROM profiles
WHERE clerk_id IN (
  SELECT clerk_id FROM profiles
  GROUP BY clerk_id HAVING COUNT(*) > 1
)
ORDER BY clerk_id, created_at;

-- Keep earliest, remove rest (manual review first!)
```

---

### Test Case 4.3: Data Type Validation

**Objective:** Verify all data types are correct

**SQL Query:**
```sql
-- Check for invalid data
SELECT
  clerk_id,
  email,
  CASE WHEN email NOT LIKE '%@%' THEN 'Invalid email' END as email_issue,
  CASE WHEN full_name = '' THEN 'Empty name' END as name_issue,
  CASE WHEN avatar_url = '' THEN 'Empty avatar URL' END as avatar_issue
FROM profiles
WHERE
  email NOT LIKE '%@%' OR
  full_name = '' OR
  avatar_url = '';
```

**Expected Results:**
- ✓ All emails have @ symbol
- ✓ No empty strings (should be NULL if missing)
- ✓ All clerk_ids start with `user_`

---

## 5. User Deletion Handling

### Test Case 5.1: Soft Delete (Recommended)

**Objective:** Verify user deletion marks profile as deleted

**Pre-conditions:**
- User exists in both systems
- Soft delete implemented in webhook

**Steps:**
1. Delete user in Clerk dashboard
2. Webhook triggers `user.deleted` event
3. Profile updated in Supabase

**Webhook Implementation:**
```typescript
case 'user.deleted':
  await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('clerk_id', data.id);
  break;
```

**SQL Verification:**
```sql
SELECT clerk_id, email, deleted_at
FROM profiles
WHERE clerk_id = 'user_2abc123def456';
```

**Expected Results:**
- ✓ Profile still exists
- ✓ `deleted_at` timestamp set
- ✓ Profile marked as deleted
- ✓ Data retained for compliance

**Checklist:**
- [ ] Profile not physically deleted
- [ ] `deleted_at` timestamp present
- [ ] User cannot sign in (Clerk handles this)
- [ ] Historical data preserved

---

### Test Case 5.2: Hard Delete (Optional)

**Objective:** Verify profile physically removed

**Webhook Implementation:**
```typescript
case 'user.deleted':
  await supabase
    .from('profiles')
    .delete()
    .eq('clerk_id', data.id);
  break;
```

**SQL Verification:**
```sql
SELECT * FROM profiles WHERE clerk_id = 'user_2abc123def456';
-- Should return 0 rows
```

**Expected Results:**
- ✓ Profile row deleted
- ✓ No trace of user in database
- ✓ Related data cleaned up (cascade or manual)

---

### Test Case 5.3: Check for Orphaned Data

**Objective:** Ensure no orphaned user data remains

**SQL Query:**
```sql
-- If you have related tables (subscriptions, etc.)
SELECT * FROM subscriptions
WHERE user_id NOT IN (SELECT clerk_id FROM profiles);
```

**Expected Results:**
- ✓ No orphaned subscriptions
- ✓ No orphaned user data
- ✓ All foreign keys valid

---

## 6. Real-Time Sync Testing

### Test Case 6.1: Measure Sync Latency

**Objective:** Measure time from Clerk event to Supabase update

**Steps:**
1. Note current time
2. Create user in Clerk
3. Wait for webhook
4. Check Supabase `created_at` timestamp
5. Calculate latency

**Benchmark:**
```
User created in Clerk: 10:30:00.000
Webhook received:       10:30:00.500 (500ms)
Supabase insert:        10:30:00.750 (750ms)

Total latency: 750ms ✓ Excellent
```

**Acceptable Latency:**
- < 1 second: Excellent
- 1-3 seconds: Good
- 3-5 seconds: Acceptable
- > 5 seconds: Investigate delays

---

### Test Case 6.2: Concurrent User Creation

**Objective:** Test system under concurrent load

**Simulate:**
```bash
# Create multiple users simultaneously
for i in {1..10}; do
  (clerk users create --email "test$i@example.com" &)
done
wait
```

**Expected Results:**
- ✓ All 10 profiles created
- ✓ No duplicates
- ✓ All data accurate
- ✓ No race conditions

---

## 7. Data Migration and Backfill

### Test Case 7.1: Backfill Existing Users

**Objective:** Sync existing Clerk users to Supabase

**Scenario:** You just set up webhooks, but users already exist

**Script:** `/Users/tannerosterkamp/vortis/scripts/backfill-profiles.ts`

```typescript
import { clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function backfillProfiles() {
  console.log('Fetching all Clerk users...');

  const users = await clerkClient.users.getUserList({ limit: 500 });
  console.log(`Found ${users.length} users`);

  for (const user of users) {
    const profile = {
      clerk_id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      full_name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      avatar_url: user.imageUrl,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'clerk_id' });

    if (error) {
      console.error(`Failed to sync ${user.id}:`, error);
    } else {
      console.log(`✓ Synced ${profile.email}`);
    }
  }

  console.log('Backfill complete');
}

backfillProfiles();
```

**Run:**
```bash
cd /Users/tannerosterkamp/vortis
npx tsx scripts/backfill-profiles.ts
```

**Expected Output:**
```
Fetching all Clerk users...
Found 25 users
✓ Synced user1@example.com
✓ Synced user2@example.com
...
✓ Synced user25@example.com
Backfill complete
```

**Verification:**
```sql
SELECT COUNT(*) FROM profiles;
-- Should match Clerk user count
```

---

## 8. Error Recovery Testing

### Test Case 8.1: Webhook Fails, Then Retries

**Objective:** Verify sync recovers from temporary failures

**Simulate:**
1. Stop Supabase connection (or pause webhook endpoint)
2. Create user in Clerk
3. Webhook fails
4. Restore connection
5. Clerk retries webhook

**Expected Results:**
- ✓ Initial webhook fails
- ✓ User exists in Clerk, not in Supabase
- ✓ Clerk retries automatically
- ✓ Retry succeeds
- ✓ Profile created in Supabase
- ✓ Data accurate despite delay

---

### Test Case 8.2: Manual Sync for Failed Webhooks

**Objective:** Manually sync users when webhooks failed

**Identify Missing Profiles:**
```typescript
// Get all Clerk user IDs
const clerkUsers = await clerkClient.users.getUserList();
const clerkIds = clerkUsers.map(u => u.id);

// Get all Supabase profiles
const { data: profiles } = await supabase
  .from('profiles')
  .select('clerk_id');
const supabaseIds = profiles?.map(p => p.clerk_id) || [];

// Find missing
const missing = clerkIds.filter(id => !supabaseIds.includes(id));
console.log('Missing profiles:', missing);

// Manually sync missing users
for (const userId of missing) {
  const user = await clerkClient.users.getUser(userId);
  // Create profile...
}
```

---

## 9. Database Sync Test Checklist

**Before marking database sync testing complete:**

### Schema
- [ ] `profiles` table exists
- [ ] All required columns present
- [ ] Unique constraint on `clerk_id`
- [ ] Indexes configured
- [ ] Timestamps working (created_at, updated_at)

### Profile Creation
- [ ] New sign-up creates profile
- [ ] All fields populated correctly
- [ ] Sync completes < 3 seconds
- [ ] No duplicates created

### Profile Updates
- [ ] Name changes sync
- [ ] Email changes sync
- [ ] Image changes sync
- [ ] Multiple updates handled
- [ ] Update timestamp refreshes

### Data Integrity
- [ ] No duplicate profiles
- [ ] All Clerk users have profiles
- [ ] All data types valid
- [ ] Email formats valid
- [ ] No orphaned data

### Deletion
- [ ] User deletion handled (soft or hard)
- [ ] Related data cleaned up
- [ ] No orphaned records
- [ ] Deletion logged

### Performance
- [ ] Sync latency < 3 seconds
- [ ] Concurrent creates work
- [ ] No race conditions
- [ ] Backfill script works

### Error Handling
- [ ] Failed webhooks retry
- [ ] Missing profiles can be backfilled
- [ ] Invalid data rejected
- [ ] Errors logged

---

## 10. Next Steps

After completing database sync testing:

1. **Integration Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_INTEGRATION_TESTING.md`

2. **Performance Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_PERFORMANCE_TESTING.md`

3. **Security Testing**
   - See: `/Users/tannerosterkamp/vortis/docs/CLERK_SECURITY_TESTING.md`
