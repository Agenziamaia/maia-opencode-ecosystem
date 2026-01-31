/**
 * MAIA Meta-Learning System
 *
 * Purpose: Connect memory store with DNA tracker to generate practical,
 * actionable insights that actually improve agents over time.
 *
 * This is NOT theoretical - it reads from actual memory-store.ts and dna-tracker.ts
 * and produces real insights from stored data.
 *
 * Architecture:
 * - On success: logs pattern, updates agent performance stats
 * - On failure: logs failure pattern, adds to "avoid" list
 * - Weekly learning sync: generates agent optimization suggestions
 * - Outputs actionable insights: "Change @coder's prompt to include Z"
 */

import { getMemoryStore, type Memory, type MemoryType } from '../memory/memory-store';
import { getDNATracker, type Pattern, type TaskDNA } from './dna/dna-tracker';

/**
 * Agent performance statistics
 */
export interface AgentPerformanceStats {
  agent_id: string;
  total_tasks: number;
  successful_tasks: number;
  failed_tasks: number;
  success_rate: number;
  avg_duration_ms: number;
  best_patterns: string[];
  weak_patterns: string[];
  improvement_suggestions: string[];
}

/**
 * Failure pattern to avoid
 */
export interface FailurePattern {
  id: string;
  agent_id: string;
  task_type: string;
  characteristics: string[];
  avoid_reason: string;
  occurrence_count: number;
  last_occurrence: string;
}

/**
 * Learning insight - actionable recommendation
 */
export interface LearningInsight {
  type: 'prompt_optimization' | 'agent_focusing' | 'pattern_avoidance' | 'workflow_improvement';
  priority: 'high' | 'medium' | 'low';
  agent: string;
  insight: string;
  action: string;
  supporting_data: {
    success_count?: number;
    failure_count?: number;
    confidence?: number;
  };
  generated_at: string;
}

/**
 * Weekly learning sync report
 */
export interface LearningSyncReport {
  week_start: string;
  week_end: string;
  total_tasks_analyzed: number;
  agent_performances: Record<string, AgentPerformanceStats>;
  failure_patterns: FailurePattern[];
  insights: LearningInsight[];
  summary: string;
}

/**
 * Meta-Learning Engine
 */
export class MetaLearningEngine {
  private memoryStore = getMemoryStore();
  private dnaTracker = getDNATracker();
  private avoidList: Map<string, FailurePattern> = new Map();
  private agentStats: Map<string, AgentPerformanceStats> = new Map();
  private lastSyncTimestamp: string | null = null;

  /**
   * Log a task success - stores pattern and updates performance
   */
  logSuccess(
    taskId: string,
    agent: string,
    taskTitle: string,
    taskDescription: string,
    outcomeMetrics: { completion_time_ms: number; quality_score: number }
  ): void {
    const dna = this.dnaTracker.getDNA(taskId);
    if (!dna) {
      console.warn(`[MetaLearning] No DNA found for task ${taskId}`);
      return;
    }

    // Extract characteristics from task and interactions
    const characteristics = this.extractCharacteristics(taskTitle, taskDescription, dna);

    // Store success memory with pattern
    const patternId = dna.pattern_id || this.generatePatternId(characteristics);
    this.memoryStore.store({
      type: 'success',
      agent,
      title: `Success: ${taskTitle}`,
      content: `Task completed successfully.\n\nPattern: ${patternId}\nCharacteristics: ${characteristics.join(', ')}\nDuration: ${outcomeMetrics.completion_time_ms}ms\nQuality: ${outcomeMetrics.quality_score}`,
      tags: ['success', patternId, ...characteristics, agent],
      confidence: outcomeMetrics.quality_score,
    });

    // Update agent stats
    this.updateAgentStats(agent, true, outcomeMetrics.completion_time_ms, patternId);

    console.log(`[MetaLearning] Logged success for agent ${agent} on task ${taskId}`);
  }

