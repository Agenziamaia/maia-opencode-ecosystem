/**
 * MAIA ORCHESTRATOR (The Supreme Brain)
 *
 * This is the STRATEGIC LAYER of the MAIA ecosystem.
 * Unlike MaiaDaemon (dispatch layer), the Orchestrator:
 * - Creates EXECUTION PLANS from natural language objectives
 * - DECOMPOSES complex objectives into subtasks with dependencies
 * - ROUTES to optimal agents using DNA/pattern learning
 * - ORCHESTRATES multi-agent workflows (parallel/sequential)
 * - SYNTHESIZES results into final deliverables
 * - LEARNS from every execution via meta-learning
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      USER OBJECTIVE                          │
 * │                  "Build a REST API"                          │
 * └──────────────────────────┬──────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                   MAIA ORCHESTRATOR                          │
 * │                  (Strategic Layer)                           │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
 * │  │   Planning   │→ │ Decomposition│→ │  Assignment  │      │
 * │  │     Phase    │  │    Phase     │  │    Phase     │      │
 * │  └──────────────┘  └──────────────┘  └──────────────┘      │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
 * │  │  Execution   │→ │  Synthesis   │→ │   Learning   │      │
 * │  │    Phase     │  │    Phase     │  │    Phase     │      │
 * │  └──────────────┘  └──────────────┘  └──────────────┘      │
 * └──────────────────────────┬──────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    MAIA DAEMON                               │
 * │                   (Dispatch Layer)                           │
 * │  - Routes individual tasks to agents                        │
 * │  - Monitors execution                                       │
 * │  - Handles retries and fallbacks                            │
 * └──────────────────────────┬──────────────────────────────────┘
 *                             │
 *                             ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                  EXECUTION MANAGER                           │
 * │              (Task Execution Layer)                          │
 * │  - Queue management                                         │
 * │  - Parallel/sequential execution                            │
 * │  - Worktree isolation                                       │
 * └─────────────────────────────────────────────────────────────┘
 */

import { EventEmitter } from 'events';
import { getMaiaDaemon } from '../execution/maia-daemon.js';
import { getExecutionManager, ExecutionTask, TaskStatus } from '../execution/execution-manager.js';
import { getAgentManager, AgentManager, AgentId } from '../agents/agent-manager.js';
import { getDNATracker, DNATracker } from '../dna/dna-tracker.js';
import { getMetaLearningEngine } from '../meta-learning.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Execution Plan - Created from natural language objective
 */
export interface ExecutionPlan {
  id: string;
  objective: string;
  objectiveType: 'trivial' | 'complex' | 'strategic';
  strategy: 'direct' | 'sequential' | 'parallel' | 'hybrid';
  estimatedDuration: number; // in minutes
  confidence: number; // 0-1
  reasoning: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

/**
 * SubTask - Decomposed unit of work
 */
export interface SubTask {
  id: string;
  planId: string;
  title: string;
  description: string;
  type: string;
  dependencies: string[]; // IDs of tasks this depends on
  priority: 'urgent' | 'high' | 'normal' | 'low';
  estimatedDuration: number; // in minutes
  requiredCapabilities: string[];
  recommendedAgents: AgentId[];
  dnaPatternMatch?: {
    patternId: string;
    confidence: number;
    reasoning: string;
  };
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'skipped';
  assignedAgent?: AgentId;
  executionTaskId?: string;
  startedAt?: string;
  completedAt?: string;
  result?: TaskResult;
}

/**
 * Assigned Task - A subtask with an agent assigned
 */
export interface AssignedTask extends SubTask {
  assignedAgent: AgentId;
  assignmentMethod: 'manual' | 'auto' | 'dna' | 'council';
  assignmentReason: string;
  backupAgents: AgentId[];
}

/**
 * Workflow - Orchestrated set of tasks
 */
export interface Workflow {
  id: string;
  planId: string;
  objective: string;
  tasks: AssignedTask[];
  executionGraph: ExecutionGraph;
  status: 'planning' | 'ready' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  metadata: Record<string, unknown>;
}

/**
 * Execution Graph - DAG of task dependencies
 */
export interface ExecutionGraph {
  nodes: string[]; // Task IDs
  edges: Array<{ from: string; to: string }>;
  parallelGroups: string[][]; // Groups of tasks that can run in parallel
  criticalPath: string[]; // Critical path for the workflow
}

/**
 * Task Result - Output from a completed task
 */
export interface TaskResult {
  taskId: string;
  agentId: AgentId;
  success: boolean;
  output: string;
  artifacts: Artifact[];
  duration: number; // in milliseconds
  error?: string;
  metadata: Record<string, unknown>;
}

/**
 * Artifact - Output file/data from a task
 */
export interface Artifact {
  type: 'file' | 'directory' | 'data' | 'url' | 'commit';
  path?: string;
  content?: string;
  url?: string;
  hash?: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Deliverable - Final synthesized output
 */
export interface Deliverable {
  workflowId: string;
  objective: string;
  summary: string;
  artifacts: Artifact[];
  taskResults: TaskResult[];
  metrics: DeliverableMetrics;
  synthesizedAt: string;
  nextActions?: string[];
}

/**
 * Deliverable Metrics
 */
export interface DeliverableMetrics {
  totalDuration: number; // in milliseconds
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  agentsInvolved: AgentId[];
  parallelismEfficiency: number; // 0-1, how well we parallelized
  estimatedVsActual: number; // ratio of estimated to actual duration
}

/**
 * Orchestrator Configuration
 */
export interface OrchestratorConfig {
  maxParallelTasks?: number;
  enableDNALearning?: boolean;
  enableAutoRetry?: boolean;
  maxRetries?: number;
  taskTimeout?: number; // in milliseconds
  planningTimeout?: number; // in milliseconds
  synthesisTimeout?: number; // in milliseconds
}

// ============================================================================
// MAIN ORCHESTRATOR CLASS
// ============================================================================

export class MaiaOrchestrator extends EventEmitter {
  private daemon: ReturnType<typeof getMaiaDaemon>;
  private execution: ReturnType<typeof getExecutionManager>;
  private agents: AgentManager;
  private dna: DNATracker;
  private config: Required<OrchestratorConfig>;

