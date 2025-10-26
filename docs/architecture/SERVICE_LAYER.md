# Service Layer Architecture

This document describes the service layer pattern used in the Vortis platform.

## Overview

The service layer provides a clean abstraction between the application logic and data access layer. It encapsulates business logic, validation, and orchestration of repository operations.

## Architecture Pattern

```
React Components (UI)
       ↓
React Query Hooks (Data Fetching)
       ↓
Service Layer (Business Logic)
       ↓
Repository Layer (Data Access)
       ↓
Supabase (Database)
```

## Service Layer Responsibilities

1. **Business Logic**: Implement domain-specific rules and operations
2. **Validation**: Validate inputs before database operations
3. **Authorization**: Check user permissions and ownership
4. **Orchestration**: Coordinate multiple repository calls
5. **Error Handling**: Provide meaningful error messages
6. **Data Transformation**: Convert between domain models and DTOs

## Service Structure

### Base Service Pattern

```typescript
export class BaseService {
  constructor(protected readonly client: SupabaseClient) {}

  protected async executeWithAuth(userId: string, operation: () => Promise<T>) {
    // Common authorization logic
  }

  protected handleError(error: unknown): never {
    // Centralized error handling
  }
}
```

### Service Implementation

Location: `/lib/services/`

**StockAnalysisService** (`stock-analysis.service.ts`)
- Manages stock analysis lifecycle
- Validates analysis parameters
- Checks usage limits
- Handles analysis state transitions

**WatchlistService** (`watchlist.service.ts`)
- Manages watchlists and items
- Validates stock symbols
- Prevents duplicate entries
- Handles item reordering

## Stock Analysis Service

### Create Analysis

```typescript
async createAnalysis(
  userId: string,
  params: CreateAnalysisParams
): Promise<StockAnalysis> {
  // 1. Validate symbol format
  if (!/^[A-Z]+$/.test(params.symbol.toUpperCase())) {
    throw new Error('Invalid stock symbol format');
  }

  // 2. Create the analysis
  const analysis = await this.repository.create(userId, params);

  // 3. Queue background job (future)
  // await this.queueAnalysisJob(analysis.id);

  return analysis;
}
```

**Features**:
- Symbol validation
- User association
- Initial status setting
- Background job queueing (placeholder)

### Get User Statistics

```typescript
async getUserStats(userId: string): Promise<UserStats> {
  const [total, monthly, completed, pending] = await Promise.all([
    this.repository.countByUser(userId),
    this.repository.countByUserThisMonth(userId),
    this.repository.countByUser(userId, 'completed'),
    this.repository.countByUser(userId, 'pending'),
  ]);

  return {
    totalAnalyses: total,
    analysesThisMonth: monthly,
    completedAnalyses: completed,
    pendingAnalyses: pending,
  };
}
```

**Features**:
- Parallel queries for performance
- Aggregated statistics
- Type-safe return values

### Check Usage Limits

```typescript
async checkUsageLimit(
  userId: string,
  monthlyLimit: number
): Promise<UsageLimitResult> {
  const used = await this.repository.countByUserThisMonth(userId);
  const remaining = monthlyLimit === -1 ? -1 : monthlyLimit - used;
  const canAnalyze = monthlyLimit === -1 || remaining > 0;

  return { used, limit: monthlyLimit, remaining, canAnalyze };
}
```

**Features**:
- Unlimited plan handling (-1)
- Current usage tracking
- Remaining quota calculation
- Authorization decision

### Update Analysis Status

```typescript
async markAsCompleted(
  analysisId: string,
  params: UpdateAnalysisParams
): Promise<StockAnalysis> {
  return this.repository.update(analysisId, {
    ...params,
    status: 'completed',
    completedAt: new Date().toISOString(),
  });
}

async markAsFailed(
  analysisId: string,
  error: string
): Promise<StockAnalysis> {
  return this.repository.update(analysisId, {
    status: 'failed',
    error,
  });
}
```

**Features**:
- State transition helpers
- Automatic timestamp management
- Error capture

## Watchlist Service

### Create Watchlist

```typescript
async createWatchlist(
  userId: string,
  params: CreateWatchlistParams
): Promise<Watchlist> {
  // 1. Validate name
  if (!params.name || params.name.trim().length === 0) {
    throw new Error('Watchlist name is required');
  }

  if (params.name.length > 50) {
    throw new Error('Watchlist name must be 50 characters or less');
  }

  // 2. Create watchlist
  return this.repository.create(userId, params);
}
```

