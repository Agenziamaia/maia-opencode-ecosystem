# Development Guide

## Getting Started

### Prerequisites

- Node.js 20+
- Redis (local or cloud)
- macOS (for launchd)

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
```

### Running Locally

```bash
# Start Redis
brew services start redis

# Initialize database
npm run db:migrate

# Run in development
npm run dev
```

## Project Structure

```
src/
├── agents/          # Agent implementations
├── gateway/         # Express webhook server
├── scheduler/       # Cron jobs
├── services/        # External API integrations
│   ├── ai.ts
│   ├── database.ts
│   ├── redis.ts
│   └── whatsapp.ts
├── workers/         # BullMQ workers
├── utils/           # Shared utilities
│   └── logger.ts
├── config/          # Configuration
│   └── index.ts
└── index.ts         # Entry point
```

## Development Workflow

### 1. Adding a New Agent

Create a new agent in `src/agents/`:

```typescript
export class MyCustomAgent implements Agent {
  name = 'my-custom';
  description = 'Custom agent description';

  async process(message: string, context: AgentContext): Promise<string> {
    // Your logic here
    return 'Response';
  }
}
```

Register in `AgentRouter`:

```typescript
const router = new AgentRouter();
router.registerAgent(new MyCustomAgent());
```

### 2. Adding a New Endpoint

Add to `src/gateway/index.ts`:

```typescript
app.post('/api/my-endpoint', async (req, res) => {
  try {
    // Your logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});
```

### 3. Adding a Scheduled Job

Add to `src/scheduler/index.ts`:

```typescript
cron.schedule('0 9 * * *', async () => {
  // Runs daily at 9 AM
  await scheduledQueue.add('my-job', { data: 'value' });
});
```

### 4. Adding a Database Migration

Create in `scripts/migrate.ts` or add to schema:

```typescript
db.exec(`
  CREATE TABLE IF NOT EXISTS my_table (
    id TEXT PRIMARY KEY,
    field TEXT NOT NULL
  );
`);
```

## Testing

### Run Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Watch Mode

```bash
npm test -- --watch
```

## Debugging

### Enable Debug Logs

```bash
LOG_LEVEL=debug npm run dev
```

### Inspect Queue

```bash
redis-cli
> KEYS bull:*
> HGETALL bull:webhook-queue:*
```

### View Logs

```bash
tail -f logs/app.log
tail -f logs/error.log
```

## Code Style

### ESLint

```bash
npm run lint
npm run lint:fix
```

### Prettier

```bash
npm run format
```

### TypeScript

```bash
npm run build  # Check for type errors
```

## Environment Variables

Required variables (see `.env.example`):

- `WHATSAPP_API_KEY`: WhatsApp Business API key
- `WHATSAPP_PHONE_NUMBER_ID`: Phone number ID
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: Webhook verify token
- `WHATSAPP_WEBHOOK_SECRET`: Webhook secret
- `OPENAI_API_KEY`: OpenAI API key

## Common Tasks

### Reset Database

```bash
npm run db:reset
```

### Seed Test Data

```bash
npm run db:seed
```

### Build for Production

```bash
npm run build
```

### Start All Services

```bash
npm start
```

## Troubleshooting

### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
brew services start redis
```

### Database Locked

```bash
# Reset database
npm run db:reset
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001 npm run dev
```

### Worker Not Processing Jobs

```bash
# Check Redis queues
redis-cli
> KEYS bull:*
> LLEN bull:webhook-queue:wait
```

## Best Practices

1. **Always handle errors**: Use try-catch with logging
2. **Validate inputs**: Use Zod schemas
3. **Log context**: Include relevant data in logs
4. **Test your code**: Write unit tests for services
5. **Keep it simple**: Don't over-engineer
6. **Document changes**: Update README and docs
7. **Use environment variables**: Never hardcode secrets
8. **Type everything**: Leverage TypeScript strict mode

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Run linting
5. Build successfully
6. Submit PR

## Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/)
- [OpenAI API](https://platform.openai.com/docs/)
