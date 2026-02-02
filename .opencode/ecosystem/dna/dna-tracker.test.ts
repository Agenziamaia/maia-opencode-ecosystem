/**
 * DNA Tracker Test - Semantic Learning Demonstration
 *
 * This test demonstrates the enhanced DNA learning capabilities:
 * 1. Semantic similarity matching (not just keyword overlap)
 * 2. Enhanced feature extraction (task category, file types, complexity)
 * 3. Agent-specific performance tracking
 * 4. Improved routing decisions
 */

import { describe, it, beforeEach, expect } from '@jest/globals';
import {
  DNATracker,
  Pattern,
  TaskCategory,
  ComplexityLevel,
  getDNATracker,
  type AgentInteraction,
  type OutcomeMetrics,
} from './dna-tracker.js';

describe('DNA Tracker - Semantic Learning', () => {
  let tracker: DNATracker;

  beforeEach(() => {
    // Reset the singleton for each test
    (global as any).__DNA_TRACKER_INSTANCE__ = null;
    tracker = new DNATracker();
  });

  /**
   * TEST 1: Semantic Similarity - Different words, same meaning
   *
   * Before: "fix bug" and "debug issue" were treated as unrelated
   * After: Semantic vectors detect they are similar
   */
  describe('Semantic Similarity Matching', () => {
    it('should match semantically similar tasks with different wording', () => {
      // Create a pattern from a completed task
      const taskId1 = 'task-001';
      tracker.recordInteraction(taskId1, {
        agent_id: 'coder',
        timestamp: new Date().toISOString(),
        action: 'fix authentication bug in login module',
        duration_ms: 5000,
      });

      tracker.recordOutcome(taskId1, 'success', {
        completion_time_ms: 15000,
        revision_count: 1,
        quality_score: 0.9,
      });

      const patterns = tracker.getAllPatterns();
      expect(patterns.length).toBe(1);
      expect(patterns[0].task_category).toBe('bugfix');

      // Now try to match with different wording
      const match1 = tracker.findPattern('Debug Issue', 'resolve login authentication error');
      expect(match1).not.toBeNull();
      expect(match1!.pattern.task_category).toBe('bugfix');
      expect(match1!.reasoning).toContain('Semantic');

      // Should also match "repair" which is semantically similar to "fix"
      const match2 = tracker.findPattern('Repair', 'repair broken login authentication');
      expect(match2).not.toBeNull();

      console.log('✅ Semantic similarity test passed!');
      console.log(`   Pattern: ${patterns[0].name}`);
      console.log(`   Category: ${patterns[0].task_category}`);
      console.log(`   Match 1 confidence: ${match1!.confidence.toFixed(2)} - ${match1!.reasoning}`);
      console.log(`   Match 2 confidence: ${match2!.confidence.toFixed(2)} - ${match2!.reasoning}`);
    });

    it('should match related task categories semantically', () => {
      // Create patterns from different but related tasks
      const tasks = [
        { id: 'task-001', action: 'implement user authentication feature', category: 'feature' },
        { id: 'task-002', action: 'add login functionality', category: 'feature' },
        { id: 'task-003', action: 'refactor authentication module', category: 'refactor' },
      ];

      tasks.forEach(task => {
        tracker.recordInteraction(task.id, {
          agent_id: 'coder',
          timestamp: new Date().toISOString(),
          action: task.action,
          duration_ms: 5000,
        });

        tracker.recordOutcome(task.id, 'success', {
          completion_time_ms: 15000,
          revision_count: 1,
          quality_score: 0.9,
        });
      });

      const patterns = tracker.getAllPatterns();
      expect(patterns.length).toBeGreaterThan(0);

      // Should match "create user login" to authentication feature
      const match = tracker.findPattern('Create Login', 'create user login system');
      expect(match).not.toBeNull();
      expect(match!.pattern.task_category).toBe('feature');

      console.log('✅ Related category matching test passed!');
      console.log(`   Input: "create user login system"`);
      console.log(`   Matched to: ${match!.pattern.name}`);
      console.log(`   Category: ${match!.pattern.task_category}`);
    });
  });

  /**
   * TEST 2: Enhanced Feature Extraction
   *
   * Extracts task category, file types, and complexity
   */
  describe('Enhanced Feature Extraction', () => {
    it('should infer task category from description', () => {
      const bugTask = 'fix the authentication bug in typescript';
      tracker.recordInteraction('task-bug', {
        agent_id: 'coder',
        timestamp: new Date().toISOString(),
        action: bugTask,
        duration_ms: 5000,
      });
      tracker.recordOutcome('task-bug', 'success', {
        completion_time_ms: 15000,
        revision_count: 1,
        quality_score: 0.9,
      });

      const patterns = tracker.getAllPatterns();
      const bugPattern = patterns.find(p => p.task_category === 'bugfix');
      expect(bugPattern).toBeDefined();

      console.log('✅ Task category extraction test passed!');
      console.log(`   Input: "${bugTask}"`);
      console.log(`   Category: ${bugPattern!.task_category}`);
    });

    it('should extract file types from task description', () => {
      const typescriptTask = 'implement api endpoint in typescript';
      tracker.recordInteraction('task-ts', {
        agent_id: 'coder',
        timestamp: new Date().toISOString(),
        action: typescriptTask,
        duration_ms: 5000,
      });
      tracker.recordOutcome('task-ts', 'success', {
        completion_time_ms: 15000,
        revision_count: 1,
        quality_score: 0.9,
      });

      const patterns = tracker.getAllPatterns();
      const tsPattern = patterns.find(p => p.file_types.includes('.ts'));
      expect(tsPattern).toBeDefined();

      console.log('✅ File type extraction test passed!');
      console.log(`   Input: "${typescriptTask}"`);
      console.log(`   File types: ${tsPattern!.file_types.join(', ')}`);
    });

    it('should estimate complexity from description and metrics', () => {
      // Low complexity task
      tracker.recordInteraction('task-simple', {
        agent_id: 'coder',
        timestamp: new Date().toISOString(),
        action: 'fix typo in comment',
        duration_ms: 1000,
      });
      tracker.recordOutcome('task-simple', 'success', {
        completion_time_ms: 5000,
        revision_count: 0,
        quality_score: 1.0,
      });

      // High complexity task
      tracker.recordInteraction('task-complex', {
        agent_id: 'coder',
        timestamp: new Date().toISOString(),
        action: 'redesign database architecture migration',
        duration_ms: 30000,
      });
      tracker.recordOutcome('task-complex', 'success', {
        completion_time_ms: 600000,
        revision_count: 5,
        quality_score: 0.8,
      });

      const patterns = tracker.getAllPatterns();
      const simplePattern = patterns.find(p => p.complexity === 'low');
      const complexPattern = patterns.find(p => p.complexity === 'high');

      expect(simplePattern).toBeDefined();
      expect(complexPattern).toBeDefined();

      console.log('✅ Complexity estimation test passed!');
      console.log(`   Simple task: ${simplePattern!.name} (${simplePattern!.complexity})`);
      console.log(`   Complex task: ${complexPattern!.name} (${complexPattern!.complexity})`);
    });
  });

  /**
   * TEST 3: Agent-Specific Performance Tracking
   *
   * Tracks which agents perform best on which patterns
   */
  describe('Agent Performance Tracking', () => {
    it('should track agent-specific success rates', () => {
      // Agent "coder" performs well on bugfix tasks
      for (let i = 0; i < 5; i++) {
        tracker.recordInteraction(`task-bug-${i}`, {
          agent_id: 'coder',
          timestamp: new Date().toISOString(),
          action: 'fix bug in authentication',
          duration_ms: 5000,
        });
        tracker.recordOutcome(`task-bug-${i}`, 'success', {
          completion_time_ms: 15000,
          revision_count: 1,
          quality_score: 0.9,
        });
      }

      // Agent "reviewer" performs poorly on bugfix tasks
      for (let i = 0; i < 3; i++) {
        tracker.recordInteraction(`task-bug-review-${i}`, {
          agent_id: 'reviewer',
          timestamp: new Date().toISOString(),
          action: 'fix bug in authentication',
          duration_ms: 10000,
        });
        tracker.recordOutcome(`task-bug-review-${i}`, 'failure', {
          completion_time_ms: 30000,
          revision_count: 3,
          quality_score: 0.3,
        });
      }

      const patterns = tracker.getAllPatterns();
      const bugfixPattern = patterns.find(p => p.task_category === 'bugfix');

      expect(bugfixPattern).toBeDefined();
      expect(bugfixPattern!.recommended_agents[0]).toBe('coder');

      const coderRate = bugfixPattern!.agent_performance.get('coder');
      const reviewerRate = bugfixPattern!.agent_performance.get('reviewer');

      expect(coderRate).toBeGreaterThan(reviewerRate!);

      console.log('✅ Agent performance tracking test passed!');
      console.log(`   Bugfix pattern: ${bugfixPattern!.name}`);
      console.log(`   Coder success rate: ${(coderRate! * 100).toFixed(1)}%`);
      console.log(`   Reviewer success rate: ${(reviewerRate! * 100).toFixed(1)}%`);
      console.log(`   Recommended order: ${bugfixPattern!.recommended_agents.join(', ')}`);
    });
  });

  /**
   * TEST 4: Routing Decision Demonstration
   *
   * Shows how DNA influences agent selection
   */
  describe('Routing Decision Demonstration', () => {
    it('should route similar tasks to the same successful agent', () => {
      // Train DNA with successful task by "frontend" agent
      tracker.recordInteraction('task-ui-001', {
        agent_id: 'frontend',
        timestamp: new Date().toISOString(),
        action: 'implement responsive ui component with css',
        duration_ms: 10000,
      });
      tracker.recordOutcome('task-ui-001', 'success', {
        completion_time_ms: 45000,
        revision_count: 1,
        quality_score: 0.95,
      });

      // Get patterns
      const patterns = tracker.getAllPatterns();
      expect(patterns.length).toBe(1);

      // Now try to route a similar task with different wording
      const match = tracker.findPattern(
        'Create Component',
        'build responsive user interface element using stylesheets'
      );

      expect(match).not.toBeNull();
      expect(match!.pattern.recommended_agents[0]).toBe('frontend');
      expect(match!.pattern.task_category).toBe('feature');

      console.log('✅ Routing decision test passed!');
      console.log('='.repeat(60));
      console.log('🧬 DNA ROUTING DECISION DEMONSTRATION:');
      console.log(`   Original task: "implement responsive ui component with css"`);
      console.log(`   Completed by: frontend (95% quality)`);
      console.log('');
      console.log(`   New task: "build responsive user interface element using stylesheets"`);
      console.log(`   Matched pattern: ${match!.pattern.name}`);
      console.log(`   Recommended agent: ${match!.pattern.recommended_agents[0]}`);
      console.log(`   Confidence: ${(match!.confidence * 100).toFixed(1)}%`);
      console.log(`   Reasoning: ${match!.reasoning}`);
      console.log('='.repeat(60));
    });

    it('should show fallback to hierarchy rules when no pattern matches', () => {
      // No patterns learned yet
      const match = tracker.findPattern(
        'Create Roadmap',
        'plan project roadmap for q1'
      );

      expect(match).toBeNull();

      console.log('✅ Fallback test passed!');
      console.log('   No pattern found -> will use hierarchy rules (Sisyphus)');
    });
  });

  /**
   * TEST 5: Semantic Vector Matching
   *
   * Direct test of semantic similarity computation
   */
  describe('Semantic Vector Matching', () => {
    it('should compute cosine similarity between related texts', () => {
      // Create a pattern
      tracker.recordInteraction('task-vec-001', {
        agent_id: 'coder',
        timestamp: new Date().toISOString(),
        action: 'optimize database query performance',
        duration_ms: 5000,
      });
      tracker.recordOutcome('task-vec-001', 'success', {
        completion_time_ms: 30000,
        revision_count: 2,
        quality_score: 0.85,
      });

      const patterns = tracker.getAllPatterns();
      const pattern = patterns[0];

      console.log('✅ Semantic vector matching test!');
      console.log('='.repeat(60));
      console.log('   Pattern created:');
      console.log(`   Name: ${pattern.name}`);
      console.log(`   Category: ${pattern.task_category}`);
      console.log(`   Semantic vector: ${Object.keys(pattern.semantic_vector).slice(0, 5).join(', ')}...`);
      console.log('');

      // Test various related queries
      const queries = [
        'improve sql query speed',
        'make database queries faster',
        'enhance query performance optimization',
      ];

      console.log('   Semantic similarity scores:');
      queries.forEach(query => {
        const match = tracker.findPattern('Query', query);
        if (match) {
          console.log(`   "${query}" -> ${(match.confidence * 100).toFixed(1)}% (${match.reasoning})`);
        }
      });
      console.log('='.repeat(60));

      // At least one should match
      const anyMatch = queries.some(q => {
        const m = tracker.findPattern('Q', q);
        return m !== null && m.confidence > 0.3;
      });
      expect(anyMatch).toBe(true);
    });
  });
});

