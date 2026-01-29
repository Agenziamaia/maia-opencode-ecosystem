/**
 * ⏱️ MAIA Timeout Guard System
 *
 * Prevents indefinite loading/waiting by enforcing explicit timeouts
 * on all async operations. Part of the anti-deadlock architecture.
 */

type TimeoutConfig = {
  timeoutMs: number;
  fallback?: any;
  errorMessage?: string;
};

/**
 * Execute an async function with timeout protection
 * @param fn - Async function to execute
 * @param config - Timeout configuration
 * @returns Result of fn or fallback value
 *
 * @example
 * const data = await withTimeout(
 *   () => fetch('/api/data').then(r => r.json()),
 *   { timeoutMs: 5000, fallback: null }
 * );
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  config: TimeoutConfig
): Promise<T | any> {
  const { timeoutMs, fallback, errorMessage } = config;

  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs)
    ),
  ]).catch((error) => {
    if (error instanceof Error && error.message.includes('timed out')) {
      return fallback;
    }
    throw error;
  });
}

/**
 * Execute with AbortController for cancellable operations
 * @param fn - Async function that accepts AbortSignal
 * @param timeoutMs - Timeout in milliseconds
 * @returns Result of fn
 *
 * @example
 * const data = await withAbortSignal(
 *   (signal) => fetch(url, { signal }).then(r => r.json()),
 *   8000
 * );
 */
export async function withAbortSignal<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await fn(controller.signal);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error(`Operation aborted after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Retry with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum retry attempts (default: 3)
 * @param baseDelay - Initial delay in ms (default: 1000)
 * @param maxDelay - Maximum delay in ms (default: 30000)
 * @returns Result of fn
 *
 * @example
 * const data = await withRetry(
 *   () => fetch(url).then(r => r.json()),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    onRetry,
  } = config;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff (2^attempt)
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Add jitter (±25%) to avoid thundering herd
      const jitteredDelay = delay * (0.75 + Math.random() * 0.5);

      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }

  throw lastError;
}

/**
 * Timeout presets for common operations
 *
 * TESTING timeouts (10-30s) - Fast enough to detect dead agents
 * WORK timeouts (5-15 min) - Allow actual work to complete
 */
export const TIMEOUT_PRESETS = {
  // Testing/Health Check operations
  HEALTH_CHECK_QUICK: 10000,    // 10s - Quick agent alive check
  HEALTH_CHECK: 20000,          // 20s - Standard health check
  SIMPLE_TEST: 30000,           // 30s - Simple test operations

  // Actual work operations (agents need time to complete tasks)
  SIMPLE_QUERY: 120000,         // 2 min - Quick queries
  CODE_TASK: 600000,            // 10 min - Complex coding tasks
  RESEARCH_TASK: 300000,        // 5 min - Research queries
  WORKFLOW_TASK: 900000,        // 15 min - Long workflows
  REVIEW_TASK: 180000,          // 3 min - Code review/audit

  // Network operations
  FETCH: 8000,                 // 8s - Standard user expectation
  DISCORD: 5000,               // 5s - Discord API
  WEBFETCH: 10000,             // 10s - Web scraping
  MCP_TOOL: 5000,             // 5s - MCP tool execution

  // Provider-specific (actual work, not just health checks)
  ZAI_CODING_PLAN: 120000,      // 2 min - Z.ai provider
  GOOGLE: 60000,               // 1 min - Google Gemini
  OPENROUTER: 90000,           // 1.5 min - OpenRouter global
  OPENCODE: 60000,              // 1 min - OpenCode models

  // Fallback
  MAX_RETRY_DELAY: 30000,        // 30s - Maximum retry delay
} as const;

/**
 * Get timeout value with fallback to default
 */
export function getTimeout(
  key: keyof typeof TIMEOUT_PRESETS,
  fallback: number = TIMEOUT_PRESETS.FETCH
): number {
  return TIMEOUT_PRESETS[key] || fallback;
}
