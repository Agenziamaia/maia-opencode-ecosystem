/**
 * THE ENHANCED COUNCIL
 *
 * Multi-agent consensus system for important decisions.
 * When multiple agents disagree, the Council votes to resolve conflicts.
 *
 * Extends the basic council-manager with:
 * - Proposal management with constitution checks
 * - Weighted voting based on agent expertise
 * - Veto power for constitutional violations
 * - Delegate voting for absent agents
 * - Decision rationale and precedent tracking
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                       THE COUNCIL                                 │
 * │                    (Democratic Governance)                       │
 * │                                                                   │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
 * │  │  Proposals   │→ │   Voting     │→ │  Decisions   │          │
 * │  │              │  │              │  │              │          │
 * │  │ - Constitution│ │ - Weighted   │  │ - Rationale  │          │
 * │  │ - Expertise  │  │ - Delegates  │  │ - Precedents │          │
 * │  └──────────────┘  └──────────────┘  └──────────────┘          │
 * └─────────────────────────────────────────────────────────────────┘
 */

import { getConstitution, AgentAction, ConstitutionalRuling } from '../constitution/constitution.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Council Proposal - A proposal put forth for voting
 */
export interface CouncilProposal {
  id: string;
  title: string;
  description: string;
  proposalType: 'agent_assignment' | 'architectural' | 'refactoring' | 'constitutional' | 'resource' | 'general';
  proposedBy: string; // agent ID
  proposedAt: string;
  expiresAt: string;
  context: ProposalContext;
  constitutionCheck?: {
    checked: boolean;
    ruling?: ConstitutionalRuling;
    requiresAmendment: boolean;
  };
  votes: CouncilVote[];
  status: 'draft' | 'pending' | 'voting' | 'consensus' | 'rejected' | 'expired' | 'executed';
  consensusThreshold: number; // 0-1
  vetoPower: boolean; // Can any agent veto?
  expertiseWeights: boolean; // Use expertise-based weighting?
  estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Proposal Context - Additional context for the proposal
 */
export interface ProposalContext {
  taskId?: string;
  workflowId?: string;
  affectedAgents?: string[];
  affectedFiles?: string[];
  affectedSystems?: string[];
  risks: string[];
  benefits: string[];
  alternatives: string[];
  references?: string[]; // Links to relevant docs or past decisions
}

/**
 * Council Vote - Enhanced vote with additional metadata
 */
export interface CouncilVote {
  id: string;
  proposalId: string;
  agentId: string;
  vote: 'yes' | 'no' | 'abstain' | 'veto';
  reasoning: string;
  confidence: number; // 0-1, how confident is the agent in their vote
  expertise: number; // 0-1, how relevant is this agent's expertise
  delegatedFrom?: string; // If voting on behalf of another agent
  delegatedAt?: string;
  timestamp: string;
}

/**
 * Council Decision - Final decision from a proposal
 */
export interface CouncilDecision {
  proposalId: string;
  decision: 'approved' | 'rejected' | 'aborted';
  rationale: string;
  voteSummary: {
    yes: number;
    no: number;
    abstain: number;
    veto: number;
    total: number;
    weighted: {
      yes: number;
      no: number;
      abstain: number;
      total: number;
    };
  };
  consensus: boolean;
  consensusLevel: number; // 0-1
  constitutional: boolean;
  executedAt?: string;
  executionResult?: string;
  precedent: boolean; // Should this be used as precedent for future decisions?
}

/**
 * Precedent - Past decisions that guide future voting
 */
export interface Precedent {
  id: string;
  proposalTitle: string;
  decision: CouncilDecision;
  similarityKeywords: string[];
  createdAt: string;
  referenceCount: number;
}

/**
 * Expertise Matrix - Agent expertise levels by domain
 */
export interface ExpertiseMatrix {
  [agentId: string]: {
    [domain: string]: number; // 0-1 expertise level
  };
}

/**
 * Council Session - An active council meeting
 */
export interface CouncilSession {
  id: string;
  startedAt: string;
  activeProposals: string[];
  participants: string[];
  agenda: string[];
  status: 'active' | 'adjourned' | 'cancelled';
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default expertise matrix for agents
 * This defines how much weight each agent's vote carries in different domains
 */
export const DEFAULT_EXPERTISE_MATRIX: ExpertiseMatrix = {
  'maia': {
    'planning': 0.95,
    'architecture': 0.90,
    'coordination': 0.95,
    'coding': 0.75,
    'testing': 0.70,
    'infrastructure': 0.70,
    'meta': 0.95
  },
  'coder': {
    'planning': 0.60,
    'architecture': 0.80,
    'coordination': 0.50,
    'coding': 0.95,
    'testing': 0.80,
    'infrastructure': 0.60,
    'meta': 0.50
  },
  'reviewer': {
    'planning': 0.50,
    'architecture': 0.70,
    'coordination': 0.60,
    'coding': 0.85,
    'testing': 0.95,
    'infrastructure': 0.50,
    'meta': 0.60
  },
  'ops': {
    'planning': 0.60,
    'architecture': 0.70,
    'coordination': 0.70,
    'coding': 0.70,
    'testing': 0.60,
    'infrastructure': 0.95,
    'meta': 0.50
  },
  'sisyphus': {
    'planning': 0.95,
    'architecture': 0.85,
    'coordination': 0.80,
    'coding': 0.60,
    'testing': 0.50,
    'infrastructure': 0.70,
    'meta': 0.90
  },
  'researcher': {
    'planning': 0.70,
    'architecture': 0.60,
    'coordination': 0.50,
    'coding': 0.50,
    'testing': 0.60,
    'infrastructure': 0.40,
    'meta': 0.95,
    'research': 0.95
  },
  'workflow': {
    'planning': 0.80,
    'architecture': 0.60,
    'coordination': 0.90,
    'coding': 0.70,
    'testing': 0.50,
    'infrastructure': 0.80,
    'automation': 0.95
  }
};

/**
 * Domains for expertise weighting
 */
export const DOMAINS = [
  'planning',
  'architecture',
  'coordination',
  'coding',
  'testing',
  'infrastructure',
  'meta',
  'research',
  'automation'
];

// ============================================================================
// MAIN ENHANCED COUNCIL CLASS
// ============================================================================

export class EnhancedCouncil {
  private proposals: Map<string, CouncilProposal>;
  private decisions: Map<string, CouncilDecision>;
  private precedents: Map<string, Precedent>;
  private expertiseMatrix: ExpertiseMatrix;
  private sessions: Map<string, CouncilSession>;
  private activeSession: CouncilSession | null;

