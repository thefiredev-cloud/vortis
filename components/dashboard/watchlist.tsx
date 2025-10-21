'use client';

import { useState } from 'react';
import { Plus, X, TrendingUp, TrendingDown, Bell, BellOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { designTokens } from '@/lib/design-tokens';

interface WatchlistItem {
  id: string;
  ticker: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  percentChange: number;
  alertEnabled: boolean;
  alertPrice?: number;
}

interface WatchlistProps {
  items?: WatchlistItem[];
  onAdd?: (ticker: string) => void;
  onRemove?: (id: string) => void;
  onToggleAlert?: (id: string) => void;
}

export function Watchlist({ items = [], onAdd, onRemove, onToggleAlert }: WatchlistProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTicker, setNewTicker] = useState('');

  const handleAdd = () => {
    if (newTicker.trim()) {
      onAdd?.(newTicker.toUpperCase());
      setNewTicker('');
      setIsAdding(false);
    }
  };

  return (
    <div className={designTokens.card.base}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={designTokens.text.subheading}>My Watchlist</h3>
        <Button
          size="sm"
          variant="outlined"
          onClick={() => setIsAdding(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          aria-label="Add stock to watchlist"
        >
          Add Stock
        </Button>
      </div>

      {/* Add Stock Form */}
      {isAdding && (
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-emerald-500/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              placeholder="Enter ticker (e.g., AAPL)"
              className={cn(designTokens.input.default, 'flex-1')}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
              aria-label="Stock ticker symbol"
            />
            <Button onClick={handleAdd} size="sm">
              Add
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewTicker('');
              }}
              size="sm"
              variant="ghost"
              aria-label="Cancel"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Watchlist Items */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className={designTokens.text.small}>No stocks in your watchlist</p>
          <p className="text-sm text-slate-500 mt-2">
            Click "Add Stock" to start tracking your favorite stocks
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <WatchlistItem
              key={item.id}
              item={item}
              onRemove={() => onRemove?.(item.id)}
              onToggleAlert={() => onToggleAlert?.(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WatchlistItem({
  item,
  onRemove,
  onToggleAlert,
}: {
  item: WatchlistItem;
  onRemove: () => void;
  onToggleAlert: () => void;
}) {
  const isPositive = item.priceChange >= 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors group">
      {/* Stock Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-white font-semibold">{item.ticker}</h4>
          {item.alertEnabled && (
            <Bell className="h-3 w-3 text-emerald-400" aria-label="Alert enabled" />
          )}
        </div>
        <p className="text-xs text-slate-400 truncate">{item.companyName}</p>
      </div>

      {/* Price Info */}
      <div className="text-right">
        <p className="text-white font-semibold">${item.currentPrice.toFixed(2)}</p>
        <div className="flex items-center gap-1 justify-end">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-400" aria-hidden="true" />
          )}
          <span
            className={cn(
              'text-xs font-medium',
              isPositive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {isPositive ? '+' : ''}
            {item.percentChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onToggleAlert}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label={item.alertEnabled ? 'Disable alert' : 'Enable alert'}
          title={item.alertEnabled ? 'Disable alert' : 'Enable alert'}
        >
          {item.alertEnabled ? (
            <BellOff className="h-4 w-4 text-slate-400" />
          ) : (
            <Bell className="h-4 w-4 text-slate-400" />
          )}
        </button>
        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-500/10 rounded-full transition-colors"
          aria-label="Remove from watchlist"
          title="Remove from watchlist"
        >
          <X className="h-4 w-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}
