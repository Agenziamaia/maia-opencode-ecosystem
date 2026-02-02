/**
 * THE MAIA CONSTITUTION - Main Exports
 *
 * This module provides the constitutional governance system for MAIA:
 * - Constitution: Supreme law with principles and guardrails
 * - Enhanced Council: Democratic decision-making
 * - Predictive Engine: Proactive optimization
 *
 * The Constitution is the orchestrator's perspective on governance -
 * enabling safe autonomous operation while maintaining democratic
 * conflict resolution and proactive intelligence.
 */

// Import for internal use
import { getConstitution as _getConstitution } from './constitution.js';
import { getEnhancedCouncil as _getEnhancedCouncil } from '../council/enhanced-council.js';
import { getPredictiveEngine as _getPredictiveEngine } from '../prediction/predictive-engine.js';

// ============================================================================
// CORE CONSTITUTION
// ============================================================================

export * from './constitution.js';

// Re-export commonly used types and functions
export {
  getConstitution,
  Constitution,
  type AgentAction,
  type ConstitutionalPrinciple,
  type ConstitutionalConstraint,
  type ConstitutionalRuling,
  type AlternativeAction,
  type Amendment
} from './constitution.js';

// ============================================================================
// ENHANCED COUNCIL
// ============================================================================

export * from '../council/enhanced-council.js';

// Re-export commonly used types and functions
export {
  getEnhancedCouncil,
  EnhancedCouncil,
  type CouncilProposal,
  type CouncilVote,
  type CouncilDecision,
  type Precedent,
  type ExpertiseMatrix,
  type CouncilSession
} from '../council/enhanced-council.js';

// ============================================================================
// PREDICTIVE ENGINE
// ============================================================================

export * from '../prediction/predictive-engine.js';

// Re-export commonly used types and functions
export {
  getPredictiveEngine,
  PredictiveEngine,
  type UserContext,
  type Prediction,
  type Risk,
  type Optimization,
  type SystemState
} from '../prediction/predictive-engine.js';

// ============================================================================
// INTEGRATION UTILITIES
// ============================================================================

/**
 * Initialize the complete governance system
 */
export function initializeGovernance(): void {
  console.log('🏛️  MAIA Constitution initialized');
  console.log('⚖️  Enhanced Council ready');
  console.log('🔮 Predictive Engine active');
}

/**
 * Get governance health report
 */
export function getGovernanceHealth(): {
  constitution: {
    principles: number;
    constraints: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  };
  council: {
    activeProposals: number;
    totalDecisions: number;
    sessionActive: boolean;
  };
  prediction: {
    activePredictions: number;
    activeRisks: number;
    pendingOptimizations: number;
    accuracyRate: number;
  };
} {
  const constitution = _getConstitution();
  const council = _getEnhancedCouncil();
  const prediction = _getPredictiveEngine();

  const constitutionHealth = constitution.getHealthReport();
  const councilStats = {
    activeProposals: council.getActiveProposals().length,
    totalDecisions: council.getDecisions().length,
    sessionActive: council.getActiveSession() !== null
  };
  const predictionStats = prediction.getAccuracyStats();
  const activePredictions = prediction.getActivePredictions();
  const activeRisks = prediction.getActiveRisks();
  const pendingOptimizations = prediction.getPendingOptimizations();

  // Determine overall health
  let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (constitutionHealth.constitutionalRate < 0.7) {
    healthStatus = 'unhealthy';
  } else if (constitutionHealth.constitutionalRate < 0.9) {
    healthStatus = 'degraded';
  }

  return {
    constitution: {
      principles: constitutionHealth.totalPrinciples,
      constraints: constitutionHealth.activeConstraints,
      healthStatus
    },
    council: councilStats,
    prediction: {
      activePredictions: activePredictions.length,
      activeRisks: activeRisks.length,
      pendingOptimizations: pendingOptimizations.length,
      accuracyRate: predictionStats.accuracyRate
    }
  };
}

/**
 * Evaluate an action through the constitution
 * This is the main entry point for constitutional checks
 */
