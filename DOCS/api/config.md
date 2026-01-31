# Config API Documentation

The `@maia-opencode/config` package provides shared ESLint, Prettier, and TypeScript configurations for the MAIA OpenCode ecosystem.

## Table of Contents

- [Installation](#installation)
- [ESLint Configuration](#eslint-configuration)
- [Prettier Configuration](#prettier-configuration)
- [TypeScript Configuration](#typescript-configuration)
- [Usage Examples](#usage-examples)

---

## Installation

```bash
npm install --save-dev @maia-opencode/config

# Install peer dependencies
npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-react-refresh \
  prettier \
  typescript
```

---

## ESLint Configuration

### Basic Setup

Create or update `.eslintrc.cjs`:

```javascript
module.exports = require('@maia-opencode/config/eslint.js');
```

### Extending the Configuration

```javascript
const baseConfig = require('@maia-opencode/config/eslint.js');

module.exports = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    // Add your custom rules
    'no-console': 'error', // Stricter than default 'warn'
  },
};
```

### ESLint Rules

| Rule | Level | Description |
|------|-------|-------------|
| `no-console` | `warn` | Encourage using logger instead |
| `@typescript-eslint/no-explicit-any` | `error` | No `any` types allowed |
| `@typescript-eslint/no-unused-vars` | `warn` | Warn on unused variables |
| `react/prop-types` | `off` | Not needed with TypeScript |
| `react/react-in-jsx-scope` | `off` | Not needed in React 17+ |

### Overrides

The config includes overrides for:

- **Node.js files** (`.eslintrc.cjs`, config files)
- **Test files** (`.test.ts`, `.spec.ts`)

---

## Prettier Configuration

### Basic Setup

Create `.prettierrc`:

```bash
cp node_modules/@maia-opencode/config/.prettierrc .prettierrc
```

Or in `package.json`:

```json
{
  "prettier": "@maia-opencode/config/.prettierrc"
}
```

### Prettier Options

| Option | Value | Description |
|--------|-------|-------------|
| `semi` | `true` | Use semicolons |
| `singleQuote` | `true` | Use single quotes |
| `trailingComma` | `"all"` | Trailing commas everywhere |
| `printWidth` | `100` | Max line width |
| `tabWidth` | `2` | Indentation width |
| `arrowParens` | `"always"` | Parentheses around arrow params |
| `endOfLine` | `"lf"` | Unix line endings |

### Prettier Ignore

Copy `.prettierignore`:

```bash
cp node_modules/@maia-opencode/config/.prettierignore .prettierignore
```

---

## TypeScript Configuration

### Basic Setup

Create `tsconfig.json`:

```json
{
  "extends": "@maia-opencode/config/tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### TypeScript Options

| Option | Value | Description |
|--------|-------|-------------|
| `strict` | `true` | Enable all strict options |
| `noUncheckedIndexedAccess` | `true` | Safe array/object access |
| `noUnusedLocals` | `true` | Error on unused locals |
| `noUnusedParameters` | `true` | Error on unused params |
| `noImplicitReturns` | `true` | Error on implicit returns |
| `target` | `ES2020` | JavaScript target |
| `module` | `ESNext` | Module system |

---

## Usage Examples

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,css}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,css}\"",
    "typecheck": "tsc --noEmit"
  }
}
```

### VSCode Settings

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### Combined Workflow

```bash
# Format code
npm run format

# Lint and fix
npm run lint:fix

# Type check
npm run typecheck

# Run all quality checks
npm run format && npm run lint:fix && npm run typecheck
```

---

## Integrating with Pre-commit Hooks

Using lint-staged:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```
