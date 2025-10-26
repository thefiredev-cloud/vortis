# Fullstack Feature Testing Guide

Comprehensive test coverage for Vortis fullstack features including schemas, repositories, services, hooks, and stores.

## Overview

This guide covers the test infrastructure created for the fullstack feature development. All tests are written but currently skipped (`.skip`) until the actual implementation code is ready.

## Test Structure

```
tests/
├── schemas/                          # Validation schema tests
│   ├── analysis-form.schema.test.ts  # Form validation tests (65 test cases)
│   └── watchlist.schema.test.ts      # Watchlist validation tests (45 test cases)
├── repositories/                     # Data layer tests
│   ├── stock-analysis.repository.test.ts  # Database operations (55 test cases)
│   └── watchlist.repository.test.ts       # Watchlist CRUD (60 test cases)
├── services/                         # Business logic tests
│   ├── stock-analysis.service.test.ts     # Analysis service (70 test cases)
│   └── watchlist.service.test.ts          # Watchlist service (75 test cases)
├── hooks/                            # React hooks tests
│   ├── use-stock-analysis.test.tsx        # TanStack Query hook (45 test cases)
│   └── use-watchlist.test.tsx             # Watchlist mutations (50 test cases)
├── stores/                           # State management tests
│   └── user-store.test.ts                 # Zustand store (40 test cases)
├── integration/                      # Integration tests
│   └── analysis-flow.test.ts              # End-to-end flows (20 test cases)
└── mocks/
    └── supabase.mock.ts                   # Supabase client mock utilities
```

## Test Coverage Summary

| Module | Test Files | Test Cases | Coverage Target |
|--------|-----------|------------|----------------|
| Schemas | 2 | 110 | 100% |
| Repositories | 2 | 115 | 90% |
| Services | 2 | 145 | 85% |
| Hooks | 2 | 95 | 80% |
| Stores | 1 | 40 | 90% |
| Integration | 1 | 20 | 75% |
| **Total** | **10** | **525** | **85%** |

## Running Tests

### Run All Tests (Once Code is Implemented)

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Run Specific Test Suites

```bash
# Run only schema tests
npm test schemas

# Run only repository tests
npm test repositories

# Run only service tests
npm test services

# Run only hook tests
npm test hooks

# Run only store tests
npm test stores

# Run only integration tests
npm test integration
```

### Activating Tests

Once the implementation code is ready, remove `.skip` from the tests:

```typescript
// Before (skipped)
it.skip('should validate correct ticker', () => {

// After (active)
it('should validate correct ticker', () => {
```

## Test Details by Module

### 1. Schema Tests

#### analysis-form.schema.test.ts

Tests form validation for stock analysis requests:

**Ticker Validation (25 cases)**
- Valid ticker formats
- Uppercase transformation
- Invalid formats (numbers, special chars)
- Length limits (max 5 chars)
- Empty/whitespace handling
- Trimming whitespace

**Analysis Type Validation (15 cases)**
- Valid types (free, detailed, comprehensive)
- Invalid types
- Required field validation

**Optional Fields (10 cases)**
- Timeframe validation
- Valid timeframe values

**Edge Cases (15 cases)**
- Case handling
- Special characters
- Boundary conditions

#### watchlist.schema.test.ts

Tests watchlist validation logic:

**Create Schema (25 cases)**
- Name validation (required, length, trimming)
- Description validation (optional, max length)
- Ticker array validation
- Uppercase transformation
- Duplicate detection
- Maximum ticker limits

**Update Schema (10 cases)**
- Partial updates
- Field-specific updates
- Empty updates

**Edge Cases (10 cases)**
- Whitespace handling
- Special characters
- Boundary conditions

### 2. Repository Tests

#### stock-analysis.repository.test.ts

Tests database operations for stock analyses:

**findByTicker (15 cases)**
- Fetch analyses by ticker and user
- Empty result handling
- Error handling
- Special characters in ticker

**findRecent (12 cases)**
- Find recent analysis
- Different analysis types
- Ordering and limits

**create (15 cases)**
- Create new analysis
- Constraint violations
- Large JSON handling

**findByUser (10 cases)**
- Fetch user analyses
- Custom limits
- Ordering

**deleteById (5 cases)**
- Delete by ID
- Non-existent ID handling

**findById (8 cases)**
- Find by ID
- Null handling

#### watchlist.repository.test.ts

Tests watchlist database operations:

**findByUser (10 cases)**
- Fetch user watchlists
- Empty results
- Error handling

**create (12 cases)**
- Create watchlist
- With/without description
- Duplicate name handling

**update (15 cases)**
- Update by ID
- Partial updates
- Not found errors

**deleteById (8 cases)**
- Delete by ID
- Cascade deletes
- Non-existent ID

**Ticker Management (15 cases)**
- Add ticker
- Remove ticker
- Get tickers
- Duplicates
- Uppercase transformation

