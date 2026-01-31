/**
 * MAIA Layer0 Logger
 *
 * This module re-exports the universal logger from @maia-opencode/logger.
 *
 * @deprecated Import directly from '@maia-opencode/logger' instead.
 * @module @maia-layer0/utils/logger
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
} from '../../UNIVERSAL/logger/src/index.js';
