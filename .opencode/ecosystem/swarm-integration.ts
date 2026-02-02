/**
 * Swarm Intelligence Integration
 *
 * TypeScript wrapper for Python swarm-intel.py CLI tool.
 * Provides collective intelligence and pattern-based agent recommendations.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

// ============================================================================
// TYPES
// ============================================================================

export type ComplexityLevel = 'low' | 'medium' | 'high';
export type TaskOutcome = 'success' | 'failure' | 'partial';

export interface SwarmRecommendation {
  status: string;
  task: string;
  recommendation: {
    category: string;
    ranked_agents: Array<{ agent: string; confidence: number }>;
    similar_patterns: Array<{
      pattern: any;
      similarity: number;
    }>;
  };
}

export interface SwarmQueryResult {
  status: string;
  query: string;
  matches: number;
  results: Array<{
    similarity: number;
    description: string;
    category: string;
    success_rate: number;
    recommended_agents: string[];
    complexity: string;
  }>;
}

export interface SwarmLearnResult {
  status: string;
  message?: string;
  task?: string;
  agent?: string;
  outcome?: string;
}

export interface SwarmCouncilResult {
  status: string;
  task: string;
  council_recommendation: {
    task_category: string;
    complexity: string;
    recommended_council: string[];
    rationale: string;
  };
}

export interface SwarmStats {
  status: string;
  insights: {
    total_patterns: number;
    total_tasks: number;
    category_success_rate: Record<string, number>;
    agent_success_rate: Record<string, number>;
    complexity_distribution: Record<string, number>;
  };
  recent_patterns: Array<{
    id: string;
    category: string;
    success_rate: number;
    agents: string[];
  }>;
}

// ============================================================================
// SWARM INTELLIGENCE CLIENT
// ============================================================================

export class SwarmIntelligence {
  private swarmScriptPath: string;

  constructor(swarmDir?: string) {
    // Default to .opencode/swarm/swarm-intel.py
    const baseDir = swarmDir || join(process.cwd(), '.opencode');
    this.swarmScriptPath = join(baseDir, 'swarm', 'swarm-intel.py');
  }

  /**
   * Execute the swarm-intel.py script and return parsed JSON output
   */
  private async executeSwarmScript(args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [this.swarmScriptPath, ...args], {
        cwd: process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Swarm script failed (code ${code}): ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse swarm output: ${e}`));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to spawn swarm script: ${err.message}`));
      });
    });
  }

  /**
   * Get agent recommendation for a task
   */
  async recommend(taskDescription: string): Promise<SwarmRecommendation> {
    const result = await this.executeSwarmScript(['--recommend', taskDescription]);
    return result as SwarmRecommendation;
  }

  /**
   * Query similar past tasks
   */
  async query(pattern: string, limit: number = 5): Promise<SwarmQueryResult> {
    const result = await this.executeSwarmScript([
      '--query',
      pattern,
      '--limit',
      limit.toString(),
    ]);
    return result as SwarmQueryResult;
  }

  /**
   * Learn from a completed task
   */
  async learn(
    task: string,
    agent: string,
    outcome: TaskOutcome,
    options: {
      complexity?: ComplexityLevel;
      durationMs?: number;
    } = {}
  ): Promise<SwarmLearnResult> {
    const args = ['--learn'];

    if (options.complexity) {
      args.push('--complexity', options.complexity);
    }

    if (options.durationMs !== undefined) {
      args.push('--duration-ms', options.durationMs.toString());
    }

    args.push('--task', task, '--agent', agent, '--outcome', outcome);

    const result = await this.executeSwarmScript(args);
    return result as SwarmLearnResult;
  }

  /**
   * Get council recommendation for complex tasks
   */
  async getCouncilRecommendation(
    task: string,
    complexity: ComplexityLevel = 'medium'
  ): Promise<SwarmCouncilResult> {
    const result = await this.executeSwarmScript([
      '--council',
      task,
      '--complexity',
      complexity,
    ]);
    return result as SwarmCouncilResult;
  }

  /**
   * Get swarm statistics
   */
  async getStats(): Promise<SwarmStats> {
    const result = await this.executeSwarmScript(['--stats']);
    return result as SwarmStats;
  }

  /**
   * Batch learn from multiple task outcomes
   */
  async batchLearn(outcomes: Array<{
    task: string;
    agent: string;
    outcome: TaskOutcome;
    complexity?: ComplexityLevel;
    durationMs?: number;
  }>): Promise<SwarmLearnResult[]> {
    const results = await Promise.all(
      outcomes.map((o) => this.learn(o.task, o.agent, o.outcome, {
        complexity: o.complexity,
        durationMs: o.durationMs,
      }))
    );
    return results;
  }

  /**
   * Direct JSON interface for programmatic access
   */
  async directRecommend(taskDescription: string): Promise<{
    category: string;
    topAgent: string;
    confidence: number;
    alternativeAgents: string[];
    reasoning: string;
  }> {
    const rec = await this.recommend(taskDescription);

    if (rec.status !== 'success' || !rec.recommendation.ranked_agents.length) {
      return {
        category: 'general',
        topAgent: 'coder',
        confidence: 0.5,
        alternativeAgents: [],
        reasoning: 'No swarm data available, using default',
      };
    }

    const ranked = rec.recommendation.ranked_agents;
    const similar = rec.recommendation.similar_patterns;

    return {
      category: rec.recommendation.category,
      topAgent: ranked[0].agent,
      confidence: ranked[0].confidence,
      alternativeAgents: ranked.slice(1, 4).map((r) => r.agent),
      reasoning: similar.length > 0
        ? `Based on ${similar.length} similar pattern(s) with avg success rate of ${similar.reduce((sum, s) => sum + (s.pattern?.success_rate || 0), 0) / similar.length
        }`
        : 'Based on agent capabilities for this task category',
    };
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let swarmInstance: SwarmIntelligence | null = null;

export function getSwarmIntelligence(): SwarmIntelligence {
  if (!swarmInstance) {
    swarmInstance = new SwarmIntelligence();
  }
  return swarmInstance;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Quick recommendation for a task (convenience function)
 */
export async function recommendAgent(task: string): Promise<string> {
  const swarm = getSwarmIntelligence();
  try {
    const rec = await swarm.directRecommend(task);
    return rec.topAgent;
  } catch (e) {
    console.warn('Swarm recommendation failed, using default:', e);
    return 'coder'; // Fallback
  }
}

/**
 * Learn from task completion (convenience function)
 */
export async function recordTaskOutcome(
  task: string,
  agent: string,
  success: boolean,
  durationMs?: number
): Promise<void> {
  const swarm = getSwarmIntelligence();
  try {
    await swarm.learn(
      task,
      agent,
      success ? 'success' : 'failure',
      durationMs !== undefined ? { durationMs } : {}
    );
  } catch (e) {
    console.warn('Failed to record task outcome:', e);
  }
}

/**
 * Get council for complex task (convenience function)
 */
export async function getCouncil(task: string, complexity?: ComplexityLevel): Promise<string[]> {
  const swarm = getSwarmIntelligence();
  try {
    const result = await swarm.getCouncilRecommendation(task, complexity);
    return result.council_recommendation.recommended_council;
  } catch (e) {
    console.warn('Council recommendation failed, using defaults:', e);
    return ['maia', 'oracle', 'prometheus']; // Fallback
  }
}
