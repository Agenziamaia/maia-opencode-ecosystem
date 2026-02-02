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

/**
 * Task categories for semantic grouping
 */
export type TaskCategory =
  | 'bugfix'
  | 'feature'
  | 'refactor'
  | 'documentation'
  | 'testing'
  | 'deployment'
  | 'review'
  | 'research'
  | 'optimization'
  | 'general';

/**
 * Complexity level for task estimation
 */
export type ComplexityLevel = 'low' | 'medium' | 'high' | 'unknown';

/**
 * Semantic vector for similarity comparison
 * Uses TF-IDF style representation: { word: weight }
 */
export type SemanticVector = Record<string, number>;

/**
 * Enhanced Pattern with semantic features
 */
export interface Pattern {
  id: string;
  name: string;
  task_type: string;
  task_category: TaskCategory;
  characteristics: string[];
  // Semantic features
  description: string;
  semantic_vector: SemanticVector;
  file_types: string[];
  complexity: ComplexityLevel;
  // Performance metrics
  success_rate: number;
  avg_completion_time_ms: number;
  recommended_agents: string[];
  agent_performance: Map<string, number>; // agent_id -> success_rate
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
   * Find matching pattern for a new task with semantic similarity
   *
   * TWO-STAGE MATCHING:
   * 1. Keyword matching (fast, exact word overlap)
   * 2. Semantic similarity (slower, but captures meaning)
   */
  findPattern(taskTitle: string, taskDescription: string): DNAMatchResult | null {
    const fullText = `${taskTitle} ${taskDescription}`;
    const features = this.extractFeatures(taskTitle, taskDescription);
    let bestMatch: DNAMatchResult | null = null;
    let bestSemanticMatch: DNAMatchResult | null = null;

    for (const pattern of Array.from(this.patterns.values())) {
      // STAGE 1: Keyword matching
      const keywordConfidence = this.calculatePatternMatch(features, pattern);
      if (keywordConfidence > 0.7 && (!bestMatch || keywordConfidence > bestMatch.confidence)) {
        bestMatch = {
          pattern,
          confidence: keywordConfidence,
          reasoning: `Keyword match: ${pattern.name} (${keywordConfidence.toFixed(2)})`,
        };
      }

      // STAGE 2: Semantic similarity (TF-IDF cosine similarity)
      const semanticScore = this.calculateSemanticSimilarity(fullText, pattern);
      const combinedScore = keywordConfidence * 0.4 + semanticScore * 0.6;

      if (semanticScore > 0.5 && (!bestSemanticMatch || semanticScore > bestSemanticMatch.confidence)) {
        bestSemanticMatch = {
          pattern,
          confidence: combinedScore,
          reasoning: `Semantic match: ${pattern.name} (similarity: ${semanticScore.toFixed(2)}, combined: ${combinedScore.toFixed(2)})`,
        };
      }
    }

    // Prefer semantic match if it exists and is strong enough
    if (bestSemanticMatch && bestSemanticMatch.confidence > 0.6) {
      return bestSemanticMatch;
    }

    // Fall back to keyword match
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

  // ============================================================
  // SEMANTIC SIMILARITY - TF-IDF Vector Based Matching
  // ============================================================

  /**
   * Calculate semantic similarity between task text and pattern
   * Uses TF-IDF vector + cosine similarity
   */
  private calculateSemanticSimilarity(text: string, pattern: Pattern): number {
    const textVector = this.createSemanticVector(text);
    return this.cosineSimilarity(textVector, pattern.semantic_vector);
  }

  /**
   * Create semantic vector from text using TF-IDF approach
   * Returns a normalized vector of word weights
   */
  private createSemanticVector(text: string): SemanticVector {
    // Normalize and tokenize
    const normalized = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const tokens = normalized.split(' ').filter(t => t.length > 2);

    // Count term frequencies
    const tf: Record<string, number> = {};
    tokens.forEach(token => {
      tf[token] = (tf[token] || 0) + 1;
    });

    // Apply TF-IDF weighting (simplified - using log TF)
    const vector: SemanticVector = {};
    let maxFreq = 0;

    Object.entries(tf).forEach(([word, freq]) => {
      if (freq > maxFreq) maxFreq = freq;
    });

    Object.entries(tf).forEach(([word, freq]) => {
      // TF component: normalized frequency
      const tfWeight = 0.5 + 0.5 * (freq / maxFreq);
      // IDF component: rare words get higher weight (simplified)
      const idfWeight = Math.log(1 + tokens.length / freq);
      vector[word] = tfWeight * idfWeight;
    });

    // Normalize vector
    return this.normalizeVector(vector);
  }

  /**
   * Normalize vector to unit length
   */
  private normalizeVector(vector: SemanticVector): SemanticVector {
    const magnitude = Math.sqrt(
      Object.values(vector).reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude === 0) return vector;

    const normalized: SemanticVector = {};
    Object.entries(vector).forEach(([word, weight]) => {
      normalized[word] = weight / magnitude;
    });

    return normalized;
  }

  /**
   * Calculate cosine similarity between two semantic vectors
   * Returns 0-1 score where 1 = identical, 0 = orthogonal
   */
  private cosineSimilarity(vec1: SemanticVector, vec2: SemanticVector): number {
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    // Calculate dot product and magnitudes
    const allWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);

    allWords.forEach(word => {
      const v1 = vec1[word] || 0;
      const v2 = vec2[word] || 0;
      dotProduct += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    });

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;

    return dotProduct / (mag1 * mag2);
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

    // Build full task description from interactions
    const taskDescription = features.join(' ');

    // Extract enhanced features
    const taskCategory = this.inferTaskCategory(taskDescription);
    const fileTypes = this.extractFileTypes(taskDescription);
    const complexity = this.estimateComplexity(taskDescription, dna);

    const patternId = this.findOrCreatePatternId(
      features,
      dna.outcome_metrics,
      taskDescription,
      taskCategory,
      fileTypes,
      complexity
    );

    // Update with agent-specific performance tracking
    const agents = Array.from(uniqueAgents);
    this.updatePattern(patternId, {
      agents,
      outcomeMetrics: dna.outcome_metrics,
      taskId,
    });

    dna.pattern_id = patternId;
    dna.learned_patterns.push(patternId);
  }

