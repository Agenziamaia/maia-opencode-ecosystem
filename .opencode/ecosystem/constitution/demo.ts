/**
 * THE MAIA CONSTITUTION - Demo
 *
 * Demonstrates the complete governance system:
 * 1. Constitution - Evaluating actions for constitutionality
 * 2. Council - Voting on proposals
 * 3. Predictive Engine - Anticipating needs and detecting risks
 *
 * This showcases the orchestrator's perspective on governance.
 */

import {
  getConstitution,
  getEnhancedCouncil,
  getPredictiveEngine,
  evaluateAction,
  getProactiveSuggestions,
  proposeCouncilDecision,
  voteOnProposal,
  initializeGovernance,
  getGovernanceHealth
} from './index.js';

// ============================================================================
// DEMO: CONSTITUTIONAL EVALUATION
// ============================================================================

/**
 * Demo 1: Evaluate an action through the Constitution
 */
async function demoConstitutionalEvaluation() {
  console.log('\n' + '='.repeat(60));
  console.log('🏛️  DEMO 1: CONSTITUTIONAL EVALUATION');
  console.log('='.repeat(60));

  const { evaluateAction } = await import('./index.js');

  // Scenario 1: Safe action (reading a file)
  console.log('\n📖 Scenario 1: Reading a file (should be constitutional)');
  const readAction = {
    id: 'action_1',
    agentId: 'coder',
    actionType: 'read' as const,
    target: '/path/to/file.ts',
    description: 'Read the TypeScript file to understand its structure',
    context: {},
    timestamp: new Date().toISOString()
  };

  const readResult = evaluateAction(readAction);
  console.log(`   Result: ${readResult.ruling.isConstitutional ? '✅ CONSTITUTIONAL' : '❌ UNCONSTITUTIONAL'}`);
  console.log(`   Confidence: ${(readResult.ruling.confidence * 100).toFixed(1)}%`);
  if (readResult.ruling.warnings.length > 0) {
    console.log(`   Warnings: ${readResult.ruling.warnings.join(', ')}`);
  }

  // Scenario 2: Unsafe action (deleting without consent)
  console.log('\n🗑️  Scenario 2: Deleting files without consent (should be unconstitutional)');
  const deleteAction = {
    id: 'action_2',
    agentId: 'coder',
    actionType: 'delete' as const,
    target: '/path/to/production/data.db',
    description: 'Delete the production database',
    context: {
      autonomous: true,
      affectsMultipleSystems: true
    },
    timestamp: new Date().toISOString()
  };

  const deleteResult = evaluateAction(deleteAction);
  console.log(`   Result: ${deleteResult.ruling.isConstitutional ? '✅ CONSTITUTIONAL' : '❌ UNCONSTITUTIONAL'}`);
  console.log(`   Violated Principles:`);
  for (const violation of deleteResult.ruling.violatedPrinciples) {
    console.log(`      - ${violation.principle.name} (${violation.severity})`);
    console.log(`        ${violation.explanation}`);
  }
  console.log(`   Alternatives: ${deleteResult.alternatives.length} safer options`);
  for (const alt of deleteResult.alternatives) {
    console.log(`      → ${alt.description}`);
    console.log(`        ${alt.reasoning}`);
  }

  // Scenario 3: Major change without consultation
  console.log('\n🏗️  Scenario 3: Architectural change without consultation (should trigger warning)');
  const archAction = {
    id: 'action_3',
    agentId: 'maia',
    actionType: 'modify' as const,
    target: 'core-architecture',
    description: 'Refactor the entire codebase architecture',
    context: {
      affectsMultipleFiles: true,
      affectsMultipleSystems: true,
      isArchitectural: true
    },
    timestamp: new Date().toISOString()
  };

  const archResult = evaluateAction(archAction);
  console.log(`   Result: ${archResult.ruling.isConstitutional ? '✅ CONSTITUTIONAL' : '❌ UNCONSTITUTIONAL'}`);
  console.log(`   Requires Council: ${archResult.requiresCouncil ? '⚖️  YES' : 'No'}`);
  console.log(`   Requires User Approval: ${archResult.requiresUserApproval ? '👤 YES' : 'No'}`);
}

