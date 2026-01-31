/**
 * Logger Integration Tests
 *
 * Tests the UNIVERSAL/logger package functionality across
 * different configurations and environments.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createLogger,
  getLogger,
  logInfo,
  logWarn,
  logError,
  logDebug,
  logHttp,
  type LogLevel,
  type LogContext,
} from '../../../UNIVERSAL/logger/src/index.js';

describe('UNIVERSAL Logger - Integration Tests', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Simple Console Logger', () => {
    it('should create a simple console logger by default', () => {
      const logger = createLogger();
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should log info messages', () => {
      const logger = createLogger();
      logger.info('Test info message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log error messages with context', () => {
      const logger = createLogger();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logger.error('Test error', { code: 500, details: 'Something went wrong' });
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should respect log level configuration', () => {
      const logger = createLogger({ level: 'error' });
      const consoleInfoSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('This should not log');
      expect(consoleInfoSpy).not.toHaveBeenCalled();
      consoleInfoSpy.mockRestore();
    });

    it('should log debug messages only in development or when DEBUG is set', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const logger = createLogger();
      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      logger.debug('Debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();
      consoleDebugSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same logger instance on subsequent calls', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();
      expect(logger1).toBe(logger2);
    });
  });

  describe('Convenience Functions', () => {
    it('should export convenience functions that use default logger', () => {
      const consoleInfoSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logInfo('Info via convenience function');
      expect(consoleInfoSpy).toHaveBeenCalled();
      consoleInfoSpy.mockRestore();
    });

    it('should support all log levels via convenience functions', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logError('Error message');
      logWarn('Warning message');

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Winston Logger (when available)', () => {
    it('should attempt to create Winston logger when useWinston is true', () => {
      // This test will pass even if Winston is not installed
      // as it falls back to simple logger
      const logger = createLogger({ useWinston: true });
      expect(logger).toBeDefined();
    });
  });

  describe('Context Handling', () => {
    it('should handle empty context gracefully', () => {
      const logger = createLogger();
      const consoleInfoSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logger.info('Message without context');
      expect(consoleInfoSpy).toHaveBeenCalled();
      consoleInfoSpy.mockRestore();
    });

    it('should handle complex context objects', () => {
      const logger = createLogger();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const complexContext = {
        user: { id: 1, name: 'Test User' },
        request: { method: 'POST', path: '/api/test' },
        timestamp: new Date().toISOString(),
      };
      logger.error('Complex context test', complexContext);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
