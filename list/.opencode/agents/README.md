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

## 🤖 AGENTS - When to Use Which

### @MAIA (The Orchestrator)

**Use for**: Planning, breaking down tasks, figuring out approach
**When**: You have a vague idea or complex feature
**Command**: `npm run plan "build a dashboard"`

**@MAIA handles**:

- Breaking big tasks into small steps
- Deciding which agent does what
- Setting strategy and approach
- NOT writing code

---

### @Coder (The Architect)

**Use for**: Writing code, implementing features, fixing bugs
**When**: You know what needs to be built
**Commands**:

- `npm run plan "implement X"` → @MAIA will delegate to @Coder
- Tell me: "Add a login page"

**@Coder handles**:

- Writing React components
- Building services/API
- Implementing logic
- Creating tests
- Fixing bugs

---

### @Ops (Infrastructure)

**Use for**: Docker, deployment, CI/CD, servers
**When**: You need to deploy, set up infrastructure, or work with servers
**Commands**:

- `npm run ops "deploy to production"`
- `npm run ops "set up Docker"`
- Tell me: "Deploy this app"

**@Ops handles**:

- Docker setup
- Deployment to servers
- CI/CD pipelines
- Infrastructure automation
- Environment variables

---

### @Researcher (The Oracle)

**Use for**: Research, documentation, finding information, analyzing large codebases
**When**: You need to research something, understand a library, or find patterns
**Commands**:

- `npm run research "React best practices"`
- `npm run research "how to do X"`
- Tell me: "Research authentication patterns"

**@Researcher handles**:

- Reading documentation
- Finding patterns
- Summarizing information
- Analyzing code
- Finding best practices

---

### @Reviewer (Quality Gate)

**Use for**: Code review, quality checks, finding bugs
**When**: Before committing, after implementing something
**Commands**:

- `npm run audit`
- Tell me: "Review my code"

**@Reviewer handles**:

- Running linting
- Running type checking
- Finding bugs
- Security checks
- Performance issues
- Saying GO or NO-GO

---

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
