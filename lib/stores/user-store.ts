import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultTimeframe: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL';
  defaultAnalysisType: 'fundamental' | 'technical' | 'comprehensive';
  emailNotifications: boolean;
  pushNotifications: boolean;
  priceAlerts: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planName: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  limits: {
    analyses: number; // -1 for unlimited
    realTimeData: boolean;
    advancedSignals: boolean;
    priorityProcessing: boolean;
    apiAccess: boolean;
  };
}

export interface UserStats {
  totalAnalyses: number;
  analysesThisMonth: number;
  watchlistCount: number;
  favoriteStocks: string[];
}

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  subscription: UserSubscription | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setProfile: (profile: UserProfile | null) => void;
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setSubscription: (subscription: UserSubscription | null) => void;
  setStats: (stats: UserStats | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: UserState = {
  profile: null,
  preferences: {
    theme: 'system',
    defaultTimeframe: '1M',
    defaultAnalysisType: 'comprehensive',
    emailNotifications: true,
    pushNotifications: false,
    priceAlerts: true,
  },
  subscription: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setProfile: (profile) =>
          set({ profile, error: null }, false, 'setProfile'),

        setPreferences: (preferences) =>
          set(
            (state) => ({
              preferences: { ...state.preferences, ...preferences },
              error: null,
            }),
            false,
            'setPreferences'
          ),

        setSubscription: (subscription) =>
          set({ subscription, error: null }, false, 'setSubscription'),

        setStats: (stats) =>
          set({ stats, error: null }, false, 'setStats'),

        setLoading: (isLoading) =>
          set({ isLoading }, false, 'setLoading'),

        setError: (error) =>
          set({ error, isLoading: false }, false, 'setError'),

        reset: () =>
          set({ ...initialState }, false, 'reset'),
      }),
      {
        name: 'vortis-user-storage',
        partialize: (state) => ({
          preferences: state.preferences,
        }),
      }
    ),
    { name: 'UserStore' }
  )
);
