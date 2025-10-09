/**
 * Structured Logger
 *
 * Production-grade logging with:
 * - Log levels (debug, info, warn, error)
 * - Structured JSON output in production
 * - Environment-aware configuration
 * - Automatic context injection (timestamp, environment, file)
 * - Sensitive data redaction
 * - Zero overhead when disabled
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  requestId?: string;
  file?: string;
  function?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  environment: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private environment: string;
  private minLevel: LogLevel;
  private sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key', 'stripe_key', 'clerk_key'];

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.minLevel = this.getMinLevel();
  }

  private getMinLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;

    if (this.environment === 'test') return 'error';
    if (this.environment === 'production') return envLevel || 'info';
    return envLevel || 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.minLevel);
    return currentIndex >= minIndex;
  }

  private redactSensitive(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.redactSensitive(item));
    }

    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        redacted[key] = this.redactSensitive(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  private formatForConsole(entry: LogEntry): void {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[entry.level];

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `${emoji} [${timestamp}] [${entry.level.toUpperCase()}]`;

    if (this.environment === 'development') {
      // Colorful output for development
      const color = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      }[entry.level];
      const reset = '\x1b[0m';

      console[entry.level === 'debug' ? 'log' : entry.level](
        `${color}${prefix}${reset}`,
        entry.message,
        entry.context ? entry.context : '',
        entry.error ? entry.error : ''
      );
    } else {
      // JSON output for production (parseable by log aggregators)
      console[entry.level === 'debug' ? 'log' : entry.level](JSON.stringify(entry));
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      context: context ? this.redactSensitive(context) as LogContext : undefined,
    };

    if (error) {
      entry.error = {
        message: error.message,
        stack: this.environment === 'production' ? undefined : error.stack,
        code: (error as any).code,
      };
    }

    this.formatForConsole(entry);

    // Hook for external services (Sentry, LogRocket, etc.)
    this.sendToExternalServices(entry);
  }

  private sendToExternalServices(entry: LogEntry): void {
    // TODO: Integrate with external monitoring services
    // Examples:
    // - Sentry.captureException() for errors
    // - LogRocket.log() for all levels
    // - Custom webhook for critical errors

    if (entry.level === 'error' && this.environment === 'production') {
      // Example: Send to error tracking service
      // Sentry.captureException(new Error(entry.message), {
      //   level: entry.level,
      //   extra: entry.context,
      // });
    }
  }

  /**
   * Debug-level logging (development only)
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Info-level logging (general information)
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning-level logging (non-critical issues)
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error-level logging (critical issues)
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, context, error);
  }

  /**
   * Performance timing helper
   */
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`Timer: ${label}`, { duration: Math.round(duration) });
    };
  }

  /**
   * Create child logger with persistent context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    const originalLog = childLogger.log.bind(childLogger);

    childLogger.log = (level: LogLevel, message: string, additionalContext?: LogContext, error?: Error) => {
      originalLog(level, message, { ...context, ...additionalContext }, error);
    };

    return childLogger;
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Usage Examples:
 *
 * // Basic logging
 * logger.info('User logged in', { userId: 'user_123' });
 * logger.error('Database connection failed', error, { database: 'postgres' });
 *
 * // Performance timing
 * const endTimer = logger.time('api-request');
 * await fetchData();
 * endTimer(); // Logs duration
 *
 * // Child logger with persistent context
 * const requestLogger = logger.child({ requestId: 'req_123', userId: 'user_456' });
 * requestLogger.info('Processing request'); // Auto-includes requestId and userId
 * requestLogger.error('Request failed', error);
 *
 * // Sensitive data auto-redaction
 * logger.info('Payment processed', {
 *   amount: 100,
 *   stripe_key: 'sk_test_123' // Automatically redacted
 * });
 */
