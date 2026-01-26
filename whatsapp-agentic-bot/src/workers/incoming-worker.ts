// OPS: Incoming Worker - Process incoming WhatsApp messages
// Role: Handle guest replies, route to concierge agent, update state

import { Queue } from 'bullmq';
import { getRedisClient } from '../services/redis.js';

interface IncomingMessage {
  from: string;
  to: string;
  message: string;
  messageType?: string;
  timestamp: string;
}

export async function processIncomingMessage(data: IncomingMessage, db: any) {
  const { from, message } = data;

  try {
    // 1. Check if this number matches any booking
    const booking = db.db
      ?.prepare(
        `
      SELECT * FROM bookings
      WHERE guest_phone = ? OR guest_phone LIKE '%' || ?
      ORDER BY check_in_date DESC
      LIMIT 1
    `,
      )
      .get(from, from);

    if (!booking) {
      console.log(`⚠️ No booking found for phone: ${from}`);
      // Could send a generic message asking to confirm identity
      return { success: false, reason: 'no_booking' };
    }

    console.log(`📩 Incoming message from guest: ${booking.guest_name}`);

    // 2. Log incoming message
    db.upsertMessage({
      booking_id: booking.id,
      type: 'concierge',
      direction: 'inbound',
      content: message,
      status: 'received',
      channel: 'whatsapp',
    });

    // 3. Check if this is a simple acknowledgment or a question
    const isAcknowledgment = /^(ok|thanks|thank you|got it|understood|yes|si|ok|👍)$/i.test(
      message.trim(),
    );

    if (isAcknowledgment) {
      // Just acknowledge, no need for concierge agent
      return { success: true, type: 'acknowledgment' };
    }

    // 4. Route to concierge agent for Q&A
    const redis = getRedisClient();
    const queue = new Queue('concierge-qa', { connection: redis });

    await queue.add(
      'answer-question',
      {
        bookingId: booking.id,
        question: message,
        guestName: booking.guest_name,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    return {
      success: true,
      type: 'question',
      bookingId: booking.id,
    };
  } catch (error: any) {
    console.error('❌ Error processing incoming message:', error.message);
    throw error;
  }
}
