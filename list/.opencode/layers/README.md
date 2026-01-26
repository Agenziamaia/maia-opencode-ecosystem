# MAIA Layer System

## Concept

**Layer0** = Complete project template (instant copy)  
**Layers** = Custom starting points (auth, dashboard, etc.)  
**Zero Setup** = Copy layer + done

## Commands

```bash
# List all available layers
npm run layer list

# Start new project from layer0 (INSTANT)
npm run layer init my-new-project

# Save current state as a reusable layer
npm run layer save my-feature-layer

# Apply an existing layer
npm run layer apply react-auth-layer

# Connect to GitHub template
npm run layer github
```

## Layer Structure

```
.opencode/
├── layer0/              # Default MAIA template (complete project)
├── layers/              # Custom layers
│   ├── react-auth/      # Authentication layer
│   ├── dashboard/       # Dashboard layer
│   └── api-client/     # API layer
└── current-layer.json    # Tracks active layer
```

## Usage Examples

### 1. Start New Project (Zero Setup)

```bash
# In new folder
mkdir my-app && cd my-app

# Copy MAIA layer0
cp -r /path/to/maia/.opencode/layer0/* .

# Initialize (one command)
.bash/opencode/scripts/init.sh

# Done! Start coding
npm run dev
```

### 2. Create Reusable Feature Layer

```bash
# Build your feature
# (add components, services, etc.)

# Save it as a layer
npm run layer save user-authentication

# Now you can reuse this instantly in any project
npm run layer apply user-authentication
```

### 3. GitHub Template (Multi-Project Sync)

```bash
# Setup GitHub template
npm run layer github

# Now use GitHub's template feature for new projects
https://github.com/username/maia-template/generate

# Or pull latest from GitHub
npm run layer pull https://github.com/username/maia-template
```

## Why This Matters

**Before**:

- npm install every project
- Manual setup
- Copy-paste boilerplate
- No reuse

**After**:

- Copy layer (instant)
- One command init
- Reusable feature layers
- GitHub sync

**Time saved**: 10-30 minutes per project → 10 seconds

## MAIA Orchestrator Layers

### Layer0 (Default)

- React + Vite + TypeScript
- Testing infrastructure
- Agent tracking
- All configs

### Future Layers (Build These)

```
.opencode/layers/
├── authentication/      # Login, signup, JWT handling
├── dashboard/         # Layout, sidebar, routing
├── api-integration/   # Services, error handling
├── state-management/   # Zustand/Context setup
└── ui-components/     # Component library
```

## Connect to GitHub

1. Create GitHub repo from this project
2. Mark as "Template Repository"
3. Update `.opencode/current-layer.json`:

```json
{
  "name": "maia-template",
  "github": "https://github.com/yourname/maia-template"
}
```

Now you can:

- Generate new projects from GitHub
- Sync layers across teams
- Share custom layers

## Next Steps

1. **Save your current setup as layer0** (already done!)
2. **Build features**, save as layers
3. **Connect to GitHub** for multi-project sync
4. **Start new projects in 10 seconds**
