// OPS: Key Agent - Send room key and access code
// Role: Deliver check-in instructions and key details

export async function sendKeyDelivery(data: { bookingId: string }, db: any) {
  const startTime = Date.now();
  const { bookingId } = data;

  try {
    const booking = db.db?.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    const message = buildKeyMessage(booking);
    const channel = booking.guest_phone ? 'whatsapp' : 'email';
    const recipient = booking.guest_phone || booking.guest_email;

    if (!recipient) {
      return { success: false, reason: 'no_contact' };
    }

    const messageId = require('ulid').ulid();
    db.upsertMessage({
      id: messageId,
      booking_id: bookingId,
      type: 'key',
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
    console.log(`✅ Key message scheduled for ${booking.guest_name} (${duration}ms)`);

    db.logAgentAction({
      agent_name: 'key',
      booking_id: bookingId,
      action: 'send_key',
      input_data: { bookingId },
      output_data: { channel, recipient },
      duration_ms: duration,
    });

    return { success: true, messageId, duration };
  } catch (error: any) {
    console.error('❌ Error in key agent:', error.message);
    throw error;
  }
}

function buildKeyMessage(booking: any): string {
  return `🔑 Your Room Key & Access Information

Hello ${booking.guest_name}!

Your room is ready! Here are your details:

🚪 Room: ${booking.room_number || 'TBD'}
📅 Check-in: ${formatDate(booking.check_in_date)}

Access Code: [KEY_CODE]
WiFi Network: [WIFI_NAME]
WiFi Password: [WIFI_PASSWORD]

📍 Address: [HOTEL_ADDRESS]
📞 Front Desk: +1 XXX XXX XXXX

Keep this information handy during your stay. If you have any issues, please contact the front desk immediately.

Enjoy your stay! 🏨`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
