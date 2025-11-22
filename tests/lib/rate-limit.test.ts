/**
 * Rate Limiter Tests
 *
 * Tests for the rate limiting system including:
 * - Token bucket algorithm
 * - Sliding window behavior
 * - Rate limit enforcement
 * - Reset logic
 * - Multiple identifiers
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  RateLimiter,
  RateLimitPresets,
  getIdentifier,
  addRateLimitHeaders,
  globalRateLimiter,
} from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    globalRateLimiter.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 1000,
        name: 'test',
      });

      const result1 = await limiter.check('user:123');
      const result2 = await limiter.check('user:123');
      const result3 = await limiter.check('user:123');

      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding limit', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
        name: 'test',
      });

      await limiter.check('user:123');
      await limiter.check('user:123');
      const result = await limiter.check('user:123');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track different identifiers separately', async () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 1000,
        name: 'test',
      });

      const user1 = await limiter.check('user:123');
      const user2 = await limiter.check('user:456');

      expect(user1.allowed).toBe(true);
      expect(user2.allowed).toBe(true);
    });
  });

  describe('Sliding Window', () => {
    it('should allow new requests after window expires', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
        name: 'test',
      });

      // Use up limit
      await limiter.check('user:123');
      await limiter.check('user:123');

      // Should be blocked
      const blocked = await limiter.check('user:123');
      expect(blocked.allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(1001);

      // Should be allowed again
      const allowed = await limiter.check('user:123');
      expect(allowed.allowed).toBe(true);
      expect(allowed.remaining).toBe(1);
    });

    it('should properly track sliding window', async () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 1000,
        name: 'test',
      });

      // Request at t=0
      await limiter.check('user:123');

      // Request at t=500
      vi.advanceTimersByTime(500);
      await limiter.check('user:123');

      // Request at t=700
      vi.advanceTimersByTime(200);
      await limiter.check('user:123');

      // At t=700, should be blocked (3 requests in 700ms window)
      const blocked = await limiter.check('user:123');
      expect(blocked.allowed).toBe(false);

      // At t=1001, oldest request (t=0) should be outside window
      vi.advanceTimersByTime(301);
      const allowed = await limiter.check('user:123');
      expect(allowed.allowed).toBe(true);
    });
  });

  describe('Reset Timing', () => {
    it('should return correct reset time', async () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 5000,
        name: 'test',
      });

      const result = await limiter.check('user:123');

      expect(result.resetIn).toBeGreaterThan(0);
      expect(result.resetIn).toBeLessThanOrEqual(5);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should update reset time as window slides', async () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
        name: 'test',
      });

      const result1 = await limiter.check('user:123');
      const resetTime1 = result1.resetAt;

      // Wait for window to expire and start a new one
      vi.advanceTimersByTime(1100);

      const result2 = await limiter.check('user:123');
      const resetTime2 = result2.resetAt;

      // Second reset time should be later (new window)
      expect(resetTime2).toBeGreaterThan(resetTime1);
    });
  });

  describe('Skip Function', () => {
    it('should skip rate limiting when skip returns true', async () => {
      const limiter = new RateLimiter({
        maxRequests: 1,
        windowMs: 1000,
        name: 'test',
        skip: (id) => id.startsWith('admin:'),
      });

      // Admin should always be allowed
      await limiter.check('admin:123');
      await limiter.check('admin:123');
      const adminResult = await limiter.check('admin:123');
      expect(adminResult.allowed).toBe(true);

      // Regular user should be limited
      await limiter.check('user:123');
      const userResult = await limiter.check('user:123');
      expect(userResult.allowed).toBe(false);
    });
  });

  describe('Rate Limit Presets', () => {
    it('should have correct ANALYZE preset', () => {
      expect(RateLimitPresets.ANALYZE.maxRequests).toBe(10);
      expect(RateLimitPresets.ANALYZE.windowMs).toBe(60 * 60 * 1000);
      expect(RateLimitPresets.ANALYZE.name).toBe('analyze');
    });

    it('should have correct CHECKOUT preset', () => {
      expect(RateLimitPresets.CHECKOUT.maxRequests).toBe(5);
      expect(RateLimitPresets.CHECKOUT.windowMs).toBe(60 * 60 * 1000);
      expect(RateLimitPresets.CHECKOUT.name).toBe('checkout');
    });

    it('should have correct WEBHOOK preset', () => {
      expect(RateLimitPresets.WEBHOOK.maxRequests).toBe(100);
      expect(RateLimitPresets.WEBHOOK.windowMs).toBe(60 * 1000);
      expect(RateLimitPresets.WEBHOOK.name).toBe('webhook');
    });
  });
});

describe('getIdentifier', () => {
  it('should use userId if provided', () => {
    const request = new NextRequest('https://example.com');
    const identifier = getIdentifier(request, 'user_123');

    expect(identifier).toBe('user:user_123');
  });

  it('should use x-forwarded-for if no userId', () => {
    const request = new NextRequest('https://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
    });
    const identifier = getIdentifier(request, null);

    expect(identifier).toBe('ip:192.168.1.1');
  });

  it('should use x-real-ip if no x-forwarded-for', () => {
    const request = new NextRequest('https://example.com', {
      headers: {
        'x-real-ip': '192.168.1.1',
      },
    });
    const identifier = getIdentifier(request, null);

    expect(identifier).toBe('ip:192.168.1.1');
  });

  it('should use anonymous if no IP headers', () => {
    const request = new NextRequest('https://example.com');
    const identifier = getIdentifier(request, null);

    expect(identifier).toBe('ip:anonymous');
  });
});

describe('addRateLimitHeaders', () => {
  it('should add correct headers', () => {
    const headers = new Headers();
    const result = {
      allowed: true,
      remaining: 5,
      limit: 10,
      resetIn: 30,
      resetAt: Date.now() + 30000,
    };

    addRateLimitHeaders(headers, result);

    expect(headers.get('X-RateLimit-Limit')).toBe('10');
    expect(headers.get('X-RateLimit-Remaining')).toBe('5');
    expect(headers.get('X-RateLimit-Reset')).toBeTruthy();
  });

  it('should add Retry-After header when not allowed', () => {
    const headers = new Headers();
    const result = {
      allowed: false,
      remaining: 0,
      limit: 10,
      resetIn: 60,
      resetAt: Date.now() + 60000,
    };

    addRateLimitHeaders(headers, result);

    expect(headers.get('Retry-After')).toBe('60');
  });

  it('should not add Retry-After header when allowed', () => {
    const headers = new Headers();
    const result = {
      allowed: true,
      remaining: 5,
      limit: 10,
      resetIn: 30,
      resetAt: Date.now() + 30000,
    };

    addRateLimitHeaders(headers, result);

    expect(headers.get('Retry-After')).toBeNull();
  });
});

describe('Global Rate Limiter', () => {
  beforeEach(() => {
    globalRateLimiter.clear();
  });

  it('should allow clearing all data', async () => {
    const limiter = new RateLimiter({
      maxRequests: 1,
      windowMs: 1000,
      name: 'test',
    });

    await limiter.check('user:123');
    const blocked = await limiter.check('user:123');
    expect(blocked.allowed).toBe(false);

    globalRateLimiter.clear();

    const allowed = await limiter.check('user:123');
    expect(allowed.allowed).toBe(true);
  });

  it('should allow resetting specific identifier', async () => {
    const limiter = new RateLimiter({
      maxRequests: 1,
      windowMs: 1000,
      name: 'test',
    });

    await limiter.check('user:123');
    await limiter.check('user:456');

    limiter.reset('user:123');

    // user:123 should be reset
    const user123 = await limiter.check('user:123');
    expect(user123.allowed).toBe(true);

    // user:456 should still be blocked
    const user456 = await limiter.check('user:456');
    expect(user456.allowed).toBe(false);
  });

  it('should track store size', async () => {
    const limiter = new RateLimiter({
      maxRequests: 1,
      windowMs: 1000,
      name: 'test',
    });

    expect(globalRateLimiter.size()).toBe(0);

    await limiter.check('user:123');
    expect(globalRateLimiter.size()).toBe(1);

    await limiter.check('user:456');
    expect(globalRateLimiter.size()).toBe(2);

    globalRateLimiter.clear();
    expect(globalRateLimiter.size()).toBe(0);
  });
});

describe('High Volume Scenarios', () => {
  it('should handle burst requests correctly', async () => {
    const limiter = new RateLimiter({
      maxRequests: 10,
      windowMs: 1000,
      name: 'test',
    });

    // Send 10 requests rapidly
    const results = await Promise.all(
      Array.from({ length: 10 }, () => limiter.check('user:123'))
    );

    // All 10 should be allowed
    expect(results.every((r) => r.allowed)).toBe(true);

    // 11th should be blocked
    const blocked = await limiter.check('user:123');
    expect(blocked.allowed).toBe(false);
  });

  it('should handle multiple users concurrently', async () => {
    const limiter = new RateLimiter({
      maxRequests: 5,
      windowMs: 1000,
      name: 'test',
    });

    // Simulate 100 users making 3 requests each
    const promises = Array.from({ length: 100 }, (_, i) =>
      Promise.all([
        limiter.check(`user:${i}`),
        limiter.check(`user:${i}`),
        limiter.check(`user:${i}`),
      ])
    );

    const results = await Promise.all(promises);

    // All users should have all 3 requests allowed
    expect(results.every((userResults) => userResults.every((r) => r.allowed))).toBe(true);
  });
});
