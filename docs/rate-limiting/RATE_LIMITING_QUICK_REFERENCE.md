# Rate Limiting Quick Reference

**One-page guide for developers working with Vortis rate limiting**

## Current Limits

```
/api/analyze           → 10 requests/hour per user/IP
/api/stripe/checkout   → 5 requests/hour per user
/api/webhooks/stripe   → 100 requests/minute per IP
/api/webhooks/clerk    → 100 requests/minute per IP
```

## Add Rate Limiting to New Endpoint

```typescript
import { RateLimiter, RateLimitPresets, getIdentifier, addRateLimitHeaders } from '@/lib/rate-limit';

// 1. Create limiter (choose preset or custom)
const rateLimiter = new RateLimiter(RateLimitPresets.API);

// 2. In route handler
export async function POST(request: NextRequest) {
  const { userId } = await auth(); // Get user ID if authenticated

  // 3. Check rate limit
  const identifier = getIdentifier(request, userId);
  const result = await rateLimiter.check(identifier);

  // 4. Block if exceeded
  if (!result.allowed) {
    const headers = new Headers();
    addRateLimitHeaders(headers, result);

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: result.resetIn
      },
      { status: 429, headers }
    );
  }

  // 5. Process request normally
  const data = await processRequest();

  // 6. Add headers to success response
  const headers = new Headers();
  addRateLimitHeaders(headers, result);
  return NextResponse.json(data, { headers });
}
```

## Available Presets

```typescript
RateLimitPresets.ANALYZE    // 10/hour - AI operations
RateLimitPresets.CHECKOUT   // 5/hour - Payments
RateLimitPresets.WEBHOOK    // 100/minute - Webhooks
RateLimitPresets.API        // 60/minute - General API
RateLimitPresets.AUTH       // 10/15min - Auth endpoints
```

## Custom Rate Limit

```typescript
const customLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  name: 'my-endpoint',
  skip: (id) => id.startsWith('admin:') // Optional
});
```

## Response Headers

```http
X-RateLimit-Limit: 10         # Max requests
X-RateLimit-Remaining: 7      # Remaining
X-RateLimit-Reset: 1704844800 # Reset timestamp
Retry-After: 3600             # Only on 429
```

## Testing

```typescript
import { globalRateLimiter } from '@/lib/rate-limit';

beforeEach(() => {
  globalRateLimiter.clear(); // Reset between tests
});

it('should rate limit', async () => {
  const limiter = new RateLimiter({
    maxRequests: 2,
    windowMs: 1000,
    name: 'test'
  });

  await limiter.check('user:123'); // ✅ allowed
  await limiter.check('user:123'); // ✅ allowed
  const result = await limiter.check('user:123'); // ❌ blocked

  expect(result.allowed).toBe(false);
});
```

## Monitoring

```typescript
// Check store size
globalRateLimiter.size() // Number of tracked identifiers

// Reset specific user (admin only)
limiter.reset('user:123')

// Clear all (emergency)
globalRateLimiter.clear()
```

## Common Patterns

### User-based limiting
```typescript
const identifier = getIdentifier(request, userId);
// Returns: 'user:123' (preferred)
```

### IP-based limiting
```typescript
const identifier = getIdentifier(request, null);
// Returns: 'ip:192.168.1.1'
```

### Skip for admins
```typescript
const limiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000,
  name: 'endpoint',
  skip: (id) => id.startsWith('admin:')
});
```

## Upgrade to Redis (Multi-Instance)

```bash
# 1. Install
npm install @upstash/redis

# 2. Configure
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# 3. Enable in lib/rate-limit.ts
# Uncomment RedisRateLimiter class (line 94-140)
# Change: const rateLimiter = new RedisRateLimiter();

# 4. Deploy
npm run build && vercel --prod
```

## Troubleshooting

**Users blocked too often?**
→ Increase `maxRequests` or `windowMs`

**Memory growing?**
→ Automatic cleanup runs every 5min
→ Or upgrade to Redis

**Tests failing?**
→ Call `globalRateLimiter.clear()` in `beforeEach()`

**Emergency disable?**
→ See `/docs/PRODUCTION_DEPLOYMENT.md`

## Files

```
lib/rate-limit.ts                    - Core implementation
tests/lib/rate-limit.test.ts         - Tests
docs/RATE_LIMITING.md                - Full documentation
docs/PRODUCTION_DEPLOYMENT.md        - Deployment guide
RATE_LIMITING_IMPLEMENTATION.md      - Implementation summary
```

## Security Logging

Rate limit violations automatically logged:

```typescript
// Logged automatically via RateLimiter
securityLogger.rateLimitExceeded(identifier, endpoint, {
  severity: 'medium',
  limit: result.limit,
  resetIn: result.resetIn,
});
```

Check logs for abuse patterns.

## Need Help?

1. Read `/docs/RATE_LIMITING.md`
2. Run tests: `npm run test tests/lib/rate-limit.test.ts`
3. Check security logs
4. Review implementation summary

---

**Quick Test:**
```bash
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"ticker":"AAPL"}' -i | grep X-RateLimit
done
```

Should see limits decreasing, then 429 after limit exceeded.