  /**
   * Log a task failure - stores failure pattern and adds to avoid list
   */
  logFailure(
    taskId: string,
    agent: string,
    taskTitle: string,
    taskDescription: string,
    failureReason: string
  ): void {
    const dna = this.dnaTracker.getDNA(taskId);
    const characteristics = dna
      ? this.extractCharacteristics(taskTitle, taskDescription, dna)
      : this.extractBasicCharacteristics(taskTitle, taskDescription);

    const patternId = `failure_${this.generatePatternId(characteristics)}`;

    // Store failure memory
    const memoryId = this.memoryStore.store({
      type: 'failure',
      agent,
      title: `Failure: ${taskTitle}`,
      content: `Task failed.\n\nReason: ${failureReason}\nCharacteristics: ${characteristics.join(', ')}`,
      tags: ['failure', patternId, ...characteristics, agent],
    });

    // Add to avoid list
    const failurePattern: FailurePattern = {
      id: patternId,
      agent_id: agent,
      task_type: this.inferTaskType(characteristics),
      characteristics,
      avoid_reason: failureReason,
      occurrence_count: 1,
      last_occurrence: new Date().toISOString(),
    };

    // Update existing failure pattern count
    const existing = this.avoidList.get(patternId);
    if (existing) {
      existing.occurrence_count++;
      existing.last_occurrence = failurePattern.last_occurrence;
    } else {
      this.avoidList.set(patternId, failurePattern);
    }

    // Update agent stats
    this.updateAgentStats(agent, false, 0, patternId);

    console.log(`[MetaLearning] Logged failure for agent ${agent} on task ${taskId}, added to avoid list`);
  }

  /**
   * Generate weekly learning sync report
   */
  generateWeeklySync(weekStart?: Date, weekEnd?: Date): LearningSyncReport {
    const end = weekEnd || new Date();
    const start = weekStart || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all memories from this week
    const weeklyMemories = this.memoryStore.query({
      since: start.toISOString(),
    });

    // Get all task DNA
    const allTaskDNA = Array.from(
      (this.dnaTracker as any).taskHistory?.values() || []
    );

    // Analyze each agent's performance
    const agentPerformances: Record<string, AgentPerformanceStats> = {};
    const uniqueAgents = new Set([
      ...weeklyMemories.map((m) => m.agent),
      ...allTaskDNA.flatMap((dna: TaskDNA) =>
        dna.agent_interactions.map((ai) => ai.agent_id)
      ),
    ]);

    for (const agent of uniqueAgents) {
      agentPerformances[agent] = this.analyzeAgentPerformance(agent, start, end);
    }

    // Generate insights from data
    const insights = this.generateInsights(agentPerformances, weeklyMemories);

    // Build report
    const report: LearningSyncReport = {
      week_start: start.toISOString(),
      week_end: end.toISOString(),
      total_tasks_analyzed: allTaskDNA.length,
      agent_performances: agentPerformances,
      failure_patterns: Array.from(this.avoidList.values()),
      insights,
      summary: this.generateSummary(agentPerformances, insights),
    };

    this.lastSyncTimestamp = new Date().toISOString();
    return report;
  }

  /**
   * Get actionable insights for a specific agent
   */
  getInsightsForAgent(agent: string): LearningInsight[] {
    const stats = this.analyzeAgentPerformance(
      agent,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      new Date()
    );
    const insights: LearningInsight[] = [];

    // Check for prompt optimization opportunities
    if (stats.weak_patterns.length > 0) {
      const weakPattern = stats.weak_patterns[0];
      const failuresForPattern = this.getFailuresForPattern(agent, weakPattern);

      if (failuresForPattern.length >= 2) {
        const commonFailureReasons = this.extractCommonFailureReasons(failuresForPattern);
        insights.push({
          type: 'prompt_optimization',
          priority: 'high',
          agent,
          insight: `Agent struggles with tasks matching pattern: ${weakPattern}`,
          action: this.generatePromptOptimization(agent, weakPattern, commonFailureReasons),
          supporting_data: {
            failure_count: failuresForPattern.length,
            confidence: Math.min(0.9, 0.5 + failuresForPattern.length * 0.1),
          },
          generated_at: new Date().toISOString(),
        });
      }
    }

    // Check for focusing suggestions
    if (stats.best_patterns.length > 0) {
      const bestPattern = stats.best_patterns[0];
      const successRate = stats.success_rate;

      if (successRate > 0.8 && stats.successful_tasks >= 3) {
        insights.push({
          type: 'agent_focusing',
          priority: 'medium',
          agent,
          insight: `Agent excels at ${bestPattern} tasks with ${(successRate * 100).toFixed(0)}% success rate`,
          action: `Prioritize assigning ${bestPattern} tasks to ${agent}. Consider routing similar tasks to this agent for better outcomes.`,
          supporting_data: {
            success_count: stats.successful_tasks,
            confidence: successRate,
          },
          generated_at: new Date().toISOString(),
        });
      }
    }

    // Check for workflow improvements
    if (stats.avg_duration_ms > 60000) {
      // Over 1 minute average
      insights.push({
        type: 'workflow_improvement',
        priority: 'medium',
        agent,
        insight: `Agent has slow average completion time: ${(stats.avg_duration_ms / 1000).toFixed(0)}s`,
        action: `Review ${agent}'s workflow for inefficiencies. Consider breaking complex tasks into smaller sub-tasks or providing more context upfront.`,
        supporting_data: {
          confidence: 0.7,
        },
        generated_at: new Date().toISOString(),
      });
    }

    return insights;
  }

