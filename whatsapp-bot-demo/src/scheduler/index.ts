// OPS: Scheduler - Agenda-based job scheduling
// Role: Schedule messages based on booking dates/times

import { Queue } from 'bullmq';
import cron from 'node-cron';

let queues: Queue[] = [];
let cronJobs: any[] = [];

export async function startScheduler(db: any, redis: any) {
  const connection = { connection: redis.client };

  // Create queues for different task types
  const scheduledQueue = new Queue('scheduled-tasks', connection);
  const whatsappQueue = new Queue('whatsapp-messages', connection);
  const emailQueue = new Queue('email-processing', connection);
  const smobuQueue = new Queue('smobu-sync', connection);

  queues = [scheduledQueue, whatsappQueue, emailQueue, smobuQueue];

  // CRON JOBS

  // 1. Check for upcoming check-ins every 15 minutes
  const checkInJob = cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Checking for upcoming check-ins...');
    await scheduleCheckIns(db, scheduledQueue);
  });

  cronJobs.push(checkInJob);

  // 2. Check for upcoming check-outs every 15 minutes
  const checkOutJob = cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Checking for upcoming check-outs...');
    await scheduleCheckOuts(db, scheduledQueue);
  });

  cronJobs.push(checkOutJob);

  // 3. Sync bookings from Smobu every hour
  const syncJob = cron.schedule('0 * * * *', async () => {
    console.log('⏰ Syncing bookings from Smobu...');
    await syncBookings(db, smobuQueue);
  });

  cronJobs.push(syncJob);

  // 4. Process pending messages every 5 minutes
  const pendingJob = cron.schedule('*/5 * * * *', async () => {
    console.log('⏰ Processing pending messages...');
    await processPendingMessages(db, whatsappQueue);
  });

  cronJobs.push(pendingJob);

  // 5. Health check every minute
  const healthJob = cron.schedule('* * * * *', async () => {
    await healthCheck(db, redis);
  });

  cronJobs.push(healthJob);

  console.log('⏰ Scheduler started with 5 cron jobs');
  console.log('   - Check-in scanner (every 15 min)');
  console.log('   - Check-out scanner (every 15 min)');
  console.log('   - Smobu sync (every hour)');
  console.log('   - Pending messages (every 5 min)');
  console.log('   - Health check (every min)');

  return {
    close: async () => {
      console.log('🛑 Stopping scheduler...');
      cronJobs.forEach((job) => job.stop());
      await Promise.all(queues.map((q) => q.close()));
      queues = [];
      console.log('✅ Scheduler stopped');
    },
  };
}

// Schedule welcome messages for upcoming check-ins
async function scheduleCheckIns(db: any, queue: Queue) {
  try {
    const welcomeDelay = parseInt(process.env.WELCOME_MESSAGE_DELAY_HOURS || '24', 10);
    const upcoming = db.getUpcomingCheckIns(welcomeDelay);

    for (const booking of upcoming) {
      // Check if welcome message already scheduled/sent
      const existing = db.db
        ?.prepare(
          `
        SELECT id FROM messages
        WHERE booking_id = ? AND type = 'welcome'
      `,
        )
        .get(booking.id);

      if (!existing) {
        await queue.add(
          'welcome-guest',
          { bookingId: booking.id },
          {
            delay: 0, // Process immediately
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
          },
        );

        console.log(`📝 Scheduled welcome for: ${booking.guest_name}`);
      }
    }
  } catch (error: any) {
    console.error('❌ Error scheduling check-ins:', error.message);
  }
}

// Schedule checkout reminders
async function scheduleCheckOuts(db: any, queue: Queue) {
  try {
    const checkoutDelay = parseInt(process.env.CHECKOUT_REMINDER_HOURS || '24', 10);
    const upcoming = db.getUpcomingCheckOuts(checkoutDelay);

    for (const booking of upcoming) {
      const existing = db.db
        ?.prepare(
          `
        SELECT id FROM messages
        WHERE booking_id = ? AND type = 'checkout'
      `,
        )
        .get(booking.id);

      if (!existing) {
        await queue.add(
          'checkout-reminder',
          { bookingId: booking.id },
          {
            delay: 0,
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
          },
        );

        console.log(`📝 Scheduled checkout reminder for: ${booking.guest_name}`);
      }
    }
  } catch (error: any) {
    console.error('❌ Error scheduling check-outs:', error.message);
  }
}

// Sync bookings from Smobu API
async function syncBookings(_db: any, queue: Queue) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 days ago
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days ahead

    await queue.add(
      'sync-bookings',
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  } catch (error: any) {
    console.error('❌ Error scheduling booking sync:', error.message);
  }
}

// Process pending messages
async function processPendingMessages(db: any, queue: Queue) {
  try {
    const pending = db.getPendingMessages();

    for (const message of pending) {
      // Check if job already queued
      const jobId = `msg-${message.id}`;

      await queue.add(
        'send-message',
        {
          messageId: message.id,
          bookingId: message.booking_id,
          phone: message.guest_phone,
          email: message.guest_email,
          content: message.content,
          channel: message.channel,
        },
        {
          jobId, // Idempotent: same jobId won't create duplicate
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      );

      console.log(`📤 Queued pending message: ${message.type}`);
    }
  } catch (error: any) {
    console.error('❌ Error processing pending messages:', error.message);
  }
}

// Health check
async function healthCheck(db: any, redis: any) {
  const healthLogger = require('../utils/logger.js').initHealthLogger();

  const health = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      redis: redis.isConnected(),
      database: !!db.db,
    },
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024,
    },
  };

  healthLogger.info(JSON.stringify(health));

  // Log errors to main logger if services are down
  if (!health.services.redis || !health.services.database) {
    console.error('⚠️ Health check failed:', health.services);
  }
}
