/**
 * MAIA Agent Memory System
 *
 * A persistent memory system for agents to learn from experience.
 * This enables agents to:
 * - Remember successful patterns
 * - Learn from mistakes
 * - Build context over time
 * - Share learnings across sessions
 *
 * This is a key component toward AGI - continuous learning and improvement.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../../../UNIVERSAL/logger/src/index.js';

const logger = createLogger({ useWinston: true });

const MEMORY_DIR = '.opencode/memory';

// Memory types
export type MemoryType = 'success' | 'failure' | 'pattern' | 'insight' | 'decision';

export interface Memory {
  id: string;
  type: MemoryType;
  agent: string;
  title: string;
  content: string;
  tags: string[];
  timestamp: string;
  associated_tasks?: string[];
  confidence?: number; // 0-1
  expires_at?: string; // Optional expiration
}

export interface MemoryQuery {
  type?: MemoryType;
  agent?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  since?: string; // ISO date string
}

/**
 * Memory Store Class
 */
class MemoryStore {
  private memories: Map<string, Memory> = new Map();
  private index: Map<string, string[]> = new Map(); // tag -> memory IDs
  private filePath: string;

  constructor() {
    this.filePath = join(MEMORY_DIR, 'memory.json');
    this.load();
  }

  /**
   * Load memories from disk
   */
  private load(): void {
    if (!existsSync(MEMORY_DIR)) {
      mkdirSync(MEMORY_DIR, { recursive: true });
    }

    if (existsSync(this.filePath)) {
      try {
        const data = JSON.parse(readFileSync(this.filePath, 'utf-8'));
        this.memories = new Map(Object.entries(data.memories || {}));
        this.index = new Map(Object.entries(data.index || {}));
        logger.info('Memories loaded', { count: this.memories.size });
      } catch (error) {
        logger.error('Failed to load memories', { error });
      }
    }
  }

  /**
   * Save memories to disk
   */
  private save(): void {
    try {
      const data = {
        memories: Object.fromEntries(this.memories),
        index: Object.fromEntries(this.index),
      };
      writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error('Failed to save memories', { error });
    }
  }

  /**
   * Store a new memory
   */
  store(memory: Omit<Memory, 'id' | 'timestamp'>): string {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMemory: Memory = {
      ...memory,
      id,
      timestamp: new Date().toISOString(),
    };

    this.memories.set(id, fullMemory);

    // Update tag index
    for (const tag of memory.tags) {
      if (!this.index.has(tag)) {
        this.index.set(tag, []);
      }
      this.index.get(tag)!.push(id);
    }

    this.save();
    logger.info('Memory stored', { id, type: memory.type, agent: memory.agent });

    return id;
  }

  /**
   * Retrieve a memory by ID
   */
  get(id: string): Memory | undefined {
    return this.memories.get(id);
  }

  /**
   * Query memories
   */
  query(query: MemoryQuery = {}): Memory[] {
    let results = Array.from(this.memories.values());

    // Filter by type
    if (query.type) {
      results = results.filter(m => m.type === query.type);
    }

    // Filter by agent
    if (query.agent) {
      results = results.filter(m => m.agent === query.agent);
    }

    // Filter by tags (any match)
    if (query.tags && query.tags.length > 0) {
      results = results.filter(m =>
        query.tags!.some(tag => m.tags.includes(tag))
      );
    }

    // Filter by date
    if (query.since) {
      const sinceDate = new Date(query.since);
      results = results.filter(m => new Date(m.timestamp) >= sinceDate);
    }

    // Filter by search text
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(m =>
        m.title.toLowerCase().includes(searchLower) ||
        m.content.toLowerCase().includes(searchLower)
      );
    }

    // Remove expired memories
    const now = new Date();
    results = results.filter(m => {
      if (!m.expires_at) return true;
      return new Date(m.expires_at) > now;
    });

    // Sort by timestamp (newest first)
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Get memories by tag
   */
  getByTag(tag: string): Memory[] {
    const ids = this.index.get(tag) || [];
    return ids.map(id => this.memories.get(id)).filter(Boolean) as Memory[];
  }

