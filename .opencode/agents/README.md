# AGENTS.md - Your Command Guide

**Rule**: Read this. Use it. Don't ask users to do terminal work.

---

## 🎯 QUICK START (What to Do Now)

### If This is a New Session

```bash
npm run dev
```

That's it. Dev server starts.

### If Starting a New Project

```bash
# Copy maia-layer0 (your base template)
cp -r ".opencode/maia-layer0"/* .

# Initialize (auto-installs everything)
bash .opencode/scripts/init.sh

# Start
npm run dev
```

### If You Want to Build Something

Just tell me. I handle the rest.

---

## 🤖 GOD-TIER AGENT ROSTER

### 🧠 Orchestrators (The Brain)
| Agent | Role | Model | When to Use |
| :--- | :--- | :--- | :--- |
| **@maia** | **Planner** | GLM-4.7 | Default planner. Breaks down features. |
| **@maia_premium** | **Strategist** | GPT-5.2 | "Impossible" problems requiring deep reasoning. |
| **@giuzu** | **Director** | GPT-5.2 | Digital clone. Consult when you need "The Vision". |

### 🛠️ Builders (The Hands)
| Agent | Role | Model | When to Use |
| :--- | :--- | :--- | :--- |
| **@coder** | **Architect** | GLM-4.7 | Writing code, implementing features. |
| **@ops** | **Infra God** | GLM-4.7 | Docker, Coolify, Deployment. |
| **@workflow** | **Automator** | Qwen 2.5 | Building n8n/Flowise/Trigger.dev workflows. |
| **@starter** | **Wizard** | Gemini Flash | Onboarding new workspaces. |

### 🛡️ Quality & Intel (The Eyes)
| Agent | Role | Model | When to Use |
| :--- | :--- | :--- | :--- |
| **@reviewer** | **Gatekeeper** | Hermes 3 405B | **NO MERCY** code audits. |
| **@researcher** | **Oracle** | Gemini Pro | Deep research & documentation reading. |
| **@opencode** | **Meta** | GLM-4.7 | Configuring the agent system itself. |

## 🚀 COMMANDS - What They Do

```bash
npm run dev              # Start development server (running now at http://localhost:5173)
npm run build            # Build for production
npm run test             # Run tests (17 tests passing)
npm run check            # Run lint + typecheck
npm run plan "task"      # Plan with @MAIA
npm run ops "task"       # Infrastructure with @Ops
npm run research "topic"  # Research with @Researcher
npm run audit            # Quality check with @Reviewer
npm run layer list        # See all layers
npm run layer save X     # Save current setup as layer X
npm run layer apply X     # Use layer X
```

---

## 📋 PROJECT LAYERS - Reusable Starting Points

**maia-layer0** = Base template (`.opencode/maia-layer0/`)

- React + Vite + TypeScript
- All configs ready
- Tests passing
- Use this to start new projects

**Using Layers**:

```bash
# Save your current setup as a layer
npm run layer save authentication

# Use that layer later
npm run layer apply authentication

# See all layers
npm run layer list
```

---

## 🎓 WORKFLOW - How to Work With Me

### Building a Feature

1. Tell me what you want: "Build a login page"
2. I delegate to @MAIA → @Coder → implement
3. I delegate to @Reviewer → verify
4. Done. You review.

### Starting a New Project

1. Copy maia-layer0: `cp -r ".opencode/maia-layer0"/* .`
2. Initialize: `bash .opencode/scripts/init.sh`
3. Start: `npm run dev`

### Fixing a Bug

1. Tell me: "Fix the counter bug"
2. @Coder fixes it
3. @Reviewer verifies
4. Done.

### Deploying

1. Tell me: "Deploy to production"
2. @Ops handles it
3. Done.

---

## 🔧 FILES - What's Where

```
.opencode/                    # All agent configs
├── agents/
│   ├── maia.md            # @MAIA (orchestrator)
│   ├── coder.md            # @Coder (writes code)
│   ├── ops.md              # @Ops (infrastructure)
│   ├── researcher.md        # @Researcher (research)
│   └── reviewer.md         # @Reviewer (quality)
├── maia-layer0/            # BASE TEMPLATE (copy this)
│   ├── src/               # React code
│   ├── package.json        # Dependencies
│   └── [all configs]      # Ready to use
├── layers/                  # Your custom layers
└── scripts/
    ├── init.sh             # Zero-setup init
    └── layer.sh            # Layer management

src/                          # Your current project code
components/                    # React components
services/                      # API services
utils/                         # Helper functions
types/                         # TypeScript types
features/                      # Feature modules
```

---

## 🎯 COMMON TASKS - Which Agent Handles What

| Task                      | Agent       | Command                      |
| ------------------------- | ----------- | ---------------------------- |
| "Build a login page"      | @Coder      | `npm run plan "build login"` |
| "Deploy to production"    | @Ops        | `npm run ops "deploy"`       |
| "Research best practices" | @Researcher | `npm run research "topic"`   |
| "Review my code"          | @Reviewer   | `npm run audit`              |
| "Plan new feature"        | @MAIA       | `npm run plan "feature"`     |
| "Fix this bug"            | @Coder      | Tell me what's broken        |

---

## ⚡ WHAT I DO AUTOMATICALLY

**Without asking you**:

- Run `npm install` when needed
- Start dev server when you say "start dev"
- Run tests before reporting success
- Fix bugs when you report them
- Deploy when you ask
- Update files when you improve them
- Copy files to maia-layer0 when you make improvements

**You just tell me what you want. I handle it.**

---

## 🎓 LEARNING PATH

### 1. Understand the Agents

Read above. Know who does what.

### 2. Use the Right Agent

- Planning? @MAIA
- Coding? @Coder
- Infrastructure? @Ops
- Research? @Researcher
- Quality? @Reviewer

### 3. Trust the System

I handle terminal, deps, builds, tests. You just describe what you want.

---

## 🚀 NOW WHAT?

**Current Status**:

- Dev server: Running at http://localhost:5173
- Tests: 17/17 passing
- Build: Working
- Base layer: Ready in `.opencode/maia-layer0/`

**Tell me what to build:**

- "Add a login page"
- "Create a dashboard"
- "Build a user settings form"
- "Fix the counter"
- "Deploy this app"

**I handle everything.**

### DOCUMENTATION PROTOCOL
When reporting status/fixes:
- **UPDATE** STATUS.md (never create new reports)
- **APPEND** to CHANGELOG.md for versions
- **NEVER** create *_REPORT.md, *_SUMMARY.md, *_FIX.md files
- See .opencode/DOCUMENTATION_STANDARDS.md for full rules

