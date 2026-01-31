/**
 * MAIA WhatsApp Bot Demo Logger
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
} from '../../../UNIVERSAL/logger/src/index.js';

// For backwards compatibility, also export a default 'logger' instance
import { createLogger as createWinstonLogger } from '../../../UNIVERSAL/logger/src/index.js';

/**
 * Default logger instance with Winston enabled for production use.
 * Configure via LOG_LEVEL, LOG_DIR environment variables.
 */
export const logger = createWinstonLogger({
  useWinston: true,
  enableFile: true,
  enableConsole: true,
});
