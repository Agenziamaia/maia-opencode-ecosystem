/**
 * Memory MCP Tools
 *
 * Tools for agents to store and retrieve memories across sessions.
 * This enables continuous learning and improvement - a key AGI capability.
 */

import { tool } from "@opencode-ai/plugin";
import {
  getMemoryStore,
  logSuccess,
  logFailure,
  logPattern,
  logDecision,
  getAgentLearnings,
  type MemoryType,
} from "../memory/memory-store.js";

/**
 * MEMORY_STORE - Store a memory for later retrieval
 */
export const memory_store = tool({
  description: "Store a memory for future reference. Enables agents to learn from experience.",
  args: {
    type: tool.schema.enum(["success", "failure", "pattern", "insight", "decision"]).describe("Type of memory"),
    title: tool.schema.string().describe("Short title describing the memory"),
    content: tool.schema.string().describe("Detailed content of the memory"),
    tags: tool.schema.array(tool.schema.string()).optional().describe("Tags for categorization"),
    confidence: tool.schema.number().optional().describe("Confidence level 0-1 (for patterns/learnings)"),
  },
  async execute(args) {
    const store = getMemoryStore();
    const agent = 'current_agent'; // Would be populated by system

    const memoryId = store.store({
      type: args.type as MemoryType,
      agent,
      title: args.title,
      content: args.content,
      tags: args.tags || [],
      confidence: args.confidence,
    });

    return `✅ Memory stored\n\nID: ${memoryId}\nType: ${args.type}\nTitle: ${args.title}\n\nThis memory will be available in future sessions.`;
  },
});

/**
 * MEMORY_QUERY - Query stored memories
 */
export const memory_query = tool({
  description: "Query stored memories to learn from past experience",
  args: {
    type: tool.schema.enum(["success", "failure", "pattern", "insight", "decision"]).optional().describe("Filter by memory type"),
    tags: tool.schema.array(tool.schema.string()).optional().describe("Filter by tags"),
    search: tool.schema.string().optional().describe("Search in title and content"),
    agent: tool.schema.string().optional().describe("Filter by agent (default: all agents)"),
    limit: tool.schema.number().optional().describe("Maximum results (default: 10)"),
  },
  async execute(args) {
    const store = getMemoryStore();
    const memories = store.query({
      type: args.type as MemoryType,
      tags: args.tags,
      search: args.search,
      agent: args.agent,
      limit: args.limit || 10,
    });

    if (memories.length === 0) {
      return `📭 No memories found${args.type ? ` for type "${args.type}"` : ''}${args.tags ? ` with tags ${args.tags.join(', ')}` : ''}`;
    }

    let output = `📚 Memories Found: ${memories.length}\n\n`;

    for (const memory of memories) {
      const typeEmoji = {
        success: '✅',
        failure: '❌',
        pattern: '🧬',
        insight: '💡',
        decision: '🎯',
      }[memory.type] || '📝';

      output += `${typeEmoji} ${memory.id}\n`;
      output += `   Title: ${memory.title}\n`;
      output += `   Agent: ${memory.agent}\n`;
      output += `   Type: ${memory.type}\n`;
      if (memory.tags.length > 0) {
        output += `   Tags: ${memory.tags.join(', ')}\n`;
      }
      if (memory.confidence) {
        output += `   Confidence: ${(memory.confidence * 100).toFixed(0)}%\n`;
      }
      output += `   Date: ${new Date(memory.timestamp).toLocaleDateString()}\n`;
      output += `   Content: ${memory.content.substring(0, 200)}${memory.content.length > 200 ? '...' : ''}\n\n`;
    }

    return output;
  },
});

/**
 * MEMORY_GET_LEARNINGS - Get all learnings for current agent
 */
