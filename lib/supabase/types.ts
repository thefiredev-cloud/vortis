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
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
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
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
