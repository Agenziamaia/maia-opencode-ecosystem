/**
 * DNA Tracking System
 *
 * Purpose: Track patterns, agent interactions, and outcomes to enable
 * emergent behavior and learning in the MAIA ecosystem.
 *
 * Architecture:
 * - Pattern recognition from task execution history
 * - Agent interaction analysis
 * - Outcome metric calculation
 * - Learning feedback loop
 */

export interface AgentInteraction {
  agent_id: string;
  timestamp: string;
  action: string;
  duration_ms: number;
  context?: Record<string, unknown>;
}

export interface OutcomeMetrics {
  completion_time_ms: number;
  revision_count: number;
  quality_score: number;
}

export interface TaskDNA {
  pattern_id?: string;
  pattern_confidence: number;
  agent_interactions: AgentInteraction[];
  outcome?: 'success' | 'partial' | 'failure' | 'pending';
  outcome_metrics?: OutcomeMetrics;
  learned_patterns: string[];
}

export interface Pattern {
  id: string;
  name: string;
  task_type: string;
  characteristics: string[];
  success_rate: number;
  avg_completion_time_ms: number;
  recommended_agents: string[];
  sample_size: number;
  last_updated: string;
}

export interface DNAMatchResult {
  pattern: Pattern;
  confidence: number;
  reasoning: string;
}

/**
 * DNA Tracker - Main class for tracking and analyzing task execution patterns
 */
export class DNATracker {
  private patterns: Map<string, Pattern>;
  private taskHistory: Map<string, TaskDNA>;

  constructor() {
    this.patterns = new Map();
    this.taskHistory = new Map();
  }

