'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { designTokens } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface StockDataPoint {
  date: string;
  price: number;
  volume?: number;
}

interface StockChartProps {
  data: StockDataPoint[];
  ticker: string;
  variant?: 'line' | 'area';
  showVolume?: boolean;
}

const timeRanges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
] as const;

export function StockChart({
  data,
  ticker,
  variant = 'area',
  showVolume = false,
}: StockChartProps) {
  const [timeRange, setTimeRange] = useState<(typeof timeRanges)[number]['value']>('1m');

  // Calculate price change
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const percentChange = (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className={designTokens.card.base}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={designTokens.text.subheading}>{ticker} Price Chart</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-white">
              ${lastPrice.toFixed(2)}
            </span>
            <span
              className={cn(
                'text-sm font-medium',
                isPositive ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {isPositive ? '+' : ''}
              {priceChange.toFixed(2)} ({isPositive ? '+' : ''}
              {percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                timeRange === range.value
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
              aria-label={`View ${range.label} data`}
              aria-pressed={timeRange === range.value}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {variant === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? '#10b981' : '#ef4444'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? '#10b981' : '#ef4444'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Volume Chart (if enabled) */}
      {showVolume && (
        <div className="h-24 mt-4 border-t border-white/10 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#6366f1"
                strokeWidth={1}
                fillOpacity={1}
                fill="url(#colorVolume)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
