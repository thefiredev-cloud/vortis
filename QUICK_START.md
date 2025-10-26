# Vortis Foundation - Quick Start Guide

This guide gets you up and running with the newly implemented foundation architecture.

## What Was Implemented

- ✅ TanStack Query for server state management
- ✅ Zustand for client state management
- ✅ React Hook Form + Zod for forms and validation
- ✅ Repository pattern for data access
- ✅ Service layer for business logic
- ✅ Domain models for type safety
- ✅ React Query hooks for all operations
- ✅ Database migrations (indexes + constraints)
- ✅ Comprehensive documentation

## Installation

All dependencies are already installed. To verify:

```bash
npm install
```

## Database Setup

Apply the migrations to your Supabase instance:

### Option 1: Supabase CLI (Recommended)

```bash
# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option 2: Supabase Dashboard

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and run `supabase/migrations/20251025000001_add_recommended_indexes.sql`
4. Copy and run `supabase/migrations/20251025000002_add_validation_constraints.sql`

See `/Users/tanner-osterkamp/vortis/supabase/migrations/MIGRATION_GUIDE.md` for details.

## Using the Foundation

### 1. Fetching Data with React Query

```typescript
import { useRecentAnalyses } from '@/lib/hooks/use-stock-analysis';

function MyComponent() {
  const { data, isLoading, error } = useRecentAnalyses(userId, 10);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(analysis => (
        <div key={analysis.id}>{analysis.symbol}</div>
      ))}
    </div>
  );
}
```

### 2. Creating Data with Mutations

```typescript
import { useCreateAnalysis } from '@/lib/hooks/use-stock-analysis';

function CreateAnalysisButton() {
  const createAnalysis = useCreateAnalysis();

  const handleClick = async () => {
    await createAnalysis.mutateAsync({
      userId: 'user-123',
      params: {
        symbol: 'AAPL',
        analysisType: 'comprehensive',
      },
    });
  };

  return (
    <button onClick={handleClick} disabled={createAnalysis.isPending}>
      {createAnalysis.isPending ? 'Creating...' : 'Create Analysis'}
    </button>
  );
}
```

### 3. Using Forms with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { analysisFormSchema } from '@/lib/schemas/analysis-form.schema';

function AnalysisForm() {
  const form = useForm({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      symbol: '',
      analysisType: 'comprehensive',
    },
  });

  const onSubmit = (data) => {
    console.log(data); // Fully typed and validated!
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('symbol')} />
      {form.formState.errors.symbol && (
        <span>{form.formState.errors.symbol.message}</span>
      )}
      {/* ... more fields */}
    </form>
  );
}
```

### 4. Using Client State (Zustand)

```typescript
import { useUserStore } from '@/lib/stores/user-store';

function PreferencesPanel() {
  const { preferences, setPreferences } = useUserStore();

  return (
    <div>
      <label>
        Theme:
        <select
          value={preferences.theme}
          onChange={(e) => setPreferences({ theme: e.target.value })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>
    </div>
  );
}
```

## Architecture Layers

### Making a Request Flow

```
User clicks button
       ↓
React Component calls hook
       ↓
React Query hook (use-stock-analysis.ts)
       ↓
Service layer (stock-analysis.service.ts)
  - Validates input
  - Checks permissions
       ↓
Repository layer (stock-analysis.repository.ts)
  - Builds query
  - Executes database operation
       ↓
Domain Model (stock-analysis.model.ts)
  - Converts database format to domain format
       ↓
Returns typed data up the chain
       ↓
React Query caches result
       ↓
Component re-renders with new data
```

## Common Patterns

### 1. Creating a New Feature