  // ============================================================
  // ENHANCED FEATURE EXTRACTION
  // ============================================================

  /**
   * Infer task category from description using semantic keywords
   */
  private inferTaskCategory(description: string): TaskCategory {
    const text = description.toLowerCase();

    // Category detection with semantic synonyms
    const categoryPatterns: Record<TaskCategory, string[]> = {
      bugfix: ['fix', 'bug', 'error', 'debug', 'issue', 'repair', 'resolve', 'patch', 'broken', 'crash', 'fail'],
      feature: ['implement', 'add', 'create', 'new', 'feature', 'enhancement', 'extend', 'introduce', 'build'],
      refactor: ['refactor', 'restructure', 'reorganize', 'clean', 'simplify', 'rework', 'modernize', 'improve structure'],
      documentation: ['document', 'readme', 'comment', 'explain', 'guide', 'tutorial', 'doc', 'manual'],
      testing: ['test', 'spec', 'assert', 'verify', 'validate', 'check', 'coverage', 'unit test', 'integration test'],
      deployment: ['deploy', 'release', 'publish', 'ship', 'install', 'setup', 'configure', 'provision'],
      review: ['review', 'audit', 'inspect', 'examine', 'analyze', 'check', 'verify', 'approve'],
      research: ['research', 'investigate', 'explore', 'find', 'search', 'discover', 'look into', 'study'],
      optimization: ['optimize', 'performance', 'speed', 'cache', 'improve', 'accelerate', 'efficient', 'fast'],
      general: ['task', 'update', 'change', 'modify', 'handle', 'process'],
    };

    let bestCategory: TaskCategory = 'general';
    let maxMatches = 0;

    Object.entries(categoryPatterns).forEach(([category, patterns]) => {
      const matches = patterns.filter(p => text.includes(p)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category as TaskCategory;
      }
    });

    return bestCategory;
  }

  /**
   * Extract file types mentioned in the task
   */
  private extractFileTypes(description: string): string[] {
    const fileExtensions = [
      '.ts', '.tsx', '.js', '.jsx',
      '.py', '.rb', '.go', '.rs',
      '.md', '.txt', '.json', '.yaml', '.yml',
      '.css', '.scss', '.html',
      '.sql', '.db',
      '.sh', '.bash',
    ];

    const found: string[] = [];
    fileExtensions.forEach(ext => {
      if (description.toLowerCase().includes(ext)) {
        found.push(ext);
      }
    });

    // Also look for generic file type mentions
    const genericTypes = ['typescript', 'javascript', 'python', 'sql', 'markdown', 'yaml'];
    const typeToExt: Record<string, string> = {
      'typescript': '.ts',
      'javascript': '.js',
      'python': '.py',
      'sql': '.sql',
      'markdown': '.md',
      'yaml': '.yaml',
    };

    genericTypes.forEach(type => {
      if (description.toLowerCase().includes(type) && !found.includes(typeToExt[type])) {
        found.push(typeToExt[type]);
      }
    });

    return found.length > 0 ? found : ['.unknown'];
  }

