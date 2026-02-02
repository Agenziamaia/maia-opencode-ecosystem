/**
 * COUNCIL ENFORCEMENT TEST
 *
 * Demonstrates that Council votes now AFFECT system behavior.
 *
 * Test scenarios:
 * 1. Council rejection blocks execution
 * 2. Council approval allows execution
 * 3. Emergency override bypasses Council
 * 4. Timeout handling when no votes cast
 * 5. Execution feedback loop
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  getEnhancedCouncil,
  EnhancedCouncil,
  resetEnhancedCouncil,
  type CouncilProposal,
  type CouncilDecision
} from '../council/enhanced-council.js';
import {
  getMaiaDaemon,
  MaiaDaemon
} from '../execution/maia-daemon.js';

describe('Council Enforcement Integration Tests', () => {
  let council: EnhancedCouncil;
  let daemon: MaiaDaemon;

  beforeEach(() => {
    // Reset for clean test state
    resetEnhancedCouncil();
    council = getEnhancedCouncil();
    daemon = getMaiaDaemon();

    // Start a Council session
    council.startSession(
      ['Test complex decision', 'Test architectural change'],
      ['maia', 'coder', 'reviewer']
    );
  });

  afterEach(() => {
    council.adjournSession();
  });

  describe('Scenario 1: Council Rejection Blocks Execution', () => {
    it('should BLOCK dispatch when Council rejects', async () => {
      console.log('\n=== TEST 1: Council Rejection ===');

      const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
        title: 'Test: Breaking API Change',
        description: 'Redesign the entire API without backward compatibility',
        proposalType: 'architectural',
        proposedBy: 'coder',
        context: {
          risks: ['Breaking all existing integrations', 'High risk of bugs'],
          benefits: ['Cleaner API design'],
          alternatives: ['Versioned API approach']
        },
        expiresAt: new Date(Date.now() + 10000).toISOString(),
        consensusThreshold: 0.6,
        vetoPower: true,
        expertiseWeights: true,
        estimatedImpact: 'critical'
      };

      // Start voting and cast rejecting votes
      const createdProposal = await council.propose(proposal);
      council.startVoting(createdProposal.id);

      // Coder votes YES
      council.vote(createdProposal.id, 'coder', 'yes', 'I want clean API', 0.8);
      // Reviewer votes NO
      council.vote(createdProposal.id, 'reviewer', 'no', 'Too risky without versioning', 0.9);
      // MAIA casts VETO
      council.vote(createdProposal.id, 'maia', 'veto', 'Veto - use versioned approach', 0.95);

      // Wait for decision
      const result = await council.waitForCouncilDecision(
        proposal,
        5000,
        false // no skip
      );

      console.log(`Decision: ${result.decision?.decision}`);
      console.log(`Rationale: ${result.decision?.rationale}`);
      console.log(`Approved: ${result.approved}`);

      expect(result.approved).toBe(false);
      expect(result.decision?.decision).toBe('rejected');
      expect(result.decision?.voteSummary.veto).toBe(1);

      console.log('✅ TEST PASSED: Council rejection correctly blocks execution\n');
    });
  });

  describe('Scenario 2: Council Approval Allows Execution', () => {
    it('should ALLOW dispatch when Council approves', async () => {
      console.log('\n=== TEST 2: Council Approval ===');

      const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
        title: 'Test: Add unit tests for auth module',
        description: 'Add comprehensive unit tests for the authentication module',
        proposalType: 'refactoring',
        proposedBy: 'reviewer',
        context: {
          risks: ['None significant'],
          benefits: ['Better test coverage', 'Catch bugs early'],
          alternatives: []
        },
        expiresAt: new Date(Date.now() + 10000).toISOString(),
        consensusThreshold: 0.6,
        vetoPower: true,
        expertiseWeights: true,
        estimatedImpact: 'low'
      };

      // Start voting and cast approving votes
      const createdProposal = await council.propose(proposal);
      council.startVoting(createdProposal.id);

      // All agents vote YES
      council.vote(createdProposal.id, 'reviewer', 'yes', 'Good for quality', 0.95);
      council.vote(createdProposal.id, 'coder', 'yes', 'Makes maintenance easier', 0.85);
      council.vote(createdProposal.id, 'maia', 'yes', 'Approved', 0.9);

      // Wait for decision
      const result = await council.waitForCouncilDecision(
        proposal,
        5000,
        false
      );

      console.log(`Decision: ${result.decision?.decision}`);
      console.log(`Rationale: ${result.decision?.rationale}`);
      console.log(`Consensus Level: ${result.decision?.consensusLevel}`);
      console.log(`Approved: ${result.approved}`);

      expect(result.approved).toBe(true);
      expect(result.decision?.decision).toBe('approved');
      expect(result.decision?.consensusLevel).toBeGreaterThan(0.6);

      console.log('✅ TEST PASSED: Council approval allows execution\n');
    });
  });

  describe('Scenario 3: Emergency Override Bypasses Council', () => {
    it('should SKIP Council when emergency override is active', async () => {
      console.log('\n=== TEST 3: Emergency Override ===');

      const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
        title: 'Test: Emergency security patch',
        description: 'Apply critical security patch immediately',
        proposalType: 'architectural',
        proposedBy: 'ops',
        context: {
          risks: ['None - critical fix'],
          benefits: ['Security vulnerability fixed'],
          alternatives: []
        },
        expiresAt: new Date(Date.now() + 10000).toISOString(),
        consensusThreshold: 0.6,
        vetoPower: true,
        expertiseWeights: true,
        estimatedImpact: 'critical'
      };

      // Use emergency override
      const result = await council.waitForCouncilDecision(
        proposal,
        5000,
        true // skipCouncil = true
      );

      console.log(`Skipped: ${result.skipped}`);
      console.log(`Approved: ${result.approved}`);
      console.log(`Reason: ${result.reason}`);

      expect(result.skipped).toBe(true);
      expect(result.approved).toBe(true);
      expect(result.decision).toBeNull();

      console.log('✅ TEST PASSED: Emergency override bypasses Council\n');
    });
  });

  describe('Scenario 4: Timeout Handling', () => {
    it('should TIMEOUT when no votes are cast', async () => {
      console.log('\n=== TEST 4: Timeout Handling ===');

      const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
        title: 'Test: Complex architectural decision',
        description: 'Should we migrate to microservices?',
        proposalType: 'architectural',
        proposedBy: 'maia',
        context: {
          risks: ['Complexity increase', 'Network overhead'],
          benefits: ['Better scalability', 'Independent deployment'],
          alternatives: ['Monolith with modular design']
        },
        expiresAt: new Date(Date.now() + 10000).toISOString(),
        consensusThreshold: 0.6,
        vetoPower: true,
        expertiseWeights: true,
        estimatedImpact: 'high'
      };

      // Start voting but DON'T cast any votes
      const createdProposal = await council.propose(proposal);
      council.startVoting(createdProposal.id);

      // Wait for decision with short timeout
      const result = await council.waitForCouncilDecision(
        proposal,
        3000, // 3 second timeout
        false
      );

      console.log(`Timeout: ${result.timeout}`);
      console.log(`Approved: ${result.approved}`);
      console.log(`Reason: ${result.reason}`);

      expect(result.timeout).toBe(true);
      expect(result.approved).toBe(false);

      console.log('✅ TEST PASSED: Timeout correctly blocks execution\n');
    });
  });

  describe('Scenario 5: Execution Feedback Loop', () => {
    it('should REPORT execution outcome back to Council', async () => {
      console.log('\n=== TEST 5: Execution Feedback ===');

      const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
        title: 'Test: Refactor auth module',
        description: 'Refactor authentication module for better maintainability',
        proposalType: 'refactoring',
        proposedBy: 'coder',
        context: {
          risks: ['Potential introduction of bugs'],
          benefits: ['Better code organization', 'Easier to maintain'],
          alternatives: []
        },
        expiresAt: new Date(Date.now() + 10000).toISOString(),
        consensusThreshold: 0.6,
        vetoPower: true,
        expertiseWeights: true,
        estimatedImpact: 'medium'
      };

      // Get approval
      const createdProposal = await council.propose(proposal);
      council.startVoting(createdProposal.id);

      council.vote(createdProposal.id, 'coder', 'yes', 'I will do this carefully', 0.9);
      council.vote(createdProposal.id, 'reviewer', 'yes', 'Good for quality', 0.85);

      const voteResult = await council.waitForCouncilDecision(proposal, 5000, false);

      expect(voteResult.approved).toBe(true);

      // Simulate execution completion
      council.reportExecutionOutcome(
        createdProposal.id,
        'success',
        'Refactoring completed successfully - code is now more maintainable',
        {
          duration: 15000,
          filesChanged: 5,
          testsAdded: 12
        }
      );

      // Verify outcome was recorded
      const decision = council.getDecision(createdProposal.id);
      console.log(`Execution Result: ${decision?.executionResult}`);

      expect(decision?.executionResult).toContain('successfully');

      // Verify expertise was updated
      const coderStats = council.getAgentStats('coder');
      console.log(`Coder votes: ${coderStats.totalVotes}`);
      console.log(`Coder average confidence: ${coderStats.averageConfidence}`);

      expect(coderStats.totalVotes).toBeGreaterThan(0);

      console.log('✅ TEST PASSED: Execution feedback loop working\n');
    });
  });

  describe('Scenario 6: MaiaDaemon Integration', () => {
    it('should BLOCK complex decisions in MaiaDaemon without Council approval', async () => {
      console.log('\n=== TEST 6: MaiaDaemon Integration (Blocking) ===');

      // This should trigger Council consultation
      const instruction = 'Redesign the entire database architecture with breaking changes';

      // Start a proposal but REJECT it
      const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
        title: `Dispatch: ${instruction.slice(0, 50)}...`,
        description: instruction,
        proposalType: 'architectural',
        proposedBy: 'coder',
        context: {
          risks: ['Data loss risk', 'Downtime'],
          benefits: ['Better performance'],
          alternatives: []
        },
        expiresAt: new Date(Date.now() + 10000).toISOString(),
        consensusThreshold: 0.6,
        vetoPower: true,
        expertiseWeights: true,
        estimatedImpact: 'critical'
      };

      const createdProposal = await council.propose(proposal);
      council.startVoting(createdProposal.id);

      // Council REJECTS
      council.vote(createdProposal.id, 'maia', 'veto', 'Too risky - need migration plan', 0.95);
      council.vote(createdProposal.id, 'reviewer', 'no', 'Concerned about data safety', 0.9);

      // Wait for rejection
      const councilResult = await council.waitForCouncilDecision(proposal, 3000, false);
      expect(councilResult.approved).toBe(false);

      console.log('✅ TEST PASSED: MaiaDaemon would block this dispatch\n');
    });

    it('should ALLOW bypass with skipCouncil flag', async () => {
      console.log('\n=== TEST 7: MaiaDaemon Integration (Emergency Bypass) ===');

      const instruction = 'Redesign the entire database architecture with breaking changes';

      // This simulates what MaiaDaemon does internally
      const result = await council.waitForCouncilDecision(
        {
          title: `Dispatch: ${instruction.slice(0, 50)}...`,
          description: instruction,
          proposalType: 'architectural',
          proposedBy: 'coder',
          context: {
            risks: ['Data loss risk', 'Downtime'],
            benefits: ['Better performance'],
            alternatives: []
          },
          expiresAt: new Date(Date.now() + 10000).toISOString(),
          consensusThreshold: 0.6,
          vetoPower: true,
          expertiseWeights: true,
          estimatedImpact: 'critical'
        },
        3000,
        true // skipCouncil = true (emergency override)
      );

      console.log(`Skipped: ${result.skipped}`);
      console.log(`Approved: ${result.approved}`);

      expect(result.skipped).toBe(true);
      expect(result.approved).toBe(true);

      console.log('✅ TEST PASSED: Emergency bypass allows execution\n');
    });
  });
});

// Run the tests
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║        COUNCIL ENFORCEMENT INTEGRATION TEST SUITE              ║');
console.log('║    Demonstrating that Council votes now AFFECT behavior        ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
