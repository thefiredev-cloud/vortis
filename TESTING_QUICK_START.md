# Testing Quick Start

## Run Tests

```bash
# Run all tests
npm test

# Watch mode (auto re-run on changes)
npm run test:watch

# Interactive UI
npm run test:ui

# With coverage
npm run test:coverage
```

## Test a Specific File

```bash
npm test -- tests/api/webhooks/stripe.test.ts
```

## Current Test Status

```
✅ Stripe Webhook Tests: 12/12 PASSING
   - Signature verification
   - Checkout completion
   - Subscription updates
   - Invoice handling
   - Error scenarios
```

## Files Created

```
/vitest.config.ts                     # Vitest configuration
/tests/setup.ts                       # Global test setup
/tests/mocks/server.ts                # MSW server
/tests/mocks/handlers.ts              # API mock handlers
/tests/factories/user.factory.ts      # Mock user data
/tests/factories/subscription.factory.ts  # Mock Stripe data
/tests/factories/analysis.factory.ts  # Mock analysis data
/tests/api/webhooks/stripe.test.ts    # Stripe webhook tests ✅
```

## Write a New Test

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Mock External Services

```typescript
// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() }
  }
}));

// Mock Supabase
vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      insert: vi.fn(),
      select: vi.fn()
    }))
  }
}));
```

## Use Mock Factories

```typescript
import { createMockUser } from '@/tests/factories/user.factory';
import { createMockSubscription } from '@/tests/factories/subscription.factory';

const user = createMockUser({ firstName: 'John' });
const sub = createMockSubscription({ status: 'active' });
```

## Documentation

- Full Guide: `/tests/TESTING_INFRASTRUCTURE.md`
- Setup Complete: `/TESTING_SETUP_COMPLETE.md`
- Example Tests: `/tests/api/webhooks/stripe.test.ts`

## Key Features

- ✅ Vitest test runner
- ✅ React Testing Library
- ✅ MSW for API mocking
- ✅ Mock data factories
- ✅ Coverage reporting
- ✅ Fast DOM simulation (happy-dom)

## Next Steps

1. Add component tests for UI elements
2. Add API route tests
3. Add integration tests
4. Set up E2E tests with Playwright
5. Configure CI/CD pipeline

## Critical

The Stripe webhook tests are CRITICAL - they verify payment processing works correctly. All 12 tests must pass before deploying to production.

Run: `npm test -- tests/api/webhooks/stripe.test.ts`
