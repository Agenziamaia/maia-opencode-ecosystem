/**
 * Job Scheduler
 *
 * This module manages scheduled jobs using BullMQ.
 * Handles cron-like scheduling for messages, reminders, etc.
 */

import { Queue } from 'bullmq';
import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import { redisConnection } from '../services/redis.js';

const scheduledQueue = new Queue('scheduled-queue', {
  connection: redisConnection,
});

/**
 * Example: Send morning greetings at 9 AM
 * TODO: Implement your scheduled tasks
 */
cron.schedule('0 9 * * *', async () => {
  logger.info('⏰ Running morning greeting job');

  try {
    // TODO: Get all active users from database
    // TODO: Queue greeting messages for each user
    await scheduledQueue.add(
      'send-morning-greeting',
      { message: 'Good morning! How can I help you today?' },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  } catch (error) {
    logger.error('❌ Error scheduling morning greetings', error);
  }
});

/**
 * Example: Clean up old conversations daily at 3 AM
 * TODO: Implement cleanup tasks
 */
cron.schedule('0 3 * * *', async () => {
  logger.info('🧹 Running cleanup job');

  try {
    // TODO: Delete conversation history older than X days
    // TODO: Clean up dead letter queue
    logger.info('✅ Cleanup completed');
  } catch (error) {
    logger.error('❌ Error during cleanup', error);
  }
});

/**
 * Start scheduler
 */
export async function startScheduler(): Promise<void> {
  logger.info('⏰ Starting scheduler...');
  // Cron jobs are already started
  logger.info('✅ Scheduler started');
}