  /**
   * Get patterns to avoid for an agent
   */
  getAvoidPatternsForAgent(agent: string): FailurePattern[] {
    return Array.from(this.avoidList.values()).filter((fp) => fp.agent_id === agent);
  }

  /**
   * Get actionable prompt change suggestion
   */
  getPromptSuggestion(agent: string): string | null {
    const insights = this.getInsightsForAgent(agent);
    const promptInsights = insights.filter((i) => i.type === 'prompt_optimization');

    if (promptInsights.length > 0) {
      const top = promptInsights[0];
      return `Change @${agent}'s prompt to include: ${top.action}`;
    }

    return null;
  }

  /**
   * Analyze agent performance for a time period
   */
  private analyzeAgentPerformance(
    agent: string,
    startDate: Date,
    endDate: Date
  ): AgentPerformanceStats {
    const dnaStats = this.dnaTracker.analyzeAgentPerformance(agent);
    const memories = this.memoryStore.query({ agent, since: startDate.toISOString() });

    const successes = memories.filter((m) => m.type === 'success');
    const failures = memories.filter((m) => m.type === 'failure');

    // Extract pattern frequencies
    const patternCounts = new Map<string, number>();
    const successPatterns = new Map<string, number>();
    const failurePatterns = new Map<string, number>();

    for (const memory of successes) {
      const patternTag = memory.tags.find((t) => t.startsWith('pattern_') || t.startsWith('failure_'));
      if (patternTag) {
        patternCounts.set(patternTag, (patternCounts.get(patternTag) || 0) + 1);
        successPatterns.set(patternTag, (successPatterns.get(patternTag) || 0) + 1);
      }
    }

    for (const memory of failures) {
      const patternTag = memory.tags.find((t) => t.startsWith('pattern_') || t.startsWith('failure_'));
      if (patternTag) {
        patternCounts.set(patternTag, (patternCounts.get(patternTag) || 0) + 1);
        failurePatterns.set(patternTag, (failurePatterns.get(patternTag) || 0) + 1);
      }
    }

    // Best patterns: highest success ratio
    const bestPatterns = Array.from(successPatterns.entries())
      .filter(([pattern]) => (failurePatterns.get(pattern) || 0) < (successPatterns.get(pattern) || 0))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pattern]) => pattern);

    // Weak patterns: highest failure ratio
    const weakPatterns = Array.from(failurePatterns.entries())
      .filter(([pattern]) => (failurePatterns.get(pattern) || 0) >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pattern]) => pattern);

    return {
      agent_id: agent,
      total_tasks: dnaStats.taskCount,
      successful_tasks: successes.length,
      failed_tasks: failures.length,
      success_rate: dnaStats.successRate,
      avg_duration_ms: dnaStats.avgDuration,
      best_patterns: bestPatterns,
      weak_patterns: weakPatterns,
      improvement_suggestions: [],
    };
  }

  /**
   * Generate insights from all agent performance data
   */
  private generateInsights(
    agentPerformances: Record<string, AgentPerformanceStats>,
    memories: Memory[]
  ): LearningInsight[] {
    const insights: LearningInsight[] = [];

    for (const [agent, stats] of Object.entries(agentPerformances)) {
      // Low success rate insights
      if (stats.success_rate < 0.5 && stats.total_tasks >= 3) {
        insights.push({
          type: 'agent_focusing',
          priority: 'high',
          agent,
          insight: `Agent has low success rate of ${(stats.success_rate * 100).toFixed(0)}%`,
          action: `Consider reassigning tasks from ${agent} to agents with better performance on these patterns. Review if ${agent} needs additional context or different task types.`,
          supporting_data: {
            success_count: stats.successful_tasks,
            failure_count: stats.failed_tasks,
            confidence: 1 - stats.success_rate,
          },
          generated_at: new Date().toISOString(),
        });
      }

      // Weak pattern insights
      for (const weakPattern of stats.weak_patterns) {
        const failureData = this.avoidList.get(weakPattern);
        if (failureData && failureData.occurrence_count >= 2) {
          insights.push({
            type: 'pattern_avoidance',
            priority: 'high',
            agent,
            insight: `Agent consistently fails on ${weakPattern} pattern (${failureData.occurrence_count} occurrences)`,
            action: `Avoid assigning ${weakPattern} tasks to ${agent}. Reason: ${failureData.avoid_reason}`,
            supporting_data: {
              failure_count: failureData.occurrence_count,
            },
            generated_at: new Date().toISOString(),
          });
        }
      }
    }

    // Find best agent for each pattern
    const patternAgents = new Map<string, Map<string, number>>();
    for (const [agent, stats] of Object.entries(agentPerformances)) {
      for (const pattern of stats.best_patterns) {
        if (!patternAgents.has(pattern)) {
          patternAgents.set(pattern, new Map());
        }
        patternAgents.get(pattern)!.set(agent, stats.successful_tasks);
      }
    }

    for (const [pattern, agentMap] of patternAgents.entries()) {
      const sortedAgents = Array.from(agentMap.entries()).sort((a, b) => b[1] - a[1]);
      if (sortedAgents.length >= 2) {
        const [bestAgent, bestCount] = sortedAgents[0];
        insights.push({
          type: 'agent_focusing',
          priority: 'medium',
          agent: bestAgent,
          insight: `Best performer for ${pattern} pattern`,
          action: `Route ${pattern} tasks to ${bestAgent} first (has ${bestCount} successful completions)`,
          supporting_data: {
            success_count: bestCount,
            confidence: 0.8,
          },
          generated_at: new Date().toISOString(),
        });
      }
    }

    return insights;
  }

  /**
   * Generate a summary of the learning sync
   */
  private generateSummary(
    agentPerformances: Record<string, AgentPerformanceStats>,
    insights: LearningInsight[]
  ): string {
    const agentCount = Object.keys(agentPerformances).length;
    const highPriorityInsights = insights.filter((i) => i.priority === 'high').length;
    const avgSuccessRate =
      Object.values(agentPerformances).reduce((sum, s) => sum + s.success_rate, 0) /
      (agentCount || 1);

    return `Weekly Learning Sync Summary:\n` +
      `- ${agentCount} agents analyzed\n` +
      `- Average success rate: ${(avgSuccessRate * 100).toFixed(0)}%\n` +
           `- ${highPriorityInsights} high-priority insights to act on\n` +
           `- ${this.avoidList.size} failure patterns to avoid`;
  }

  /**
   * Extract characteristics from task and DNA
   */
  private extractCharacteristics(
    taskTitle: string,
    taskDescription: string,
    dna: TaskDNA
  ): string[] {
    const chars = new Set<string>();

    // From task text
    const text = `${taskTitle} ${taskDescription}`.toLowerCase();
    const keywords = [
      'implement', 'fix', 'test', 'refactor', 'design',
      'api', 'ui', 'database', 'auth', 'deploy', 'review',
      'optimize', 'bug', 'feature', 'typescript', 'frontend',
      'backend', 'integration', 'documentation'
    ];

    for (const kw of keywords) {
      if (text.includes(kw)) {
        chars.add(kw);
      }
    }

    // From agent interactions
    for (const interaction of dna.agent_interactions) {
      const action = interaction.action.toLowerCase();
      for (const kw of keywords) {
        if (action.includes(kw)) {
          chars.add(kw);
        }
      }
    }

    return Array.from(chars);
  }

  /**
   * Extract basic characteristics from task text only
   */
  private extractBasicCharacteristics(taskTitle: string, taskDescription: string): string[] {
    const text = `${taskTitle} ${taskDescription}`.toLowerCase();
    const characteristics: string[] = [];
    const keywords = [
      'implement', 'fix', 'test', 'refactor', 'design',
      'api', 'ui', 'database', 'auth', 'deploy', 'review',
      'optimize', 'bug', 'feature', 'typescript', 'frontend',
      'backend', 'integration', 'documentation'
    ];

    for (const kw of keywords) {
      if (text.includes(kw)) {
        characteristics.push(kw);
      }
    }

    return characteristics;
  }

  /**
   * Infer task type from characteristics
   */
  private inferTaskType(characteristics: string[]): string {
    if (characteristics.includes('api') || characteristics.includes('backend')) {
      return 'backend';
    }
    if (characteristics.includes('ui') || characteristics.includes('frontend')) {
      return 'frontend';
    }
    if (characteristics.includes('database')) {
      return 'database';
    }
    if (characteristics.includes('test')) {
      return 'testing';
    }
    if (characteristics.includes('fix') || characteristics.includes('bug')) {
      return 'bugfix';
    }
    return 'general';
  }

  /**
   * Generate pattern ID from characteristics
   */
  private generatePatternId(characteristics: string[]): string {
    if (characteristics.length === 0) {
      return `pattern_general_${Date.now()}`;
    }
    const sorted = [...characteristics].sort();
    return `pattern_${sorted.join('_')}_${Date.now()}`;
  }

  /**
   * Update agent statistics
   */
  private updateAgentStats(
    agent: string,
    success: boolean,
    durationMs: number,
    patternId: string
  ): void {
    let stats = this.agentStats.get(agent);

    if (!stats) {
      stats = {
        agent_id: agent,
        total_tasks: 0,
        successful_tasks: 0,
        failed_tasks: 0,
        success_rate: 0,
        avg_duration_ms: 0,
        best_patterns: [],
        weak_patterns: [],
        improvement_suggestions: [],
      };
      this.agentStats.set(agent, stats);
    }

    stats.total_tasks++;
    if (success) {
      stats.successful_tasks++;
    } else {
      stats.failed_tasks++;
    }

    // Update average duration
    if (durationMs > 0) {
      stats.avg_duration_ms =
        (stats.avg_duration_ms * (stats.total_tasks - 1) + durationMs) /
        stats.total_tasks;
    }

    // Update success rate
    stats.success_rate = stats.successful_tasks / stats.total_tasks;
  }

  /**
   * Get failures for a specific pattern
   */
  private getFailuresForPattern(agent: string, pattern: string): Memory[] {
    return this.memoryStore.query({
      agent,
      type: 'failure',
      tags: [pattern],
    });
  }

  /**
   * Extract common failure reasons from failure memories
   */
  private extractCommonFailureReasons(failures: Memory[]): string[] {
    const reasons: string[] = [];

    for (const failure of failures) {
      // Extract reason from content
      const match = failure.content.match(/Reason:\s*([^\n]+)/);
      if (match) {
        reasons.push(match[1].trim());
      }
    }

    // Count and return most common
    const counts = new Map<string, number>();
    for (const reason of reasons) {
      counts.set(reason, (counts.get(reason) || 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason]) => reason);
  }

  /**
   * Generate prompt optimization suggestion
   */
  private generatePromptOptimization(
    agent: string,
    pattern: string,
    failureReasons: string[]
  ): string {
    const cleanPattern = pattern.replace(/^(pattern_|failure_)/, '');
    const reasons = failureReasons.slice(0, 2).join(', ');

    return `"For tasks involving ${cleanPattern}, ensure ${reasons}. Add context about ${cleanPattern} requirements upfront."`;
  }

  /**
   * Serialize meta-learning state
   */
  serialize(): string {
    return JSON.stringify({
      avoidList: Array.from(this.avoidList.entries()),
      agentStats: Array.from(this.agentStats.entries()),
      lastSyncTimestamp: this.lastSyncTimestamp,
    });
  }

  /**
   * Deserialize meta-learning state
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.avoidList = new Map(parsed.avoidList || []);
      this.agentStats = new Map(parsed.agentStats || []);
      this.lastSyncTimestamp = parsed.lastSyncTimestamp || null;
    } catch (error) {
      console.error('Failed to deserialize meta-learning state:', error);
    }
  }
}

// Singleton instance
let metaLearningInstance: MetaLearningEngine | null = null;

/**
 * Get the meta-learning engine instance
 */