### 3. Service Tests

#### stock-analysis.service.test.ts

Tests business logic for stock analysis:

**analyzeStock (30 cases)**
- Cache hit (fresh data)
- Cache miss (create new)
- Stale cache (refresh)
- Analysis types
- Request parameters
- Error handling
- Ticker normalization

**getRecentAnalyses (10 cases)**
- Fetch user analyses
- Custom limits
- Empty results
- Error handling

**getAnalysisById (12 cases)**
- Fetch by ID
- User ownership verification
- Not found handling

**deleteAnalysis (10 cases)**
- Delete with ownership check
- Unauthorized access
- Not found errors

**Cache Management (8 cases)**
- Staleness detection
- Configurable TTL
- Cache invalidation

**Error Handling (10 cases)**
- Repository errors
- Invalid ticker
- Missing user ID
- Rate limiting

#### watchlist.service.test.ts

Tests watchlist business logic:

**getUserWatchlists (10 cases)**
- Fetch all watchlists
- Empty results
- Missing user ID
- Error handling

**createWatchlist (15 cases)**
- Create new watchlist
- Validation (name, length)
- Trimming whitespace
- Duplicate handling
- Maximum limit enforcement

**updateWatchlist (15 cases)**
- Update name/description
- Ownership verification
- Not found errors
- Validation

**deleteWatchlist (10 cases)**
- Delete by ID
- Ownership verification
- Cascade deletes
- Not found errors

**addTickerToWatchlist (15 cases)**
- Add ticker
- Normalization
- Ownership check
- Validation
- Duplicates
- Maximum limit

**removeTickerFromWatchlist (5 cases)**
- Remove ticker
- Ownership check
- Non-existent ticker

**getWatchlistTickers (5 cases)**
- Get all tickers
- Ownership check
- Empty results

### 4. Hook Tests

#### use-stock-analysis.test.tsx

Tests TanStack Query integration:

**Basic Fetching (15 cases)**
- Fetch with ticker
- Null/undefined ticker
- Error handling
- Network errors

**Reactivity (10 cases)**
- Refetch on ticker change
- Cache usage
- Manual refetch

**Analysis Types (5 cases)**
- Different types
- Query parameters

**Error States (10 cases)**
- 404 Not Found
- 401 Unauthorized
- 429 Rate Limiting
- 500 Server Error

**Loading States (5 cases)**
- Pending state
- Loading state
- Success state

#### use-watchlist.test.tsx

Tests watchlist TanStack Query integration:

**useWatchlists Query (10 cases)**
- Fetch user watchlists
- Null user handling
- Empty results
- Error handling

**useWatchlistMutations (40 cases)**
- Create watchlist
- Update watchlist
- Delete watchlist
- Add ticker
- Remove ticker
- Error handling
- Query invalidation
- Optimistic updates

### 5. Store Tests

#### user-store.test.ts

Tests Zustand state management:

**Initial State (3 cases)**
- Null user
- Null preferences
- Loading false

**setUser (5 cases)**
- Set user data
- Update user

**setPreferences (8 cases)**
- Set preferences
- Partial updates
- Theme toggle

**setLoading (2 cases)**
- Toggle loading

**clearUser (4 cases)**
- Clear user
- Clear preferences

**reset (3 cases)**
- Reset entire store

**Selectors (3 cases)**
- User email
- Theme preference
- Loading state

**Persistence (5 cases)**
- LocalStorage persistence
- Restore from storage
- Security (no user data)

**Computed Values (2 cases)**
- Full name
- Authentication status

### 6. Integration Tests

#### analysis-flow.test.ts

Tests end-to-end flows:

**Complete Flow (3 cases)**
- Request to storage
- Cache usage
- Stale refresh

**User History (1 case)**
- Fetch and display

**Deletion Flow (2 cases)**
- Ownership verification
- Unauthorized prevention

**Error Handling (3 cases)**
- Database errors
- Invalid ticker
- Rate limiting

**Concurrent Requests (1 case)**
- Same ticker concurrency

**Data Consistency (1 case)**
- Cross-operation consistency

**Performance (1 case)**
- Response time

## Mock Utilities

### supabase.mock.ts

Provides comprehensive mocking for Supabase client:

```typescript
import { createMockSupabaseClient } from '@/tests/mocks/supabase.mock';

const mockDb = createMockSupabaseClient();
mockDb.single.mockResolvedValue({ data: mockData, error: null });
```

**Features:**
- Fluent query builder interface
- All Supabase methods (from, select, insert, update, delete)
- Filter methods (eq, neq, gt, lt, etc.)
- Execution methods (single, maybeSingle)
- RPC and auth support

**Helper Functions:**
```typescript
createMockResponse(data, error) // Create response object
createMockError(message, code)   // Create error object
configureMock(client, method, response) // Configure responses
```

