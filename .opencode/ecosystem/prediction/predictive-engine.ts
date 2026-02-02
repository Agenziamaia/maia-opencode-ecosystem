/**
 * PREDICTIVE INTELLIGENCE ENGINE
 *
 * Anticipates user needs and prevents problems before they happen.
 * Based on patterns from swarm_intel.py and DNA tracking.
 *
 * The Predictive Engine is the proactive layer of MAIA - instead of just
 * reacting to user requests, it anticipates what the user will need next
 * and suggests optimizations proactively.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                 PREDICTIVE INTELLIGENCE                          │
 * │                   (Proactive Layer)                              │
 * │                                                                   │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
 * │  │    Pattern   │→ │    Risk      │→ │ Optimization │          │
 * │  │  Prediction  │  │  Detection   │  │ Suggestions  │          │
 * │  │              │  │              │  │              │          │
 * │  │ - Next steps │  │ - Problems   │  │ - Efficiency │          │
 * │  │ - Resources  │  │ - Conflicts  │  │ - Quality    │          │
 * │  │ - Agents     │  │ - Timeouts   │  │ - Speed      │          │
 * │  └──────────────┘  └──────────────┘  └──────────────┘          │
 * └─────────────────────────────────────────────────────────────────┘
 */

import { getDNATracker, Pattern, DNAMatchResult } from '../dna/dna-tracker.js';
import { getConstitution, AgentAction } from '../constitution/constitution.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * User Context - Current state of the user's work
 */
export interface UserContext {
  currentTask?: {
    id: string;
    title: string;
    description: string;
    type: string;
    startedAt: string;
    progress: number; // 0-1
  };
  recentTasks: Array<{
    id: string;
    title: string;
    completedAt: string;
    success: boolean;
  }>;
  activeAgents: string[];
  systemState: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkStatus: 'connected' | 'disconnected' | 'slow';
  };
  timeContext: {
    currentTime: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    isWorkHours: boolean;
  };
  projectContext?: {
    name: string;
    type: string;
    phase: string;
    techStack: string[];
  };
}

/**
 * Prediction - Anticipated future need or action
 */
export interface Prediction {
  id: string;
  type: 'next_action' | 'resource_need' | 'agent_suggestion' | 'risk_mitigation' | 'optimization';
  confidence: number; // 0-1
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  prediction: string;
  reasoning: string;
  evidence: string[]; // What patterns/data support this prediction
  suggestedActions: SuggestedAction[];
  estimatedImpact: {
    timeSaved?: number; // in minutes
    qualityImproved?: boolean;
    riskPrevented?: string;
  };
  validUntil: string;
  createdAt: string;
}

/**
 * Suggested Action - Recommended action based on prediction
 */
export interface SuggestedAction {
  action: string;
  description: string;
  type: 'automatic' | 'manual' | 'consultative';
  priority: number;
  estimatedDuration?: number; // in minutes
  prerequisites: string[];
}

/**
 * Risk - Detected potential problem
 */
export interface Risk {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'timeout' | 'conflict' | 'resource' | 'quality' | 'security' | 'dependency';
  title: string;
  description: string;
  probability: number; // 0-1
  timeframe: string; // When is this likely to occur?
  mitigation: MitigationStrategy[];
  detectedAt: string;
  status: 'detected' | 'mitigating' | 'resolved' | 'false_positive';
}

/**
 * Mitigation Strategy - How to address a risk
 */
export interface MitigationStrategy {
  strategy: string;
  description: string;
  type: 'preventive' | 'reactive' | 'monitoring';
  effort: 'low' | 'medium' | 'high';
  effectiveness: number; // 0-1
}

/**
 * Optimization - Suggested improvement
 */
export interface Optimization {
  id: string;
  category: 'speed' | 'quality' | 'resource' | 'workflow' | 'collaboration';
  title: string;
  description: string;
  currentValue: string;
  suggestedValue: string;
  improvement: {
    type: 'percentage' | 'absolute';
    value: number;
    unit: string;
  };
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  dependencies: string[];
  suggestedAt: string;
}

/**
 * Workflow - Represents a workflow for analysis
 */
export interface Workflow {
  id: string;
  name: string;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    assignedAgent?: string;
    dependencies: string[];
  }>;
  status: string;
  startedAt: string;
}

