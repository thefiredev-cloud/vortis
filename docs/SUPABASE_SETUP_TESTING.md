# Supabase Setup Testing Guide

Complete guide to verifying your Supabase authentication setup for Vortis.

## Prerequisites

- Supabase account and project created
- Access to Supabase dashboard
- Local development environment configured

## 1. Dashboard Configuration Verification

### 1.1 Verify Project Settings

**Steps:**
1. Navigate to https://supabase.com/dashboard
2. Select your Vortis project
3. Go to **Settings > API**

**Expected Results:**
- Project URL visible (format: `https://[project-id].supabase.co`)
- Anon/Public key visible (starts with `eyJ...`)
- Service Role key visible (starts with `eyJ...`)

**Test Checklist:**
- [ ] Project URL matches format
- [ ] Anon key is valid JWT
- [ ] Service role key is different from anon key
- [ ] Keys are not placeholder values

---

### 1.2 Verify Authentication Settings

**Steps:**
1. Go to **Authentication > Providers**
2. Locate **Google** provider

**Expected Results:**
- Google provider is enabled
- Client ID configured
- Client Secret configured
- Authorized redirect URLs include your callback URL

**Test Checklist:**
- [ ] Google OAuth enabled
- [ ] Client ID present (format: `*.apps.googleusercontent.com`)
- [ ] Client Secret configured (not visible)
- [ ] Redirect URL: `https://[project-id].supabase.co/auth/v1/callback`

---

### 1.3 Verify Email Templates

**Steps:**
1. Go to **Authentication > Email Templates**
2. Review templates for:
   - Confirm signup
   - Reset password
   - Magic Link

**Expected Results:**
- Templates use your brand/domain
- Redirect URLs point to correct environment
- Templates are enabled

**Test Checklist:**
- [ ] Confirm signup template active
- [ ] Reset password template active
- [ ] Redirect URLs correct for environment
- [ ] Email sender configured

---

## 2. Environment Variables Validation

### 2.1 Check Local Environment

**Test File:** `/Users/tannerosterkamp/vortis/.env.local`

**Steps:**
```bash
# Verify file exists
ls -la /Users/tannerosterkamp/vortis/.env.local

# Check for required variables (without exposing values)
grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && echo "URL: OK" || echo "URL: MISSING"
grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local && echo "ANON_KEY: OK" || echo "ANON_KEY: MISSING"
```

**Expected Results:**
```
URL: OK
ANON_KEY: OK
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key

**Test Checklist:**
- [ ] `.env.local` file exists
- [ ] Variables are not placeholder values
- [ ] URL format: `https://[project-id].supabase.co`
- [ ] Anon key starts with `eyJ`
- [ ] No trailing spaces or quotes

---

### 2.2 Verify Environment Loading

**Create Test File:** `/Users/tannerosterkamp/vortis/scripts/test-env.ts`

```typescript
// Test environment variable loading
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment Variables Test:');
console.log('- URL Present:', !!url);
console.log('- URL Format:', url?.startsWith('https://'));
console.log('- Key Present:', !!key);
console.log('- Key Format:', key?.startsWith('eyJ'));

if (!url || !key) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

if (url === 'your_supabase_url' || key === 'your_supabase_anon_key') {
  console.error('❌ Placeholder values detected');
  process.exit(1);
}

console.log('✅ Environment variables configured correctly');
```

**Run Test:**
```bash
cd /Users/tannerosterkamp/vortis
npx tsx scripts/test-env.ts
```

**Expected Output:**
```
Environment Variables Test:
- URL Present: true
- URL Format: true
- Key Present: true
- Key Format: true
✅ Environment variables configured correctly
```

---

## 3. Google OAuth Configuration

### 3.1 Verify Google Cloud Console

**Steps:**
1. Go to https://console.cloud.google.com
2. Select your project
3. Navigate to **APIs & Services > Credentials**
4. Locate OAuth 2.0 Client ID

**Expected Results:**
- OAuth 2.0 Client ID exists
- Type: Web application
- Authorized JavaScript origins configured
- Authorized redirect URIs configured

**Test Checklist:**
- [ ] Client ID created
- [ ] Authorized origins: `http://localhost:3000` (dev)
- [ ] Authorized origins: `https://yourdomain.com` (prod)
- [ ] Redirect URI: `https://[project-id].supabase.co/auth/v1/callback`

---

### 3.2 Link Google OAuth to Supabase

**Steps:**
1. Copy Client ID from Google Cloud Console
2. Copy Client Secret from Google Cloud Console
3. Go to Supabase Dashboard > **Authentication > Providers > Google**
4. Paste Client ID
5. Paste Client Secret
6. Enable provider
7. Save

**Expected Results:**
- Green checkmark on Google provider
- Provider shows as "Enabled"

**Test Checklist:**
- [ ] Client ID matches Google Console
- [ ] Client Secret configured
- [ ] Provider enabled
- [ ] No error messages

---

## 4. Development Keys vs Production Keys

### 4.1 Environment Separation

**Development Environment:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[dev-key]...
```

**Production Environment:**
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[prod-key]...
```

