/**
 * Anthropic Claude Client
 *
 * Production-ready Claude API integration with:
 * - Connection pooling and retry logic
 * - Structured error handling
 * - Token usage tracking
 * - Request/response logging
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/security-logger';

// Model constant - Claude Opus 4.5
export const AI_MODEL = 'claude-opus-4-5-20251101';
export const AI_MODEL_DISPLAY = 'claude-opus-4.5';

// Validate API key at startup
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY && process.env.NODE_ENV === 'production') {
  securityLogger.configurationError(
    'ANTHROPIC_API_KEY',
    'API key not configured for production',
    { severity: 'critical' }
  );
}

// Singleton client instance
let clientInstance: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!clientInstance) {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    clientInstance = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
      maxRetries: 3,
      timeout: 60000, // 60 seconds for complex analysis
    });

    logger.info('Anthropic client initialized', {
      model: AI_MODEL,
    });
  }

  return clientInstance;
}

export const AI_ENABLED = Boolean(ANTHROPIC_API_KEY);

export interface AIUsageMetrics {
  inputTokens: number;
  outputTokens: number;
  model: string;
  latencyMs: number;
}

export function trackAIUsage(metrics: AIUsageMetrics): void {
  logger.info('AI usage tracked', {
    ...metrics,
    estimatedCost: calculateCost(metrics),
  });
}

function calculateCost(metrics: AIUsageMetrics): number {
  // Claude Opus 4.5 pricing (update as needed)
  const INPUT_COST_PER_1M = 15.0; // $15 per 1M input tokens
  const OUTPUT_COST_PER_1M = 75.0; // $75 per 1M output tokens

  return (
    (metrics.inputTokens / 1_000_000) * INPUT_COST_PER_1M +
    (metrics.outputTokens / 1_000_000) * OUTPUT_COST_PER_1M
  );
}

export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export function handleAIError(error: unknown): AIError {
  if (error instanceof Anthropic.APIError) {
    const retryable = error.status === 429 || error.status >= 500;
    return new AIError(
      error.message,
      `ANTHROPIC_${error.status}`,
      retryable
    );
  }

  if (error instanceof Error) {
    return new AIError(error.message, 'UNKNOWN_ERROR', false);
  }

  return new AIError('An unknown error occurred', 'UNKNOWN_ERROR', false);
}
