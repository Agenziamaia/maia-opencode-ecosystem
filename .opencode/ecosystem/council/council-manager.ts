/**
 * Council Voting System
 *
 * Purpose: Implements a voting mechanism for agent consensus on decisions.
 * Handles voting, consensus detection, and timeout management.
 */

export type VoteType = 'upvote' | 'downvote' | 'abstain';

export interface CouncilVote {
  agent_id: string;
  vote: VoteType;
  reasoning?: string;
  timestamp: string;
}

export interface CouncilDecision {
  decision_id: string;
  proposal: string;
  votes: CouncilVote[];
  status: 'pending' | 'consensus' | 'no_consensus' | 'timeout';
  consensus_threshold: number;
  created_at: string;
  timeout_at: string;
  final_decision?: string;
  timeout_ms: number;
}

export interface ConsensusResult {
  hasConsensus: boolean;
  decision?: string;
  voteSummary: {
    upvotes: number;
    downvotes: number;
    abstains: number;
    total: number;
  };
}

/**
 * Council Manager - Main class for managing voting decisions
 */
export class CouncilManager {
  private activeDecisions: Map<string, CouncilDecision>;
  private completedDecisions: Map<string, CouncilDecision>;

  constructor() {
    this.activeDecisions = new Map();
    this.completedDecisions = new Map();
  }

  /**
   * Create a new council decision
   */
  createDecision(
    proposal: string,
    councilMembers: string[],
    timeoutMs: number = 300000,
    consensusThreshold: number = 0.7
  ): CouncilDecision {
    const decisionId = `council_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const decision: CouncilDecision = {
      decision_id: decisionId,
      proposal,
      votes: [],
      status: 'pending',
      consensus_threshold: consensusThreshold,
      created_at: now.toISOString(),
      timeout_at: new Date(now.getTime() + timeoutMs).toISOString(),
      timeout_ms: timeoutMs,
    };

    this.activeDecisions.set(decisionId, decision);

    this.scheduleTimeoutCheck(decisionId, timeoutMs);

    return decision;
  }

  /**
   * Cast a vote for a decision
   */
  castVote(
    decisionId: string,
    agentId: string,
    vote: VoteType,
    reasoning?: string
  ): CouncilDecision | null {
    const decision = this.activeDecisions.get(decisionId);
    if (!decision) {
      return null;
    }

    const existingVoteIndex = decision.votes.findIndex(
      (v) => v.agent_id === agentId
    );

    const voteRecord: CouncilVote = {
      agent_id: agentId,
      vote,
      reasoning,
      timestamp: new Date().toISOString(),
    };

    if (existingVoteIndex >= 0) {
      decision.votes[existingVoteIndex] = voteRecord;
    } else {
      decision.votes.push(voteRecord);
    }

    const consensus = this.checkConsensus(decision);
    if (consensus.hasConsensus) {
      decision.status = 'consensus';
      decision.final_decision = consensus.decision;
      this.moveToCompleted(decisionId);
    } else if (this.hasAllVoted(decision)) {
      decision.status = 'no_consensus';
      this.moveToCompleted(decisionId);
    }

    return decision;
  }

  /**
   * Get a decision by ID
   */
  getDecision(decisionId: string): CouncilDecision | null {
    return this.activeDecisions.get(decisionId) || this.completedDecisions.get(decisionId) || null;
  }

  /**
   * Get all active decisions
   */
  getActiveDecisions(): CouncilDecision[] {
    return Array.from(this.activeDecisions.values());
  }

  /**
   * Get decisions for an agent
   */
  getDecisionsForAgent(agentId: string): CouncilDecision[] {
    return Array.from([...this.activeDecisions.values(), ...this.completedDecisions.values()])
      .filter((d) => d.votes.some((v) => v.agent_id === agentId));
  }

  /**
   * Cancel a decision
   */
  cancelDecision(decisionId: string): boolean {
    const decision = this.activeDecisions.get(decisionId);
    if (!decision) {
      return false;
    }

    decision.status = 'no_consensus';
    this.moveToCompleted(decisionId);
    return true;
  }

  /**
   * Check for consensus on a decision
   */
  private checkConsensus(decision: CouncilDecision): ConsensusResult {
    const upvotes = decision.votes.filter((v) => v.vote === 'upvote').length;
    const downvotes = decision.votes.filter((v) => v.vote === 'downvote').length;
    const abstains = decision.votes.filter((v) => v.vote === 'abstain').length;
    const total = decision.votes.length;

    const effectiveTotal = upvotes + downvotes;
    const upvoteRatio = effectiveTotal > 0 ? upvotes / effectiveTotal : 0;

    const hasConsensus =
      upvoteRatio >= decision.consensus_threshold &&
      total >= 2;

    return {
      hasConsensus,
      decision: hasConsensus ? 'approved' : undefined,
      voteSummary: {
        upvotes,
        downvotes,
        abstains,
        total,
      },
    };
  }

  /**
   * Check if all agents have voted
   */
  private hasAllVoted(decision: CouncilDecision): boolean {
    return decision.votes.length >= 2;
  }

  /**
   * Move decision to completed
   */
  private moveToCompleted(decisionId: string): void {
    const decision = this.activeDecisions.get(decisionId);
    if (decision) {
      this.activeDecisions.delete(decisionId);
      this.completedDecisions.set(decisionId, decision);
    }
  }

  /**
   * Schedule timeout check for a decision
   */
  private scheduleTimeoutCheck(decisionId: string, timeoutMs: number): void {
    setTimeout(() => {
      const decision = this.activeDecisions.get(decisionId);
      if (decision && decision.status === 'pending') {
        decision.status = 'timeout';
        this.moveToCompleted(decisionId);
      }
    }, timeoutMs);
  }

  /**
   * Get agent voting statistics
   */
  getAgentStats(agentId: string): {
    totalVotes: number;
    upvotes: number;
    downvotes: number;
    abstains: number;
    consensusParticipation: number;
  } {
    const allDecisions = [
      ...this.activeDecisions.values(),
      ...this.completedDecisions.values(),
    ];

    let totalVotes = 0;
    let upvotes = 0;
    let downvotes = 0;
    let abstains = 0;
    let consensusParticipated = 0;

    allDecisions.forEach((decision) => {
      const vote = decision.votes.find((v) => v.agent_id === agentId);
      if (vote) {
        totalVotes++;
        switch (vote.vote) {
          case 'upvote':
            upvotes++;
            break;
          case 'downvote':
            downvotes++;
            break;
          case 'abstain':
            abstains++;
            break;
        }

        if (decision.status === 'consensus') {
          consensusParticipated++;
        }
      }
    });

    return {
      totalVotes,
      upvotes,
      downvotes,
      abstains,
      consensusParticipation:
        totalVotes > 0 ? consensusParticipated / totalVotes : 0,
    };
  }
}

let councilManagerInstance: CouncilManager | null = null;

export function getCouncilManager(): CouncilManager {
  if (!councilManagerInstance) {
    councilManagerInstance = new CouncilManager();
  }
  return councilManagerInstance;
}
