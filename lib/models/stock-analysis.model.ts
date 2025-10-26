export interface StockAnalysis {
  id: string;
  userId: string;
  symbol: string;
  analysisType: 'fundamental' | 'technical' | 'comprehensive';
  timeframe?: string;
  summary: string;
  metrics: AnalysisMetrics;
  signals: TradingSignal[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface AnalysisMetrics {
  fundamental?: FundamentalMetrics;
  technical?: TechnicalMetrics;
  sentiment?: SentimentMetrics;
  risk?: RiskMetrics;
}

export interface FundamentalMetrics {
  peRatio?: number;
  pbRatio?: number;
  debtToEquity?: number;
  roe?: number;
  roa?: number;
  currentRatio?: number;
  quickRatio?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
  revenueGrowth?: number;
  epsGrowth?: number;
  freeCashFlow?: number;
  dividendYield?: number;
  payoutRatio?: number;
}

export interface TechnicalMetrics {
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema12?: number;
  ema26?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHistogram?: number;
  bollingerUpper?: number;
  bollingerMiddle?: number;
  bollingerLower?: number;
  atr?: number;
  volume?: number;
  volumeAvg?: number;
  volatility?: number;
}

export interface SentimentMetrics {
  overallScore: number;
  newsScore?: number;
  socialScore?: number;
  analystScore?: number;
  institutionalScore?: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
}

export interface RiskMetrics {
  overallRisk: 'low' | 'medium' | 'high' | 'extreme';
  volatilityRisk: number;
  liquidityRisk: number;
  concentrationRisk: number;
  beta?: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: number; // 0-100
  confidence: number; // 0-100
  reason: string;
  source: 'fundamental' | 'technical' | 'sentiment' | 'combined';
  timestamp: string;
}

export interface CreateAnalysisParams {
  symbol: string;
  analysisType: 'fundamental' | 'technical' | 'comprehensive';
  timeframe?: string;
  includeNews?: boolean;
  includeEarnings?: boolean;
  includeInstitutional?: boolean;
  notes?: string;
}

export interface UpdateAnalysisParams {
  summary?: string;
  metrics?: Partial<AnalysisMetrics>;
  signals?: TradingSignal[];
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  completedAt?: string;
}

export interface AnalysisListParams {
  userId?: string;
  symbol?: string;
  analysisType?: 'fundamental' | 'technical' | 'comprehensive';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'symbol';
  orderDirection?: 'asc' | 'desc';
}

export class StockAnalysisModel {
  static fromDatabase(data: Record<string, unknown>): StockAnalysis {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      symbol: data.symbol as string,
      analysisType: data.analysis_type as 'fundamental' | 'technical' | 'comprehensive',
      timeframe: data.timeframe as string | undefined,
      summary: data.summary as string,
      metrics: (data.metrics as AnalysisMetrics) || {},
      signals: (data.signals as TradingSignal[]) || [],
      status: data.status as 'pending' | 'processing' | 'completed' | 'failed',
      error: data.error as string | undefined,
      createdAt: data.created_at as string,
      completedAt: data.completed_at as string | undefined,
      updatedAt: data.updated_at as string,
    };
  }

  static toDatabase(analysis: Partial<StockAnalysis>): Record<string, unknown> {
    return {
      ...(analysis.id && { id: analysis.id }),
      ...(analysis.userId && { user_id: analysis.userId }),
      ...(analysis.symbol && { symbol: analysis.symbol }),
      ...(analysis.analysisType && { analysis_type: analysis.analysisType }),
      ...(analysis.timeframe && { timeframe: analysis.timeframe }),
      ...(analysis.summary && { summary: analysis.summary }),
      ...(analysis.metrics && { metrics: analysis.metrics }),
      ...(analysis.signals && { signals: analysis.signals }),
      ...(analysis.status && { status: analysis.status }),
      ...(analysis.error !== undefined && { error: analysis.error }),
      ...(analysis.completedAt !== undefined && { completed_at: analysis.completedAt }),
    };
  }
}
