import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import {
  Watchlist,
  WatchlistItem,
  WatchlistWithItems,
  WatchlistModel,
  WatchlistItemModel,
  CreateWatchlistParams,
  UpdateWatchlistParams,
  AddWatchlistItemParams,
  UpdateWatchlistItemParams,
  WatchlistListParams,
} from '../models/watchlist.model';

export class WatchlistRepository extends BaseRepository<Watchlist> {
  constructor(client: SupabaseClient) {
    super(client, 'watchlists');
  }

  async create(userId: string, params: CreateWatchlistParams): Promise<Watchlist> {
    const dbData = {
      user_id: userId,
      name: params.name,
      description: params.description,
      is_public: params.isPublic || false,
      item_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const query = this.client
      .from(this.tableName)
      .insert(dbData)
      .select()
      .single();

    const result = await this.executeSingleQuery<Record<string, unknown>>(query);
    if (!result) {
      throw new Error('Failed to create watchlist');
    }

    return WatchlistModel.fromDatabase(result);
  }

  async update(id: string, params: UpdateWatchlistParams): Promise<Watchlist> {
    const dbData = {
      ...WatchlistModel.toDatabase(params as Partial<Watchlist>),
      updated_at: new Date().toISOString(),
    };

    const query = this.client
      .from(this.tableName)
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    const result = await this.executeSingleQuery<Record<string, unknown>>(query);
    if (!result) {
      throw new Error('Failed to update watchlist');
    }

    return WatchlistModel.fromDatabase(result);
  }

  async findByUserId(userId: string, params: WatchlistListParams = {}): Promise<Watchlist[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId);

    const orderBy = params.orderBy || 'created_at';
    const orderDirection = params.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const results = await this.executeQuery<Record<string, unknown>>(query);
    return results.map((data) => WatchlistModel.fromDatabase(data));
  }

  async findPublic(params: WatchlistListParams = {}): Promise<Watchlist[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('is_public', true);

    const orderBy = params.orderBy || 'created_at';
    const orderDirection = params.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const results = await this.executeQuery<Record<string, unknown>>(query);
    return results.map((data) => WatchlistModel.fromDatabase(data));
  }

  async findWithItems(watchlistId: string): Promise<WatchlistWithItems | null> {
    const watchlist = await this.findById(watchlistId);
    if (!watchlist) {
      return null;
    }

    const items = await this.getItems(watchlistId);

    return {
      ...watchlist,
      items,
    };
  }

  async getItems(watchlistId: string): Promise<WatchlistItem[]> {
    const query = this.client
      .from('watchlist_items')
      .select('*')
      .eq('watchlist_id', watchlistId)
      .order('position', { ascending: true });

    const results = await this.executeQuery<Record<string, unknown>>(query);
    return results.map((data) => WatchlistItemModel.fromDatabase(data));
  }

  async addItem(
    watchlistId: string,
    params: AddWatchlistItemParams
  ): Promise<WatchlistItem> {
    // Get the next position
    const items = await this.getItems(watchlistId);
    const nextPosition = items.length;

    const dbData = {
      watchlist_id: watchlistId,
      symbol: params.symbol.toUpperCase(),
      notes: params.notes,
      target_price: params.targetPrice,
      alert_price: params.alertPrice,
      added_price: params.addedPrice,
      position: nextPosition,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const query = this.client
      .from('watchlist_items')
      .insert(dbData)
      .select()
      .single();

    const result = await this.executeSingleQuery<Record<string, unknown>>(query);
    if (!result) {
      throw new Error('Failed to add item to watchlist');
    }

    // Update item count
    await this.updateItemCount(watchlistId);

    return WatchlistItemModel.fromDatabase(result);
  }

  async updateItem(
    itemId: string,
    params: UpdateWatchlistItemParams
  ): Promise<WatchlistItem> {
    const dbData = {
      ...WatchlistItemModel.toDatabase(params as Partial<WatchlistItem>),
      updated_at: new Date().toISOString(),
    };

    const query = this.client
      .from('watchlist_items')
      .update(dbData)
      .eq('id', itemId)
      .select()
      .single();

    const result = await this.executeSingleQuery<Record<string, unknown>>(query);
    if (!result) {
      throw new Error('Failed to update watchlist item');
    }

    return WatchlistItemModel.fromDatabase(result);
  }

  async removeItem(itemId: string): Promise<boolean> {
    // Get the item to find its watchlist
    const { data: item } = await this.client
      .from('watchlist_items')
      .select('watchlist_id')
      .eq('id', itemId)
      .single();

    const { error } = await this.client
      .from('watchlist_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Database error removing watchlist item: ${error.message}`);
    }

    // Update item count
    if (item?.watchlist_id) {
      await this.updateItemCount(item.watchlist_id);
    }

    return true;
  }

  async findItemBySymbol(
    watchlistId: string,
    symbol: string
  ): Promise<WatchlistItem | null> {
    const query = this.client
      .from('watchlist_items')
      .select('*')
      .eq('watchlist_id', watchlistId)
      .eq('symbol', symbol.toUpperCase())
      .single();

    const result = await this.executeSingleQuery<Record<string, unknown>>(query);
    return result ? WatchlistItemModel.fromDatabase(result) : null;
  }

  async reorderItems(watchlistId: string, itemIds: string[]): Promise<boolean> {
    const updates = itemIds.map((itemId, index) => ({
      id: itemId,
      position: index,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await this.client
      .from('watchlist_items')
      .upsert(updates);

    if (error) {
      throw new Error(`Database error reordering items: ${error.message}`);
    }

    return true;
  }

  async getItemById(itemId: string): Promise<WatchlistItem | null> {
    const query = this.client
      .from('watchlist_items')
      .select('*')
      .eq('id', itemId)
      .single();

    const result = await this.executeSingleQuery<Record<string, unknown>>(query);
    return result ? WatchlistItemModel.fromDatabase(result) : null;
  }

  private async updateItemCount(watchlistId: string): Promise<void> {
    const items = await this.getItems(watchlistId);
    await this.client
      .from(this.tableName)
      .update({ item_count: items.length, updated_at: new Date().toISOString() })
      .eq('id', watchlistId);
  }

  async countByUser(userId: string): Promise<number> {
    const { count, error } = await this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Database error counting watchlists: ${error.message}`);
    }

    return count || 0;
  }
}
