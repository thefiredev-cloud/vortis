import { SupabaseClient } from '@supabase/supabase-js';
import { WatchlistRepository } from '../repositories/watchlist.repository';
import {
  Watchlist,
  WatchlistItem,
  WatchlistWithItems,
  CreateWatchlistParams,
  UpdateWatchlistParams,
  AddWatchlistItemParams,
  UpdateWatchlistItemParams,
  WatchlistListParams,
} from '../models/watchlist.model';

export class WatchlistService {
  private repository: WatchlistRepository;

  constructor(client: SupabaseClient) {
    this.repository = new WatchlistRepository(client);
  }

  async createWatchlist(
    userId: string,
    params: CreateWatchlistParams
  ): Promise<Watchlist> {
    // Validate name
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Watchlist name is required');
    }

    if (params.name.length > 50) {
      throw new Error('Watchlist name must be 50 characters or less');
    }

    return this.repository.create(userId, params);
  }

  async getWatchlist(watchlistId: string): Promise<Watchlist | null> {
    return this.repository.findById(watchlistId);
  }

  async getWatchlistWithItems(watchlistId: string): Promise<WatchlistWithItems | null> {
    return this.repository.findWithItems(watchlistId);
  }

  async updateWatchlist(
    watchlistId: string,
    userId: string,
    params: UpdateWatchlistParams
  ): Promise<Watchlist> {
    const watchlist = await this.repository.findById(watchlistId);
    if (!watchlist) {
      throw new Error('Watchlist not found');
    }

    if (watchlist.userId !== userId) {
      throw new Error('Unauthorized to update this watchlist');
    }

    return this.repository.update(watchlistId, params);
  }

  async deleteWatchlist(watchlistId: string, userId: string): Promise<boolean> {
    const watchlist = await this.repository.findById(watchlistId);
    if (!watchlist) {
      throw new Error('Watchlist not found');
    }

    if (watchlist.userId !== userId) {
      throw new Error('Unauthorized to delete this watchlist');
    }

    return this.repository.delete(watchlistId);
  }

  async getUserWatchlists(
    userId: string,
    params: WatchlistListParams = {}
  ): Promise<Watchlist[]> {
    return this.repository.findByUserId(userId, params);
  }

  async getPublicWatchlists(params: WatchlistListParams = {}): Promise<Watchlist[]> {
    return this.repository.findPublic(params);
  }

  async addStock(
    watchlistId: string,
    userId: string,
    params: AddWatchlistItemParams
  ): Promise<WatchlistItem> {
    const watchlist = await this.repository.findById(watchlistId);
    if (!watchlist) {
      throw new Error('Watchlist not found');
    }

    if (watchlist.userId !== userId) {
      throw new Error('Unauthorized to modify this watchlist');
    }

    // Validate symbol format
    if (!/^[A-Z]+$/.test(params.symbol.toUpperCase())) {
      throw new Error('Invalid stock symbol format');
    }

    // Check if symbol already exists in watchlist
    const existing = await this.repository.findItemBySymbol(
      watchlistId,
      params.symbol
    );
    if (existing) {
      throw new Error('Stock already exists in this watchlist');
    }

    return this.repository.addItem(watchlistId, params);
  }

  async updateStock(
    itemId: string,
    userId: string,
    params: UpdateWatchlistItemParams
  ): Promise<WatchlistItem> {
    // Get the item to verify ownership through watchlist
    const item = await this.repository.getItemById(itemId);

    if (!item) {
      throw new Error('Watchlist item not found');
    }

    const watchlist = await this.repository.findById(item.watchlistId);
    if (!watchlist) {
      throw new Error('Watchlist not found');
    }

    if (watchlist.userId !== userId) {
      throw new Error('Unauthorized to modify this watchlist item');
    }

    return this.repository.updateItem(itemId, params);
  }

  async removeStock(itemId: string, userId: string): Promise<boolean> {
    // Get the item to verify ownership through watchlist
    const item = await this.repository.getItemById(itemId);

    if (!item) {
      throw new Error('Watchlist item not found');
    }

    const watchlist = await this.repository.findById(item.watchlistId);
    if (!watchlist) {
      throw new Error('Watchlist not found');
    }

    if (watchlist.userId !== userId) {
      throw new Error('Unauthorized to modify this watchlist item');
    }

    return this.repository.removeItem(itemId);
  }

  async reorderStocks(
    watchlistId: string,
    userId: string,
    itemIds: string[]
  ): Promise<boolean> {
    const watchlist = await this.repository.findById(watchlistId);
    if (!watchlist) {
      throw new Error('Watchlist not found');
    }

    if (watchlist.userId !== userId) {
      throw new Error('Unauthorized to modify this watchlist');
    }

    return this.repository.reorderItems(watchlistId, itemIds);
  }

  async getWatchlistItems(watchlistId: string): Promise<WatchlistItem[]> {
    return this.repository.getItems(watchlistId);
  }

  async getUserStats(userId: string): Promise<{
    totalWatchlists: number;
    totalStocks: number;
  }> {
    const watchlists = await this.repository.findByUserId(userId);
    const totalStocks = watchlists.reduce((sum, w) => sum + w.itemCount, 0);

    return {
      totalWatchlists: watchlists.length,
      totalStocks,
    };
  }
}
