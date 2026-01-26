# WhatsApp Agentic Bot - Local-First Production System

## Overview

Production-ready agentic workflow system running entirely on macOS terminal with 24/7 availability. Replaces n8n with custom TypeScript agents, BullMQ for job queuing, and launchd for process management.

## Stack

- **Runtime**: Node.js 20+ (TypeScript)
- **Job Queue**: BullMQ + Redis (local)
- **Webhook Server**: Express.js
- **Scheduler**: Agenda (BullMQ-based)
- **Database**: SQLite (local, embedded)
- **Process Manager**: launchd (native macOS)
- **Logging**: Winston + file rotation
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

## Project Structure

```
whatsapp-agentic-bot/
├── src/
│   ├── agents/          # Agent implementations
│   ├── gateway/         # Webhook & API gateway
│   ├── scheduler/       # Job scheduling logic
│   ├── workers/         # BullMQ worker processes
│   ├── services/        # External API integrations
│   └── utils/           # Shared utilities
├── config/              # Environment & app config
├── logs/                # Application logs
├── scripts/             # Bootstrap & utility scripts
└── tests/               # Test suites
```

## Architecture Philosophy

- **Fail-Safe**: Every component has error handling and retry logic
- **Observable**: Every action is logged with context
- **Idempotent**: Re-running jobs won't cause duplicate messages
- **Local-First**: Works entirely offline except external API calls
- **Cloud-Ready**: Can migrate to Docker/VPS if needed

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

- Environment variables for all secrets (Spoki API keys, Smobu credentials)
- SQLite database permissions restricted to user
- Redis password-protected (if exposing)
- Webhook signature verification (Spoki)
- Rate limiting on all endpoints