```typescript
// 1. Define the domain model
// lib/models/my-feature.model.ts
export interface MyFeature {
  id: string;
  name: string;
  // ...
}

// 2. Create repository
// lib/repositories/my-feature.repository.ts
export class MyFeatureRepository extends BaseRepository<MyFeature> {
  constructor(client: SupabaseClient) {
    super(client, 'my_features');
  }
  // ... custom methods
}

// 3. Create service
// lib/services/my-feature.service.ts
export class MyFeatureService {
  private repository: MyFeatureRepository;

  constructor(client: SupabaseClient) {
    this.repository = new MyFeatureRepository(client);
  }
  // ... business logic methods
}

// 4. Create React Query hooks
// lib/hooks/use-my-feature.ts
export function useMyFeature(id: string) {
  return useQuery({
    queryKey: ['myFeature', id],
    queryFn: async () => {
      const service = getService();
      return service.getFeature(id);
    },
  });
}

// 5. Use in component
function MyComponent() {
  const { data } = useMyFeature('feature-123');
  return <div>{data?.name}</div>;
}
```

### 2. Validation Schema

```typescript
// lib/schemas/my-form.schema.ts
import { z } from 'zod';

export const myFormSchema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+'),
  website: z.string().url().optional(),
});

export type MyFormData = z.infer<typeof myFormSchema>;
```

### 3. Optimistic Updates

```typescript
export function useUpdateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAnalysis,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['analysis', newData.id] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['analysis', newData.id]);

      // Optimistically update
      queryClient.setQueryData(['analysis', newData.id], newData);

      return { previous };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['analysis', newData.id], context.previous);
    },
    onSettled: (data) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['analysis', data.id] });
    },
  });
}
```

## File Structure

```
/Users/tanner-osterkamp/vortis/
├── app/
│   ├── layout.tsx (includes Providers)
│   └── providers.tsx (QueryClient wrapper)
├── lib/
│   ├── hooks/
│   │   ├── use-stock-analysis.ts
│   │   └── use-watchlist.ts
│   ├── models/
│   │   ├── stock-analysis.model.ts
│   │   ├── subscription.model.ts
│   │   └── watchlist.model.ts
│   ├── repositories/
│   │   ├── base.repository.ts
│   │   ├── stock-analysis.repository.ts
│   │   └── watchlist.repository.ts
│   ├── schemas/
│   │   ├── analysis-form.schema.ts
│   │   └── watchlist.schema.ts
│   ├── services/
│   │   ├── stock-analysis.service.ts
│   │   └── watchlist.service.ts
│   ├── stores/
│   │   ├── analysis-store.ts
│   │   └── user-store.ts
│   └── query-client.ts
├── supabase/migrations/
│   ├── 20251025000001_add_recommended_indexes.sql
│   ├── 20251025000002_add_validation_constraints.sql
│   └── MIGRATION_GUIDE.md
└── docs/architecture/
    ├── FOUNDATION_LIBRARIES.md
    ├── SERVICE_LAYER.md
    └── REPOSITORY_LAYER.md
```

## Development Tools

### React Query DevTools

Located at bottom-left of screen in development mode. Provides:
- Query inspection
- Cache visualization
- Manual refetch
- Clear cache

### Zustand DevTools

Install Redux DevTools extension in your browser:
- View state changes
- Time-travel debugging
- Action history

## Testing

Run the test suite (525 tests):

```bash
npm test
```

Test files are in `/Users/tanner-osterkamp/vortis/tests/`

## Building

```bash
npm run build
```

Note: Build may fail at collection phase if environment variables are missing. This is expected.

## Common Issues

### Issue: Query not updating

**Solution**: Check if you're invalidating the correct query keys:

```typescript
queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
```

### Issue: Form validation not working

**Solution**: Make sure you're using the Zod resolver:

```typescript
const form = useForm({
  resolver: zodResolver(mySchema), // Don't forget this!
});
```

### Issue: State not persisting

**Solution**: Check Zustand persist configuration in the store.

### Issue: TypeScript errors in repository

**Solution**: Use the helper methods from BaseRepository, don't access client directly.

## Next Steps

1. **Apply database migrations** (see above)
2. **Run tests**: `npm test`
3. **Start developing features** using the patterns above
4. **Read the docs** in `/Users/tanner-osterkamp/vortis/docs/architecture/`

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)

## Full Documentation

See `/Users/tanner-osterkamp/vortis/FOUNDATION_IMPLEMENTATION_REPORT.md` for complete implementation details.

---

**Happy coding!** 🚀
