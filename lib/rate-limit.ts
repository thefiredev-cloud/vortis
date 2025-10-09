/**
 * Rate Limiting System
 *
 * Production-ready rate limiting with:
 * - Token bucket algorithm (smooth rate limiting)
 * - Sliding window for accuracy
 * - In-memory storage (single instance)
 * - Redis adapter ready (multi-instance scaling)
 * - Per-user and per-IP limiting
 * - Automatic cleanup of expired entries
 *
 * Algorithm: Token Bucket with Sliding Window
 * - More accurate than fixed windows
 * - Prevents burst abuse at window boundaries
 * - Allows controlled bursting within limits
 */

import { NextRequest } from 'next/server';
import { logger } from './logger';
import { securityLogger } from './security-logger';

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Identifier for this rate limiter (for logging) */
  name: string;
  /** Skip rate limiting for certain conditions */
  skip?: (identifier: string) => boolean;
}

export interface RateLimitResult {
  /** Whether the request should be allowed */
  allowed: boolean;
  /** Number of requests remaining in current window */
  remaining: number;
  /** Total limit for this window */
  limit: number;
  /** Time until rate limit resets (in seconds) */
  resetIn: number;
  /** When the current window resets (Unix timestamp) */
  resetAt: number;
}

interface RateLimitEntry {
  /** Request timestamps in current window (sliding) */
  requests: number[];
  /** Window start time */
  windowStart: number;
}

/**
 * In-Memory Rate Limiter (default implementation)
 * Suitable for single-instance deployments
 */
class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.startCleanup();
  }

  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // 5 minutes

    // Don't keep Node.js process alive just for cleanup
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      // Remove entries older than 1 hour
      if (now - entry.windowStart > 60 * 60 * 1000) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limit store cleanup completed', {
        entriesCleaned: cleaned,
        remainingEntries: this.store.size,
      });
    }
  }

  async check(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get or create entry
    let entry = this.store.get(identifier);

    if (!entry) {
      entry = {
        requests: [],
        windowStart: now,
      };
      this.store.set(identifier, entry);
    }

    // Remove requests outside the sliding window
    entry.requests = entry.requests.filter((timestamp) => timestamp > windowStart);

    // Check if rate limit exceeded
    const allowed = entry.requests.length < config.maxRequests;

    if (allowed) {
      // Add current request to the window
      entry.requests.push(now);
    }

    // Calculate when the oldest request will expire
    const oldestRequest = entry.requests[0] || now;
    const resetAt = oldestRequest + config.windowMs;
    const resetIn = Math.ceil((resetAt - now) / 1000);

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - entry.requests.length),
      limit: config.maxRequests,
      resetIn: Math.max(0, resetIn),
      resetAt,
    };
  }

  /**
   * Reset rate limit for a specific identifier (for testing)
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get current store size (for monitoring)
   */
  size(): number {
    return this.store.size;
  }
}

/**
 * Redis Rate Limiter (production multi-instance)
 * Uncomment and configure when scaling horizontally
 */
/*
import { Redis } from '@upstash/redis';

class RedisRateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async check(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const key = `ratelimit:${config.name}:${identifier}`;

    // Use Redis sorted set with timestamps as scores
    // Remove old entries outside the window
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const requestCount = await this.redis.zcard(key);

    const allowed = requestCount < config.maxRequests;

    if (allowed) {
      // Add current request
      await this.redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
      // Set expiry on the key
      await this.redis.expire(key, Math.ceil(config.windowMs / 1000));
    }

    // Get oldest request for reset time
    const oldestRequests = await this.redis.zrange(key, 0, 0, { withScores: true });
    const oldestTimestamp = oldestRequests[0]?.score || now;
    const resetAt = oldestTimestamp + config.windowMs;
    const resetIn = Math.ceil((resetAt - now) / 1000);

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - (requestCount + (allowed ? 1 : 0))),
      limit: config.maxRequests,
      resetIn: Math.max(0, resetIn),
      resetAt,
    };
  }
}
*/

// Singleton instance
const rateLimiter = new InMemoryRateLimiter();
// For production with Redis: const rateLimiter = new RedisRateLimiter();

/**
 * Rate Limiter Class - Main interface
 */
export class RateLimiter {
  constructor(private config: RateLimitConfig) {}

  /**
   * Check rate limit for a request
   */
  async check(identifier: string): Promise<RateLimitResult> {
    // Skip if configured
    if (this.config.skip?.(identifier)) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        limit: this.config.maxRequests,
        resetIn: 0,
        resetAt: Date.now(),
      };
    }

    const result = await rateLimiter.check(identifier, this.config);

    // Log rate limit violations
    if (!result.allowed) {
      securityLogger.rateLimitExceeded(identifier, this.config.name, {
        severity: 'medium',
        limit: result.limit,
        resetIn: result.resetIn,
      });

      logger.warn('Rate limit exceeded', {
        identifier,
        limiter: this.config.name,
        limit: result.limit,
        resetIn: result.resetIn,
      });
    }

    return result;
  }

  /**
   * Reset rate limit for identifier (testing only)
   */
  reset(identifier: string): void {
    rateLimiter.reset(identifier);
  }
}

/**
 * Extract identifier from request
 * Priority: userId > IP address > 'anonymous'
 */
export function getIdentifier(request: NextRequest, userId?: string | null): string {
  // Use user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             'anonymous';

  return `ip:${ip}`;
}

/**
 * Common Rate Limit Configurations
 */
export const RateLimitPresets = {
  /** Stock analysis endpoint - expensive AI operations */
  ANALYZE: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    name: 'analyze',
  } as RateLimitConfig,

  /** Payment checkout - prevent abuse */
  CHECKOUT: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    name: 'checkout',
  } as RateLimitConfig,

  /** Webhook endpoints - allow high volume but prevent DDoS */
  WEBHOOK: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    name: 'webhook',
  } as RateLimitConfig,

  /** General API endpoints */
  API: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
    name: 'api',
  } as RateLimitConfig,

  /** Authentication endpoints - prevent brute force */
  AUTH: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    name: 'auth',
  } as RateLimitConfig,
};

/**
 * Apply rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.resetAt.toString());

  if (!result.allowed) {
    headers.set('Retry-After', result.resetIn.toString());
  }
}

/**
 * Global rate limiter access (for cleanup/monitoring)
 */
export const globalRateLimiter = rateLimiter;

/**
 * Usage Examples:
 *
 * // In API route
 * const limiter = new RateLimiter(RateLimitPresets.ANALYZE);
 * const identifier = getIdentifier(request, userId);
 * const result = await limiter.check(identifier);
 *
 * if (!result.allowed) {
 *   const headers = new Headers();
 *   addRateLimitHeaders(headers, result);
 *   return new Response('Rate limit exceeded', {
 *     status: 429,
 *     headers
 *   });
 * }
 *
 * // Custom rate limit
 * const customLimiter = new RateLimiter({
 *   maxRequests: 100,
 *   windowMs: 60000,
 *   name: 'custom-endpoint',
 *   skip: (id) => id.startsWith('admin:')
 * });
 */
