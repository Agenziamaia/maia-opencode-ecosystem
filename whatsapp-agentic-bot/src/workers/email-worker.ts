// OPS: Email Worker - Process incoming emails
// Role: Parse emails, extract booking info, trigger actions

interface EmailData {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  date: string;
}

export async function processEmail(data: EmailData, db: any) {
  const { from, subject, text } = data;

  try {
    console.log(`📧 Processing email from: ${from}`);

    // 1. Check if email matches a guest
    const booking = db.db
      ?.prepare(
        `
      SELECT * FROM bookings
      WHERE guest_email = ?
      ORDER BY check_in_date DESC
      LIMIT 1
    `,
      )
      .get(from);

    if (!booking) {
      console.log(`⚠️ No booking found for email: ${from}`);
      return { success: false, reason: 'no_booking' };
    }

    console.log(`📧 Email from guest: ${booking.guest_name}`);

    // 2. Log incoming email
    db.upsertMessage({
      booking_id: booking.id,
      type: 'email',
      direction: 'inbound',
      content: text,
      status: 'received',
      channel: 'email',
    });

    // 3. Analyze email content
    const emailContent = `${subject}\n\n${text}`.toLowerCase();

    // Check for specific keywords/actions
    if (emailContent.includes('cancel') || emailContent.includes('cancellation')) {
      console.log('🚫 Cancellation request detected');
      // Could trigger cancellation workflow
      return { success: true, type: 'cancellation' };
    }

    if (emailContent.includes('early check') || emailContent.includes('late check')) {
      console.log('⏰ Check-in time change request detected');
      return { success: true, type: 'checkin_time_change' };
    }

    if (emailContent.includes('extension') || emailContent.includes('extend')) {
      console.log('📅 Extension request detected');
      return { success: true, type: 'extension' };
    }

    // Default: route to concierge agent
    const redis = require('../services/redis.js').getRedisClient();
    const { Queue } = require('bullmq');
    const queue = new Queue('concierge-qa', { connection: redis });

    await queue.add(
      'answer-question',
      {
        bookingId: booking.id,
        question: `${subject}\n\n${text}`,
        guestName: booking.guest_name,
        source: 'email',
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
    console.error('❌ Error processing email:', error.message);
    throw error;
  }
}
