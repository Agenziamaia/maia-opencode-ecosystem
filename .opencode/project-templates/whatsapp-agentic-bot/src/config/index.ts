/**
 * Application Configuration
 *
 * This module provides centralized configuration management.
 * All environment variables are validated and typed.
 */

import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // Database
  DB_PATH: z.string().default('./data/bot.db'),

  // WhatsApp API
  WHATSAPP_API_KEY: z.string().min(1, 'WHATSAPP_API_KEY is required'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1, 'WHATSAPP_PHONE_NUMBER_ID is required'),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().min(1, 'WHATSAPP_WEBHOOK_VERIFY_TOKEN is required'),
  WHATSAPP_WEBHOOK_SECRET: z.string().min(1, 'WHATSAPP_WEBHOOK_SECRET is required'),

  // AI/LLM
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  ANTHROPIC_API_KEY: z.string().optional(),

  // External Services
  PMS_API_KEY: z.string().optional(),
  PMS_API_URL: z.string().url().optional(),

  // Launchd
  LAUNCHD_SERVICE_NAME: z.string().default('com.hotelbot.whatsapp-agentic-bot'),
  LAUNCHD_WORKING_DIRECTORY: z.string().optional(),
  LAUNCHD_LOG_PATH: z.string().optional(),
});

// Validate and export environment variables
export const env = envSchema.parse(process.env);

// Derived configuration
export const config = {
  server: {
    port: parseInt(env.PORT, 10),
    env: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  },

  redis: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT, 10),
    password: env.REDIS_PASSWORD,
  },

  database: {
    path: env.DB_PATH,
  },

  whatsapp: {
    apiKey: env.WHATSAPP_API_KEY,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    webhookVerifyToken: env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    webhookSecret: env.WHATSAPP_WEBHOOK_SECRET,
  },

  ai: {
    openaiApiKey: env.OPENAI_API_KEY,
    anthropicApiKey: env.ANTHROPIC_API_KEY,
  },

  pms: {
    apiKey: env.PMS_API_KEY,
    apiUrl: env.PMS_API_URL,
  },

  launchd: {
    serviceName: env.LAUNCHD_SERVICE_NAME,
    workingDirectory: env.LAUNCHD_WORKING_DIRECTORY,
    logPath: env.LAUNCHD_LOG_PATH,
  },
} as const;

export type Config = typeof config;
