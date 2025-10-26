# Repository Layer Architecture

This document describes the repository pattern implementation in the Vortis platform.

## Overview

The repository layer provides a clean abstraction over database operations, isolating data access logic from business logic. It implements the Repository pattern with a consistent API across all data entities.

## Architecture Pattern

```
Service Layer
     ↓
Repository Layer (Data Access)
     ↓
Supabase Client
     ↓
PostgreSQL Database
```

## Repository Pattern Benefits

1. **Abstraction**: Hide database implementation details
2. **Testability**: Easy to mock for unit tests
3. **Consistency**: Uniform API across entities
4. **Maintainability**: Centralized data access logic
5. **Type Safety**: Full TypeScript support
6. **Reusability**: Common operations in base class

## Base Repository

Location: `/lib/repositories/base.repository.ts`

### Interface

```typescript
export abstract class BaseRepository<T> {
  constructor(
    protected readonly client: SupabaseClient,
    protected readonly tableName: string
  );

  // Read operations
  async findById(id: string): Promise<T | null>;
  async findAll(options?: QueryOptions): Promise<T[]>;
  async count(): Promise<number>;
  async exists(id: string): Promise<boolean>;

  // Delete operations
  async delete(id: string): Promise<boolean>;

  // Protected helpers
  protected async executeQuery<R>(query): Promise<R[]>;
  protected async executeSingleQuery<R>(query): Promise<R | null>;
  protected async executeMutation<R>(query): Promise<R>;
  protected buildQuery(options?: QueryOptions): Query;
}
```

### Query Options

```typescript
export interface QueryOptions {
  limit?: number;           // Maximum number of records
  offset?: number;          // Skip this many records
  orderBy?: string;         // Column to sort by
  orderDirection?: 'asc' | 'desc';  // Sort direction
}
```

### Error Handling

```typescript
protected async executeQuery<R>(query): Promise<R[]> {
  const { data, error } = await query;

  if (error) {
    throw new Error(`Database error in ${this.tableName}: ${error.message}`);
  }

  return (data as R[]) || [];
}
```

**Features**:
- Consistent error format
- Table name in error message
- Type-safe return values
- Null handling

## Stock Analysis Repository

Location: `/lib/repositories/stock-analysis.repository.ts`

### Key Methods

#### Create Analysis

```typescript
async create(
  userId: string,
  params: CreateAnalysisParams
): Promise<StockAnalysis> {
  const dbData = {
    user_id: userId,
    symbol: params.symbol.toUpperCase(),
    analysis_type: params.analysisType,
    timeframe: params.timeframe,
    summary: '',
    metrics: {},
    signals: [],
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const query = this.client
    .from(this.tableName)
    .insert(dbData)
    .select()
    .single();

  const result = await this.executeSingleQuery<Record<string, unknown>>(query);
  if (!result) {
    throw new Error('Failed to create analysis');
  }

  return StockAnalysisModel.fromDatabase(result);
}
```

**Features**:
- Snake_case to camelCase conversion
- Default values
- Type transformation
- Domain model mapping

#### Update Analysis

```typescript
async update(
  id: string,
  params: UpdateAnalysisParams
): Promise<StockAnalysis> {
  const dbData = {
    ...StockAnalysisModel.toDatabase(params),
    updated_at: new Date().toISOString(),
  };

  const query = this.client
    .from(this.tableName)
    .update(dbData)
    .eq('id', id)
    .select()
    .single();

  const result = await this.executeSingleQuery<Record<string, unknown>>(query);
  if (!result) {
    throw new Error('Failed to update analysis');
  }

  return StockAnalysisModel.fromDatabase(result);
}
```

**Features**:
- Partial updates
- Automatic timestamp
- Domain model conversion
- Type safety

#### Find by User

```typescript
async findByUserId(
  userId: string,
  params: AnalysisListParams = {}
): Promise<StockAnalysis[]> {
  let query = this.client
    .from(this.tableName)
    .select('*')
    .eq('user_id', userId);

  if (params.symbol) {
    query = query.eq('symbol', params.symbol.toUpperCase());
  }

  if (params.analysisType) {
    query = query.eq('analysis_type', params.analysisType);
  }

  if (params.status) {
    query = query.eq('status', params.status);
  }

  const orderBy = params.orderBy || 'created_at';
  const orderDirection = params.orderDirection || 'desc';
  query = query.order(orderBy, { ascending: orderDirection === 'asc' });

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(
      params.offset,
      params.offset + (params.limit || 10) - 1
    );
  }

  const results = await this.executeQuery<Record<string, unknown>>(query);
  return results.map((data) => StockAnalysisModel.fromDatabase(data));
}
```

**Features**:
- Dynamic filtering
- Flexible pagination
- Custom sorting
- Multiple conditions

#### Count Methods

```typescript
async countByUser(
  userId: string,
  status?: StockAnalysis['status']
): Promise<number> {
  let query = this.client
    .from(this.tableName)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Database error counting analyses: ${error.message}`);
  }

  return count || 0;
}

