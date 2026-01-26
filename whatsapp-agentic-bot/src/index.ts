// OPS: Main Entry Point - WhatsApp Agentic Bot System
// Role: Bootstrap all services and manage lifecycle

import { initLogger } from './utils/logger.js';
import { initDatabase } from './services/database.js';
import { initRedis } from './services/redis.js';
import { startGateway } from './gateway/index.js';
import { startWorkers } from './workers/index.js';
import { startScheduler } from './scheduler/index.js';
import { setupGracefulShutdown } from './utils/shutdown.js';

// Global state
const services: {
  logger?: ReturnType<typeof initLogger>;
  db?: ReturnType<typeof initDatabase>;
  redis?: Awaited<ReturnType<typeof initRedis>>;
} = {};

async function main() {
  // 1. Initialize logger first
  services.logger = initLogger();
  const logger = services.logger;

  logger.info('🚀 Starting WhatsApp Agentic Bot System...');
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  try {
    // 2. Initialize Redis (required for BullMQ)
    logger.info('📦 Initializing Redis...');
    services.redis = await initRedis();
    logger.info('✅ Redis connected');

    // 3. Initialize SQLite database
    logger.info('💾 Initializing SQLite database...');
    services.db = initDatabase();
    services.db.migrate();
    logger.info('✅ Database initialized');

    // 4. Start Gateway (webhook server)
    logger.info('🌐 Starting Gateway Server...');
    await startGateway(services.db, services.redis);
    logger.info('✅ Gateway running on port 3000');

    // 5. Start Workers (job processors)
    logger.info('⚙️ Starting Worker Processes...');
    await startWorkers(services.db, services.redis);
    logger.info('✅ Workers started');

    // 6. Start Scheduler (cron-like jobs)
    logger.info('⏰ Starting Job Scheduler...');
    await startScheduler(services.db, services.redis);
    logger.info('✅ Scheduler started');

    // 7. Setup graceful shutdown handlers
    setupGracefulShutdown(services);

    logger.info('🎉 All services started successfully!');
    logger.info('📊 System is now ready to process messages');
    logger.info('📝 Check logs/health.log for health status');
  } catch (error) {
    const logger = services.logger;
    if (logger) {
      logger.error('❌ Fatal error during startup', { error });
    } else {
      console.error('Fatal error during startup:', error);
    }
    process.exit(1);
  }
}

// Start the application
main();
