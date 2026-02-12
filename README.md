# MAIA Open Code Supercharged

**Level 100 Agentic Development Environment**

> "We do not just build. We architect reality." - MAIA Prime

---

## 🚀 Quick Start

```bash
# 1. Copy environment template and configure
cp .env.example .env
# Edit .env with your API keys and configuration

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run tests
npm test

# 5. Check code quality
npm run lint
npm run typecheck

# Initialize environment
npm run init
```

---

## ⚡ The MAIA "Dream Team" (V3)

We are a 20-agent engine optimized for strategy, execution, and research:

| Category | Headliner | Role |
| :--- | :--- | :--- |
| **Strategy** | **@MAIA** | Supreme Orchestrator (GLM-5) |
| **PM** | **@Sisyphus** | Project Manager (GLM-5) |
| **Logic** | **@Giuzu** | Strategic Advisor (DeepSeek R1) |
| **Code** | **@Coder** | Lead Architect (GLM-5) |
| **Quality** | **@Reviewer** | Quality Gate (Big Pickle) |
| **Research** | **@Researcher** | Intel lead (Gemini Pro/Flash) |

*Total: 20 Specialized agents registered in [opencode.json](file:///Users/g/Desktop/MAIA%20opencode/opencode.json).* 

---

## 🌊 The Flow of Intelligence (How to Work)

This is a **Single-Workspace Ecosystem**. You live here. You build here. You evolve here.

1.  **YOU (The Pilot)**
    - Work inside: `MAIA opencode/`
    - Command: "Build a hotel bot", "Research crypto"

2.  **THE AGENTS (The Crew)**
    - **@coder**, **@sisyphus**: They build your apps in `src/`.
    - **@giuzu**: Your Digital Twin. He observes, learns your preferences, and updates his `brain.md`.

3.  **THE PROJECTS (The Output)**
    - Your apps live in `src/project-name/` (e.g., `src/hotel-bot/`).
    - You push them to their own GitHub repos (e.g., `github.com/agency/hotel-bot`).

4.  **THE EVOLUTION (The Distillation)**
    - When your agents get smarter (or Giuzu learns a new trick), run:
    - `./.opencode/scripts/distill_layer0.sh`
    - This extracts the **Intelligence** (Brains, Agents, Configs) and pushes it to your **Universal Backup** (`multiagent-layer0`).

5.  **THE FUTURE (The Inheritance)**
    - Start fresh anywhere by cloning `multiagent-layer0`.
    - You inherit Level 100 Giuzu and all your best agents instantly.

---

### How We Work


1. **Planning** (`/plan`) - @MAIA creates a strategic battle plan
2. **Execution** - @Coder, @Ops, @Researcher implement tasks
3. **Verification** (`/audit`) - @Reviewer ensures quality
4. **Evolution** (`/supercharge`) - @MAIA analyzes improvements

---

## 🛠️ Available Commands

```bash
# Plan a new feature
npm run plan "Create user authentication"

# Execute infrastructure tasks
npm run ops "Set up Docker container"

# Research documentation or patterns
npm run research "Find React best practices"

# Run quality checks
npm run audit

# Meta-analysis for improvements
npm run supercharge

# Initialize environment
npm run init
```

---

## 📁 Project Structure

```
.
├── .opencode/              # Agent configuration and skills
│   ├── agents/             # Agent profiles (@MAIA, @Coder, @Ops, @Researcher, @Reviewer)
│   ├── commands/           # Command templates (/plan, /ops, /research, /audit)
│   ├── skills/             # Loadable skill modules (React, API, Testing, Refactoring)
│   └── context/           # Project context (tech stack, goals, droid registry)
├── .agents/                # Multi-agent collaboration tracking
│   ├── sessions/           # Per-agent session logs
│   ├── handoffs.json       # Handoff history
│   ├── work-distribution.json # Task assignments
│   ├── conflicts/          # Conflict resolution records
│   └── metrics.json        # Droid performance metrics
├── src/
│   ├── components/         # Reusable UI components
│   ├── services/          # API integration layer
│   ├── utils/             # Pure utility functions
│   ├── types/             # TypeScript type definitions
│   ├── features/          # Feature-based modules
│   └── test/              # Test utilities and setup
├── AGENTS.md              # Complete agent instructions
├── opencode.json          # Agent and command configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── README.md              # This file
```

### UNIVERSAL Directory

The `UNIVERSAL/` directory contains shared packages used across the entire ecosystem:

```
UNIVERSAL/
├── logger/                # Unified logging system
│   ├── src/index.ts      # Logger implementation (simple + Winston)
│   ├── package.json      # Package configuration
│   └── README.md         # Logger documentation
├── config/                # Shared build configurations
│   ├── eslint.js         # ESLint configuration
│   ├── .prettierrc       # Prettier configuration
│   ├── tsconfig.base.json # TypeScript base config
│   └── README.md         # Config documentation
├── context/              # Shared context files
├── skills/               # Loadable skill modules (25+ skills)
└── tools/                # Universal tool implementations
```

#### Using UNIVERSAL Packages

```bash
# Use the unified logger
import { logInfo, logError, createLogger } from '../../../UNIVERSAL/logger/src/index.js';

// Use shared configs in package.json
"eslintConfig": "require('@maia-opencode/config/eslint.js')"
```

---

## 🎯 Core Philosophy

### Minimally Expensive
- Zero setup friction
- One-command initialization
- Automated quality gates

### Maximally Effective
- Specialized agents doing what they do best
- Strategic planning before execution
- Continuous self-improvement

### God-Tier Workflows
- Battle plans, not to-do lists
- Atomic commits with clear attribution
- Context preservation across sessions
- Automated handoffs and tracking

---

## 🔧 Technology Stack

- **Frontend**: React 18 + Vite + TypeScript (Strict Mode)
- **Testing**: Vitest + React Testing Library
- **Quality**: ESLint + Prettier + TypeScript Compiler
- **Agentic**: Multi-model AI collaboration (GPT-4o, GLM-4, Gemini, Claude)

---

## 🔑 Environment Configuration

The ecosystem uses a single `.env` file for configuration. Copy `.env.example` to get started:

```bash
cp .env.example .env
```

### Required Environment Variables

| Variable | Purpose | Get it from |
|----------|---------|-------------|
| `OPENAI_API_KEY` | GPT-4 access | platform.openai.com |
| `GEMINI_API_KEY` | Google AI | aistudio.google.com |
| `OPENROUTER_API_KEY` | Multi-model router | openrouter.ai |
| `DISCORD_BOT_TOKEN` | Discord integration | discord.com/developers |

### Optional Environment Variables

- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `USE_WINSTON` - Enable file logging with Winston
- `LOG_DIR` - Directory for log files (default: ./logs)
- `PORT` - Application port (default: 3000)
- `VIBE_KANBAN_URL` - Task management integration

See `.env.example` for the complete list of available variables.

---

## 📝 Logging

The ecosystem uses a unified logging system from `UNIVERSAL/logger`:

```typescript
// Simple console logging (default)
import { logInfo, logWarn, logError, logDebug } from './utils/logger';

logInfo('Application started');
logError('Database connection failed', { host: 'localhost' });

// Winston file logging (production)
import { createLogger } from './utils/logger';

const logger = createLogger({
  useWinston: true,
  enableFile: true,
  level: 'debug',
});

logger.info('Server started', { port: 3000 });
```

**Note**: The linter will warn about `console.log` - use the logger instead!

---

## 📋 Code Style Guidelines

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Line Length**: 100 characters
- **Components**: Functional, hooks-based
- **Types**: Explicit, no `any` allowed
- **Tests**: Arrange-Act-Assert, 80%+ coverage

See `AGENTS.md` for complete guidelines.

---

## 🤝 Contributing

1. Start with `/plan` for complex features
2. Follow AGENTS.md patterns strictly
3. Write tests before implementation (TDD)
4. Run `/audit` before committing
5. Tag your work with your agent name and session

### Multi-Agent Collaboration

- Always identify yourself in comments: `<!-- @MAIA-session-001 -->`
- Document handoffs in `.agents/handoffs.json`
- Update `.agents/metrics.json` after tasks
- Run tests before handing off to another agent

---

## 🎓 Loadable Skills

Our agents can instantly absorb domain expertise through skills:

- `react-component` - Generate React components from descriptions
- `api-service` - Create API service modules
- `test-writing` - Test-driven development workflows
- `refactoring` - Code cleanup and optimization

Load a skill: See `.opencode/skills/` directory.

---

## 📊 Success Metrics

- Zero syntax errors reaching commits (caught by @Reviewer)
- All features planned before implementation (enforced by @MAIA)
- 80%+ test coverage
- 100% type safety (no `any`)
- Zero context loss across sessions

---

## 🔐 Security & Permissions

- **Edit**: Automatic (agents can write code)
- **Bash**: Automatic (agents can execute commands)
- **Write**: Automatic (agents can create files)
- **Quality Gate**: @Reviewer enforces standards via `/audit`

---

## 🚨 Emergency Protocols

If collaboration breaks down:
1. Stop and document state in `.agents/emergency-{timestamp}.md`
2. Create minimal reproducible example
3. Request human intervention
4. Provide multiple solution approaches

---

## 📞 Support

For issues or questions:
1. Check `AGENTS.md` for guidelines
2. Review `.opencode/context/` for project context
3. Run `/init` to verify environment
4. Use `/research` for complex queries

---

**Reality Initialized. Ready for Architecture.**

*Built by MAIA Droids. Orchestrated by @MAIA. Engineered by @Coder. Secured by @Ops. Validated by @Reviewer. Informed by @Researcher.*
