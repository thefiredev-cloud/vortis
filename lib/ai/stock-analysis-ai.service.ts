/**
 * AI-Powered Stock Analysis Service
 *
 * Integrates Claude Opus 4.5 for comprehensive stock analysis including:
 * - Technical analysis interpretation
 * - Fundamental analysis
 * - Sentiment analysis
 * - Risk assessment
 * - Trading signals generation
 */

import {
  getAnthropicClient,
  AI_MODEL,
  AI_MODEL_DISPLAY,
  trackAIUsage,
  AI_ENABLED,
  handleAIError,
} from './anthropic-client';
import { logger } from '@/lib/logger';

export interface StockAnalysisRequest {
  ticker: string;
  analysisType: 'fundamental' | 'technical' | 'comprehensive';
  includeNews?: boolean;
  includeEarnings?: boolean;
  currentPrice?: number;
  marketData?: MarketData;
}

export interface MarketData {
  price: number;
  volume: number;
  change: number;
  changePercent: number;
  high52Week: number;
  low52Week: number;
  marketCap?: number;
  peRatio?: number;
  eps?: number;
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: number;
  confidence: number;
  reason: string;
  source: 'fundamental' | 'technical' | 'sentiment' | 'combined';
}

export interface AnalysisMetrics {
  technical: {
    rsi: number;
    macd: number;
    macdSignal?: number;
    sma50: number;
    sma200: number;
  };
  fundamental?: {
    peRatio: number;
    pbRatio: number;
    roe: number;
    debtToEquity: number;
  };
  sentiment: {
    overallScore: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    positiveCount?: number;
    negativeCount?: number;
    neutralCount?: number;
  };
  risk?: {
    overallRisk: 'low' | 'medium' | 'high' | 'extreme';
    volatilityRisk: number;
    beta: number;
  };
}

export interface AIAnalysisResult {
  summary: string;
  metrics: AnalysisMetrics;
  signals: TradingSignal[];
  recommendation: {
    action: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    confidence: number;
    targetPrice: number;
    timeframe: string;
    rationale: string;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'extreme';
    factors: string[];
  };
  aiModel: string;
  tokensUsed: {
    input: number;
    output: number;
  };
}

const SYSTEM_PROMPT = `You are an expert financial analyst with deep expertise in stock analysis,
technical indicators, fundamental analysis, and market sentiment. You provide clear, actionable
insights based on available data.

Your analysis should be:
- Data-driven and objective
- Clear about confidence levels and uncertainty
- Focused on actionable insights
- Risk-aware with clear disclaimers

IMPORTANT: This is for informational purposes only. You are NOT providing investment advice.
Always include a disclaimer that users should consult with qualified financial advisors.

Always structure your response as valid JSON matching the required schema.`;

export async function analyzeStockWithAI(
  request: StockAnalysisRequest
): Promise<AIAnalysisResult> {
  if (!AI_ENABLED) {
    logger.warn('AI analysis requested but API key not configured, returning mock');
    return generateMockAnalysis(request.ticker);
  }

  const startTime = performance.now();
  const client = getAnthropicClient();

  const userPrompt = buildAnalysisPrompt(request);

  try {
    logger.info('Starting AI stock analysis', {
      ticker: request.ticker,
      analysisType: request.analysisType,
    });

    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const latencyMs = Math.round(performance.now() - startTime);

    // Track usage
    trackAIUsage({
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      model: AI_MODEL,
      latencyMs,
    });

    // Parse the response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    const analysisResult = parseAIResponse(content.text);

    logger.info('AI stock analysis completed', {
      ticker: request.ticker,
      latencyMs,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    });

    return {
      ...analysisResult,
      aiModel: AI_MODEL_DISPLAY,
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
      },
    };
  } catch (error) {
    logger.error('AI stock analysis failed', error as Error, {
      ticker: request.ticker,
      analysisType: request.analysisType,
    });
    throw handleAIError(error);
  }
}

