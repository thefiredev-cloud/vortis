import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { WatchlistService } from '../services/watchlist.service';
import {
  CreateWatchlistParams,
  UpdateWatchlistParams,
  AddWatchlistItemParams,
  UpdateWatchlistItemParams,
  WatchlistListParams,
} from '../models/watchlist.model';

const getService = () => {
  const supabase = createClient();
  return new WatchlistService(supabase);
};

export const watchlistKeys = {
  all: ['watchlists'] as const,
  lists: () => [...watchlistKeys.all, 'list'] as const,
  list: (userId: string, params?: WatchlistListParams) =>
    [...watchlistKeys.lists(), userId, params] as const,
  public: (params?: WatchlistListParams) =>
    [...watchlistKeys.lists(), 'public', params] as const,
  details: () => [...watchlistKeys.all, 'detail'] as const,
  detail: (id: string) => [...watchlistKeys.details(), id] as const,
  withItems: (id: string) => [...watchlistKeys.detail(id), 'items'] as const,
  items: (id: string) => [...watchlistKeys.all, 'items', id] as const,
  stats: (userId: string) => [...watchlistKeys.all, 'stats', userId] as const,
};

export function useWatchlist(watchlistId: string) {
  return useQuery({
    queryKey: watchlistKeys.detail(watchlistId),
    queryFn: async () => {
      const service = getService();
      return service.getWatchlist(watchlistId);
    },
    enabled: Boolean(watchlistId),
  });
}

export function useWatchlistWithItems(watchlistId: string) {
  return useQuery({
    queryKey: watchlistKeys.withItems(watchlistId),
    queryFn: async () => {
      const service = getService();
      return service.getWatchlistWithItems(watchlistId);
    },
    enabled: Boolean(watchlistId),
  });
}

export function useUserWatchlists(userId: string, params?: WatchlistListParams) {
  return useQuery({
    queryKey: watchlistKeys.list(userId, params),
    queryFn: async () => {
      const service = getService();
      return service.getUserWatchlists(userId, params);
    },
    enabled: Boolean(userId),
  });
}

export function usePublicWatchlists(params?: WatchlistListParams) {
  return useQuery({
    queryKey: watchlistKeys.public(params),
    queryFn: async () => {
      const service = getService();
      return service.getPublicWatchlists(params);
    },
  });
}

export function useWatchlistItems(watchlistId: string) {
  return useQuery({
    queryKey: watchlistKeys.items(watchlistId),
    queryFn: async () => {
      const service = getService();
      return service.getWatchlistItems(watchlistId);
    },
    enabled: Boolean(watchlistId),
  });
}

export function useWatchlistStats(userId: string) {
  return useQuery({
    queryKey: watchlistKeys.stats(userId),
    queryFn: async () => {
      const service = getService();
      return service.getUserStats(userId);
    },
    enabled: Boolean(userId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      params,
    }: {
      userId: string;
      params: CreateWatchlistParams;
    }) => {
      const service = getService();
      return service.createWatchlist(userId, params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.stats(variables.userId),
      });
      queryClient.setQueryData(watchlistKeys.detail(data.id), data);
    },
  });
}

export function useUpdateWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      watchlistId,
      userId,
      params,
    }: {
      watchlistId: string;
      userId: string;
      params: UpdateWatchlistParams;
    }) => {
      const service = getService();
      return service.updateWatchlist(watchlistId, userId, params);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
      queryClient.setQueryData(watchlistKeys.detail(data.id), data);
    },
  });
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      watchlistId,
      userId,
    }: {
      watchlistId: string;
      userId: string;
    }) => {
      const service = getService();
      return service.deleteWatchlist(watchlistId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.stats(variables.userId),
      });
      queryClient.removeQueries({
        queryKey: watchlistKeys.detail(variables.watchlistId),
      });
    },
  });
}

export function useAddStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      watchlistId,
      userId,
      params,
    }: {
      watchlistId: string;
      userId: string;
      params: AddWatchlistItemParams;
    }) => {
      const service = getService();
      return service.addStock(watchlistId, userId, params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.withItems(variables.watchlistId),
      });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.items(variables.watchlistId),
      });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.detail(variables.watchlistId),
      });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.stats(variables.userId),
      });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      userId,
      watchlistId: _watchlistId,
      params,
    }: {
      itemId: string;
      userId: string;
      watchlistId: string;
      params: UpdateWatchlistItemParams;
    }) => {
      const service = getService();
      return service.updateStock(itemId, userId, params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.withItems(variables.watchlistId),
      });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.items(variables.watchlistId),
      });
    },
  });
}

export function useRemoveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      userId,
      watchlistId: _watchlistId,
    }: {
      itemId: string;
      userId: string;
      watchlistId: string;
    }) => {
      const service = getService();
      return service.removeStock(itemId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.withItems(variables.watchlistId),
      });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.items(variables.watchlistId),
      });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.detail(variables.watchlistId),
      });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.stats(variables.userId),
      });
    },
  });
}

export function useReorderStocks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      watchlistId,
      userId,
      itemIds,
    }: {
      watchlistId: string;
      userId: string;
      itemIds: string[];
    }) => {
      const service = getService();
      return service.reorderStocks(watchlistId, userId, itemIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.withItems(variables.watchlistId),
      });
      queryClient.invalidateQueries({
        queryKey: watchlistKeys.items(variables.watchlistId),
      });
    },
  });
}