export function getMetaLearningEngine(): MetaLearningEngine {
  if (!metaLearningInstance) {
    metaLearningInstance = new MetaLearningEngine();
  }
  return metaLearningInstance;
}

/**
 * Convenience function to log task outcome
 */
export function logTaskOutcome(
  taskId: string,
  agent: string,
  taskTitle: string,
  taskDescription: string,
  success: boolean,
  outcome: {
    completion_time_ms?: number;
    quality_score?: number;
    failure_reason?: string;
  }
): void {
  const engine = getMetaLearningEngine();

  if (success) {
    engine.logSuccess(
      taskId,
      agent,
      taskTitle,
      taskDescription,
      {
        completion_time_ms: outcome.completion_time_ms || 0,
        quality_score: outcome.quality_score || 0.8,
      }
    );
  } else {
    engine.logFailure(
      taskId,
      agent,
      taskTitle,
      taskDescription,
      outcome.failure_reason || 'Unknown reason'
    );
  }
}

/**
 * Get actionable prompt suggestions for all agents
 */
export function getAllPromptSuggestions(): Array<{ agent: string; suggestion: string }> {
  const engine = getMetaLearningEngine();
  const dnaTracker = getDNATracker();
  const suggestions: Array<{ agent: string; suggestion: string }> = [];

  // Get all unique agents from DNA tracker
  const allPatterns = dnaTracker.getAllPatterns();
  const agents = new Set<string>();
  for (const pattern of allPatterns) {
    for (const agent of pattern.recommended_agents) {
      agents.add(agent);
    }
  }

  // Also check from memory store
  const memories = getMemoryStore().query();
  for (const memory of memories) {
    agents.add(memory.agent);
  }

  // Generate suggestions for each agent
  for (const agent of agents) {
    const suggestion = engine.getPromptSuggestion(agent);
    if (suggestion) {
      suggestions.push({ agent, suggestion });
    }
  }

  return suggestions;
}

