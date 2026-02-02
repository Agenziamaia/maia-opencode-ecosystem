import { NextRequest, NextResponse } from 'next/server';
import { getEnhancedCouncil } from '../../../../../../.opencode/ecosystem/council/enhanced-council.js';

/**
 * Get real council decisions from ecosystem
 */
export async function GET(request: NextRequest) {
  try {
    const council = getEnhancedCouncil();

    // Get both active proposals and past decisions
    const activeProposals = council.getActiveProposals();
    const decisions = council.getDecisions();

    // Transform proposals to match the expected format
    const proposalData = activeProposals.map(proposal => ({
      decision_id: proposal.id,
      proposal: proposal.description || proposal.title,
      proposal_type: proposal.proposalType,
      proposed_by: proposal.proposedBy,
      votes: Array.from(proposal.votes?.entries() || []).map(([agentId, vote]) => ({
        agent_id: agentId,
        vote: vote.vote,
        reasoning: vote.reasoning,
        timestamp: vote.timestamp,
      })),
      status: proposal.status,
      consensus_threshold: proposal.consensusThreshold || 0.7,
      created_at: proposal.proposedAt,
      expires_at: proposal.expiresAt,
      timeout_ms: 300000,
    }));

    // Transform decisions to match the expected format
    const decisionData = decisions.map(decision => ({
      decision_id: decision.proposalId,
      proposal: decision.rationale,
      votes: [], // Votes are aggregated in the decision
      status: decision.decision,
      consensus_threshold: decision.consensusLevel,
      created_at: decision.executedAt || new Date().toISOString(),
      final_decision: decision.decision,
      timeout_ms: 0,
      vote_summary: decision.voteSummary,
      consensus: decision.consensus,
      precedent: decision.precedent,
    }));

    // Combine: show active proposals first, then recent decisions
    const allData = [
      ...proposalData,
      ...decisionData.slice(0, 10), // Last 10 decisions
    ];

    return NextResponse.json({
      success: true,
      data: allData,
      meta: {
        activeProposals: proposalData.length,
        historicalDecisions: decisionData.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch council decisions',
        error_data: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
