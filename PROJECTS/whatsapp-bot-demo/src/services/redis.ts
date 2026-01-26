// OPS: Redis Service - Connection pool for BullMQ
// Role: Provide Redis connection for job queues

import Redis from 'ioredis';

let redis: Redis | null = null;

export async function initRedis() {
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // Required for BullMQ
    lazyConnect: false,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

  redis = new Redis(redisConfig);

  // Event listeners
  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redis.on('close', () => {
    console.log('🔌 Redis connection closed');
  });

  // Test connection
  await redis.ping();

  return {
    client: redis,
    close: async () => {
      if (redis) {
        await redis.quit();
        redis = null;
      }
    },
    isConnected: () => {
      return redis !== null && redis.status === 'ready';
    },
  };
}

export function getRedisClient() {
  if (!redis) {
    throw new Error('Redis not initialized. Call initRedis() first.');
  }
  return redis;
}
