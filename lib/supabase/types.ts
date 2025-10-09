export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          company_name: string | null
          phone: string | null
          timezone: string
          email_verified: boolean
          last_login: string | null
          notifications_enabled: boolean
          marketing_emails_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          phone?: string | null
          timezone?: string
          email_verified?: boolean
          last_login?: string | null
          notifications_enabled?: boolean
          marketing_emails_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          phone?: string | null
          timezone?: string
          email_verified?: boolean
          last_login?: string | null
          notifications_enabled?: boolean
          marketing_emails_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          stripe_price_id: string
          plan_name: 'starter' | 'pro' | 'enterprise'
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          trial_start: string | null
          trial_end: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          stripe_price_id: string
          plan_name: 'starter' | 'pro' | 'enterprise'
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_start?: string | null
          trial_end?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          stripe_price_id?: string
          plan_name?: 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_start?: string | null
          trial_end?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      stock_analyses: {
        Row: {
          id: string
          user_id: string | null
          ticker: string
          analysis_type: 'free' | 'basic' | 'advanced' | 'enterprise'
          request_data: Json
          response_data: Json
          ai_model: string
          tags: string[]
          sentiment: 'bullish' | 'bearish' | 'neutral' | null
          is_favorite: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          ticker: string
          analysis_type: 'free' | 'basic' | 'advanced' | 'enterprise'
          request_data: Json
          response_data: Json
          ai_model?: string
          tags?: string[]
          sentiment?: 'bullish' | 'bearish' | 'neutral' | null
          is_favorite?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          ticker?: string
          analysis_type?: 'free' | 'basic' | 'advanced' | 'enterprise'
          request_data?: Json
          response_data?: Json
          ai_model?: string
          tags?: string[]
          sentiment?: 'bullish' | 'bearish' | 'neutral' | null
          is_favorite?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          plan_name: string
          analyses_used: number
          analyses_limit: number
          period_start: string
          period_end: string
          reset_count: number
          last_reset_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_name: string
          analyses_used?: number
          analyses_limit: number
          period_start?: string
          period_end?: string
          reset_count?: number
          last_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_name?: string
          analyses_used?: number
          analyses_limit?: number
          period_start?: string
          period_end?: string
          reset_count?: number
          last_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          ticker: string
          current_price: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ticker: string
          current_price?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ticker?: string
          current_price?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_usage: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
          request_path: string
          request_params: Json
          response_status: number
          response_time_ms: number | null
          ip_address: string | null
          user_agent: string | null
          api_key_id: string | null
          rate_limit_remaining: number | null
          cost_credits: number
          error_message: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
          request_path: string
          request_params?: Json
          response_status: number
          response_time_ms?: number | null
          ip_address?: string | null
          user_agent?: string | null
          api_key_id?: string | null
          rate_limit_remaining?: number | null
          cost_credits?: number
          error_message?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
          request_path?: string
          request_params?: Json
          response_status?: number
          response_time_ms?: number | null
          ip_address?: string | null
          user_agent?: string | null
          api_key_id?: string | null
          rate_limit_remaining?: number | null
          cost_credits?: number
          error_message?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          language: 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja'
          currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY'
          date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          default_chart_type: 'candlestick' | 'line' | 'area' | 'bar'
          default_time_range: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX'
          show_indicators: boolean
          preferred_indicators: string[]
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
          analysis_depth: 'quick' | 'standard' | 'comprehensive'
          auto_save_analyses: boolean
          email_alerts: boolean
          push_notifications: boolean
          price_alert_threshold: number
          daily_digest: boolean
          weekly_summary: boolean
          alert_types: Json
          dashboard_layout: 'grid' | 'list' | 'compact'
          widgets_config: Json
          api_notifications: boolean
          webhook_url: string | null
          advanced_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          language?: 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja'
          currency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY'
          date_format?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          default_chart_type?: 'candlestick' | 'line' | 'area' | 'bar'
          default_time_range?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX'
          show_indicators?: boolean
          preferred_indicators?: string[]
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
          analysis_depth?: 'quick' | 'standard' | 'comprehensive'
          auto_save_analyses?: boolean
          email_alerts?: boolean
          push_notifications?: boolean
          price_alert_threshold?: number
          daily_digest?: boolean
          weekly_summary?: boolean
          alert_types?: Json
          dashboard_layout?: 'grid' | 'list' | 'compact'
          widgets_config?: Json
          api_notifications?: boolean
          webhook_url?: string | null
          advanced_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          language?: 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja'
          currency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY'
          date_format?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          default_chart_type?: 'candlestick' | 'line' | 'area' | 'bar'
          default_time_range?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'MAX'
          show_indicators?: boolean
          preferred_indicators?: string[]
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
          analysis_depth?: 'quick' | 'standard' | 'comprehensive'
          auto_save_analyses?: boolean
          email_alerts?: boolean
          push_notifications?: boolean
          price_alert_threshold?: number
          daily_digest?: boolean
          weekly_summary?: boolean
          alert_types?: Json
          dashboard_layout?: 'grid' | 'list' | 'compact'
          widgets_config?: Json
          api_notifications?: boolean
          webhook_url?: string | null
          advanced_settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      watchlist_alerts: {
        Row: {
          id: string
          user_id: string
          ticker: string
          alert_type: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike'
          target_value: number
          is_active: boolean
          triggered_at: string | null
          triggered_price: number | null
          notification_sent: boolean
          repeat_alert: boolean
          cooldown_hours: number
          last_triggered_at: string | null
          trigger_count: number
          notify_email: boolean
          notify_push: boolean
          notify_webhook: boolean
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ticker: string
          alert_type: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike'
          target_value: number
          is_active?: boolean
          triggered_at?: string | null
          triggered_price?: number | null
          notification_sent?: boolean
          repeat_alert?: boolean
          cooldown_hours?: number
          last_triggered_at?: string | null
          trigger_count?: number
          notify_email?: boolean
          notify_push?: boolean
          notify_webhook?: boolean
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ticker?: string
          alert_type?: 'price_above' | 'price_below' | 'percent_change' | 'volume_spike'
          target_value?: number
          is_active?: boolean
          triggered_at?: string | null
          triggered_price?: number | null
          notification_sent?: boolean
          repeat_alert?: boolean
          cooldown_hours?: number
          last_triggered_at?: string | null
          trigger_count?: number
          notify_email?: boolean
          notify_push?: boolean
          notify_webhook?: boolean
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      usage_analytics: {
        Row: {
          user_id: string
          email: string
          plan_name: string
          analyses_used: number
          analyses_limit: number
          usage_percentage: number
          period_start: string
          period_end: string
          usage_level: 'at_limit' | 'high' | 'medium' | 'low'
          time_remaining: string
        }
      }
      top_analyzed_stocks: {
        Row: {
          ticker: string
          analysis_count: number
          unique_users: number
          last_analyzed: string
          avg_sentiment: number
          analysis_types: Json
        }
      }
    }
    Functions: {
      get_api_usage_stats: {
        Args: {
          p_user_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          total_requests: number
          successful_requests: number
          failed_requests: number
          avg_response_time_ms: number
          total_cost_credits: number
          top_endpoints: Json
        }[]
      }
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_endpoint: string
          p_window_minutes?: number
          p_max_requests?: number
        }
        Returns: {
          allowed: boolean
          current_count: number
          limit_value: number
          reset_at: string
        }[]
      }
      get_user_preferences: {
        Args: {
          p_user_id: string
        }
        Returns: {
          theme: string
          language: string
          currency: string
          default_chart_type: string
          default_time_range: string
          risk_tolerance: string
          all_preferences: Json
        }[]
      }
      check_watchlist_alerts: {
        Args: {
          p_ticker: string
          p_current_price: number
          p_volume?: number
        }
        Returns: {
          alert_id: string
          user_id: string
          alert_type: string
          should_notify: boolean
        }[]
      }
      trigger_alert: {
        Args: {
          p_alert_id: string
          p_triggered_price: number
        }
        Returns: void
      }
      get_user_activity_summary: {
        Args: {
          p_user_id: string
        }
        Returns: {
          total_analyses: number
          analyses_this_month: number
          favorite_stocks: string[]
          avg_analyses_per_day: number
          most_active_day: string
          subscription_plan: string
          account_age_days: number
        }[]
      }
      cleanup_old_api_logs: {
        Args: {
          p_retention_days?: number
        }
        Returns: number
      }
      reset_monthly_usage: {
        Args: Record<string, never>
        Returns: {
          user_id: string
          old_usage: number
          new_limit: number
        }[]
      }
      calculate_mrr: {
        Args: Record<string, never>
        Returns: {
          plan_name: string
          active_subscriptions: number
          estimated_mrr: number
        }[]
      }
      get_churn_analytics: {
        Args: {
          p_days?: number
        }
        Returns: {
          total_cancellations: number
          churn_rate: number
          top_cancellation_plans: Json
          avg_subscription_duration_days: number
        }[]
      }
    }
  }
}

