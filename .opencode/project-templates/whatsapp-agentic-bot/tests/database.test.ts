/**
 * Test: Database Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, conversationRepository, initializeDatabase } from '../src/services/database.js';
import { unlinkSync, existsSync } from 'fs';
import path from 'path';

const testDbPath = path.join(process.cwd(), 'data', 'test-bot.db');

describe('Database Service', () => {
  beforeEach(() => {
    // Use test database
    process.env.DB_PATH = testDbPath;
    initializeDatabase();
  });

  afterEach(() => {
    // Clean up test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  it('should create a conversation', () => {
    const conversationId = conversationRepository.create('+1234567890');

    expect(conversationId).toBeTruthy();
    expect(typeof conversationId).toBe('string');
  });

  it('should find a conversation by phone number', () => {
    const phoneNumber = '+1234567890';
    conversationRepository.create(phoneNumber);

    const conversation = conversationRepository.findByPhone(phoneNumber);

    expect(conversation).toBeTruthy();
    expect(conversation?.phone_number).toBe(phoneNumber);
  });

  it('should add messages to a conversation', () => {
    const conversationId = conversationRepository.create('+1234567890');

    const messageId = conversationRepository.addMessage(conversationId, 'user', 'Test message');

    expect(messageId).toBeTruthy();

    const history = conversationRepository.getHistory(conversationId);
    expect(history).toHaveLength(1);
    expect(history[0].content).toBe('Test message');
  });
});
