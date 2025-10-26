import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

/**
 * useWatchlist Hook Tests
 *
 * These tests verify the TanStack Query integration for watchlist operations.
 * Once the hook is implemented, uncomment and update the import.
 */

// TODO: Uncomment when hook is implemented
// import { useWatchlists, useWatchlistMutations } from '@/hooks/use-watchlist';

global.fetch = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useWatchlists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it.skip('should fetch watchlists for user', async () => {
    const mockWatchlists = [
      { id: '1', name: 'Tech Stocks', user_id: 'user1' },
      { id: '2', name: 'Value Plays', user_id: 'user1' },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWatchlists,
    });

    // const { result } = renderHook(() => useWatchlists('user1'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // expect(result.current.data).toEqual(mockWatchlists);
    // expect(global.fetch).toHaveBeenCalledWith(
    //   expect.stringContaining('/api/watchlists'),
    //   expect.any(Object)
    // );
  });

  it.skip('should not fetch when user id is null', () => {
    // const { result } = renderHook(() => useWatchlists(null), {
    //   wrapper: createWrapper(),
    // });

    // expect(result.current.isPending).toBe(true);
    // expect(result.current.fetchStatus).toBe('idle');
    // expect(global.fetch).not.toHaveBeenCalled();
  });

  it.skip('should return empty array when user has no watchlists', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    // const { result } = renderHook(() => useWatchlists('user1'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // expect(result.current.data).toEqual([]);
  });

  it.skip('should handle fetch errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // const { result } = renderHook(() => useWatchlists('user1'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useWatchlistMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it.skip('should create a new watchlist', async () => {
    const newWatchlist = {
      id: '1',
      name: 'Tech Stocks',
      user_id: 'user1',
      created_at: new Date().toISOString(),
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => newWatchlist,
    });

    // const { result } = renderHook(() => useWatchlistMutations(), {
    //   wrapper: createWrapper(),
    // });

    // await result.current.createWatchlist.mutateAsync({
    //   name: 'Tech Stocks',
    //   user_id: 'user1',
    // });

    // await waitFor(() => expect(result.current.createWatchlist.isSuccess).toBe(true));

    // expect(result.current.createWatchlist.data).toEqual(newWatchlist);
    // expect(global.fetch).toHaveBeenCalledWith(
    //   expect.stringContaining('/api/watchlists'),
    //   expect.objectContaining({
    //     method: 'POST',
    //   })
    // );
  });

  it.skip('should update a watchlist', async () => {
    const updatedWatchlist = {
      id: '1',
      name: 'Updated Name',
      user_id: 'user1',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedWatchlist,
    });

    // const { result } = renderHook(() => useWatchlistMutations(), {
    //   wrapper: createWrapper(),
    // });

    // await result.current.updateWatchlist.mutateAsync({
    //   id: '1',
    //   name: 'Updated Name',
    // });

    // await waitFor(() => expect(result.current.updateWatchlist.isSuccess).toBe(true));

    // expect(global.fetch).toHaveBeenCalledWith(
    //   expect.stringContaining('/api/watchlists/1'),
    //   expect.objectContaining({
    //     method: 'PATCH',
    //   })
    // );
  });

  it.skip('should delete a watchlist', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // const { result } = renderHook(() => useWatchlistMutations(), {
    //   wrapper: createWrapper(),
    // });

    // await result.current.deleteWatchlist.mutateAsync('1');

    // await waitFor(() => expect(result.current.deleteWatchlist.isSuccess).toBe(true));

    // expect(global.fetch).toHaveBeenCalledWith(
    //   expect.stringContaining('/api/watchlists/1'),
    //   expect.objectContaining({
    //     method: 'DELETE',
    //   })
    // );
  });

  it.skip('should add ticker to watchlist', async () => {
    const mockItem = {
      id: 'item-1',
      watchlist_id: '1',
      ticker: 'AAPL',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem,
    });

    // const { result } = renderHook(() => useWatchlistMutations(), {
    //   wrapper: createWrapper(),
    // });

    // await result.current.addTicker.mutateAsync({
    //   watchlist_id: '1',
    //   ticker: 'AAPL',
    // });

    // await waitFor(() => expect(result.current.addTicker.isSuccess).toBe(true));

    // expect(global.fetch).toHaveBeenCalledWith(
    //   expect.stringContaining('/api/watchlists/1/tickers'),
    //   expect.objectContaining({
    //     method: 'POST',
    //   })
    // );
  });

  it.skip('should remove ticker from watchlist', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // const { result } = renderHook(() => useWatchlistMutations(), {
    //   wrapper: createWrapper(),
    // });

    // await result.current.removeTicker.mutateAsync({
    //   watchlist_id: '1',
    //   ticker: 'AAPL',
    // });

    // await waitFor(() => expect(result.current.removeTicker.isSuccess).toBe(true));

    // expect(global.fetch).toHaveBeenCalledWith(
    //   expect.stringContaining('/api/watchlists/1/tickers/AAPL'),
    //   expect.objectContaining({
    //     method: 'DELETE',
    //   })
    // );
  });

  it.skip('should handle mutation errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    // const { result } = renderHook(() => useWatchlistMutations(), {
    //   wrapper: createWrapper(),
    // });

    // try {
    //   await result.current.createWatchlist.mutateAsync({
    //     name: '',
    //     user_id: 'user1',
    //   });
    // } catch (error) {
    //   expect(error).toBeDefined();
    // }

    // await waitFor(() => expect(result.current.createWatchlist.isError).toBe(true));
  });

  it.skip('should invalidate queries after successful mutation', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', name: 'Tech Stocks' }),
    });

    // const wrapper = ({ children }: { children: ReactNode }) => (
    //   <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    // );

    // const { result } = renderHook(() => useWatchlistMutations(), { wrapper });

    // await result.current.createWatchlist.mutateAsync({
    //   name: 'Tech Stocks',
    //   user_id: 'user1',
    // });

    // await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());
  });

  it.skip('should support optimistic updates', async () => {
    const existingWatchlists = [
      { id: '1', name: 'Tech Stocks', user_id: 'user1' },
    ];

    // Mock initial fetch
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => existingWatchlists,
      })
      // Mock mutation
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '2',
          name: 'Value Plays',
          user_id: 'user1',
        }),
      });

    // const { result: watchlistsResult } = renderHook(() => useWatchlists('user1'), {
    //   wrapper: createWrapper(),
    // });

    // await waitFor(() => expect(watchlistsResult.current.isSuccess).toBe(true));

    // const { result: mutationsResult } = renderHook(() => useWatchlistMutations(), {
    //   wrapper: createWrapper(),
    // });

    // Trigger optimistic update
    // mutationsResult.current.createWatchlist.mutate({
    //   name: 'Value Plays',
    //   user_id: 'user1',
    // });

    // Watchlist should be optimistically added before mutation completes
    // expect(watchlistsResult.current.data).toContainEqual(
    //   expect.objectContaining({ name: 'Value Plays' })
    // );
  });
});
