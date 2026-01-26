// OPS: Gateway Server - Express.js webhook receiver
// Role: Receive webhooks from Spoki, parse emails, enqueue jobs

import express from 'express';
import { Queue } from 'bullmq';
import crypto from 'crypto';
import { verifySpokiWebhook, enqueueWebhookJob } from './webhooks.js';

let app: express.Express | null = null;
let server: any = null;

export async function startGateway(db: any, redis: any) {
  app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Middleware
  app.use(express.json());
  app.use(express.raw({ type: 'application/json' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        redis: redis.isConnected(),
        database: !!db.db,
      },
    });
  });

  // Readiness check (for K8s/Docker health probes)
  app.get('/ready', (req, res) => {
    const ready = redis.isConnected() && !!db.db;
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not-ready',
      services: {
        redis: redis.isConnected(),
        database: !!db.db,
      },
    });
  });

  // Spoki webhook endpoint
  app.post('/webhooks/spoki', async (req, res) => {
    const startTime = Date.now();

    try {
      // Verify webhook signature
      const signature = req.headers['x-spoki-signature'] as string;
      const payload = req.body;

      if (!verifySpokiWebhook(payload, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Extract message data
      const messageData = {
        from: payload.from,
        to: payload.to,
        message: payload.message,
        messageType: payload.messageType || 'text',
        timestamp: payload.timestamp || new Date().toISOString(),
      };

      // Enqueue job for processing
      const queue = new Queue('whatsapp-messages', { connection: redis.client });
      await queue.add('process-incoming', messageData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Spoki webhook processed in ${duration}ms`);

      res.status(200).json({
        status: 'accepted',
        messageId: payload.id,
      });
    } catch (error: any) {
      console.error('❌ Error processing Spoki webhook:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Email webhook (optional - if using SendGrid/Mailgun)
  app.post('/webhooks/email', async (req, res) => {
    try {
      const queue = new Queue('email-processing', { connection: redis.client });
      await queue.add('process-email', req.body, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });

      res.status(200).json({ status: 'accepted' });
    } catch (error: any) {
      console.error('❌ Error processing email webhook:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Smobu webhook (if available)
  app.post('/webhooks/smobu', async (req, res) => {
    try {
      const queue = new Queue('smobu-sync', { connection: redis.client });
      await queue.add('sync-booking', req.body, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });

      res.status(200).json({ status: 'accepted' });
    } catch (error: any) {
      console.error('❌ Error processing Smobu webhook:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Manual trigger for testing
  app.post('/test/send-message', async (req, res) => {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({ error: 'Missing phone or message' });
      }

      const queue = new Queue('whatsapp-messages', { connection: redis.client });
      await queue.add(
        'send-manual',
        { phone, message },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );

      res.status(200).json({ status: 'queued' });
    } catch (error: any) {
      console.error('❌ Error sending test message:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Start server
  server = app.listen(PORT, () => {
    console.log(`🌐 Gateway server listening on port ${PORT}`);
    console.log(`📡 Webhook endpoints:`);
    console.log(`   - POST /webhooks/spoki`);
    console.log(`   - POST /webhooks/email`);
    console.log(`   - POST /webhooks/smobu`);
    console.log(`   - GET  /health`);
    console.log(`   - GET  /ready`);
  });

  return {
    app,
    close: () => {
      if (server) {
        return new Promise((resolve) => {
          server.close(() => {
            console.log('🔌 Gateway server closed');
            resolve(undefined);
          });
        });
      }
    },
  };
}
