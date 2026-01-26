// OPS: Database Seed Script - Create sample booking data
// Role: Populate database with demo data for testing

import Database from 'better-sqlite3';
import { ulid } from 'ulid';

const dbPath = process.env.DATABASE_PATH || './data/hotel-bot.db';
const db = new Database(dbPath);

// Seed bookings
const bookings = [
  {
    id: ulid(),
    smobu_id: 'DEMO001',
    guest_name: 'Alice Johnson',
    guest_phone: '+1234567890',
    guest_email: 'alice@example.com',
    check_in_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    check_out_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    room_number: '101',
    property_id: 'PROP001',
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: ulid(),
    smobu_id: 'DEMO002',
    guest_name: 'Bob Smith',
    guest_phone: '+1987654321',
    guest_email: 'bob@example.com',
    check_in_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    check_out_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    room_number: '102',
    property_id: 'PROP001',
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Seed messages
const messages = [
  {
    id: ulid(),
    booking_id: bookings[0].id,
    type: 'welcome',
    direction: 'outbound',
    content: 'Welcome to our hotel!',
    status: 'pending',
    channel: 'whatsapp',
    scheduled_at: null,
    sent_at: null,
    error_message: null,
    retry_count: 0,
    created_at: new Date().toISOString(),
  },
];

// Insert seed data
console.log('🌱 Seeding database...');

try {
  // Insert bookings
  const insertBooking = db.prepare(`
    INSERT OR REPLACE INTO bookings (id, smobu_id, guest_name, guest_phone, guest_email, check_in_date, check_out_date, room_number, property_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const booking of bookings) {
    insertBooking.run(
      booking.id,
      booking.smobu_id,
      booking.guest_name,
      booking.guest_phone,
      booking.guest_email,
      booking.check_in_date,
      booking.check_out_date,
      booking.room_number,
      booking.property_id,
      booking.status,
      booking.created_at,
      booking.updated_at,
    );
  }
  console.log(`✅ Inserted ${bookings.length} bookings`);

  // Insert messages
  const insertMessage = db.prepare(`
    INSERT INTO messages (id, booking_id, type, direction, content, status, channel, scheduled_at, sent_at, error_message, retry_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const message of messages) {
    insertMessage.run(
      message.id,
      message.booking_id,
      message.type,
      message.direction,
      message.content,
      message.status,
      message.channel,
      message.scheduled_at,
      message.sent_at,
      message.error_message,
      message.retry_count,
      message.created_at,
    );
  }
  console.log(`✅ Inserted ${messages.length} messages`);

  console.log('✅ Database seeded successfully!');
} catch (error: any) {
  console.error('❌ Error seeding database:', error.message);
  process.exit(1);
} finally {
  db.close();
}
