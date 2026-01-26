/**
 * Service Mesh Gateway - Enhanced Version for Hybrid Architecture
 *
 * This extends the existing gateway with:
 * - Circuit breaker pattern for resilience
 * - Command queue for Trigger.dev integration
 * - Event buffering for offline scenarios
 * - Heartbeat mechanism for failover detection
 * - Rate limiting and enhanced logging
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { CircuitBreaker, CircuitBreakerOpenError } from 'opossum';
import { Queue } from 'bullmq';
import winston from 'winston';
import crypto from 'crypto';
import Redis from 'ioredis';

// Types
interface Command {
  id?: string;
  action: string;
  type?: string;
  payload?: any;
  timestamp?: number;
  priority?: number;
}

interface Event {
  type: string;
  source: string;
  payload?: any;
  timestamp?: number;
}

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  services: {
    redis: boolean;
    queues: {
      waiting: number;
      active: number;
      failed: number;
    };
    circuitBreaker: {
      state: string;
      stats: any;
    };
  };
}

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: 'logs/service-mesh.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Initialize Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

// Initialize BullMQ queues
const commandQueue = new Queue('mesh-commands', { connection: redis });
const eventQueue = new Queue('mesh-events', { connection: redis });

// Express app
const app = express();
const GATEWAY_PORT = parseInt(process.env.GATEWAY_PORT || '3001');

// ==================== MIDDLEWARE ====================

app.use(express.json());

// Rate limiting: 100 req/min per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

app.use(limiter);

// Request logging
app.use((req: any, res: any, next: any) => {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  logger.info('request_in', {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  const originalSend = res.send;
  res.send = function (data: any) {
    logger.info('request_out', {
      requestId,
      statusCode: res.statusCode,
      contentLength: data?.length || 0,
    });
    return originalSend.call(this, data);
  };

  next();
});

// Authentication middleware (optional, for Trigger.dev)
function authenticate(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey || apiKey !== process.env.GATEWAY_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// Apply auth to mesh API routes
app.use('/api/mesh', authenticate);

// ==================== CIRCUIT BREAKER ====================

const circuitBreakerOptions = {
  timeout: 10000, // 10s timeout
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30s reset
  rollingCountTimeout: 10000, // 10s rolling window
  rollingCountBuckets: 10,
};

const commandBreaker = new CircuitBreaker(executeCommand, circuitBreakerOptions);

commandBreaker.on('open', () => {
  logger.warn('CIRCUIT_BREAKER_OPEN', { service: 'command-execution' });
});

commandBreaker.on('halfOpen', () => {
  logger.info('CIRCUIT_BREAKER_HALF_OPEN', { service: 'command-execution' });
});

commandBreaker.on('close', () => {
  logger.info('CIRCUIT_BREAKER_CLOSED', { service: 'command-execution' });
});

// ==================== ENDPOINTS ====================

/**
 * Health check
 * Used by Cloudflare Tunnel and monitoring
 */
app.get('/health', async (req: any, res: any) => {
  try {
    const redisStatus = await redis.ping();
    const waitingCount = await commandQueue.getWaitingCount();
    const activeCount = await commandQueue.getActiveCount();
    const failedCount = await commandQueue.getFailedCount();

    const health: HealthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        redis: redisStatus === 'PONG',
        queues: {
          waiting: waitingCount,
          active: activeCount,
          failed: failedCount,
        },
        circuitBreaker: {
          state: commandBreaker.opened ? 'OPEN' : 'CLOSED',
          stats: commandBreaker.stats,
        },
      },
    };

    const isHealthy = health.services.redis;

    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error: any) {
    logger.error('health_check_failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      error: error.message,
    });
  }
});

/**
 * Heartbeat endpoint
 * Used by VPS to detect Mac availability
 */
