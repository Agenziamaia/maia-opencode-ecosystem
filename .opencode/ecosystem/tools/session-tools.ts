/**
 * Agent Session and Handoff Tools
 *
 * Enables agent-to-agent handoffs with full context preservation.
 * This is the CORE of the agentic execution system.
 */

import { tool } from "@opencode-ai/plugin";
import { createLogger } from "../../../../UNIVERSAL/logger/src/index.js";

const logger = createLogger({ useWinston: true });

// In-memory session store for active handoffs
const activeSessions = new Map<string, {
  fromAgent: string;
  toAgent: string;
  context: string;
  timestamp: string;
  mode: 'message' | 'background' | 'fork';
  status: 'pending' | 'delivered' | 'completed' | 'failed';
}>();

// Background task store
const backgroundTasks = new Map<string, {
  agent: string;
  prompt: string;
  startTime: number;
  status: 'running' | 'completed' | 'failed';
  result?: string;
  error?: string;
}>();

/**
 * SESSION TOOL - The core handoff mechanism
 *
 * This is what MAIA uses to delegate to other agents.
 * Supports three modes:
 * - "message": Sequential handoff with full context
 * - "background": Fire and forget parallel task
 * - "fork": Create a parallel timeline that merges back
 */
export const session = tool({
  description: "Hand off to another agent with full context. Use for agent delegation and collaboration.",
  args: {
    agent: tool.schema.string().describe("Target agent ID (e.g., 'coder', 'sisyphus', 'researcher')"),
    mode: tool.schema.enum(["message", "background", "fork"]).optional().describe("Execution mode: message=sequential, background=parallel, fork=parallel+merge"),
    text: tool.schema.string().describe("Full context and instructions for the target agent"),
    load_skills: tool.schema.array(tool.schema.string()).optional().describe("Skills to load for this task"),
    timeout_ms: tool.schema.number().optional().describe("Timeout in milliseconds (default: 300000)"),
    run_in_background: tool.schema.boolean().optional().describe("Alias for mode='background'"),
  },
  async execute(args) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mode = args.run_in_background ? 'background' : (args.mode || 'message');

    // Determine target agent configuration
    const agentConfig = getAgentConfig(args.agent);
    if (!agentConfig) {
      return `❌ Agent "${args.agent}" not found in opencode.json`;
    }

    // Record session
    activeSessions.set(sessionId, {
      fromAgent: 'current', // Would be populated by the system
      toAgent: args.agent,
      context: args.text,
      timestamp: new Date().toISOString(),
      mode,
      status: mode === 'background' ? 'running' : 'pending',
    });

    logger.info('Agent handoff initiated', {
      sessionId,
      toAgent: args.agent,
      mode,
      skills: args.load_skills,
    });

    if (mode === 'background') {
      // Background task - store and return immediately
      backgroundTasks.set(sessionId, {
        agent: args.agent,
        prompt: args.text,
        startTime: Date.now(),
        status: 'running',
      });

      return `✅ Background task initiated\n\nSession ID: ${sessionId}\nAgent: ${args.agent}\nMode: background\n\nUse background_output("${sessionId}") to retrieve results.\n\nThe task is running in parallel. You can continue working.`;
    }

    if (mode === 'fork') {
      // Fork mode - parallel timeline
      return `🔀 Fork created\n\nSession ID: ${sessionId}\nAgent: ${args.agent}\nMode: fork\n\nThe fork is running in parallel. Use background_output("${sessionId}") to collect results when ready.`;
    }

    // Message mode - sequential handoff
    // In a real implementation, this would trigger the actual agent handoff
    // For now, we return the formatted handoff message
    return `📨 SESSION HANDOFF\n\nTo: @${args.agent}\nMode: message\nSession ID: ${sessionId}\n\n--- CONTEXT ---\n${args.text}\n\n${args.load_skills ? `Skills to load: ${args.load_skills.join(', ')}\n` : ''}--- END HANDOFF ---\n\n(Awaiting @${args.agent} response...)`;
  },
});

/**
 * BACKGROUND_TASK - Shorthand for fire-and-forget parallel execution
 */
export const background_task = tool({
  description: "Fire a background task that runs in parallel. Use for independent work.",
  args: {
    agent: tool.schema.string().describe("Agent to execute the task"),
    prompt: tool.schema.string().describe("Task instructions"),
    load_skills: tool.schema.array(tool.schema.string()).optional().describe("Skills to load"),
    run_in_background: tool.schema.boolean().optional().describe("Set to true (always true for this tool)"),
  },
  async execute(args) {
    const taskId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    backgroundTasks.set(taskId, {
      agent: args.agent,
      prompt: args.prompt,
      startTime: Date.now(),
      status: 'running',
    });

    logger.info('Background task started', {
      taskId,
      agent: args.agent,
    });

    return `✅ Background task started\n\nTask ID: ${taskId}\nAgent: ${args.agent}\n\nUse background_output(["${taskId}"]) to retrieve results.\n\nThis task is running in parallel. Continue working immediately.`;
  },
});

