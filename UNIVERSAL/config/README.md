# @maia-opencode/config

Shared ESLint, Prettier, and TypeScript configurations for the MAIA OpenCode ecosystem.

## Installation

```bash
npm install --save-dev @maia-opencode/config
```

## Usage

### ESLint

Create or update your `.eslintrc.cjs`:

```javascript
module.exports = require('@maia-opencode/config/eslint.js');
```

### Prettier

Create or update your `.prettierrc`:

```bash
cp node_modules/@maia-opencode/config/.prettierrc .prettierrc
cp node_modules/@maia-opencode/config/.prettierignore .prettierignore
```

Or in `package.json`:

```json
{
  "prettier": "@maia-opencode/config/.prettierrc"
}
```

### TypeScript

Extend the base config in your `tsconfig.json`:

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

## Configuration Details

### ESLint

- TypeScript strict mode
- React 18 support
- React Hooks rules
- No `any` types allowed (error level)
- Console logging generates a warning (use the logger instead)
- Consistent type imports enforced

### Prettier

- 2 space indentation
- Single quotes
- Semicolons required
- Trailing commas
- 100 character line width
- LF line endings

### TypeScript

- Target: ES2020
- Strict mode enabled
- React JSX transform
- No unused locals/parameters
- No implicit returns
- Indexed access safety

## License

MIT
