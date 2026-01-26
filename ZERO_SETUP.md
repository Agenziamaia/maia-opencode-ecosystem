# 🚀 MAIA - ZERO SETUP

**New project in 10 seconds. No npm install hell.**

---

## How It Works

```
┌─────────────────┐
│  GitHub Template│
│   (optional)   │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│   Layer0       │  ← Complete project template
│  (copy once)   │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│  New Project 1 │  ← Copy layer0 (1 second)
│  New Project 2 │  ← Copy layer0 (1 second)
│  New Project 3 │  ← Copy layer0 (1 second)
└─────────────────┘
```

## Quick Start (New Project)

```bash
# 1. Create folder
mkdir my-app && cd my-app

# 2. Copy MAIA layer0 (one command)
cp -r /path/to/maia/.opencode/layer0/* .

# 3. Initialize (auto installs deps)
.bash/opencode/scripts/init.sh

# 4. Start coding
npm run dev
```

**Total time**: ~30 seconds (vs 10 minutes per project)

---

## Layer Commands

```bash
# See all available layers
npm run layer list

# Save your current setup as a reusable layer
npm run layer save my-auth-layer

# Apply a layer to current project
npm run layer apply my-auth-layer

# Connect to GitHub for team sharing
npm run layer github
```

---

## Build Your Own Layers

**Example**: Build once, reuse forever

```bash
# Step 1: Build a feature
# (Add auth components, services, etc.)

# Step 2: Save as layer
npm run layer save user-authentication

# Step 3: Use in ANY future project
npm run layer apply user-authentication

# Done! No rebuilding, no copy-pasting
```

---

## GitHub Sync (Optional)

**Setup once, reuse everywhere:**

1. Create GitHub repo from this project
2. Mark as "Template Repository"
3. Use GitHub's template feature:
   ```
   https://github.com/yourname/maia-template/generate
   ```

Now you can:

- Generate new projects instantly from GitHub
- Share layers with your team
- Sync updates across all projects

---

## Directory Structure

```
.opencode/
├── layer0/              # ✨ Complete template (copy this)
│   ├── src/             # React code
│   ├── package.json      # Dependencies
│   ├── tsconfig.json    # TypeScript config
│   └── ...all configs
│
├── layers/              # 📦 Your custom layers
│   ├── auth/           # Login/signup
│   ├── dashboard/      # UI layout
│   └── api/           # Services
│
└── scripts/
    ├── init.sh         # ⚡ Zero-setup init
    └── layer.sh        # 📦 Layer management
```

---

## Why This Is Better

**Old Way**:

- Create new project
- npm install (2-3 min)
- Copy configs
- Setup testing
- Setup linting
- Setup agents
- = 10-15 minutes

**New Way**:

- Copy layer0
- Run init
- = 10 seconds

**Saved per project**: 14.8 minutes  
**Annual savings** (100 projects): 24 hours

---

## What's In Layer0

✅ React 18 + Vite + TypeScript  
✅ Testing (Vitest + React Testing Library)  
✅ ESLint + Prettier  
✅ MAIA AI Agents (5 specialized agents)  
✅ Loadable Skills  
✅ Auto-tracking system  
✅ CI/CD ready  
✅ Docker ready

Everything you need. Ready to use.

---

## Next Steps

### Option A: Quick Start (Recommended)

```bash
# Copy layer0 and go
cp -r .opencode/layer0/* ../my-new-project
cd ../my-new-project
npm run dev
```

### Option B: GitHub Template (Team sync)

```bash
npm run layer github  # Get instructions
```

### Option C: Build Custom Layers

```bash
# Build something cool
npm run layer save my-cool-feature

# Reuse it everywhere
npm run layer apply my-cool-feature
```

---

**Start building in 10 seconds.**

_MAIA: Zero Setup, Infinite Possibilities._
