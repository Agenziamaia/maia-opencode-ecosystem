/**
 * MAIA Universal Logger
 *
 * A unified logging system for the MAIA OpenCode ecosystem.
 * Supports both simple console logging (lightweight) and Winston-based logging (production).
 *
 * Features:
 * - Consistent API across all ecosystem packages
 * - Environment-based configuration
 * - Support for both development and production modes
 * - Optional file logging with rotation (via Winston)
 * - TypeScript types included
 *
 * @module UNIVERSAL/logger
 */

import { existsSync, mkdirSync } from 'fs';

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'http';

export interface LogContext {
  [key: string]: unknown;
}

export interface LoggerConfig {
  level?: LogLevel;
  useWinston?: boolean;
  logDir?: string;
  enableConsole?: boolean;
  enableFile?: boolean;
  maxFiles?: string;
  maxSize?: string;
}

// ============================================================================
// Simple Console Logger (Lightweight)
// ============================================================================

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

class SimpleLogger {
  private config: Required<LoggerConfig>;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level ?? (process.env.LOG_LEVEL as LogLevel) ?? 'info',
      useWinston: false,
      logDir: config.logDir ?? process.env.LOG_DIR ?? './logs',
      enableConsole: config.enableConsole ?? true,
      enableFile: false,
      maxFiles: '14d',
      maxSize: '20m',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      http: 1,
      info: 2,
      warn: 3,
      error: 4,
    };
    return levels[level] >= levels[this.config.level];
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(formatLog('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(formatLog('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.shouldLog('error')) {
      console.error(formatLog('error', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
        console.debug(formatLog('debug', message, context));
      }
    }
  }

  http(message: string, context?: LogContext): void {
    if (this.shouldLog('http')) {
      console.log(formatLog('http', message, context));
    }
  }
}

// ============================================================================
// Winston Logger (Production)
// ============================================================================

let WinstonLogger: any = null;
let DailyRotateFile: any = null;

class WinstonLoggerImpl {
  private logger: any;
  private config: Required<LoggerConfig>;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level ?? (process.env.LOG_LEVEL as LogLevel) ?? 'info',
      useWinston: true,
      logDir: config.logDir ?? process.env.LOG_DIR ?? './logs',
      enableConsole: config.enableConsole ?? true,
      enableFile: config.enableFile ?? true,
      maxFiles: config.maxFiles ?? '14d',
      maxSize: config.maxSize ?? '20m',
    };

    // Ensure log directory exists
    if (this.config.enableFile && !existsSync(this.config.logDir)) {
      try {
        mkdirSync(this.config.logDir, { recursive: true });
      } catch (err) {
        // Directory creation failed, disable file logging
        this.config.enableFile = false;
      }
    }

    this.logger = this.createWinstonLogger();
  }

  private createWinstonLogger(): any {
    // Dynamic import to avoid requiring Winston unless needed
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      WinstonLogger = require('winston');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      DailyRotateFile = require('winston-daily-rotate-file');
    } catch {
      // Winston not installed, fall back to simple logger
      return new SimpleLogger(this.config);
    }

    if (!WinstonLogger) {
      return new SimpleLogger(this.config);
    }

    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };

    const colors = {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'blue',
    };

    WinstonLogger.addColors(colors);

    const format = WinstonLogger.format.combine(
      WinstonLogger.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      WinstonLogger.format.errors({ stack: true }),
      WinstonLogger.format.splat(),
      WinstonLogger.format.json(),
    );

    const consoleFormat = WinstonLogger.format.combine(
      WinstonLogger.format.colorize({ all: true }),
      WinstonLogger.format.timestamp({ format: 'HH:mm:ss' }),
      WinstonLogger.format.printf(
        (info: any) =>
          `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`,
      ),
    );

    const transports: any[] = [];

    // Console transport
    if (this.config.enableConsole && process.env.NODE_ENV !== 'production') {
      transports.push(new WinstonLogger.transports.Console({ format: consoleFormat }));
    }

    // File transports
    if (this.config.enableFile) {
      // Error log file
      transports.push(
        new DailyRotateFile({
          filename: `${this.config.logDir}/error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
        }),
      );

      // Combined log file
      transports.push(
        new DailyRotateFile({
          filename: `${this.config.logDir}/app-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
        }),
      );

      // Health log file (separate)
      transports.push(
        new DailyRotateFile({
          filename: `${this.config.logDir}/health-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          maxSize: '5m',
          maxFiles: '7d',
        }),
      );
    }

    return WinstonLogger.createLogger({
      level: this.config.level,
      levels,
      format,
      transports,
    });
  }

  info(message: string, context?: LogContext): void {
    if (this.logger && this.logger.info) {
      this.logger.info(message, context);
    } else {
      console.log(formatLog('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.logger && this.logger.warn) {
      this.logger.warn(message, context);
    } else {
      console.warn(formatLog('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.logger && this.logger.error) {
      this.logger.error(message, context);
    } else {
      console.error(formatLog('error', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    if (this.logger && this.logger.debug) {
      this.logger.debug(message, context);
    } else {
      if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
        console.debug(formatLog('debug', message, context));
      }
    }
  }

  http(message: string, context?: LogContext): void {
    if (this.logger && this.logger.http) {
      this.logger.http(message, context);
    } else {
      console.log(formatLog('http', message, context));
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let defaultLogger: SimpleLogger | WinstonLoggerImpl | null = null;

/**
 * Creates a new logger instance with the specified configuration.
 *
 * @param config - Logger configuration options
 * @returns A logger instance
 *
 * @example
 * ```typescript
 * import { createLogger } from '@maia-opencode/logger';
 *
 * // Simple console logger (default)
 * const logger = createLogger();
 *
 * // Winston logger with file rotation
 * const winstonLogger = createLogger({ useWinston: true });
 *
 * // Custom log level
 * const debugLogger = createLogger({ level: 'debug' });
 * ```
 */
export function createLogger(config: LoggerConfig = {}): SimpleLogger | WinstonLoggerImpl {
  const useWinston = config.useWinston ?? process.env.USE_WINSTON === 'true';

  if (useWinston) {
    return new WinstonLoggerImpl(config);
  }

  return new SimpleLogger(config);
}

/**
 * Gets the default logger instance (singleton pattern).
 *
 * @returns The default logger instance
 *
 * @example
 * ```typescript
 * import { getLogger } from '@maia-opencode/logger';
 *
 * const logger = getLogger();
 * logger.info('Application started');
 * ```
 */
export function getLogger(): SimpleLogger | WinstonLoggerImpl {
  if (!defaultLogger) {
    defaultLogger = createLogger();
  }
  return defaultLogger;
}

// ============================================================================
// Convenience Functions (using default logger)
// ============================================================================

/**
 * Logs an informational message.
 *
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logInfo(message: string, context?: LogContext): void {
  getLogger().info(message, context);
}

/**
 * Logs a warning message.
 *
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logWarn(message: string, context?: LogContext): void {
  getLogger().warn(message, context);
}

/**
 * Logs an error message.
 *
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logError(message: string, context?: LogContext): void {
  getLogger().error(message, context);
}

/**
 * Logs a debug message (only in development or when DEBUG is set).
 *
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logDebug(message: string, context?: LogContext): void {
  getLogger().debug(message, context);
}

/**
 * Logs an HTTP message.
 *
 * @param message - The message to log
 * @param context - Optional context object
 */
export function logHttp(message: string, context?: LogContext): void {
  getLogger().http(message, context);
}

// ============================================================================
// Re-export types
// ============================================================================

export type { SimpleLogger, WinstonLoggerImpl as WinstonLogger };