  constructor() {
    this.proposals = new Map();
    this.decisions = new Map();
    this.precedents = new Map();
    this.expertiseMatrix = { ...DEFAULT_EXPERTISE_MATRIX };
    this.sessions = new Map();
    this.activeSession = null;
  }

  // ==========================================================================
  // PROPOSAL MANAGEMENT
  // ==========================================================================

  /**
   * Create a new council proposal
   */
  async propose(proposal: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'>): Promise<CouncilProposal> {
    const proposalId = `council_proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check constitution if applicable
    let constitutionCheck: CouncilProposal['constitutionCheck'];
    if (proposal.proposalType === 'constitutional' ||
        proposal.estimatedImpact === 'critical' ||
        proposal.estimatedImpact === 'high') {
      const constitution = getConstitution();
      const mockAction: AgentAction = {
        id: proposalId,
        agentId: proposal.proposedBy,
        actionType: 'execute',
        target: proposal.context.affectedSystems?.join(',') || 'system',
        description: proposal.description,
        context: proposal.context as any,
        timestamp: new Date().toISOString()
      };
      const ruling = constitution.evaluate(mockAction);
      constitutionCheck = {
        checked: true,
        ruling,
        requiresAmendment: !ruling.isConstitutional
      };
    }

    const newProposal: CouncilProposal = {
      ...proposal,
      id: proposalId,
      proposedAt: new Date().toISOString(),
      votes: [],
      status: 'pending',
      constitutionCheck
    };

    this.proposals.set(proposalId, newProposal);

    // Add to active session
    if (this.activeSession) {
      this.activeSession.activeProposals.push(proposalId);
    }

    return newProposal;
  }

  /**
   * Get a proposal by ID
   */
  getProposal(proposalId: string): CouncilProposal | undefined {
    return this.proposals.get(proposalId);
  }

  /**
   * Get all active proposals
   */
  getActiveProposals(): CouncilProposal[] {
    return Array.from(this.proposals.values()).filter(
      p => p.status === 'pending' || p.status === 'voting'
    );
  }

  /**
   * Start voting on a proposal
   */
  startVoting(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'pending') {
      return false;
    }

    // Check constitution if required
    if (proposal.constitutionCheck?.requiresAmendment) {
      console.warn(`[Council] Proposal ${proposalId} requires constitutional amendment before voting`);
      return false;
    }

    proposal.status = 'voting';

    // Schedule expiry
    const expiresAt = new Date(proposal.expiresAt);
    const now = new Date();
    const ttl = expiresAt.getTime() - now.getTime();

    if (ttl > 0) {
      setTimeout(() => {
        this.checkProposalExpiry(proposalId);
      }, ttl);
    }

    return true;
  }

  /**
   * Cast a vote on a proposal
   */
  vote(
    proposalId: string,
    agentId: string,
    vote: CouncilVote['vote'],
    reasoning: string,
    confidence = 0.8,
    delegatedFrom?: string
  ): CouncilVote | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'voting') {
      return null;
    }

    // Check if agent already voted
    const existingVoteIndex = proposal.votes.findIndex(
      v => v.agentId === agentId && !v.delegatedFrom
    );

    const voteId = `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate expertise relevance
    const expertise = this.calculateExpertise(agentId, proposal);

    const councilVote: CouncilVote = {
      id: voteId,
      proposalId,
      agentId,
      vote,
      reasoning,
      confidence,
      expertise,
      delegatedFrom,
      delegatedAt: delegatedFrom ? new Date().toISOString() : undefined,
      timestamp: new Date().toISOString()
    };

    if (existingVoteIndex >= 0) {
      proposal.votes[existingVoteIndex] = councilVote;
    } else {
      proposal.votes.push(councilVote);
    }

    // Check for veto
    if (vote === 'veto' && proposal.vetoPower) {
      proposal.status = 'rejected';
      this.createDecision(proposalId);
      return councilVote;
    }

    // Check for consensus
    this.checkConsensus(proposalId);

    return councilVote;
  }

