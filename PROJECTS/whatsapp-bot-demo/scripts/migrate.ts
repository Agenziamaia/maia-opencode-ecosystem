// OPS: Database Migration Script - Create schema
// Role: Initialize database tables

import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_PATH || './data/hotel-bot.db';
const db = new Database(dbPath);

// Enable WAL mode
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

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
    type TEXT NOT NULL,
    direction TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'pending',
    channel TEXT NOT NULL,
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
    status TEXT DEFAULT 'pending',
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

console.log('🔨 Running database migration...');
db.exec(schema);
console.log('✅ Database migration complete!');
db.close();
