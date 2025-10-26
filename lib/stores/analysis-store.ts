import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AnalysisResult {
  id: string;
  userId: string;
  symbol: string;
  analysisType: 'fundamental' | 'technical' | 'comprehensive';
  timeframe?: string;
  summary: string;
  metrics: Record<string, unknown>;
  signals: Array<{
    type: 'buy' | 'sell' | 'hold';
    strength: number;
    reason: string;
  }>;
  createdAt: string;
  completedAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface AnalysisFilter {
  symbols?: string[];
  analysisTypes?: Array<'fundamental' | 'technical' | 'comprehensive'>;
  timeframes?: string[];
  status?: Array<'pending' | 'processing' | 'completed' | 'failed'>;
  dateFrom?: string;
  dateTo?: string;
}

interface AnalysisState {
  recentAnalyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  filter: AnalysisFilter;
  isLoading: boolean;
  error: string | null;
}

interface AnalysisActions {
  setRecentAnalyses: (analyses: AnalysisResult[]) => void;
  addAnalysis: (analysis: AnalysisResult) => void;
  updateAnalysis: (id: string, updates: Partial<AnalysisResult>) => void;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  setFilter: (filter: Partial<AnalysisFilter>) => void;
  clearFilter: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AnalysisState = {
  recentAnalyses: [],
  currentAnalysis: null,
  filter: {},
  isLoading: false,
  error: null,
};

export const useAnalysisStore = create<AnalysisState & AnalysisActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setRecentAnalyses: (recentAnalyses) =>
        set({ recentAnalyses, error: null }, false, 'setRecentAnalyses'),

      addAnalysis: (analysis) =>
        set(
          (state) => ({
            recentAnalyses: [analysis, ...state.recentAnalyses].slice(0, 50),
            error: null,
          }),
          false,
          'addAnalysis'
        ),

      updateAnalysis: (id, updates) =>
        set(
          (state) => ({
            recentAnalyses: state.recentAnalyses.map((a) =>
              a.id === id ? { ...a, ...updates } : a
            ),
            currentAnalysis:
              state.currentAnalysis?.id === id
                ? { ...state.currentAnalysis, ...updates }
                : state.currentAnalysis,
            error: null,
          }),
          false,
          'updateAnalysis'
        ),

      setCurrentAnalysis: (currentAnalysis) =>
        set({ currentAnalysis, error: null }, false, 'setCurrentAnalysis'),

      setFilter: (filter) =>
        set(
          (state) => ({ filter: { ...state.filter, ...filter }, error: null }),
          false,
          'setFilter'
        ),

      clearFilter: () =>
        set({ filter: {} }, false, 'clearFilter'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'setLoading'),

      setError: (error) =>
        set({ error, isLoading: false }, false, 'setError'),

      reset: () =>
        set({ ...initialState }, false, 'reset'),
    }),
    { name: 'AnalysisStore' }
  )
);