  /**
   * Check if a proposal has reached consensus
   */
  private checkConsensus(proposalId: string): void {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'voting') {
      return;
    }

    const result = this.tallyVotes(proposal);

    // Check if we have enough votes
    if (result.voteSummary.total < 2) {
      return; // Need at least 2 votes
    }

    // Calculate consensus level
    const consensusLevel = this.calculateConsensusLevel(proposal, result);

    // Check if consensus threshold is met
    if (consensusLevel >= proposal.consensusThreshold) {
      proposal.status = 'consensus';
      this.createDecision(proposalId);
    }
  }

  /**
   * Tally votes for a proposal
   */
  tallyVotes(proposal: CouncilProposal): {
    voteSummary: CouncilDecision['voteSummary'];
    consensusLevel: number;
  } {
    const yesVotes = proposal.votes.filter(v => v.vote === 'yes');
    const noVotes = proposal.votes.filter(v => v.vote === 'no');
    const abstainVotes = proposal.votes.filter(v => v.vote === 'abstain');
    const vetoVotes = proposal.votes.filter(v => v.vote === 'veto');

    let weightedYes = 0;
    let weightedNo = 0;
    let weightedAbstain = 0;

    if (proposal.expertiseWeights) {
      for (const vote of yesVotes) {
        weightedYes += vote.expertise * vote.confidence;
      }
      for (const vote of noVotes) {
        weightedNo += vote.expertise * vote.confidence;
      }
      for (const vote of abstainVotes) {
        weightedAbstain += vote.expertise * vote.confidence;
      }
    } else {
      weightedYes = yesVotes.length;
      weightedNo = noVotes.length;
      weightedAbstain = abstainVotes.length;
    }

    const voteSummary: CouncilDecision['voteSummary'] = {
      yes: yesVotes.length,
      no: noVotes.length,
      abstain: abstainVotes.length,
      veto: vetoVotes.length,
      total: proposal.votes.length,
      weighted: {
        yes: weightedYes,
        no: weightedNo,
        abstain: weightedAbstain,
        total: weightedYes + weightedNo + weightedAbstain
      }
    };

    const consensusLevel = this.calculateConsensusLevel(proposal, { voteSummary });

    return { voteSummary, consensusLevel };
  }

