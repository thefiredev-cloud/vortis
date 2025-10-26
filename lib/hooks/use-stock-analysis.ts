import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { StockAnalysisService } from '../services/stock-analysis.service';
import {
  CreateAnalysisParams,
  UpdateAnalysisParams,
  AnalysisListParams,
} from '../models/stock-analysis.model';

const getService = () => {
  const supabase = createClient();
  return new StockAnalysisService(supabase);
};

export const analysisKeys = {
  all: ['analyses'] as const,
  lists: () => [...analysisKeys.all, 'list'] as const,
  list: (userId: string, params?: AnalysisListParams) =>
    [...analysisKeys.lists(), userId, params] as const,
  details: () => [...analysisKeys.all, 'detail'] as const,
  detail: (id: string) => [...analysisKeys.details(), id] as const,
  recent: (userId: string, limit?: number) =>
    [...analysisKeys.all, 'recent', userId, limit] as const,
  bySymbol: (symbol: string, userId?: string) =>
    [...analysisKeys.all, 'symbol', symbol, userId] as const,
  stats: (userId: string) => [...analysisKeys.all, 'stats', userId] as const,
  usage: (userId: string, limit: number) =>
    [...analysisKeys.all, 'usage', userId, limit] as const,
};

export function useAnalysis(analysisId: string) {
  return useQuery({
    queryKey: analysisKeys.detail(analysisId),
    queryFn: async () => {
      const service = getService();
      return service.getAnalysis(analysisId);
    },
    enabled: Boolean(analysisId),
  });
}

export function useUserAnalyses(userId: string, params?: AnalysisListParams) {
  return useQuery({
    queryKey: analysisKeys.list(userId, params),
    queryFn: async () => {
      const service = getService();
      return service.getUserAnalyses(userId, params);
    },
    enabled: Boolean(userId),
  });
}

export function useRecentAnalyses(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: analysisKeys.recent(userId, limit),
    queryFn: async () => {
      const service = getService();
      return service.getRecentAnalyses(userId, limit);
    },
    enabled: Boolean(userId),
  });
}

export function useAnalysesBySymbol(symbol: string, userId?: string) {
  return useQuery({
    queryKey: analysisKeys.bySymbol(symbol, userId),
    queryFn: async () => {
      const service = getService();
      return service.getAnalysesBySymbol(symbol, userId);
    },
    enabled: Boolean(symbol),
  });
}

export function useAnalysisStats(userId: string) {
  return useQuery({
    queryKey: analysisKeys.stats(userId),
    queryFn: async () => {
      const service = getService();
      return service.getUserStats(userId);
    },
    enabled: Boolean(userId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAnalysisUsage(userId: string, monthlyLimit: number) {
  return useQuery({
    queryKey: analysisKeys.usage(userId, monthlyLimit),
    queryFn: async () => {
      const service = getService();
      return service.checkUsageLimit(userId, monthlyLimit);
    },
    enabled: Boolean(userId),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      params,
    }: {
      userId: string;
      params: CreateAnalysisParams;
    }) => {
      const service = getService();
      return service.createAnalysis(userId, params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: analysisKeys.stats(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: analysisKeys.recent(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: analysisKeys.bySymbol(variables.params.symbol, variables.userId),
      });
      queryClient.setQueryData(analysisKeys.detail(data.id), data);
    },
  });
}

export function useUpdateAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      analysisId,
      params,
    }: {
      analysisId: string;
      params: UpdateAnalysisParams;
    }) => {
      const service = getService();
      return service.updateAnalysis(analysisId, params);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
      queryClient.invalidateQueries({ queryKey: analysisKeys.recent(data.userId) });
      queryClient.setQueryData(analysisKeys.detail(data.id), data);
    },
  });
}

export function useDeleteAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      analysisId,
      userId,
    }: {
      analysisId: string;
      userId: string;
    }) => {
      const service = getService();
      return service.deleteAnalysis(analysisId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: analysisKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: analysisKeys.stats(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: analysisKeys.recent(variables.userId),
      });
      queryClient.removeQueries({ queryKey: analysisKeys.detail(variables.analysisId) });
    },
  });
}
