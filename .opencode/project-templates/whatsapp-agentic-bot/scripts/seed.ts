/**
 * Database Seed Script
 *
 * This script seeds the database with initial test data.
 * Run with: npm run db:seed
 */

import { conversationRepository } from '../src/services/database.js';
import { logger } from '../src/utils/logger.js';

async function seed() {
  try {
    logger.info('🌱 Seeding database with test data...');

    // Create a test conversation
    const conversationId = conversationRepository.create('+1234567890');
    logger.info(`Created test conversation: ${conversationId}`);

    // Add some test messages
    conversationRepository.addMessage(conversationId, 'user', 'Hello, how are you?');
    conversationRepository.addMessage(
      conversationId,
      'assistant',
      "I'm doing well, thank you! How can I help you today?"
    );

    logger.info('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed', error);
    process.exit(1);
  }
}

seed();
