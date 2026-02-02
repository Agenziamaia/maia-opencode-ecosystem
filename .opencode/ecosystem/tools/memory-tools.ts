/**
 * Memory MCP Tools
 *
 * Tools for agents to store and retrieve memories across sessions.
 * This enables continuous learning and improvement - a key AGI capability.
 */

import { tool } from "@opencode-ai/plugin";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ==========================================
// INLINED MEMORY STORE IMPLEMENTATION
// (To resolve persistent import/resolution errors)
// ==========================================

const MEMORY_DIR = '.opencode/memory';
const MEMORY_FILE = 'memory.json';

type MemoryType = 'success' | 'failure' | 'pattern' | 'insight' | 'decision';

interface Memory {
  id: string;
  type: MemoryType;
  agent: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  confidence?: number;
}

class SimpleMemoryStore {
  private memories: Map<string, Memory> = new Map();
  private filePath: string;

  constructor() {
    this.filePath = join(MEMORY_DIR, MEMORY_FILE);
    this.load();
  }

  private load() {
    if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true });
    if (existsSync(this.filePath)) {
      try {
        const data = JSON.parse(readFileSync(this.filePath, 'utf-8'));
        this.memories = new Map(Object.entries(data.memories || {}));
      } catch (e) { console.error('Failed to load memories', e); }
    }
  }

  private save() {
    try {
      const data = { memories: Object.fromEntries(this.memories) };
      writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) { console.error('Failed to save memories', e); }
  }

  store(memory: Omit<Memory, 'id' | 'timestamp'>): string {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMemory: Memory = { ...memory, id, timestamp: new Date().toISOString() };
    this.memories.set(id, fullMemory);
    this.save();
    return id;
  }

  query(opts: { type?: string, agent?: string, search?: string, tags?: string[], limit?: number }): Memory[] {
    let results = Array.from(this.memories.values());
    if (opts.type) results = results.filter(m => m.type === opts.type);
    if (opts.agent) results = results.filter(m => m.agent === opts.agent);
    if (opts.tags) results = results.filter(m => opts.tags!.some(t => m.tags.includes(t)));
    if (opts.search) {
      const s = opts.search.toLowerCase();
      results = results.filter(m => m.title.toLowerCase().includes(s) || m.content.toLowerCase().includes(s));
    }
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return opts.limit ? results.slice(0, opts.limit) : results;
  }

  getStats() {
    // Simplified stats for tools
    return { total: this.memories.size };
  }
}

// Singleton helper
let _store: SimpleMemoryStore | null = null;
function getStore() {
  if (!_store) _store = new SimpleMemoryStore();
  return _store;
}

// ==========================================
// TOOLS
// ==========================================

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
    const id = getStore().store({
      type: args.type as MemoryType,
      agent: 'current_agent',
      title: args.title,
      content: args.content,
      tags: args.tags || [],
      confidence: args.confidence,
    });
    return `✅ Memory stored\n\nID: ${id}\nType: ${args.type}\nTitle: ${args.title}\n\nThis memory will be available in future sessions.`;
  },
});

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
    const memories = getStore().query({
      type: args.type,
      tags: args.tags,
      search: args.search,
      agent: args.agent,
      limit: args.limit || 10,
    });

    if (memories.length === 0) {
      return `📭 No memories found${args.type ? ` for type "${args.type}"` : ''}`;
    }

    let output = `📚 Memories Found: ${memories.length}\n\n`;
    for (const memory of memories) {
      output += `• [${memory.type}] ${memory.title} (${new Date(memory.timestamp).toLocaleDateString()})\n`;
      if (memory.confidence) output += `  Confidence: ${(memory.confidence * 100).toFixed(0)}%\n`;
      output += `  ${memory.content.substring(0, 150)}${memory.content.length > 150 ? '...' : ''}\n\n`;
    }
    return output;
  },
});

export const memory_get_learnings = tool({
  description: "Get all learnings and patterns for the current agent",
  args: {},
  async execute(args) {
    const store = getStore();
    const agentMemories = store.query({ agent: 'current_agent' });

    const learnings = {
      successes: agentMemories.filter(m => m.type === 'success'),
      failures: agentMemories.filter(m => m.type === 'failure'),
      patterns: agentMemories.filter(m => m.type === 'pattern'),
    };

    const total = learnings.successes.length + learnings.failures.length + learnings.patterns.length;

    if (total === 0) {
      return "📚 No learnings found for this agent yet. Start storing memories to build intelligence over time!";
    }

    let output = `📚 Agent Learnings\n\n`;
    output += `✅ Successes: ${learnings.successes.length}\n`;
    output += `❌ Failures: ${learnings.failures.length}\n`;
    output += `🧬 Patterns: ${learnings.patterns.length}\n`;

    return output;
  },
});

export const memory_log_success = tool({
  description: "Log a successful action. The system will learn from this success.",
  args: {
    title: tool.schema.string().describe("What went well"),
    content: tool.schema.string().describe("Details of what led to success"),
    tags: tool.schema.array(tool.schema.string()).optional().describe("Relevant tags"),
    confidence: tool.schema.number().optional().describe("How confident are you this will work again? (0-1)"),
  },
  async execute(args) {
    getStore().store({
      type: 'success',
      agent: 'current_agent',
      title: args.title,
      content: args.content,
      tags: ['success', ...(args.tags || [])],
      confidence: args.confidence,
    });
    return `✅ Success logged\n\n"${args.title}"`;
  },
});

export const memory_log_failure = tool({
  description: "Log a failure to learn from mistakes",
  args: {
    title: tool.schema.string().describe("What went wrong"),
    content: tool.schema.string().describe("Details of the failure and what to avoid"),
    tags: tool.schema.array(tool.schema.string()).optional().describe("Relevant tags"),
  },
  async execute(args) {
    getStore().store({
      type: 'failure',
      agent: 'current_agent',
      title: args.title,
      content: args.content,
      tags: ['failure', ...(args.tags || [])],
    });
    return `✅ Failure logged\n\n"${args.title}"`;
  },
});

export const memory_log_pattern = tool({
  description: "Log a successful pattern that can be reused in similar situations",
  args: {
    pattern_name: tool.schema.string().describe("Name of the pattern"),
    description: tool.schema.string().describe("How the pattern works"),
    example: tool.schema.string().optional().describe("Example of when to use this pattern"),
    confidence: tool.schema.number().optional().describe("Confidence this pattern will work (0-1)"),
  },
  async execute(args) {
    const content = args.example ? `${args.description}\n\nExample:\n${args.example}` : args.description;
    getStore().store({
      type: 'pattern',
      agent: 'current_agent',
      title: args.pattern_name,
      content,
      tags: ['pattern'],
      confidence: args.confidence,
    });
    return `✅ Pattern stored\n\n"${args.pattern_name}"`;
  },
});

export const memory_stats = tool({
  description: "Get statistics about stored memories",
  args: {},
  async execute(args) {
    const stats = getStore().getStats();
    return `📊 Memory Statistics\n\nTotal Memories: ${stats.total}`;
  },
});