// ============================================================================
// DEMO: COUNCIL VOTING
// ============================================================================

/**
 * Demo 2: Council voting on a proposal
 */
async function demoCouncilVoting() {
  console.log('\n' + '='.repeat(60));
  console.log('⚖️  DEMO 2: COUNCIL VOTING');
  console.log('='.repeat(60));

  const council = getEnhancedCouncil();

  // Start a council session
  console.log('\n📋 Starting council session...');
  const session = council.startSession(
    ['Vote on architectural refactoring', 'Approve database migration'],
    ['maia', 'coder', 'reviewer', 'sisyphus']
  );
  console.log(`   Session ID: ${session.id}`);
  console.log(`   Participants: ${session.participants.join(', ')}`);

  // Create a proposal
  console.log('\n📝 Creating proposal for architectural refactoring...');
  const proposal = await council.propose({
    title: 'Refactor Core Architecture',
    description: 'Refactor the codebase to use a modular architecture with better separation of concerns',
    proposalType: 'architectural',
    proposedBy: 'maia',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
    context: {
      taskId: 'task_123',
      workflowId: 'workflow_456',
      affectedAgents: ['coder', 'reviewer'],
      affectedFiles: ['src/core/*', 'src/utils/*'],
      affectedSystems: ['api', 'frontend'],
      risks: [
        'Potential breaking changes',
        'Requires extensive testing',
        'May delay other features'
      ],
      benefits: [
        'Better maintainability',
        'Easier to add new features',
        'Improved code quality'
      ],
      alternatives: [
        'Incremental refactoring',
        'Parallel development with feature flags'
      ]
    },
    consensusThreshold: 0.7,
    vetoPower: true,
    expertiseWeights: true,
    estimatedImpact: 'high'
  });
  console.log(`   Proposal ID: ${proposal.id}`);
  console.log(`   Status: ${proposal.status}`);
  console.log(`   Constitutional Check: ${proposal.constitutionCheck?.checked ? '✅' : '⏳'}`);

  // Start voting
  console.log('\n🗳️  Starting voting phase...');
  council.startVoting(proposal.id);
  console.log(`   Voting started`);

  // Cast votes
  console.log('\n📊 Casting votes...');

  const vote1 = council.vote(proposal.id, 'maia', 'yes', 'This refactoring is necessary for long-term maintainability', 0.95);
  console.log(`   @maia: YES (${vote1 ? 'cast' : 'failed'})`);

  const vote2 = council.vote(proposal.id, 'coder', 'yes', 'Will make code easier to work with', 0.85);
  console.log(`   @coder: YES (${vote2 ? 'cast' : 'failed'})`);

  const vote3 = council.vote(proposal.id, 'reviewer', 'yes', 'Improves code quality and testability', 0.9);
  console.log(`   @reviewer: YES (${vote3 ? 'cast' : 'failed'})`);

  // Check decision
  console.log('\n🎯 Checking decision...');
  const decision = council.getDecision(proposal.id);
  if (decision) {
    console.log(`   Decision: ${decision.decision.toUpperCase()}`);
    console.log(`   Rationale: ${decision.rationale}`);
    console.log(`   Consensus: ${decision.consensus ? '✅' : '❌'} (${(decision.consensusLevel * 100).toFixed(1)}%)`);
    console.log(`   Vote Summary:`);
    console.log(`      YES: ${decision.voteSummary.yes}`);
    console.log(`      NO: ${decision.voteSummary.no}`);
    console.log(`      ABSTAIN: ${decision.voteSummary.abstain}`);
    console.log(`      VETO: ${decision.voteSummary.veto}`);
  }

  // Adjourn session
  console.log('\n🔨 Adjourning session...');
  council.adjournSession();
}

// ============================================================================
// DEMO: PREDICTIVE INTELLIGENCE
// ============================================================================

/**
 * Demo 3: Predictive engine anticipating needs
 */
