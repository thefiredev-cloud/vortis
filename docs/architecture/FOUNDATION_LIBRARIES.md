# Foundation Libraries Architecture

This document describes the core libraries and patterns used in the Vortis platform.

## Overview

The Vortis platform uses modern React patterns and libraries to provide a robust, type-safe, and performant application architecture.

## Core Libraries

### TanStack Query (React Query)

**Version**: Latest (v5+)
**Purpose**: Server state management and data fetching

**Features Used**:
- Query caching and automatic refetching
- Optimistic updates
- Mutation handling
- Automatic background refetching
- Query invalidation
- DevTools integration

**Configuration**: `/lib/query-client.ts`

```typescript
{
  staleTime: 60 * 1000,      // 1 minute
  gcTime: 5 * 60 * 1000,     // 5 minutes (cache time)
  retry: 1,
  refetchOnWindowFocus: false
}
```

**Usage Example**:

```typescript
import { useRecentAnalyses } from '@/lib/hooks/use-stock-analysis';

function MyComponent() {
  const { data, isLoading, error } = useRecentAnalyses(userId, 10);
  // data is automatically cached and refetched
}
```

### Zustand

**Version**: Latest (v4+)
**Purpose**: Client state management

**Features Used**:
- Minimal boilerplate
- DevTools integration
- Persist middleware for localStorage
- TypeScript support
- Shallow equality checks

**Stores**:
- `user-store.ts` - User profile, preferences, subscription
- `analysis-store.ts` - Analysis filters and current analysis

**Usage Example**:

```typescript
import { useUserStore } from '@/lib/stores/user-store';

function MyComponent() {
  const { profile, preferences, setPreferences } = useUserStore();
  // Direct access to client state
}
```

### React Hook Form

**Version**: Latest (v7+)
**Purpose**: Form management and validation

**Features Used**:
- Controlled and uncontrolled inputs
- Integration with Zod for validation
- Error handling
- Form state management

**Usage Example**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { analysisFormSchema } from '@/lib/schemas/analysis-form.schema';

function MyForm() {
  const form = useForm({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: { symbol: '', analysisType: 'comprehensive' }
  });
}
```

### Zod

**Version**: Latest (v3+)
**Purpose**: Schema validation and type inference

**Features Used**:
- Runtime type checking
- TypeScript type inference
- Transform functions
- Error messages
- Composable schemas

**Schemas**:
- `analysis-form.schema.ts` - Analysis form validation
- `watchlist.schema.ts` - Watchlist operations validation

**Usage Example**:

```typescript
export const analysisFormSchema = z.object({
  symbol: z.string()
    .min(1, 'Stock symbol is required')
    .regex(/^[A-Z]+$/, 'Symbol must be uppercase')
    .transform(val => val.toUpperCase()),
  analysisType: z.enum(['fundamental', 'technical', 'comprehensive'])
});

type AnalysisFormData = z.infer<typeof analysisFormSchema>;
```

## Provider Setup

### Root Provider Component

Location: `/app/providers.tsx`

```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { createQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Integration in Layout

Location: `/app/layout.tsx`

```typescript
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## Query Keys Pattern

We use a hierarchical query key structure for better cache management:

```typescript
export const analysisKeys = {
  all: ['analyses'] as const,
  lists: () => [...analysisKeys.all, 'list'] as const,
  list: (userId: string, params?: AnalysisListParams) =>
    [...analysisKeys.lists(), userId, params] as const,
  details: () => [...analysisKeys.all, 'detail'] as const,
  detail: (id: string) => [...analysisKeys.details(), id] as const,
  recent: (userId: string, limit?: number) =>
    [...analysisKeys.all, 'recent', userId, limit] as const,
};
```

**Benefits**:
- Easy invalidation of related queries
- Type-safe query keys
- Prevents key collisions
- Clear query organization

## Mutation Pattern

Mutations automatically invalidate related queries:

```typescript
export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, params }) => {
      const service = getService();
      return service.createAnalysis(userId, params);
    },
    onSuccess: (data, variables) => {
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
      // Update detail cache
      queryClient.setQueryData(analysisKeys.detail(data.id), data);
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: analysisKeys.stats(variables.userId)
      });
    },
  });
}
```

## State Management Strategy

### When to Use TanStack Query

Use for:
- Server data fetching
- API responses
- Database queries
- Cached data
- Automatic refetching

### When to Use Zustand

Use for:
- UI state (modals, filters)
- User preferences
- Temporary form state
- Client-side only data
- Cross-component state

### When to Use React State

Use for:
- Component-local state
- Form inputs (with React Hook Form)
- UI interactions
- Temporary values

## DevTools

### TanStack Query DevTools

Access in development at bottom-left corner of screen:
- View all queries and their states
- Inspect query data
- Manually refetch queries
- Clear cache

### Zustand DevTools

Install Redux DevTools extension:
- View state changes
- Time-travel debugging
- Action history
- State snapshots

## Performance Optimizations

### Query Deduplication

React Query automatically deduplicates requests:

```typescript
// Both components will share the same request
function ComponentA() {
  const { data } = useRecentAnalyses(userId, 10);
}

function ComponentB() {
  const { data } = useRecentAnalyses(userId, 10);
}
```

### Optimistic Updates

Update UI before server responds:

```typescript
const mutation = useMutation({
  mutationFn: updateAnalysis,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: analysisKeys.detail(id) });
    const previous = queryClient.getQueryData(analysisKeys.detail(id));
    queryClient.setQueryData(analysisKeys.detail(id), newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(analysisKeys.detail(id), context.previous);
  },
});
```

### Selective Subscriptions

Zustand allows selecting only needed state:

```typescript
// Only re-renders when preferences change
const preferences = useUserStore(state => state.preferences);

// Re-renders on any user store change (avoid this)
const store = useUserStore();
```

## Best Practices

### 1. Always Define Types

```typescript
// Good
const { data, isLoading } = useAnalysis(analysisId);
type AnalysisData = typeof data; // Inferred from hook

// Better
const { data } = useAnalysis(analysisId);
if (data) {
  // TypeScript knows data is StockAnalysis here
}
```

### 2. Handle Loading States

```typescript
const { data, isLoading, error } = useRecentAnalyses(userId);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <AnalysisList analyses={data} />;
```

### 3. Use Suspense (Optional)

```typescript
// Enable suspense mode
const { data } = useRecentAnalyses(userId, { suspense: true });

// Wrap with Suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <MyComponent />
</Suspense>
```

### 4. Invalidate Queries Wisely

```typescript
// Too broad - invalidates everything
queryClient.invalidateQueries();

// Better - invalidates analyses lists
queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });

// Best - invalidates specific user's analyses
queryClient.invalidateQueries({
  queryKey: analysisKeys.list(userId)
});
```

### 5. Error Boundaries

Wrap components with error boundaries:

```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <MyComponent />
</ErrorBoundary>
```

## Testing

### Testing Components with TanStack Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithClient(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

### Testing Zustand Stores

```typescript
import { act } from '@testing-library/react';
import { useUserStore } from '@/lib/stores/user-store';

describe('UserStore', () => {
  beforeEach(() => {
    useUserStore.getState().reset();
  });

  it('should update preferences', () => {
    act(() => {
      useUserStore.getState().setPreferences({ theme: 'dark' });
    });

    expect(useUserStore.getState().preferences.theme).toBe('dark');
  });
});
```

## Migration Guide

### From useState to TanStack Query

```typescript
// Before
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchData().then(setData).finally(() => setLoading(false));
}, []);

// After
const { data, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});
```

### From Context to Zustand

```typescript
// Before
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// After
export const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
