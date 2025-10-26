import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

/**
 * useStockAnalysis Hook Tests
 *
 * These tests verify the TanStack Query integration for stock analysis.
 * Once the hook is implemented, uncomment and update the import.
 */

// TODO: Uncomment when hook is implemented
// import { useStockAnalysis } from '@/hooks/use-stock-analysis';

// Mock fetch globally
global.fetch = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useStockAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it.skip('should fetch analysis when ticker is provided', async () => {
    const mockData = {
      ticker: 'AAPL',
      recommendation: 'BUY',
      confidence: 0.85,
      analysis_type: 'free',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    // const { result } = renderHook(() => useStockAnalysis('AAPL'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // expect(result.current.data).toEqual(mockData);
    // expect(global.fetch).toHaveBeenCalledWith(
    //   expect.stringContaining('/api/analyze/AAPL'),
    //   expect.any(Object)
    // );
  });

  it.skip('should not fetch when ticker is null', () => {
    // const { result } = renderHook(() => useStockAnalysis(null), {
    //   wrapper: createWrapper(),
    // });

    // expect(result.current.isPending).toBe(true);
    // expect(result.current.fetchStatus).toBe('idle');
    // expect(global.fetch).not.toHaveBeenCalled();
  });

  it.skip('should not fetch when ticker is undefined', () => {
    // const { result } = renderHook(() => useStockAnalysis(undefined), {
    //   wrapper: createWrapper(),
    // });

    // expect(result.current.isPending).toBe(true);
    // expect(result.current.fetchStatus).toBe('idle');
    // expect(global.fetch).not.toHaveBeenCalled();
  });

  it.skip('should handle fetch errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // const { result } = renderHook(() => useStockAnalysis('INVALID'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isError).toBe(true));

    // expect(result.current.error).toBeDefined();
    // expect(result.current.data).toBeUndefined();
  });

  it.skip('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    // const { result } = renderHook(() => useStockAnalysis('AAPL'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isError).toBe(true));

    // expect(result.current.error).toBeDefined();
  });

  it.skip('should refetch when ticker changes', async () => {
    const mockDataApple = { ticker: 'AAPL', recommendation: 'BUY' };
    const mockDataGoogle = { ticker: 'GOOGL', recommendation: 'HOLD' };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataApple,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockDataGoogle,
      });

    // const { result, rerender } = renderHook(
    //   ({ ticker }) => useStockAnalysis(ticker),
    //   {
    //     wrapper: createWrapper(),
    //     initialProps: { ticker: 'AAPL' },
    //   }
    // );

    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toEqual(mockDataApple);

    // Change ticker
    // rerender({ ticker: 'GOOGL' });

    // await waitFor(() => expect(result.current.data).toEqual(mockDataGoogle));
    // expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it.skip('should use cached data for same ticker', async () => {
    const mockData = { ticker: 'AAPL', recommendation: 'BUY' };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    // First render
    // const { result: result1, unmount } = renderHook(() => useStockAnalysis('AAPL'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result1.current.isSuccess).toBe(true));
    // expect(global.fetch).toHaveBeenCalledTimes(1);

    // unmount();

    // Second render - should use cache
    // const { result: result2 } = renderHook(() => useStockAnalysis('AAPL'), {
    //   wrapper: createWrapper(),
    // });

    // expect(result2.current.data).toEqual(mockData);
    // expect(global.fetch).toHaveBeenCalledTimes(1); // Still only 1 call
  });

  it.skip('should support different analysis types', async () => {
    const mockData = { ticker: 'AAPL', recommendation: 'BUY', analysis_type: 'detailed' };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    // const { result } = renderHook(
    //   () => useStockAnalysis('AAPL', { analysisType: 'detailed' }),
    //   {
    //     wrapper: createWrapper(),
    //   }
    // );

    // await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // expect(global.fetch).toHaveBeenCalledWith(
    //   expect.stringContaining('analysisType=detailed'),
    //   expect.any(Object)
    // );
  });

  it.skip('should handle 404 not found', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    // const { result } = renderHook(() => useStockAnalysis('NOTFOUND'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it.skip('should handle 401 unauthorized', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    // const { result } = renderHook(() => useStockAnalysis('AAPL'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it.skip('should handle rate limiting (429)', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({ 'Retry-After': '60' }),
    });

    // const { result } = renderHook(() => useStockAnalysis('AAPL'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it.skip('should provide loading state', () => {
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ ticker: 'AAPL' }),
              }),
            100
          )
        )
    );

    // const { result } = renderHook(() => useStockAnalysis('AAPL'), {
    //   wrapper: createWrapper(),
    // });

    // expect(result.current.isPending).toBe(true);
    // expect(result.current.isLoading).toBe(true);
  });

  it.skip('should support manual refetch', async () => {
    const mockData1 = { ticker: 'AAPL', recommendation: 'BUY' };
    const mockData2 = { ticker: 'AAPL', recommendation: 'HOLD' };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2,
      });

    // const { result } = renderHook(() => useStockAnalysis('AAPL'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // expect(result.current.data).toEqual(mockData1);

    // Manual refetch
    // await result.current.refetch();

    // expect(result.current.data).toEqual(mockData2);
    // expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