  // Active workflows
  private activeWorkflows: Map<string, Workflow>;
  private completedWorkflows: Map<string, Workflow>;

  constructor(config: OrchestratorConfig = {}) {
    super();

    this.daemon = getMaiaDaemon();
    this.execution = getExecutionManager();
    this.agents = getAgentManager();
    this.dna = getDNATracker();

    // Default configuration
    this.config = {
      maxParallelTasks: config.maxParallelTasks || 3,
      enableDNALearning: config.enableDNALearning ?? true,
      enableAutoRetry: config.enableAutoRetry ?? true,
      maxRetries: config.maxRetries || 2,
      taskTimeout: config.taskTimeout || 5 * 60 * 1000, // 5 minutes
      planningTimeout: config.planningTimeout || 2 * 60 * 1000, // 2 minutes
      synthesisTimeout: config.synthesisTimeout || 3 * 60 * 1000, // 3 minutes
    };

    this.activeWorkflows = new Map();
    this.completedWorkflows = new Map();

    this.bindEvents();
  }

  // ==========================================================================
  // PHASE 1: PLANNING
  // ==========================================================================

  /**
   * Create an execution plan from a natural language objective
   *
   * This is the entry point for all user objectives.
   * It analyzes the objective and determines:
   * - Type (trivial/complex/strategic)
   * - Strategy (direct/sequential/parallel/hybrid)
   * - Estimated duration
   * - Confidence level
   */
  async createPlan(objective: string): Promise<ExecutionPlan> {
    const startTime = Date.now();

    this.emit('planning:start', { objective });

    const plan: ExecutionPlan = {
      id: this.generateId('plan'),
      objective,
      objectiveType: this.classifyObjective(objective),
      strategy: this.determineStrategy(objective),
      estimatedDuration: this.estimateDuration(objective),
      confidence: 0,
      reasoning: '',
      createdAt: new Date().toISOString(),
      metadata: {},
    };

    // Build reasoning using DNA and agent capabilities
    plan.reasoning = await this.buildPlanningReasoning(objective, plan);

    // Calculate confidence based on DNA match
    plan.confidence = this.calculatePlanConfidence(objective, plan);

    this.emit('planning:complete', { plan, duration: Date.now() - startTime });

    return plan;
  }

  /**
   * Classify the objective type
   */
  private classifyObjective(objective: string): ExecutionPlan['objectiveType'] {
    const text = objective.toLowerCase();

    // Trivial: Single-step, clear scope
    const trivialIndicators = [
      'fix typo', 'change color', 'update text', 'rename file',
      'add comment', 'format code', 'simple fix', 'quick change'
    ];
    if (trivialIndicators.some(ind => text.includes(ind))) {
      return 'trivial';
    }

    // Strategic: High-level, precedent-setting, multi-system
    const strategicIndicators = [
      'architecture', 'strategy', 'roadmap', 'vision',
      'standards', 'guidelines', 'framework', 'platform'
    ];
    if (strategicIndicators.some(ind => text.includes(ind))) {
      return 'strategic';
    }

    // Complex: Multi-step, project work
    return 'complex';
  }

  /**
   * Determine the execution strategy
   */
  private determineStrategy(objective: string): ExecutionPlan['strategy'] {
    const text = objective.toLowerCase();

    // Direct: Execute immediately without planning
    if (this.classifyObjective(objective) === 'trivial') {
      return 'direct';
    }

    // Parallel: Independent tasks that can run simultaneously
    const parallelIndicators = ['multiple', 'separate', 'independent', 'concurrent'];
    if (parallelIndicators.some(ind => text.includes(ind))) {
      return 'parallel';
    }

    // Hybrid: Mix of parallel and sequential
    const hybridIndicators = ['feature', 'module', 'component', 'system'];
    if (hybridIndicators.some(ind => text.includes(ind))) {
      return 'hybrid';
    }

    // Sequential: Tasks have dependencies
    return 'sequential';
  }

  /**
   * Estimate duration based on historical data and heuristics
   */
  private estimateDuration(objective: string): number {
    const type = this.classifyObjective(objective);

    const baseDurations: Record<ExecutionPlan['objectiveType'], number> = {
      trivial: 2,      // 2 minutes
      complex: 30,     // 30 minutes
      strategic: 60,   // 60 minutes
    };

    let estimate = baseDurations[type];

    // Adjust based on complexity keywords
    const text = objective.toLowerCase();
    if (text.includes('multiple')) estimate *= 1.5;
    if (text.includes('complex')) estimate *= 2;
    if (text.includes('simple') || text.includes('quick')) estimate *= 0.5;

    return Math.round(estimate);
  }