/**
 * System State - Current system state
 */
export interface SystemState {
  activeTasks: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  agentLoad: Record<string, number>; // agent ID -> load (0-1)
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
  recentErrors: Array<{
    error: string;
    count: number;
    lastOccurrence: string;
  }>;
}

// ============================================================================
// PATTERN DEFINITIONS
// ============================================================================

/**
 * Task transition patterns - what typically follows what
 */
export const TASK_PATTERNS: Record<string, {
  nextLikely: Array<{ task: string; probability: number }>;
  typicalDuration: number; // in minutes
  requiredResources: string[];
}> = {
  'implement': {
    nextLikely: [
      { task: 'test', probability: 0.85 },
      { task: 'review', probability: 0.70 },
      { task: 'document', probability: 0.40 }
    ],
    typicalDuration: 30,
    requiredResources: ['coder', 'reviewer']
  },
  'test': {
    nextLikely: [
      { task: 'fix', probability: 0.60 },
      { task: 'review', probability: 0.80 },
      { task: 'deploy', probability: 0.50 }
    ],
    typicalDuration: 15,
    requiredResources: ['reviewer']
  },
  'deploy': {
    nextLikely: [
      { task: 'monitor', probability: 0.90 },
      { task: 'document', probability: 0.60 }
    ],
    typicalDuration: 10,
    requiredResources: ['ops']
  },
  'research': {
    nextLikely: [
      { task: 'plan', probability: 0.75 },
      { task: 'implement', probability: 0.50 }
    ],
    typicalDuration: 45,
    requiredResources: ['researcher', 'maia']
  },
  'fix': {
    nextLikely: [
      { task: 'test', probability: 0.95 },
      { task: 'verify', probability: 0.70 }
    ],
    typicalDuration: 20,
    requiredResources: ['coder']
  },
  'plan': {
    nextLikely: [
      { task: 'implement', probability: 0.80 },
      { task: 'refactor', probability: 0.30 }
    ],
    typicalDuration: 20,
    requiredResources: ['maia', 'sisyphus']
  }
};

/**
 * Risk patterns - indicators of potential problems
 */
export const RISK_PATTERNS: Array<{
  indicator: string;
  riskType: Risk['category'];
  severity: Risk['severity'];
  probability: number;
  mitigation: string;
}> = [
  {
    indicator: 'task_duration_exceeded_2x_estimate',
    riskType: 'timeout',
    severity: 'warning',
    probability: 0.7,
    mitigation: 'Estimate was likely too low. Consider breaking down task or extending timeout.'
  },
  {
    indicator: 'multiple_agents_same_task',
    riskType: 'conflict',
    severity: 'warning',
    probability: 0.6,
    mitigation: 'Multiple agents may create merge conflicts. Consider council coordination.'
  },
  {
    indicator: 'high_failure_rate_agent',
    riskType: 'quality',
    severity: 'error',
    probability: 0.8,
    mitigation: 'Agent is struggling. Consider reassigning task or providing guidance.'
  },
  {
    indicator: 'disk_space_low',
    riskType: 'resource',
    severity: 'critical',
    probability: 0.9,
    mitigation: 'Clean up temporary files or expand storage immediately.'
  },
  {
    indicator: 'uncommitted_changes_before_deploy',
    riskType: 'dependency',
    severity: 'error',
    probability: 0.95,
    mitigation: 'Commit or stash changes before deployment to prevent data loss.'
  },
  {
    indicator: 'no_tests_before_production',
    riskType: 'quality',
    severity: 'error',
    probability: 0.85,
    mitigation: 'Write tests before deploying to production.'
  }
];

/**
 * Optimization opportunities
 */