  /**
   * Calculate consensus level (0-1)
   */
  private calculateConsensusLevel(
    proposal: CouncilProposal,
    tally: { voteSummary: CouncilDecision['voteSummary'] }
  ): number {
    const summary = tally.voteSummary;

    // If using weighted votes
    if (proposal.expertiseWeights) {
      const totalWeighted = summary.weighted.total;
      if (totalWeighted === 0) return 0;

      const yesRatio = summary.weighted.yes / totalWeighted;
      return yesRatio;
    }

    // Simple majority
    if (summary.total === 0) return 0;
    const yesRatio = summary.yes / summary.total;
    return yesRatio;
  }

  /**
   * Create a decision from a proposal
   */
  private createDecision(proposalId: string): CouncilDecision | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return null;

    const tally = this.tallyVotes(proposal);

    let decision: CouncilDecision['decision'];
    let rationale: string;

    if (proposal.status === 'rejected' || tally.voteSummary.veto > 0) {
      decision = 'rejected';
      rationale = tally.voteSummary.veto > 0
        ? `Proposal vetoed by ${tally.voteSummary.veto} agent(s)`
        : 'Proposal did not achieve consensus';
    } else if (proposal.status === 'consensus') {
      decision = 'approved';
      rationale = `Consensus achieved with ${tally.consensusLevel.toFixed(2)} level of agreement`;
    } else if (proposal.status === 'expired') {
      decision = 'aborted';
      rationale = 'Proposal expired before reaching consensus';
    } else {
      decision = 'aborted';
      rationale = 'Proposal aborted';
    }

    const councilDecision: CouncilDecision = {
      proposalId,
      decision,
      rationale,
      voteSummary: tally.voteSummary,
      consensus: proposal.status === 'consensus',
      consensusLevel: tally.consensusLevel,
      constitutional: !proposal.constitutionCheck?.requiresAmendment,
      precedent: proposal.estimatedImpact === 'high' || proposal.estimatedImpact === 'critical'
    };

    this.decisions.set(proposalId, councilDecision);

    // Create precedent if marked
    if (councilDecision.precedent) {
      this.createPrecedent(proposal, councilDecision);
    }

    return councilDecision;
  }

