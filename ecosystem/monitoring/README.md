# MAIA Ecosystem Monitoring

This directory contains monitoring and health check utilities for the MAIA OpenCode ecosystem.

## Components

### Health Check System (`../health/`)

- **health-check.ts** - Core health check module
- **health-server.ts** - HTTP server for health endpoints

### Monitoring Dashboard

- **dashboard.html** - Web-based monitoring dashboard

## Usage

### Start Health Check Server

```bash
# Start the health check server
node ecosystem/health/health-server.js

# Or with proper build/transpilation
npm run health:start
```

The health check server will start on port 62602 (configurable via `HEALTH_PORT`).

### Health Endpoints

Once the server is running, the following endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Full health check (all registered checks) |
| `GET /healthz` | Kubernetes-style health endpoint |
| `GET /live` | Liveness probe (is process running?) |
| `GET /livez` | Kubernetes-style liveness |
| `GET /ready` | Readiness probe (is system ready?) |
| `GET /readyz` | Kubernetes-style readiness |
| `GET /metrics` | System metrics (memory, CPU, uptime) |

### Example Responses

#### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T12:00:00.000Z",
  "checks": {
    "agent-directory": {
      "status": "pass",
      "message": "20 agents available",
      "metadata": { "agentCount": 20 }
    },
    "environment": {
      "status": "pass",
      "message": "4 optional variables configured"
    },
    "logger": {
      "status": "pass",
      "message": "Logger functional"
    },
    "filesystem": {
      "status": "pass",
      "message": "All directories accessible"
    }
  },
  "summary": {
    "total": 4,
    "passing": 4,
    "warning": 0,
    "failing": 0
  }
}
```

#### Metrics Response
```json
{
  "uptime": 3600.5,
  "memory": {
    "heapUsed": 123456789,
    "heapTotal": 256000000,
    "external": 1234567
  },
  "cpu": {
    "user": 1234567890,
    "system": 123456789
  },
  "timestamp": "2026-01-31T12:00:00.000Z"
}
```

### Monitoring Dashboard

Open `dashboard.html` in a web browser to view the monitoring dashboard.

The dashboard shows:
- Overall system status
- Health check results with status indicators
- System metrics (uptime, memory, CPU)
- Auto-refreshes every 30 seconds

## Custom Health Checks

Register custom health checks in your application:

```typescript
import { registerHealthCheck } from './ecosystem/health/health-check.js';

registerHealthCheck('my-service', async () => {
  // Perform health check logic
  const isHealthy = await checkMyService();

  return {
    status: isHealthy ? 'pass' : 'fail',
    message: isHealthy ? 'Service is healthy' : 'Service is down',
    metadata: { responseTime: '50ms' }
  };
});
```

## Integration

### With Express

```typescript
import { healthCheckHandler } from './ecosystem/health/health-check.js';

app.get('/health', async (req, res) => {
  const result = await healthCheckHandler();
  const status = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;
  res.status(status).json(result);
});
```

### With Kubernetes

Add to your deployment YAML:

```yaml
livenessProbe:
  httpGet:
    path: /livez
    port: 62602
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /readyz
    port: 62602
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HEALTH_PORT` | Health check server port | `62602` |
| `HEALTH_LOG_DIR` | Directory for health logs | `./logs` |
| `LOG_LEVEL` | Logging level | `info` |
