# Console.log Migration Guide

## Overview

Systematic guide to replace all remaining `console.log` statements with structured logging.

## Migration Strategy

### Phase 1: Critical Routes (COMPLETED)

✅ `/app/api/webhooks/stripe/route.ts` - Stripe webhooks
✅ `/app/api/webhooks/clerk/route.ts` - Clerk webhooks
✅ `/app/api/stripe/checkout/route.ts` - Payment checkout
✅ `/app/api/analyze/route.ts` - Stock analysis

### Phase 2: Remaining API Routes

Priority files to update:

1. `/app/api/stripe/portal/route.ts`
2. `/app/api/stripe/create-checkout/route.ts` (if exists)
3. `/app/api/stripe/create-portal/route.ts` (if exists)
4. Any other API routes in `/app/api/`

### Phase 3: Component Error Boundaries

1. `/app/error.tsx`
2. `/app/global-error.tsx`
3. `/app/dashboard/error.tsx`
4. `/app/dashboard/analyze/[ticker]/error.tsx`

### Phase 4: Client-Side Code

1. Components with error handling
2. Client-side data fetching
3. Form submissions
4. Event handlers

## Quick Reference

### Replacement Patterns

| Old Pattern | New Pattern |
|------------|-------------|
| `console.log('message')` | `logger.info('message')` |
| `console.error('message')` | `logger.error('message', error)` |
| `console.warn('message')` | `logger.warn('message')` |
| `console.debug('message')` | `logger.debug('message')` |
| `console.log('message', data)` | `logger.info('message', { data })` |

### Common Scenarios

#### 1. Simple Logging

```typescript
// Before
console.log('Processing request');

// After
import { logger } from '@/lib/logger';
logger.info('Processing request');
```

#### 2. Error Logging

```typescript
// Before
console.error('Error:', error);

// After
import { logger } from '@/lib/logger';
logger.error('Operation failed', error);
```

#### 3. Logging with Data

```typescript
// Before
console.log('User action:', userId, action);

// After
import { logger } from '@/lib/logger';
logger.info('User action', { userId, action });
```

#### 4. Debug Logging

```typescript
// Before
console.log('[DEBUG]', variable);

// After
import { logger } from '@/lib/logger';
logger.debug('Variable state', { variable });
```

#### 5. Authentication Events

```typescript
// Before
console.log('User logged in:', userId);

// After
import { securityLogger } from '@/lib/security-logger';
securityLogger.authSuccess(userId, 'clerk', {
  ipAddress: req.ip
});
```

#### 6. Webhook Events

```typescript
// Before
console.log('Webhook received:', event.type);

// After
import { securityLogger } from '@/lib/security-logger';
securityLogger.webhookProcessed('stripe', event.type, {
  eventId: event.id
});
```

## Step-by-Step Migration Process

### Step 1: Find All console.log Statements

```bash
# Search for all console.log in the codebase
grep -r "console\." --include="*.ts" --include="*.tsx" app/

# Count occurrences
grep -r "console\." --include="*.ts" --include="*.tsx" app/ | wc -l
```

### Step 2: Categorize by Type

Group statements by:
1. **Info**: General information (→ `logger.info`)
2. **Error**: Error messages (→ `logger.error`)
3. **Warning**: Warnings (→ `logger.warn`)
4. **Debug**: Development debugging (→ `logger.debug`)
5. **Security**: Auth/payment/access (→ `securityLogger.*`)

### Step 3: Update Files

For each file:

1. Add import at top:
```typescript
import { logger } from '@/lib/logger';
// or
import { securityLogger } from '@/lib/security-logger';
```

2. Replace console statements following patterns above

3. Add relevant context to logs:
```typescript
// Before
console.log('Processing', id);

// After
logger.info('Processing item', { id, userId, timestamp: Date.now() });
```

4. Test the file to ensure no errors

### Step 4: Verify Changes

1. Run TypeScript compiler:
```bash
npm run build
```

2. Run tests:
```bash
npm test
```

3. Manual testing in development:
```bash
npm run dev
```

## Example: Complete File Migration

### Before