  /**
   * Build reasoning for the plan using DNA and agent capabilities
   */
  private async buildPlanningReasoning(objective: string, plan: ExecutionPlan): Promise<string> {
    const reasoningParts: string[] = [];

    // 1. Classification reasoning
    reasoningParts.push(`Classified as ${plan.objectiveType} objective`);

    // 2. Strategy reasoning
    reasoningParts.push(`Selected ${plan.strategy} execution strategy`);

    // 3. DNA pattern matching
    if (this.config.enableDNALearning) {
      const patternMatch = this.dna.findPattern(plan.objective, objective);
      if (patternMatch) {
        reasoningParts.push(`Matched DNA pattern: ${patternMatch.pattern.name} (${patternMatch.confidence.toFixed(2)} confidence)`);
        plan.metadata.dnaPattern = patternMatch.pattern.id;
      }
    }

    // 4. Agent availability
    const availableAgents = this.agents.getAvailableAgents();
    reasoningParts.push(`${availableAgents.length} agents available for execution`);

    return reasoningParts.join('. ');
  }

  /**
   * Calculate confidence in the plan
   */
  private calculatePlanConfidence(objective: string, plan: ExecutionPlan): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence if we have DNA matches
    if (plan.metadata.dnaPattern) {
      confidence += 0.2;
    }

    // Boost confidence for trivial tasks
    if (plan.objectiveType === 'trivial') {
      confidence += 0.3;
    }