  /**
   * Record an agent interaction for a task
   */
  recordInteraction(taskId: string, interaction: AgentInteraction): void {
    const dna = this.getOrCreateDNA(taskId);
    dna.agent_interactions.push(interaction);
    dna.agent_interactions.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * Record task outcome and calculate metrics
   */
  recordOutcome(
    taskId: string,
    outcome: TaskDNA['outcome'],
    metrics: OutcomeMetrics
  ): void {
    const dna = this.getOrCreateDNA(taskId);
    dna.outcome = outcome;
    dna.outcome_metrics = metrics;

    if (outcome !== 'pending') {
      this.extractAndLearn(taskId, dna);
    }
  }

  /**
   * Find matching pattern for a new task
   */
  findPattern(taskTitle: string, taskDescription: string): DNAMatchResult | null {
    const features = this.extractFeatures(taskTitle, taskDescription);
    let bestMatch: DNAMatchResult | null = null;

    for (const pattern of this.patterns.values()) {
      const confidence = this.calculatePatternMatch(features, pattern);
      if (confidence > 0.7 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = {
          pattern,
          confidence,
          reasoning: `Matches ${pattern.name} with ${confidence.toFixed(2)} confidence`,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Get DNA for a task
   */
  getDNA(taskId: string): TaskDNA | undefined {
    return this.taskHistory.get(taskId);
  }

  /**
   * Get all patterns
   */
  getAllPatterns(): Pattern[] {
    return Array.from(this.patterns.values());
  }

  getPatternsForAgent(agentId: string): Pattern[] {
    return Array.from(this.patterns.values()).filter((p) =>
      p.recommended_agents.includes(agentId)
    );
  }

  analyzeAgentPerformance(agentId: string): {
    taskCount: number;
    avgDuration: number;
    successRate: number;
    commonPatterns: string[];
  } {
    const agentTasks = Array.from(this.taskHistory.values()).filter((dna) =>
      dna.agent_interactions.some((ai) => ai.agent_id === agentId)
    );

    const completed = agentTasks.filter((dna) => dna.outcome === 'success');

    const durations = agentTasks
      .filter((dna) => dna.outcome_metrics)
      .map((dna) => dna.outcome_metrics!.completion_time_ms);

    const patternCounts = new Map<string, number>();
    agentTasks.forEach((dna) => {
      if (dna.pattern_id) {
        patternCounts.set(
          dna.pattern_id,
          (patternCounts.get(dna.pattern_id) || 0) + 1
        );
      }
    });

    return {
      taskCount: agentTasks.length,
      avgDuration:
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
      successRate:
        agentTasks.length > 0 ? completed.length / agentTasks.length : 0,
      commonPatterns: Array.from(patternCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id),
    };
  }

  private getOrCreateDNA(taskId: string): TaskDNA {
    if (!this.taskHistory.has(taskId)) {
      this.taskHistory.set(taskId, {
        pattern_confidence: 0,
        agent_interactions: [],
        learned_patterns: [],
      });
    }
    return this.taskHistory.get(taskId)!;
  }

  private extractFeatures(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const features: string[] = [];

    const keywords = [
      'implement',
      'fix',
      'test',
      'refactor',
      'design',
      'api',
      'ui',
      'database',
      'auth',
      'deploy',
      'review',
      'optimize',
    ];

    keywords.forEach((kw) => {
      if (text.includes(kw)) {
        features.push(kw);
      }
    });

    return features;
  }

  private calculatePatternMatch(features: string[], pattern: Pattern): number {
    let matches = 0;
    features.forEach((f) => {
      if (pattern.characteristics.includes(f)) {
        matches++;
      }
    });

    const featureScore = features.length > 0 ? matches / features.length : 0;
    const successWeight = pattern.success_rate;

    return featureScore * 0.6 + successWeight * 0.4;
  }

  private extractAndLearn(taskId: string, dna: TaskDNA): void {
    if (!dna.outcome_metrics || dna.outcome !== 'success') {
      return;
    }

    const features = dna.agent_interactions.map((ai) => ai.action);
    const uniqueAgents = new Set(dna.agent_interactions.map((ai) => ai.agent_id));

    const patternId = this.findOrCreatePatternId(features, dna.outcome_metrics);

    this.updatePattern(patternId, {
      agents: Array.from(uniqueAgents),
      outcomeMetrics: dna.outcome_metrics,
    });

    dna.pattern_id = patternId;
    dna.learned_patterns.push(patternId);
  }

  private findOrCreatePatternId(
    features: string[],
    metrics: OutcomeMetrics
  ): string {
    for (const [id, pattern] of this.patterns.entries()) {
      const matchCount = features.filter((f) =>
        pattern.characteristics.includes(f)
      ).length;

      if (matchCount >= pattern.characteristics.length * 0.7) {
        return id;
      }
    }

    const newPattern: Pattern = {
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Pattern for ${features[0] || 'general'} tasks`,
      task_type: features[0] || 'general',
      characteristics: features,
      success_rate: 1.0,
      avg_completion_time_ms: metrics.completion_time_ms,
      recommended_agents: [],
      sample_size: 1,
      last_updated: new Date().toISOString(),
    };

    this.patterns.set(newPattern.id, newPattern);
    return newPattern.id;
  }

  private updatePattern(
    patternId: string,
    data: { agents: string[]; outcomeMetrics: OutcomeMetrics }
  ): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;

    pattern.sample_size++;
    pattern.success_rate =
      (pattern.success_rate * (pattern.sample_size - 1) +
        (data.outcomeMetrics.quality_score > 0.7 ? 1 : 0)) /
      pattern.sample_size;
    pattern.avg_completion_time_ms =
      (pattern.avg_completion_time_ms * (pattern.sample_size - 1) +
        data.outcomeMetrics.completion_time_ms) /
      pattern.sample_size;
    pattern.last_updated = new Date().toISOString();

    data.agents.forEach((agent) => {
      if (!pattern.recommended_agents.includes(agent)) {
        pattern.recommended_agents.push(agent);
      }
    });

    pattern.recommended_agents.sort();
  }

  /**
   * Serialize DNA tracker state for persistence
   */
  serialize(): string {
    return JSON.stringify({
      patterns: Array.from(this.patterns.entries()),
      taskHistory: Array.from(this.taskHistory.entries()),
    });
  }

  /**
   * Deserialize DNA tracker state
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.patterns = new Map(parsed.patterns);
      this.taskHistory = new Map(parsed.taskHistory);
    } catch (error) {
      console.error('Failed to deserialize DNA tracker:', error);
    }
  }
}

let dnaTrackerInstance: DNATracker | null = null;

export function getDNATracker(): DNATracker {
  if (!dnaTrackerInstance) {
    dnaTrackerInstance = new DNATracker();
  }
  return dnaTrackerInstance;
}
