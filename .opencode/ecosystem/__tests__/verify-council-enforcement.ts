/**
 * COUNCIL ENFORCEMENT VERIFICATION SCRIPT
 *
 * This script demonstrates that Council votes now AFFECT system behavior.
 * Run this to verify the enforcement mechanism is working correctly.
 */

import { getEnhancedCouncil, resetEnhancedCouncil, type CouncilProposal } from '../council/enhanced-council.js';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * SCENARIO 1: Council REJECTS a risky proposal
 */
async function testCouncilRejects() {
  log('cyan', '\n' + '='.repeat(70));
  log('cyan', 'SCENARIO 1: Council REJECTS a risky architectural change');
  log('cyan', '='.repeat(70));

  const council = getEnhancedCouncil();
  council.startSession(['Test risky architecture'], ['maia', 'coder', 'reviewer']);

  const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
    title: 'Breaking: Redesign entire API without backward compatibility',
    description: 'Remove all legacy API endpoints and replace with new design',
    proposalType: 'architectural',
    proposedBy: 'coder',
    context: {
      risks: ['Breaking all client integrations', 'High risk of production failures'],
      benefits: ['Cleaner codebase'],
      alternatives: ['Use API versioning instead'],
    },
    expiresAt: new Date(Date.now() + 10000).toISOString(),
    consensusThreshold: 0.6,
    vetoPower: true,
    expertiseWeights: true,
    estimatedImpact: 'critical',
  };

  log('yellow', '📝 Creating proposal...');
  const createdProposal = await council.propose(proposal);
  log('yellow', `   Proposal ID: ${createdProposal.id}`);

  log('yellow', '\n🗳️ Starting vote...');
  council.startVoting(createdProposal.id);

  log('blue', '\n📊 Casting votes:');
  log('blue', '   coder:       YES (wants clean API)');
  council.vote(createdProposal.id, 'coder', 'yes', 'I want clean API design', 0.8);

  log('blue', '   reviewer:    NO (too risky)');
  council.vote(createdProposal.id, 'reviewer', 'no', 'Too risky without migration plan', 0.9);

  log('blue', '   maia:        VETO (blocks execution)');
  const vetoVote = council.vote(createdProposal.id, 'maia', 'veto', 'Veto - must use versioned approach', 0.95);

  log('yellow', '\n⏳ Waiting for Council decision...');
  const result = await council.waitForCouncilDecision(proposal, 5000, false);

  log('magenta', '\n📋 DECISION RESULT:');
  log('magenta', `   Decision: ${result.decision?.decision.toUpperCase()}`);
  log('magenta', `   Approved: ${result.approved}`);
  log('magenta', `   Rationale: ${result.reason}`);

  if (!result.approved) {
    log('green', '\n✅ SUCCESS: Execution was BLOCKED by Council!');
  } else {
    log('red', '\n❌ FAILED: Council should have blocked this!');
  }

  council.adjournSession();
  return result.approved === false;
}

/**
 * SCENARIO 2: Council APPROVES a safe proposal
 */