**Features**:
- Input validation
- Length constraints
- User association

### Add Stock to Watchlist

```typescript
async addStock(
  watchlistId: string,
  userId: string,
  params: AddWatchlistItemParams
): Promise<WatchlistItem> {
  // 1. Verify ownership
  const watchlist = await this.repository.findById(watchlistId);
  if (!watchlist) {
    throw new Error('Watchlist not found');
  }

  if (watchlist.userId !== userId) {
    throw new Error('Unauthorized to modify this watchlist');
  }

  // 2. Validate symbol
  if (!/^[A-Z]+$/.test(params.symbol.toUpperCase())) {
    throw new Error('Invalid stock symbol format');
  }

  // 3. Check for duplicates
  const existing = await this.repository.findItemBySymbol(
    watchlistId,
    params.symbol
  );
  if (existing) {
    throw new Error('Stock already exists in this watchlist');
  }

  // 4. Add item
  return this.repository.addItem(watchlistId, params);
}
```

**Features**:
- Ownership verification
- Symbol validation
- Duplicate prevention
- Automatic positioning

### Reorder Items

```typescript
async reorderStocks(
  watchlistId: string,
  userId: string,
  itemIds: string[]
): Promise<boolean> {
  // 1. Verify ownership
  const watchlist = await this.repository.findById(watchlistId);
  if (!watchlist) {
    throw new Error('Watchlist not found');
  }

  if (watchlist.userId !== userId) {
    throw new Error('Unauthorized to modify this watchlist');
  }

  // 2. Update positions
  return this.repository.reorderItems(watchlistId, itemIds);
}
```

**Features**:
- Ownership verification
- Batch position updates
- Transactional safety

## Service Usage in Hooks

Services are called from React Query hooks:

```typescript
// lib/hooks/use-stock-analysis.ts
const getService = () => {
  const supabase = createClient();
  return new StockAnalysisService(supabase);
};

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, params }) => {
      const service = getService();
      return service.createAnalysis(userId, params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
      queryClient.setQueryData(analysisKeys.detail(data.id), data);
    },
  });
}
```

## Error Handling

### Standard Error Format

```typescript
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}
```

### Error Examples

```typescript
// Validation error
throw new ServiceError('Invalid symbol format', 'VALIDATION_ERROR', 400);

// Authorization error
throw new ServiceError('Unauthorized', 'UNAUTHORIZED', 403);

// Not found error
throw new ServiceError('Watchlist not found', 'NOT_FOUND', 404);

// Business logic error
throw new ServiceError('Usage limit exceeded', 'LIMIT_EXCEEDED', 429);
```

### Error Handling in Services

```typescript
async deleteAnalysis(analysisId: string, userId: string): Promise<boolean> {
  try {
    const analysis = await this.repository.findById(analysisId);

    if (!analysis) {
      throw new ServiceError('Analysis not found', 'NOT_FOUND', 404);
    }

    if (analysis.userId !== userId) {
      throw new ServiceError('Unauthorized', 'UNAUTHORIZED', 403);
    }

    return await this.repository.delete(analysisId);
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(
      'Failed to delete analysis',
      'DELETE_FAILED',
      500
    );
  }
}
```

## Authorization Patterns

### Resource Ownership

```typescript
private async verifyOwnership(
  resourceId: string,
  userId: string
): Promise<Resource> {
  const resource = await this.repository.findById(resourceId);

  if (!resource) {
    throw new ServiceError('Resource not found', 'NOT_FOUND', 404);
  }

  if (resource.userId !== userId) {
    throw new ServiceError('Unauthorized', 'UNAUTHORIZED', 403);
  }

  return resource;
}
```

### Permission Checks

```typescript
private async checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  // Check user subscription limits
  const subscription = await this.getSubscription(userId);

  if (!subscription) {
    return false;
  }

  return SubscriptionModel.canAccess(subscription, permission);
}
```

## Transaction Support

For operations requiring multiple database calls:

```typescript
async transferWatchlistItems(
  sourceId: string,
  targetId: string,
  itemIds: string[],
  userId: string
): Promise<boolean> {
  // Verify ownership of both watchlists
  await this.verifyOwnership(sourceId, userId);
  await this.verifyOwnership(targetId, userId);

  // Use Supabase transactions
  const { error } = await this.client.rpc('transfer_watchlist_items', {
    source_watchlist_id: sourceId,
    target_watchlist_id: targetId,
    item_ids: itemIds,
  });

  if (error) {
    throw new ServiceError('Transfer failed', 'TRANSFER_FAILED', 500);
  }

  return true;
}
```

