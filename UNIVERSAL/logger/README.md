# @maia-opencode/logger

Universal logging system for the MAIA OpenCode ecosystem.

## Features

- **Consistent API** - Same logging interface across all ecosystem packages
- **Dual Mode** - Simple console logging (lightweight) or Winston-based (production)
- **Environment-based** - Configure via environment variables
- **TypeScript First** - Full type definitions included
- **Zero Dependencies** - Core logger has no dependencies (Winston is optional)

## Installation

```bash
# Simple console logger (no dependencies)
npm install @maia-opencode/logger

# For Winston file logging (optional peer dependencies)
npm install winston winston-daily-rotate-file
```

## Usage

### Basic Usage (Simple Console Logger)

```typescript
import { logInfo, logWarn, logError, logDebug } from '@maia-opencode/logger';

logInfo('Application started');
logWarn('Configuration file not found, using defaults');
logError('Database connection failed', { host: 'localhost', port: 5432 });
logDebug('Debugging info', { user: 'test' });
```

### Advanced Usage (Winston with File Logging)

```typescript
import { createLogger } from '@maia-opencode/logger';

const logger = createLogger({
  useWinston: true,
  enableFile: true,
  level: 'debug',
  logDir: './logs',
});

logger.info('Application started');
logger.error('Error occurred', { code: 500 });
```

### Configuration Options

```typescript
interface LoggerConfig {
  level?: 'info' | 'warn' | 'error' | 'debug' | 'http';
  useWinston?: boolean;
  logDir?: string;
  enableConsole?: boolean;
  enableFile?: boolean;
  maxFiles?: string;  // e.g., '14d' for 14 days
  maxSize?: string;   // e.g., '20m' for 20 megabytes
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Minimum log level to output | `info` |
| `LOG_DIR` | Directory for log files | `./logs` |
| `USE_WINSTON` | Enable Winston file logging | `false` |
| `DEBUG` | Enable debug logging | `false` |
| `NODE_ENV` | Environment (development/production) | - |

## API Reference

### Functions

- `createLogger(config?)` - Create a new logger instance
- `getLogger()` - Get the default singleton logger
- `logInfo(message, context?)` - Log info message
- `logWarn(message, context?)` - Log warning message
- `logError(message, context?)` - Log error message
- `logDebug(message, context?)` - Log debug message
- `logHttp(message, context?)` - Log HTTP message

### Types

- `LogLevel` - Union type of log levels
- `LogContext` - Interface for context objects
- `LoggerConfig` - Interface for logger configuration

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
  logger.error('Database connection failed', { error });
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

## File Logging (Winston)

When Winston is enabled, logs are written to separate files:

- `logs/app-YYYY-MM-DD.log` - All logs
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs-health-YYYY-MM-DD.log` - Health check logs

Files rotate daily and are automatically cleaned up based on `maxFiles` setting.

## License

MIT
