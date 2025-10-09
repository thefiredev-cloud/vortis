# Monitoring and Observability Integration Guide

## Overview

Complete guide for integrating production monitoring with Prometheus, Grafana, distributed tracing, and log aggregation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Logger  │  │ Security │  │ Metrics  │  │  Tracing │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└───────┼─────────────┼─────────────┼─────────────┼─────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌────────────────────────────────────────────────────────────┐
│              Observability Layer                            │
│  ┌────────────┐  ┌─────────┐  ┌────────────┐  ┌─────────┐│
│  │   Sentry   │  │ LogRocket│  │ Prometheus │  │  Jaeger ││
│  │ (Errors)   │  │ (Replay) │  │ (Metrics)  │  │ (Traces)││
│  └────────────┘  └─────────┘  └────────────┘  └─────────┘│
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                    Visualization Layer                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │               Grafana Dashboard                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │ │
│  │  │  Errors  │  │ Metrics  │  │  Traces  │          │ │
│  │  └──────────┘  └──────────┘  └──────────┘          │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## 1. Sentry Integration (Error Tracking)

### Installation

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Configuration

**sentry.client.config.ts**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

**sentry.server.config.ts**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Logger Integration

Update `/lib/logger.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

private sendToExternalServices(entry: LogEntry): void {
  if (entry.level === 'error' && this.environment === 'production') {
    Sentry.captureException(
      entry.error ? new Error(entry.error.message) : new Error(entry.message),
      {
        level: 'error',
        extra: entry.context,
        tags: {
          environment: this.environment,
          file: entry.context?.file,
        },
      }
    );
  }

  // Capture security events as breadcrumbs
  if (entry.context?.event) {
    Sentry.addBreadcrumb({
      category: 'security',
      message: entry.message,
      level: entry.level,
      data: entry.context,
    });
  }
}
```

## 2. LogRocket Integration (Session Replay)

### Installation

```bash
npm install logrocket
```

### Configuration

**lib/logrocket.ts**
```typescript
import LogRocket from 'logrocket';

export function initLogRocket() {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID!);
  }
}

export function identifyUser(userId: string, userInfo?: {
  name?: string;
  email?: string;
}) {
  if (process.env.NODE_ENV === 'production') {
    LogRocket.identify(userId, userInfo);
  }
}
```

**app/layout.tsx**
```typescript
'use client';
import { initLogRocket } from '@/lib/logrocket';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    initLogRocket();
  }, []);

  return (
    // ... rest of layout
  );
}
```

### Logger Integration

Update `/lib/logger.ts`:

```typescript
import LogRocket from 'logrocket';

private sendToExternalServices(entry: LogEntry): void {
  // ... Sentry code ...

  // Send to LogRocket
  if (this.environment === 'production' && typeof window !== 'undefined') {
    LogRocket.log(entry.level, entry.message, entry.context);

    if (entry.level === 'error') {
      LogRocket.captureException(new Error(entry.message), {
        extra: entry.context,
      });
    }
  }
}
```

## 3. Prometheus Metrics

### Installation

```bash
npm install prom-client
```

### Metrics Library

**lib/metrics.ts**
```typescript
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

class Metrics {
  private registry: Registry;
  private httpRequestDuration: Histogram;
  private httpRequestTotal: Counter;
  private databaseQueryDuration: Histogram;
  private activeUsers: Gauge;
  private apiUsage: Counter;
  private paymentEvents: Counter;
  private securityEvents: Counter;

  constructor() {
    this.registry = new Registry();

    // HTTP metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // Database metrics
    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['query_type', 'table'],
      registers: [this.registry],
    });

    // Application metrics
    this.activeUsers = new Gauge({
      name: 'active_users_total',
      help: 'Number of active users',
      registers: [this.registry],
    });

    this.apiUsage = new Counter({
      name: 'api_usage_total',
      help: 'Total API usage by user',
      labelNames: ['user_id', 'endpoint', 'plan'],
      registers: [this.registry],
    });

    // Payment metrics
    this.paymentEvents = new Counter({
      name: 'payment_events_total',
      help: 'Total payment events',
      labelNames: ['event_type', 'plan', 'status'],
      registers: [this.registry],
    });

    // Security metrics
    this.securityEvents = new Counter({
      name: 'security_events_total',
      help: 'Total security events',
      labelNames: ['event_type', 'severity'],
      registers: [this.registry],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number
  ) {
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration / 1000
    );
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  recordDatabaseQuery(queryType: string, table: string, duration: number) {
    this.databaseQueryDuration.observe(
      { query_type: queryType, table },
      duration / 1000
    );
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  recordApiUsage(userId: string, endpoint: string, plan: string) {
    this.apiUsage.inc({ user_id: userId, endpoint, plan });
  }

  recordPaymentEvent(eventType: string, plan: string, status: string) {
    this.paymentEvents.inc({ event_type: eventType, plan, status });
  }

  recordSecurityEvent(eventType: string, severity: string) {
    this.securityEvents.inc({ event_type: eventType, severity });
  }

  async getMetrics(): Promise<string> {
    return await this.registry.metrics();
  }
}

export const metrics = new Metrics();
```

