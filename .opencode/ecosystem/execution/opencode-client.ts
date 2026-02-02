/**
 * OpenCode Client Wrapper
 *
 * Provides access to OpenCode SDK for agent execution
 */

import { createOpencodeClient, type Session } from '@opencode-ai/sdk';

let clientInstance: ReturnType<typeof createOpencodeClient> | null = null;

/**
 * Get or create the OpenCode client
 */
export function getOpenCodeClient() {
  if (!clientInstance) {
    try {
      clientInstance = createOpencodeClient({
        directory: process.cwd(),
        baseUrl: process.env.OPENCODE_API_URL || 'http://localhost:3000',
      });
    } catch (e) {
      console.warn('OpenCode client not available:', e);
      return null;
    }
  }
  return clientInstance;
}

/**
 * Create and execute a session
 */
export async function executeAgentSession(params: {
  agentId?: string;
  prompt: string;
  timeout?: number;
}): Promise<{ sessionId: string; result: string; status: string }> {
  const client = getOpenCodeClient();
  if (!client) {
    throw new Error('OpenCode client not available');
  }

  // Create session
  const createResult = await client.session.create({
    agentId: params.agentId,
  });

  if (createResult.error) {
    throw new Error(`Failed to create session: ${createResult.error.message}`);
  }

  const sessionId = createResult.data.sessionId;

  // Send prompt
  const promptResult = await client.session.prompt({
    sessionId,
    prompt: params.prompt,
  });

  if (promptResult.error) {
    throw new Error(`Failed to send prompt: ${promptResult.error.message}`);
  }

  // Wait for completion (with timeout)
  const startTime = Date.now();
  const timeout = params.timeout || 300000; // 5 minutes default

  while (Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second

    const statusResult = await client.session.status({ sessionId });

    if (!statusResult.error && statusResult.data.session.status === 'idle') {
      // Session is complete
      const messagesResult = await client.session.messages({
        sessionId,
        limit: 1,
      });

      if (!messagesResult.error && messagesResult.data.messages.length > 0) {
        const lastMessage = messagesResult.data.messages[0];
        return {
          sessionId,
          result: lastMessage.content || '',
          status: 'completed',
        };
      }
    }
  }

  // Timeout
  return {
    sessionId,
    result: '',
    status: 'timeout',
  };
}

/**
 * List active sessions
 */
export async function listSessions() {
  const client = getOpenCodeClient();
  if (!client) {
    return [];
  }

  const result = await client.session.list();
  if (result.error) {
    return [];
  }

  return result.data.sessions || [];
}

/**
 * Get session status
 */
export async function getSessionStatus(sessionId: string) {
  const client = getOpenCodeClient();
  if (!client) {
    return null;
  }

  const result = await client.session.status({ sessionId });
  if (result.error) {
    return null;
  }

  return result.data.session;
}