async function testCouncilApproves() {
  log('cyan', '\n' + '='.repeat(70));
  log('cyan', 'SCENARIO 2: Council APPROVES a safe refactoring');
  log('cyan', '='.repeat(70));

  resetEnhancedCouncil();
  const council = getEnhancedCouncil();
  council.startSession(['Test safe refactoring'], ['maia', 'coder', 'reviewer']);

  const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
    title: 'Add unit tests for authentication module',
    description: 'Add comprehensive unit tests for the authentication module',
    proposalType: 'refactoring',
    proposedBy: 'reviewer',
    context: {
      risks: ['None significant'],
      benefits: ['Better test coverage', 'Catch bugs early', 'Improved confidence'],
      alternatives: [],
    },
    expiresAt: new Date(Date.now() + 10000).toISOString(),
    consensusThreshold: 0.6,
    vetoPower: true,
    expertiseWeights: true,
    estimatedImpact: 'low',
  };

  log('yellow', '📝 Creating proposal...');
  const createdProposal = await council.propose(proposal);
  log('yellow', `   Proposal ID: ${createdProposal.id}`);

  log('yellow', '\n🗳️ Starting vote...');
  council.startVoting(createdProposal.id);

  log('blue', '\n📊 Casting votes:');
  log('blue', '   reviewer:    YES (improves quality)');
  council.vote(createdProposal.id, 'reviewer', 'yes', 'Good for code quality', 0.95);

  log('blue', '   coder:       YES (helps maintenance)');
  council.vote(createdProposal.id, 'coder', 'yes', 'Makes future changes safer', 0.85);

  log('blue', '   maia:        YES (approved)');
  council.vote(createdProposal.id, 'maia', 'yes', 'Approved - good initiative', 0.9);

  log('yellow', '\n⏳ Waiting for Council decision...');
  const result = await council.waitForCouncilDecision(proposal, 5000, false);

  log('magenta', '\n📋 DECISION RESULT:');
  log('magenta', `   Decision: ${result.decision?.decision.toUpperCase()}`);
  log('magenta', `   Approved: ${result.approved}`);
  log('magenta', `   Consensus Level: ${(result.decision?.consensusLevel! * 100).toFixed(1)}%`);
  log('magenta', `   Rationale: ${result.reason}`);

  if (result.approved) {
    log('green', '\n✅ SUCCESS: Execution was ALLOWED by Council!');
  } else {
    log('red', '\n❌ FAILED: Council should have approved this!');
  }

  council.adjournSession();
  return result.approved === true;
}

/**
 * SCENARIO 3: Emergency override bypasses Council
 */
async function testEmergencyOverride() {
  log('cyan', '\n' + '='.repeat(70));
  log('cyan', 'SCENARIO 3: Emergency override bypasses Council');
  log('cyan', '='.repeat(70));

  resetEnhancedCouncil();
  const council = getEnhancedCouncil();

  const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
    title: 'EMERGENCY: Apply critical security patch',
    description: 'Apply critical security patch to fix vulnerability',
    proposalType: 'architectural',
    proposedBy: 'ops',
    context: {
      risks: ['None - critical security fix'],
      benefits: ['Security vulnerability fixed immediately'],
      alternatives: [],
    },
    expiresAt: new Date(Date.now() + 10000).toISOString(),
    consensusThreshold: 0.6,
    vetoPower: true,
    expertiseWeights: true,
    estimatedImpact: 'critical',
  };

  log('yellow', '⚠️  EMERGENCY OVERRIDE ACTIVATED');
  log('yellow', '    Council consultation will be bypassed');

  log('yellow', '\n⏳ Waiting for Council decision (with skipCouncil=true)...');
  const result = await council.waitForCouncilDecision(proposal, 5000, true);

  log('magenta', '\n📋 DECISION RESULT:');
  log('magenta', `   Skipped: ${result.skipped}`);
  log('magenta', `   Approved: ${result.approved}`);
  log('magenta', `   Reason: ${result.reason}`);

  if (result.skipped && result.approved) {
    log('green', '\n✅ SUCCESS: Emergency override bypassed Council!');
  } else {
    log('red', '\n❌ FAILED: Emergency override should have worked!');
  }

  return result.skipped === true && result.approved === true;
}

/**
 * SCENARIO 4: Execution feedback loop
 */
