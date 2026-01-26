// OPS: Checkout Agent - Send checkout reminders and instructions
// Role: Remind guests about checkout and gather feedback

export async function sendCheckoutReminder(data: { bookingId: string }, db: any) {
  const startTime = Date.now();
  const { bookingId } = data;

  try {
    const booking = db.db?.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    const message = buildCheckoutMessage(booking);
    const channel = booking.guest_phone ? 'whatsapp' : 'email';
    const recipient = booking.guest_phone || booking.guest_email;

    if (!recipient) {
      return { success: false, reason: 'no_contact' };
    }

    const messageId = require('ulid').ulid();
    db.upsertMessage({
      id: messageId,
      booking_id: bookingId,
      type: 'checkout',
      direction: 'outbound',
      content: message,
      status: 'pending',
      channel,
    });

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

    // Schedule review request
    const reviewDelay =
      parseInt(process.env.REVIEW_REQUEST_DELAY_DAYS || '1', 10) * 24 * 60 * 60 * 1000;
    await queue.add(
      'review-request',
      { bookingId },
      {
        delay: reviewDelay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Checkout reminder scheduled for ${booking.guest_name} (${duration}ms)`);

    db.logAgentAction({
      agent_name: 'checkout',
      booking_id: bookingId,
      action: 'send_checkout',
      input_data: { bookingId },
      output_data: { channel, recipient },
      duration_ms: duration,
    });

    return { success: true, messageId, duration };
  } catch (error: any) {
    console.error('❌ Error in checkout agent:', error.message);
    throw error;
  }
}

function buildCheckoutMessage(booking: any): string {
  return `👋 Checkout Reminder - Thank You for Staying!

Hi ${booking.guest_name}!

It's almost time to check out. Here are the details:

📅 Check-out Date: ${formatDate(booking.check_out_date)}
⏰ Check-out Time: 11:00 AM

Checkout Instructions:
• Leave your key in the room or at the front desk
• Ensure all belongings are packed
• Close all windows and lock the door
• Leave linens and towels in the bathroom

We hope you enjoyed your stay! We'd love to hear about your experience.

Leave a review: [REVIEW_LINK]

Safe travels! 🛫`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
