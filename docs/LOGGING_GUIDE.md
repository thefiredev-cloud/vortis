# Logging System Guide

## Overview

Comprehensive logging and monitoring system using structured logging, security event tracking, and production-ready observability.

## Architecture

### Core Components

1. **Logger** (`/lib/logger.ts`)
   - Structured logging with JSON output in production
   - Log levels: debug, info, warn, error
   - Environment-aware configuration
   - Automatic sensitive data redaction
   - Performance timing utilities

2. **Security Logger** (`/lib/security-logger.ts`)
   - Specialized logging for security events
   - Authentication/authorization tracking
   - Payment event logging
   - Webhook verification monitoring
   - Data access auditing

## Usage

### Basic Logging

```typescript
import { logger } from '@/lib/logger';

// Info level (general information)
logger.info('User logged in', {
  userId: 'user_123',
  ipAddress: req.ip
});

// Warning level (non-critical issues)
logger.warn('API rate limit approaching', {
  userId: 'user_123',
  currentUsage: 95,
  limit: 100
});

// Error level (critical issues)
logger.error('Database connection failed', error, {
  database: 'postgres',
  host: 'db.example.com'
});

// Debug level (development only)
logger.debug('Cache hit', {
  key: 'user_profile_123',
  ttl: 300
});
```

### Performance Timing

```typescript
import { logger } from '@/lib/logger';

const endTimer = logger.time('database-query');
const result = await db.query('SELECT * FROM users');
endTimer(); // Logs: "Timer: database-query { duration: 45 }"
```

### Child Logger (Persistent Context)

```typescript
import { logger } from '@/lib/logger';

// Create logger with persistent context
const requestLogger = logger.child({
  requestId: 'req_abc123',
  userId: 'user_456',
  endpoint: '/api/analyze'
});

// All logs automatically include requestId, userId, endpoint
requestLogger.info('Processing request');
requestLogger.error('Request failed', error);
```

### Security Logging

```typescript
import { securityLogger } from '@/lib/security-logger';

// Authentication failure
securityLogger.authFailure('Invalid credentials', {
  userId: 'user_123',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});

// Unauthorized access attempt
securityLogger.unauthorizedAccess('/api/admin', 'user_123', {
  ipAddress: req.ip,
  severity: 'high'
});

// Webhook verification failure
securityLogger.webhookVerificationFailed('stripe', 'Invalid signature', {
  endpoint: '/api/webhooks/stripe',
  ipAddress: req.ip
});

// Rate limit exceeded
securityLogger.rateLimitExceeded('user_123', '/api/analyze', {
  analysesUsed: 100,
  analysesLimit: 100
});

// Payment events
securityLogger.paymentEvent('payment_succeeded', 'user_123', {
  amount: 2999,
  currency: 'usd',
  planName: 'pro'
});

// Data access (compliance)
securityLogger.dataAccess('user_profiles', 'user_123', 'read', {
  recordCount: 50
});

// Webhook processed successfully
securityLogger.webhookProcessed('stripe', 'checkout.session.completed', {
  eventId: 'evt_123'
});
```

## Configuration

### Environment Variables

```bash
# Log level (debug | info | warn | error)
LOG_LEVEL=info

# Environment (development | production | test)
NODE_ENV=production
```

### Log Levels by Environment

- **Development**: `debug` (all logs)
- **Production**: `info` (info, warn, error)
- **Test**: `error` (errors only)

## Log Output Formats

### Development (Console)

```
🔍 [14:23:45] [DEBUG] Cache hit { key: 'user_123', ttl: 300 }
ℹ️ [14:23:46] [INFO] User logged in { userId: 'user_123' }
⚠️ [14:23:47] [WARN] Rate limit approaching { usage: 95 }
❌ [14:23:48] [ERROR] Database error { error: 'Connection timeout' }
```

### Production (JSON)

```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2025-10-09T14:23:46.123Z",
  "environment": "production",
  "context": {
    "userId": "user_123",
    "ipAddress": "192.168.1.1"
  }
}
```

## Sensitive Data Redaction

The logger automatically redacts sensitive keys:
- `password`
- `token`
- `secret`
- `apiKey` / `api_key`
- `stripe_key`
- `clerk_key`

```typescript
logger.info('Payment processed', {
  userId: 'user_123',
  stripe_key: 'sk_test_123', // Automatically becomes '[REDACTED]'
  amount: 2999
});
```

## Migration from console.log

### Before

```typescript
console.log('Processing order:', orderId);
console.error('Failed to process order:', error);
```

### After

