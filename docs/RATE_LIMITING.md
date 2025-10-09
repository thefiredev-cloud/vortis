# Rate Limiting System

Production-ready rate limiting for Vortis API endpoints using token bucket algorithm with sliding window.

## Overview

The rate limiting system protects your API from abuse while maintaining good user experience:

- **Algorithm**: Token bucket with sliding window (most accurate)
- **Storage**: In-memory (single instance) with Redis upgrade path
- **Granularity**: Per-user for authenticated, per-IP for anonymous
- **Headers**: Standard `X-RateLimit-*` headers on all responses

## Current Implementation

### In-Memory Storage (MVP/Single Instance)

The current implementation uses in-memory storage suitable for:
- Single server deployments
- Development and testing
- MVP phase with moderate traffic
- Automatic cleanup of expired entries

**Limitations:**
- Rate limits reset on server restart
- Not suitable for horizontal scaling (multiple servers)
- Memory consumption grows with unique users

## Protected Endpoints

### 1. Stock Analysis (`/api/analyze`)

**Limit**: 10 requests per hour per user/IP

**Reason**: Expensive AI operations, prevent abuse of compute resources

```typescript
// Applied automatically in route handler
const rateLimiter = new RateLimiter(RateLimitPresets.ANALYZE);
```

**Response when limited:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many analysis requests. Please try again in 3420 seconds.",
  "retryAfter": 3420
}
```

### 2. Stripe Checkout (`/api/stripe/checkout`)

**Limit**: 5 requests per hour per user

**Reason**: Prevent checkout abuse, reduce Stripe API calls

```typescript
const rateLimiter = new RateLimiter(RateLimitPresets.CHECKOUT);
```

### 3. Webhook Endpoints

**Limit**: 100 requests per minute per IP

**Reason**: Allow legitimate webhook volume while preventing DDoS

**Applies to:**
- `/api/webhooks/stripe`
- `/api/webhooks/clerk`

```typescript
const rateLimiter = new RateLimiter(RateLimitPresets.WEBHOOK);
```

## Response Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 10          # Maximum requests allowed
X-RateLimit-Remaining: 7       # Requests remaining in window
X-RateLimit-Reset: 1704844800  # Unix timestamp when limit resets
```

When rate limited (HTTP 429):
```
Retry-After: 3600              # Seconds until you can retry
```

## Client Implementation

### JavaScript/TypeScript

```typescript
async function callAPI(endpoint: string, data: any) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  // Check rate limit headers
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
  }

  return response.json();
}
```

### React Hook

```typescript
import { useState, useEffect } from 'react';

export function useRateLimit() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [resetAt, setResetAt] = useState<number | null>(null);

  const checkResponse = (response: Response) => {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (remaining) setRemaining(parseInt(remaining));
    if (reset) setResetAt(parseInt(reset));
  };

  return { remaining, resetAt, checkResponse };
}
```

## Custom Rate Limits

Create custom rate limits for new endpoints:

```typescript
import { RateLimiter } from '@/lib/rate-limit';

const customLimiter = new RateLimiter({
  maxRequests: 100,        // Allow 100 requests
  windowMs: 60 * 1000,     // Per minute
  name: 'custom-endpoint', // For logging
  skip: (identifier) => {  // Optional: skip certain users
    return identifier.startsWith('admin:');
  },
});

// In your API route
export async function POST(request: NextRequest) {
  const identifier = getIdentifier(request, userId);
  const result = await customLimiter.check(identifier);

  if (!result.allowed) {
    const headers = new Headers();
    addRateLimitHeaders(headers, result);

    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers }
    );
  }

  // Process request...
}
```

## Upgrading to Redis (Production Multi-Instance)

When scaling horizontally, upgrade to Redis-based rate limiting:

### 1. Install Dependencies

```bash
npm install @upstash/redis
```

### 2. Configure Environment Variables

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 3. Enable Redis Rate Limiter

In `lib/rate-limit.ts`, uncomment the Redis implementation:

```typescript
// Uncomment this section
import { Redis } from '@upstash/redis';

class RedisRateLimiter {
  // ... implementation provided in file
}

// Change this line:
const rateLimiter = new RedisRateLimiter();
```

### 4. Test in Staging

Run tests to ensure Redis connection:

```bash
npm run test
```

### 5. Deploy

Deploy with Redis configuration. Rate limits now work across all server instances.

## Monitoring

### Check Current Store Size

```typescript
import { globalRateLimiter } from '@/lib/rate-limit';

// Get number of tracked identifiers
const size = globalRateLimiter.size();
console.log(`Tracking ${size} rate limit entries`);
```

### Clear Rate Limits (Testing Only)

```typescript
// Clear all rate limits
globalRateLimiter.clear();

// Clear specific identifier
const limiter = new RateLimiter(RateLimitPresets.ANALYZE);
limiter.reset('user:123');
```

### Security Logging

Rate limit violations are automatically logged:

```typescript
// Logged via security-logger.ts
securityLogger.rateLimitExceeded(identifier, endpoint, {
  severity: 'medium',
  limit: result.limit,
  resetIn: result.resetIn,
});
```

View logs to identify:
- Potential abuse patterns
- Legitimate users hitting limits
- Need for limit adjustments

## Testing

Run rate limit tests:

```bash
npm run test tests/lib/rate-limit.test.ts
```

