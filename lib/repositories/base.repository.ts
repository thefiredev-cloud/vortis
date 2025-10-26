import { SupabaseClient } from '@supabase/supabase-js';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export abstract class BaseRepository<T> {
  constructor(
    protected readonly client: SupabaseClient,
    protected readonly tableName: string
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async executeQuery<R = T>(query: any): Promise<R[]> {
    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error in ${this.tableName}: ${(error as Error).message || String(error)}`);
    }

    return (data as R[]) || [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async executeSingleQuery<R = T>(query: any): Promise<R | null> {
    const { data, error } = await query;

    if (error) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'PGRST116') {
        // No rows found
        return null;
      }
      throw new Error(`Database error in ${this.tableName}: ${err.message || String(error)}`);
    }

    return data as R;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async executeMutation<R = T>(query: any): Promise<R> {
    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error in ${this.tableName}: ${(error as Error).message || String(error)}`);
    }

    if (!data) {
      throw new Error(`No data returned from ${this.tableName} mutation`);
    }

    return data as R;
  }

  protected buildQuery(
    options: QueryOptions = {}
  ) {
    let query = this.client.from(this.tableName).select('*');

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    if (options.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.orderDirection !== 'desc',
      });
    }

    return query;
  }

  async findById(id: string): Promise<T | null> {
    const query = this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    return this.executeSingleQuery<T>(query);
  }

  async findAll(options: QueryOptions = {}): Promise<T[]> {
    const query = this.buildQuery(options);
    return this.executeQuery<T>(query);
  }

  async count(): Promise<number> {
    const { count, error } = await this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Database error counting ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Database error deleting from ${this.tableName}: ${error.message}`);
    }

    return true;
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.findById(id);
    return result !== null;
  }
}
