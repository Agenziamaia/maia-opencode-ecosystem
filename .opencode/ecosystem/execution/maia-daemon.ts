/**
 * MAIA DAEMON (Shared Dispatch Service)
 *
 * A singleton service that provides intelligent task routing with full governance:
 * - Constitution evaluation (safety check before dispatch)
 * - DNA-aware routing (learn from past successes)
 * - Council consultation (for complex decisions)
 * - Health monitoring and resilience
 *
 * Used by: MAIA, Sisyphus, and any agent that needs to dispatch tasks
 */

import { EventEmitter } from 'events';
import { getExecutionManager, ExecutionManager, ExecutionTask } from './execution-manager.js';
import { getMetaLearningEngine, MetaLearningEngine, logTaskOutcome } from '../meta-learning.js';
import { getDNATracker } from '../dna/dna-tracker.js';
import { getSoulMutator } from '../agents/soul-mutator.js'; // NEW IMPORT
import { getSwarmIntelligence, type SwarmIntelligence } from '../swarm-integration.js';
import * as MemoryStorePkg from '../../memory/memory-store.js';

// Governance imports
import {
  getConstitution,
  getEnhancedCouncil,
  getPredictiveEngine,
  evaluateAction,
  type AgentAction,
  type ConstitutionalRuling,
  type Prediction
} from '../constitution/index.js';
import type { CouncilProposal } from '../council/enhanced-council.js';

// @ts-ignore - Handle CJS/ESM interop
const { getMemoryStore } = MemoryStorePkg.default || MemoryStorePkg;

/**
 * Dispatch options
 */
export interface DispatchOptions {
  preferredAgent?: string;
  skipConstitution?: boolean;      // For emergency use only
  requireCouncilVote?: boolean;     // Force Council consultation
  skipCouncil?: boolean;            // Emergency override to skip Council entirely
  requestingAgent?: string;         // Who is making this request?
  context?: Record<string, any>;    // Additional context
}

/**
 * Dispatch result with governance info
 */
export interface DispatchResult extends ExecutionTask {
  governance: {
    constitutionChecked: boolean;
    constitutionRuling?: ConstitutionalRuling;
    councilConsulted?: boolean;
    councilDecision?: string;
    dnaPatternMatched?: boolean;
    predictionUsed?: boolean;
  };
}

/**
 * MAIA Daemon - Shared Dispatch Service
 */
export class MaiaDaemon extends EventEmitter {
  private execution: ExecutionManager;
  private memory: MetaLearningEngine;
  private swarm: SwarmIntelligence;
  private isAwake: boolean = false;
  private static instance: MaiaDaemon;

  private constructor() {
    super();
    this.execution = getExecutionManager();
    this.memory = getMetaLearningEngine();
    this.swarm = getSwarmIntelligence();
    this.bindEvents();
  }

  // Reactive Dispatch: Map of 'Pattern Tag' -> Set of Agent IDs
  private subscriptions: Map<string, Set<string>> = new Map();

  /**
   * GOD MODE: Subscribe an agent to a reality pattern
   */
  public subscribe(patternTag: string, agentId: string) {
    if (!this.subscriptions.has(patternTag)) {
      this.subscriptions.set(patternTag, new Set());
    }
    this.subscriptions.get(patternTag)?.add(agentId);
    console.log(`🔌 REACTIVE: @${agentId} subscribed to '${patternTag}'`);
  }

  public static getInstance(): MaiaDaemon {
    if (!MaiaDaemon.instance) {
      MaiaDaemon.instance = new MaiaDaemon();
    }
    return MaiaDaemon.instance;
  }

  /**
   * WAKEUP: Start the Daemon
   */
  public async wakeUp() {
    if (this.isAwake) return;

    console.log('🦅 MAIA DAEMON: Waking up with governance...');
    this.isAwake = true;
    console.log('🦅 MAIA DAEMON: Online with Constitution, Council, DNA, Prediction, and Swarm Intelligence');

    // Start the Autonomous Heartbeat
    this.startHeartbeat();

    this.emit('awake');
  }

