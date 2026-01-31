# Development Guide

This guide covers development workflows and best practices for the MAIA OpenCode ecosystem.

---

## Table of Contents

- [Development Environment](#development-environment)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Debugging](#debugging)
- [Git Workflow](#git-workflow)
- [Release Process](#release-process)

---

## Development Environment

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd MAIA\ opencode

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Verify setup
npm run typecheck
npm run lint
```

### IDE Configuration

#### VSCode

Install these extensions:
- ESLint
- Prettier
- TypeScript

Configure workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting without modifying
npm run format:check
```

### Type Checking

```bash
# Run TypeScript compiler
npm run typecheck
```

### Pre-commit Hooks

The project uses Husky for Git hooks:

- **pre-commit**: Runs lint-staged (ESLint + Prettier)
- **pre-push**: Runs integration tests and type check
- **commit-msg**: Validates commit message format

#### Bypassing Hooks (Not Recommended)

```bash
git commit --no-verify -m "message"
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Integration Tests

```bash
cd ecosystem/tests

# Run integration tests
npm run test:run

# Run with coverage
npm run test:coverage
```

### Test Structure

```
ecosystem/tests/integration/
├── logger.test.ts      # Logger integration tests
├── config.test.ts      # Config validation tests
├── workflow.test.ts    # Agent workflow tests
└── vibekanban.test.ts  # VibeKanban integration tests
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe('expected');
  });
});
```

---

## Debugging

### Using VSCode Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current File",
      "program": "${file}",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Debugging Tests

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/vitest --run
```

### Logging

Use the UNIVERSAL logger:

```typescript
import { createLogger } from './logger';

const logger = createLogger({ level: 'debug' });
logger.debug('Debug info', { someData: 'value' });
```

---

## Git Workflow

### Branch Strategy

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `docs/*` - Documentation updates

### Commit Message Format

Follow conventional commits:

```
type(scope): description

# Types: feat, fix, docs, style, refactoring, test, chore
# Example: feat(logger): add Winston file rotation support
```

### Including Agent Attribution

```
feat(agent): add new planning agent

- Implements strategic planning capabilities
- @maia-session-001
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Request review
6. Address feedback
7. Merge to `develop`

---

## Release Process

### Versioning

The project uses semantic versioning: `MAJOR.MINOR.PATCH`

### Making a Release

```bash
# 1. Update version in package.json
npm version [major|minor|patch]

# 2. Generate changelog
npm run changelog

# 3. Commit changes
git add .
git commit -m "chore: release X.Y.Z"

# 4. Create git tag
git tag -a vX.Y.Z -m "Release X.Y.Z"

# 5. Push to remote
git push origin main --tags
```

---

## Performance Tips

### Development

- Use `npm run dev` for hot-reload
- Run tests in parallel with `npm run test:coverage`
- Use `--watch` flags for continuous testing

### Production

- Enable Winston file logging (`USE_WINSTON=true`)
- Set `NODE_ENV=production`
- Use `npm run build` for optimized builds

---

## Troubleshooting

### Common Issues

**TypeScript errors after pulling changes**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Tests failing locally but passing in CI**
```bash
# Clear test cache
npm run test:clear
# Run tests again
npm run test
```

**Husky hooks not running**
```bash
# Reinstall husky
npm run prepare
```

---

## Additional Resources

- [API Documentation](./api/)
- [Agent System](../.opencode/context/droid-registry.md)
- [Main README](../README.md)