/**
 * Generate weekly learning sync as readable text
 */
export function generateWeeklySyncReport(): string {
  const engine = getMetaLearningEngine();
  const report = engine.generateWeeklySync();

  let output = '# Weekly Learning Sync Report\n\n';
  output += `**Period:** ${new Date(report.week_start).toLocaleDateString()} - ${new Date(report.week_end).toLocaleDateString()}\n`;
  output += `**Tasks Analyzed:** ${report.total_tasks_analyzed}\n\n`;
  output += '## Summary\n\n';
  output += report.summary + '\n\n';

  output += '## Agent Performance\n\n';
  for (const [agent, stats] of Object.entries(report.agent_performances)) {
    output += `### ${agent}\n`;
    output += `- Success Rate: ${(stats.success_rate * 100).toFixed(0)}%\n`;
    output += `- Tasks: ${stats.total_tasks} (${stats.successful_tasks} successful, ${stats.failed_tasks} failed)\n`;
    output += `- Avg Duration: ${(stats.avg_duration_ms / 1000).toFixed(0)}s\n`;
    if (stats.best_patterns.length > 0) {
      output += `- Best Patterns: ${stats.best_patterns.join(', ')}\n`;
    }
    if (stats.weak_patterns.length > 0) {
      output += `- Weak Patterns: ${stats.weak_patterns.join(', ')}\n`;
    }
    output += '\n';
  }

  output += '## Actionable Insights\n\n';
  for (const insight of report.insights) {
    const emoji = insight.priority === 'high' ? '🔴' : insight.priority === 'medium' ? '🟡' : '🟢';
    output += `### ${emoji} ${insight.agent}\n`;
    output += `**Type:** ${insight.type}\n`;
    output += `**Insight:** ${insight.insight}\n`;
    output += `**Action:** ${insight.action}\n`;
    output += '\n';
  }

  output += '## Failure Patterns to Avoid\n\n';
  for (const pattern of report.failure_patterns.slice(0, 10)) {
    output += `### ${pattern.id}\n`;
    output += `- Agent: ${pattern.agent_id}\n`;
    output += `- Occurrences: ${pattern.occurrence_count}\n`;
    output += `- Avoid Reason: ${pattern.avoid_reason}\n`;
    output += '\n';
  }

  return output;
}

/**
 * Get quick prompt optimizations for immediate action
 */
export function getQuickPromptOptimizations(): string {
  const suggestions = getAllPromptSuggestions();

  if (suggestions.length === 0) {
    return 'No prompt optimizations available yet. Need more task data.';
  }

  let output = '# Quick Prompt Optimizations\n\n';
  output += 'Apply these changes immediately to improve agent performance:\n\n';

  for (const { agent, suggestion } of suggestions.slice(0, 5)) {
    output += `## @${agent}\n${suggestion}\n\n`;
  }

  return output;
}
