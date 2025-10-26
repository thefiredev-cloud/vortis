import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import {
  StockAnalysis,
  StockAnalysisModel,
  CreateAnalysisParams,
  UpdateAnalysisParams,
  AnalysisListParams,
} from '../models/stock-analysis.model';

export class StockAnalysisRepository extends BaseRepository<StockAnalysis> {
  constructor(client: SupabaseClient) {
    super(client, 'stock_analyses');
  }

  async create(userId: string, params: CreateAnalysisParams): Promise<StockAnalysis> {
    const dbData = {
      user_id: userId,
      symbol: params.symbol.toUpperCase(),
      analysis_type: params.analysisType,
      timeframe: params.timeframe,
      summary: '',
      metrics: {},
      signals: [],
      status: 'pending' as const,
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
      throw new Error('Failed to create analysis');
    }

    return StockAnalysisModel.fromDatabase(result);
  }

  async update(id: string, params: UpdateAnalysisParams): Promise<StockAnalysis> {
    const dbData = {
      ...StockAnalysisModel.toDatabase(params as Partial<StockAnalysis>),
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
      throw new Error('Failed to update analysis');
    }

    return StockAnalysisModel.fromDatabase(result);
  }

  async findByUserId(userId: string, params: AnalysisListParams = {}): Promise<StockAnalysis[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId);

    if (params.symbol) {
      query = query.eq('symbol', params.symbol.toUpperCase());
    }

    if (params.analysisType) {
      query = query.eq('analysis_type', params.analysisType);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

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
    return results.map((data) => StockAnalysisModel.fromDatabase(data));
  }

  async findBySymbol(symbol: string, userId?: string): Promise<StockAnalysis[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const results = await this.executeQuery<Record<string, unknown>>(query);
    return results.map((data) => StockAnalysisModel.fromDatabase(data));
  }

  async findRecent(userId: string, limit: number = 10): Promise<StockAnalysis[]> {
    const query = this.client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    const results = await this.executeQuery<Record<string, unknown>>(query);
    return results.map((data) => StockAnalysisModel.fromDatabase(data));
  }

  async findPending(): Promise<StockAnalysis[]> {
    const query = this.client
      .from(this.tableName)
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    const results = await this.executeQuery<Record<string, unknown>>(query);
    return results.map((data) => StockAnalysisModel.fromDatabase(data));
  }

  async countByUser(userId: string, status?: StockAnalysis['status']): Promise<number> {
    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Database error counting analyses: ${error.message}`);
    }

    return count || 0;
  }

  async countByUserThisMonth(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) {
      throw new Error(`Database error counting monthly analyses: ${error.message}`);
    }

    return count || 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Database error deleting user analyses: ${error.message}`);
    }

    return true;
  }
}
