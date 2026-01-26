// OPS: Database Service - SQLite with better-sqlite3
// Role: Local persistence for bookings, messages, jobs

import Database from 'better-sqlite3';
import { ulid } from 'ulid';
import path from 'path';
import fs from 'fs';

// Database schema
const schema = `
  -- Bookings table (synced from Smobu)
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    smobu_id TEXT UNIQUE NOT NULL,
    guest_name TEXT NOT NULL,
    guest_phone TEXT,
    guest_email TEXT,
    check_in_date TEXT NOT NULL,
    check_out_date TEXT NOT NULL,
    room_number TEXT,
    property_id TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Messages table (sent/received)
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'welcome', 'key', 'links', 'checkout', 'review', 'concierge'
    direction TEXT NOT NULL, -- 'outbound', 'inbound'
    content TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
    channel TEXT NOT NULL, -- 'whatsapp', 'email'
    scheduled_at TEXT,
    sent_at TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
  );

  -- Jobs table (queue tracking)
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    queue_name TEXT NOT NULL,
    job_data TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    priority INTEGER DEFAULT 0,
    scheduled_at TEXT,
    started_at TEXT,
    completed_at TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Agent logs table (for debugging)
  CREATE TABLE IF NOT EXISTS agent_logs (
    id TEXT PRIMARY KEY,
    agent_name TEXT NOT NULL,
    booking_id TEXT,
    action TEXT NOT NULL,
    input_data TEXT,
    output_data TEXT,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
  CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
  CREATE INDEX IF NOT EXISTS idx_messages_scheduled_at ON messages(scheduled_at);
  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_at ON jobs(scheduled_at);
`;

export function initDatabase(): any {
  const dbPath = process.env.DATABASE_PATH || './data/hotel-bot.db';

  // Open database connection
  let db: any = new Database(dbPath);

  // Ensure data directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Open database connection
  db = new Database(dbPath);

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create schema
  db.exec(schema);

  return {
    db,
    close: () => {
      if (db) {
        db.close();
        db = null;
      }
    },
    migrate: () => {
      if (db) {
        db.exec(schema);
      }
    },
    // Booking operations
    upsertBooking: (booking: any) => {
      if (!db) throw new Error('Database not initialized');
      const stmt = db.prepare(`
        INSERT INTO bookings (id, smobu_id, guest_name, guest_phone, guest_email, check_in_date, check_out_date, room_number, property_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(smobu_id) DO UPDATE SET
          guest_name = excluded.guest_name,
          guest_phone = excluded.guest_phone,
          guest_email = excluded.guest_email,
          check_in_date = excluded.check_in_date,
          check_out_date = excluded.check_out_date,
          room_number = excluded.room_number,
          property_id = excluded.property_id,
          status = excluded.status,
          updated_at = CURRENT_TIMESTAMP
      `);
      stmt.run(
        ulid(),
        booking.smobu_id,
        booking.guest_name,
        booking.guest_phone,
        booking.guest_email,
        booking.check_in_date,
        booking.check_out_date,
        booking.room_number,
        booking.property_id,
        booking.status,
      );
    },
    getBookingBySmobuId: (smobuId: string) => {
      if (!db) throw new Error('Database not initialized');
      const stmt = db.prepare('SELECT * FROM bookings WHERE smobu_id = ?');
      return stmt.get(smobuId);
    },
    getUpcomingCheckIns: (hours: number) => {
      if (!db) throw new Error('Database not initialized');
      const stmt = db.prepare(`
        SELECT * FROM bookings
        WHERE status = 'confirmed'
        AND datetime(check_in_date) BETWEEN datetime('now') AND datetime('now', '+' || ? || ' hours')
        ORDER BY check_in_date ASC
      `);
      return stmt.all(hours);
    },
    getUpcomingCheckOuts: (hours: number) => {
      if (!db) throw new Error('Database not initialized');
      const stmt = db.prepare(`
        SELECT * FROM bookings
        WHERE status = 'confirmed'
        AND datetime(check_out_date) BETWEEN datetime('now') AND datetime('now', '+' || ? || ' hours')
        ORDER BY check_out_date ASC
      `);
      return stmt.all(hours);
    },
    // Message operations
    upsertMessage: (message: any) => {
      if (!db) throw new Error('Database not initialized');
      const stmt = db.prepare(`
        INSERT INTO messages (id, booking_id, type, direction, content, status, channel, scheduled_at, sent_at, error_message, retry_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          sent_at = excluded.sent_at,
          error_message = excluded.error_message,
          retry_count = excluded.retry_count
      `);
      stmt.run(
        message.id || ulid(),
        message.booking_id,
        message.type,
        message.direction,
        message.content,
        message.status,
        message.channel,
        message.scheduled_at,
        message.sent_at,
        message.error_message,
        message.retry_count || 0,
      );
    },
    getPendingMessages: () => {
      if (!db) throw new Error('Database not initialized');
      const stmt = db.prepare(`
        SELECT m.*, b.guest_phone, b.guest_email
        FROM messages m
        JOIN bookings b ON m.booking_id = b.id
        WHERE m.status = 'pending'
        AND (m.scheduled_at IS NULL OR datetime(m.scheduled_at) <= datetime('now'))
        ORDER BY m.created_at ASC
      `);
      return stmt.all();
    },
    // Job operations
    upsertJob: (job: any) => {
      if (!db) throw new Error('Database not initialized');
      const stmt = db.prepare(`
        INSERT INTO jobs (id, queue_name, job_data, status, priority, scheduled_at, started_at, completed_at, error_message, retry_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        job.id || ulid(),
        job.queue_name,
        JSON.stringify(job.job_data),
        job.status,
        job.priority || 0,
        job.scheduled_at,
        job.started_at,
        job.completed_at,
        job.error_message,
        job.retry_count || 0,
      );
    },
    // Agent log operations
    logAgentAction: (log: any) => {
      if (!db) throw new Error('Database not initialized');
      const stmt = db.prepare(`
        INSERT INTO agent_logs (id, agent_name, booking_id, action, input_data, output_data, error_message, duration_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        ulid(),
        log.agent_name,
        log.booking_id,
        log.action,
        JSON.stringify(log.input_data),
        JSON.stringify(log.output_data),
        log.error_message,
        log.duration_ms,
      );
    },
  };
}
