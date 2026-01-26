# Core Layer 0 Implementation

**Generated:** 2026-01-24

---

## OVERVIEW

React + TypeScript with Vite/Vitest.

---

## STRUCTURE

```
.opencode/maia-layer0/
├── components/        # UI (index.ts exports)
├── features/          # Features (component + hooks)
├── services/          # Data/API (no UI)
├── utils/             # Utilities
├── types/             # Types
├── test/              # Vitest setup
├── App.tsx           # Main app
└── main.tsx          # Vite entry
```

---

## WHERE TO LOOK

| Task       | Location                                 |
| ---------- | ---------------------------------------- |
| Components | components/ (index.ts exports)           |
| Features   | features/ (component + hooks + index.ts) |
| Services   | services/ (data/API only)                |
| Types      | types/index.ts                           |

---

## CONVENTIONS

**Features**: Self-contained (component, hooks, index.ts)

**Exports**: All dirs have `index.ts`

**Testing**: Vitest + Testing Library

---

## ANTI-PATTERNS

❌ **Feature Coupling**: No feature dependencies
❌ **Service Components**: Data/API only, no UI
❌ **Missing Exports**: Every dir needs `index.ts`
❌ **Mixed Concerns**: Components use services

---

## COMMANDS

```bash
npm run dev              # Vite dev
npm run build            # tsc + vite
npm run test             # Vitest
npm run test:watch       # TDD
npm run lint            # ESLint
npm run typecheck       # tsc --noEmit
npm run check           # lint + typecheck
```

---

## NOTES

- **Entry**: `main.tsx` → `App.tsx`
- **HMR**: Vite hot reload
- **TypeScript**: `strict: true`
- **Components**: Functional with hooks

---

_See parent `AGENTS.md`._