```typescript
// app/api/example/route.ts
export async function POST(request: Request) {
  console.log('Received request');

  try {
    const data = await request.json();
    console.log('Data:', data);

    const result = await processData(data);
    console.log('Result:', result);

    return Response.json({ success: true, result });
  } catch (error) {
    console.error('Error processing request:', error);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### After

```typescript
// app/api/example/route.ts
import { logger } from '@/lib/logger';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const { userId } = await auth();
  const requestLogger = logger.child({
    requestId: crypto.randomUUID(),
    userId,
    endpoint: '/api/example'
  });

  requestLogger.info('Request received');

  try {
    const data = await request.json();
    requestLogger.debug('Request data parsed', { dataKeys: Object.keys(data) });

    const endTimer = logger.time('process-data');
    const result = await processData(data);
    endTimer();

    requestLogger.info('Request processed successfully', {
      resultSize: JSON.stringify(result).length
    });

    return Response.json({ success: true, result });
  } catch (error) {
    requestLogger.error('Request processing failed', error as Error, {
      requestBody: await request.text().catch(() => 'Unable to read')
    });
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## File-Specific Guidelines

### API Routes

```typescript
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';

// Use child logger for request tracing
const requestLogger = logger.child({
  requestId: crypto.randomUUID()
});

// Log all errors with context
requestLogger.error('Operation failed', error, {
  endpoint: '/api/...',
  userId: '...'
});

// Log security events
securityLogger.unauthorizedAccess(endpoint, userId);
```

### Error Boundaries

```typescript
'use client';
import { logger } from '@/lib/logger';

export default function ErrorBoundary({ error }: { error: Error }) {
  // Log error on mount
  React.useEffect(() => {
    logger.error('Component error boundary triggered', error, {
      component: 'ErrorBoundary',
      pathname: window.location.pathname
    });
  }, [error]);

  return <div>Error occurred</div>;
}
```

### Client Components

```typescript
'use client';
import { logger } from '@/lib/logger';

export function MyComponent() {
  const handleSubmit = async () => {
    try {
      await submitData();
      logger.info('Form submitted successfully');
    } catch (error) {
      logger.error('Form submission failed', error as Error);
    }
  };
}
```

## Testing Your Changes

### 1. Development Testing

```bash
# Start dev server
npm run dev

# Set debug level
LOG_LEVEL=debug npm run dev

# Check logs in terminal
```

### 2. Verify Log Format

Development should show:
```
ℹ️ [14:23:45] [INFO] Request received { requestId: '...' }
```

Production should show:
```json
{"level":"info","message":"Request received","timestamp":"...","context":{...}}
```

### 3. Check for Errors

```bash
# Run build to catch TypeScript errors
npm run build

# Run tests
npm test
```

## Common Issues

### Issue 1: Circular Dependencies

**Problem**: Import error when adding logger to certain files

**Solution**: Use dynamic import
```typescript
// Instead of
import { logger } from '@/lib/logger';

// Use
const { logger } = await import('@/lib/logger');
```

### Issue 2: Client vs Server

**Problem**: Logger used in client component without 'use client'

**Solution**: Add directive or use conditional import
```typescript
'use client';
import { logger } from '@/lib/logger';

// Or conditionally
if (typeof window === 'undefined') {
  logger.info('Server-side only');
}
```

### Issue 3: Too Verbose

**Problem**: Too many debug logs in production

**Solution**: Use appropriate log level
```typescript
// Development only
logger.debug('Detailed info');

// Production visible
logger.info('Important event');
```

## Automated Migration Script

Save as `scripts/migrate-console-logs.sh`:

```bash
#!/bin/bash

# Replace console.log with logger.info
find app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/console\.log(/logger.info(/g' {} +

# Replace console.error with logger.error
find app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/console\.error(/logger.error(/g' {} +

# Replace console.warn with logger.warn
find app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/console\.warn(/logger.warn(/g' {} +

# Replace console.debug with logger.debug
find app -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/console\.debug(/logger.debug(/g' {} +

echo "Console statements replaced. Review and add imports manually."
```

**Note**: This script does a basic replacement. You must:
1. Add imports manually
2. Update parameters to use context objects
3. Test each file thoroughly

## Checklist

- [ ] Find all console.log statements
- [ ] Categorize by log level
- [ ] Update critical API routes (COMPLETED)
- [ ] Update remaining API routes
- [ ] Update error boundaries
- [ ] Update client components
- [ ] Add context to all logs
- [ ] Test in development
- [ ] Test production build
- [ ] Verify log output format
- [ ] Set up log monitoring
- [ ] Document remaining console.logs (if any kept intentionally)

## Intentional console.log Exceptions

Some console.logs may be kept intentionally:

1. **Build scripts**: Scripts that run during build time
2. **Development tools**: Tools specifically for development debugging
3. **Legacy code**: Code scheduled for refactoring/removal

Document these with comments:
```typescript
// Intentional console.log for build script
console.log('Building...');
```

## Performance Considerations

The new logger has zero overhead when logs are disabled:

```typescript
// No-op in production when level is below threshold
logger.debug('...');  // Skipped in production

// Minimal overhead for enabled logs
logger.info('...');   // Fast, structured JSON
```

## Support

For help with migration:
1. Check `/docs/LOGGING_GUIDE.md` for usage examples
2. Review completed migrations in critical routes
3. Test changes in development before deploying
