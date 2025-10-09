/**
 * Security Event Logger
 *
 * Specialized logging for security-critical events:
 * - Authentication failures
 * - Authorization violations
 * - Suspicious activity detection
 * - Webhook verification failures
 * - Rate limit violations
 */

import { logger, LogContext } from './logger';

export interface SecurityContext extends LogContext {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
}

class SecurityLogger {
  /**
   * Log authentication failures
   */
  authFailure(reason: string, context?: SecurityContext): void {
    logger.warn('Authentication failure', {
      ...context,
      severity: context?.severity || 'medium',
      event: 'auth_failure',
      reason,
    });
  }

  /**
   * Log authorization violations
   */
  unauthorizedAccess(endpoint: string, userId?: string, context?: SecurityContext): void {
    logger.warn('Unauthorized access attempt', {
      ...context,
      severity: context?.severity || 'high',
      event: 'unauthorized_access',
      endpoint,
      userId,
    });
  }

  /**
   * Log suspicious activity
   */
  suspiciousActivity(description: string, context?: SecurityContext): void {
    logger.warn('Suspicious activity detected', {
      ...context,
      severity: context?.severity || 'high',
      event: 'suspicious_activity',
      description,
    });
  }

  /**
   * Log webhook verification failures
   */
  webhookVerificationFailed(source: 'stripe' | 'clerk', reason: string, context?: SecurityContext): void {
    logger.error('Webhook verification failed', undefined, {
      ...context,
      severity: 'critical',
      event: 'webhook_verification_failed',
      source,
      reason,
    });
  }

  /**
   * Log rate limit violations
   */
  rateLimitExceeded(userId: string | null | undefined, endpoint: string, context?: SecurityContext): void {
    logger.warn('Rate limit exceeded', {
      ...context,
      severity: context?.severity || 'medium',
      event: 'rate_limit_exceeded',
      userId: userId ?? undefined,
      endpoint,
    });
  }

  /**
   * Log successful authentications (for audit trail)
   */
  authSuccess(userId: string, method: string, context?: SecurityContext): void {
    logger.info('Authentication successful', {
      ...context,
      severity: 'low',
      event: 'auth_success',
      userId,
      method,
    });
  }

  /**
   * Log payment events
   */
  paymentEvent(
    event: 'checkout_started' | 'payment_succeeded' | 'payment_failed' | 'subscription_created' | 'subscription_cancelled',
    userId: string,
    context?: SecurityContext & { amount?: number; currency?: string; planName?: string }
  ): void {
    const severity = event.includes('failed') ? 'medium' : 'low';

    logger.info(`Payment event: ${event}`, {
      ...context,
      severity,
      event: 'payment_event',
      paymentEvent: event,
      userId,
    });
  }

  /**
   * Log data access events (for compliance)
   */
  dataAccess(
    resource: string,
    userId: string | null | undefined,
    operation: 'read' | 'create' | 'update' | 'delete',
    context?: SecurityContext
  ): void {
    logger.info('Data access', {
      ...context,
      severity: operation === 'delete' ? 'medium' : 'low',
      event: 'data_access',
      resource,
      userId: userId ?? undefined,
      operation,
    });
  }

  /**
   * Log webhook events (successful processing)
   */
  webhookProcessed(
    source: 'stripe' | 'clerk',
    eventType: string,
    context?: SecurityContext
  ): void {
    logger.info(`Webhook processed: ${source}.${eventType}`, {
      ...context,
      severity: 'low',
      event: 'webhook_processed',
      source,
      eventType,
    });
  }

  /**
   * Log configuration errors
   */
  configurationError(setting: string, reason: string, context?: SecurityContext): void {
    logger.error('Configuration error', undefined, {
      ...context,
      severity: 'critical',
      event: 'configuration_error',
      setting,
      reason,
    });
  }
}

export const securityLogger = new SecurityLogger();

/**
 * Usage Examples:
 *
 * // Authentication failure
 * securityLogger.authFailure('Invalid credentials', {
 *   userId: 'user_123',
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent']
 * });
 *
 * // Webhook verification failure
 * securityLogger.webhookVerificationFailed('stripe', 'Invalid signature', {
 *   ipAddress: req.ip,
 *   endpoint: '/api/webhooks/stripe'
 * });
 *
 * // Suspicious activity
 * securityLogger.suspiciousActivity('Multiple failed login attempts', {
 *   userId: 'user_123',
 *   severity: 'critical',
 *   metadata: { attemptCount: 5 }
 * });
 *
 * // Payment event
 * securityLogger.paymentEvent('payment_succeeded', 'user_123', {
 *   amount: 2999,
 *   currency: 'usd',
 *   planName: 'pro'
 * });
 */
