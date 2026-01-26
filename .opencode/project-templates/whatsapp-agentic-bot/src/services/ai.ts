/**
 * AI/LLM Service
 *
 * This module provides an interface to AI/LLM providers.
 * Supports OpenAI and Anthropic Claude.
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.ai.openaiApiKey,
});

interface AIResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generate completion using OpenAI GPT
 */
export async function generateCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<AIResponse> {
  try {
    const model = options?.model || 'gpt-4-turbo-preview';

    logger.info('🤖 Generating AI completion', { model, messageCount: messages.length });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 500,
    });

    const response = {
      text: completion.choices[0]?.message?.content || '',
      model: completion.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    };

    logger.info('✅ AI completion generated', {
      textLength: response.text.length,
      totalTokens: response.usage.totalTokens,
    });

    return response;
  } catch (error) {
    logger.error('❌ Error generating AI completion', error);
    throw new Error(
      `AI completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate a quick response for FAQ
 */
export async function generateFAQResponse(question: string, context: string): Promise<AIResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a helpful customer service assistant. Provide concise, friendly answers to customer questions based on the provided context.

Context:
${context}

Guidelines:
- Keep responses under 150 words
- Be friendly and professional
- If unsure, say you'll check and get back to them`,
    },
    {
      role: 'user',
      content: question,
    },
  ];

  return generateCompletion(messages, {
    temperature: 0.5,
    maxTokens: 300,
  });
}

/**
 * Generate a welcome message
 */
export async function generateWelcomeMessage(customerName?: string): Promise<AIResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are a friendly customer service assistant. Generate a warm, welcoming message for new customers.',
    },
    {
      role: 'user',
      content: customerName
        ? `Generate a welcome message for ${customerName}`
        : 'Generate a welcome message for a new customer',
    },
  ];

  return generateCompletion(messages, {
    temperature: 0.8,
    maxTokens: 200,
  });
}

/**
 * Generate a personalized message based on conversation
 */
export async function generatePersonalizedResponse(
  conversationHistory: ChatMessage[],
  newMessage: string
): Promise<AIResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You are a helpful customer service assistant. Provide friendly, helpful responses to customer inquiries.',
    },
    ...conversationHistory,
    {
      role: 'user',
      content: newMessage,
    },
  ];

  return generateCompletion(messages, {
    temperature: 0.7,
    maxTokens: 400,
  });
}
