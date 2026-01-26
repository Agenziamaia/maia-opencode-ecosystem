// OPS: Links Agent - Send useful links and local recommendations
// Role: Provide guests with helpful resources

export async function sendLinksMessage(data: { bookingId: string }, db: any) {
  const startTime = Date.now();
  const { bookingId } = data;

  try {
    const booking = db.db?.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    const message = buildLinksMessage(booking);
    const channel = booking.guest_phone ? 'whatsapp' : 'email';
    const recipient = booking.guest_phone || booking.guest_email;

    if (!recipient) {
      return { success: false, reason: 'no_contact' };
    }

    const messageId = require('ulid').ulid();
    db.upsertMessage({
      id: messageId,
      booking_id: bookingId,
      type: 'links',
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
    console.log(`✅ Links message scheduled for ${booking.guest_name} (${duration}ms)`);

    db.logAgentAction({
      agent_name: 'links',
      booking_id: bookingId,
      action: 'send_links',
      input_data: { bookingId },
      output_data: { channel, recipient },
      duration_ms: duration,
    });

    return { success: true, messageId, duration };
  } catch (error: any) {
    console.error('❌ Error in links agent:', error.message);
    throw error;
  }
}

function buildLinksMessage(booking: any): string {
  return `🔗 Useful Links & Local Recommendations

Hi ${booking.guest_name}! Here are some helpful resources for your stay:

🏨 Hotel Information:
• Website: [HOTEL_WEBSITE]
• Amenities Guide: [AMENITIES_LINK]
• Room Service Menu: [ROOM_SERVICE_LINK]
• Guest Services: [SERVICES_LINK]

🗺️ Local Recommendations:
• Nearby Restaurants: [RESTAURANTS_LINK]
• Attractions & Tours: [ATTRACTIONS_LINK]
• Transportation Guide: [TRANSPORT_LINK]
• Weather: [WEATHER_LINK]

📱 Quick Access:
• Order Food: [FOOD_DELIVERY_LINK]
• Book Tours: [TOURS_LINK]
• Emergency Numbers: [EMERGENCY_LINK]

Need more recommendations? Just ask! Our concierge is happy to help. 😊`;
}