export const memory_get_learnings = tool({
  description: "Get all learnings and patterns for the current agent",
  args: {},
  async execute(args) {
    const learnings = getAgentLearnings('current_agent');
    const total = learnings.successes.length + learnings.failures.length + learnings.patterns.length;

    if (total === 0) {
      return "📚 No learnings found for this agent yet. Start storing memories to build intelligence over time!";
    }

    let output = `📚 Agent Learnings\n\n`;

    output += `✅ Successes: ${learnings.successes.length}\n`;
    if (learnings.successes.length > 0) {
      output += learnings.successes.slice(0, 3).map(s => `   • ${s.title}`).join('\n');
      if (learnings.successes.length > 3) {
        output += `   ... and ${learnings.successes.length - 3} more\n`;
      }
    }

    output += `\n❌ Failures: ${learnings.failures.length}\n`;
    if (learnings.failures.length > 0) {
      output += learnings.failures.slice(0, 3).map(f => `   • ${f.title}`).join('\n');
      if (learnings.failures.length > 3) {
        output += `   ... and ${learnings.failures.length - 3} more\n`;
      }
    }

    output += `\n🧬 Patterns: ${learnings.patterns.length}\n`;
    if (learnings.patterns.length > 0) {
      output += learnings.patterns.slice(0, 3).map(p => `   • ${p.title}`).join('\n');
      if (learnings.patterns.length > 3) {
        output += `   ... and ${learnings.patterns.length - 3} more\n`;
      }
    }

    return output;
  },
});

/**
 * MEMORY_LOG_SUCCESS - Log a successful action for future reference
 */
export const memory_log_success = tool({
  description: "Log a successful action. The system will learn from this success.",
  args: {
    title: tool.schema.string().describe("What went well"),
    content: tool.schema.string().describe("Details of what led to success"),
    tags: tool.schema.array(tool.schema.string()).optional().describe("Relevant tags"),
    confidence: tool.schema.number().optional().describe("How confident are you this will work again? (0-1)"),
  },
  async execute(args) {
    const memoryId = logSuccess(
      'current_agent',
      args.title,
      args.content,
      args.tags || [],
      args.confidence
    );

    return `✅ Success logged\n\n"${args.title}"\n\nThis pattern will be remembered for future situations.`;
  },
});

/**
 * MEMORY_LOG_FAILURE - Log a failure to avoid repeating mistakes
 */
export const memory_log_failure = tool({
  description: "Log a failure to learn from mistakes",
  args: {
    title: tool.schema.string().describe("What went wrong"),
    content: tool.schema.string().describe("Details of the failure and what to avoid"),
    tags: tool.schema.array(tool.schema.string()).optional().describe("Relevant tags"),
  },
  async execute(args) {
    const memoryId = logFailure(
      'current_agent',
      args.title,
      args.content,
      args.tags || []
    );

    return `✅ Failure logged\n\n"${args.title}"\n\nThe system will remember to avoid this pattern in the future.`;
  },
});

/**
 * MEMORY_LOG_PATTERN - Log a discovered pattern for reuse
 */
export const memory_log_pattern = tool({
  description: "Log a successful pattern that can be reused in similar situations",
  args: {
    pattern_name: tool.schema.string().describe("Name of the pattern"),
    description: tool.schema.string().describe("How the pattern works"),
    example: tool.schema.string().optional().describe("Example of when to use this pattern"),
    confidence: tool.schema.number().optional().describe("Confidence this pattern will work (0-1)"),
  },
  async execute(args) {
    const memoryId = logPattern(
      'current_agent',
      args.pattern_name,
      args.description,
      args.example,
      args.confidence
    );

    return `✅ Pattern stored\n\n"${args.pattern_name}"\n\nThis pattern will be suggested for similar tasks in the future.`;
  },
});

/**
 * MEMORY_STATS - Get memory statistics
 */
export const memory_stats = tool({
  description: "Get statistics about stored memories",
  args: {},
  async execute(args) {
    const store = getMemoryStore();
    const stats = store.getStats();

    let output = `📊 Memory Statistics\n\n`;
    output += `Total Memories: ${stats.total}\n\n`;

    output += `By Type:\n`;
    for (const [type, count] of Object.entries(stats.byType)) {
      output += `  ${type}: ${count}\n`;
    }

    output += `\nBy Agent:\n`;
    for (const [agent, count] of Object.entries(stats.byAgent)) {
      output += `  ${agent}: ${count}\n`;
    }

    output += `\nTop Tags:\n`;
    for (const { tag, count } of stats.topTags.slice(0, 5)) {
      output += `  #${tag}: ${count}\n`;
    }

    return output;
  },
});
