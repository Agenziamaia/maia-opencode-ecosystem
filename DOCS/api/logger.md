# Logger API Documentation

The `@maia-opencode/logger` package provides a unified logging system for the MAIA OpenCode ecosystem.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Type Definitions](#type-definitions)
- [Configuration](#configuration)
- [Examples](#examples)

---

## Installation

```bash
# Simple console logger (no dependencies)
npm install @maia-opencode/logger

# For Winston file logging (optional)
npm install winston winston-daily-rotate-file
```

---

## Quick Start

### Basic Usage

```typescript
import { logInfo, logWarn, logError, logDebug } from '@maia-opencode/logger';

logInfo('Application started');
logWarn('Configuration file not found, using defaults');
logError('Database connection failed', { host: 'localhost', port: 5432 });
logDebug('Debugging info', { user: 'test' });
```

### Advanced Usage

```typescript
import { createLogger } from '@maia-opencode/logger';

const logger = createLogger({
  useWinston: true,
  enableFile: true,
  level: 'debug',
  logDir: './logs',
});

logger.info('Server started', { port: 3000 });
logger.error('Error occurred', { code: 500, details: '...' });
```

---

## API Reference

### Functions

#### `createLogger(config?)`

Creates a new logger instance with the specified configuration.

**Signature:**
```typescript
function createLogger(config?: LoggerConfig): SimpleLogger | WinstonLoggerImpl
```

**Parameters:**
- `config` - Optional logger configuration object

**Returns:** A logger instance (SimpleLogger or WinstonLoggerImpl)

**Example:**
```typescript
const logger = createLogger({
  level: 'debug',
  useWinston: true,
  enableFile: true,
});
```

---

#### `getLogger()`

Gets the default singleton logger instance.

**Signature:**
```typescript
function getLogger(): SimpleLogger | WinstonLoggerImpl
```

**Returns:** The default logger instance

**Example:**
```typescript
const logger = getLogger();
logger.info('Using default logger');
```

---

#### `logInfo(message, context?)`

Logs an informational message.

**Signature:**
```typescript
function logInfo(message: string, context?: LogContext): void
```

**Parameters:**
- `message` - The message to log
- `context` - Optional context object

**Example:**
```typescript
logInfo('User logged in', { userId: 123, ip: '192.168.1.1' });
```

---

#### `logWarn(message, context?)`

Logs a warning message.

**Signature:**
```typescript
function logWarn(message: string, context?: LogContext): void
```

**Parameters:**
- `message` - The message to log
- `context` - Optional context object

**Example:**
```typescript
logWarn('Deprecated API usage', { endpoint: '/v1/users' });
```

---

#### `logError(message, context?)`

Logs an error message.

**Signature:**
```typescript
function logError(message: string, context?: LogContext): void
```

**Parameters:**
- `message` - The message to log
- `context` - Optional context object

**Example:**
```typescript
logError('Database connection failed', {
  host: 'localhost',
  port: 5432,
  error: 'Connection refused'
});
```

---

#### `logDebug(message, context?)`

Logs a debug message (only in development or when DEBUG is set).

**Signature:**
```typescript
function logDebug(message: string, context?: LogContext): void
```

**Parameters:**
- `message` - The message to log
- `context` - Optional context object

**Example:**
```typescript
logDebug('Function execution time', { function: 'processData', time: '245ms' });
```

---

#### `logHttp(message, context?)`

Logs an HTTP message.

**Signature:**
```typescript
function logHttp(message: string, context?: LogContext): void
```

**Parameters:**
- `message` - The message to log
- `context` - Optional context object

**Example:**
```typescript
logHttp('Incoming request', { method: 'GET', path: '/api/users', status: 200 });
```

---

## Type Definitions

### `LogLevel`

Log level enumeration.

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'http';
```

### `LogContext`

Context object for log entries.

```typescript
interface LogContext {
  [key: string]: unknown;
}
```

### `LoggerConfig`

Logger configuration options.

```typescript
interface LoggerConfig {
  level?: LogLevel;           // Minimum log level (default: 'info')
  useWinston?: boolean;       // Enable Winston (default: false)
  logDir?: string;            // Log directory (default: './logs')
  enableConsole?: boolean;    // Enable console output (default: true)
  enableFile?: boolean;       // Enable file output (default: true)
  maxFiles?: string;          // Max file retention (default: '14d')
  maxSize?: string;           // Max file size (default: '20m')
}
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Minimum log level | `info` |
| `LOG_DIR` | Directory for log files | `./logs` |
| `USE_WINSTON` | Enable Winston file logging | `false` |
| `DEBUG` | Enable debug logging | `false` |
| `NODE_ENV` | Environment (development/production) | - |

### Log Levels (Priority)

1. `debug` (0) - Verbose debugging information
2. `http` (1) - HTTP request/response logging
3. `info` (2) - General informational messages
4. `warn` (3) - Warning messages
5. `error` (4) - Error messages

---

## Examples

### In a Node.js Application

```typescript
import { getLogger } from '@maia-opencode/logger';

const logger = getLogger();

logger.info('Server starting', { port: 3000 });

// With error handling
try {
  await connectDatabase();
} catch (error) {
  logger.error('Database connection failed', { error: error.message });
}
```

### In an Agent or Service

```typescript
import { createLogger } from '@maia-opencode/logger';

const logger = createLogger({ level: 'debug' });

export class MyAgent {
  async execute() {
    logger.debug('Starting execution');
    // ... do work
    logger.info('Execution completed');
  }
}
```

### Conditional Logging

```typescript
import { logDebug } from '@maia-opencode/logger';

// Only logs in development or when DEBUG=true
logDebug('Expensive operation result', {
  result: computeExpensiveOperation()
});
```

---

## File Logging (Winston)

When Winston is enabled, logs are written to separate files:

- `logs/app-YYYY-MM-DD.log` - All logs
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/health-YYYY-MM-DD.log` - Health check logs

Files rotate daily and are automatically cleaned up based on retention settings.