  /**
   * Execute a council decision
   */
  async executeDecision(proposalId: string): Promise<{
    success: boolean;
    result?: string;
    error?: string;
  }> {
    const proposal = this.proposals.get(proposalId);
    const decision = this.decisions.get(proposalId);

    if (!proposal || !decision) {
      return { success: false, error: 'Proposal or decision not found' };
    }

    if (decision.decision !== 'approved') {
      return { success: false, error: 'Decision was not approved' };
    }

    // Execute based on proposal type
    let result: string;

    try {
      switch (proposal.proposalType) {
        case 'agent_assignment':
          result = `Agent assigned: ${proposal.context.affectedAgents?.[0] || 'unknown'}`;
          break;
        case 'architectural':
          result = 'Architectural change approved and documented';
          break;
        case 'refactoring':
          result = 'Refactoring approved - proceeding with changes';
          break;
        case 'constitutional':
          result = 'Constitutional amendment proposed to user for approval';
          break;
        default:
          result = 'Decision executed';
      }

      proposal.status = 'executed';
      decision.executedAt = new Date().toISOString();
      decision.executionResult = result;

      return { success: true, result };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // ==========================================================================
  // EXPERTISE CALCULATION
  // ==========================================================================

  /**
   * Calculate expertise relevance for an agent on a proposal
   */
  private calculateExpertise(agentId: string, proposal: CouncilProposal): number {
    const agentExpertise = this.expertiseMatrix[agentId];
    if (!agentExpertise) return 0.5; // Default expertise

    // Determine domain from proposal type
    let domain: string;
    switch (proposal.proposalType) {
      case 'agent_assignment':
        domain = 'coordination';
        break;
      case 'architectural':
        domain = 'architecture';
        break;
      case 'refactoring':
        domain = 'coding';
        break;
      case 'constitutional':
        domain = 'meta';
        break;
      case 'resource':
        domain = 'infrastructure';
        break;
      default:
        domain = 'planning';
    }

    return agentExpertise[domain] || 0.5;
  }

  /**
   * Update expertise matrix
   */
  updateExpertise(agentId: string, domain: string, level: number): void {
    if (!this.expertiseMatrix[agentId]) {
      this.expertiseMatrix[agentId] = {};
    }
    this.expertiseMatrix[agentId][domain] = Math.max(0, Math.min(1, level));
  }

  // ==========================================================================
  // PRECEDENT MANAGEMENT
  // ==========================================================================

  /**
   * Create a precedent from a decision
   */
  private createPrecedent(proposal: CouncilProposal, decision: CouncilDecision): void {
    const precedentId = `precedent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Extract keywords from proposal description
    const keywords = this.extractKeywords(proposal.title + ' ' + proposal.description);

    const precedent: Precedent = {
      id: precedentId,
      proposalTitle: proposal.title,
      decision,
      similarityKeywords: keywords,
      createdAt: new Date().toISOString(),
      referenceCount: 0
    };

    this.precedents.set(precedentId, precedent);
  }

  /**
   * Find relevant precedents for a proposal
   */
  findPrecedents(proposal: CouncilProposal): Precedent[] {
    const proposalKeywords = this.extractKeywords(
      proposal.title + ' ' + proposal.description
    );

    const relevant: Array<{ precedent: Precedent; score: number }> = [];

    for (const precedent of this.precedents.values()) {
      const intersection = precedent.similarityKeywords.filter(k =>
        proposalKeywords.includes(k)
      );
      const score = intersection.length / Math.max(
        precedent.similarityKeywords.length,
        proposalKeywords.length
      );

      if (score > 0.2) {
        relevant.push({ precedent, score });
        precedent.referenceCount++;
      }
    }

    return relevant
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.precedent);
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3);

    // Remove common words
    const stopWords = ['this', 'that', 'with', 'from', 'have', 'will', 'should', 'could'];
    return words.filter(w => !stopWords.includes(w));
  }

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  /**
   * Start a new council session
   */
  startSession(agenda: string[] = [], participants: string[] = []): CouncilSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: CouncilSession = {
      id: sessionId,
      startedAt: new Date().toISOString(),
      activeProposals: [],
      participants,
      agenda,
      status: 'active'
    };

    this.sessions.set(sessionId, session);
    this.activeSession = session;

    return session;
  }

  /**
   * Adjourn the active session
   */
  adjournSession(): boolean {
    if (!this.activeSession) return false;

    this.activeSession.status = 'adjourned';
    this.activeSession = null;

    return true;
  }

  /**
   * Get active session
   */
  getActiveSession(): CouncilSession | null {
    return this.activeSession;
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Check proposal expiry
   */
  private checkProposalExpiry(proposalId: string): void {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'voting') {
      return;
    }

    const now = new Date();
    const expiresAt = new Date(proposal.expiresAt);

    if (now > expiresAt) {
      proposal.status = 'expired';
      this.createDecision(proposalId);
    }
  }

  /**
   * Get all decisions
   */
  getDecisions(): CouncilDecision[] {
    return Array.from(this.decisions.values());
  }

  /**
   * Get decision for a proposal
   */
  getDecision(proposalId: string): CouncilDecision | undefined {
    return this.decisions.get(proposalId);
  }

  /**
   * Get voting statistics for an agent
   */
  getAgentStats(agentId: string): {
    totalVotes: number;
    proposalTypes: Record<string, number>;
    averageConfidence: number;
    vetoCount: number;
    consensusParticipation: number;
  } {
    let totalVotes = 0;
    let totalConfidence = 0;
    let vetoCount = 0;
    let consensusParticipated = 0;
    const proposalTypes: Record<string, number> = {};

    for (const proposal of this.proposals.values()) {
      const vote = proposal.votes.find(v => v.agentId === agentId);
      if (vote) {
        totalVotes++;
        totalConfidence += vote.confidence;
        if (vote.vote === 'veto') vetoCount++;
        if (proposal.status === 'consensus') consensusParticipated++;

        proposalTypes[proposal.proposalType] =
          (proposalTypes[proposal.proposalType] || 0) + 1;
      }
    }

    return {
      totalVotes,
      proposalTypes,
      averageConfidence: totalVotes > 0 ? totalConfidence / totalVotes : 0,
      vetoCount,
      consensusParticipation: totalVotes > 0 ? consensusParticipated / totalVotes : 0
    };
  }

  // ==========================================================================
  // ENFORCEMENT: BLOCKING DECISION WAITING
  // ==========================================================================

  /**
   * Wait for Council decision - BLOCKING ENFORCEMENT
   *
   * This is the key method that connects Council to execution flow.
   * For complex decisions, execution MUST wait for Council approval.
   *
   * @param proposalData - The proposal to submit for voting
   * @param timeoutMs - How long to wait for decision (default: 60s)
   * @param skipCouncil - Emergency override to skip voting
   * @returns Promise resolving to the decision
   */
  async waitForCouncilDecision(
    proposalData: Omit<CouncilProposal, 'id' | 'proposedAt' | 'votes' | 'status'>,
    timeoutMs: number = 60000,
    skipCouncil: boolean = false
  ): Promise<{
    proposal: CouncilProposal;
    decision: CouncilDecision | null;
    approved: boolean;
    skipped: boolean;
    timeout: boolean;
    reason: string;
  }> {
    // Emergency override
    if (skipCouncil) {
      console.warn('[Council] ⚠️ SKIPPED: Council consultation bypassed via emergency override');
      const emergencyProposal: CouncilProposal = {
        ...proposalData,
        id: `emergency_${Date.now()}`,
        proposedAt: new Date().toISOString(),
        votes: [],
        status: 'executed',
      };
      return {
        proposal: emergencyProposal,
        decision: null,
        approved: true,
        skipped: true,
        timeout: false,
        reason: 'Emergency override activated - Council bypassed',
      };
    }

    // Step 1: Create proposal
    console.log(`[Council] Creating proposal: ${proposalData.title}`);
    const proposal = await this.propose(proposalData);

    // Step 2: Start voting
    if (!this.startVoting(proposal.id)) {
      return {
        proposal,
        decision: null,
        approved: false,
        skipped: false,
        timeout: false,
        reason: 'Failed to start voting - check constitution compliance',
      };
    }

    console.log(`[Council] 🗳️ Voting started for proposal ${proposal.id} - awaiting decision...`);

    // Step 3: Wait for decision with timeout
    const startTime = Date.now();
    let checkInterval: NodeJS.Timeout | null = null;

    return new Promise((resolve) => {
      // Check immediately in case decision is already made
      const checkDecision = () => {
        const currentProposal = this.proposals.get(proposal.id);
        if (!currentProposal) {
          return false; // Should not happen
        }

        // Check if we have a decision
        const decision = this.decisions.get(proposal.id);
        if (decision) {
          console.log(`[Council] ✅ Decision reached: ${decision.decision.toUpperCase()}`);
          console.log(`[Council] Rationale: ${decision.rationale}`);
          console.log(`[Council] Vote summary: ${decision.voteSummary.yes} yes, ${decision.voteSummary.no} no, ${decision.voteSummary.abstain} abstain`);

          clearTimeout(timeoutHandle);
          if (checkInterval) clearInterval(checkInterval);

          resolve({
            proposal: currentProposal,
            decision,
            approved: decision.decision === 'approved',
            skipped: false,
            timeout: false,
            reason: decision.rationale,
          });
          return true;
        }

        // Check if proposal is in a final state but no decision yet
        if (currentProposal.status === 'rejected' || currentProposal.status === 'expired') {
          // Force create decision
          const forcedDecision = this.createDecision(proposal.id);
          if (forcedDecision) {
            clearTimeout(timeoutHandle);
            if (checkInterval) clearInterval(checkInterval);

            resolve({
              proposal: currentProposal,
              decision: forcedDecision,
              approved: forcedDecision.decision === 'approved',
              skipped: false,
              timeout: false,
              reason: forcedDecision.rationale,
            });
            return true;
          }
        }

        return false;
      };

      // Check every 500ms
      checkInterval = setInterval(checkDecision, 500);

      // Timeout handler
      const timeoutHandle = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);

        const currentProposal = this.proposals.get(proposal.id);
        console.warn(`[Council] ⏱️ TIMEOUT: No decision reached within ${timeoutMs}ms`);

        // Create a timeout decision
        const timeoutDecision: CouncilDecision = {
          proposalId: proposal.id,
          decision: 'aborted',
          rationale: `Voting timeout after ${timeoutMs}ms - insufficient votes cast`,
          voteSummary: {
            yes: 0,
            no: 0,
            abstain: 0,
            veto: 0,
            total: 0,
            weighted: { yes: 0, no: 0, abstain: 0, total: 0 }
          },
          consensus: false,
          consensusLevel: 0,
          constitutional: true,
        };

        resolve({
          proposal: currentProposal || proposal,
          decision: timeoutDecision,
          approved: false,
          skipped: false,
          timeout: true,
          reason: `Voting timeout - insufficient participation within ${timeoutMs}ms`,
        });
      }, timeoutMs);

      // Initial check
      checkDecision();
    });
  }

  /**
   * Report execution outcome back to Council
   * This closes the feedback loop - Council learns from its decisions
   */
  reportExecutionOutcome(
    proposalId: string,
    outcome: 'success' | 'failure' | 'partial',
    result: string,
    metadata?: Record<string, any>
  ): void {
    const proposal = this.proposals.get(proposalId);
    const decision = this.decisions.get(proposalId);

    if (!proposal || !decision) {
      console.warn(`[Council] Cannot report outcome - proposal ${proposalId} not found`);
      return;
    }

    // Update decision with execution result
    decision.executionResult = result;

    console.log(`[Council] 📊 Execution outcome reported: ${outcome.toUpperCase()}`);
    console.log(`[Council] Proposal: ${proposal.title}`);
    console.log(`[Council] Result: ${result}`);

    // Update expertise based on outcome
    // If the decision led to success, reinforce the expertise of those who voted 'yes'
    // If it led to failure, reduce expertise of those who voted 'yes'
    if (outcome === 'success' && decision.decision === 'approved') {
      for (const vote of proposal.votes) {
        if (vote.vote === 'yes') {
          const domain = this.getDomainForProposal(proposal);
          const currentExpertise = this.expertiseMatrix[vote.agentId]?.[domain] || 0.5;
          this.updateExpertise(vote.agentId, domain, Math.min(1, currentExpertise + 0.05));
        }
      }
    } else if (outcome === 'failure' && decision.decision === 'approved') {
      for (const vote of proposal.votes) {
        if (vote.vote === 'yes') {
          const domain = this.getDomainForProposal(proposal);
          const currentExpertise = this.expertiseMatrix[vote.agentId]?.[domain] || 0.5;
          this.updateExpertise(vote.agentId, domain, Math.max(0, currentExpertise - 0.05));
        }
      }
    }

    // Store metadata for learning
    if (metadata && !proposal.context.references) {
      proposal.context.references = [];
    }
    if (metadata) {
      proposal.context.references?.push(JSON.stringify(metadata));
    }
  }

  /**
   * Get domain for a proposal (for expertise updates)
   */
  private getDomainForProposal(proposal: CouncilProposal): string {
    switch (proposal.proposalType) {
      case 'agent_assignment':
        return 'coordination';
      case 'architectural':
        return 'architecture';
      case 'refactoring':
        return 'coding';
      case 'constitutional':
        return 'meta';
      case 'resource':
        return 'infrastructure';
      default:
        return 'planning';
    }
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  /**
   * Serialize council state
   */
  serialize(): string {
    return JSON.stringify({
      proposals: Array.from(this.proposals.entries()),
      decisions: Array.from(this.decisions.entries()),
      precedents: Array.from(this.precedents.entries()),
      expertiseMatrix: this.expertiseMatrix
    });
  }

  /**
   * Deserialize council state
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.proposals = new Map(parsed.proposals || []);
      this.decisions = new Map(parsed.decisions || []);
      this.precedents = new Map(parsed.precedents || []);
      this.expertiseMatrix = parsed.expertiseMatrix || { ...DEFAULT_EXPERTISE_MATRIX };
    } catch (error) {
      console.error('Failed to deserialize council:', error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let councilInstance: EnhancedCouncil | null = null;

export function getEnhancedCouncil(): EnhancedCouncil {
  if (!councilInstance) {
    councilInstance = new EnhancedCouncil();
  }
  return councilInstance;
}

export function resetEnhancedCouncil(): void {
  councilInstance = null;
}