app.post('/heartbeat', async (req: any, res: any) => {
  try {
    await redis.set('mac:heartbeat', Date.now().toString());
    await redis.expire('mac:heartbeat', 120); // Expire after 2m

    logger.debug('heartbeat_received', {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });

    res.json({ status: 'ok', timestamp: Date.now() });
  } catch (error: any) {
    logger.error('heartbeat_failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Command endpoint
 * Trigger.dev uses this to send commands to local bot
 */
app.post('/api/mesh/commands', async (req: any, res: any) => {
  try {
    const command: Command = req.body;
    const requestId = req.requestId;

    logger.info('command_received', {
      requestId,
      action: command.action,
      type: command.type,
    });

    const result = await commandBreaker.fire(command);

    res.json({
      success: true,
      data: result,
      requestId,
    });
  } catch (error: any) {
    const requestId = req.requestId;

    if (error instanceof CircuitBreakerOpenError) {
      logger.warn('command_rejected_circuit_open', { requestId });
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        retryAfter: 30,
        requestId,
      });
    }

    logger.error('command_failed', { requestId, error: error.message });
    res.status(500).json({
      error: error.message,
      requestId,
    });
  }
});

/**
 * Batch commands endpoint
 * Send multiple commands in one request
 */
app.post('/api/mesh/commands/batch', async (req: any, res: any) => {
  try {
    const commands: Command[] = req.body.commands || [];
    const requestId = req.requestId;

    logger.info('batch_commands_received', {
      requestId,
      count: commands.length,
    });

    const results: any[] = [];

    for (const command of commands) {
      try {
        const result = await commandBreaker.fire(command);
        results.push({ success: true, data: result });
      } catch (error: any) {
        logger.error('batch_command_failed', {
          requestId,
          action: command.action,
          error: error.message,
        });
        results.push({ success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      results,
      requestId,
    });
  } catch (error: any) {
    const requestId = req.requestId;
    logger.error('batch_commands_failed', { requestId, error: error.message });
    res.status(500).json({ error: error.message, requestId });
  }
});

/**
 * Event endpoint
 * Report events from local bot to Trigger.dev
 * These are buffered and sent to cloud
 */
app.post('/api/mesh/events', async (req: any, res: any) => {
  try {
    const event: Event = req.body;
    const requestId = req.requestId;

    logger.info('event_received', {
      requestId,
      type: event.type,
      source: event.source,
    });

    await eventQueue.add('process-event', {
      ...event,
      timestamp: Date.now(),
      requestId,
    });

    res.json({
      success: true,
      requestId,
    });
  } catch (error: any) {
    const requestId = req.requestId;
    logger.error('event_failed', { requestId, error: error.message });
    res.status(500).json({ error: error.message, requestId });
  }
});

/**
 * Guest query endpoint
 * Fetch guest information for Trigger.dev workflows
 */
app.post('/api/mesh/guests/query', async (req: any, res: any) => {
  try {
    const query = req.body;
    const requestId = req.requestId;

    logger.info('guest_query', {
      requestId,
      query,
    });

    const result = await executeCommand({
      action: 'QUERY_GUESTS',
      query,
    });

    res.json({
      success: true,
      data: result,
      requestId,
    });
  } catch (error: any) {
    const requestId = req.requestId;
    logger.error('guest_query_failed', { requestId, error: error.message });
    res.status(500).json({ error: error.message, requestId });
  }
});

/**
 * Booking sync endpoint
 * Sync booking data from Smobu to local DB
 */
app.post('/api/mesh/sync/bookings', async (req: any, res: any) => {
  try {
    const bookings = req.body.bookings || [];
    const requestId = req.requestId;

    logger.info('booking_sync', {
      requestId,
      count: bookings.length,
    });

    const results = await Promise.all(
      bookings.map((booking: any) =>
        executeCommand({
          action: 'SYNC_BOOKING',
          booking,
        }),
      ),
    );

    res.json({
      success: true,
      synced: results.length,
      requestId,
    });
  } catch (error: any) {
    const requestId = req.requestId;
    logger.error('booking_sync_failed', { requestId, error: error.message });
    res.status(500).json({ error: error.message, requestId });
  }
});

/**
 * Manual queue sync endpoint
 * Trigger sync with backup VPS
 */
app.post('/api/mesh/sync/queue', async (req: any, res: any) => {
  try {
    const requestId = req.requestId;

    logger.info('manual_queue_sync', { requestId });

    const waiting = await commandQueue.getWaiting();
    const failed = await commandQueue.getFailed();

    const backupUrl = process.env.BACKUP_VPS_URL;

    if (backupUrl) {
      await fetch(`${backupUrl}/api/mesh/sync/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waiting, failed }),
      });
    }

    res.json({
      success: true,
      synced: {
        waiting: waiting.length,
        failed: failed.length,
      },
      requestId,
    });
  } catch (error: any) {
    const requestId = req.requestId;
    logger.error('queue_sync_failed', { requestId, error: error.message });
    res.status(500).json({ error: error.message, requestId });
  }
});

/**
 * Statistics endpoint
 * Get mesh statistics
 */
app.get('/api/mesh/stats', async (req: any, res: any) => {
  try {
    const stats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      queues: {
        commands: {
          waiting: await commandQueue.getWaitingCount(),
          active: await commandQueue.getActiveCount(),
          failed: await commandQueue.getFailedCount(),
        },
        events: {
          waiting: await eventQueue.getWaitingCount(),
          active: await eventQueue.getActiveCount(),
        },
      },
      circuitBreaker: commandBreaker.stats,
    };

    res.json(stats);
  } catch (error: any) {
    logger.error('stats_failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Execute command by adding to BullMQ queue
 */
async function executeCommand(command: Command) {
  const job = await commandQueue.add('process-command', {
    ...command,
    createdAt: Date.now(),
  });

  const result = await job.waitUntilFinished(
    { connection: redis },
    30000, // 30s timeout
  );

  return result;
}

// ==================== GRACEFUL SHUTDOWN ====================

async function shutdown() {
  logger.info('gateway_shutdown_initiated');

  await commandQueue.close();
  await eventQueue.close();
  await redis.quit();

  logger.info('gateway_shutdown_complete');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// ==================== START SERVER ====================

if (require.main === module) {
  app.listen(GATEWAY_PORT, () => {
    logger.info('service_mesh_gateway_started', {
      port: GATEWAY_PORT,
      environment: process.env.NODE_ENV || 'development',
    });

    // Periodic heartbeat
    setInterval(async () => {
      try {
        await redis.set('mac:heartbeat', Date.now().toString());
        await redis.expire('mac:heartbeat', 120);
      } catch (error: any) {
        logger.error('heartbeat_failed', { error: error.message });
      }
    }, 30000);
  });
}

export { app, logger };