  /**
   * HEARTBEAT: Low-priority optimization loop
   */
  private startHeartbeat() {
    console.log('💓 MAIA DAEMON: Heartbeat started (Low Priority Mode)');

    // Run every 60 seconds, but only if idle
    setInterval(async () => {
      // Use setImmediate to yield to I/O first
      setImmediate(async () => {
        try {
          // 1. Check Memory Entropy
          await getMemoryStore().checkEntropy();

          // 2. Check Agent Profile Entropy (Soul Mutation)
          await getSoulMutator().scanEntropy();

          // 3. Log Pulse
          // console.log('💓 Pulse check complete');
        } catch (error) {
          console.error('Heartbeat skipped beat:', error);
        }
      });
    }, 60000); // 60s interval
  }

  /**
   * DISPATCH: Core routing with full governance
   *
   * Flow:
   * 1. Constitution check (safety)
   * 2. DNA lookup (pattern matching for agent selection)
   * 3. Council consultation (if complex decision needed)
   * 4. Prediction check (proactive optimization)
   * 5. Route to agent
   * 6. Monitor health
   */
  public async dispatch(
    instruction: string,
    options: DispatchOptions = {}
  ): Promise<DispatchResult> {
    if (!this.isAwake) await this.wakeUp();

    const governance: DispatchResult['governance'] = {
      constitutionChecked: false,
    };

    // ============================================================
    // STEP 1: CONSTITUTION CHECK (Safety First)
    // ============================================================
    if (!options.skipConstitution) {
      try {
        const action: any = { // Temporary any cast until AgentAction type is aligned
          actionType: 'task_dispatch',
          agentId: options.requestingAgent || 'unknown',
          target: 'system',
          description: instruction,
          context: options.context || {},
          timestamp: new Date().toISOString()
        };

        const result = evaluateAction(action);
        governance.constitutionChecked = true;
        governance.constitutionRuling = result.ruling;

        if (!result.canProceed) {
          // Derive reason from violated principles
          const reason = result.ruling.violatedPrinciples.length > 0
            ? result.ruling.violatedPrinciples[0].explanation
            : 'Action violates constitutional principles';
          console.log(`⚖️ CONSTITUTION BLOCKED: ${reason}`);
          throw new Error(`Constitution blocked this action: ${reason}`);
        }

        if (result.ruling.suggestions && result.ruling.suggestions.length > 0) {
          console.log(`⚖️ Constitution suggests ${result.ruling.suggestions.length} improvement(s)`);
        }
      } catch (e) {
        // If Constitution check actually fails (not just a ruling), re-throw
        if (e instanceof Error && !e.message.includes('Constitution blocked')) {
          console.error('Constitution check failed unexpectedly:', e);
          // In production, might want to fail safe, but for now re-throw
          throw e;
        }
        // If it's a "Constitution blocked" error, re-throw it
        throw e;
      }
    }

    // ============================================================
    // STEP 2: DNA-AWARE AGENT SELECTION
    // ============================================================
    let agentId = options.preferredAgent;
    let proposalId: string | undefined;

    if (!agentId) {
      agentId = await this.decideAgentWithDNA(instruction, options);
      governance.dnaPatternMatched = !!agentId;
    }

    // ============================================================
    // STEP 3: COUNCIL CONSULTATION (for complex decisions)
    // ============================================================
    if (options.requireCouncilVote || this.isComplexDecision(instruction)) {
      try {
        const council = getEnhancedCouncil();

        // Map proposal type based on instruction analysis
        const proposalType = this.determineProposalType(instruction, agentId);

        const proposal = {
          title: `Dispatch: ${instruction.slice(0, 50)}...`,
          description: instruction,
          proposalType: proposalType,
          proposedBy: options.requestingAgent || 'maia',
          context: {
            requestingAgent: options.requestingAgent,
            suggestedAgent: agentId,
            risks: this.identifyRisks(instruction),
            benefits: this.identifyBenefits(instruction),
            alternatives: [],
            ...options.context,
          },
          expiresAt: new Date(Date.now() + 60000).toISOString(), // 60s timeout
          consensusThreshold: 0.6, // 60% agreement needed
          vetoPower: true,
          expertiseWeights: true,
          estimatedImpact: this.estimateImpact(instruction),
        };

        console.log(`🏛️ Council: Submitting proposal for vote...`);

        // BLOCKING: Wait for Council decision
        const result = await council.waitForCouncilDecision(
          proposal,
          60000, // 60 second timeout
          options.skipCouncil || false
        );

        governance.councilConsulted = true;
        governance.councilDecision = result.reason;

        // Check if Council approved
        if (!result.approved) {
          console.log(`🏛️ Council REJECTED: ${result.reason}`);

          if (result.timeout) {
            throw new Error(`Council consultation timed out: ${result.reason}`);
          } else if (result.skipped) {
            console.log(`🏛️ Council SKIPPED via emergency override`);
          } else {
            throw new Error(`Council rejected this action: ${result.reason}`);
          }
        }

        console.log(`🏛️ Council APPROVED: ${result.reason}`);

        // Store proposal ID for later feedback
        proposalId = result.proposal.id;

      } catch (e) {
        // If it's a Council rejection error, re-throw it
        if (e instanceof Error && e.message.includes('Council')) {
          throw e;
        }
        console.error('Council consultation failed:', e);
      }
    }

    // ============================================================
    // STEP 4: PREDICTION CHECK (proactive optimization)
    // ============================================================
    try {
      const prediction = getPredictiveEngine();
      const risks = prediction.detectRisks({
        description: instruction,
        agent: agentId,
      } as any);

      if (risks && risks.length > 0) {
        console.log(`🔮 Prediction detected ${risks.length} risk(s)`);
        governance.predictionUsed = true;
      }
    } catch (e) {
      // Prediction is optional, don't fail on error
    }

    // ============================================================
    // STEP 5: CREATE AND START TASK
    // ============================================================
    const task = await this.execution.createTask(
      `Dispatch: ${instruction.slice(0, 30)}...`,
      instruction,
      {
        agentId,
        priority: 'normal',
        metadata: {
          governance,
          councilProposalId: proposalId,
          requestingAgent: options.requestingAgent,
        },
      }
    );

    console.log(`🦅 MAIA DAEMON: Dispatched task ${task.id} to @${agentId}`);

    await this.execution.startTask(task.id);
    this.monitorTaskHealth(task.id);

    // Return enhanced result with governance info
    return {
      ...task,
      governance,
    } as DispatchResult;
  }

