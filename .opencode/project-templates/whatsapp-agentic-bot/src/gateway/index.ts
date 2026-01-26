/**
 * Express Gateway
 *
 * This module provides the HTTP gateway for receiving webhooks
 * from WhatsApp API or other external services.
 */

import express, { Request, Response } from 'express';
import { Queue } from 'bullmq';
import { logger } from '../utils/logger.js';
import { redisConnection } from '../services/redis.js';

// TODO: Configure your webhook queue
export const webhookQueue = new Queue('webhook-queue', {
  connection: redisConnection,
});

const app = express();
app.use(express.json());

/**
 * Health Check Endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

/**
 * Webhook Endpoint for WhatsApp
 * TODO: Configure webhook signature verification
 */
app.post('/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    logger.info('📨 Received WhatsApp webhook', { body: req.body });

    // TODO: Verify webhook signature (security)
    // TODO: Validate payload structure

    // Enqueue job for processing
    await webhookQueue.add('process-whatsapp-message', req.body, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    logger.error('❌ Error processing webhook', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Start the gateway server
 */
export async function startGateway(): Promise<void> {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    logger.info(`🚀 Gateway server listening on port ${PORT}`);
  });
}