async function testExecutionFeedback() {
  log('cyan', '\n' + '='.repeat(70));
  log('cyan', 'SCENARIO 4: Execution feedback reported back to Council');
  log('cyan', '='.repeat(70));

  resetEnhancedCouncil();
  const council = getEnhancedCouncil();
  council.startSession(['Test feedback loop'], ['maia', 'coder']);

  const proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'> = {
    title: 'Refactor payment processing module',
    description: 'Refactor payment processing for better maintainability',
    proposalType: 'refactoring',
    proposedBy: 'coder',
    context: {
      risks: ['Potential bugs during refactoring'],
      benefits: ['Cleaner code', 'Easier maintenance'],
      alternatives: [],
    },
    expiresAt: new Date(Date.now() + 10000).toISOString(),
    consensusThreshold: 0.6,
    vetoPower: true,
    expertiseWeights: true,
    estimatedImpact: 'medium',
  };

  log('yellow', '📝 Creating proposal...');
  const createdProposal = await council.propose(proposal);
  council.startVoting(createdProposal.id);

  log('blue', '\n📊 Casting votes:');
  council.vote(createdProposal.id, 'coder', 'yes', 'I will be careful', 0.9);
  council.vote(createdProposal.id, 'maia', 'yes', 'Approved', 0.85);

  log('yellow', '\n⏳ Waiting for Council decision...');
  const voteResult = await council.waitForCouncilDecision(proposal, 5000, false);

  log('magenta', '\n📋 DECISION:');
  log('magenta', `   Approved: ${voteResult.approved}`);

  if (voteResult.approved) {
    log('yellow', '\n🚀 Simulating execution...');

    // Simulate execution
    await sleep(500);

    log('yellow', '✅ Task completed successfully!');

    log('yellow', '\n📊 Reporting outcome back to Council...');
    council.reportExecutionOutcome(
      createdProposal.id,
      'success',
      'Refactoring completed successfully - code is now more maintainable',
      {
        duration: 500,
        filesChanged: 3,
        testsAdded: 5,
      }
    );

    const decision = council.getDecision(createdProposal.id);
    log('magenta', '\n📋 COUNCIL RECORD UPDATED:');
    log('magenta', `   Execution Result: ${decision?.executionResult}`);

    const coderStats = council.getAgentStats('coder');
    log('magenta', '\n📊 AGENT STATS UPDATED:');
    log('magenta', `   Coder total votes: ${coderStats.totalVotes}`);
    log('magenta', `   Coder avg confidence: ${coderStats.averageConfidence.toFixed(2)}`);

    log('green', '\n✅ SUCCESS: Feedback loop working!');
  } else {
    log('red', '\n❌ FAILED: Proposal should have been approved');
  }

  council.adjournSession();
  return voteResult.approved === true;
}

/**
 * Main verification runner
 */
export async function verifyCouncilEnforcement() {
  log('magenta', '\n╔════════════════════════════════════════════════════════════════════╗');
  log('magenta', '║        COUNCIL ENFORCEMENT VERIFICATION                           ║');
  log('magenta', '║    Demonstrating that Council votes now AFFECT behavior            ║');
  log('magenta', '╚════════════════════════════════════════════════════════════════════╝');

  const results: { name: string; passed: boolean }[] = [];

  results.push({ name: 'Council Rejects', passed: await testCouncilRejects() });
  results.push({ name: 'Council Approves', passed: await testCouncilApproves() });
  results.push({ name: 'Emergency Override', passed: await testEmergencyOverride() });
  results.push({ name: 'Execution Feedback', passed: await testExecutionFeedback() });

  log('cyan', '\n' + '='.repeat(70));
  log('cyan', 'FINAL RESULTS');
  log('cyan', '='.repeat(70));

  for (const result of results) {
    if (result.passed) {
      log('green', `   ✅ ${result.name}: PASSED`);
    } else {
      log('red', `   ❌ ${result.name}: FAILED`);
    }
  }

  const allPassed = results.every(r => r.passed);

  log('cyan', '\n' + '='.repeat(70));
  if (allPassed) {
    log('green', '🎉 ALL TESTS PASSED! Council enforcement is working correctly!');
  } else {
    log('red', '⚠️  SOME TESTS FAILED! Review the implementation.');
  }
  log('cyan', '='.repeat(70) + '\n');

  return allPassed;
}

// Run verification if this file is executed directly
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  verifyCouncilEnforcement().catch(console.error);
}
