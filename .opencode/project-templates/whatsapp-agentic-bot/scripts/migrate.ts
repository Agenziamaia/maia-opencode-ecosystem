/**
 * Database Migration Script
 *
 * This script initializes the database schema.
 * Run with: npm run db:migrate
 */

import { initializeDatabase } from '../src/services/database.js';
import { logger } from '../src/utils/logger.js';

async function migrate() {
  try {
    logger.info('🗄️  Running database migration...');

    initializeDatabase();

    logger.info('✅ Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database migration failed', error);
    process.exit(1);
  }
}

migrate();