  /**
   * Update a memory
   */
  update(id: string, updates: Partial<Memory>): boolean {
    const memory = this.memories.get(id);
    if (!memory) return false;

    const updated = { ...memory, ...updates };
    this.memories.set(id, updated);
    this.save();
    return true;
  }

  /**
   * Delete a memory
   */
  delete(id: string): boolean {
    const memory = this.memories.get(id);
    if (!memory) return false;

    // Remove from tag index
    for (const tag of memory.tags) {
      const ids = this.index.get(tag);
      if (ids) {
        const index = ids.indexOf(id);
        if (index > -1) {
          ids.splice(index, 1);
        }
      }
    }

    this.memories.delete(id);
    this.save();
    return true;
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    byType: Record<MemoryType, number>;
    byAgent: Record<string, number>;
    topTags: Array<{ tag: string; count: number }>;
  } {
    const byType: Record<MemoryType, number> = {
      success: 0,
      failure: 0,
      pattern: 0,
      insight: 0,
      decision: 0,
    };
    const byAgent: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    for (const memory of this.memories.values()) {
      byType[memory.type]++;
      byAgent[memory.agent] = (byAgent[memory.agent] || 0) + 1;

      for (const tag of memory.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: this.memories.size,
      byType,
      byAgent,
      topTags,
    };
  }

  /**
   * Prune old memories
   */
  prune(beforeDate: Date, keepTags: string[] = []): number {
    let pruned = 0;

    for (const [id, memory] of this.memories.entries()) {
      const memDate = new Date(memory.timestamp);

      // Keep if has important tag
      if (memory.tags.some(t => keepTags.includes(t))) continue;

      // Keep if recently created
      if (memDate >= beforeDate) continue;

      // Keep if no expiration
      if (!memory.expires_at) continue;

      // Delete old expired memory
      if (memDate < beforeDate) {
        this.delete(id);
        pruned++;
      }
    }

    logger.info('Memories pruned', { count: pruned });
    return pruned;
  }
}

// Singleton instance
let store: MemoryStore | null = null;

/**
 * Get the memory store instance
 */
export function getMemoryStore(): MemoryStore {
  if (!store) {
    store = new MemoryStore();
  }
  return store;
}

/**
 * Convenience function to store a success memory
 */
export function logSuccess(
  agent: string,
  title: string,
  content: string,
  tags: string[] = [],
  confidence?: number
): string {
  return getMemoryStore().store({
    type: 'success',
    agent,
    title,
    content,
    tags: ['success', ...tags],
    confidence,
  });
}

/**
 * Convenience function to store a failure memory
 */
export function logFailure(
  agent: string,
  title: string,
  content: string,
  tags: string[] = []
): string {
  return getMemoryStore().store({
    type: 'failure',
    agent,
    title,
    content,
    tags: ['failure', ...tags],
  });
}

/**
 * Convenience function to store a pattern memory
 */
export function logPattern(
  agent: string,
  patternName: string,
  description: string,
  example?: string,
  confidence?: number
): string {
  const content = example
    ? `${description}\n\nExample:\n${example}`
    : description;

  return getMemoryStore().store({
    type: 'pattern',
    agent,
    title: patternName,
    content,
    tags: ['pattern'],
    confidence,
  });
}

/**
 * Convenience function to store a decision
 */
export function logDecision(
  agent: string,
  decision: string,
  reasoning: string,
  tags: string[] = []
): string {
  return getMemoryStore().store({
    type: 'decision',
    agent,
    title: `Decision: ${decision.substring(0, 50)}...`,
    content: reasoning,
    tags: ['decision', ...tags],
  });
}

/**
 * Get learnings for an agent
 */
export function getAgentLearnings(agent: string): {
  successes: Memory[];
  failures: Memory[];
  patterns: Memory[];
  insights: Memory[];
} {
  const store = getMemoryStore();
  const agentMemories = store.query({ agent });

  return {
    successes: agentMemories.filter(m => m.type === 'success'),
    failures: agentMemories.filter(m => m.type === 'failure'),
    patterns: agentMemories.filter(m => m.type === 'pattern'),
    insights: agentMemories.filter(m => m.type === 'insight'),
  };
}
