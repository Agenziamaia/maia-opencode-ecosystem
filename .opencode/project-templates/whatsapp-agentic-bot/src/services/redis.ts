/**
 * Redis Connection
 *
 * This module provides a Redis connection for BullMQ queues and caching.
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  logger.info('✅ Redis connected');
});

redisConnection.on('error', (error) => {
  logger.error('❌ Redis connection error', error);
});

redisConnection.on('close', () => {
  logger.warn('⚠️ Redis connection closed');
});