export function evaluateAction(action: AgentAction): {
  ruling: ConstitutionalRuling;
  alternatives: AlternativeAction[];
  canProceed: boolean;
  requiresCouncil: boolean;
  requiresUserApproval: boolean;
} {
  const constitution = _getConstitution();
  const council = _getEnhancedCouncil();

  // Get constitutional ruling
  const ruling = constitution.evaluate(action);

  // Get alternatives if unconstitutional
  const alternatives = ruling.isConstitutional
    ? []
    : constitution.suggestAlternatives(action);

  // Determine if council or user approval is needed
  const requiresCouncil = !ruling.isConstitutional &&
    ruling.violatedPrinciples.some(v => v.severity === 'major');
  const requiresUserApproval = !ruling.isConstitutional &&
    ruling.violatedPrinciples.some(v => v.severity === 'critical');

  return {
    ruling,
    alternatives,
    canProceed: ruling.isConstitutional,
    requiresCouncil,
    requiresUserApproval
  };
}

/**
 * Get proactive suggestions for current context
 */
export function getProactiveSuggestions(context: UserContext): {
  predictions: Prediction[];
  risks: Risk[];
  optimizations: Optimization[];
  summary: string;
} {
  const prediction = _getPredictiveEngine();

  // Get predictions
  const predictions = prediction.predictNext(context);

  // Get risks (would need workflow info in production)
  const risks = prediction.getActiveRisks();

  // Get optimizations (would need system state in production)
  const optimizations = prediction.getPendingOptimizations();

  // Generate summary
  const summaryParts: string[] = [];

  if (predictions.length > 0) {
    summaryParts.push(`${predictions.length} prediction(s) available`);
  }
  if (risks.length > 0) {
    const criticalRisks = risks.filter(r => r.severity === 'critical').length;
    summaryParts.push(`${risks.length} risk(s) detected${criticalRisks > 0 ? ` (${criticalRisks} critical)` : ''}`);
  }
  if (optimizations.length > 0) {
    summaryParts.push(`${optimizations.length} optimization(s) suggested`);
  }

  const summary = summaryParts.length > 0
    ? summaryParts.join(', ')
    : 'No proactive suggestions at this time';

  return {
    predictions,
    risks,
    optimizations,
    summary
  };
}

/**
 * Propose a council decision
 */
export async function proposeCouncilDecision(
  title: string,
  description: string,
  proposalType: CouncilProposal['proposalType'],
  context: CouncilProposal['context'],
  proposedBy: string
): Promise<{
  success: boolean;
  proposal?: CouncilProposal;
  error?: string;
}> {
  const council = _getEnhancedCouncil();

  try {
    const proposal = await council.propose({
      title,
      description,
      proposalType,
      proposedBy,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      context,
      consensusThreshold: 0.7,
      vetoPower: true,
      expertiseWeights: true,
      estimatedImpact: proposalType === 'constitutional' ? 'critical' : 'high'
    });

    return { success: true, proposal };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Vote on a council proposal
 */
export function voteOnProposal(
  proposalId: string,
  agentId: string,
  vote: CouncilVote['vote'],
  reasoning: string
): {
  success: boolean;
  vote?: CouncilVote;
  decision?: CouncilDecision;
  error?: string;
} {
  const council = _getEnhancedCouncil();

  const councilVote = council.vote(proposalId, agentId, vote, reasoning);

  if (!councilVote) {
    return {
      success: false,
      error: 'Failed to cast vote - proposal may not exist or not in voting phase'
    };
  }

  // Check if decision was reached
  const proposal = council.getProposal(proposalId);
  const decision = proposal?.status === 'consensus' || proposal?.status === 'rejected'
    ? council.getDecision(proposalId)
    : undefined;

  return {
    success: true,
    vote: councilVote,
    decision
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * The 8 Core Constitutional Principles
 */
export const CORE_PRINCIPLES = [
  'No Destructive Actions Without Consent',
  'Transparency and Explainability',
  'Efficiency Over Perfection',
  'Consult Before Major Changes',
  'Recovery First',
  'Autonomy with Guardrails',
  'Council for Disagreements',
  'Learn and Adapt'
] as const;

/**
 * Council proposal types
 */
export const PROPOSAL_TYPES = [
  'agent_assignment',
  'architectural',
  'refactoring',
  'constitutional',
  'resource',
  'general'
] as const;

/**
 * Prediction types
 */
export const PREDICTION_TYPES = [
  'next_action',
  'resource_need',
  'agent_suggestion',
  'risk_mitigation',
  'optimization'
] as const;

/**
 * Risk categories
 */
export const RISK_CATEGORIES = [
  'timeout',
  'conflict',
  'resource',
  'quality',
  'security',
  'dependency'
] as const;

/**
 * Optimization categories
 */
export const OPTIMIZATION_CATEGORIES = [
  'speed',
  'quality',
  'resource',
  'workflow',
  'collaboration'
] as const;
