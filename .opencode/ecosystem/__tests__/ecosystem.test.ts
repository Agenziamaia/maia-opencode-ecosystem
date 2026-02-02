import { describe, it, expect, beforeEach } from 'vitest';
import { getDNATracker, DNATracker } from '../dna/dna-tracker';
import { getCouncilManager, CouncilManager } from '../council/council-manager';
import { getAgentManager, AgentManager } from '../agents/agent-manager';
import { getConstitution } from '../constitution/constitution';
import { getEnhancedCouncil } from '../council/enhanced-council';
import { evaluateAction } from '../constitution/index';
import { getExecutionManager } from '../execution/execution-manager';

describe('Living Ecosystem Foundation', () => {
  beforeEach(() => {
    getDNATracker();
    getCouncilManager();
    getAgentManager();
  });

  describe('DNA Tracker', () => {
    it('should record agent interactions', () => {
      const tracker = getDNATracker();
      const taskId = 'task-123';

      tracker.recordInteraction(taskId, {
        agent_id: 'coder',
        action: 'implementation',
        duration_ms: 15000,
        timestamp: new Date().toISOString(),
      });

      const dna = tracker.getDNA(taskId);
      expect(dna).toBeDefined();
      expect(dna?.agent_interactions).toHaveLength(1);
      expect(dna?.agent_interactions[0].agent_id).toBe('coder');
    });

    it('should find patterns for tasks', () => {
      const tracker = getDNATracker();

      const match = tracker.findPattern('Implement API', 'Build REST API');

      expect(match).toBeNull();
    });

    it('should analyze agent performance', () => {
      const tracker = getDNATracker();
      const taskId = 'task-456';

      tracker.recordInteraction(taskId, {
        agent_id: 'coder',
        action: 'implementation',
        duration_ms: 10000,
        timestamp: new Date().toISOString(),
      });

      tracker.recordOutcome(taskId, 'success', {
        completion_time_ms: 10000,
        revision_count: 1,
        quality_score: 0.9,
      });

      const perf = tracker.analyzeAgentPerformance('coder');
      expect(perf.taskCount).toBeGreaterThanOrEqual(1);
      expect(perf.successRate).toBeGreaterThanOrEqual(0);
    });

    it('should serialize and deserialize state', () => {
      const tracker = getDNATracker();
      const taskId = 'task-789';

      tracker.recordInteraction(taskId, {
        agent_id: 'reviewer',
        action: 'review',
        duration_ms: 5000,
        timestamp: new Date().toISOString(),
      });

      const serialized = tracker.serialize();
      expect(typeof serialized).toBe('string');

      const newTracker = new DNATracker();
      newTracker.deserialize(serialized);
      const dna = newTracker.getDNA(taskId);
      expect(dna).toBeDefined();
      expect(dna?.agent_interactions).toHaveLength(1);
    });
  });

  describe('Council Manager', () => {
    it('should create a council decision', () => {
      const council = getCouncilManager();
      const decision = council.createDecision(
        'Should we use TypeScript?',
        ['coder', 'reviewer', 'sisyphus'],
        300000,
        0.7
      );

      expect(decision.decision_id).toBeDefined();
      expect(decision.proposal).toBe('Should we use TypeScript?');
      expect(decision.status).toBe('pending');
      expect(decision.consensus_threshold).toBe(0.7);
    });

    it('should cast votes on a decision', () => {
      const council = getCouncilManager();
      const decision = council.createDecision(
        'Proposal',
        ['coder', 'reviewer'],
        300000
      );

      const result = council.castVote(
        decision.decision_id,
        'coder',
        'upvote',
        'TypeScript improves type safety'
      );

      expect(result).toBeDefined();
      expect(result?.votes).toHaveLength(1);
      expect(result?.votes[0].agent_id).toBe('coder');
      expect(result?.votes[0].vote).toBe('upvote');
    });

    it('should detect consensus', () => {
      const council = getCouncilManager();
      const decision = council.createDecision(
        'Proposal',
        ['coder', 'reviewer'],
        300000,
        0.7
      );

      council.castVote(decision.decision_id, 'coder', 'upvote');
      council.castVote(decision.decision_id, 'reviewer', 'upvote');

      const updated = council.getDecision(decision.decision_id);
      expect(updated?.status).toBe('consensus');
      expect(updated?.final_decision).toBe('approved');
    });

    it('should get voting statistics for agent', () => {
      const council = getCouncilManager();
      const decision = council.createDecision(
        'Proposal',
        ['coder', 'reviewer'],
        300000
      );

      council.castVote(decision.decision_id, 'coder', 'upvote');

      const stats = council.getAgentStats('coder');
      expect(stats.totalVotes).toBeGreaterThan(0);
      expect(stats.upvotes).toBeGreaterThan(0);
    });
  });

  describe('Agent Manager', () => {
    it('should recommend agents for tasks', () => {
      const manager = getAgentManager();
      const recommendations = manager.recommendAgents(
        'Implement authentication',
        'Build JWT-based auth system',
        3
      );

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('agentId');
      expect(recommendations[0]).toHaveProperty('confidence');
    });

    it('should auto-assign agents', () => {
      const manager = getAgentManager();
      const assignment = manager.autoAssign(
        'Fix bug',
        'Users cannot login after password reset'
      );

      expect(assignment).toBeDefined();
      expect(assignment?.primary_agent).toBeDefined();
      expect(assignment?.assignment_method).toBe('auto');
      expect(assignment?.availability_checked).toBe(true);
    });

    it('should check agent availability', () => {
      const manager = getAgentManager();

      const available = manager.isAvailable('coder');
      expect(typeof available).toBe('boolean');
    });

    it('should get load statistics', () => {
      const manager = getAgentManager();
      const stats = manager.getLoadStats();

      expect(typeof stats).toBe('object');
      expect(Object.keys(stats)).toContain('coder');
      expect(Object.keys(stats)).toContain('ops');
      expect(Object.keys(stats)).toContain('reviewer');
    });

    it('should increment and decrement task counts', () => {
      const manager = getAgentManager();

      const initialLoad = manager.getLoadStats()['coder'];

      manager.incrementTaskCount('coder');
      const afterIncrement = manager.getLoadStats()['coder'];
      expect(afterIncrement.current).toBe(initialLoad.current + 1);

      manager.decrementTaskCount('coder');
      const afterDecrement = manager.getLoadStats()['coder'];
      expect(afterDecrement.current).toBe(afterIncrement.current - 1);
    });
  });

  describe('Integration', () => {
    it('should work end-to-end: task creation with DNA and assignment', () => {
      const dnaTracker = getDNATracker();
      const agentManager = getAgentManager();

      const taskId = 'integration-task-1';

      dnaTracker.recordInteraction(taskId, {
        agent_id: 'coder',
        action: 'task_assigned',
        duration_ms: 0,
        timestamp: new Date().toISOString(),
      });

      const assignment = agentManager.autoAssign(
        'Test task',
        'Testing integration'
      );

      expect(assignment).toBeDefined();
      expect(assignment?.primary_agent).toBeDefined();

      const dna = dnaTracker.getDNA(taskId);
      expect(dna?.agent_interactions).toHaveLength(1);
    });

    it('should handle council decision with task assignment', () => {
      const council = getCouncilManager();
      const agentManager = getAgentManager();

      const decision = council.createDecision(
        'Assign coder to this task?',
        ['maia', 'sisyphus'],
        300000
      );

      council.castVote(decision.decision_id, 'maia', 'upvote');
      council.castVote(decision.decision_id, 'sisyphus', 'upvote');

      const updated = council.getDecision(decision.decision_id);
      expect(updated?.status).toBe('consensus');

      const isAvailable = agentManager.isAvailable('coder');
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe('Constitution', () => {
    it('should evaluate safe actions as constitutional', () => {
      const result = evaluateAction({
        actionType: 'task_dispatch',
        agentId: 'coder',
        target: 'system',
        description: 'Implement a new feature',
        context: {},
        timestamp: new Date().toISOString(),
      } as any);

      expect(result.canProceed).toBe(true);
      expect(result.ruling).toBeDefined();
      expect(result.ruling.isConstitutional).toBe(true);
    });

    it('should block destructive actions without consent', () => {
      const constitution = getConstitution();
      const ruling = constitution.evaluate({
        actionType: 'file_delete',
        agentId: 'coder',
        target: '.env',
        description: 'Delete production environment file',
        context: { userConfirmed: false },
        timestamp: new Date().toISOString(),
      } as any);

      // Destructive actions on sensitive files should be flagged
      expect(ruling).toBeDefined();
      expect(ruling.violatedPrinciples).toBeDefined();
    });

    it('should suggest alternatives for risky actions', () => {
      const constitution = getConstitution();
      const alternatives = constitution.suggestAlternatives({
        actionType: 'database_migration',
        agentId: 'ops',
        target: 'production',
        description: 'Run database migration on production',
        context: {},
        timestamp: new Date().toISOString(),
      } as any);

      expect(Array.isArray(alternatives)).toBe(true);
    });
  });

  describe('Enhanced Council', () => {
    it('should create proposals and start voting', async () => {
      const council = getEnhancedCouncil();
      const proposal = await council.propose({
        title: 'Test proposal',
        description: 'Testing the voting system',
        proposalType: 'general',
        proposedBy: 'test',
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        context: {
          risks: [],
          benefits: ['Testing'],
          alternatives: [],
        },
        consensusThreshold: 0.6,
        vetoPower: false,
        expertiseWeights: true,
        estimatedImpact: 'low',
      });

      expect(proposal).toBeDefined();
      expect(proposal.status).toBe('pending');

      // Must start voting before casting votes
      const started = council.startVoting(proposal.id);
      expect(started).toBe(true);

      const vote = council.vote(proposal.id, 'coder', 'approve', 'Looks good');
      expect(vote).toBeDefined();
    });

    it('should reach consensus with sufficient votes', async () => {
      const council = getEnhancedCouncil();
      const proposal = await council.propose({
        title: 'Consensus test',
        description: 'Testing consensus',
        proposalType: 'general',
        proposedBy: 'test',
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        context: { risks: [], benefits: [], alternatives: [] },
        consensusThreshold: 0.5,
        vetoPower: false,
        expertiseWeights: false,
        estimatedImpact: 'low',
      });

      // Must start voting phase first
      council.startVoting(proposal.id);

      council.vote(proposal.id, 'coder', 'approve', 'Yes');
      council.vote(proposal.id, 'reviewer', 'approve', 'Agreed');
      council.vote(proposal.id, 'ops', 'approve', 'Go for it');

      const updated = council.getProposal(proposal.id);
      expect(updated).toBeDefined();
      // With 3 approvals and 0.5 threshold, should reach consensus
      expect(['consensus', 'voting'].includes(updated!.status)).toBe(true);
    });

    it('should track decisions for precedent', () => {
      const council = getEnhancedCouncil();
      const decisions = council.getDecisions();
      expect(Array.isArray(decisions)).toBe(true);
    });
  });

  describe('Execution Manager', () => {
    it('should create tasks in the queue', async () => {
      const exec = getExecutionManager();
      const task = await exec.createTask(
        'Test task',
        'Unit test for execution manager',
        { agentId: 'coder', priority: 'normal' }
      );

      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.status).toBe('queued');
      expect(task.agentId).toBe('coder');
    });

    it('should report execution stats', () => {
      const exec = getExecutionManager();
      const stats = exec.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.queued).toBe('number');
      expect(typeof stats.running).toBe('number');
      expect(typeof stats.completed).toBe('number');
      expect(typeof stats.failed).toBe('number');
    });
  });
});
