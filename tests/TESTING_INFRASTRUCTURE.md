# Testing Infrastructure

Complete automated testing setup for the Vortis application using Vitest, Testing Library, and MSW.

## Overview

This testing infrastructure provides:
- Unit testing with Vitest
- React component testing with Testing Library
- API mocking with MSW (Mock Service Worker)
- Test coverage reporting
- Mock data factories for consistent test data

## Installation

All dependencies are already installed. Key packages:

```json
{
  "vitest": "^3.2.4",
  "@vitest/ui": "^3.2.4",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/user-event": "^14.6.1",
  "msw": "^2.11.5",
  "happy-dom": "^19.0.2"
}
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
tests/
├── setup.ts                          # Global test setup and configuration
├── mocks/
│   ├── handlers.ts                   # MSW request handlers
│   └── server.ts                     # MSW server configuration
├── factories/
│   ├── user.factory.ts               # Mock user data
│   ├── subscription.factory.ts       # Mock Stripe data
│   └── analysis.factory.ts           # Mock stock analysis data
├── api/
│   └── webhooks/
│       └── stripe.test.ts            # Stripe webhook tests (12/12 PASSING)
└── clerk/
    ├── auth.test.ts                  # Authentication tests
    ├── integration.test.ts           # Integration tests
    └── webhook.test.ts               # Clerk webhook tests
```

## Configuration

### vitest.config.ts

The Vitest configuration includes:
- React plugin for component testing
- Happy DOM for fast DOM simulation
- Path aliases matching tsconfig.json (@/ → ./)
- Coverage thresholds (60% minimum)
- Global test utilities

### tests/setup.ts

Global setup includes:
- @testing-library/jest-dom matchers
- MSW server initialization
- Environment variable mocking
- Test lifecycle hooks

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Testing API Routes

```typescript
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/your-route/route';

vi.mock('@/lib/some-dependency', () => ({
  dependency: vi.fn(),
}));

describe('API Route', () => {
  it('should handle requests', async () => {
    const request = new Request('http://localhost:3000/api/your-route', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success');
  });
});
```

### Testing Components

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from '@/components/YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Using Mock Factories

```typescript
import { createMockUser } from '@/tests/factories/user.factory';
import { createMockSubscription } from '@/tests/factories/subscription.factory';
import { createMockAnalysis } from '@/tests/factories/analysis.factory';

describe('Feature', () => {
  it('should work with mock data', () => {
    const user = createMockUser({ firstName: 'Custom' });
    const subscription = createMockSubscription({ status: 'active' });
    const analysis = createMockAnalysis({ ticker: 'TSLA' });

    expect(user.firstName).toBe('Custom');
    expect(subscription.status).toBe('active');
    expect(analysis.ticker).toBe('TSLA');
  });
});
```

## Mock Service Worker (MSW)

MSW intercepts HTTP requests and returns mock responses. Handlers are defined in `tests/mocks/handlers.ts`.

### Adding New Handlers

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET request
  http.get('http://localhost:54321/rest/v1/your-table', () => {
    return HttpResponse.json([{ id: 1, data: 'mock' }]);
  }),

  // POST request
  http.post('http://localhost:54321/rest/v1/your-table', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, data: body });
  }),
];
```

### Runtime Handler Override

```typescript
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

it('should handle error', async () => {
  server.use(
    http.get('http://localhost:54321/rest/v1/table', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  // Test error handling
});
```

## Critical Tests

### Stripe Webhook Tests (REQUIRED)

Location: `tests/api/webhooks/stripe.test.ts`

These tests verify:
- ✅ Signature verification
- ✅ Checkout session completion
- ✅ Subscription creation and updates
- ✅ Invoice payment handling
- ✅ Error handling

**Status: 12/12 tests passing**

### Test Coverage

Current coverage requirements:
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

View coverage report:
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

## Best Practices

### 1. Mock External Dependencies

Always mock external services (Stripe, Supabase, etc.):

```typescript
vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
  },
}));
```

### 2. Clear Mocks Between Tests

```typescript
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});
```

### 3. Use Descriptive Test Names

```typescript
// Good
it('should create subscription and usage tracking on checkout completion', () => {});

// Bad
it('should work', () => {});
```

### 4. Test Edge Cases

- Missing required data
- Invalid signatures
- Network errors
- Concurrent requests
- Expired sessions

### 5. Avoid Testing Implementation Details

```typescript
// Good - test behavior
expect(screen.getByText('Welcome')).toBeInTheDocument();

// Bad - test implementation
expect(component.state.isLoggedIn).toBe(true);
```

## Environment Variables

Test environment variables are mocked in `tests/setup.ts`:

```typescript
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
// ... etc
```

## Troubleshooting

### Tests Timeout

Increase timeout in specific tests:
```typescript
it('slow test', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### MSW Not Intercepting Requests

1. Check handler URL matches exactly
2. Verify MSW server is started in setup.ts
3. Use `server.use()` for runtime overrides

### Module Resolution Errors

Check that:
1. Path aliases in vitest.config.ts match tsconfig.json
2. All dependencies are installed
3. Module exists at expected path

### Mock Not Being Called

```typescript
const mockFn = vi.fn();
// ... test code
console.log(mockFn.mock.calls); // Debug mock calls
```

## Next Steps

### Additional Test Suites to Create

1. **Authentication Tests**
   - Sign in/out flows
   - Protected route access
   - Session management

2. **Component Tests**
   - Dashboard components
   - Chart components
   - Form components

3. **Integration Tests**
   - End-to-end user flows
   - Payment flows
   - Stock analysis flows

4. **API Tests**
   - Analysis endpoint
   - User profile endpoints
   - Subscription management

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW Documentation](https://mswjs.io/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Examples

See `tests/api/webhooks/stripe.test.ts` for a comprehensive example of:
- Mocking complex dependencies (Stripe, Supabase)
- Testing webhook signature verification
- Testing database operations
- Testing error scenarios
- Using mock data factories

This file demonstrates production-ready testing patterns for payment-critical code.
