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

    // AI-powered stock analysis with Claude Opus 4.5
    const endTimer = logger.time('stock-analysis');
    const analysis = AI_ENABLED
      ? await analyzeStockWithAI({
          ticker: sanitizedTicker,
          analysisType: userId ? 'comprehensive' : 'technical',
        })
      : generateMockAnalysis(sanitizedTicker);
    endTimer();

    // Store the analysis
    await supabase.from('stock_analyses').insert({
      user_id: userId || null,
      ticker: sanitizedTicker,
      analysis_type: userId ? 'basic' : 'free',
      request_data: { ticker },
      response_data: analysis,
      ai_model: AI_MODEL_DISPLAY,
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

// Stock analysis is now handled by /lib/ai/stock-analysis-ai.service.ts
// using Claude Opus 4.5 for AI-powered analysis
