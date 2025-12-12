import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';
import { RateLimiter, RateLimitPresets, getIdentifier, addRateLimitHeaders } from '@/lib/rate-limit';
import { analyzeStockWithAI, generateMockAnalysis } from '@/lib/ai/stock-analysis-ai.service';
import { AI_MODEL_DISPLAY, AI_ENABLED } from '@/lib/ai/anthropic-client';

// Ticker validation regex: 1-5 uppercase letters only
const TICKER_REGEX = /^[A-Z]{1,5}$/;

// Rate limiter for analysis endpoint
const rateLimiter = new RateLimiter(RateLimitPresets.ANALYZE);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user ID early for rate limiting
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();

    // Apply rate limiting (10 requests per hour per user/IP)
    const identifier = getIdentifier(request, userId);
    const rateLimitResult = await rateLimiter.check(identifier);

    if (!rateLimitResult.allowed) {
      const headers = new Headers();
      addRateLimitHeaders(headers, rateLimitResult);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many analysis requests. Please try again in ${rateLimitResult.resetIn} seconds.`,
          retryAfter: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    const { ticker } = await request.json();

    if (!ticker || typeof ticker !== 'string') {
      logger.warn('Invalid ticker in analysis request', { ticker });
      return NextResponse.json(
        { error: 'Valid stock ticker is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate ticker
    const sanitizedTicker = ticker.trim().toUpperCase().substring(0, 5);

    if (!TICKER_REGEX.test(sanitizedTicker)) {
      logger.warn('Invalid ticker format', { ticker, sanitizedTicker });
      return NextResponse.json(
        { error: 'Invalid ticker format. Must be 1-5 uppercase letters.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if user has reached their limit
    if (userId) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_name, status')
        .eq('user_id', userId)
        .single();

      if (subscription && subscription.status === 'active') {
        // Check usage limits
        const { data: usage } = await supabase
          .from('usage_tracking')
          .select('analyses_used, analyses_limit')
          .eq('user_id', userId)
          .single();

        if (usage && usage.analyses_limit !== -1 && usage.analyses_used >= usage.analyses_limit) {
          securityLogger.rateLimitExceeded(userId, '/api/analyze', {
            analysesUsed: usage.analyses_used,
            analysesLimit: usage.analyses_limit,
          });
          return NextResponse.json(
            { error: 'Analysis limit reached for your plan' },
            { status: 429 }
          );
        }
      }
    }

    // TODO: Connect to Octagon MCP for actual stock data
    // For now, we'll return a mock response
    const endTimer = logger.time('stock-analysis');
    const analysis = await analyzeStock(sanitizedTicker);
    endTimer();

    // Store the analysis
    await supabase.from('stock_analyses').insert({
      user_id: userId || null,
      ticker: sanitizedTicker,
      analysis_type: userId ? 'basic' : 'free',
      request_data: { ticker },
      response_data: analysis,
      ai_model: 'claude-sonnet-4.5',
    });

    // Update usage tracking if user is authenticated
    if (userId) {
      await supabase.rpc('increment_usage', { p_user_id: userId });
    }

    logger.info('Stock analysis completed', {
      userId: userId || undefined,
      ticker: sanitizedTicker,
      analysisType: userId ? 'basic' : 'free',
    });

    // Add rate limit headers to successful response
    const responseHeaders = new Headers();
    addRateLimitHeaders(responseHeaders, rateLimitResult);

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      {
        headers: responseHeaders,
      }
    );
  } catch (error) {
    logger.error('Stock analysis failed', error as Error, {
      ticker: await request.json().then(j => j.ticker).catch(() => null),
    });
    return NextResponse.json(
      { error: 'Failed to analyze stock' },
      { status: 500 }
    );
  }
}

interface StockAnalysis {
  ticker: string;
  timestamp: string;
  analysis: {
    recommendation: string;
    confidence: number;
    targetPrice: number;
    currentPrice: number;
    technicalIndicators: {
      rsi: number;
      macd: string;
      sma50: number;
      sma200: number;
    };
    fundamentals: {
      peRatio: number;
      epsGrowth: number;
      debtToEquity: number;
    };
    sentiment: {
      score: number;
      trend: string;
    };
    summary: string;
  };
}

async function analyzeStock(ticker: string): Promise<StockAnalysis> {
  // TODO: Integrate with Octagon MCP for real stock data
  // This is a placeholder that will be replaced with actual MCP integration

  return {
    ticker: ticker.toUpperCase(),
    timestamp: new Date().toISOString(),
    analysis: {
      recommendation: 'HOLD',
      confidence: 0.75,
      targetPrice: 175.50,
      currentPrice: 172.30,
      technicalIndicators: {
        rsi: 58.5,
        macd: 'Bullish',
        sma50: 168.20,
        sma200: 165.40,
      },
      fundamentals: {
        peRatio: 28.5,
        epsGrowth: 12.3,
        debtToEquity: 1.85,
      },
      sentiment: {
        score: 0.65,
        trend: 'Positive',
      },
      summary: `AI-powered analysis for ${ticker.toUpperCase()} suggests a HOLD position with moderate confidence. Technical indicators show bullish momentum with RSI at 58.5 and positive MACD. The stock is trading above both 50-day and 200-day moving averages, indicating a strong uptrend. Fundamentals show healthy growth with 12.3% EPS growth year-over-year.`,
    },
  };
}
