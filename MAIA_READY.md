# MAIA - READY TO USE

**Status**: Everything working ✅

---

## 📋 YOU HAVE NOW

### 1. Complete Working Project

- React app running at http://localhost:5173
- Counter example working
- Hot-reload enabled
- All tests passing (17/17)

### 2. Base Layer for New Projects

**MAIA_Layer0** - Complete MAIA ecosystem template

- Location: `MAIA_Layer0/`
- Purpose: Copy this to start new projects instantly
- Includes: All agents, skills, commands, MCP servers

**maia-layer0** - React template

- Location: `.opencode/maia-layer0/`
- Purpose: Copy this to start new React projects instantly
- No npm install needed (handled automatically)

### 3. Project Templates

Use project templates for specialized use cases:

See all templates:

```bash
bash .opencode/scripts/create-project.sh
```

Current templates:

- **maia-layer0**: React template with minimal MAIA integration
  - Location: `.opencode/maia-layer0/` (symlink in project-templates)
  - Stack: React + TypeScript + Vite
  - Purpose: Quick React project start with testing setup

- **whatsapp-agentic-bot**: Production WhatsApp automation (agents, job queues, 24/7)
  - Location: `.opencode/project-templates/whatsapp-agentic-bot/`
  - Stack: Node.js + TypeScript + BullMQ + Redis + SQLite
  - Cost: $0/month (local-only)

Create a project from template:

```bash
bash .opencode/scripts/create-project.sh <template-name> <project-name>
```

### 4. MAIA Agents Ready

- @MAIA (Orchestrator) - GLM-4.7 with research fallback
- @Coder (Architect) - GLM-4.7
- @Ops (Infrastructure) - GLM-4.7
- @Researcher (Oracle) - Gemini 2.5 Pro
- @Researcher_Fast (Flash Oracle) - Gemini 2.5 Flash
- @Reviewer (Gatekeeper) - GLM-4.7
- @Workflow (Automation) - Qwen 2.5 Coder
- @Starter (Wizard) - Gemini 2.5 Flash
- @MAIA_Premium (Heavy Artillery) - GPT-5.2 for complex challenges
- @OpenCode (Self-Meta) - GLM-4.7 for agent/MCP/skill management
- @Giuzu (Digital Clone) - Gemini 2.0 Flash (1M Context)

### 5. All Scripts Working

```bash
npm run dev           # Dev server (running now)
npm run build         # Production build
npm run test          # Run tests
npm run check         # All quality checks
npm run plan "task"   # Plan with MAIA
npm run layer list    # See layers
```

---

## 🚀 STARTING A NEW PROJECT (ZERO SETUP)

### Option 1: Use MAIA Layer0 (Full Ecosystem)

```bash
# Step 1: Go somewhere
cd Desktop
mkdir my-new-project
cd my-new-project

# Step 2: Copy MAIA_Layer0 (ONE COMMAND)
cp -r "/Users/g/Desktop/MAIA opencode/MAIA_Layer0/"* .

# Step 3: Initialize (auto-configures MAIA)
bash .opencode/scripts/init.sh

# DONE. 30 seconds total.
```

### Option 2: Use Project Template

```bash
# Step 1: Go somewhere
cd Desktop

# Step 2: Create from template
bash "/Users/g/Desktop/MAIA opencode/.opencode/scripts/create-project.sh" whatsapp-agentic-bot my-whatsapp-bot

# Step 3: Go to project
cd my-whatsapp-bot

# Step 4: Install dependencies
npm install

# Step 5: Configure .env
# Step 6: Run
npm run dev
```

### Option 3: Use React Template

```bash
# Step 1: Go somewhere
cd Desktop
mkdir my-react-app
cd my-react-app

# Step 2: Copy maia-layer0 (ONE COMMAND)
cp -r "/Users/g/Desktop/MAIA opencode/.opencode/maia-layer0"/* .

# Step 3: Initialize (auto-installs everything)
bash .opencode/scripts/init.sh

# Step 4: Start coding
npm run dev

# DONE. 30 seconds total.
```

---

## 🔧 WHAT'S IN MAIA_Layer0

```
MAIA_Layer0/
├── .opencode/
│   ├── agents/           # Agent definitions (maia, coder, ops, researcher, reviewer, workflow, starter, maia_premium, opencode, giuzu)
│   ├── commands/         # Command definitions (plan, audit, ops, research, supercharge, init, meta, start, heavy, workflow, clone)
│   ├── context/          # Project context (droid-registry, project-goals, tech-stack)
│   ├── skills/           # All 22 Open Skills packages
│   ├── scripts/          # Utility scripts (init, layer, auto-handoff)
│   ├── workflows/        # Workflow storage (n8n, flowise, trigger, agentic)
│   ├── tools/            # Custom MCP tools (discord, etc.)
│   ├── giuzu-training/   # Giuzu training data and preferences
│   └── layers/           # Custom project layers
├── opencode.json         # Full agent and command configuration (synced)
├── package.json          # Dependencies
└── bootstrap.sh         # Quick bootstrap script
```

**Everything a new project needs. Copy and go.**

---

## 📊 WHAT'S IN THE WHATSAPP BOT TEMPLATE

