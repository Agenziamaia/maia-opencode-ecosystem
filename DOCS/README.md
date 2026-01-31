# MAIA OpenCode Documentation

Welcome to the MAIA OpenCode ecosystem documentation. This is your central hub for all documentation.

---

## Quick Navigation

| Category | Description | Link |
|----------|-------------|------|
| **Getting Started** | New to MAIA? Start here | [Quick Start Guide](#quick-start) |
| **API Reference** | UNIVERSAL packages API docs | [API Documentation](./api/) |
| **Agent System** | Working with agents | [Agent Documentation](#agent-system) |
| **Development** | Development workflows | [Development Guide](#development) |
| **Operations** | Deployment & monitoring | [Operations Guide](#operations) |
| **Architecture** | System architecture | [Architecture](#architecture) |

---

## Quick Start

### First Time Setup

```bash
# 1. Copy environment template
cp .env.example .env
# Edit .env with your API keys

# 2. Install dependencies
npm install

# 3. Run health check
npm run health:check

# 4. Start development
npm run dev
```

### Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | TypeScript type checking |

---

## API Documentation

### UNIVERSAL Packages

- **[@maia-opencode/logger](./api/logger.md)** - Unified logging system
- **[@maia-opencode/config](./api/config.md)** - Shared build configurations

[View all API docs →](./api/)

---

## Agent System

### Core Concepts

- **Agent Registry** - Central registry of all MAIA agents
- **Agent Handoffs** - How agents collaborate and hand off tasks
- **Session Tracking** - Tracking agent sessions and metrics

### Available Agents

| Agent | Role | Model |
|-------|------|-------|
| @maia | Supreme Orchestrator | GLM-4.7 |
| @coder | Lead Architect | GLM-4.7 |
| @sisyphus | Project Manager | GLM-4.7 |
| @giuzu | Strategic Advisor | DeepSeek R1 |
| @researcher | Intel Lead | Gemini Pro/Flash |

[Agent Registry →](../.opencode/context/droid-registry.md)

---

## Development

### Code Style

The ecosystem uses shared configurations from `@maia-opencode/config`:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Line Width**: 100 characters
- **TypeScript**: Strict mode enabled

### Pre-commit Hooks

The project uses Husky and lint-staged:

- ESLint runs automatically before commits
- Prettier formats staged files
- Type checking prevents commits with errors

### Testing

```bash
# Unit tests
npm run test

# Integration tests
cd ecosystem/tests && npm run test:run

# Coverage report
npm run test:coverage
```

---

## Operations

### Health Checks

The ecosystem includes a comprehensive health check system:

```bash
# Start health check server
npm run health:start

# Check health status
curl http://localhost:62602/health
```

### Monitoring

Open the monitoring dashboard:

```bash
open ecosystem/monitoring/dashboard.html
```

### Environment Variables

See [`.env.example`](../.env.example) for all available environment variables.

---

## Architecture

### Directory Structure

```
MAIA opencode/
├── .opencode/              # Agent configuration and skills
│   ├── agents/             # Agent profiles
│   ├── commands/           # Command templates
│   ├── context/           # Project context
│   └── workflows/         # Workflow definitions
├── UNIVERSAL/             # Shared packages
│   ├── logger/            # Unified logging
│   ├── config/            # Shared configs
│   ├── context/           # Shared context
│   ├── skills/            # Loadable skills
│   └── tools/             # Universal tools
├── ecosystem/             # Ecosystem tools
│   ├── tests/             # Integration tests
│   ├── health/            # Health checks
│   └── monitoring/        # Monitoring dashboard
├── PROJECTS/              # Project instances
├── DOCS/                  # Additional documentation
└── docs/                  # Consolidated documentation
```

### Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     MAIA Ecosystem                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │    Agents    │─────▶│   UNIVERSAL  │                    │
│  │  (.opencode) │      │   Packages   │                    │
│  └──────────────┘      └──────────────┘                    │
│         │                       │                           │
│         ▼                       ▼                           │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │   Projects   │◀─────│  Health &    │                    │
│  │  (/PROJECTS) │      │  Monitoring  │                    │
│  └──────────────┘      └──────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Additional Documentation

### Guides

- [Quickstart Guide](../DOCS/QUICKSTART.md) - Detailed quickstart guide
- [Orchestration Guide](../DOCS/ORCHESTRATION_GUIDE.md) - Agent orchestration
- [Models Reference](../DOCS/MODELS.md) - Available AI models

### Reference

- [Master Catalog](../DOCS/MASTER_CATALOG.md) - Complete tool and skill catalog
- [Agent Board](../DOCS/AGENT_BOARD.md) - Agent assignments and roles
- [Tools](../DOCS/TOOLS.md) - Available tools

### Analysis

- [Implementation Summary](../DOCS/IMPLEMENTATION_SUMMARY.md) - Implementation details
- [Research Synthesis](../DOCS/RESEARCH_SYNTHESIS.md) - Research findings

---

## Support

### Getting Help

1. Check this documentation first
2. Review [FAQ](#faq)
3. Check existing [Issues](https://github.com/your-org/maia-opencode/issues)
4. Run `/init` to verify your environment

### FAQ

**Q: How do I add a new agent?**
A: Create a new agent file in `.opencode/agents/` and register it in the agent registry.

**Q: Where should I put project-specific code?**
A: Project code goes in `PROJECTS/your-project-name/`.

**Q: How do I run integration tests?**
A: `cd ecosystem/tests && npm run test:run`

**Q: What's the difference between DOCS/ and docs/?**
A: `docs/` is the consolidated documentation home. `DOCS/` contains legacy docs being migrated.

---

## Contributing

When contributing to the documentation:

1. Keep markdown files well-structured
2. Use relative links for internal references
3. Update the table of contents when adding sections
4. Run `npm run format` before committing

---

**Documentation Version:** 1.0.0
**Last Updated:** 2026-01-31