Test coverage includes:
- ✅ Basic rate limiting
- ✅ Sliding window behavior
- ✅ Multiple identifiers
- ✅ Reset timing
- ✅ Skip function
- ✅ High volume scenarios
- ✅ Concurrent users

## Best Practices

### 1. Set Appropriate Limits

```typescript
// Too strict - frustrates legitimate users
maxRequests: 1, windowMs: 60000  // 1 per minute ❌

// Too loose - allows abuse
maxRequests: 10000, windowMs: 1000  // 10k per second ❌

// Just right - balances UX and protection
maxRequests: 60, windowMs: 60000  // 60 per minute ✅
```

### 2. Use User ID When Available

```typescript
// Authenticated - more accurate limiting
const identifier = getIdentifier(request, userId); // 'user:123'

// Anonymous - falls back to IP
const identifier = getIdentifier(request, null); // 'ip:192.168.1.1'
```

### 3. Always Include Headers

```typescript
// Good - users can see their limits
const headers = new Headers();
addRateLimitHeaders(headers, result);
return NextResponse.json(data, { headers });

// Bad - no visibility into limits
return NextResponse.json(data);
```

### 4. Log Violations

```typescript
// Automatic via RateLimiter class
// Manual logging if needed:
if (!result.allowed) {
  logger.warn('Rate limit hit', {
    identifier,
    endpoint: '/api/analyze',
    limit: result.limit,
  });
}
```

## Troubleshooting

### Issue: Legitimate Users Being Blocked

**Symptoms:** Users report hitting limits during normal use

**Solutions:**
1. Increase limits for that endpoint
2. Add skip logic for premium users
3. Consider different limits per plan tier

```typescript
const limiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 3600000,
  name: 'analyze',
  skip: (id) => {
    // Premium users get higher limits (checked elsewhere)
    return false;
  },
});
```

### Issue: Rate Limits Reset on Deploy

**Symptoms:** All users can suddenly make requests after deploy

**Cause:** In-memory storage doesn't persist

**Solution:** Upgrade to Redis (see above)

### Issue: Memory Usage Growing

**Symptoms:** Server memory increases over time

**Cause:** Too many unique identifiers (IP addresses)

**Solutions:**
1. Automatic cleanup runs every 5 minutes
2. Upgrade to Redis for better memory management
3. Adjust cleanup interval in `lib/rate-limit.ts`

### Issue: Testing Rate Limits

**Problem:** Tests fail due to rate limiting

**Solution:** Clear limits in test setup

```typescript
import { globalRateLimiter } from '@/lib/rate-limit';

beforeEach(() => {
  globalRateLimiter.clear();
});
```

## Security Considerations

### 1. IP Spoofing

Use trusted proxy headers:

```typescript
// In production, ensure x-forwarded-for comes from trusted proxy
const forwarded = request.headers.get('x-forwarded-for');
// Cloudflare, Vercel, etc. set this correctly
```

### 2. User ID Spoofing

Rate limiting uses authenticated user ID from Clerk:

```typescript
const { userId } = await auth(); // Verified by Clerk
const identifier = getIdentifier(request, userId);
```

### 3. Bypass Attempts

Monitor for:
- Rapid IP rotation (VPN/proxy abuse)
- Multiple user accounts from same IP
- Unusual traffic patterns

```typescript
// Check security logs for patterns
securityLogger.suspiciousActivity('Multiple accounts from same IP', {
  severity: 'high',
  ipAddress: ip,
  userIds: ['user1', 'user2', 'user3'],
});
```

## Performance

### Current Implementation (In-Memory)

- **Latency**: < 1ms per check
- **Memory**: ~1KB per unique identifier
- **Cleanup**: Automatic every 5 minutes
- **Capacity**: 10,000+ concurrent users

### Redis Implementation (When Upgraded)

- **Latency**: 5-10ms per check (network)
- **Memory**: Offloaded to Redis
- **Cleanup**: Automatic via TTL
- **Capacity**: Unlimited (Redis dependent)

## Future Enhancements

### 1. Dynamic Rate Limits

Adjust limits based on user tier:

```typescript
// Planned feature
const limits = {
  free: { maxRequests: 10, windowMs: 3600000 },
  starter: { maxRequests: 100, windowMs: 3600000 },
  pro: { maxRequests: -1, windowMs: 0 }, // Unlimited
};
```

### 2. Rate Limit Analytics

Track usage patterns:

```typescript
// Planned feature
interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  topUsers: Array<{ id: string; requests: number }>;
}
```

### 3. Adaptive Rate Limiting

Automatically adjust based on load:

```typescript
// Planned feature
const limiter = new AdaptiveRateLimiter({
  baseLimit: 100,
  maxLimit: 1000,
  adjustmentFactor: 1.5,
});
```

## Summary

**Current State:**
- ✅ In-memory rate limiting (production-ready for single instance)
- ✅ 4 critical endpoints protected
- ✅ Comprehensive test coverage
- ✅ Security logging integrated
- ✅ Standard HTTP headers

**Production Ready:**
- ✅ MVP/single instance deployments
- ✅ Development and testing
- ⚠️ Horizontal scaling requires Redis upgrade

**Upgrade Path:**
- 📋 Redis implementation provided (commented in code)
- 📋 Simple configuration change
- 📋 No code changes needed in routes

For questions or issues, check logs at `/api/logs` or review security events.