```
whatsapp-agentic-bot/
├── src/
│   ├── agents/           # Agent implementations (WelcomeAgent, FAQAgent, AgentRouter)
│   ├── gateway/          # Express webhook server
│   ├── scheduler/        # Cron job scheduler
│   ├── workers/          # BullMQ job workers
│   ├── services/         # Redis, Database, API integrations
│   │   ├── ai.ts        # OpenAI integration
│   │   ├── whatsapp.ts  # WhatsApp API client
│   │   ├── database.ts  # SQLite repository
│   │   └── redis.ts     # Redis connection
│   ├── config/           # Configuration with Zod validation
│   └── utils/            # Logger, shared utilities
├── scripts/             # Setup and launchd scripts
│   ├── migrate.ts        # Database migration
│   ├── seed.ts           # Seed test data
│   ├── reset.ts          # Reset database
│   ├── setup.sh          # Project setup
│   └── setup-launchd.sh  # macOS service setup
├── tests/               # Vitest test suite
│   ├── whatsapp.test.ts
│   ├── ai.test.ts
│   └── database.test.ts
├── docs/                # Comprehensive documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── DEVELOPMENT.md    # Development guide
│   └── API.md           # API reference
├── config/              # Configuration files
├── .eslintrc.cjs        # ESLint config
├── .prettierrc          # Prettier config
├── vitest.config.ts     # Vitest config
├── .env.example         # Environment template
├── package.json         # All dependencies (35+ packages)
├── tsconfig.json        # TypeScript config
└── README.md           # Complete user guide
```

---

## ⚡ AVAILABLE PROJECT TEMPLATES

Run this to see all templates:

```bash
bash .opencode/scripts/create-project.sh
```

Current templates:

- **maia-layer0**: React template with testing and build setup
  - Features: React 18, TypeScript, Vite, Vitest, ESLint, Prettier
  - Purpose: Quick React project start with full MAIA integration
  - Files: 15+ components, services, utilities

- **whatsapp-agentic-bot**: Production WhatsApp automation (agents, job queues, 24/7)
  - Features: Express, BullMQ, Redis, SQLite, OpenAI, WhatsApp API
  - Cost: $0/month (local-only)
  - Scripts: Setup, migration, seed, launchd configuration
  - Tests: 3 test suites (WhatsApp, AI, Database)
  - Docs: Architecture, Development guide, API reference
  - Files: 33+ source files with complete implementation

---

## 🔧 UPDATING THE BASE LAYER

When you improve this project:

```bash
# Copy current state back to MAIA_Layer0
cp -r .opencode/ MAIA_Layer0/
cp opencode.json MAIA_Layer0/
cp package.json MAIA_Layer0/

# Now any new project gets your improvements
```

---

## ✨ SIMPLE WORKFLOW

1. **This project**: Your "main" - experiment, improve, build features
2. **MAIA_Layer0**: Your "template" - copy this for new projects (full ecosystem)
3. **Project templates**: Specialized templates for specific use cases (WhatsApp bot, etc.)
4. **When you make improvements**: Copy back to MAIA_Layer0
5. **When starting new project**: Copy MAIA_Layer0 or use a project template

**That's it.** No setup. Just copy and code.

---

## 🎯 WHAT TO DO NOW

Just tell me:

- "Create a project from the WhatsApp template"
- "Add login page"
- "Build dashboard"
- "Connect to API"
- "Add authentication"

I handle everything. Terminal, dev server, building, testing.

**App is live at http://localhost:5173** (if running React app)

---

## 🆕 NEW FEATURES IN MAIA ECOSYSTEM

### Research Fallback (Automatic)

- MAIA automatically falls back to @researcher_fast when Gemini Pro is overloaded
- Transparent to user - single-line notification only
- No manual intervention required

### New Agents

- @workflow: Automation architect for n8n, Flowise, Trigger.dev
- @starter: Workspace wizard for onboarding new projects
- @maia_premium: Heavy artillery orchestrator for complex challenges (GPT-5.2)
- @opencode: Self-meta specialist for OpenCode configuration management
- @giuzu: Digital clone powered by Gemini 2.0 Flash (1M context)

### New Commands

- `meta`: Manage OpenCode configuration
- `start`: Onboard new workspace with Starter wizard
- `heavy`: Invoke MAIA Premium for complex challenges
- `clone`: Consult or train Giuzu (digital clone)
- `workflow`: Create or manage automated workflows

### New Directories

- `.opencode/workflows/`: Store automation workflows
- `.opencode/tools/`: Custom MCP tools (discord.ts, etc.)
- `.opencode/project-templates/`: Ready-to-use project templates
- `.opencode/giuzu-training/`: Giuzu training data and preferences

### Project Templates

- `.opencode/scripts/create-project.sh`: Create projects from templates
- `maia-layer0`: React template with minimal MAIA integration
- `whatsapp-agentic-bot`: Production WhatsApp automation

### MAIA_Layer0 Sync (Complete)

- All agents synced from root ecosystem (11 total agents)
- All commands synced from root ecosystem (11 total commands)
- Research fallback logic implemented in maia.md
- Custom tools directory added (discord.ts MCP tool)
- Giuzu training data synced (vocabulary, style-guide, preferences)
- opencode.json fully synced with latest configuration
- All agent markdown files present and complete

### WhatsApp Template Enhancements

- Complete directory structure with 33+ files
- Production-ready services (WhatsApp, AI, Database, Redis)
- Agent system with routing logic
- Configuration management with Zod validation
- Logging with Winston + daily rotation
- Test suite with Vitest
- ESLint and Prettier configs
- Launchd scripts for 24/7 operation
- Comprehensive documentation (API, Architecture, Development)

---

_MAI A: Zero setup. Forever._
