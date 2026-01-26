# Architecture Documentation

## System Overview

The WhatsApp Agentic Bot is a multi-agent system designed to automate customer interactions via WhatsApp. It uses a modular architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────┐
│   WhatsApp API  │
│   (Webhook)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Express       │
│   Gateway       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   BullMQ Queue  │
│   (Redis)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌───────┐
│Agent │  │Worker │
│Router│  │Pool   │
└───┬──┘  └───────┘
    │
    ▼
┌─────────────────┐
│   Services      │
│  (AI, WhatsApp)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SQLite DB     │
└─────────────────┘
```

## Core Components

### 1. Gateway (Express.js)

- **Purpose**: HTTP server for receiving webhooks from WhatsApp
- **Responsibilities**:
  - Webhook signature verification
  - Request validation
  - Job enqueueing
  - Health check endpoints
- **Location**: `src/gateway/index.ts`

### 2. Queue System (BullMQ + Redis)

- **Purpose**: Asynchronous job processing
- **Responsibilities**:
  - Job queuing
  - Retry logic
  - Dead letter queue
  - Priority scheduling
- **Location**: `src/services/redis.ts`, `src/workers/index.ts`

### 3. Agent System

- **Purpose**: Intelligent message routing and processing
- **Responsibilities**:
  - Message classification
  - Agent selection
  - Response generation
  - Context management
- **Location**: `src/agents/index.ts`

### 4. Workers

- **Purpose**: Background job execution
- **Responsibilities**:
  - Message processing
  - Response sending
  - Error handling
  - Logging
- **Location**: `src/workers/index.ts`

### 5. Services

- **Purpose**: External API integrations
- **Services**:
  - WhatsApp API (`src/services/whatsapp.ts`)
  - AI/LLM (`src/services/ai.ts`)
  - Database (`src/services/database.ts`)
  - Redis (`src/services/redis.ts`)

### 6. Scheduler (Cron)

- **Purpose**: Scheduled task execution
- **Responsibilities**:
  - Morning greetings
  - Cleanup jobs
  - Reminder messages
- **Location**: `src/scheduler/index.ts`

## Data Flow

### 1. Incoming Message Flow

```
User → WhatsApp → Webhook → Gateway → Queue → Worker → Agent → Services → Response
```

**Steps**:

1. User sends message via WhatsApp
2. WhatsApp sends webhook to Gateway
3. Gateway validates and enqueues job
4. Worker picks up job from queue
5. Agent processes message and generates response
6. Services send response via WhatsApp API

### 2. Scheduled Message Flow

```
Scheduler → Queue → Worker → Services → WhatsApp → User
```

**Steps**:

1. Scheduler triggers cron job
2. Job is added to queue
3. Worker processes job
4. Service sends message via WhatsApp

## Design Patterns

### 1. Agent Pattern

- Each agent has a specific responsibility
- Router pattern for agent selection
- Interface-based design

### 2. Queue Pattern

- Asynchronous processing
- Retry with exponential backoff
- Dead letter queue for failed jobs

### 3. Repository Pattern

- Database abstraction layer
- Separation of business logic from data access

### 4. Factory Pattern

- Dynamic agent creation
- Service initialization

## Error Handling

### Levels

1. **Application Level**: Try-catch in main handlers
2. **Service Level**: Service-specific error handling
3. **Queue Level**: Automatic retry and dead letter queue

### Strategies

- **Retry**: Exponential backoff (2s, 4s, 8s, ...)
- **Fallback**: Default responses when services fail
- **Logging**: Structured logging with context
- **Alerts**: Error logs for monitoring

## Security

### Measures

1. **Webhook Verification**: HMAC signature verification
2. **Environment Variables**: All secrets in `.env`
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Zod schemas for type safety
5. **SQL Injection**: Parameterized queries

## Performance

### Optimization Strategies

1. **Connection Pooling**: Redis and SQLite
2. **Caching**: Frequently accessed data
3. **Async Processing**: BullMQ for background jobs
4. **Lazy Loading**: On-demand initialization

### Monitoring

- Health checks (`/health`)
- Log aggregation (Winston)
- Queue monitoring (Bull Board, optional)
- Database queries (SQLite profiling)

## Scalability

### Vertical Scaling

- Increase worker concurrency
- Add more Redis instances
- Optimize database queries

### Horizontal Scaling

- Multiple gateway instances (load balancer)
- Distributed Redis (Redis Cluster)
- Sharded database (migration to PostgreSQL)

### Migration Path

1. **Stage 1**: Containerization (Docker)
2. **Stage 2**: VPS deployment (DigitalOcean, etc.)
3. **Stage 3**: Auto-scaling (Kubernetes)
4. **Stage 4**: Serverless (AWS Lambda)

## Testing Strategy

### Unit Tests

- Service layer logic
- Agent routing
- Repository operations
- **Tools**: Vitest

### Integration Tests

- API endpoints
- Database operations
- Queue operations
- **Tools**: Supertest, Vitest

### E2E Tests

- Full message flow
- Scheduled jobs
- Error scenarios
- **Tools**: Playwright (web), custom scripts

## Deployment

### Local Development

- `npm run dev`: Watch mode with tsx
- Redis: `brew services start redis`

### Production (macOS)

- `npm run build`: Compile TypeScript
- `bash scripts/setup-launchd.sh`: Install launchd service
- `launchctl start ...`: Start service

### Cloud Deployment

- Docker containerization
- CI/CD pipeline
- Environment-specific configs
- Monitoring and logging

## Maintenance

### Daily

- Check health logs
- Monitor error logs
- Review queue status

### Weekly

- Dead letter queue cleanup
- Log rotation check
- Performance review

### Monthly

- Database optimization
- Dependency updates
- Security audit

## Future Enhancements

1. **Multi-language Support**: i18n for responses
2. **Media Handling**: Image/video processing
3. **Analytics**: Message metrics and user insights
4. **A/B Testing**: Response variation
5. **Plugin System**: Custom agent plugins
