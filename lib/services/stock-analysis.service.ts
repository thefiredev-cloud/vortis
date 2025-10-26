import { SupabaseClient } from '@supabase/supabase-js';
import { StockAnalysisRepository } from '../repositories/stock-analysis.repository';
import {
  StockAnalysis,
  CreateAnalysisParams,
  UpdateAnalysisParams,
  AnalysisListParams,
} from '../models/stock-analysis.model';

export class StockAnalysisService {
  private repository: StockAnalysisRepository;

  constructor(client: SupabaseClient) {
    this.repository = new StockAnalysisRepository(client);
  }

  async createAnalysis(
    userId: string,
    params: CreateAnalysisParams
  ): Promise<StockAnalysis> {
    // Validate symbol format
    if (!/^[A-Z]+$/.test(params.symbol.toUpperCase())) {
      throw new Error('Invalid stock symbol format');
    }

    // Create the analysis
    const analysis = await this.repository.create(userId, params);

    // TODO: Queue the analysis job for processing
    // This would typically trigger a background job to fetch data
    // and perform the actual analysis

    return analysis;
  }

  async getAnalysis(analysisId: string): Promise<StockAnalysis | null> {
    return this.repository.findById(analysisId);
  }

  async updateAnalysis(
    analysisId: string,
    params: UpdateAnalysisParams
  ): Promise<StockAnalysis> {
    const existing = await this.repository.findById(analysisId);
    if (!existing) {
      throw new Error('Analysis not found');
    }

    return this.repository.update(analysisId, params);
  }

  async getUserAnalyses(
    userId: string,
    params: AnalysisListParams = {}
  ): Promise<StockAnalysis[]> {
    return this.repository.findByUserId(userId, params);
  }

  async getRecentAnalyses(userId: string, limit: number = 10): Promise<StockAnalysis[]> {
    return this.repository.findRecent(userId, limit);
  }

  async getAnalysesBySymbol(
    symbol: string,
    userId?: string
  ): Promise<StockAnalysis[]> {
    return this.repository.findBySymbol(symbol, userId);
  }

  async deleteAnalysis(analysisId: string, userId: string): Promise<boolean> {
    const analysis = await this.repository.findById(analysisId);
    if (!analysis) {
      throw new Error('Analysis not found');
    }

    if (analysis.userId !== userId) {
      throw new Error('Unauthorized to delete this analysis');
    }

    return this.repository.delete(analysisId);
  }

  async getUserStats(userId: string): Promise<{
    totalAnalyses: number;
    analysesThisMonth: number;
    completedAnalyses: number;
    pendingAnalyses: number;
  }> {
    const [total, monthly, completed, pending] = await Promise.all([
      this.repository.countByUser(userId),
      this.repository.countByUserThisMonth(userId),
      this.repository.countByUser(userId, 'completed'),
      this.repository.countByUser(userId, 'pending'),
    ]);

    return {
      totalAnalyses: total,
      analysesThisMonth: monthly,
      completedAnalyses: completed,
      pendingAnalyses: pending,
    };
  }

  async checkUsageLimit(
    userId: string,
    monthlyLimit: number
  ): Promise<{
    used: number;
    limit: number;
    remaining: number;
    canAnalyze: boolean;
  }> {
    const used = await this.repository.countByUserThisMonth(userId);
    const remaining = monthlyLimit === -1 ? -1 : monthlyLimit - used;
    const canAnalyze = monthlyLimit === -1 || remaining > 0;

    return {
      used,
      limit: monthlyLimit,
      remaining,
      canAnalyze,
    };
  }

  async processPendingAnalyses(): Promise<StockAnalysis[]> {
    // This would typically be called by a background job
    return this.repository.findPending();
  }

  async markAsProcessing(analysisId: string): Promise<StockAnalysis> {
    return this.repository.update(analysisId, {
      status: 'processing',
    });
  }

  async markAsCompleted(
    analysisId: string,
    params: Omit<UpdateAnalysisParams, 'status'>
  ): Promise<StockAnalysis> {
    return this.repository.update(analysisId, {
      ...params,
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  }

  async markAsFailed(analysisId: string, error: string): Promise<StockAnalysis> {
    return this.repository.update(analysisId, {
      status: 'failed',
      error,
    });
  }
}