  /**
   * DECIDE AGENT: DNA-Enhanced Routing with Swarm Intelligence
   *
   * Priority:
   * 1. DNA pattern matching (semantic + keyword - what worked before?)
   * 2. Swarm intelligence (collective wisdom from all agents)
   * 3. Hierarchy rules (Sisyphus for projects, MAIA for strategy)
   * 4. Operational routing (researcher, coder, etc.)
   *
   * Returns: agent_id to handle the task
   */
  private async decideAgentWithDNA(
    instruction: string,
    options: DispatchOptions
  ): Promise<string> {
    const text = instruction.toLowerCase();

    // ============================================================
    // STAGE 1: DNA Pattern Matching (Enhanced with Semantic)
    // ============================================================
    try {
      const dna = getDNATracker();
      const match = dna.findPattern(`Dispatch: ${instruction.slice(0, 30)}`, instruction);

      if (match && match.confidence > 0.5 && match.pattern.recommended_agents.length > 0) {
        const agentId = match.pattern.recommended_agents[0];

        // Detailed routing log
        console.log('='.repeat(60));
        console.log('🧬 DNA ROUTING DECISION:');
        console.log(`   Pattern ID: ${match.pattern.id}`);
        console.log(`   Pattern Name: ${match.pattern.name}`);
        console.log(`   Task Category: ${match.pattern.task_category}`);
        console.log(`   File Types: ${match.pattern.file_types.join(', ')}`);
        console.log(`   Complexity: ${match.pattern.complexity}`);
        console.log(`   Pattern Success Rate: ${(match.pattern.success_rate * 100).toFixed(1)}%`);
        console.log(`   Recommended Agents: ${match.pattern.recommended_agents.join(', ')}`);
        console.log(`   SELECTED AGENT: ${agentId}`);
        console.log(`   Match Confidence: ${(match.confidence * 100).toFixed(1)}%`);
        console.log(`   Reasoning: ${match.reasoning}`);
        console.log('='.repeat(60));

        return agentId;
      } else {
        console.log('🧬 DNA: No suitable pattern found (confidence too low or no agents)');
      }
    } catch (e) {
      console.log(`🧬 DNA: Pattern matching failed - ${(e as Error).message}`);
    }

    // ============================================================
    // STAGE 2: Swarm Intelligence (Collective Wisdom)
    // ============================================================
    try {
      const swarmRec = await this.swarm.directRecommend(instruction);

      if (swarmRec.confidence > 0.5) {
        console.log('🐝 SWARM ROUTING DECISION:');
        console.log(`   Category: ${swarmRec.category}`);
        console.log(`   Top Agent: ${swarmRec.topAgent}`);
        console.log(`   Confidence: ${(swarmRec.confidence * 100).toFixed(1)}%`);
        console.log(`   Alternative Agents: ${swarmRec.alternativeAgents.join(', ')}`);
        console.log(`   Reasoning: ${swarmRec.reasoning}`);
        console.log('='.repeat(60));

        return swarmRec.topAgent;
      }
    } catch (e) {
      console.log(`🐝 Swarm: Recommendation failed - ${(e as Error).message}`);
    }

    // ============================================================
    // STAGE 3: Strict Hierarchy Enforcement
    // ============================================================
    if (text.includes('roadmap') || (text.includes('plan') && text.includes('campaign')) || text.includes('project')) {
      console.log('⚖️ ROUTING: Hierarchy rule -> Sisyphus (project management)');
      return 'sisyphus'; // Project Manager
    }
    if (text.includes('approve') || text.includes('decision') || text.includes('strategy')) {
      console.log('⚖️ ROUTING: Hierarchy rule -> MAIA (strategic decision)');
      return 'maia'; // CEO
    }

    // ============================================================
    // STAGE 4: Operational Routing (Specialist Agents)
    // ============================================================
    const operationalRouting: Record<string, string[]> = {
      researcher: ['research', 'search', 'find', 'explore', 'investigate'],
      reviewer: ['test', 'audit', 'review', 'check', 'verify'],
      ops: ['script', 'deploy', 'install', 'setup', 'configure'],
      frontend: ['ui', 'frontend', 'css', 'style', 'component'],
    };

    for (const [agent, keywords] of Object.entries(operationalRouting)) {
      if (keywords.some(kw => text.includes(kw))) {
        console.log(`🔧 ROUTING: Operational rule -> ${agent} (keyword match)`);
        return agent;
      }
    }

    // ============================================================
    // STAGE 5: Default Agent
    // ============================================================
    console.log('🔧 ROUTING: Default -> Coder (general purpose)');
    return 'coder'; // Default doer
  }

