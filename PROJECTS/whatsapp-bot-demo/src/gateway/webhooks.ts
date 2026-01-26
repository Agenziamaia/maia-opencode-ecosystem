// OPS: Webhook Utilities - Signature verification and job enqueueing
// Role: Security and job routing for incoming webhooks

import crypto from 'crypto';

/**
 * Verify Spoki webhook signature
 */
export function verifySpokiWebhook(payload: any, signature: string): boolean {
  const secret = process.env.SPOKI_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('⚠️ SPOKI_WEBHOOK_SECRET not set, skipping signature verification');
    return true; // Skip verification in dev if secret not set
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Enqueue webhook job with proper routing
 */
export async function enqueueWebhookJob(queue: any, type: string, data: any, options: any = {}) {
  const defaultOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Max 24 hours old
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
    },
  };

  return await queue.add(type, data, { ...defaultOptions, ...options });
}

/**
 * Rate limiter for webhook endpoints
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Filter out old requests outside the window
    const validRequests = requests.filter((timestamp) => timestamp > now - this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  clear(identifier: string): void {
    this.requests.delete(identifier);
  }
}

export const webhookRateLimiter = new RateLimiter(60000, 100);
