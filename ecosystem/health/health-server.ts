/**
 * Health Check HTTP Server
 *
 * Provides HTTP endpoints for health checks and monitoring.
 * Can be used with Kubernetes probes, load balancers, or monitoring services.
 */

import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import {
  healthCheckHandler,
  livenessProbe,
  readinessProbe,
  registerHealthCheck,
} from './health-check.js';
import { createLogger } from '../../UNIVERSAL/logger/src/index.js';

const logger = createLogger({ useWinston: true });
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || '62602', 10);

// Content type helper
function sendJson(res: ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Create and start the health check server
 */
export function startHealthServer(): Server {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '', `http://${req.headers.host}`);

    try {
      switch (url.pathname) {
        case '/health':
        case '/healthz':
        case '/':
          // Full health check
          const healthResult = await healthCheckHandler();
          const httpStatus = healthResult.status === 'healthy' ? 200 : healthResult.status === 'degraded' ? 200 : 503;
          sendJson(res, healthResult, httpStatus);
          break;

        case '/live':
        case '/livez':
          // Liveness probe
          sendJson(res, livenessProbe());
          break;

        case '/ready':
        case '/readyz':
          // Readiness probe
          const readyResult = await readinessProbe();
          const readyStatus = readyResult.status === 'ready' ? 200 : 503;
          sendJson(res, readyResult, readyStatus);
          break;

        case '/metrics':
          // Prometheus-style metrics endpoint
          sendJson(res, {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            timestamp: new Date().toISOString(),
          });
          break;

        default:
          sendJson(res, { error: 'Not found' }, 404);
      }
    } catch (error) {
      logger.error('Health check server error', { error: error instanceof Error ? error.message : 'Unknown error' });
      sendJson(res, { error: 'Internal server error' }, 500);
    }
  });

  server.listen(HEALTH_PORT, () => {
    logger.info(`Health check server listening on port ${HEALTH_PORT}`);
    logger.info(`Health endpoints available:`);
    logger.info(`  http://localhost:${HEALTH_PORT}/health - Full health check`);
    logger.info(`  http://localhost:${HEALTH_PORT}/live - Liveness probe`);
    logger.info(`  http://localhost:${HEALTH_PORT}/ready - Readiness probe`);
    logger.info(`  http://localhost:${HEALTH_PORT}/metrics - System metrics`);
  });

  return server;
}

/**
 * Start the health check server if this module is run directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = startHealthServer();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down health check server');
    server.close(() => {
      logger.info('Health check server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down health check server');
    server.close(() => {
      logger.info('Health check server closed');
      process.exit(0);
    });
  });
}