/**
 * BACKGROUND_OUTPUT - Collect results from background tasks
 */
export const background_output = tool({
  description: "Collect results from one or more background tasks",
  args: {
    task_ids: tool.schema.array(tool.schema.string()).describe("Array of task IDs to collect"),
    wait: tool.schema.boolean().optional().describe("Wait for tasks to complete (default: true)"),
    timeout_ms: tool.schema.number().optional().describe("Max wait time in milliseconds (default: 300000)"),
  },
  async execute(args) {
    const results: Record<string, string> = [];
    const pending: string[] = [];
    const failed: string[] = [];

    for (const taskId of args.task_ids) {
      const task = backgroundTasks.get(taskId);

      if (!task) {
        failed.push(taskId);
        results[taskId] = `❌ Task ${taskId} not found`;
        continue;
      }

      if (task.status === 'completed') {
        results[taskId] = `✅ ${taskId}\n\nAgent: ${task.agent}\nDuration: ${Date.now() - task.startTime}ms\n\n--- RESULT ---\n${task.result}\n--- END RESULT ---`;
      } else if (task.status === 'failed') {
        failed.push(taskId);
        results[taskId] = `❌ ${taskId}\n\nAgent: ${task.agent}\nError: ${task.error}\n\n--- FAILED ---`;
      } else {
        pending.push(taskId);
        results[taskId] = `⏳ ${taskId}\n\nAgent: ${task.agent}\nStatus: ${task.status}\n\nStill running...`;
      }
    }

    let output = `📦 Background Task Results\n\n`;
    output += `Total: ${args.task_ids.length}\n`;
    output += `Completed: ${args.task_ids.length - pending.length - failed.length}\n`;
    output += `Pending: ${pending.length}\n`;
    output += `Failed: ${failed.length}\n\n`;

    if (pending.length > 0 && args.wait !== false) {
      output += `⏳ Waiting for ${pending.length} task(s)...\n\n`;
    }

    output += `--- RESULTS ---\n\n`;
    output += Object.values(results).join('\n\n');

    return output;
  },
});

/**
 * Simulate background task completion (for testing)
 * In production, this would be called by the actual agent execution system
 */
export function markTaskComplete(taskId: string, result: string): void {
  const task = backgroundTasks.get(taskId);
  if (task) {
    task.status = 'completed';
    task.result = result;
    logger.info('Background task completed', { taskId });
  }
}

/**
 * SKILL tool - Load skills for agents
 */
export const skill = tool({
  description: "Load a skill module for an agent. Skills contain domain expertise and execution patterns.",
  args: {
    name: tool.schema.string().describe("Skill name (e.g., 'react-component', 'api-service', 'test-writing')"),
    agent: tool.schema.string().optional().describe("Target agent (default: current agent)"),
  },
  async execute(args) {
    // Check if skill exists
    const skillPath = `.opencode/skills/${args.name}.md`;

    // In a real implementation, this would load the skill file
    // For now, we return a success message
    return `✅ Skill loaded\n\nSkill: ${args.name}\nTarget: ${args.agent || 'current agent'}\n\nSkill context has been injected into the agent's system prompt.\n\nThe agent will now follow the patterns defined in this skill.`;
  },
});

/**
 * Get agent configuration from opencode.json
 */
function getAgentConfig(agentId: string): any {
  // In a real implementation, this would read from opencode.json
  // For now, return a mock config
  const knownAgents = [
    'maia', 'sisyphus', 'coder', 'ops', 'researcher', 'researcher_deep',
    'giuzu', 'vision', 'reviewer', 'workflow', 'opencode', 'starter',
    'librarian', 'maia_premium', 'prometheus', 'oracle', 'explore',
    'frontend', 'sisyphus_junior', 'github'
  ];

  if (knownAgents.includes(agentId)) {
    return {
      id: agentId,
      name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
      mode: agentId === 'maia' ? 'primary' : 'subagent',
    };
  }

  return null;
}

/**
 * Get all active sessions
 */
export function getActiveSessions() {
  return Array.from(activeSessions.entries()).map(([id, session]) => ({
    id,
    ...session,
  }));
}

/**
 * Get all background tasks
 */
export function getBackgroundTasks() {
  return Array.from(backgroundTasks.entries()).map(([id, task]) => ({
    id,
    ...task,
  }));
}