export const OPTIMIZATION_PATTERNS: Array<{
  condition: string;
  optimization: Omit<Optimization, 'id' | 'suggestedAt'>;
}> = [
  {
    condition: 'sequential_independent_tasks',
    optimization: {
      category: 'speed',
      title: 'Parallelize Independent Tasks',
      description: 'These tasks have no dependencies and can run in parallel',
      currentValue: 'Sequential execution',
      suggestedValue: 'Parallel execution',
      improvement: { type: 'percentage', value: 60, unit: 'time' },
      effort: 'low',
      confidence: 0.9,
      dependencies: []
    }
  },
  {
    condition: 'repeated_similar_tasks',
    optimization: {
      category: 'workflow',
      title: 'Create Reusable Pattern',
      description: 'This task type occurs frequently - create a reusable pattern',
      currentValue: 'Ad-hoc execution',
      suggestedValue: 'Pattern-based execution',
      improvement: { type: 'percentage', value: 40, unit: 'time' },
      effort: 'medium',
      confidence: 0.8,
      dependencies: ['pattern_definition']
    }
  },
  {
    condition: 'agent_underutilized',
    optimization: {
      category: 'resource',
      title: 'Increase Agent Utilization',
      description: 'This agent has capacity and can handle more tasks',
      currentValue: 'Current utilization',
      suggestedValue: 'Higher utilization',
      improvement: { type: 'percentage', value: 30, unit: 'throughput' },
      effort: 'low',
      confidence: 0.7,
      dependencies: []
    }
  },
  {
    condition: 'manual_repetitive_action',
    optimization: {
      category: 'collaboration',
      title: 'Automate Repetitive Action',
      description: 'This action is repeated manually - consider automation',
      currentValue: 'Manual execution',
      suggestedValue: 'Automated execution',
      improvement: { type: 'percentage', value: 80, unit: 'time' },
      effort: 'medium',
      confidence: 0.85,
      dependencies: ['automation_script']
    }
  }
];

// ============================================================================
// MAIN PREDICTIVE ENGINE CLASS
// ============================================================================

export class PredictiveEngine {
  private dna: ReturnType<typeof getDNATracker>;
  private constitution: ReturnType<typeof getConstitution>;
  private predictions: Map<string, Prediction>;
  private risks: Map<string, Risk>;
  private optimizations: Map<string, Optimization>;
  private predictionHistory: Array<{
    prediction: Prediction;
    accurate: boolean;
    validatedAt: string;
  }>;

  constructor() {
    this.dna = getDNATracker();
    this.constitution = getConstitution();
    this.predictions = new Map();
    this.risks = new Map();
    this.optimizations = new Map();
    this.predictionHistory = [];
  }

  // ==========================================================================
  // PREDICTION
  // ==========================================================================

