/**
 * WhatsApp Agentic Bot - Main Entry Point
 *
 * This is the main entry point for the bot application.
 * It initializes all services and starts the system.
 *
 * TODO: Implement this based on your specific needs
 */

import { logger } from './utils/logger.js';
import { startGateway } from './gateway/index.js';
import { startWorkers } from './workers/index.js';
import { startScheduler } from './scheduler/index.js';

async function main() {
  logger.info('🤖 WhatsApp Agentic Bot - Starting...');

  try {
    // Start all services
    await Promise.all([startGateway(), startWorkers(), startScheduler()]);

    logger.info('✅ All services started successfully');
  } catch (error) {
    logger.error('❌ Failed to start services', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...');
  // TODO: Implement graceful shutdown logic
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...');
  // TODO: Implement graceful shutdown logic
  process.exit(0);
});

main();
