// OPS: Review Agent - Request guest reviews after checkout
// Role: Gather feedback and encourage reviews

export async function sendReviewRequest(data: { bookingId: string }, db: any) {
  const startTime = Date.now();
  const { bookingId } = data;

  try {
    const booking = db.db?.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    const message = buildReviewMessage(booking);
    const channel = booking.guest_phone ? 'whatsapp' : 'email';
    const recipient = booking.guest_phone || booking.guest_email;

    if (!recipient) {
      return { success: false, reason: 'no_contact' };
    }

    const messageId = require('ulid').ulid();
    db.upsertMessage({
      id: messageId,
      booking_id: bookingId,
      type: 'review',
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

    const duration = Date.now() - startTime;
    console.log(`✅ Review request scheduled for ${booking.guest_name} (${duration}ms)`);

    db.logAgentAction({
      agent_name: 'review',
      booking_id: bookingId,
      action: 'send_review',
      input_data: { bookingId },
      output_data: { channel, recipient },
      duration_ms: duration,
    });

    return { success: true, messageId, duration };
  } catch (error: any) {
    console.error('❌ Error in review agent:', error.message);
    throw error;
  }
}

function buildReviewMessage(booking: any): string {
  return `⭐ We'd Love Your Feedback!

Hi ${booking.guest_name}!

Thank you for choosing to stay with us! We hope you had a wonderful experience.

Your feedback helps us improve and helps other travelers make informed decisions.

📝 Leave a Review:
• Google: [GOOGLE_REVIEW_LINK]
• TripAdvisor: [TRIPADVISOR_REVIEW_LINK]
• Booking.com: [BOOKING_REVIEW_LINK]

It only takes 2 minutes! 🙏

If there was anything we could have done better, please reply to let us know. We value your input and want to make every guest's stay perfect.

We hope to see you again soon! 👋`;
}
