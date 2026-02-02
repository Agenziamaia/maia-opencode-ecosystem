/**
 * Session Tools - Actual Agent Execution
 *
 * These tools now ACTUALLY SPAWN and execute agents using the OpenCode SDK.
 */

import { tool } from "@opencode-ai/plugin";
import { getMaiaDaemon, type DispatchOptions } from '../execution/maia-daemon.js';
import { executeAgentSession, getSessionStatus, listSessions } from '../execution/opencode-client.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// --- CONFIG LOADING ---

interface AgentConfig {
  id: string;
  description: string;
  model: string;
  tools: Record<string, boolean>;
}

function loadAgentConfig(agentId: string): AgentConfig | null {
  const configPath = join(process.cwd(), 'opencode.json');
  if (!existsSync(configPath)) return null;

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    const agentDef = config.agent[agentId];

    if (!agentDef) return null;

    return {
      id: agentId,
      description: agentDef.description,
      model: agentDef.model,
      tools: agentDef.tools || {}
    };
  } catch (e) {
    console.error("Failed to load opencode.json", e);
    return null;
  }
}

// --- CORE SESSION TOOL ---

export const session = tool({
  description: "ACTUALLY EXECUTE a task in another agent session (real execution, not mock).",
  args: {
    agent: tool.schema.string().describe("The ID of the agent (e.g., 'researcher', 'coder')."),
    text: tool.schema.string().describe("The instruction/prompt for the agent."),
    timeout: tool.schema.number().optional().describe("Timeout in milliseconds (default: 300000 = 5 minutes).")
  },
  async execute(args) {
    // 1. Validate Agent
    const config = loadAgentConfig(args.agent);
    if (!config) {
      return `❌ Agent '${args.agent}' not found in opencode.json. Available agents: maia, coder, researcher, ops, reviewer, frontend, etc.`;
    }

    try {
      // 2. Check Constitution first
      const daemon = getMaiaDaemon();
      const dispatchOptions: DispatchOptions = {
        preferredAgent: args.agent,
        requestingAgent: 'maia', // The current agent
      };

      // Constitution check (will throw if blocked)
      try {
        await daemon.dispatch(args.text, dispatchOptions);
      } catch (e: any) {
        if (e.message.includes('Constitution blocked')) {
          return `⚖️ CONSTITUTION BLOCKED: ${e.message}\n\nTask not executed.`;
        }
        // Other errors, continue with execution
      }

      // 3. ACTUALLY EXECUTE the agent session
      const result = await executeAgentSession({
        agentId: args.agent,
        prompt: args.text,
        timeout: args.timeout || 300000,
      });

      if (result.status === 'completed') {
        return `✅ Agent @${args.agent} completed task\n\nSession: ${result.sessionId}\n\nResult:\n${result.result}`;
      } else if (result.status === 'timeout') {
        return `⏱️ Agent @${args.agent} timed out after ${args.timeout || 300}ms\n\nSession: ${result.sessionId}`;
      } else {
        return `⚠️ Agent @${args.agent} returned status: ${result.status}\n\nSession: ${result.sessionId}`;
      }

    } catch (e: any) {
      return `❌ Failed to execute agent @${args.agent}: ${e.message}`;
    }
  }
});

// --- BACKGROUND TASK ---

export const background_task = tool({
  description: "Start a long-running background task in another agent.",
  args: {
    agent: tool.schema.string().describe("Agent ID"),
    task: tool.schema.string().describe("Task description"),
    timeout: tool.schema.number().optional().describe("Timeout in milliseconds.")
  },
  async execute(args) {
    const config = loadAgentConfig(args.agent);
    if (!config) {
      return `❌ Agent '${args.agent}' not found.`;
    }

    try {
      // For background tasks, use promptAsync which returns immediately
      const client = (await import('../execution/opencode-client.js')).getOpenCodeClient();
      if (!client) {
        return `❌ OpenCode client not available`;
      }

      const createResult = await client.session.create({
        agentId: args.agent,
      });

      if (createResult.error) {
        return `❌ Failed to create session: ${createResult.error.message}`;
      }

      const sessionId = createResult.data.sessionId;

      // Start async execution
      const promptResult = await client.session.promptAsync({
        sessionId,
        prompt: args.task,
      });

      if (promptResult.error) {
        return `❌ Failed to start task: ${promptResult.error.message}`;
      }

      return `🔄 Background task started\nAgent: @${args.agent}\nSession: ${sessionId}\nTask: ${args.task}\n\nUse session_status tool to check progress.`;

    } catch (e: any) {
      return `❌ Failed to start background task: ${e.message}`;
    }
  }
});

// --- SESSION STATUS ---

export const session_status = tool({
  description: "Check the status of a running session.",
  args: {
    session_id: tool.schema.string().describe("The session ID to check."),
  },
  async execute(args) {
    try {
      const status = await getSessionStatus(args.session_id);

      if (!status) {
        return `❌ Session ${args.session_id} not found.`;
      }

      return `Session Status: ${args.session_id}\n` +
        `Status: ${status.status}\n` +
        `Agent: ${status.agentId || 'default'}\n` +
        `Messages: ${status.messageCount || 0}\n` +
        `Started: ${status.startedAt || 'Unknown'}`;
    } catch (e: any) {
      return `❌ Failed to get session status: ${e.message}`;
    }
  }
});

// --- LIST SESSIONS ---

export const list_sessions = tool({
  description: "List all active sessions.",
  args: {},
  async execute() {
    try {
      const sessions = await listSessions();

      if (sessions.length === 0) {
        return `No active sessions.`;
      }

      let output = `Active Sessions (${sessions.length}):\n\n`;

      for (const session of sessions) {
        output += `• ${session.sessionId}\n`;
        output += `  Status: ${session.status}\n`;
        output += `  Agent: ${session.agentId || 'default'}\n`;
        output += `  Messages: ${session.messageCount || 0}\n\n`;
      }

      return output;
    } catch (e: any) {
      return `❌ Failed to list sessions: ${e.message}`;
    }
  }
});

// --- LEGACY: GET ACTIVE SESSIONS (Kept for compatibility) ---

export const get_active_sessions = tool({
  description: "Get active sessions from OpenCode (alias for list_sessions).",
  args: {},
  async execute() {
    // Redirect to list_sessions
    return list_sessions.execute({});
  }
});
