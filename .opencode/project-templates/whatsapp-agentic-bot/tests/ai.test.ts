/**
 * Test: AI Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateCompletion } from '../src/services/ai.js';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai');

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a completion successfully', async () => {
    const mockCompletion = {
      choices: [{ message: { content: 'Test response' } }],
      model: 'gpt-4',
      usage: {
        prompt_tokens: 10,
        completion_tokens: 5,
        total_tokens: 15,
      },
    };

    const mockChat = {
      completions: {
        create: vi.fn().mockResolvedValueOnce(mockCompletion),
      },
    };

    vi.mocked(OpenAI).mockImplementationOnce(() => mockChat as any);

    const result = await generateCompletion([{ role: 'user', content: 'Test prompt' }]);

    expect(result.text).toBe('Test response');
    expect(result.model).toBe('gpt-4');
    expect(result.usage?.totalTokens).toBe(15);
  });

  it('should handle errors when generating completions', async () => {
    const mockChat = {
      completions: {
        create: vi.fn().mockRejectedValueOnce(new Error('AI Error')),
      },
    };

    vi.mocked(OpenAI).mockImplementationOnce(() => mockChat as any);

    await expect(generateCompletion([{ role: 'user', content: 'Test prompt' }])).rejects.toThrow(
      'AI completion failed'
    );
  });
});
