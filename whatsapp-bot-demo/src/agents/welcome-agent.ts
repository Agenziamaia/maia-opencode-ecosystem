// OPS: Welcome Agent - Send welcome message to guests
// Role: Greet guests and provide check-in information

export async function sendWelcomeMessage(data: { bookingId: string }, db: any) {
  const startTime = Date.now();
  const { bookingId } = data;

  try {
    // Get booking details
    const booking = db.db?.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Build welcome message
    const message = buildWelcomeMessage(booking);

    // Check if WhatsApp or email is preferred
    const channel = booking.guest_phone ? 'whatsapp' : 'email';
    const recipient = booking.guest_phone || booking.guest_email;

    if (!recipient) {
      console.warn(`⚠️ No contact info for booking ${bookingId}`);
      return { success: false, reason: 'no_contact' };
    }

    // Create message record
    const messageId = require('ulid').ulid();
    db.upsertMessage({
      id: messageId,
      booking_id: bookingId,
      type: 'welcome',
      direction: 'outbound',
      content: message,
      status: 'pending',
      channel,
    });

    // Queue for sending
    const redis = require('../services/redis.js').getRedisClient();
    const { Queue } = require('bullmq');
    const queue = new Queue('whatsapp-messages', { connection: redis });

    await queue.add(
      'send-message',
      {
        messageId,
        bookingId,
        phone: booking.guest_phone,
        email: booking.guest_email,
        content: message,
        channel,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    // Schedule follow-up messages
    await scheduleFollowUpMessages(bookingId, db, redis);

    const duration = Date.now() - startTime;
    console.log(`✅ Welcome message scheduled for ${booking.guest_name} (${duration}ms)`);

    // Log agent action
    db.logAgentAction({
      agent_name: 'welcome',
      booking_id: bookingId,
      action: 'send_welcome',
      input_data: { bookingId },
      output_data: { channel, recipient },
      duration_ms: duration,
    });

    return {
      success: true,
      messageId,
      channel,
      duration,
    };
  } catch (error: any) {
    console.error('❌ Error in welcome agent:', error.message);
    throw error;
  }
}

function buildWelcomeMessage(booking: any): string {
  return `🎉 Welcome to our hotel, ${booking.guest_name}!

We're excited to host you. Here's your check-in information:

📅 Check-in: ${formatDate(booking.check_in_date)}
📅 Check-out: ${formatDate(booking.check_out_date)}
🚪 Room: ${booking.room_number || 'Will be assigned at check-in'}

Check-in time is 3:00 PM. If you need early check-in, please let us know!

We'll send you:
- Your room key and access code on check-in day
- WiFi login details
- Local recommendations
- Contact information

Feel free to reply if you have any questions before your arrival! 🏨`;
}

async function scheduleFollowUpMessages(bookingId: string, _db: any, redis: any) {
  const { Queue } = require('bullmq');
  const queue = new Queue('scheduled-tasks', { connection: redis });

  const keyDelay = parseInt(process.env.KEY_DELIVERY_DELAY_HOURS || '48', 10) * 60 * 60 * 1000;

  // Schedule key delivery
  await queue.add(
    'send-key',
    { bookingId },
    {
      delay: keyDelay,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    },
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
