'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { designTokens } from '@/lib/design-tokens';
import { cn, formatNumber, formatPercent } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: ReactNode;
  isLoading?: boolean;
}

export function AnalyticsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-emerald-400',
  trend,
  description,
  isLoading = false,
}: AnalyticsCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-400'
      : trend === 'down'
      ? 'text-red-400'
      : 'text-slate-400';

  if (isLoading) {
    return (
      <div className={designTokens.card.base}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-8 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className={designTokens.card.base}>
      <div className="flex items-start justify-between mb-4">
        <p className={designTokens.text.small}>{title}</p>
        <div className="p-2 bg-white/5 rounded-lg">
          <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-white" aria-label={`${title}: ${value}`}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>

        {change !== undefined && (
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', trendColor)}>
              {change > 0 ? '+' : ''}
              {typeof change === 'number' ? formatPercent(change) : change}
            </span>
            {changeLabel && (
              <span className="text-xs text-slate-400">{changeLabel}</span>
            )}
          </div>
        )}

        {description && (
          <div className="text-xs text-slate-500 mt-2">{description}</div>
        )}
      </div>
    </div>
  );
}