    // Reduce confidence for strategic tasks (more uncertainty)
    if (plan.objectiveType === 'strategic') {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  // ==========================================================================
  // PHASE 2: DECOMPOSITION
  // ==========================================================================

  /**
   * Decompose a plan into subtasks with dependencies
   */
  async decomposeTasks(plan: ExecutionPlan): Promise<SubTask[]> {
    this.emit('decomposition:start', { planId: plan.id });

    let subtasks: SubTask[] = [];

    // For trivial objectives, create a single task
    if (plan.objectiveType === 'trivial') {
      subtasks = [this.createDirectTask(plan)];
    }
    // For complex/strategic, use intelligent decomposition
    else {
      subtasks = await this.intelligentDecomposition(plan);
    }

    // Build dependency graph
    subtasks = this.buildDependencies(subtasks, plan);

    this.emit('decomposition:complete', { planId: plan.id, subtaskCount: subtasks.length });

    return subtasks;
  }

  /**
   * Create a direct task for trivial objectives
   */
  private createDirectTask(plan: ExecutionPlan): SubTask {
    return {
      id: this.generateId('task'),
      planId: plan.id,
      title: plan.objective.slice(0, 50),
      description: plan.objective,
      type: 'direct',
      dependencies: [],
      priority: 'normal',
      estimatedDuration: plan.estimatedDuration,
      requiredCapabilities: this.extractCapabilities(plan.objective),
      recommendedAgents: [],
      status: 'pending',
    };
  }

  /**
   * Intelligent decomposition for complex objectives
   *
   * This is where the "brain" of MAIA shines.
   * It breaks down complex objectives into manageable subtasks
   * using pattern recognition and agent capabilities.
   */
  private async intelligentDecomposition(plan: ExecutionPlan): Promise<SubTask[]> {
    const subtasks: SubTask[] = [];
    const objective = plan.objective.toLowerCase();

    // Use pattern matching to identify common task types
    const patterns = this.identifyTaskPatterns(objective);

    // Generate subtasks based on patterns
    for (const pattern of patterns) {
      const task = this.createTaskFromPattern(pattern, plan);
      subtasks.push(task);
    }

    // If no patterns matched, use generic decomposition
    if (subtasks.length === 0) {
      return this.genericDecomposition(plan);
    }

    return subtasks;
  }

  /**
   * Identify task patterns in the objective
   */
  private identifyTaskPatterns(objective: string): Array<{
    type: string;
    title: string;
    description: string;
    capabilities: string[];
    priority: 'urgent' | 'high' | 'normal' | 'low';
    order: number;
  }> {
    const patterns: Array<{
      type: string;
      title: string;
      description: string;
      capabilities: string[];
      priority: 'urgent' | 'high' | 'normal' | 'low';
      order: number;
    }> = [];

    // Research/Investigation pattern
    if (objective.includes('research') || objective.includes('investigate') || objective.includes('explore')) {
      patterns.push({
        type: 'research',
        title: 'Research and Investigation',
        description: 'Gather information, analyze requirements, research best practices',
        capabilities: ['research', 'meta'],
        priority: 'high',
        order: 1,
      });
    }

    // Planning pattern
    if (objective.includes('plan') || objective.includes('design') || objective.includes('architecture')) {
      patterns.push({
        type: 'planning',
        title: 'Planning and Design',
        description: 'Create detailed plan, design architecture, define milestones',
        capabilities: ['planning', 'meta'],
        priority: 'high',
        order: 2,
      });
    }

    // Implementation pattern
    if (objective.includes('implement') || objective.includes('build') || objective.includes('create') || objective.includes('add')) {
      patterns.push({
        type: 'implementation',
        title: 'Implementation',
        description: 'Write code, implement features, create components',
        capabilities: ['coding', 'frontend', 'backend'],
        priority: 'high',
        order: 3,
      });
    }

    // Testing pattern
    if (objective.includes('test') || objective.includes('verify') || objective.includes('validate')) {
      patterns.push({
        type: 'testing',
        title: 'Testing and Verification',
        description: 'Write tests, verify functionality, ensure quality',
        capabilities: ['testing', 'review'],
        priority: 'normal',
        order: 4,
      });
    }

    // Review pattern
    if (objective.includes('review') || objective.includes('audit') || objective.includes('check')) {
      patterns.push({
        type: 'review',
        title: 'Review and Audit',
        description: 'Review code, audit implementation, ensure standards',
        capabilities: ['review'],
        priority: 'normal',
        order: 5,
      });
    }

    // Deployment pattern
    if (objective.includes('deploy') || objective.includes('release') || objective.includes('ship')) {
      patterns.push({
        type: 'deployment',
        title: 'Deployment',
        description: 'Deploy to production, configure infrastructure',
        capabilities: ['infrastructure', 'devops'],
        priority: 'urgent',
        order: 6,
      });
    }

    // Documentation pattern
    if (objective.includes('document') || objective.includes('documenting')) {
      patterns.push({
        type: 'documentation',
        title: 'Documentation',
        description: 'Write documentation, update guides',
        capabilities: ['research', 'meta'],
        priority: 'low',
        order: 7,
      });
    }

    return patterns.sort((a, b) => a.order - b.order);
  }

  /**
   * Create a task from a pattern
   */
  private createTaskFromPattern(
    pattern: {
      type: string;
      title: string;
      description: string;
      capabilities: string[];
      priority: 'urgent' | 'high' | 'normal' | 'low';
      order: number;
    },
    plan: ExecutionPlan
  ): SubTask {
    const task: SubTask = {
      id: this.generateId('task'),
      planId: plan.id,
      title: pattern.title,
      description: `${pattern.description}\n\nContext: ${plan.objective}`,
      type: pattern.type,
      dependencies: [], // Will be filled in by buildDependencies
      priority: pattern.priority,
      estimatedDuration: Math.round(plan.estimatedDuration / 4), // Rough estimate
      requiredCapabilities: pattern.capabilities,
      recommendedAgents: [],
      status: 'pending',
    };

    return task;
  }

  /**
   * Generic decomposition when no patterns match
   */
  private genericDecomposition(plan: ExecutionPlan): SubTask[] {
    return [
      {
        id: this.generateId('task'),
        planId: plan.id,
        title: 'Execute Objective',
        description: plan.objective,
        type: 'generic',
        dependencies: [],
        priority: 'normal',
        estimatedDuration: plan.estimatedDuration,
        requiredCapabilities: this.extractCapabilities(plan.objective),
        recommendedAgents: [],
        status: 'pending',
      },
    ];
  }

  /**
   * Build dependencies between tasks
   */
  private buildDependencies(subtasks: SubTask[], plan: ExecutionPlan): SubTask[] {
    // For sequential strategy, chain tasks
    if (plan.strategy === 'sequential') {
      for (let i = 1; i < subtasks.length; i++) {
        subtasks[i].dependencies.push(subtasks[i - 1].id);
      }
    }
    // For hybrid strategy, create dependency groups
    else if (plan.strategy === 'hybrid') {
      // Find logical groups (e.g., research → [implementation, testing] → review)
      const typeOrder = ['research', 'planning', 'implementation', 'testing', 'review', 'documentation', 'deployment'];

      // Sort tasks by type order
      subtasks.sort((a, b) => {
        const aIndex = typeOrder.indexOf(a.type);
        const bIndex = typeOrder.indexOf(b.type);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

      // Add dependencies to previous type
      for (let i = 1; i < subtasks.length; i++) {
        const currentType = subtasks[i].type;
        const previousType = subtasks[i - 1].type;

        if (typeOrder.indexOf(currentType) > typeOrder.indexOf(previousType)) {
          subtasks[i].dependencies.push(subtasks[i - 1].id);
        }
      }
    }

    return subtasks;
  }

  /**
   * Extract required capabilities from objective
   */
  private extractCapabilities(objective: string): string[] {
    const capabilities: string[] = [];
    const text = objective.toLowerCase();

    const capabilityMap: Record<string, string[]> = {
      'coding': ['implement', 'code', 'function', 'class', 'logic'],
      'research': ['research', 'investigate', 'explore', 'find', 'search'],
      'testing': ['test', 'verify', 'validate', 'check'],
      'planning': ['plan', 'design', 'architecture', 'roadmap'],
      'frontend': ['ui', 'frontend', 'interface', 'component'],
      'backend': ['backend', 'api', 'server', 'database'],
      'infrastructure': ['deploy', 'infrastructure', 'devops', 'ci/cd'],
      'review': ['review', 'audit', 'inspect'],
    };

    for (const [capability, keywords] of Object.entries(capabilityMap)) {
      if (keywords.some(kw => text.includes(kw))) {
        capabilities.push(capability);
      }
    }

    return capabilities.length > 0 ? capabilities : ['coding'];
  }

  // ==========================================================================
  // PHASE 3: ASSIGNMENT
  // ==========================================================================

  /**
   * Assign agents to tasks
   */
  async assignAgents(tasks: SubTask[]): Promise<AssignedTask[]> {
    this.emit('assignment:start', { taskCount: tasks.length });

    const assignedTasks: AssignedTask[] = [];

    for (const task of tasks) {
      const assigned = await this.assignAgent(task);
      assignedTasks.push(assigned);
    }

    this.emit('assignment:complete', { assignedTasks });

    return assignedTasks;
  }

  /**
   * Assign an agent to a single task
   */
  private async assignAgent(task: SubTask): Promise<AssignedTask> {
    let agentId: AgentId = 'maia';
    let assignmentMethod: AssignedTask['assignmentMethod'] = 'auto';
    let assignmentReason: string = 'Default assignment to MAIA';
    let backupAgents: AgentId[] = [];

    // 1. Check DNA pattern match first
    if (this.config.enableDNALearning && task.dnaPatternMatch) {
      // Look up full pattern from DNA tracker by patternId
      const fullPattern = this.dna.getAllPatterns().find(
        p => p.id === task.dnaPatternMatch!.patternId
      );
      const patternAgents = fullPattern?.recommended_agents ?? [];
      if (patternAgents.length > 0) {
        // Find first available agent from pattern
        for (const patternAgent of patternAgents) {
          if (this.agents.isAvailable(patternAgent as AgentId)) {
            agentId = patternAgent as AgentId;
            assignmentMethod = 'dna';
            assignmentReason = `Matched DNA pattern ${task.dnaPatternMatch.patternId} with ${task.dnaPatternMatch.confidence.toFixed(2)} confidence`;
            break;
          }
        }
      }
    }

    // 2. Use auto-assignment if DNA didn't assign
    if (agentId === 'maia' && assignmentMethod === 'auto' && assignmentReason.startsWith('Default')) {
      const assignment = this.agents.autoAssign(task.title, task.description);
      if (assignment) {
        agentId = assignment.primary_agent;
        assignmentMethod = assignment.assignment_method as AssignedTask['assignmentMethod'];
        assignmentReason = `Auto-assigned based on capability match: ${task.requiredCapabilities.join(', ')}`;
        backupAgents = assignment.backup_agents;
      }
    }

    // 3. Health check the assigned agent
    const isHealthy = await this.agents.healthCheck(agentId);
    if (!isHealthy && backupAgents.length > 0) {
      // Try backup agents
      for (const backup of backupAgents) {
        if (await this.agents.healthCheck(backup)) {
          agentId = backup;
          assignmentReason += ` (fallback from primary due to health check)`;
          break;
        }
      }
    }

    return {
      ...task,
      assignedAgent: agentId,
      assignmentMethod,
      assignmentReason,
      backupAgents,
      status: 'assigned',
    };
  }

  // ==========================================================================
  // PHASE 4: EXECUTION
  // ==========================================================================

  /**
   * Execute a workflow
   *
   * This is where the orchestration happens.
   * It manages the execution graph and coordinates parallel/sequential tasks.
   */
  async executeWorkflow(workflow: Workflow): Promise<WorkflowResult> {
    this.emit('execution:start', { workflowId: workflow.id });

    workflow.status = 'running';
    workflow.startedAt = new Date().toISOString();
    this.activeWorkflows.set(workflow.id, workflow);

    const startTime = Date.now();
    const results: TaskResult[] = [];

    try {
      // Execute based on strategy
      if (workflow.executionGraph.parallelGroups.length > 0) {
        // Hybrid/Parallel execution
        await this.executeParallelGroups(workflow, results);
      } else {
        // Sequential execution
        await this.executeSequential(workflow, results);
      }

      // Mark workflow as completed
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();

      const duration = Date.now() - startTime;
      this.emit('execution:complete', { workflowId: workflow.id, duration });

      // Move to completed workflows
      this.activeWorkflows.delete(workflow.id);
      this.completedWorkflows.set(workflow.id, workflow);

      return {
        workflowId: workflow.id,
        success: workflow.status === 'completed',
        duration,
        taskResults: results,
        completedTasks: results.length,
        failedTasks: results.filter(r => !r.success).length,
      };

    } catch (error) {
      workflow.status = 'failed';
      workflow.completedAt = new Date().toISOString();

      this.emit('execution:failed', { workflowId: workflow.id, error });

      return {
        workflowId: workflow.id,
        success: false,
        duration: Date.now() - startTime,
        taskResults: results,
        completedTasks: results.length,
        failedTasks: results.filter(r => !r.success).length + 1,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute parallel groups of tasks
   */
  private async executeParallelGroups(workflow: Workflow, results: TaskResult[]): Promise<void> {
    const graph = workflow.executionGraph;

    // Execute each parallel group in order
    for (const group of graph.parallelGroups) {
      // Execute all tasks in the group in parallel
      const groupPromises = group.map(async taskId => {
        const task = workflow.tasks.find(t => t.id === taskId);
        if (!task) return null;

        return await this.executeSingleTask(task, workflow);
      });

      const groupResults = await Promise.all(groupPromises);

      // Collect results
      for (const result of groupResults) {
        if (result) {
          results.push(result);
        }
      }

      // Check if any task failed (fail-fast behavior)
      const hasFailure = groupResults.some(r => r && !r.success);
      if (hasFailure && !this.config.enableAutoRetry) {
        throw new Error('Task failed in parallel group');
      }
    }
  }

  /**
   * Execute tasks sequentially
   */
  private async executeSequential(workflow: Workflow, results: TaskResult[]): Promise<void> {
    // Sort tasks by dependency order
    const sortedTasks = this.topologicalSort(workflow.tasks);

    for (const task of sortedTasks) {
      // Check if dependencies are satisfied
      const dependenciesMet = task.dependencies.every(depId => {
        const depResult = results.find(r => r.taskId === depId);
        return depResult && depResult.success;
      });

      if (!dependenciesMet) {
        task.status = 'skipped';
        continue;
      }

      const result = await this.executeSingleTask(task, workflow);
      results.push(result);

      // Fail-fast if task failed
      if (!result.success && !this.config.enableAutoRetry) {
        throw new Error(`Task ${task.id} failed: ${result.error}`);
      }
    }
  }

  /**
   * Execute a single task via MaiaDaemon
   */
  private async executeSingleTask(task: AssignedTask, workflow: Workflow): Promise<TaskResult> {
    task.status = 'running';
    task.startedAt = new Date().toISOString();

    const startTime = Date.now();

    try {
      // Use MaiaDaemon to dispatch the task
      const executionTask = await this.daemon.dispatch(task.description, {
        preferredAgent: task.assignedAgent,
        context: { orchestratorTaskId: task.id },
      });
      task.executionTaskId = executionTask.id;

      // Wait for task completion with timeout
      const result = await this.waitForTaskCompletion(executionTask.id, this.config.taskTimeout);

      const duration = Date.now() - startTime;

      task.status = result.success ? 'completed' : 'failed';
      task.completedAt = new Date().toISOString();
      task.result = result;

      this.emit('task:complete', { taskId: task.id, success: result.success, duration });

      return {
        taskId: task.id,
        agentId: task.assignedAgent,
        success: result.success,
        output: result.output,
        artifacts: result.artifacts || [],
        duration,
        error: result.error,
        metadata: {
          executionTaskId: executionTask.id,
        },
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      task.status = 'failed';
      task.completedAt = new Date().toISOString();

      return {
        taskId: task.id,
        agentId: task.assignedAgent,
        success: false,
        output: '',
        artifacts: [],
        duration,
        error: error instanceof Error ? error.message : String(error),
        metadata: {},
      };
    }
  }

  /**
   * Wait for task completion with timeout
   */
  private async waitForTaskCompletion(taskId: string, timeout: number): Promise<{
    success: boolean;
    output: string;
    artifacts?: Artifact[];
    error?: string;
  }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Task ${taskId} timed out after ${timeout}ms`));
      }, timeout);

      const checkInterval = setInterval(() => {
        const task = this.execution.getTask(taskId);

        if (task && (task.status === 'completed' || task.status === 'failed')) {
          cleanup();
          resolve({
            success: task.status === 'completed',
            output: task.description,
            error: task.error,
          });
        }
      }, 500);

      const cleanup = () => {
        clearTimeout(timer);
        clearInterval(checkInterval);
      };

      // Listen to execution manager events
      const onTaskComplete = (completedTask: ExecutionTask) => {
        if (completedTask.id === taskId) {
          cleanup();
          resolve({
            success: completedTask.status === 'completed',
            output: completedTask.description,
            error: completedTask.error,
          });
        }
      };

      this.execution.once('taskCompleted', onTaskComplete);
    });
  }

  /**
   * Topological sort for sequential execution
   */
  private topologicalSort(tasks: AssignedTask[]): AssignedTask[] {
    const sorted: AssignedTask[] = [];
    const visited = new Set<string>();
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const task = taskMap.get(taskId);
      if (!task) return;

      // Visit dependencies first
      for (const depId of task.dependencies) {
        visit(depId);
      }

      sorted.push(task);
    };

    for (const task of tasks) {
      visit(task.id);
    }

    return sorted;
  }

  // ==========================================================================
  // PHASE 5: SYNTHESIS
  // ==========================================================================

  /**
   * Synthesize results into a final deliverable
   */
  async synthesizeResults(
    workflowId: string,
    taskResults: TaskResult[]
  ): Promise<Deliverable> {
    this.emit('synthesis:start', { workflowId, resultCount: taskResults.length });

    const workflow = this.completedWorkflows.get(workflowId) || this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Calculate metrics
    const metrics = this.calculateDeliverableMetrics(workflow, taskResults);

    // Generate summary
    const summary = this.generateSummary(workflow, taskResults, metrics);

    // Collect all artifacts
    const artifacts = this.collectArtifacts(taskResults);

    // Generate next actions
    const nextActions = this.generateNextActions(workflow, taskResults, metrics);

    const deliverable: Deliverable = {
      workflowId,
      objective: workflow.objective,
      summary,
      artifacts,
      taskResults,
      metrics,
      synthesizedAt: new Date().toISOString(),
      nextActions,
    };

    this.emit('synthesis:complete', { deliverable });

    return deliverable;
  }

  /**
   * Calculate deliverable metrics
   */
  private calculateDeliverableMetrics(workflow: Workflow, taskResults: TaskResult[]): DeliverableMetrics {
    const totalDuration = taskResults.reduce((sum, r) => sum + r.duration, 0);
    const completedTasks = taskResults.filter(r => r.success).length;
    const failedTasks = taskResults.filter(r => !r.success).length;
    const successRate = taskResults.length > 0 ? completedTasks / taskResults.length : 0;

    const agentsInvolved = Array.from(new Set(taskResults.map(r => r.agentId)));

    // Calculate parallelism efficiency
    // If we ran N tasks in parallel, ideally duration should be ~1/N of sequential
    const sequentialDuration = taskResults.reduce((sum, r) => sum + r.duration, 0);
    const parallelismEfficiency = sequentialDuration > 0 ? Math.min(1, totalDuration / sequentialDuration) : 1;

    // Estimate vs actual
    const estimatedDuration = workflow.tasks.reduce((sum, t) => sum + t.estimatedDuration, 0) * 60 * 1000;
    const estimatedVsActual = estimatedDuration > 0 ? totalDuration / estimatedDuration : 1;

    return {
      totalDuration,
      totalTasks: taskResults.length,
      completedTasks,
      failedTasks,
      successRate,
      agentsInvolved,
      parallelismEfficiency,
      estimatedVsActual,
    };
  }

  /**
   * Generate summary for the deliverable
   */
  private generateSummary(workflow: Workflow, taskResults: TaskResult[], metrics: DeliverableMetrics): string {
    const lines: string[] = [];

    lines.push(`# Execution Summary`);
    lines.push('');
    lines.push(`**Objective**: ${workflow.objective}`);
    lines.push('');
    lines.push(`## Results`);
    lines.push(`- **Status**: ${metrics.failedTasks === 0 ? 'SUCCESS' : 'PARTIAL'}`);
    lines.push(`- **Tasks Completed**: ${metrics.completedTasks}/${metrics.totalTasks}`);
    lines.push(`- **Success Rate**: ${(metrics.successRate * 100).toFixed(1)}%`);
    lines.push(`- **Total Duration**: ${(metrics.totalDuration / 1000 / 60).toFixed(2)} minutes`);
    lines.push(`- **Agents Involved**: ${metrics.agentsInvolved.map(a => `@${a}`).join(', ')}`);
    lines.push('');

    if (taskResults.length > 0) {
      lines.push(`## Task Breakdown`);
      for (const result of taskResults) {
        const status = result.success ? '✓' : '✗';
        lines.push(`- ${status} **${result.taskId}** (@${result.agentId}): ${result.output.slice(0, 100)}...`);
      }
      lines.push('');
    }

    if (metrics.failedTasks > 0) {
      lines.push(`## Failures`);
      for (const result of taskResults.filter(r => !r.success)) {
        lines.push(`- **${result.taskId}**: ${result.error}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Collect all artifacts from task results
   */
  private collectArtifacts(taskResults: TaskResult[]): Artifact[] {
    const artifacts: Artifact[] = [];

    for (const result of taskResults) {
      artifacts.push(...result.artifacts);
    }

    return artifacts;
  }

  /**
   * Generate next actions based on results
   */
  private generateNextActions(workflow: Workflow, taskResults: TaskResult[], metrics: DeliverableMetrics): string[] {
    const actions: string[] = [];

    // If there were failures, suggest fixes
    if (metrics.failedTasks > 0) {
      actions.push(`Review and fix ${metrics.failedTasks} failed task(s)`);
    }

    // If success rate is low, suggest review
    if (metrics.successRate < 0.8) {
      actions.push('Review workflow and adjust agent assignments');
    }

    // If estimation was off, suggest recalibration
    if (metrics.estimatedVsActual > 1.5 || metrics.estimatedVsActual < 0.7) {
      actions.push('Recalibrate duration estimates for future workflows');
    }

    // Suggest documentation
    if (metrics.successRate > 0.9) {
      actions.push('Document successful pattern for future use');
    }

    // Suggest optimization
    if (metrics.parallelismEfficiency < 0.5) {
      actions.push('Optimize task parallelization for better efficiency');
    }

    return actions;
  }

  // ==========================================================================
  // HIGH-LEVEL API
  // ==========================================================================

  /**
   * Orchestrate an objective from start to finish
   *
   * This is the main entry point for users.
   * It takes a natural language objective and returns a deliverable.
   */
  async orchestrate(objective: string, options: { preferredAgents?: Record<string, AgentId> } = {}): Promise<Deliverable> {
    this.emit('orchestrate:start', { objective });

    try {
      // Phase 1: Planning
      const plan = await this.createPlan(objective);

      // For trivial objectives, execute directly
      if (plan.objectiveType === 'trivial') {
        const subtasks = await this.decomposeTasks(plan);
        const assigned = await this.assignAgents(subtasks);
        const workflow = this.createWorkflow(plan, assigned);
        const result = await this.executeWorkflow(workflow);
        return await this.synthesizeResults(workflow.id, result.taskResults);
      }

      // Phase 2: Decomposition
      const subtasks = await this.decomposeTasks(plan);

      // Phase 3: Assignment
      let assigned = await this.assignAgents(subtasks);

      // Apply preferred agents if specified
      if (options.preferredAgents) {
        for (const [taskId, agentId] of Object.entries(options.preferredAgents)) {
          const task = assigned.find(t => t.id === taskId);
          if (task) {
            task.assignedAgent = agentId;
            task.assignmentMethod = 'manual';
            task.assignmentReason = 'User-specified';
          }
        }
      }

      // Create workflow
      const workflow = this.createWorkflow(plan, assigned);

      // Phase 4: Execution
      const result = await this.executeWorkflow(workflow);

      // Phase 5: Synthesis
      const deliverable = await this.synthesizeResults(workflow.id, result.taskResults);

      this.emit('orchestrate:complete', { objective, deliverable });

      return deliverable;

    } catch (error) {
      this.emit('orchestrate:failed', { objective, error });
      throw error;
    }
  }

  /**
   * Create a workflow from assigned tasks
   */
  private createWorkflow(plan: ExecutionPlan, assignedTasks: AssignedTask[]): Workflow {
    const workflowId = this.generateId('workflow');

    // Build execution graph
    const executionGraph = this.buildExecutionGraph(assignedTasks);

    const workflow: Workflow = {
      id: workflowId,
      planId: plan.id,
      objective: plan.objective,
      tasks: assignedTasks,
      executionGraph,
      status: 'ready',
      metadata: {
        plan,
      },
    };

    return workflow;
  }

  /**
   * Build execution graph from assigned tasks
   */
  private buildExecutionGraph(tasks: AssignedTask[]): ExecutionGraph {
    const nodes = tasks.map(t => t.id);
    const edges: Array<{ from: string; to: string }> = [];

    // Build dependency edges
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        edges.push({ from: depId, to: task.id });
      }
    }

    // Find parallel groups (tasks with no dependencies between them)
    const parallelGroups = this.findParallelGroups(tasks);

    // Find critical path
    const criticalPath = this.findCriticalPath(tasks, edges);

    return {
      nodes,
      edges,
      parallelGroups,
      criticalPath,
    };
  }

  /**
   * Find groups of tasks that can run in parallel
   */
  private findParallelGroups(tasks: AssignedTask[]): string[][] {
    const groups: string[][] = [];
    const processed = new Set<string>();

    // Group tasks by dependency level
    const levels = new Map<string, number>();

    // Calculate levels using topological order
    const sortedTasks = this.topologicalSort(tasks);

    for (const task of sortedTasks) {
      if (task.dependencies.length === 0) {
        levels.set(task.id, 0);
      } else {
        const maxDepLevel = Math.max(...task.dependencies.map(depId => levels.get(depId) || 0));
        levels.set(task.id, maxDepLevel + 1);
      }
    }

    // Group by level
    const levelGroups = new Map<number, string[]>();
    for (const [taskId, level] of levels.entries()) {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)!.push(taskId);
    }

    // Convert to array
    for (const [, tasks] of levelGroups) {
      if (tasks.length > 0) {
        groups.push(tasks);
      }
    }

    return groups;
  }

  /**
   * Find critical path in the workflow
   */
  private findCriticalPath(tasks: AssignedTask[], edges: Array<{ from: string; to: string }>): string[] {
    // Build adjacency list
    const incoming = new Map<string, string[]>();
    const outgoing = new Map<string, string[]>();

    for (const task of tasks) {
      incoming.set(task.id, []);
      outgoing.set(task.id, []);
    }

    for (const edge of edges) {
      incoming.get(edge.to)?.push(edge.from);
      outgoing.get(edge.from)?.push(edge.to);
    }

    // Find longest path by duration
    const duration = new Map<string, number>();
    const path = new Map<string, string[]>();

    // Initialize durations
    for (const task of tasks) {
      duration.set(task.id, task.estimatedDuration);
      path.set(task.id, [task.id]);
    }

    // Process in topological order
    const sortedTasks = this.topologicalSort(tasks);

    for (const task of sortedTasks) {
      for (const predId of incoming.get(task.id) || []) {
        const newDuration = duration.get(predId)! + task.estimatedDuration;
        if (newDuration > duration.get(task.id)!) {
          duration.set(task.id, newDuration);
          path.set(task.id, [...path.get(predId)!, task.id]);
        }
      }
    }

    // Find task with max duration
    let maxDuration = 0;
    let criticalPath: string[] = [];

    for (const [taskId, taskDuration] of duration.entries()) {
      if (taskDuration > maxDuration) {
        maxDuration = taskDuration;
        criticalPath = path.get(taskId)!;
      }
    }

    return criticalPath;
  }

  // ==========================================================================
  // EVENT BINDING
  // ==========================================================================

  private bindEvents(): void {
    // Forward execution manager events
    this.execution.on('taskCompleted', (task: ExecutionTask) => {
      this.emit('task:completed', task);
    });

    // Handle agent health changes (store original reference to avoid infinite recursion)
    const originalGetAgent = this.agents.getAgent.bind(this.agents);
    this.agents.getAgent = (agentId) => {
      // Emit health status changes
      this.emit('agent:health', { agentId, healthy: this.agents.isAvailable(agentId) });
      return originalGetAgent(agentId);
    };
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): Workflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get completed workflows
   */
  getCompletedWorkflows(): Workflow[] {
    return Array.from(this.completedWorkflows.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): Workflow | undefined {
    return this.activeWorkflows.get(id) || this.completedWorkflows.get(id);
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return false;
    }

    workflow.status = 'cancelled';

    // Cancel running tasks
    for (const task of workflow.tasks) {
      if (task.status === 'running' && task.executionTaskId) {
        await this.execution.cancelTask(task.executionTaskId);
      }
    }

    this.activeWorkflows.delete(workflowId);
    this.emit('workflow:cancelled', { workflowId });

    return true;
  }
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface WorkflowResult {
  workflowId: string;
  success: boolean;
  duration: number;
  taskResults: TaskResult[];
  completedTasks: number;
  failedTasks: number;
  error?: string;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let orchestratorInstance: MaiaOrchestrator | null = null;

export function getMaiaOrchestrator(config?: OrchestratorConfig): MaiaOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new MaiaOrchestrator(config);
  }
  return orchestratorInstance;
}

export function resetMaiaOrchestrator(): void {
  if (orchestratorInstance) {
    orchestratorInstance.removeAllListeners();
  }
  orchestratorInstance = null;
}
