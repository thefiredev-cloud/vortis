import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { ticker } = await request.json();

    if (!ticker || typeof ticker !== 'string') {
      return NextResponse.json(
        { error: 'Valid stock ticker is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user has reached their limit
    if (user) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_name, status')
        .eq('user_id', user.id)
        .single();

      if (subscription && subscription.status === 'active') {
        // Check usage limits
        const { data: usage } = await supabase
          .from('usage_tracking')
          .select('analyses_used, analyses_limit')
          .eq('user_id', user.id)
          .single();

        if (usage && usage.analyses_limit !== -1 && usage.analyses_used >= usage.analyses_limit) {
          return NextResponse.json(
            { error: 'Analysis limit reached for your plan' },
            { status: 429 }
          );
        }
      }
    }

    // TODO: Connect to Octagon MCP for actual stock data
    // For now, we'll return a mock response
    const analysis = await analyzeStock(ticker);

    // Store the analysis
    await supabase.from('stock_analyses').insert({
      user_id: user?.id || null,
      ticker: ticker.toUpperCase(),
      analysis_type: user ? 'basic' : 'free',
      request_data: { ticker },
      response_data: analysis,
      ai_model: 'claude-sonnet-4.5',
    });

    // Update usage tracking if user is authenticated
    if (user) {
      await supabase.rpc('increment_usage', { p_user_id: user.id });
    }

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze stock' },
      { status: 500 }
    );
  }
}

async function analyzeStock(ticker: string) {
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