async function demoPredictiveIntelligence() {
  console.log('\n' + '='.repeat(60));
  console.log('🔮 DEMO 3: PREDICTIVE INTELLIGENCE');
  console.log('='.repeat(60));

  const predictive = getPredictiveEngine();

  // User context
  console.log('\n👤 Analyzing user context...');
  const userContext = {
    currentTask: {
      id: 'task_789',
      title: 'Implement REST API endpoint for user management',
      description: 'Build CRUD endpoints for user resources',
      type: 'implementation',
      startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      progress: 0.7
    },
    recentTasks: [
      {
        id: 'task_123',
        title: 'Design database schema',
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        success: true
      }
    ],
    activeAgents: ['coder', 'reviewer'],
    systemState: {
      cpuUsage: 0.45,
      memoryUsage: 0.72,
      diskUsage: 0.88,
      networkStatus: 'connected' as const
    },
    timeContext: {
      currentTime: new Date().toISOString(),
      timeOfDay: 'afternoon' as const,
      dayOfWeek: 'Tuesday',
      isWorkHours: true
    },
    projectContext: {
      name: 'User Management System',
      type: 'backend-api',
      phase: 'implementation',
      techStack: ['TypeScript', 'Express', 'PostgreSQL']
    }
  };

  // Get predictions
  console.log('\n🔮 Generating predictions...');
  const predictions = predictive.predictNext(userContext);
  console.log(`   Found ${predictions.length} prediction(s)`);

  for (const pred of predictions) {
    console.log(`\n   📊 Prediction: ${pred.prediction}`);
    console.log(`      Type: ${pred.type}`);
    console.log(`      Confidence: ${(pred.confidence * 100).toFixed(1)}%`);
    console.log(`      Urgency: ${pred.urgency}`);
    console.log(`      Reasoning: ${pred.reasoning}`);
    console.log(`      Suggested Actions:`);
    for (const action of pred.suggestedActions.slice(0, 2)) {
      console.log(`         - ${action.action} (${action.type})`);
    }
  }

  // Detect risks
  console.log('\n⚠️  Detecting risks...');
  const workflow = {
    id: 'workflow_123',
    name: 'User API Implementation',
    tasks: [
      {
        id: 'task_1',
        title: 'Implement GET endpoint',
        status: 'completed',
        dependencies: []
      },
      {
        id: 'task_2',
        title: 'Implement POST endpoint',
        status: 'running',
        dependencies: ['task_1']
      },
      {
        id: 'task_3',
        title: 'Write tests',
        status: 'pending',
        dependencies: ['task_2']
      }
    ],
    status: 'in_progress',
    startedAt: new Date().toISOString()
  };

  const risks = predictive.detectRisks(workflow, userContext);
  console.log(`   Found ${risks.length} risk(s)`);

  for (const risk of risks) {
    console.log(`\n   ⚠️  Risk: ${risk.title}`);
    console.log(`      Severity: ${risk.severity}`);
    console.log(`      Category: ${risk.category}`);
    console.log(`      Probability: ${(risk.probability * 100).toFixed(1)}%`);
    console.log(`      Mitigation:`);
    for (const mitigation of risk.mitigation.slice(0, 2)) {
      console.log(`         - ${mitigation.strategy} (${mitigation.effort} effort, ${(mitigation.effectiveness * 100).toFixed(0)}% effective)`);
    }
  }

  // Suggest optimizations
  console.log('\n💡 Suggesting optimizations...');
  const systemState = {
    activeTasks: 2,
    queuedTasks: 5,
    completedTasks: 15,
    failedTasks: 1,
    agentLoad: {
      'coder': 0.8,
      'reviewer': 0.2,
      'ops': 0.1
    },
    systemHealth: 'healthy' as const,
    resourceUsage: {
      cpu: 0.45,
      memory: 0.72,
      disk: 0.88
    },
    recentErrors: [
      { error: 'Timeout waiting for database', count: 3, lastOccurrence: new Date().toISOString() }
    ]
  };

  const optimizations = predictive.suggestOptimizations(systemState);
  console.log(`   Found ${optimizations.length} optimization(s)`);

  for (const opt of optimizations) {
    console.log(`\n   💡 Optimization: ${opt.title}`);
    console.log(`      Category: ${opt.category}`);
    console.log(`      Description: ${opt.description}`);
    console.log(`      Improvement: ${opt.improvement.value}${opt.improvement.unit} ${opt.improvement.type}`);
    console.log(`      Effort: ${opt.effort}`);
    console.log(`      Confidence: ${(opt.confidence * 100).toFixed(1)}%`);
  }
}

