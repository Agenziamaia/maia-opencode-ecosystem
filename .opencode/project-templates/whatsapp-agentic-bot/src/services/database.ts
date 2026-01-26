/**
 * SQLite Database
 *
 * This module provides a SQLite database connection for persistent storage.
 */

import Database from 'better-sqlite3';
import { ulid } from 'ulid';
import path from 'path';
import { logger } from '../utils/logger.js';

// TODO: Configure your database path
const dbPath = path.join(process.cwd(), 'data', 'bot.db');

export const db = new Database(dbPath);

// Initialize database schema
export function initializeDatabase() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        phone_number TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id)
      );

      CREATE TABLE IF NOT EXISTS scheduled_messages (
        id TEXT PRIMARY KEY,
        phone_number TEXT NOT NULL,
        message TEXT NOT NULL,
        scheduled_at DATETIME NOT NULL,
        sent_at DATETIME,
        status TEXT DEFAULT 'pending'
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_scheduled_messages_status ON scheduled_messages(status);
    `);

    logger.info('✅ Database initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize database', error);
    throw error;
  }
}

// TODO: Implement your database helper functions
export const conversationRepository = {
  create(phoneNumber: string) {
    const id = ulid();
    const stmt = db.prepare('INSERT INTO conversations (id, phone_number) VALUES (?, ?)');
    stmt.run(id, phoneNumber);
    return id;
  },

  findByPhone(phoneNumber: string) {
    const stmt = db.prepare(
      'SELECT * FROM conversations WHERE phone_number = ? ORDER BY created_at DESC LIMIT 1',
    );
    return stmt.get(phoneNumber);
  },

  getHistory(conversationId: string, limit = 10) {
    const stmt = db.prepare(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?',
    );
    return stmt.all(conversationId, limit).reverse();
  },

  addMessage(conversationId: string, role: string, content: string) {
    const id = ulid();
    const stmt = db.prepare(
      'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
    );
    stmt.run(id, conversationId, role, content);

    // Update conversation timestamp
    db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      conversationId,
    );

    return id;
  },
};