  /**
   * Estimate complexity based on description and execution metrics
   */
  private estimateComplexity(description: string, dna: TaskDNA): ComplexityLevel {
    const text = description.toLowerCase();
    const metrics = dna.outcome_metrics;

    if (!metrics) return 'unknown';

    // High complexity indicators
    const highComplexityPatterns = [
      'architecture', 'redesign', 'migration', 'database', 'infrastructure',
      'integration', 'authentication', 'authorization', 'security',
    ];

    // Low complexity indicators
    const lowComplexityPatterns = [
      'typo', 'spelling', 'format', 'whitespace', 'comment', 'rename',
      'simple', 'minor', 'trivial',
    ];

    const hasHighPattern = highComplexityPatterns.some(p => text.includes(p));
    const hasLowPattern = lowComplexityPatterns.some(p => text.includes(p));

    // Combine text analysis with execution metrics
    const avgTime = metrics.completion_time_ms;
    const revisions = metrics.revision_count;

    if (hasHighPattern || avgTime > 300000 || revisions > 3) {
      return 'high';
    } else if (hasLowPattern || avgTime < 30000) {
      return 'low';
    } else {
      return 'medium';
    }
  }

  private findOrCreatePatternId(
    features: string[],
    metrics: OutcomeMetrics,
    taskDescription: string,
    taskCategory: TaskCategory,
    fileTypes: string[],
    complexity: ComplexityLevel
  ): string {
    // First, try to find existing pattern with semantic similarity
    for (const [id, pattern] of Array.from(this.patterns.entries())) {
      const semanticScore = this.calculateSemanticSimilarity(taskDescription, pattern);
      const featureMatchCount = features.filter((f) =>
        pattern.characteristics.includes(f)
      ).length;

      // Match if: high semantic similarity OR high feature overlap
      if (
        (semanticScore > 0.6 && pattern.task_category === taskCategory) ||
        featureMatchCount >= pattern.characteristics.length * 0.7
      ) {
        return id;
      }
    }

    // Create new pattern with enhanced features
    const semanticVector = this.createSemanticVector(taskDescription);
    const newPattern: Pattern = {
      id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${taskCategory.charAt(0).toUpperCase() + taskCategory.slice(1)} - ${features[0] || 'general'} tasks`,
      task_type: features[0] || 'general',
      task_category: taskCategory,
      characteristics: features,
      description: taskDescription.substring(0, 200), // Store truncated description
      semantic_vector: semanticVector,
      file_types: fileTypes,
      complexity: complexity,
      success_rate: 1.0,
      avg_completion_time_ms: metrics.completion_time_ms,
      recommended_agents: [],
      agent_performance: new Map<string, number>(),
      sample_size: 1,
      last_updated: new Date().toISOString(),
    };

    this.patterns.set(newPattern.id, newPattern);
    return newPattern.id;
  }

  private updatePattern(
    patternId: string,
    data: { agents: string[]; outcomeMetrics: OutcomeMetrics; taskId: string }
  ): void {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return;

    const wasSuccess = data.outcomeMetrics.quality_score > 0.7;
    pattern.sample_size++;

    // Update overall success rate (exponential moving average for better adaptation)
    const alpha = 0.3; // Learning rate
    pattern.success_rate = alpha * (wasSuccess ? 1 : 0) + (1 - alpha) * pattern.success_rate;

    // Update average completion time
    pattern.avg_completion_time_ms =
      (pattern.avg_completion_time_ms * (pattern.sample_size - 1) +
        data.outcomeMetrics.completion_time_ms) /
      pattern.sample_size;

    pattern.last_updated = new Date().toISOString();

    // Track per-agent performance
    data.agents.forEach((agent) => {
      if (!pattern.recommended_agents.includes(agent)) {
        pattern.recommended_agents.push(agent);
      }

      // Update agent-specific success rate
      const currentRate = pattern.agent_performance.get(agent) ?? 0.5;
      const agentRate = alpha * (wasSuccess ? 1 : 0) + (1 - alpha) * currentRate;
      pattern.agent_performance.set(agent, agentRate);
    });

    // Sort recommended agents by their performance on this pattern
    pattern.recommended_agents.sort((a, b) => {
      const rateA = pattern.agent_performance.get(a) ?? 0.5;
      const rateB = pattern.agent_performance.get(b) ?? 0.5;
      return rateB - rateA; // Descending order
    });
  }

  /**
   * Serialize DNA tracker state for persistence
   */
  serialize(): string {
    // Convert Map to object for JSON serialization
    const patternsArray = Array.from(this.patterns.entries()).map(([id, pattern]) => [
      id,
      {
        ...pattern,
        agent_performance: Array.from(pattern.agent_performance.entries()),
      },
    ]);

    return JSON.stringify({
      patterns: patternsArray,
      taskHistory: Array.from(this.taskHistory.entries()),
    });
  }

  /**
   * Deserialize DNA tracker state
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);

      // Convert agent_performance arrays back to Maps
      const patternsMap = new Map<string, Pattern>(
        parsed.patterns.map(([id, pattern]: [string, any]) => [
          id,
          {
            ...pattern,
            agent_performance: new Map<string, number>(pattern.agent_performance || []),
          } as Pattern,
        ])
      );

      this.patterns = patternsMap as unknown as Map<string, Pattern>;
      this.taskHistory = new Map<string, TaskDNA>(parsed.taskHistory);
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
