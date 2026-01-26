/**
 * WhatsApp API Service
 *
 * This module provides an interface to the WhatsApp Business API.
 * Handles sending messages, webhooks, and media uploads.
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

interface WhatsAppMessage {
  to: string;
  text: string;
  type?: 'text' | 'template';
  templateName?: string;
  templateLanguage?: string;
}

interface WhatsAppMedia {
  to: string;
  mediaUrl: string;
  caption?: string;
  mediaType: 'image' | 'video' | 'document' | 'audio';
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a text message via WhatsApp
 */
export async function sendTextMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
  try {
    logger.info('📤 Sending WhatsApp message', { to: message.to });

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: message.to,
        type: message.type || 'text',
        text: {
          body: message.text,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('✅ WhatsApp message sent successfully', {
      messageId: response.data.messages?.[0]?.id,
    });

    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
    };
  } catch (error) {
    logger.error('❌ Error sending WhatsApp message', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a media message via WhatsApp
 */
export async function sendMediaMessage(media: WhatsAppMedia): Promise<WhatsAppResponse> {
  try {
    logger.info('📤 Sending WhatsApp media', { to: media.to, type: media.mediaType });

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${config.whatsapp.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: media.to,
        type: media.mediaType,
        [media.mediaType]: {
          link: media.mediaUrl,
          caption: media.caption,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.whatsapp.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logger.info('✅ WhatsApp media sent successfully', {
      messageId: response.data.messages?.[0]?.id,
    });

    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
    };
  } catch (error) {
    logger.error('❌ Error sending WhatsApp media', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify webhook signature (security)
 */
export function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  // TODO: Implement HMAC-SHA256 signature verification
  // This is a placeholder - implement proper verification
  return true;
}

/**
 * Download media from WhatsApp
 */
export async function downloadMedia(mediaId: string): Promise<Buffer | null> {
  try {
    logger.info('📥 Downloading media', { mediaId });

    const response = await axios.get(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${config.whatsapp.apiKey}`,
      },
      responseType: 'arraybuffer',
    });

    logger.info('✅ Media downloaded successfully');
    return Buffer.from(response.data);
  } catch (error) {
    logger.error('❌ Error downloading media', error);
    return null;
  }
}
