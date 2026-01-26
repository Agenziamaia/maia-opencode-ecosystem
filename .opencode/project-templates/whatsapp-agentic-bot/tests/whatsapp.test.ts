/**
 * Test: WhatsApp Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendTextMessage } from '../src/services/whatsapp.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('WhatsApp Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a text message successfully', async () => {
    const mockResponse = {
      data: {
        messages: [{ id: 'test-message-id' }],
      },
    };

    vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

    const result = await sendTextMessage({
      to: '+1234567890',
      text: 'Test message',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('test-message-id');
  });

  it('should handle errors when sending messages', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('API Error'));

    const result = await sendTextMessage({
      to: '+1234567890',
      text: 'Test message',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('API Error');
  });
});