## Best Practices

### 1. Single Responsibility

Each service method should do one thing:

```typescript
// Good
async createAnalysis(userId: string, params: CreateAnalysisParams)
async updateAnalysis(analysisId: string, params: UpdateAnalysisParams)
async deleteAnalysis(analysisId: string, userId: string)

// Bad
async manageAnalysis(action: string, params: any)
```

### 2. Fail Fast

Validate inputs early:

```typescript
async createWatchlist(userId: string, params: CreateWatchlistParams) {
  // Validate first
  if (!params.name?.trim()) {
    throw new Error('Name is required');
  }

  // Then proceed
  return this.repository.create(userId, params);
}
```

### 3. Use Domain Models

Return domain models, not database records:

```typescript
// Good
async getAnalysis(id: string): Promise<StockAnalysis> {
  return this.repository.findById(id);
}

// Bad
async getAnalysis(id: string): Promise<Record<string, unknown>> {
  const { data } = await this.client.from('stock_analyses')...
  return data;
}
```

### 4. Keep Services Thin

Move complex logic to domain models:

```typescript
// Service
async shouldAlert(itemId: string): Promise<boolean> {
  const item = await this.repository.findItemById(itemId);
  return WatchlistItemModel.shouldAlert(item);
}

// Domain model
static shouldAlert(item: WatchlistItem): boolean {
  if (!item.alertPrice || !item.currentPrice) {
    return false;
  }
  return item.currentPrice >= item.alertPrice;
}
```

### 5. Document Complex Operations

```typescript
/**
 * Checks if user can create a new analysis based on subscription limits
 *
 * @param userId - The user's ID
 * @param monthlyLimit - The user's monthly analysis limit (-1 for unlimited)
 * @returns Usage information including remaining quota
 *
 * @example
 * const usage = await service.checkUsageLimit(userId, 100);
 * if (!usage.canAnalyze) {
 *   throw new Error('Monthly limit exceeded');
 * }
 */
async checkUsageLimit(userId: string, monthlyLimit: number) {
  // Implementation
}
```

## Testing Services

### Unit Tests

```typescript
import { StockAnalysisService } from '@/lib/services/stock-analysis.service';
import { createMockSupabaseClient } from '@/tests/mocks';

describe('StockAnalysisService', () => {
  let service: StockAnalysisService;
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    service = new StockAnalysisService(mockClient);
  });

  it('should create analysis with valid symbol', async () => {
    const params = {
      symbol: 'AAPL',
      analysisType: 'comprehensive' as const,
    };

    const result = await service.createAnalysis('user-123', params);

    expect(result.symbol).toBe('AAPL');
    expect(result.userId).toBe('user-123');
  });

  it('should reject invalid symbol', async () => {
    const params = {
      symbol: 'invalid123',
      analysisType: 'comprehensive' as const,
    };

    await expect(
      service.createAnalysis('user-123', params)
    ).rejects.toThrow('Invalid stock symbol format');
  });
});
```

### Integration Tests

```typescript
import { createServerClient } from '@supabase/supabase-js';
import { StockAnalysisService } from '@/lib/services/stock-analysis.service';

describe('StockAnalysisService Integration', () => {
  let service: StockAnalysisService;

  beforeAll(() => {
    const client = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    service = new StockAnalysisService(client);
  });

  it('should create and retrieve analysis', async () => {
    const created = await service.createAnalysis('user-123', {
      symbol: 'AAPL',
      analysisType: 'comprehensive',
    });

    const retrieved = await service.getAnalysis(created.id);

    expect(retrieved).toMatchObject(created);
  });
});
```

## Future Enhancements

1. **Caching Layer**: Add Redis for expensive operations
2. **Event System**: Emit events for analytics and webhooks
3. **Rate Limiting**: Implement per-user rate limits
4. **Audit Logging**: Track all service operations
5. **Background Jobs**: Queue long-running operations
6. **Webhooks**: Notify external systems of changes

## Related Documentation

- [Repository Layer](./REPOSITORY_LAYER.md)
- [Foundation Libraries](./FOUNDATION_LIBRARIES.md)
- [Domain Models](./DOMAIN_MODELS.md)
