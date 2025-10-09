# Clerk Authentication Tests

Automated test suite for Clerk authentication integration in Vortis.

## Test Structure

```
tests/clerk/
├── README.md              # This file
├── auth.test.ts          # Authentication flow tests
├── webhook.test.ts       # Webhook signature and event tests
└── integration.test.ts   # End-to-end integration tests
```

## Running Tests

### Prerequisites

```bash
cd /Users/tannerosterkamp/vortis

# Install testing dependencies
npm install -D jest @jest/globals @types/jest
npm install -D @playwright/test  # For E2E tests

# Install Clerk packages
npm install @clerk/nextjs svix
```

### Run All Tests

```bash
# Run all Clerk tests
npm test tests/clerk/

# Run specific test file
npm test tests/clerk/auth.test.ts
npm test tests/clerk/webhook.test.ts
npm test tests/clerk/integration.test.ts
```

### Run with Watch Mode

```bash
npm test -- --watch tests/clerk/
```

### Run E2E Tests (Playwright)

```bash
npx playwright test
```

## Test Categories

### 1. Authentication Tests (`auth.test.ts`)

Tests for user authentication flows:
- Sign-up with Google OAuth
- Sign-in for existing users
- Sign-out and session cleanup
- Protected route access
- API route authentication

**Key Tests:**
- Redirect to sign-in when unauthenticated
- Allow access to public routes
- Create profile on sign-up
- Restore session on sign-in
- Clear session on sign-out
- Block unauthenticated API requests

### 2. Webhook Tests (`webhook.test.ts`)

Tests for Clerk webhook handling:
- Signature verification
- Event processing (user.created, user.updated, user.deleted)
- Error handling
- Performance

**Key Tests:**
- Verify valid signatures
- Reject invalid signatures
- Create profile on user.created
- Update profile on user.updated
- Handle user deletion
- Process webhooks quickly (< 500ms)

### 3. Integration Tests (`integration.test.ts`)

End-to-end integration tests:
- Complete user journeys
- Clerk + Stripe integration
- Clerk + Stock Analysis
- Data consistency
- Session management

**Key Tests:**
- New user sign-up to first analysis
- Subscription creation and sync
- Rate limiting per user tier
- Cross-feature data consistency

## Test Configuration

### Jest Configuration

Create `jest.config.js` in project root:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
};
```

### Test Setup File

Create `tests/setup.ts`:

```typescript
// Load environment variables for tests
import { config } from 'dotenv';
config({ path: '.env.local' });

// Mock Clerk if needed
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
  clerkClient: {
    users: {
      getUserList: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

// Global test utilities
global.testUtils = {
  // Add shared test helpers here
};
```

### Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Mocking Strategies

### Mocking Clerk Auth

```typescript
import { auth } from '@clerk/nextjs/server';

// Mock authenticated user
(auth as jest.Mock).mockResolvedValue({
  userId: 'user_test_123',
  sessionId: 'session_test_123',
});

// Mock unauthenticated
(auth as jest.Mock).mockResolvedValue({
  userId: null,
  sessionId: null,
});
```

### Mocking Webhooks

```typescript
import { Webhook } from 'svix';

const mockWebhook = {
  type: 'user.created',
  data: {
    id: 'user_test_123',
    email_addresses: [{ email_address: 'test@example.com' }],
    first_name: 'Test',
    last_name: 'User',
  },
};
```

### Mocking Supabase

```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}));
```

## Writing New Tests

### Test Structure

```typescript
describe('Feature Name', () => {
  // Setup
  beforeAll(async () => {
    // Run once before all tests
  });

  beforeEach(async () => {
    // Run before each test
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  afterAll(async () => {
    // Run once after all tests
  });

  describe('Sub-feature', () => {
    it('should do something specific', async () => {
      // Arrange: Set up test conditions
      const input = 'test';

      // Act: Execute the code being tested
      const result = await functionUnderTest(input);

      // Assert: Verify the result
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices

1. **Arrange-Act-Assert Pattern**
   - Arrange: Set up test data and conditions
   - Act: Execute the function/code being tested
   - Assert: Verify the results

2. **Test Names Should Be Descriptive**
   ```typescript
   // Good
   it('should create profile when user signs up with Google OAuth')

   // Bad
   it('test profile creation')
   ```

3. **One Assertion Per Test (Generally)**
   ```typescript
   // Prefer this
   it('should create profile with correct email', ...)
   it('should create profile with correct name', ...)

   // Over this
   it('should create profile with all data', ...) // Tests 10 things
   ```

4. **Clean Up After Tests**
   ```typescript
   afterEach(async () => {
     // Delete test data
     // Reset mocks
     // Close connections
   });
   ```

5. **Use Meaningful Test Data**
   ```typescript
   // Good
   const testUser = {
     email: 'john.doe@example.com',
     name: 'John Doe',
   };

   // Bad
   const testUser = {
     email: 'a@b.c',
     name: 'x',
   };
   ```

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}

      - name: Run E2E tests
        run: npx playwright test
```

## Test Coverage

### Generate Coverage Report

```bash
npm test -- --coverage
```

### Coverage Goals

- **Overall:** > 80%
- **Authentication Logic:** > 90%
- **Webhook Handlers:** > 90%
- **API Routes:** > 85%

## Troubleshooting Tests

### Tests Failing Locally

1. **Check Environment Variables**
   ```bash
   # Verify .env.local exists and has correct values
   cat .env.local | grep CLERK
   ```

2. **Clear Node Modules and Reinstall**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check Test Database**
   - Ensure test Supabase project is accessible
   - Check RLS policies aren't blocking inserts

### Tests Passing Locally, Failing in CI

1. **Environment Variables in CI**
   - Add secrets to GitHub repository settings
   - Verify secret names match workflow

2. **Database Connection**
   - CI needs access to test database
   - Use test/staging database, not production

3. **Timing Issues**
   - Increase timeouts in CI
   - Add wait conditions for async operations

## Resources

- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **Playwright Documentation:** https://playwright.dev/
- **Clerk Testing Guide:** https://clerk.com/docs/testing
- **Testing Best Practices:** https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure existing tests pass
3. Add tests for new functionality
4. Update this README if needed
5. Run full test suite before PR

## Support

For issues with tests:
- Check troubleshooting section above
- Review test logs for error messages
- Consult Clerk documentation
- See main troubleshooting guide: `/docs/CLERK_TROUBLESHOOTING.md`
