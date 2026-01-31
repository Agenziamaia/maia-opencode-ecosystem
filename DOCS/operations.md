# Operations Guide

This guide covers deployment, monitoring, and maintenance of the MAIA OpenCode ecosystem.

---

## Table of Contents

- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Health Checks](#health-checks)
- [Logging](#logging)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Deployment

### Environment Setup

```bash
# 1. Set up environment file
cp .env.example .env

# 2. Configure required variables
# Edit .env with production values
```

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `LOG_LEVEL` | Logging level | `info` |
| `USE_WINSTON` | Enable file logging | `true` |
| `LOG_DIR` | Log directory | `./logs` |

### Building

```bash
# Build for production
npm run build

# Run type check
npm run typecheck

# Run tests
npm run test:run
```

### Running in Production

```bash
# Using PM2
pm2 start npm --name "maia-ecosystem" -- start

# Using Docker
docker build -t maia-ecosystem .
docker run -p 3000:3000 --env-file .env maia-ecosystem

# Direct with Node
NODE_ENV=production npm start
```

---

## Monitoring

### Health Check Server

The health check server provides endpoints for monitoring:

```bash
# Start health check server
node ecosystem/health/health-server.js

# Default port: 62602 (configurable via HEALTH_PORT)
```

### Endpoints

| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /health` | Full health check | Health status |
| `GET /live` | Liveness probe | Process status |
| `GET /ready` | Readiness probe | Ready status |
| `GET /metrics` | System metrics | CPU, memory, uptime |

### Monitoring Dashboard

Open the web dashboard:

```bash
open ecosystem/monitoring/dashboard.html
```

The dashboard shows:
- Overall system status
- Individual health check results
- System metrics (memory, CPU, uptime)
- Auto-refreshes every 30 seconds

---

## Health Checks

### Built-in Health Checks

The system includes these health checks:

- **agent-directory** - Verifies agent configuration
- **environment** - Checks required environment variables
- **logger** - Validates logger functionality
- **filesystem** - Checks directory access

### Custom Health Checks

Register custom checks:

```typescript
import { registerHealthCheck } from './ecosystem/health/health-check.js';

registerHealthCheck('database', async () => {
  const isConnected = await checkDatabaseConnection();
  return {
    status: isConnected ? 'pass' : 'fail',
    message: isConnected ? 'Database connected' : 'Database unreachable',
  };
});
```

### Health Status Codes

| Status | HTTP Code | Description |
|--------|-----------|-------------|
| `healthy` | 200 | All checks passing |
| `degraded` | 200 | Some warnings |
| `unhealthy` | 503 | One or more failures |

---

## Logging

### Log Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| `debug` | Verbose debugging | Development |
| `info` | General information | Normal operation |
| `warn` | Warning messages | Potential issues |
| `error` | Error messages | Failures |
| `http` | HTTP logging | Request/response |

### Log Files (Winston)

When `USE_WINSTON=true`, logs are written to:

- `logs/app-YYYY-MM-DD.log` - All logs
- `logs/error-YYYY-MM-DD.log` - Errors only
- `logs/health-YYYY-MM-DD.log` - Health checks

### Viewing Logs

```bash
# View current logs
tail -f logs/app-$(date +%Y-%m-%d).log

# View errors only
tail -f logs/error-$(date +%Y-%m-%d).log

# Search logs
grep "ERROR" logs/app-*.log
```

---

## Troubleshooting

### Common Issues

#### Agent Not Responding

1. Check health status:
   ```bash
   curl http://localhost:62602/health
   ```

2. Check agent logs:
   ```bash
   grep "agent" logs/app-*.log
   ```

3. Verify environment:
   ```bash
   node -e "console.log(process.env.NODE_ENV)"
   ```

#### High Memory Usage

1. Check memory metrics:
   ```bash
   curl http://localhost:62602/metrics
   ```

2. Review Winston logs for patterns

3. Consider adjusting log retention

#### Health Check Failing

1. Run individual health checks:
   ```bash
   curl http://localhost:62602/health | jq
   ```

2. Check specific failing component

3. Review error logs

### Recovery Procedures

#### Restart Health Check Server

```bash
# Find process
lsof -ti :62602 | xargs kill -9

# Restart
node ecosystem/health/health-server.js
```

#### Clear Log Files

```bash
# Archive old logs
mv logs logs-$(date +%Y%m%d)
mkdir logs

# Or use logrotate
```

---

## Maintenance

### Daily Tasks

- Review error logs for patterns
- Check health dashboard
- Monitor system resources

### Weekly Tasks

- Archive old log files
- Review and rotate logs
- Check for updates

### Monthly Tasks

- Review and update dependencies
- Audit environment variables
- Review and update documentation

### Backup Strategy

```bash
# Backup configuration
tar -czf maia-config-$(date +%Y%m%d).tar.gz .opencode/ .env

# Backup logs
tar -czf maia-logs-$(date +%Y%m%d).tar.gz logs/

# Backup database (if applicable)
# Implementation varies by database
```

### Update Procedure

```bash
# 1. Backup current version
cp -r . ../maia-backup-$(date +%Y%m%d)

# 2. Pull latest changes
git pull origin main

# 3. Update dependencies
npm install

# 4. Run tests
npm run test:run

# 5. Restart services
pm2 restart maia-ecosystem
```

---

## Security

### Best Practices

1. Never commit `.env` files
2. Rotate API keys regularly
3. Use least-privilege access
4. Enable audit logging
5. Monitor for suspicious activity

### Environment Variable Security

```bash
# Set file permissions
chmod 600 .env

# Check for exposed keys
git grep --cached -i apikey
git grep --cached -i secret
```

---

## Scaling

### Horizontal Scaling

For multiple instances:

1. Configure shared storage
2. Set up load balancer
3. Enable distributed logging
4. Configure shared session storage

### Vertical Scaling

For single instance scaling:

1. Increase memory allocation
2. Adjust Winston file limits
3. Optimize worker processes
4. Profile and optimize hot paths

---

## Additional Resources

- [API Documentation](./api/)
- [Development Guide](./development.md)
- [Main README](../README.md)
- [Environment Variables](../.env.example)
