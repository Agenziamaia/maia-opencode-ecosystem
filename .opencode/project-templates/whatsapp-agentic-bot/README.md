# WhatsApp Agentic Bot - Template

## Overview

This is a **production-ready agentic workflow template** for WhatsApp automation running entirely on macOS with 24/7 availability. It replaces n8n with custom TypeScript agents, BullMQ for job queuing, and launchd for process management.

## Stack

- **Runtime**: Node.js 20+ (TypeScript strict mode)
- **Job Queue**: BullMQ + Redis (local or cloud)
- **Webhook Server**: Express.js
- **Scheduler**: node-cron (BullMQ-based)
- **Database**: SQLite (local, embedded, better-sqlite3)
- **Process Manager**: launchd (native macOS)
- **Logging**: Winston + daily file rotation
- **Testing**: Vitest with coverage
- **Linting**: ESLint + Prettier
- **Validation**: Zod schemas
- **Monitoring**: Custom health check + log aggregation

## Core Features

1. **Multi-Agent System**: Specialized agents for welcome, keys, links, checkout, reviews, concierge Q&A
2. **Message Scheduling**: Agenda-based cron-like scheduling with booking-aware timing
3. **Idempotent Operations**: Deduplication, retry logic, dead letter queue
4. **Auto-Restart**: launchd ensures 24/7 uptime with crash recovery
5. **Observability**: Structured logs, health metrics, error tracking
6. **Cost**: $0/mo (local-only, optional $5/mo for Redis Cloud if needed)

## Quick Start

```bash
# Install dependencies
npm install

# Start Redis (local)
brew services start redis

# Initialize database
npm run db:migrate

# Start all services (development)
npm run dev

# Start all services (production - 24/7)
npm run start
```

## Template Structure

```
whatsapp-agentic-bot/
├── src/
│   ├── agents/          # Agent implementations (WelcomeAgent, FAQAgent, AgentRouter)
│   ├── gateway/         # Express webhook & API server
│   ├── scheduler/       # Cron job scheduling (node-cron)
│   ├── workers/         # BullMQ worker pool
│   ├── services/        # External API integrations
│   │   ├── ai.ts        # OpenAI API client
│   │   ├── whatsapp.ts  # WhatsApp Business API client
│   │   ├── database.ts  # SQLite repository with migrations
│   │   └── redis.ts     # Redis connection for BullMQ
│   ├── config/           # Configuration management with Zod validation
│   └── utils/           # Logger (Winston), shared utilities
├── scripts/             # Utility scripts
│   ├── migrate.ts        # Database migration
│   ├── seed.ts           # Seed test data
│   ├── reset.ts          # Reset database
│   ├── setup.sh          # Project setup
│   └── setup-launchd.sh  # macOS launchd service setup
├── tests/               # Vitest test suites
│   ├── whatsapp.test.ts
│   ├── ai.test.ts
│   └── database.test.ts
├── docs/                # Comprehensive documentation
│   ├── ARCHITECTURE.md   # System architecture and design patterns
│   ├── DEVELOPMENT.md    # Development guide and best practices
│   └── API.md           # Complete API reference
├── config/              # Configuration files
├── logs/                # Application logs (auto-rotated)
├── data/                # SQLite database files
├── .eslintrc.cjs        # ESLint configuration
├── .prettierrc          # Prettier configuration
├── vitest.config.ts     # Vitest configuration
├── .env.example         # Environment variable template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Architecture Philosophy

- **Fail-Safe**: Every component has error handling and retry logic
- **Observable**: Every action is logged with context
- **Idempotent**: Re-running jobs won't cause duplicate messages
- **Local-First**: Works entirely offline except external API calls
- **Cloud-Ready**: Can migrate to Docker/VPS if needed

## Customization Guide

This template provides complete implementation with production-ready code:

1. **Configure Environment Variables**: Copy `.env.example` to `.env` and fill in your credentials
2. **Customize Agents**: Modify agent logic in `src/agents/` or add new agents
3. **Integrate External APIs**: Add your service integrations in `src/services/`
4. **Set Up Launchd**: Run `bash scripts/setup-launchd.sh` for 24/7 service

All core services are fully implemented:

- ✅ WhatsApp API integration
- ✅ OpenAI AI integration
- ✅ Database with migrations
- ✅ Redis connection
- ✅ Agent routing system
- ✅ Worker pool
- ✅ Scheduler with cron jobs
- ✅ Logging with rotation

## Cost Comparison

| Solution        | Cost/mo | Complexity | Reliability |
| --------------- | ------- | ---------- | ----------- |
| Local (this)    | $0      | Medium     | High        |
| trigger.dev     | $29+    | Low        | High        |
| n8n Cloud       | $20+    | Low        | Medium      |
| n8n Self-Hosted | $5-10   | High       | Medium      |
| Temporal Cloud  | $100+   | High       | Very High   |

## 24/7 Reliability

- **launchd**: Native macOS process manager with auto-restart
- **Health Checks**: Every 30s, logs to health.log
- **Dead Letter Queue**: Failed jobs tracked separately
- **Graceful Shutdown**: SIGTERM handling to complete in-flight jobs
- **Log Rotation**: Automatic log rotation via newl

## Migration Path to Cloud

1. **Stage 1**: Containerize with Docker
2. **Stage 2**: Deploy to VPS (DigitalOcean, Linode, etc.)
3. **Stage 3**: Add monitoring (Prometheus, Grafana)
4. **Stage 4**: Scale horizontally (multiple workers)

## Maintenance

- **Daily**: Check `logs/health.log` and `logs/error.log`
- **Weekly**: Review dead letter queue for stuck jobs
- **Monthly**: Archive old logs, clean SQLite
- **On Update**: Stop launchd service, git pull, restart

## Security

- Environment variables for all secrets
- SQLite database permissions restricted to user
- Redis password-protected (if exposing)
- Webhook signature verification
- Rate limiting on all endpoints

## Next Steps

1. Copy `.env.example` to `.env` and configure your environment
2. Review `src/agents/` and customize agent logic if needed
3. Review `docs/ARCHITECTURE.md` for system overview
4. Review `docs/DEVELOPMENT.md` for development guide
5. Review `docs/API.md` for complete API reference
6. Run `bash scripts/setup.sh` to initialize the system
7. Start development with `npm run dev`

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

## MAIA Integration

This project template includes full MAIA ecosystem support. Run:

```bash
opencode run init          # Initialize MAIA
opencode run plan "task"  # Plan new features
opencode run ops "deploy"  # Deploy infrastructure
opencode run audit         # Run code quality checks
```

## Available Scripts

```bash
# Development
npm run dev              # Start in watch mode (tsx)

# Build & Start
npm run build            # Compile TypeScript
npm run start            # Start production server
npm run start:gateway    # Start only gateway
npm run start:workers    # Start only workers
npm run start:scheduler  # Start only scheduler

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed test data
npm run db:reset         # Reset database

# Testing
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier

# Logs
npm run logs:tail        # Tail application logs
npm run logs:health      # Tail health logs
npm run logs:error       # Tail error logs
```

---

**Created by MAIA Ops** | **Zero Monthly Cost** | **Maximum Control**
