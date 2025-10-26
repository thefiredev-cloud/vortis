export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  symbol: string;
  notes?: string;
  targetPrice?: number;
  alertPrice?: number;
  addedPrice?: number;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[];
}

export interface CreateWatchlistParams {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateWatchlistParams {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddWatchlistItemParams {
  symbol: string;
  notes?: string;
  targetPrice?: number;
  alertPrice?: number;
  addedPrice?: number;
}

export interface UpdateWatchlistItemParams {
  notes?: string;
  targetPrice?: number | null;
  alertPrice?: number | null;
  position?: number;
}

export interface WatchlistListParams {
  userId?: string;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'name';
  orderDirection?: 'asc' | 'desc';
}

export class WatchlistModel {
  static fromDatabase(data: Record<string, unknown>): Watchlist {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      name: data.name as string,
      description: data.description as string | undefined,
      isPublic: data.is_public as boolean,
      itemCount: data.item_count as number || 0,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  static toDatabase(watchlist: Partial<Watchlist>): Record<string, unknown> {
    return {
      ...(watchlist.id && { id: watchlist.id }),
      ...(watchlist.userId && { user_id: watchlist.userId }),
      ...(watchlist.name && { name: watchlist.name }),
      ...(watchlist.description !== undefined && { description: watchlist.description }),
      ...(watchlist.isPublic !== undefined && { is_public: watchlist.isPublic }),
    };
  }
}

export class WatchlistItemModel {
  static fromDatabase(data: Record<string, unknown>): WatchlistItem {
    return {
      id: data.id as string,
      watchlistId: data.watchlist_id as string,
      symbol: data.symbol as string,
      notes: data.notes as string | undefined,
      targetPrice: data.target_price as number | undefined,
      alertPrice: data.alert_price as number | undefined,
      addedPrice: data.added_price as number | undefined,
      currentPrice: data.current_price as number | undefined,
      priceChange: data.price_change as number | undefined,
      priceChangePercent: data.price_change_percent as number | undefined,
      position: data.position as number,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  static toDatabase(item: Partial<WatchlistItem>): Record<string, unknown> {
    return {
      ...(item.id && { id: item.id }),
      ...(item.watchlistId && { watchlist_id: item.watchlistId }),
      ...(item.symbol && { symbol: item.symbol }),
      ...(item.notes !== undefined && { notes: item.notes }),
      ...(item.targetPrice !== undefined && { target_price: item.targetPrice }),
      ...(item.alertPrice !== undefined && { alert_price: item.alertPrice }),
      ...(item.addedPrice !== undefined && { added_price: item.addedPrice }),
      ...(item.position !== undefined && { position: item.position }),
    };
  }

  static calculatePerformance(item: WatchlistItem): {
    priceChange: number;
    priceChangePercent: number;
  } | null {
    if (!item.addedPrice || !item.currentPrice) {
      return null;
    }

    const priceChange = item.currentPrice - item.addedPrice;
    const priceChangePercent = (priceChange / item.addedPrice) * 100;

    return { priceChange, priceChangePercent };
  }

  static shouldAlert(item: WatchlistItem): boolean {
    if (!item.alertPrice || !item.currentPrice) {
      return false;
    }

    return item.currentPrice >= item.alertPrice;
  }
}