  /**
   * @deprecated Replaced by DNA tracker's semantic similarity
   * Simple text similarity calculation (for DNA matching)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const intersection = words1.filter(w => words2.includes(w));
    const union = [...new Set([...words1, ...words2])];
    return union.length > 0 ? intersection.length / union.length : 0;
  }

  /**
   * Check if this is a complex decision requiring Council
   */
  private isComplexDecision(instruction: string): boolean {
    const complexKeywords = [
      'architecture',
      'breaking change',
      'database',
      'migration',
      'security',
      'api redesign',
      'infrastructure',
    ];
    const text = instruction.toLowerCase();
    return complexKeywords.some(kw => text.includes(kw));
  }

  /**
   * Determine proposal type based on instruction and agent
   */
  private determineProposalType(instruction: string, agentId: string): CouncilProposal['proposalType'] {
    const text = instruction.toLowerCase();

    if (text.includes('architecture') || text.includes('redesign') || text.includes('api')) {
      return 'architectural';
    }
    if (text.includes('refactor') || text.includes('clean up') || text.includes('rewrite')) {
      return 'refactoring';
    }
    if (text.includes('assign') || text.includes('delegate') || text.includes('agent')) {
      return 'agent_assignment';
    }
    if (text.includes('resource') || text.includes('infrastructure') || text.includes('server')) {
      return 'resource';
    }

    return 'general';
  }

