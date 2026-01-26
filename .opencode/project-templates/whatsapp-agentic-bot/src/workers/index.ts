/**
 * BullMQ Workers
 *
 * This module manages background job processing using BullMQ.
 * Workers handle incoming messages, scheduled tasks, and async operations.
 */

import { Worker, Job } from 'bullmq';
import { logger } from '../utils/logger.js';
import { redisConnection } from '../services/redis.js';
import { AgentRouter } from '../agents/index.js';

// Initialize agent router
const agentRouter = new AgentRouter();

/**
 * Process WhatsApp Message Worker
 * TODO: Implement your message processing logic
 */
const whatsappWorker = new Worker(
  'webhook-queue',
  async (job: Job) => {
    try {
      logger.info('📨 Processing WhatsApp message', { jobId: job.id, data: job.data });

      // TODO: Extract message and phone number from job data
      const message = job.data.message || '';
      const phoneNumber = job.data.phoneNumber || '';

      // TODO: Get conversation history from database
      const context = {
        phoneNumber,
        conversationHistory: [],
        metadata: {},
      };

      // Route message to appropriate agent
      const response = await agentRouter.route(message, context);

      // TODO: Send response via WhatsApp API
      logger.info('📤 Response generated', { response });

      return { success: true, response };
    } catch (error) {
      logger.error('❌ Error processing WhatsApp message', error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

whatsappWorker.on('completed', (job) => {
  logger.info(`✅ Job ${job.id} completed`);
});

whatsappWorker.on('failed', (job, err) => {
  logger.error(`❌ Job ${job?.id} failed`, err);
});

/**
 * Start all workers
 */
export async function startWorkers(): Promise<void> {
  logger.info('🔄 Starting workers...');
  // Workers are already started by BullMQ
  logger.info('✅ Workers started');
}