// Helper types for common queries
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type StockAnalysis = Database['public']['Tables']['stock_analyses']['Row']
export type UsageTracking = Database['public']['Tables']['usage_tracking']['Row']
export type Watchlist = Database['public']['Tables']['watchlist']['Row']
export type ApiUsage = Database['public']['Tables']['api_usage']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type WatchlistAlert = Database['public']['Tables']['watchlist_alerts']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type StockAnalysisInsert = Database['public']['Tables']['stock_analyses']['Insert']
export type UsageTrackingInsert = Database['public']['Tables']['usage_tracking']['Insert']
export type WatchlistInsert = Database['public']['Tables']['watchlist']['Insert']
export type ApiUsageInsert = Database['public']['Tables']['api_usage']['Insert']
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert']
export type WatchlistAlertInsert = Database['public']['Tables']['watchlist_alerts']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
export type StockAnalysisUpdate = Database['public']['Tables']['stock_analyses']['Update']
export type UsageTrackingUpdate = Database['public']['Tables']['usage_tracking']['Update']
export type WatchlistUpdate = Database['public']['Tables']['watchlist']['Update']
export type ApiUsageUpdate = Database['public']['Tables']['api_usage']['Update']
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update']
export type WatchlistAlertUpdate = Database['public']['Tables']['watchlist_alerts']['Update']

// Plan types
export type PlanName = 'free' | 'starter' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
export type AnalysisType = 'free' | 'basic' | 'advanced' | 'enterprise'
export type Sentiment = 'bullish' | 'bearish' | 'neutral'

// Plan limits configuration
export const PLAN_LIMITS: Record<PlanName, { analyses: number; features: string[] }> = {
  free: {
    analyses: 5,
    features: ['Basic analysis', 'Limited history']
  },
  starter: {
    analyses: 100,
    features: ['Standard analysis', 'Watchlists', '30-day history']
  },
  pro: {
    analyses: -1, // unlimited
    features: ['Advanced analysis', 'Unlimited watchlists', 'Full history', 'Priority support', 'Export data']
  },
  enterprise: {
    analyses: -1, // unlimited
    features: ['Enterprise analysis', 'API access', 'Custom integrations', 'Dedicated support', 'SLA']
  }
}
