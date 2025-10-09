# Vortis Testing Documentation

Comprehensive testing documentation for the Vortis trading intelligence platform.

## Overview

This directory contains integration test plans and documentation for manual and automated testing of Vortis's core systems.

## Test Documentation

### Integration Tests

1. **Authentication Flow Tests**
   - File: `integration/auth-flow.test.md`
   - Coverage: Complete authentication system testing
   - Test Suites: 12
   - Test Cases: 50+
   - Topics:
     - User signup and email verification
     - Login and logout flows
     - Protected route access
     - Session management
     - Password reset
     - Security (SQL injection, XSS, CSRF)
     - Performance benchmarks
     - Mobile responsiveness

2. **Stripe Integration Tests**
   - File: `integration/stripe-integration.test.md`
   - Coverage: Complete payment system testing
   - Test Suites: 12
   - Test Cases: 40+
   - Topics:
     - Product and price configuration
     - Checkout flow
     - Subscription management
     - Webhook processing
     - Trial periods
     - Payment failures and retries
     - Test card scenarios
     - Performance metrics

## Quick Start

### Prerequisites

```bash
# 1. Configure environment
cp .env.example .env.local
# Edit .env.local with real credentials

# 2. Validate configuration
npx tsx scripts/check-env.ts

# 3. Start development server
npm run dev

# 4. (For Stripe tests) Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Running Tests

#### Authentication Tests

```bash
# Follow the manual test procedures in:
cat tests/integration/auth-flow.test.md

# Key tests to run first:
# - Test Suite 1: Sign Up Flow
# - Test Suite 2: Login Flow
# - Test Suite 3: Protected Routes
```

#### Stripe Tests

```bash
# Follow the manual test procedures in:
cat tests/integration/stripe-integration.test.md

# Key tests to run first:
# - Test Suite 1: Product Setup
# - Test Suite 2: Checkout Flow
# - Test Suite 4: Webhooks
```

## Test Execution Workflow

### 1. Environment Setup
- [ ] Configure all required environment variables
- [ ] Run validation: `npx tsx scripts/check-env.ts`
- [ ] Verify Supabase connection
- [ ] Verify Stripe connection

### 2. Authentication Testing
- [ ] Execute critical path tests (Suites 1-5)
- [ ] Execute security tests (Suite 9)
- [ ] Document results

### 3. Stripe Testing
- [ ] Verify product setup (Suite 1)
- [ ] Test checkout flow (Suite 2)
- [ ] Verify webhook delivery (Suite 4)
- [ ] Test subscription management (Suite 5)
- [ ] Document results

### 4. Regression Testing
- [ ] Re-run all tests after code changes
- [ ] Verify no existing functionality broken
- [ ] Update test documentation if needed

## Test Types

### Manual Tests
- Documented in markdown files
- Step-by-step procedures
- Expected results for validation
- Used for exploratory testing
- Required before production deployment

### Automated Tests (Recommended)
Currently not implemented. Recommendations:

```javascript
// Unit Tests (Jest/Vitest)
describe('Authentication', () => {
  test('validates email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
});

// Integration Tests (Playwright)
test('user can sign up', async ({ page }) => {
  await page.goto('/auth/signup');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});

// API Tests (Supertest)
describe('POST /api/stripe/checkout', () => {
  it('creates checkout session', async () => {
    const response = await request(app)
      .post('/api/stripe/checkout')
      .send({ plan: 'starter' });
    expect(response.status).toBe(200);
  });
});
```

## Test Reporting

### Template

After running tests, document results using this format:

```markdown
# Test Execution Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Development / Staging / Production

## Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Skipped: XX

## Failed Tests
| Test ID | Description | Error | Status |
|---------|-------------|-------|--------|
| 2.1 | Login with valid credentials | Timeout error | Open |

## Notes
- Any observations or concerns
- Performance issues
- Recommendations
```

## Test Data

### Test Accounts

Create test accounts for different scenarios:
- New user (for signup tests)
- Existing user with subscription
- Existing user without subscription
- User with expired trial

**Important:** Use disposable email addresses for testing (e.g., mailinator.com)

### Test Cards (Stripe)

```
Success:
4242 4242 4242 4242     Visa
5555 5555 5555 4444     Mastercard

Declined:
4000 0000 0000 0002     Card declined
4000 0000 0000 9995     Insufficient funds

Special:
4000 0025 0000 3155     3D Secure authentication
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

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
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx tsx scripts/check-env.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          # ... other secrets
      - run: npm test
      - run: npm run test:integration
```

## Performance Benchmarks

### Target Metrics

| Operation | Target | Measured |
|-----------|--------|----------|
| Login | < 1s | - |
| Signup | < 2s | - |
| Checkout session creation | < 1s | - |
| Webhook processing | < 500ms | - |
| Page load (dashboard) | < 2s | - |

## Security Testing

### Checklist

- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] CSRF protection verified
- [ ] Authentication bypass attempts fail
- [ ] Unauthorized API access blocked
- [ ] Webhook signature validation working
- [ ] Environment variables not exposed
- [ ] Password requirements enforced
- [ ] Rate limiting functional (if implemented)

## Troubleshooting Tests

### Common Issues

**Tests failing locally but work in CI:**
- Check environment variable differences
- Verify same Node.js version
- Check for cached dependencies

**Flaky tests:**
- Increase timeout values
- Add explicit waits for async operations
- Check for race conditions

**Database tests failing:**
- Verify test database is isolated
- Check RLS policies don't block test operations
- Ensure proper test data cleanup

## Related Documentation

- **Environment Setup:** `/docs/ENVIRONMENT_SETUP.md`
- **Setup Checklist:** `../docs/setup/SETUP_CHECKLIST.md`
- **Validation Script:** `/scripts/check-env.ts`
- **Full Report:** `/docs/TESTING_SETUP_REPORT.md`

## Contributing

### Adding New Tests

1. Create test document in appropriate directory
2. Follow existing format and structure
3. Include:
   - Prerequisites
   - Step-by-step procedures
   - Expected results
   - Verification methods
4. Update this README with new test info

### Test Naming Convention

- Use descriptive names: `test-suite-name.test.md`
- Group related tests in suites
- Number test cases for easy reference

## Support

### Getting Help

- Review documentation in `/docs`
- Check common issues in test files
- Run validation: `npx tsx scripts/check-env.ts --guide`
- Check service status pages:
  - Supabase: https://status.supabase.com
  - Stripe: https://status.stripe.com

### Reporting Issues

When reporting test failures:
1. Include test ID and name
2. Copy exact error message
3. Note environment (dev/staging/prod)
4. Include relevant logs
5. Document steps to reproduce

## Future Improvements

- [ ] Implement automated E2E tests (Playwright)
- [ ] Add unit tests for utilities and helpers
- [ ] Set up test coverage reporting
- [ ] Create visual regression tests
- [ ] Add load testing suite (k6/Artillery)
- [ ] Implement contract testing for APIs
- [ ] Add accessibility testing (axe-core)
- [ ] Create synthetic monitoring for production

---

Last Updated: 2025-10-09
Test Framework Version: 1.0.0