  /**
   * Identify potential risks for the proposal
   */
  private identifyRisks(instruction: string): string[] {
    const text = instruction.toLowerCase();
    const risks: string[] = [];

    if (text.includes('breaking')) {
      risks.push('Breaking change may affect existing functionality');
    }
    if (text.includes('delete') || text.includes('remove')) {
      risks.push('Data loss or loss of functionality');
    }
    if (text.includes('database') || text.includes('migration')) {
      risks.push('Database migration could fail or corrupt data');
    }
    if (text.includes('api')) {
      risks.push('API changes may break integrations');
    }
    if (text.includes('architecture')) {
      risks.push('Architectural changes may have unforeseen consequences');
    }
    if (text.includes('deploy')) {
      risks.push('Deployment could cause downtime');
    }

    return risks.length > 0 ? risks : ['Unknown risks - proceed with caution'];
  }

  /**
   * Identify potential benefits for the proposal
   */
  private identifyBenefits(instruction: string): string[] {
    const text = instruction.toLowerCase();
    const benefits: string[] = [];

    if (text.includes('refactor') || text.includes('clean up')) {
      benefits.push('Improved code maintainability');
    }
    if (text.includes('performance') || text.includes('optimize')) {
      benefits.push('Better performance');
    }
    if (text.includes('test') || text.includes('test coverage')) {
      benefits.push('Improved reliability and test coverage');
    }
    if (text.includes('feature') || text.includes('add')) {
      benefits.push('New functionality added');
    }
    if (text.includes('fix') || text.includes('bug')) {
      benefits.push('Bug fix applied');
    }
    if (text.includes('architecture')) {
      benefits.push('Better architectural foundation');
    }

    return benefits.length > 0 ? benefits : ['Completes task as requested'];
  }

