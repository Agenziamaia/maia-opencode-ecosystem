// OPS: Concierge Agent - LLM-powered Q&A for guests
// Role: Answer guest questions using OpenAI GPT-4

import OpenAI from 'openai';
import { getRedisClient } from '../services/redis.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ConciergeQuestion {
  bookingId: string;
  question: string;
  guestName: string;
  source?: 'whatsapp' | 'email';
}

export async function runConciergeAgent(data: ConciergeQuestion, db: any) {
  const startTime = Date.now();
  const { bookingId, question, guestName, source = 'whatsapp' } = data;

  try {
    // 1. Get booking context
    const booking = db.db?.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // 2. Get recent message history (last 10 messages)
    const history = db.db
      ?.prepare(
        `
      SELECT * FROM messages
      WHERE booking_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `,
      )
      .all(bookingId)
      .reverse();

    // 3. Build system prompt with hotel context
    const systemPrompt = buildSystemPrompt(booking, history);

    // 4. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer =
      response.choices[0]?.message?.content ||
      "I'm sorry, I couldn't understand your question. Please contact the front desk directly.";

    // 5. Log agent action
    db.logAgentAction({
      agent_name: 'concierge',
      booking_id: bookingId,
      action: 'answer_question',
      input_data: { question, source },
      output_data: { answer },
      duration_ms: Date.now() - startTime,
    });

    // 6. Send response to guest via WhatsApp
    const redis = getRedisClient();
    const { Queue } = require('bullmq');
    const queue = new Queue('whatsapp-messages', { connection: redis });

    // Create message record
    const messageId = require('ulid').ulid();
    db.upsertMessage({
      id: messageId,
      booking_id: bookingId,
      type: 'concierge',
      direction: 'outbound',
      content: answer,
      status: 'pending',
      channel: 'whatsapp',
    });

    // Queue for sending
    await queue.add(
      'send-message',
      {
        messageId,
        bookingId,
        phone: booking.guest_phone,
        content: answer,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    const duration = Date.now() - startTime;
    console.log(`💬 Concierge answered question for ${guestName} in ${duration}ms`);

    return {
      success: true,
      answer,
      duration,
      tokensUsed: response.usage?.total_tokens || 0,
    };
  } catch (error: any) {
    console.error('❌ Error in concierge agent:', error.message);

    // Log error
    db.logAgentAction({
      agent_name: 'concierge',
      booking_id: bookingId,
      action: 'answer_question',
      input_data: { question },
      error_message: error.message,
      duration_ms: Date.now() - startTime,
    });

    throw error;
  }
}

/**
 * Build system prompt with hotel context and conversation history
 */
function buildSystemPrompt(booking: any, history: any[]): string {
  const today = new Date().toISOString().split('T')[0];

  let prompt = `You are a helpful hotel concierge for a boutique hotel. Your role is to assist guests with questions about their stay, the property, local recommendations, and services.

Current Guest: ${booking.guest_name}
Check-in: ${booking.check_in_date}
Check-out: ${booking.check_out_date}
Room: ${booking.room_number || 'Not assigned'}
Today's Date: ${today}

Hotel Policies:
- Check-in time: 3:00 PM
- Check-out time: 11:00 AM
- Late check-out may be available upon request (subject to availability)
- Early check-in may be available (subject to availability)
- Free WiFi throughout the property
- No smoking in rooms
- Pets not allowed

If you don't know the answer to a question, politely suggest the guest contact the front desk directly.

Keep your responses concise, friendly, and helpful. Use a warm, professional tone.

`;

  // Add recent conversation context if available
  if (history && history.length > 0) {
    prompt += `\nRecent conversation:\n`;
    for (const msg of history.slice(-5)) {
      const direction = msg.direction === 'inbound' ? 'Guest' : 'Hotel';
      prompt += `${direction}: ${msg.content}\n`;
    }
  }

  return prompt;
}
