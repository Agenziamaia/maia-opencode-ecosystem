
import { tool } from "@opencode-ai/plugin";
import { getMaiaDaemon } from '../execution/maia-daemon.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// --- REAL CONFIG LOADING ---

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

// --- TOOLS ---

export const session = tool({
  description: "Dispatch a task to another agent via the MAIA Daemon.",
  args: {
    agent: tool.schema.string().describe("The ID of the agent (e.g., 'researcher', 'coder')."),
    text: tool.schema.string().describe("The instruction/prompt for the agent."),
    mode: tool.schema.enum(["message", "background"]).optional().describe("Execution mode (default: message).")
  },
  async execute(args) {
    // 1. Validate Agent
    const config = loadAgentConfig(args.agent);
    if (!config) {
      throw new Error(`Agent '${args.agent}' not found in opencode.json. Available agents: maia, coder, researcher, etc.`);
    }

    // 2. Dispatch via Daemon
    const daemon = getMaiaDaemon();
    const task = await daemon.dispatch(args.text, args.agent);

    // 3. Return Status
    return `🦅 MAIA DAEMON: Dispatched Task ${task.id} to @${args.agent}\n` +
      `Status: ${task.status}\n` +
      `Model: ${config.model}\n` +
      `Wait for completion...`;
  }
});

export const background_task = tool({
  description: "Start a long-running background task.",
  args: {
    agent: tool.schema.string().describe("Agent ID"),
    task: tool.schema.string().describe("Task description"),
    context: tool.schema.string().optional()
  },
  async execute(args) {
    // Same logic, just different semantic wrapper
    const daemon = getMaiaDaemon();
    const task = await daemon.dispatch(
      `[BACKGROUND] ${args.task}\nContext: ${args.context || 'None'}`,
      args.agent
    );
    return `Background Process Started: ${task.id}`;
  }
});

/**
 * LEGACY/MOCK TOOLS (Kept for compatibility but routed to Daemon if possible)
 */
export const get_active_sessions = tool({
  description: "Get active tasks from ExecutionManager",
  args: {},
  async execute() {
    // In fully implemented version, we'd query ExecutionManager
    return "Querying Execution Manager... (Not implemented in this view yet)";
  }
});