  /**
   * Estimate the impact level of a proposal
   */
  private estimateImpact(instruction: string): 'low' | 'medium' | 'high' | 'critical' {
    const text = instruction.toLowerCase();

    if (text.includes('critical') || text.includes('security') || text.includes('production')) {
      return 'critical';
    }
    if (text.includes('breaking') || text.includes('database') || text.includes('architecture')) {
      return 'high';
    }
    if (text.includes('api') || text.includes('migration') || text.includes('refactor')) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * RESILIENCE: Monitor for stalls
   * Checks task health at intervals and escalates if stalled
   */
  private monitorTaskHealth(taskId: string, intervalMs: number = 30000) {
    const checkHealth = () => {
      const task = this.execution.getTask(taskId);

      if (!task) {
        console.log(`🦅 DAEMON: Task ${taskId} no longer exists, stopping monitor`);
        return; // Task was deleted, stop monitoring
      }

      if (task.status === 'completed' || task.status === 'failed') {
        console.log(`🦅 DAEMON: Task ${taskId} finished with status ${task.status}`);
        return; // Task finished, stop monitoring
      }

      if (task.status === 'running') {
        const startTime = task.startedAt ? new Date(task.startedAt).getTime() : Date.now();
        const runningFor = Date.now() - startTime;
        const runningMinutes = Math.floor(runningFor / 60000);

        if (runningMinutes >= 5) {
          console.log(`⚠️ DAEMON RESILIENCE: Task ${taskId} running for ${runningMinutes}min - potential stall`);
          // Could escalate here: notify council, reassign agent, etc.
        } else {
          console.log(`🦅 DAEMON: Task ${taskId} still running (${runningMinutes}min)`);
        }

        // Schedule next check
        setTimeout(checkHealth, intervalMs);
      }
    };

    // Start monitoring after initial delay
    setTimeout(checkHealth, intervalMs);
  }

  /**
   * BIND EVENTS: Wire task completion to DNA learning and Council feedback
   */
  private bindEvents() {
    // @ts-ignore - Event will exist after Phase 3 refactor
    this.execution.on('taskCompleted', async (task: ExecutionTask) => {
      console.log(`🦅 MAIA DAEMON: Task ${task.id} completed`);

      // Feed to MetaLearning
      logTaskOutcome(
        task.id,
        task.agentId || 'unknown',
        task.title,
        task.description,
        task.status === 'completed',
        { failure_reason: task.error }
      );

      // Feed to DNA
      try {
        const dna = getDNATracker();
        dna.recordInteraction(task.id, {
          agent_id: task.agentId || 'unknown',
          timestamp: new Date().toISOString(),
          action: task.title,
          duration_ms: task.completedAt && task.startedAt
            ? new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()
            : 0,
        });

        dna.recordOutcome(
          task.id,
          task.status === 'completed' ? 'success' : 'failure',
          {
            completion_time_ms: task.completedAt && task.startedAt
              ? new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()
              : 0,
            revision_count: 0, // TODO: Track from git
            quality_score: task.status === 'completed' ? 1.0 : 0.0,
          }
        );
      } catch (e) {
        console.error('Failed to record DNA:', e);
      }

      // Feed to Swarm Intelligence for collective learning
      try {
        const duration = task.completedAt && task.startedAt
          ? new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()
          : 0;

        await this.swarm.learn(
          task.description || task.title,
          task.agentId || 'unknown',
          task.status === 'completed' ? 'success' : task.status === 'failed' ? 'failure' : 'partial',
          { durationMs: duration }
        );
        console.log('🐝 Swarm learning updated');

        // GOD MODE: REACTIVE DISPATCH
        // If task updated a pattern or has tags, wake up subscribers
        if (task.metadata?.tags) {
          const tags = task.metadata.tags as string[];
          for (const tag of tags) {
            const subscribers = this.subscriptions.get(tag);
            if (subscribers) {
              for (const subscriberId of subscribers) {
                if (subscriberId === task.agentId) continue; // Don't wake self
                console.log(`⚡ REACTIVE: Waking up @${subscriberId} due to update in '${tag}'`);
                // Dispatch a lightweight notification task (fire and forget)
                this.execution.createTask(
                  `Wake Up: ${tag} Updated`,
                  `Check updated pattern for '${tag}' related to task ${task.id}`,
                  { agentId: subscriberId, priority: 'low' }
                ).catch(e => console.error('Subscription dispatch failed', e));
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to record swarm/reactive:', e);
      }

      // ============================================================
      // EXECUTION FEEDBACK: Report outcome to Council
      // ============================================================
      const councilProposalId = (task as any).councilProposalId as string | undefined;
      if (councilProposalId) {
        try {
          const council = getEnhancedCouncil();
          const outcome: 'success' | 'failure' | 'partial' =
            task.status === 'completed' ? 'success' :
              task.status === 'failed' ? 'failure' : 'partial';

          const result = task.status === 'completed'
            ? `Task ${task.id} completed successfully by ${task.agentId}`
            : `Task ${task.id} failed: ${task.error || 'Unknown error'}`;

          council.reportExecutionOutcome(
            councilProposalId,
            outcome,
            result,
            {
              taskId: task.id,
              agentId: task.agentId,
              duration: task.completedAt && task.startedAt
                ? new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()
                : undefined,
            }
          );

          console.log(`🏛️ Council feedback reported: ${outcome} - ${result}`);
        } catch (e) {
          console.error('Failed to report Council feedback:', e);
        }
      }
    });
  }
}

// Singleton Export
export function getMaiaDaemon(): MaiaDaemon {
  return MaiaDaemon.getInstance();
}
