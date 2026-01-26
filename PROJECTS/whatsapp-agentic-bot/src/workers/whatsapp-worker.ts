// OPS: WhatsApp Worker - Send messages via Spoki API
// Role: Deliver outbound WhatsApp messages with retry logic

import axios from 'axios';
import pRetry from 'p-retry';

interface WhatsAppMessage {
  phone: string;
  message: string;
  messageId?: string;
}

export async function processWhatsAppMessage(data: WhatsAppMessage, db: any) {
  const { phone, message, messageId } = data;
  const startTime = Date.now();

  try {
    // Send via Spoki API
    const response = await pRetry(
      async () => {
        const result = await axios.post(
          `${process.env.SPOKI_API_BASE_URL}/messages`,
          {
            to: phone,
            message: message,
            type: 'text',
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.SPOKI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        );

        if (result.status !== 200) {
          throw new Error(`Spoki API returned ${result.status}`);
        }

        return result.data;
      },
      {
        retries: 3,
        onFailedAttempt: (error) => {
          console.log(`📱 Retry ${error.attemptNumber}/3: ${error.message}`);
        },
      },
    );

    // Update message status in database
    if (messageId) {
      db.upsertMessage({
        id: messageId,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ WhatsApp message sent to ${phone} in ${duration}ms`);

    return {
      success: true,
      messageId: response.id,
      duration,
    };
  } catch (error: any) {
    console.error(`❌ Failed to send WhatsApp to ${phone}:`, error.message);

    // Update message status with error
    if (messageId) {
      db.upsertMessage({
        id: messageId,
        status: 'failed',
        error_message: error.message,
        retry_count: 3,
      });
    }

    throw error;
  }
}

/**
 * Send WhatsApp message with template
 */
export async function sendWhatsAppTemplate(
  phone: string,
  templateName: string,
  params: Record<string, string>,
) {
  try {
    const response = await axios.post(
      `${process.env.SPOKI_API_BASE_URL}/messages/template`,
      {
        to: phone,
        templateName,
        params,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SPOKI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to send template:', error.message);
    throw error;
  }
}
