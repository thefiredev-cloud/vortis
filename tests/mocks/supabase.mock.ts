import { vi } from 'vitest';

/**
 * Mock Supabase client for testing
 *
 * This provides a fluent interface that matches the Supabase JS client
 * for testing repositories and services without real database calls.
 */
export function createMockSupabaseClient() {
  const mockData: any = { data: null, error: null };

  const mockClient = {
    // Query builder methods
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),

    // Filter methods
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),

    // Modifier methods
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),

    // Execution methods
    single: vi.fn().mockResolvedValue(mockData),
    maybeSingle: vi.fn().mockResolvedValue(mockData),
    then: vi.fn((resolve) => resolve(mockData)),

    // RPC and auth
    rpc: vi.fn().mockReturnThis(),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  };

  return mockClient;
}

/**
 * Create a mock Supabase response
 */
export function createMockResponse<T>(data: T, error: any = null) {
  return { data, error };
}

/**
 * Create a mock Supabase error
 */
export function createMockError(message: string, code = '500') {
  return {
    message,
    code,
    details: '',
    hint: '',
  };
}

/**
 * Helper to configure mock responses
 */
export function configureMock(
  mockClient: any,
  method: 'single' | 'maybeSingle' | 'then',
  response: any
) {
  mockClient[method].mockResolvedValue(response);
  return mockClient;
}
