/**
 * MAIA Project Template Logger
 *
 * This module re-exports the universal logger from @maia-opencode/logger.
 * For Winston file logging, set USE_WINSTON=true environment variable.
 *
 * @deprecated Import directly from '@maia-opencode/logger' instead.
 * @module src/utils/logger
 */

// Re-export all functions and types from UNIVERSAL/logger
export {
  createLogger,
  getLogger,
  logInfo,
  logWarn,
  logError,
  logDebug,
  logHttp,
  type LogLevel,
  type LogContext,
  type LoggerConfig,
} from '../../../../../UNIVERSAL/logger/src/index.js';

// For backwards compatibility, also export initLogger and initHealthLogger
import { createLogger as createWinstonLogger } from '../../../../../UNIVERSAL/logger/src/index.js';

/**
 * Initialize a new logger instance with Winston.
 * @deprecated Use createLogger({ useWinston: true }) instead.
 */
export function initLogger() {
  return createWinstonLogger({
    useWinston: true,
    enableFile: true,
    enableConsole: process.env.NODE_ENV !== 'production',
  });
}

/**
 * Initialize a health logger instance.
 * @deprecated Use createLogger({ useWinston: true }) instead.
 */
export function initHealthLogger() {
  return createWinstonLogger({
    useWinston: true,
    enableFile: true,
    enableConsole: false,
    level: 'info',
  });
}

export type Logger = ReturnType<typeof initLogger>;
