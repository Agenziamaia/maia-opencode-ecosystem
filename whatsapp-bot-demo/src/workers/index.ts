// OPS: Worker Processes - BullMQ job processors
// Role: Process queued jobs (messages, emails, sync tasks)

import { Worker, Job } from 'bullmq';
import { processWhatsAppMessage } from '../workers/whatsapp-worker.js';
import { processIncomingMessage } from '../workers/incoming-worker.js';
import { processEmail } from '../workers/email-worker.js';
import { syncSmobuBooking } from '../workers/smobu-worker.js';
import { runConciergeAgent } from '../agents/concierge-agent.js';
import { sendWelcomeMessage } from '../agents/welcome-agent.js';
import { sendKeyDelivery } from '../agents/key-agent.js';
import { sendLinksMessage } from '../agents/links-agent.js';
import { sendCheckoutReminder } from '../agents/checkout-agent.js';
import { sendReviewRequest } from '../agents/review-agent.js';

let workers: Worker[] = [];

export async function startWorkers(db: any, redis: any) {
  const connection = { connection: redis.client };
  const concurrency = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);

  // WhatsApp message worker
  const whatsappWorker = new Worker(
    'whatsapp-messages',
    async (job: Job) => {
      console.log(`📱 Processing WhatsApp job: ${job.name}`);
      switch (job.name) {
        case 'process-incoming':
          await processIncomingMessage(job.data, db);
          break;
        case 'send-message':
          await processWhatsAppMessage(job.data, db);
          break;
        case 'send-manual':
          await processWhatsAppMessage(job.data, db);
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    },
    {
      ...connection,
      concurrency,
    },
  );

  whatsappWorker.on('completed', (job) => {
    console.log(`✅ WhatsApp job completed: ${job.id}`);
  });

  whatsappWorker.on('failed', (job, err) => {
    console.error(`❌ WhatsApp job failed: ${job?.id}`, err.message);
  });

  workers.push(whatsappWorker);

  // Email processing worker
  const emailWorker = new Worker(
    'email-processing',
    async (job: Job) => {
      console.log(`📧 Processing email job: ${job.name}`);
      await processEmail(job.data, db);
    },
    {
      ...connection,
      concurrency: Math.max(1, Math.floor(concurrency / 2)),
    },
  );

  emailWorker.on('completed', (job) => {
    console.log(`✅ Email job completed: ${job.id}`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`❌ Email job failed: ${job?.id}`, err.message);
  });

  workers.push(emailWorker);

  // Smobu sync worker
  const smobuWorker = new Worker(
    'smobu-sync',
    async (job: Job) => {
      console.log(`🔄 Processing Smobu sync job: ${job.name}`);
      await syncSmobuBooking(job.data, db);
    },
    {
      ...connection,
      concurrency: 1, // Single worker for sync operations
    },
  );

  smobuWorker.on('completed', (job) => {
    console.log(`✅ Smobu sync job completed: ${job.id}`);
  });

  smobuWorker.on('failed', (job, err) => {
    console.error(`❌ Smobu sync job failed: ${job?.id}`, err.message);
  });

  workers.push(smobuWorker);

  // Agent workers (welcome, key, links, checkout, review)
  const agentWorker = new Worker(
    'scheduled-tasks',
    async (job: Job) => {
      console.log(`🤖 Processing agent task: ${job.name}`);
      switch (job.name) {
        case 'welcome-guest':
          await sendWelcomeMessage(job.data, db);
          break;
        case 'send-key':
          await sendKeyDelivery(job.data, db);
          break;
        case 'send-links':
          await sendLinksMessage(job.data, db);
          break;
        case 'checkout-reminder':
          await sendCheckoutReminder(job.data, db);
          break;
        case 'review-request':
          await sendReviewRequest(job.data, db);
          break;
        default:
          throw new Error(`Unknown agent task: ${job.name}`);
      }
    },
    {
      ...connection,
      concurrency: Math.max(1, Math.floor(concurrency / 2)),
    },
  );

  agentWorker.on('completed', (job) => {
    console.log(`✅ Agent task completed: ${job.id}`);
  });

  agentWorker.on('failed', (job, err) => {
    console.error(`❌ Agent task failed: ${job?.id}`, err.message);
  });

  workers.push(agentWorker);

  // Concierge Q&A worker
  const conciergeWorker = new Worker(
    'concierge-qa',
    async (job: Job) => {
      console.log(`💬 Processing concierge Q&A: ${job.id}`);
      const response = await runConciergeAgent(job.data, db);
      return response;
    },
    {
      ...connection,
      concurrency: 2, // Limited due to OpenAI API costs
    },
  );

  conciergeWorker.on('completed', (job) => {
    console.log(`✅ Concierge Q&A completed: ${job.id}`);
  });

  conciergeWorker.on('failed', (job, err) => {
    console.error(`❌ Concierge Q&A failed: ${job?.id}`, err.message);
  });

  workers.push(conciergeWorker);

  console.log(`⚙️ Started ${workers.length} worker processes`);

  return {
    close: async () => {
      console.log('🛑 Stopping all workers...');
      await Promise.all(workers.map((w) => w.close()));
      workers = [];
      console.log('✅ All workers stopped');
    },
  };
}