### Metrics Endpoint

**app/api/metrics/route.ts**
```typescript
import { NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';

export async function GET() {
  try {
    const metricsData = await metrics.getMetrics();
    return new NextResponse(metricsData, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get metrics' }, { status: 500 });
  }
}
```

### Middleware Integration

**middleware.ts**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { metrics } from '@/lib/metrics';

export async function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;
  const statusCode = response.status;
  const method = request.method;
  const route = request.nextUrl.pathname;

  // Record metrics
  metrics.recordHttpRequest(method, route, statusCode, duration);

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### Logger Integration

Update `/lib/security-logger.ts`:

```typescript
import { metrics } from './metrics';

class SecurityLogger {
  // ... existing methods ...

  authFailure(reason: string, context?: SecurityContext): void {
    logger.warn('Authentication failure', {
      ...context,
      severity: context?.severity || 'medium',
      event: 'auth_failure',
      reason,
    });

    // Record metric
    metrics.recordSecurityEvent('auth_failure', context?.severity || 'medium');
  }

  paymentEvent(
    event: string,
    userId: string,
    context?: SecurityContext & { planName?: string }
  ): void {
    // ... existing logging ...

    // Record metric
    metrics.recordPaymentEvent(
      event,
      context?.planName || 'unknown',
      event.includes('failed') ? 'failed' : 'success'
    );
  }
}
```

## 4. Prometheus Configuration

**prometheus.yml**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'vortis-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scheme: https
```

### Docker Compose

**docker-compose.monitoring.yml**
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - "3001:3000"
    networks:
      - monitoring
    depends_on:
      - prometheus

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitoring:
```

Start monitoring stack:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

## 5. Grafana Dashboard

### Datasource Configuration

**grafana/datasources/prometheus.yml**
```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

### Dashboard Configuration

**grafana/dashboards/vortis-app.json**
```json
{
  "dashboard": {
    "title": "Vortis Application Monitoring",
    "panels": [
      {
        "title": "HTTP Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Request Duration (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Security Events",
        "targets": [
          {
            "expr": "rate(security_events_total[5m])"
          }
        ]
      },
      {
        "title": "Payment Events",
        "targets": [
          {
            "expr": "rate(payment_events_total[5m])"
          }
        ]
      },
      {
        "title": "API Usage by Plan",
        "targets": [
          {
            "expr": "sum by (plan) (rate(api_usage_total[5m]))"
          }
        ]
      }
    ]
  }
}
```

## 6. Distributed Tracing (Jaeger)

### Installation

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

### Configuration

**instrumentation.ts**
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
```

**package.json**
```json
{
  "scripts": {
    "start": "node --require ./instrumentation.js .next/standalone/server.js"
  }
}
```

## 7. Log Aggregation

### Vercel Deployment

Vercel provides built-in log aggregation. Access via:
- Vercel Dashboard > Project > Logs
- Filter by level, time range, search terms

### Railway Deployment

Railway provides built-in logging. Access via:
- Railway Dashboard > Project > Logs
- Real-time log streaming

### Self-Hosted (ELK Stack)

**docker-compose.elk.yml**
```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

## 8. Alerts Configuration

### Grafana Alerts

**grafana/alerts.yml**
```yaml
groups:
  - name: vortis_alerts
    interval: 1m
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/second"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time"
          description: "95th percentile response time is {{ $value }}s"

      - alert: SecurityEventSpike
        expr: rate(security_events_total{severity="critical"}[5m]) > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Critical security event detected"

      - alert: PaymentFailureSpike
        expr: rate(payment_events_total{status="failed"}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High payment failure rate"
```

## 9. Environment Variables

Add to `.env.local`:

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# LogRocket
NEXT_PUBLIC_LOGROCKET_APP_ID=xxx/vortis

# Jaeger
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Prometheus
PROMETHEUS_ENDPOINT=http://localhost:9090

# Grafana
GRAFANA_URL=http://localhost:3001
GRAFANA_API_KEY=xxx
```

## 10. Production Checklist

- [ ] Sentry installed and configured
- [ ] LogRocket initialized (optional)
- [ ] Prometheus metrics endpoint deployed
- [ ] Grafana dashboard created
- [ ] Alerts configured
- [ ] Log aggregation set up
- [ ] Distributed tracing enabled (optional)
- [ ] Error tracking tested
- [ ] Metrics validated
- [ ] Dashboard accessible
- [ ] Alerts delivering notifications
- [ ] Team has access to monitoring tools

## Support Resources

- **Sentry**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **LogRocket**: https://docs.logrocket.com/
- **OpenTelemetry**: https://opentelemetry.io/docs/