```typescript
import { logger } from '@/lib/logger';

logger.info('Processing order', { orderId });
logger.error('Failed to process order', error, { orderId });
```

### Search and Replace Patterns

1. `console.log` → `logger.info`
2. `console.error` → `logger.error`
3. `console.warn` → `logger.warn`
4. `console.debug` → `logger.debug`

## Integration with External Services

### Sentry (Error Tracking)

```typescript
// In lib/logger.ts, update sendToExternalServices:

import * as Sentry from '@sentry/nextjs';

private sendToExternalServices(entry: LogEntry): void {
  if (entry.level === 'error' && this.environment === 'production') {
    Sentry.captureException(new Error(entry.message), {
      level: entry.level,
      extra: entry.context,
      tags: {
        environment: this.environment,
        file: entry.context?.file,
      }
    });
  }
}
```

### LogRocket (Session Replay)

```typescript
import LogRocket from 'logrocket';

private sendToExternalServices(entry: LogEntry): void {
  if (this.environment === 'production') {
    LogRocket.log(entry.level, entry.message, entry.context);
  }
}
```

### Custom Webhook (Slack, Discord, etc.)

```typescript
private async sendToExternalServices(entry: LogEntry): Promise<void> {
  if (entry.level === 'error' && entry.context?.severity === 'critical') {
    await fetch(process.env.ALERT_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Critical Error: ${entry.message}`,
        context: entry.context
      })
    });
  }
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// ✅ Good
logger.debug('Cache lookup', { key }); // Development only
logger.info('User action', { action }); // Important events
logger.warn('Approaching limit', { usage }); // Warnings
logger.error('Operation failed', error); // Errors

// ❌ Bad
logger.info('Variable x is', x); // Too verbose
logger.error('User clicked button'); // Not an error
```

### 2. Include Relevant Context

```typescript
// ✅ Good
logger.error('Payment failed', error, {
  userId: 'user_123',
  amount: 2999,
  paymentMethod: 'card',
  attemptCount: 3
});

// ❌ Bad
logger.error('Payment failed', error); // Missing context
```

### 3. Use Child Loggers for Request Tracing

```typescript
// ✅ Good
export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });

  requestLogger.info('Request started');
  // ... do work ...
  requestLogger.info('Request completed');
}

// ❌ Bad - No request correlation
logger.info('Request started');
logger.info('Request completed');
```

### 4. Use Security Logger for Audit Trail

```typescript
// ✅ Good - Creates audit trail
securityLogger.authSuccess('user_123', 'clerk', { ipAddress: req.ip });
securityLogger.dataAccess('user_profiles', 'user_123', 'update');

// ❌ Bad - No audit trail
logger.info('User logged in');
```

### 5. Performance Timing

```typescript
// ✅ Good
const endTimer = logger.time('expensive-operation');
await performExpensiveOperation();
endTimer();

// ❌ Bad - Manual timing
const start = Date.now();
await performExpensiveOperation();
console.log('Took', Date.now() - start);
```

## Monitoring Dashboards

### Key Metrics to Track

1. **Error Rate**
   - Query: `level:error`
   - Alert if > 5% of requests

2. **Response Time**
   - Query: `duration > 1000`
   - Alert if p95 > 2000ms

3. **Security Events**
   - Query: `event:auth_failure OR event:webhook_verification_failed`
   - Alert on any critical severity

4. **Payment Events**
   - Query: `event:payment_event AND paymentEvent:payment_failed`
   - Alert on payment failures

## Files Modified

### Critical API Routes
- `/app/api/webhooks/stripe/route.ts` - Stripe webhook logging
- `/app/api/webhooks/clerk/route.ts` - Clerk webhook logging
- `/app/api/stripe/checkout/route.ts` - Payment checkout logging
- `/app/api/analyze/route.ts` - Stock analysis logging

### Logger Libraries
- `/lib/logger.ts` - Core logging system
- `/lib/security-logger.ts` - Security event logging

## Next Steps

1. **Add Sentry Integration**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Add LogRocket Integration**
   ```bash
   npm install logrocket
   ```

3. **Set Up Log Aggregation**
   - Vercel: Built-in (Vercel Logs)
   - Railway: Built-in (Railway Logs)
   - Self-hosted: Configure external service

4. **Create Monitoring Dashboard**
   - Set up alerts for critical errors
   - Track payment event metrics
   - Monitor security events

5. **Replace Remaining console.log**
   - Search for remaining instances
   - Replace with appropriate logger calls
   - Test thoroughly

## Support

For issues or questions:
- Check existing logs in production dashboard
- Review security events for audit trail
- Use child loggers for request tracing
- Enable debug logging for development