// ============================================================================
// DEMO: INTEGRATED GOVERNANCE
// ============================================================================

/**
 * Demo 4: Complete governance workflow
 */
async function demoIntegratedGovernance() {
  console.log('\n' + '='.repeat(60));
  console.log('🏛️  DEMO 4: INTEGRATED GOVERNANCE WORKFLOW');
  console.log('='.repeat(60));

  // Initialize governance
  console.log('\n🚀 Initializing governance system...');
  initializeGovernance();

  // Check health
  console.log('\n📊 Governance Health Report:');
  const health = getGovernanceHealth();
  console.log(`   Constitution:`);
  console.log(`      Principles: ${health.constitution.principles}`);
  console.log(`      Constraints: ${health.constitution.constraints}`);
  console.log(`      Status: ${health.constitution.healthStatus}`);
  console.log(`   Council:`);
  console.log(`      Active Proposals: ${health.council.activeProposals}`);
  console.log(`      Total Decisions: ${health.council.totalDecisions}`);
  console.log(`      Session Active: ${health.council.sessionActive ? 'Yes' : 'No'}`);
  console.log(`   Prediction:`);
  console.log(`      Active Predictions: ${health.prediction.activePredictions}`);
  console.log(`      Active Risks: ${health.prediction.activeRisks}`);
  console.log(`      Pending Optimizations: ${health.prediction.pendingOptimizations}`);
  console.log(`      Accuracy Rate: ${(health.prediction.accuracyRate * 100).toFixed(1)}%`);

  // Example workflow
  console.log('\n🔄 Example Workflow: Deploy to Production');
  console.log('   Step 1: Check constitutionality');
  const deployAction = {
    id: 'deploy_1',
    agentId: 'ops',
    actionType: 'execute' as const,
    target: 'production',
    description: 'Deploy application to production servers',
    context: {
      userApproved: false,
      affectsMultipleSystems: true
    },
    timestamp: new Date().toISOString()
  };

  const deployResult = evaluateAction(deployAction);
  console.log(`      Constitutional: ${deployResult.ruling.isConstitutional ? '✅' : '❌'}`);
  console.log(`      Requires User Approval: ${deployResult.requiresUserApproval ? 'Yes' : 'No'}`);

  if (deployResult.requiresUserApproval || deployResult.requiresCouncil) {
    console.log('   Step 2: Propose council decision');
    const proposal = await proposeCouncilDecision(
      'Deploy to Production',
      deployAction.description,
      'resource',
      {
        taskId: 'deploy_task',
        affectedAgents: ['ops', 'coder'],
        affectedSystems: ['production'],
        risks: ['Potential downtime', 'Rollback may be needed'],
        benefits: ['New features available', 'Bug fixes deployed'],
        alternatives: ['Staged rollout', 'Feature flags']
      },
      'ops'
    );
    console.log(`      Proposal: ${proposal.success ? '✅ Created' : '❌ Failed'}`);
  }

  console.log('\n✨ Governance system operating normally');
}

// ============================================================================
// MAIN DEMO RUNNER
// ============================================================================

/**
 * Run all demos
 */
export async function runGovernanceDemo(): Promise<void> {
  console.log('\n' + '🌟'.repeat(30));
  console.log('🏛️  THE MAIA CONSTITUTION - GOVERNANCE DEMO');
  console.log('🌟'.repeat(30));

  await demoConstitutionalEvaluation();
  await demoCouncilVoting();
  await demoPredictiveIntelligence();
  await demoIntegratedGovernance();

  console.log('\n' + '🌟'.repeat(30));
  console.log('✅ GOVERNANCE DEMO COMPLETE');
  console.log('🌟'.repeat(30));
  console.log('\n📖 Key Takeaways:');
  console.log('   1. Constitution enforces safety and transparency');
  console.log('   2. Council enables democratic decision-making');
  console.log('   3. Predictive Engine anticipates needs proactively');
  console.log('   4. All three systems work together for autonomous governance');
  console.log('\n');
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runGovernanceDemo().catch(console.error);
}
