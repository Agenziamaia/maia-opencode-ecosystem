/**
 * Database Reset Script
 *
 * This script resets the database by deleting and recreating it.
 * WARNING: This will delete all data!
 * Run with: npm run db:reset
 */

import { unlinkSync, existsSync } from 'fs';
import { logger } from '../src/utils/logger.js';
import { initializeDatabase } from '../src/services/database.js';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'bot.db');

async function reset() {
  try {
    logger.warn('⚠️  Resetting database - this will delete all data!');

    // Delete existing database file
    if (existsSync(dbPath)) {
      unlinkSync(dbPath);
      logger.info('🗑️  Deleted existing database');
    }

    // Reinitialize the database
    initializeDatabase();

    logger.info('✅ Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database reset failed', error);
    process.exit(1);
  }
}

reset();