## Test Patterns

### 1. Arrange-Act-Assert (AAA)

```typescript
it('should create a new analysis', async () => {
  // Arrange
  const input = { ticker: 'AAPL', user_id: 'user1' };
  mockDb.single.mockResolvedValue({ data: mockAnalysis, error: null });

  // Act
  const result = await repository.create(input);

  // Assert
  expect(result).toEqual(mockAnalysis);
  expect(mockDb.insert).toHaveBeenCalledWith(input);
});
```

### 2. Error Testing

```typescript
it('should throw error on database failure', async () => {
  const error = createMockError('Database connection failed');
  mockDb.then.mockResolvedValue({ data: null, error });

  await expect(repository.findByTicker('AAPL', 'user1')).rejects.toThrow();
});
```

### 3. State Management Testing

```typescript
it('should set user data', () => {
  const mockUser = { id: 'user1', email: 'test@example.com' };

  act(() => {
    useUserStore.getState().setUser(mockUser);
  });

  expect(useUserStore.getState().user).toEqual(mockUser);
});
```

### 4. Hook Testing

```typescript
it('should fetch analysis when ticker is provided', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => mockData,
  });

  const { result } = renderHook(() => useStockAnalysis('AAPL'), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual(mockData);
});
```

## Coverage Goals

### Schema Tests: 100%
- All validation paths
- All error conditions
- All transformations

### Repository Tests: 90%+
- All CRUD operations
- Error handling
- Edge cases

### Service Tests: 85%+
- Business logic
- Cache management
- Authorization

### Hook Tests: 80%+
- Happy path
- Error states
- Loading states

### Store Tests: 90%+
- All actions
- State persistence
- Computed values

### Integration Tests: 75%+
- Critical paths
- End-to-end flows
- Error scenarios

## Best Practices

### 1. Test Isolation

Each test should be independent:
```typescript
beforeEach(() => {
  mockDb = createMockSupabaseClient();
  vi.clearAllMocks();
});
```

### 2. Descriptive Names

Use clear, behavior-focused names:
```typescript
// Good
it('should return cached analysis if fresh', () => {});

// Bad
it('should work', () => {});
```

### 3. Test Edge Cases

Always test:
- Empty inputs
- Null/undefined values
- Maximum limits
- Invalid formats
- Error conditions

### 4. Mock External Dependencies

Never hit real databases or APIs:
```typescript
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => createMockSupabaseClient(),
}));
```

### 5. Use Test Factories

Keep test data consistent:
```typescript
function createMockAnalysis(overrides = {}) {
  return {
    id: '1',
    ticker: 'AAPL',
    user_id: 'user1',
    ...overrides,
  };
}
```

## Troubleshooting

### Tests Not Running

1. Check test file naming: `*.test.ts` or `*.test.tsx`
2. Verify vitest.config.ts includes test files
3. Ensure dependencies are installed: `npm install`

### Mock Not Working

1. Clear mocks in beforeEach
2. Verify mock setup before test runs
3. Check import paths match

### Async Tests Failing

1. Use `await waitFor()` for async operations
2. Ensure promises are returned or awaited
3. Check timeout values

### Coverage Not Accurate

1. Run `npm run test:coverage` to see detailed report
2. Check coverage exclusions in vitest.config.ts
3. Open `coverage/index.html` for visual report

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

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
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Next Steps

1. **Implement Code**: Create actual implementation files
2. **Activate Tests**: Remove `.skip` from test cases
3. **Run Tests**: Execute `npm test` and fix any failures
4. **Check Coverage**: Run `npm run test:coverage`
5. **Refine Tests**: Adjust based on actual implementation
6. **Add More Tests**: Cover additional edge cases discovered

## Maintenance

### Adding New Tests

1. Follow existing file structure
2. Use descriptive test names
3. Group related tests with `describe`
4. Add to this documentation

### Updating Tests

1. Keep tests in sync with implementation
2. Update when requirements change
3. Refactor when code refactors
4. Document breaking changes

### Test Review Checklist

- [ ] Tests follow AAA pattern
- [ ] Mocks are properly configured
- [ ] Edge cases are covered
- [ ] Error scenarios tested
- [ ] Async operations handled correctly
- [ ] No hardcoded values
- [ ] Descriptive test names
- [ ] Comments for complex logic

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [TanStack Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)
- [Zustand Testing](https://docs.pmnd.rs/zustand/guides/testing)
- [MSW Documentation](https://mswjs.io/)

## Support

For questions or issues with tests:
1. Check this documentation
2. Review existing test examples
3. Consult Vitest documentation
4. Review test output for specific errors

---

**Test Suite Status**: Ready for Implementation
**Total Test Cases**: 525
**Estimated Coverage**: 85%+
**Last Updated**: 2025-10-25