  /**
   * Predict what the user will need next
   */
  predictNext(currentContext: UserContext): Prediction[] {
    const predictions: Prediction[] = [];

    // 1. Predict next action based on current task
    if (currentContext.currentTask) {
      const nextActionPrediction = this.predictNextAction(currentContext);
      if (nextActionPrediction) {
        predictions.push(nextActionPrediction);
      }
    }

    // 2. Predict resource needs
    const resourcePrediction = this.predictResourceNeeds(currentContext);
    if (resourcePrediction) {
      predictions.push(resourcePrediction);
    }

    // 3. Predict optimal agents
    const agentPrediction = this.predictOptimalAgents(currentContext);
    if (agentPrediction) {
      predictions.push(agentPrediction);
    }

    // 4. Predict based on time context
    const timePrediction = this.predictBasedOnTime(currentContext);
    if (timePrediction) {
      predictions.push(timePrediction);
    }

    // Store predictions
    for (const prediction of predictions) {
      this.predictions.set(prediction.id, prediction);
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Predict the next action based on current task
   */
  private predictNextAction(context: UserContext): Prediction | null {
    if (!context.currentTask) return null;

    const taskType = this.extractTaskType(context.currentTask.title);
    const pattern = TASK_PATTERNS[taskType];

    if (!pattern) return null;

    // Find most likely next task
    const mostLikely = pattern.nextLikely[0];
    if (!mostLikely || mostLikely.probability < 0.6) return null;

    return {
      id: `prediction_${Date.now()}_next_action`,
      type: 'next_action',
      confidence: mostLikely.probability,
      urgency: context.currentTask.progress > 0.8 ? 'high' : 'medium',
      prediction: `User will likely need to: ${mostLikely.task}`,
      reasoning: `Pattern analysis shows "${taskType}" is typically followed by "${mostLikely.task}" with ${mostLikely.probability * 100}% probability`,
      evidence: [
        `Current task type: ${taskType}`,
        `Pattern match: ${mostLikely.probability * 100}% confidence`,
        `Historical precedence: ${pattern.nextLikely.length} possible next actions`
      ],
      suggestedActions: [
        {
          action: `Prepare for ${mostLikely.task} phase`,
          description: `Get ready for the ${mostLikely.task} phase that typically follows`,
          type: 'automatic',
          priority: 2,
          prerequisites: []
        },
        {
          action: `Pre-allocate resources for ${mostLikely.task}`,
          description: `Ensure required resources are available: ${pattern.requiredResources.join(', ')}`,
          type: 'automatic',
          priority: 3,
          prerequisites: []
        }
      ],
      estimatedImpact: {
        timeSaved: 5 // Save 5 minutes by preparing ahead
      },
      validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Valid for 30 minutes
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Predict resource needs
   */
  private predictResourceNeeds(context: UserContext): Prediction | null {
    // Check if we're running low on resources
    const needs: string[] = [];

    if (context.systemState.memoryUsage > 0.8) {
      needs.push('additional memory');
    }
    if (context.systemState.cpuUsage > 0.9) {
      needs.push('CPU capacity');
    }
    if (context.systemState.diskUsage > 0.85) {
      needs.push('disk space (critical)');
    }

    if (needs.length === 0) return null;

    return {
      id: `prediction_${Date.now()}_resource`,
      type: 'resource_need',
      confidence: 0.85,
      urgency: needs.includes('disk space (critical)') ? 'immediate' : 'high',
      prediction: `System will need: ${needs.join(', ')}`,
      reasoning: 'Current resource usage trends indicate upcoming resource exhaustion',
      evidence: [
        `Memory usage: ${(context.systemState.memoryUsage * 100).toFixed(1)}%`,
        `CPU usage: ${(context.systemState.cpuUsage * 100).toFixed(1)}%`,
        `Disk usage: ${(context.systemState.diskUsage * 100).toFixed(1)}%`
      ],
      suggestedActions: [
        {
          action: 'Clean up temporary files',
          description: 'Remove temporary files and caches to free up space',
          type: 'automatic',
          priority: 1,
          prerequisites: []
        },
        {
          action: 'Optimize memory usage',
          description: 'Identify and optimize memory-intensive operations',
          type: 'consultative',
          priority: 2,
          prerequisites: ['memory_analysis']
        }
      ],
      estimatedImpact: {
        timeSaved: 0,
        riskPrevented: 'System crash or slowdown'
      },
      validUntil: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Valid for 1 hour
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Predict optimal agents for upcoming work
   */
  private predictOptimalAgents(context: UserContext): Prediction | null {
    if (!context.currentTask) return null;

    // Use DNA tracker to find patterns and recommended agents
    const patternMatch = this.dna.findPattern(
      context.currentTask.title,
      context.currentTask.description
    );

    if (!patternMatch || patternMatch.confidence < 0.7) return null;

    const recommendedAgents = patternMatch.pattern.recommended_agents;

    return {
      id: `prediction_${Date.now()}_agents`,
      type: 'agent_suggestion',
      confidence: patternMatch.confidence,
      urgency: 'medium',
      prediction: `Optimal agents for current task: ${recommendedAgents.join(', ')}`,
      reasoning: `DNA pattern matching suggests these agents have high success rate for similar tasks`,
      evidence: [
        `Pattern: ${patternMatch.pattern.name}`,
        `Success rate: ${(patternMatch.pattern.success_rate * 100).toFixed(1)}%`,
        `Sample size: ${patternMatch.pattern.sample_size} tasks`
      ],
      suggestedActions: [
        {
          action: `Assign task to ${recommendedAgents[0] || 'suitable agent'}`,
          description: 'Use pattern-based agent assignment for higher success rate',
          type: 'automatic',
          priority: 1,
          prerequisites: []
        },
        {
          action: 'Prepare backup agents',
          description: `Have ${recommendedAgents.slice(1).join(', ')} as backups`,
          type: 'automatic',
          priority: 3,
          prerequisites: []
        }
      ],
      estimatedImpact: {
        timeSaved: 10,
        qualityImproved: true
      },
      validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Valid for 2 hours
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Predict based on time of day/day of week
   */
  private predictBasedOnTime(context: UserContext): Prediction | null {
    const { timeContext } = context;

    // Late night - suggest rest or documentation
    if (timeContext.timeOfDay === 'night') {
      return {
        id: `prediction_${Date.now()}_time_night`,
        type: 'optimization',
        confidence: 0.7,
        urgency: 'low',
        prediction: 'Consider switching to documentation or planning tasks',
        reasoning: 'Late night hours are better suited for lighter cognitive tasks',
        evidence: [
          `Current time: ${timeContext.timeOfDay}`,
          'Cognitive performance typically lower at night',
          'Documentation and planning require less focus'
        ],
        suggestedActions: [
          {
            action: 'Switch to documentation',
            description: 'Update documentation instead of implementing features',
            type: 'consultative',
            priority: 2,
            prerequisites: []
          },
          {
            action: 'Plan tomorrow\'s work',
            description: 'Create a plan for tomorrow\'s tasks',
            type: 'manual',
            priority: 1,
            prerequisites: []
          }
        ],
        estimatedImpact: {
          qualityImproved: true
        },
        validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
    }

    // Morning - suggest high-focus tasks
    if (timeContext.timeOfDay === 'morning' && timeContext.isWorkHours) {
      return {
        id: `prediction_${Date.now()}_time_morning`,
        type: 'optimization',
        confidence: 0.75,
        urgency: 'medium',
        prediction: 'Good time for high-focus or complex tasks',
        reasoning: 'Morning hours typically have highest cognitive performance',
        evidence: [
          `Current time: ${timeContext.timeOfDay}`,
          'Peak cognitive performance in morning',
          'Ideal for complex problem-solving'
        ],
        suggestedActions: [
          {
            action: 'Tackle complex task',
            description: 'Work on the most challenging or complex task now',
            type: 'consultative',
            priority: 1,
            prerequisites: []
          },
          {
            action: 'Schedule important work',
            description: 'Plan important tasks during morning hours',
            type: 'manual',
            priority: 2,
            prerequisites: []
          }
        ],
        estimatedImpact: {
          qualityImproved: true
        },
        validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * Extract task type from title
   */
  private extractTaskType(title: string): string {
    const lower = title.toLowerCase();

    if (lower.includes('implement') || lower.includes('build') || lower.includes('create')) {
      return 'implement';
    }
    if (lower.includes('test')) {
      return 'test';
    }
    if (lower.includes('deploy') || lower.includes('release')) {
      return 'deploy';
    }
    if (lower.includes('research') || lower.includes('investigate')) {
      return 'research';
    }
    if (lower.includes('fix') || lower.includes('bug')) {
      return 'fix';
    }
    if (lower.includes('plan') || lower.includes('design')) {
      return 'plan';
    }

    return 'implement'; // Default
  }

  // ==========================================================================
  // RISK DETECTION
  // ==========================================================================

  /**
   * Detect potential problems before they occur
   */
  detectRisks(workflow: Workflow, context: UserContext): Risk[] {
    const risks: Risk[] = [];

    // Check for timeout risks using DNA history
    const dna = getDNATracker();
    for (const task of workflow.tasks) {
      if (task.status === 'running' && task.startedAt) {
        const runningMs = Date.now() - new Date(task.startedAt).getTime();
        // Use DNA to find historical average for similar tasks
        const match = dna.findPattern(task.title, task.description);
        const expectedMs = match?.pattern.avg_completion_time_ms || 300000; // 5min default

        if (runningMs > expectedMs * 2) {
          risks.push({
            id: `risk_${Date.now()}_timeout_${task.id}`,
            severity: runningMs > expectedMs * 3 ? 'error' : 'warning',
            category: 'timeout',
            title: `Task ${task.id} exceeding expected duration`,
            description: `Running for ${Math.floor(runningMs / 60000)}min, expected ~${Math.floor(expectedMs / 60000)}min based on ${match ? 'DNA pattern' : 'default estimate'}`,
            probability: 0.7,
            timeframe: 'Now',
            mitigation: [
              {
                strategy: 'Check task progress',
                description: 'Verify if the agent is making progress or stalled',
                type: 'reactive',
                effort: 'low',
                effectiveness: 0.8
              },
              {
                strategy: 'Reassign to backup agent',
                description: `Consider reassigning from @${task.assignedAgent || 'unknown'}`,
                type: 'reactive',
                effort: 'medium',
                effectiveness: 0.7
              }
            ],
            detectedAt: new Date().toISOString(),
            status: 'detected'
          });
        }
      }

      // Check for quality risks using DNA agent performance
      if (task.assignedAgent) {
        const agentPerf = dna.analyzeAgentPerformance(task.assignedAgent);
        if (agentPerf.successRate < 0.5 && agentPerf.taskCount >= 3) {
          risks.push({
            id: `risk_${Date.now()}_quality_${task.id}`,
            severity: 'warning',
            category: 'quality',
            title: `Low success rate for @${task.assignedAgent}`,
            description: `Agent has ${(agentPerf.successRate * 100).toFixed(0)}% success rate over ${agentPerf.taskCount} tasks`,
            probability: 0.8,
            timeframe: 'Soon',
            mitigation: [
              {
                strategy: 'Assign backup agent',
                description: 'Route to a higher-performing agent for this task type',
                type: 'preventive',
                effort: 'low',
                effectiveness: 0.9
              }
            ],
            detectedAt: new Date().toISOString(),
            status: 'detected'
          });
        }
      }
    }

    // Check for resource risks
    if (context.systemState.diskUsage > 0.9) {
      risks.push({
        id: `risk_${Date.now()}_disk`,
        severity: 'critical',
        category: 'resource',
        title: 'Disk space critically low',
        description: `Disk usage is at ${(context.systemState.diskUsage * 100).toFixed(1)}%`,
        probability: 0.95,
        timeframe: 'Immediate',
        mitigation: [
          {
            strategy: 'Clean up temporary files',
            description: 'Remove temporary files and caches',
            type: 'preventive',
            effort: 'low',
            effectiveness: 0.8
          },
          {
            strategy: 'Expand storage',
            description: 'Add more disk space',
            type: 'preventive',
            effort: 'high',
            effectiveness: 1.0
          }
        ],
        detectedAt: new Date().toISOString(),
        status: 'detected'
      });
    }

    // Check for conflict risks (multiple agents on same files)
    const agentsPerTask = new Map<string, string[]>();
    for (const task of workflow.tasks) {
      if (task.assignedAgent) {
        if (!agentsPerTask.has(task.id)) {
          agentsPerTask.set(task.id, []);
        }
        agentsPerTask.get(task.id)!.push(task.assignedAgent);
      }
    }

    for (const [taskId, agents] of agentsPerTask) {
      if (agents.length > 1) {
        risks.push({
          id: `risk_${Date.now()}_conflict_${taskId}`,
          severity: 'warning',
          category: 'conflict',
          title: `Multiple agents on task ${taskId}`,
          description: `Agents ${agents.join(', ')} are working on the same task`,
          probability: 0.6,
          timeframe: 'Soon',
          mitigation: [
            {
              strategy: 'Coordinate via council',
              description: 'Use council voting to coordinate approach',
              type: 'preventive',
              effort: 'medium',
              effectiveness: 0.9
            },
            {
              strategy: 'Divide task responsibility',
              description: 'Split task into independent subtasks',
              type: 'preventive',
              effort: 'low',
              effectiveness: 0.8
            }
          ],
          detectedAt: new Date().toISOString(),
          status: 'detected'
        });
      }
    }

    // Store risks
    for (const risk of risks) {
      this.risks.set(risk.id, risk);
    }

    return risks;
  }

  // ==========================================================================
  // OPTIMIZATION SUGGESTIONS
  // ==========================================================================

  /**
   * Suggest optimizations proactively
   */
  suggestOptimizations(systemState: SystemState): Optimization[] {
    const optimizations: Optimization[] = [];

    // Check for parallelization opportunities
    if (systemState.activeTasks > 1) {
      const opt = OPTIMIZATION_PATTERNS.find(p => p.condition === 'sequential_independent_tasks');
      if (opt) {
        optimizations.push({
          id: `opt_${Date.now()}_parallel`,
          ...opt.optimization,
          suggestedAt: new Date().toISOString()
        });
      }
    }

    // Check for agent underutilization
    for (const [agentId, load] of Object.entries(systemState.agentLoad)) {
      if (load < 0.3) {
        const opt = OPTIMIZATION_PATTERNS.find(p => p.condition === 'agent_underutilized');
        if (opt) {
          optimizations.push({
            id: `opt_${Date.now()}_agent_${agentId}`,
            ...opt.optimization,
            title: `Increase ${agentId} utilization`,
            description: `Agent ${agentId} has capacity (${(load * 100).toFixed(0)}% utilized)`,
            currentValue: `${(load * 100).toFixed(0)}% utilization`,
            suggestedValue: 'Higher utilization',
            suggestedAt: new Date().toISOString()
          });
        }
      }
    }

    // Check for pattern creation opportunities
    const recentFailures = systemState.recentErrors.filter(e => e.count > 2);
    if (recentFailures.length > 0) {
      const opt = OPTIMIZATION_PATTERNS.find(p => p.condition === 'repeated_similar_tasks');
      if (opt) {
        optimizations.push({
          id: `opt_${Date.now()}_pattern`,
          ...opt.optimization,
          suggestedAt: new Date().toISOString()
        });
      }
    }

    // Store optimizations
    for (const optimization of optimizations) {
      this.optimizations.set(optimization.id, optimization);
    }

    return optimizations;
  }

  // ==========================================================================
  // VALIDATION AND LEARNING
  // ==========================================================================

  /**
   * Validate a prediction (was it accurate?)
   */
  validatePrediction(predictionId: string, accurate: boolean): void {
    const prediction = this.predictions.get(predictionId);
    if (!prediction) return;

    this.predictionHistory.push({
      prediction,
      accurate,
      validatedAt: new Date().toISOString()
    });

    // Learn from validation
    // In production, would adjust confidence scores based on accuracy
  }

  /**
   * Get prediction accuracy statistics
   */
  getAccuracyStats(): {
    totalPredictions: number;
    accuratePredictions: number;
    accuracyRate: number;
    byType: Record<string, { total: number; accurate: number }>;
  } {
    const totalPredictions = this.predictionHistory.length;
    const accuratePredictions = this.predictionHistory.filter(p => p.accurate).length;
    const accuracyRate = totalPredictions > 0 ? accuratePredictions / totalPredictions : 0;

    const byType: Record<string, { total: number; accurate: number }> = {};

    for (const { prediction, accurate } of this.predictionHistory) {
      if (!byType[prediction.type]) {
        byType[prediction.type] = { total: 0, accurate: 0 };
      }
      byType[prediction.type].total++;
      if (accurate) {
        byType[prediction.type].accurate++;
      }
    }

    return {
      totalPredictions,
      accuratePredictions,
      accuracyRate,
      byType
    };
  }

  // ==========================================================================
  // QUERIES
  // ==========================================================================

  /**
   * Get active predictions
   */
  getActivePredictions(): Prediction[] {
    const now = new Date();
    return Array.from(this.predictions.values()).filter(p => {
      const validUntil = new Date(p.validUntil);
      return validUntil > now;
    });
  }

  /**
   * Get active risks
   */
  getActiveRisks(): Risk[] {
    return Array.from(this.risks.values()).filter(r => r.status !== 'resolved');
  }

  /**
   * Get pending optimizations
   */
  getPendingOptimizations(): Optimization[] {
    return Array.from(this.optimizations.values());
  }

  /**
   * Update risk status
   */
  updateRiskStatus(riskId: string, status: Risk['status']): void {
    const risk = this.risks.get(riskId);
    if (risk) {
      risk.status = status;
    }
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  /**
   * Serialize predictive engine state
   */
  serialize(): string {
    return JSON.stringify({
      predictions: Array.from(this.predictions.entries()),
      risks: Array.from(this.risks.entries()),
      optimizations: Array.from(this.optimizations.entries()),
      predictionHistory: this.predictionHistory.slice(-100) // Keep last 100
    });
  }

  /**
   * Deserialize predictive engine state
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.predictions = new Map(parsed.predictions || []);
      this.risks = new Map(parsed.risks || []);
      this.optimizations = new Map(parsed.optimizations || []);
      this.predictionHistory = parsed.predictionHistory || [];
    } catch (error) {
      console.error('Failed to deserialize predictive engine:', error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let predictiveEngineInstance: PredictiveEngine | null = null;

export function getPredictiveEngine(): PredictiveEngine {
  if (!predictiveEngineInstance) {
    predictiveEngineInstance = new PredictiveEngine();
  }
  return predictiveEngineInstance;
}

export function resetPredictiveEngine(): void {
  predictiveEngineInstance = null;
}