async countByUserThisMonth(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await this.client
    .from(this.tableName)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  if (error) {
    throw new Error(`Database error counting monthly analyses: ${error.message}`);
  }

  return count || 0;
}
```

**Features**:
- Efficient counting (head-only request)
- Optional filtering
- Date range queries
- Type-safe parameters

## Watchlist Repository

Location: `/lib/repositories/watchlist.repository.ts`

### Key Methods

#### Create Watchlist

```typescript
async create(
  userId: string,
  params: CreateWatchlistParams
): Promise<Watchlist> {
  const dbData = {
    user_id: userId,
    name: params.name,
    description: params.description,
    is_public: params.isPublic || false,
    item_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const query = this.client
    .from(this.tableName)
    .insert(dbData)
    .select()
    .single();

  const result = await this.executeSingleQuery<Record<string, unknown>>(query);
  if (!result) {
    throw new Error('Failed to create watchlist');
  }

  return WatchlistModel.fromDatabase(result);
}
```

#### Find with Items

```typescript
async findWithItems(watchlistId: string): Promise<WatchlistWithItems | null> {
  const watchlist = await this.findById(watchlistId);
  if (!watchlist) {
    return null;
  }

  const items = await this.getItems(watchlistId);

  return {
    ...watchlist,
    items,
  };
}
```

**Features**:
- Composite queries
- Related data fetching
- Type-safe aggregation

#### Add Item

```typescript
async addItem(
  watchlistId: string,
  params: AddWatchlistItemParams
): Promise<WatchlistItem> {
  // Get the next position
  const items = await this.getItems(watchlistId);
  const nextPosition = items.length;

  const dbData = {
    watchlist_id: watchlistId,
    symbol: params.symbol.toUpperCase(),
    notes: params.notes,
    target_price: params.targetPrice,
    alert_price: params.alertPrice,
    added_price: params.addedPrice,
    position: nextPosition,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const query = this.client
    .from('watchlist_items')
    .insert(dbData)
    .select()
    .single();

  const result = await this.executeSingleQuery<Record<string, unknown>>(query);
  if (!result) {
    throw new Error('Failed to add item to watchlist');
  }

  // Update item count
  await this.updateItemCount(watchlistId);

  return WatchlistItemModel.fromDatabase(result);
}
```

**Features**:
- Automatic positioning
- Related table updates
- Transaction-like behavior
- Cascade updates

#### Reorder Items

```typescript
async reorderItems(watchlistId: string, itemIds: string[]): Promise<boolean> {
  const updates = itemIds.map((itemId, index) => ({
    id: itemId,
    position: index,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await this.client
    .from('watchlist_items')
    .upsert(updates);

  if (error) {
    throw new Error(`Database error reordering items: ${error.message}`);
  }

  return true;
}
```

**Features**:
- Batch updates
- Upsert operation
- Position recalculation

## Domain Model Integration

### From Database

Convert database records to domain models:

```typescript
// In repository
const results = await this.executeQuery<Record<string, unknown>>(query);
return results.map((data) => StockAnalysisModel.fromDatabase(data));

// In model
static fromDatabase(data: Record<string, unknown>): StockAnalysis {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    symbol: data.symbol as string,
    analysisType: data.analysis_type as AnalysisType,
    // ... more field mappings
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}
```

### To Database

Convert domain models to database records:

```typescript
// In repository
const dbData = {
  ...StockAnalysisModel.toDatabase(params),
  updated_at: new Date().toISOString(),
};

// In model
static toDatabase(analysis: Partial<StockAnalysis>): Record<string, unknown> {
  return {
    ...(analysis.id && { id: analysis.id }),
    ...(analysis.userId && { user_id: analysis.userId }),
    ...(analysis.symbol && { symbol: analysis.symbol }),
    ...(analysis.analysisType && { analysis_type: analysis.analysisType }),
    // ... more field mappings
  };
}
```

## Query Building Patterns

### Simple Query

```typescript
const query = this.client
  .from(this.tableName)
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Complex Query

```typescript
let query = this.client
  .from(this.tableName)
  .select('*')
  .eq('user_id', userId);

// Add optional filters
if (symbol) {
  query = query.eq('symbol', symbol);
}

if (status) {
  query = query.eq('status', status);
}

// Add sorting
query = query.order('created_at', { ascending: false });

// Add pagination
if (limit) {
  query = query.limit(limit);
}

if (offset) {
  query = query.range(offset, offset + limit - 1);
}
```

### Join Query

```typescript
const query = this.client
  .from('watchlists')
  .select(`
    *,
    watchlist_items (
      id,
      symbol,
      notes,
      target_price
    )
  `)
  .eq('id', watchlistId)
  .single();
```

### Count Query

```typescript
const { count, error } = await this.client
  .from(this.tableName)
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);
```

## Transaction Support

For operations requiring atomicity:

```typescript
// Using Supabase RPC for complex transactions
const { data, error } = await this.client.rpc('transfer_items', {
  source_id: sourceWatchlistId,
  target_id: targetWatchlistId,
  item_ids: itemIds,
});

if (error) {
  throw new Error(`Transaction failed: ${error.message}`);
}
```

## Pagination Strategy

### Offset-based Pagination

```typescript
async findByUserId(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<StockAnalysis[]> {
  const query = this.client
    .from(this.tableName)
    .select('*')
    .eq('user_id', userId)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  const results = await this.executeQuery<Record<string, unknown>>(query);
  return results.map((data) => StockAnalysisModel.fromDatabase(data));
}
```

### Cursor-based Pagination

```typescript
async findByUserIdAfter(
  userId: string,
  cursor: string,
  limit: number = 10
): Promise<StockAnalysis[]> {
  const query = this.client
    .from(this.tableName)
    .select('*')
    .eq('user_id', userId)
    .lt('created_at', cursor)
    .order('created_at', { ascending: false })
    .limit(limit);

  const results = await this.executeQuery<Record<string, unknown>>(query);
  return results.map((data) => StockAnalysisModel.fromDatabase(data));
}
```

## Performance Optimization

### Using Indexes

Ensure database has proper indexes:

```sql
-- See migrations/20251025000001_add_recommended_indexes.sql
CREATE INDEX idx_stock_analyses_user_created
ON stock_analyses(user_id, created_at DESC);
```

### Selecting Specific Columns

```typescript
const query = this.client
  .from(this.tableName)
  .select('id, symbol, status, created_at')
  .eq('user_id', userId);
```

### Batch Operations

```typescript
async createMany(
  items: CreateParams[]
): Promise<StockAnalysis[]> {
  const dbData = items.map(item => ({
    user_id: item.userId,
    symbol: item.symbol,
    // ... other fields
  }));

  const query = this.client
    .from(this.tableName)
    .insert(dbData)
    .select();

  const results = await this.executeQuery<Record<string, unknown>>(query);
  return results.map((data) => StockAnalysisModel.fromDatabase(data));
}
```

## Best Practices

### 1. Type Safety

```typescript
// Good - Type-safe query result
const results = await this.executeQuery<Record<string, unknown>>(query);
return results.map((data) => StockAnalysisModel.fromDatabase(data));

// Bad - Untyped result
const { data } = await query;
return data;
```

### 2. Error Handling

```typescript
// Good - Descriptive error
if (error) {
  throw new Error(`Database error in ${this.tableName}: ${error.message}`);
}

// Bad - Generic error
if (error) throw error;
```

### 3. Null Handling

```typescript
// Good - Explicit null check
const result = await this.executeSingleQuery(query);
if (!result) {
  return null;
}

// Bad - Assuming result exists
const result = await this.executeSingleQuery(query);
return StockAnalysisModel.fromDatabase(result);
```

### 4. Query Building

```typescript
// Good - Progressive query building
let query = this.client.from(table).select('*');

if (filter) query = query.eq('field', filter);
if (limit) query = query.limit(limit);

// Bad - Conditional queries
const query = limit
  ? this.client.from(table).select('*').limit(limit)
  : this.client.from(table).select('*');
```

### 5. Domain Model Separation

```typescript
// Good - Use domain models
return StockAnalysisModel.fromDatabase(data);

// Bad - Return raw database records
return data;
```

## Testing Repositories

### Unit Tests with Mocks

```typescript
import { StockAnalysisRepository } from '@/lib/repositories/stock-analysis.repository';
import { createMockSupabaseClient } from '@/tests/mocks';

describe('StockAnalysisRepository', () => {
  let repository: StockAnalysisRepository;
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    repository = new StockAnalysisRepository(mockClient);
  });

  it('should find analysis by id', async () => {
    const mockData = { id: '1', symbol: 'AAPL', /* ... */ };
    mockClient.from().select().eq().single.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await repository.findById('1');

    expect(result).toBeDefined();
    expect(result?.symbol).toBe('AAPL');
  });
});
```

### Integration Tests

```typescript
import { createServerClient } from '@supabase/supabase-js';
import { StockAnalysisRepository } from '@/lib/repositories/stock-analysis.repository';

describe('StockAnalysisRepository Integration', () => {
  let repository: StockAnalysisRepository;

  beforeAll(() => {
    const client = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    repository = new StockAnalysisRepository(client);
  });

  it('should create and retrieve analysis', async () => {
    const created = await repository.create('user-123', {
      symbol: 'AAPL',
      analysisType: 'comprehensive',
    });

    const retrieved = await repository.findById(created.id);

    expect(retrieved).toEqual(created);
  });
});
```

## Related Documentation

- [Service Layer](./SERVICE_LAYER.md)
- [Domain Models](./DOMAIN_MODELS.md)
- [Foundation Libraries](./FOUNDATION_LIBRARIES.md)
