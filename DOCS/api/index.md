# MAIA OpenCode API Documentation

Welcome to the MAIA OpenCode ecosystem API documentation. This section provides detailed API references for all UNIVERSAL packages.

## UNIVERSAL Packages

### [@maia-opencode/logger](./logger.md)
Unified logging system supporting both simple console and Winston-based logging.

**Key Features:**
- Simple console logging (zero dependencies)
- Winston file logging (optional)
- Environment-based configuration
- TypeScript types included

**Quick Import:**
```typescript
import { logInfo, logError, createLogger } from '@maia-opencode/logger';
```

---

### [@maia-opencode/config](./config.md)
Shared ESLint, Prettier, and TypeScript configurations.

**Key Features:**
- Consistent code style across ecosystem
- Pre-configured ESLint rules
- Prettier formatting
- TypeScript strict mode

**Quick Import:**
```javascript
module.exports = require('@maia-opencode/config/eslint.js');
```

---

## Ecosystem APIs

### Agent System
Documentation for working with MAIA agents, handoffs, and collaboration.

### VibeKanban Integration
API reference for task management and project tracking.

### MCP Server Protocol
Model Context Protocol server documentation.

---

## Type Definitions

Common type definitions used across the ecosystem.

```typescript
// Log context
interface LogContext {
  [key: string]: unknown;
}

// Log levels
type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'http';

// Logger configuration
interface LoggerConfig {
  level?: LogLevel;
  useWinston?: boolean;
  logDir?: string;
  // ... more options
}
```

---

## Environment Variables

Common environment variables used across the ecosystem.

| Variable | Purpose | Default |
|----------|---------|---------|
| `LOG_LEVEL` | Logging level | `info` |
| `USE_WINSTON` | Enable Winston | `false` |
| `NODE_ENV` | Environment | - |
| `VIBE_KANBAN_URL` | Task manager | `http://localhost:62601` |

See `.env.example` for complete list.

---

## Contributing

When adding new APIs or modifying existing ones:

1. Update this documentation
2. Add TypeScript type definitions
3. Include usage examples
4. Run `npm run typecheck` to verify

---

## Support

For questions or issues:
- Check the main [README](../../README.md)
- Review [UNIVERSAL packages](../../UNIVERSAL/)
- Run `/init` to verify environment