function buildAnalysisPrompt(request: StockAnalysisRequest): string {
  const parts = [
    `Analyze the stock ${request.ticker} for a ${request.analysisType} analysis.`,
  ];

  if (request.marketData) {
    parts.push(`
Current Market Data:
- Price: $${request.marketData.price}
- Volume: ${request.marketData.volume.toLocaleString()}
- Daily Change: ${request.marketData.changePercent.toFixed(2)}%
- 52-Week High: $${request.marketData.high52Week}
- 52-Week Low: $${request.marketData.low52Week}
${request.marketData.marketCap ? `- Market Cap: $${(request.marketData.marketCap / 1e9).toFixed(2)}B` : ''}
${request.marketData.peRatio ? `- P/E Ratio: ${request.marketData.peRatio.toFixed(2)}` : ''}
${request.marketData.eps ? `- EPS: $${request.marketData.eps.toFixed(2)}` : ''}
`);
  }

  parts.push(`
Provide your analysis in the following JSON structure:
{
  "summary": "2-3 paragraph comprehensive analysis with investment disclaimer",
  "metrics": {
    "technical": {
      "rsi": <number 0-100>,
      "macd": <number>,
      "macdSignal": <number>,
      "sma50": <number>,
      "sma200": <number>
    },
    "fundamental": {
      "peRatio": <number>,
      "pbRatio": <number>,
      "roe": <number>,
      "debtToEquity": <number>
    },
    "sentiment": {
      "overallScore": <number 0-1>,
      "trend": "bullish" | "bearish" | "neutral"
    },
    "risk": {
      "overallRisk": "low" | "medium" | "high" | "extreme",
      "volatilityRisk": <number 0-1>,
      "beta": <number>
    }
  },
  "signals": [
    {
      "type": "buy" | "sell" | "hold",
      "strength": <number 0-100>,
      "confidence": <number 0-100>,
      "reason": "explanation",
      "source": "fundamental" | "technical" | "sentiment" | "combined"
    }
  ],
  "recommendation": {
    "action": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",
    "confidence": <number 0-100>,
    "targetPrice": <number>,
    "timeframe": "6-12 months",
    "rationale": "brief explanation including disclaimer"
  },
  "riskAssessment": {
    "level": "low" | "medium" | "high" | "extreme",
    "factors": ["risk factor 1", "risk factor 2"]
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or additional text.
Include a disclaimer in the summary that this is not investment advice.
`);

  return parts.join('\n\n');
}

function parseAIResponse(
  text: string
): Omit<AIAnalysisResult, 'aiModel' | 'tokensUsed'> {
  // Clean potential markdown formatting
  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  }
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }

  try {
    return JSON.parse(jsonText.trim());
  } catch (error) {
    logger.error('Failed to parse AI response', error as Error, {
      responsePreview: text.substring(0, 500),
    });
    throw new Error('Failed to parse AI analysis response');
  }
}

// Fallback for when AI is disabled
export function generateMockAnalysis(ticker: string): AIAnalysisResult {
  const mockPrice = 150 + Math.random() * 50;
  const mockRsi = 40 + Math.random() * 30;

  return {
    summary: `Analysis for ${ticker.toUpperCase()}. This is a placeholder analysis generated while AI integration is being configured.

Technical indicators suggest a neutral position with RSI at ${mockRsi.toFixed(1)}. The stock is trading near its moving averages.

DISCLAIMER: This is not investment advice. This analysis is for informational purposes only. Always consult with a qualified financial advisor before making investment decisions.`,
    metrics: {
      technical: {
        rsi: mockRsi,
        macd: 0.5 + Math.random(),
        macdSignal: 0.3 + Math.random() * 0.5,
        sma50: mockPrice * 0.98,
        sma200: mockPrice * 0.95,
      },
      fundamental: {
        peRatio: 20 + Math.random() * 15,
        pbRatio: 2 + Math.random() * 3,
        roe: 10 + Math.random() * 15,
        debtToEquity: 0.5 + Math.random(),
      },
      sentiment: {
        overallScore: 0.5,
        trend: 'neutral',
        positiveCount: 0,
        negativeCount: 0,
        neutralCount: 0,
      },
      risk: {
        overallRisk: 'medium',
        volatilityRisk: 0.5,
        beta: 1.0 + Math.random() * 0.5,
      },
    },
    signals: [
      {
        type: 'hold',
        strength: 50,
        confidence: 30,
        reason: 'AI analysis pending configuration',
        source: 'combined',
      },
    ],
    recommendation: {
      action: 'Hold',
      confidence: 30,
      targetPrice: mockPrice * 1.1,
      timeframe: '6-12 months',
      rationale:
        'Placeholder recommendation. Configure ANTHROPIC_API_KEY for real AI analysis.',
    },
    riskAssessment: {
      level: 'medium',
      factors: ['AI analysis not configured', 'Using placeholder data'],
    },
    aiModel: 'mock-v1',
    tokensUsed: { input: 0, output: 0 },
  };
}
