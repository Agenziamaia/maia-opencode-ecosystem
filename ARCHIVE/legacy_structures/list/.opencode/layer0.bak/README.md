# MAIA Base Layer (maia-layer0)

**Location**: `.opencode/maia-layer0/`  
**Purpose**: Complete project template - duplicate to start new projects instantly

---

## How to Use

### Start New Project (10 seconds)

```bash
# Go somewhere
mkdir my-project && cd my-project

# Copy maia-layer0
cp -r "/Users/g/Desktop/MAIA opencode/.opencode/maia-layer0"/* .

# Initialize (auto-installs deps)
bash .opencode/scripts/init.sh

# Done! Start coding
npm run dev
```

---

## What's Included

✅ React 18 + Vite + TypeScript (Strict)  
✅ Complete src/ structure:
  - components/ (with examples)
  - services/ (with API templates)
  - utils/ (with helper functions)
  - types/ (with type definitions)
  - features/ (with feature patterns)
  - test/ (setup files)

✅ Entry files:
  - index.html
  - src/main.tsx
  - src/App.tsx
  - src/App.css

✅ All configs:
  - package.json (all scripts ready)
  - tsconfig.json (strict mode)
  - vite.config.ts
  - vitest.config.ts
  - .eslintrc.cjs
  - .prettierrc
  - .gitignore

✅ Testing ready:
  - Vitest + React Testing Library
  - 17 example tests passing
  - Coverage setup

✅ MAIA Agents:
  - 5 specialized AI agents configured
  - Loadable skills system
  - Auto-handoff tracking

---

## Update This Layer

When you improve this project:

```bash
# Copy current state back to layer0
rm -rf .opencode/maia-layer0/*
cp -r src/ package.json tsconfig.json vite.config.ts vitest.config.ts .eslintrc.cjs .prettierrc .gitignore .opencode/maia-layer0/

# Save it
npm run layer save maia-layer0
```

---

## Why This Exists

**Old way**: npm install + setup = 10-15 minutes per project  
**New way**: Copy layer0 = 10 seconds ready

**Annual savings** (100 projects): ~25 hours of setup time

---

## Structure

```
.opencode/maia-layer0/
├── src/
│   ├── components/
│   ├── services/
│   ├── utils/
│   ├── types/
│   ├── features/
│   ├── test/
│   ├── main.tsx
│   ├── App.tsx
│   └── App.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
└── layer.json
```

---

**Copy this folder. Start building. Zero setup.**