/**
 * Integration Test: Full Learning Loop
 */
describe('DNA Tracker - Integration: Learning Loop', () => {
  let tracker: DNATracker;

  beforeEach(() => {
    (global as any).__DNA_TRACKER_INSTANCE__ = null;
    tracker = new DNATracker();
  });

  it('should demonstrate complete learning and routing cycle', () => {
    console.log('\n' + '='.repeat(70));
    console.log('🧬 DNA LEARNING LOOP DEMONSTRATION');
    console.log('='.repeat(70));

    // PHASE 1: Learning from past tasks
    console.log('\n📚 PHASE 1: Learning from past tasks...\n');

    const pastTasks = [
      { agent: 'coder', task: 'fix authentication bug', outcome: 'success', quality: 0.95 },
      { agent: 'coder', task: 'resolve login error', outcome: 'success', quality: 0.9 },
      { agent: 'reviewer', task: 'fix authentication bug', outcome: 'failure', quality: 0.4 },
      { agent: 'frontend', task: 'implement ui component', outcome: 'success', quality: 0.85 },
      { agent: 'ops', task: 'deploy application', outcome: 'success', quality: 0.9 },
    ];

    pastTasks.forEach((pt, i) => {
      const taskId = `past-task-${i}`;
      tracker.recordInteraction(taskId, {
        agent_id: pt.agent,
        timestamp: new Date().toISOString(),
        action: pt.task,
        duration_ms: 5000,
      });
      tracker.recordOutcome(taskId, pt.outcome, {
        completion_time_ms: 15000,
        revision_count: pt.outcome === 'success' ? 1 : 3,
        quality_score: pt.quality,
      });
      console.log(`   ✓ "${pt.task}" by ${pt.agent} -> ${pt.outcome} (${(pt.quality * 100).toFixed(0)}% quality)`);
    });

    const patterns = tracker.getAllPatterns();
    console.log(`\n   📊 Learned ${patterns.length} patterns:\n`);
    patterns.forEach(p => {
      console.log(`      • ${p.name}`);
      console.log(`        Category: ${p.task_category} | Complexity: ${p.complexity}`);
      console.log(`        Success Rate: ${(p.success_rate * 100).toFixed(1)}%`);
      console.log(`        Best Agent: ${p.recommended_agents[0]} (${(p.agent_performance.get(p.recommended_agents[0])! * 100).toFixed(1)}% success)`);
    });

    // PHASE 2: Routing new tasks
    console.log('\n🚀 PHASE 2: Routing new tasks based on learned patterns...\n');

    const newTasks = [
      'debug login authentication issue',
      'build user interface component',
      'resolve authentication error',
    ];

    newTasks.forEach(task => {
      const match = tracker.findPattern('New Task', task);
      if (match && match.confidence > 0.4) {
        const agent = match.pattern.recommended_agents[0];
        const agentRate = match.pattern.agent_performance.get(agent);
        console.log(`   📝 Task: "${task}"`);
        console.log(`      → Route to: ${agent}`);
        console.log(`      → Pattern: ${match.pattern.name}`);
        console.log(`      → Confidence: ${(match.confidence * 100).toFixed(1)}%`);
        console.log(`      → Agent past success: ${(agentRate! * 100).toFixed(1)}%`);
        console.log(`      → Reasoning: ${match.reasoning}`);
        console.log('');
      } else {
        console.log(`   📝 Task: "${task}"`);
        console.log(`      → No pattern match (will use hierarchy rules)`);
        console.log('');
      }
    });

    console.log('='.repeat(70));
    console.log('✅ DNA Learning loop complete!\n');

    // Verify patterns were created
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns.some(p => p.task_category === 'bugfix')).toBe(true);
  });
});
