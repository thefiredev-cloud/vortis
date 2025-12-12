import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * TypeScript types for stock analysis data
 */
interface BasicInfo {
  companyName: string;
  ticker: string;
  price: number;
  marketCap: number;
  currency: string;
}

interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
    trend: 'Bullish' | 'Bearish' | 'Neutral';
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    ema12: number;
    ema26: number;
  };
}

interface SECFilings {
  latest10K: {
    filedDate: string;
    url: string;
    summary: string;
  } | null;
  latest10Q: {
    filedDate: string;
    url: string;
    summary: string;
  } | null;
  recent8K: Array<{
    filedDate: string;
    url: string;
    subject: string;
  }>;
}

interface EarningsData {
  nextEarningsDate: string | null;
  lastEarnings: {
    date: string;
    epsActual: number;
    epsEstimate: number;
    surprise: number;
    surprisePercent: number;
  } | null;
  annualMetrics: {
    revenue: number;
    revenueGrowth: number;
    netIncome: number;
    eps: number;
    peRatio: number;
  };
}

interface SentimentScore {
  overall: number;
  breakdown: {
    newsArticles: number;
    socialMedia: number;
    analystRatings: number;
  };
  trend: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative';
  sources: number;
}

interface StockAnalysis {
  basicInfo: BasicInfo;
  technicalIndicators: TechnicalIndicators;
  secFilings: SECFilings;
  earningsData: EarningsData;
  sentimentScore: SentimentScore;
  recommendation: {
    action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    confidence: number;
    targetPrice: number;
    timeframe: string;
  };
  summary: string;
  timestamp: string;
}

// Plan limits are defined in subscription service
// Keeping interface for reference
interface _PlanLimits {
  free: number;
  starter: number;
  pro: number;
  enterprise: number;
}

/**
 * Validates stock ticker format
 * Must be 1-5 uppercase letters
 */
function validateTicker(ticker: string): { valid: boolean; error?: string } {
  if (!ticker || typeof ticker !== 'string') {
    return { valid: false, error: 'Ticker is required' };
  }

  const trimmedTicker = ticker.trim();

  if (trimmedTicker.length < 1 || trimmedTicker.length > 5) {
    return { valid: false, error: 'Ticker must be between 1 and 5 characters' };
  }

  const tickerRegex = /^[A-Z]{1,5}$/;
  if (!tickerRegex.test(trimmedTicker)) {
    return {
      valid: false,
      error: 'Ticker must contain only uppercase letters (A-Z)'
    };
  }

  return { valid: true };
}

/**
 * Generates mock stock analysis data
 * TODO: Replace with real data from market data APIs and AI analysis
 */
