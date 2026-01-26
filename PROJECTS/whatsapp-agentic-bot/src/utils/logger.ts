// OPS: Logger Utility - Structured logging with Winston
// Role: Centralized logging with rotation and health checks

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = process.env.LOG_DIR || './logs';

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Console format (pretty print)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`,
  ),
);

// Create logger instance
export function initLogger() {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports: [
      // Error log file
      new DailyRotateFile({
        filename: `${logDir}/error-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
      }),

      // Combined log file
      new DailyRotateFile({
        filename: `${logDir}/app-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      }),

      // Health log file (separate)
      new DailyRotateFile({
        filename: `${logDir}/health-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        maxSize: '5m',
        maxFiles: '7d',
      }),
    ],
  });

  // Console transport for development
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: consoleFormat,
      }),
    );
  }

  return logger;
}

// Health logger (separate instance for health checks)
export function initHealthLogger() {
  return winston.createLogger({
    level: 'info',
    format,
    transports: [
      new DailyRotateFile({
        filename: `${logDir}/health-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '5m',
        maxFiles: '7d',
      }),
    ],
  });
}

export type Logger = winston.Logger;