**Test Checklist:**
- [ ] Separate Supabase projects for dev/prod
- [ ] Different anon keys for each environment
- [ ] Correct Google OAuth credentials per environment
- [ ] Environment-specific redirect URLs

---

### 4.2 Verify Current Environment

**Steps:**
```bash
# Check which environment is loaded
cd /Users/tannerosterkamp/vortis
npm run dev
```

**In Browser:**
1. Open DevTools > Console
2. Run:
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

**Expected Results:**
- Development: Shows dev project URL
- Production: Shows prod project URL

---

## 5. Test User Creation

### 5.1 Create Test User in Supabase

**Method 1: Supabase Dashboard**

**Steps:**
1. Go to **Authentication > Users**
2. Click **Add User**
3. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Auto Confirm: Yes
4. Click **Create User**

**Expected Results:**
- User appears in user list
- Email confirmed automatically
- User ID (UUID) generated

**Test Checklist:**
- [ ] User created successfully
- [ ] Email shows as confirmed
- [ ] User ID is valid UUID
- [ ] Created timestamp present

---

### 5.2 Verify User in Database

**Steps:**
1. Go to **Table Editor > auth.users**
2. Find test user

**Expected Results:**
- User row exists
- `email` matches
- `email_confirmed_at` is not null
- `raw_user_meta_data` contains user info

**SQL Verification:**
```sql
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'test@example.com';
```

---

### 5.3 Test User Login (Manual)

**Steps:**
1. Start development server: `npm run dev`
2. Navigate to http://localhost:3000/auth/login
3. Use test credentials
4. Verify redirect to dashboard

**Expected Results:**
- Login successful
- Redirect to `/dashboard`
- User session created

---

## 6. Connection Testing

### 6.1 Test Supabase Client Connection

**Create Test File:** `/Users/tannerosterkamp/vortis/scripts/test-connection.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Test 1: Check health
    const { data, error } = await supabase
      .from('_test_table')
      .select('*')
      .limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('✅ Connection successful (expected error)');
    } else if (!error) {
      console.log('✅ Connection successful');
    } else {
      throw error;
    }

    // Test 2: Check auth
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('✅ Auth endpoint accessible');
    console.log('   Session:', sessionData.session ? 'Active' : 'None');

    console.log('\n✅ All connection tests passed');
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    process.exit(1);
  }
}

testConnection();
```

**Run Test:**
```bash
cd /Users/tannerosterkamp/vortis
npx tsx scripts/test-connection.ts
```

**Expected Output:**
```
Testing Supabase connection...
✅ Connection successful (expected error)
✅ Auth endpoint accessible
   Session: None

✅ All connection tests passed
```

---

## 7. Troubleshooting Common Issues

### Issue: "Invalid API key"

**Symptoms:**
- Auth requests fail
- Error: "Invalid API key"

**Solution:**
1. Verify anon key in `.env.local`
2. Copy fresh key from Supabase dashboard
3. Restart dev server
4. Clear browser cache

---

### Issue: "Project not found"

**Symptoms:**
- 404 errors on auth requests
- Connection fails

**Solution:**
1. Verify project URL format
2. Check project is not paused in Supabase
3. Verify project ID in URL matches dashboard

---

### Issue: Google OAuth not available

**Symptoms:**
- Google provider disabled
- OAuth flow fails

**Solution:**
1. Enable Google provider in Supabase dashboard
2. Add Google OAuth credentials
3. Verify redirect URLs match
4. Check Google Cloud Console quotas

---

## 8. Setup Verification Checklist

**Before Moving to Next Steps:**

### Supabase Dashboard
- [ ] Project created and active
- [ ] API credentials obtained
- [ ] Google OAuth provider enabled
- [ ] Redirect URLs configured

### Environment Configuration
- [ ] `.env.local` file created
- [ ] All required variables set
- [ ] No placeholder values
- [ ] Variables load correctly

### Google OAuth
- [ ] OAuth Client ID created
- [ ] Client Secret obtained
- [ ] Authorized origins configured
- [ ] Redirect URIs configured
- [ ] Credentials linked to Supabase

### Connection Tests
- [ ] Supabase client connects
- [ ] Auth endpoint accessible
- [ ] No connection errors
- [ ] Test user created

### Documentation
- [ ] Setup steps documented
- [ ] Credentials stored securely
- [ ] Team has access to dashboard
- [ ] Environment variables shared (securely)

---

## 9. Next Steps

After completing setup testing:
1. Proceed to [Authentication Flow Testing](/Users/tannerosterkamp/vortis/docs/SUPABASE_AUTH_TESTING.md)
2. Review [Webhook Testing](/Users/tannerosterkamp/vortis/docs/SUPABASE_WEBHOOK_TESTING.md)
3. Complete [Integration Testing](/Users/tannerosterkamp/vortis/docs/SUPABASE_INTEGRATION_TESTING.md)

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs/guides/auth
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2
- **Next.js + Supabase:** https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- **Troubleshooting:** `/docs/SUPABASE_TROUBLESHOOTING.md`