function generateMockAnalysis(ticker: string): StockAnalysis {
  const mockPrices: Record<string, number> = {
    AAPL: 178.25,
    MSFT: 412.50,
    GOOGL: 138.75,
    AMZN: 176.90,
    TSLA: 248.30,
  };

  const mockCompanies: Record<string, string> = {
    AAPL: 'Apple Inc.',
    MSFT: 'Microsoft Corporation',
    GOOGL: 'Alphabet Inc.',
    AMZN: 'Amazon.com Inc.',
    TSLA: 'Tesla Inc.',
  };

  const basePrice = mockPrices[ticker] || 150.00 + Math.random() * 100;
  const marketCap = basePrice * (1000000000 + Math.random() * 2000000000);

  return {
    basicInfo: {
      companyName: mockCompanies[ticker] || `${ticker} Corporation`,
      ticker: ticker,
      price: basePrice,
      marketCap: marketCap,
      currency: 'USD',
    },
    technicalIndicators: {
      rsi: 45 + Math.random() * 30,
      macd: {
        value: (Math.random() - 0.5) * 5,
        signal: (Math.random() - 0.5) * 5,
        histogram: (Math.random() - 0.5) * 2,
        trend: Math.random() > 0.5 ? 'Bullish' : Math.random() > 0.25 ? 'Bearish' : 'Neutral',
      },
      movingAverages: {
        sma20: basePrice * (0.95 + Math.random() * 0.1),
        sma50: basePrice * (0.90 + Math.random() * 0.15),
        sma200: basePrice * (0.85 + Math.random() * 0.2),
        ema12: basePrice * (0.96 + Math.random() * 0.08),
        ema26: basePrice * (0.92 + Math.random() * 0.12),
      },
    },
    secFilings: {
      latest10K: {
        filedDate: '2024-02-01',
        url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=10-K`,
        summary: 'Annual report showing strong revenue growth and improved operational efficiency. Management discusses expansion into new markets and R&D investments.',
      },
      latest10Q: {
        filedDate: '2024-08-01',
        url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=10-Q`,
        summary: 'Quarterly report indicates continued growth momentum with increased market share and improved profit margins.',
      },
      recent8K: [
        {
          filedDate: '2024-09-15',
          url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=8-K`,
          subject: 'Results of Operations and Financial Condition',
        },
        {
          filedDate: '2024-08-20',
          url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=8-K`,
          subject: 'Entry into Material Agreement',
        },
      ],
    },
    earningsData: {
      nextEarningsDate: '2025-11-15',
      lastEarnings: {
        date: '2024-08-01',
        epsActual: 1.52,
        epsEstimate: 1.45,
        surprise: 0.07,
        surprisePercent: 4.83,
      },
      annualMetrics: {
        revenue: 385000000000 + Math.random() * 50000000000,
        revenueGrowth: 8.5 + Math.random() * 10,
        netIncome: 95000000000 + Math.random() * 20000000000,
        eps: 5.80 + Math.random() * 2,
        peRatio: 25 + Math.random() * 15,
      },
    },
    sentimentScore: {
      overall: 0.5 + Math.random() * 0.4,
      breakdown: {
        newsArticles: 0.5 + Math.random() * 0.4,
        socialMedia: 0.4 + Math.random() * 0.5,
        analystRatings: 0.6 + Math.random() * 0.35,
      },
      trend: Math.random() > 0.6 ? 'Positive' : Math.random() > 0.3 ? 'Neutral' : 'Very Positive',
      sources: Math.floor(50 + Math.random() * 100),
    },
    recommendation: {
      action: Math.random() > 0.5 ? 'Buy' : Math.random() > 0.25 ? 'Hold' : 'Strong Buy',
      confidence: 0.65 + Math.random() * 0.3,
      targetPrice: basePrice * (1.05 + Math.random() * 0.15),
      timeframe: '6-12 months',
    },
    summary: `Technical analysis of ${ticker} shows ${Math.random() > 0.5 ? 'bullish' : 'mixed'} signals with RSI in ${Math.random() > 0.5 ? 'neutral' : 'moderate'} territory. The stock is trading ${Math.random() > 0.5 ? 'above' : 'near'} its key moving averages, indicating ${Math.random() > 0.5 ? 'strong' : 'stable'} momentum. Recent SEC filings indicate solid operational performance. Sentiment analysis from multiple sources shows ${Math.random() > 0.5 ? 'positive' : 'neutral'} outlook. Earnings beat expectations last quarter, demonstrating strong execution.`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * GET handler for stock analysis endpoint
 * Route: /api/analyze/[ticker]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const startTime = Date.now();
  const resolvedParams = await params;
  const tickerParam = resolvedParams.ticker.toUpperCase();

  try {
    // Log request
    console.log(`[ANALYSIS] Request received for ticker: ${tickerParam}`);

    // Validate ticker format
    const validation = validateTicker(tickerParam);
    if (!validation.valid) {
      console.warn(`[ANALYSIS] Invalid ticker format: ${tickerParam}`);
      return NextResponse.json(
        {
          error: validation.error,
          code: 'INVALID_TICKER'
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('[ANALYSIS] Auth error:', authError);
    }

    let planName = 'free';
    let userId: string | null = null;

    // Check user authentication and subscription
    if (user) {
      userId = user.id;
      console.log(`[ANALYSIS] Authenticated user: ${userId}`);

      // Fetch user's subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('plan_name, status')
        .eq('user_id', user.id)
        .single();

      if (subError) {
        console.warn('[ANALYSIS] Subscription fetch error:', subError.message);
      } else if (subscription && subscription.status === 'active') {
        planName = subscription.plan_name;
        console.log(`[ANALYSIS] Active subscription: ${planName}`);
      }

      // Check usage limits
      const { data: usage, error: usageError } = await supabase
        .from('usage_tracking')
        .select('analyses_used, analyses_limit, period_end')
        .eq('user_id', user.id)
        .single();

      if (usageError) {
        console.warn('[ANALYSIS] Usage tracking fetch error:', usageError.message);
      } else if (usage) {
        console.log(`[ANALYSIS] Usage: ${usage.analyses_used}/${usage.analyses_limit}`);

        // Check if period has expired
        const periodEnd = new Date(usage.period_end);
        if (periodEnd < new Date()) {
          console.log('[ANALYSIS] Usage period expired, should reset');
          // Note: Period reset should be handled by a cron job or webhook
        }

        // Check if limit reached (skip for unlimited plans with -1)
        if (usage.analyses_limit !== -1 && usage.analyses_used >= usage.analyses_limit) {
          console.warn(`[ANALYSIS] Rate limit exceeded for user ${userId}`);
          return NextResponse.json(
            {
              error: 'Analysis limit reached for your plan',
              code: 'RATE_LIMIT_EXCEEDED',
              usage: {
                used: usage.analyses_used,
                limit: usage.analyses_limit,
                resetDate: usage.period_end,
              },
            },
            { status: 429 }
          );
        }
      }
    } else {
      console.log('[ANALYSIS] Unauthenticated request');
    }

    // Generate analysis (mock data for now)
    console.log(`[ANALYSIS] Generating analysis for ${tickerParam}`);
    const analysis = generateMockAnalysis(tickerParam);

    // Store analysis in database
    const { error: insertError } = await supabase
      .from('stock_analyses')
      .insert({
        user_id: userId,
        ticker: tickerParam,
        analysis_type: userId ? planName as 'free' | 'basic' | 'advanced' | 'enterprise' : 'free',
        request_data: {
          ticker: tickerParam,
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        response_data: analysis,
        ai_model: 'mock-v1', // Will be replaced with actual AI model
      });

    if (insertError) {
      console.error('[ANALYSIS] Failed to store analysis:', insertError);
      // Don't fail the request if storage fails
    }

    // Increment usage counter for authenticated users
    if (userId) {
      const { error: incrementError } = await supabase
        .rpc('increment_usage', { p_user_id: userId });

      if (incrementError) {
        console.error('[ANALYSIS] Failed to increment usage:', incrementError);
        // Don't fail the request if increment fails
      } else {
        console.log(`[ANALYSIS] Usage incremented for user ${userId}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[ANALYSIS] Request completed in ${duration}ms`);

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: analysis,
        meta: {
          plan: planName,
          processingTime: duration,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
        },
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[ANALYSIS] Unexpected error:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('[ANALYSIS] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred while analyzing the stock',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
