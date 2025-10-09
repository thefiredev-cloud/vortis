export interface MockStockAnalysis {
  ticker: string;
  companyName: string;
  currentPrice: number;
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  targetPrice: number;
  upside: number;
  analysis: {
    fundamental: string;
    technical: string;
    sentiment: string;
  };
  metrics: {
    pe_ratio: number;
    eps: number;
    revenue_growth: number;
    profit_margin: number;
  };
}

export function createMockAnalysis(
  overrides?: Partial<MockStockAnalysis>
): MockStockAnalysis {
  return {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 178.50,
    recommendation: 'Buy',
    targetPrice: 200.00,
    upside: 12.04,
    analysis: {
      fundamental: 'Strong fundamentals with consistent revenue growth and high profit margins.',
      technical: 'Bullish trend with support at $170 and resistance at $185.',
      sentiment: 'Positive market sentiment with institutional buying.',
    },
    metrics: {
      pe_ratio: 28.5,
      eps: 6.26,
      revenue_growth: 8.2,
      profit_margin: 25.8,
    },
    ...overrides,
  };
}

export function createMockChartData(days: number = 30) {
  const data = [];
  const basePrice = 170;
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const variation = (Math.random() - 0.5) * 10;
    const trend = (days - i) * 0.2; // Slight upward trend
    const price = basePrice + trend + variation;

    data.push({
      date: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 30000000,
    });
  }

  return data;
}

export function createMockMACDData(days: number = 30) {
  const data = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      macd: Number((Math.random() * 4 - 2).toFixed(2)),
      signal: Number((Math.random() * 3 - 1.5).toFixed(2)),
      histogram: Number((Math.random() * 2 - 1).toFixed(2)),
    });
  }

  return data;
}
