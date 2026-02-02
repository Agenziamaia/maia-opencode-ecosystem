/**
 * THE MAIA CONSTITUTION
 *
 * The foundational principles that govern all agent behavior in the ecosystem.
 * No agent may violate these principles, regardless of optimization or efficiency.
 *
 * This is the SUPREME LAW of the MAIA ecosystem - all actions must be
 * constitutional before execution.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    THE MAIA CONSTITUTION                          │
 * │                      (Supreme Law)                                │
 * │                                                                   │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
 * │  │  Principles  │  │ Constraints  │  │   Rulings    │          │
 * │  │  (Inviolable)│  │ (Per-Agent)  │  │ (Enforcement)│          │
 * │  └──────────────┘  └──────────────┘  └──────────────┘          │
 * └─────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Agent Action - Any action taken by an agent
 */
export interface AgentAction {
  id: string;
  agentId: string;
  actionType: 'read' | 'write' | 'delete' | 'execute' | 'dispatch' | 'modify' | 'create';
  target: string; // file, directory, process, etc.
  description: string;
  context: Record<string, unknown>;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Constitutional Principle - Core inviolable values
 */
export interface ConstitutionalPrinciple {
  id: string;
  name: string;
  category: 'safety' | 'transparency' | 'efficiency' | 'collaboration' | 'recovery';
  priority: number; // 1-10, 1 being highest (can never be violated)
  description: string;
  rationale: string;
  enforcement: 'strict' | 'guideline' | 'advisory';
  examples: {
    compliant: string[];
    violating: string[];
  };
}

/**
 * Constitutional Constraint - Agent-specific limitations
 */
export interface ConstitutionalConstraint {
  id: string;
  agentId: string;
  constraintType: 'capability' | 'scope' | 'resource' | 'time' | 'permission';
  limitation: string;
  reason: string;
  exceptions: string[];
  enabled: boolean;
}

/**
 * Constitutional Ruling - Judgment on an action's constitutionality
 */
export interface ConstitutionalRuling {
  actionId: string;
  isConstitutional: boolean;
  violatedPrinciples: Array<{
    principle: ConstitutionalPrinciple;
    severity: 'critical' | 'major' | 'minor';
    explanation: string;
  }>;
  warnings: string[];
  suggestions: string[];
  confidence: number; // 0-1
  reviewedAt: string;
  reviewedBy: 'constitution' | 'council';
}

/**
 * Alternative Action - Suggested safer alternative
 */
export interface AlternativeAction {
  description: string;
  modifiedAction: Partial<AgentAction>;
  reasoning: string;
  safetyImprovement: string;
}

/**
 * Amendment - Proposed change to the Constitution
 */
export interface Amendment {
  id: string;
  type: 'add_principle' | 'modify_principle' | 'remove_principle' | 'add_constraint' | 'remove_constraint';
  proposal: string;
  rationale: string;
  proposedBy: string; // agent or user
  proposedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  councilVoteRequired: boolean;
}

// ============================================================================
// CORE CONSTITUTIONAL PRINCIPLES
// ============================================================================

/**
 * The Core Principles of MAIA - These can NEVER be violated
 */
export const CORE_PRINCIPLES: ConstitutionalPrinciple[] = [
  {
    id: 'principle_1',
    name: 'No Destructive Actions Without Consent',
    category: 'safety',
    priority: 1,
    description: 'Never delete, modify, or destroy user data without explicit approval.',
    rationale: 'User data is sacred. Accidental destruction is irreversible and destroys trust.',
    enforcement: 'strict',
    examples: {
      compliant: [
        'Ask user before deleting files: "Should I delete these 5 files?"',
        'Create backup before major refactoring',
        'Show diff before applying changes'
      ],
      violating: [
        'Deleting files without asking',
        'Running rm -rf commands autonomously',
        'Modifying config files without confirmation'
      ]
    }
  },
  {
    id: 'principle_2',
    name: 'Transparency and Explainability',
    category: 'transparency',
    priority: 1,
    description: 'All actions must be explainable in human-understandable terms.',
    rationale: 'Users must understand what the system is doing and why. Hidden actions erode trust.',
    enforcement: 'strict',
    examples: {
      compliant: [
        'Explain why a specific agent was assigned',
        'Show the reasoning behind a recommendation',
        'Log all decisions with explanations'
      ],
      violating: [
        'Making decisions without logging the reasoning',
        'Hidden background processes',
        'Opaque AI decision-making'
      ]
    }
  },
  {
    id: 'principle_3',
    name: 'Efficiency Over Perfection',
    category: 'efficiency',
    priority: 2,
    description: 'Speed and pragmatism are preferred over perfect optimization.',
    rationale: 'Done is better than perfect. Users value working solutions over theoretical perfection.',
    enforcement: 'guideline',
    examples: {
      compliant: [
        'Ship a working solution in 10 minutes',
        'Use existing libraries instead of building from scratch',
        'Accept 80% test coverage if it means shipping today'
      ],
      violating: [
        'Spending hours optimizing already-fast code',
        'Refactoring working code for "elegance"',
        'Blocking progress on theoretical improvements'
      ]
    }
  },
  {
    id: 'principle_4',
    name: 'Consult Before Major Changes',
    category: 'collaboration',
    priority: 1,
    description: 'Changes affecting multiple files, systems, or workflows require user consultation.',
    rationale: 'Major changes have ripple effects. User input prevents unintended consequences.',
    enforcement: 'strict',
    examples: {
      compliant: [
        'Ask before refactoring core architecture',
        'Propose API changes to user before implementing',
        'Council vote for multi-system modifications'
      ],
      violating: [
        'Silent refactoring of shared code',
        'Changing APIs without notification',
        'Autonomous database schema changes'
      ]
    }
  },
  {
    id: 'principle_5',
    name: 'Recovery First',
    category: 'recovery',
    priority: 1,
    description: 'Before aborting any task, attempt recovery and preserve all work.',
    rationale: 'Work should never be lost. Recovery attempts should always precede failure.',
    enforcement: 'strict',
    examples: {
      compliant: [
        'Save partial progress before timeout',
        'Create checkpoints during long operations',
        'Offer recovery options when errors occur'
      ],
      violating: [
        'Aborting without saving progress',
        'Deleting temporary files that could aid recovery',
        'Failing fast without recovery attempt'
      ]
    }
  },
  {
    id: 'principle_6',
    name: 'Autonomy with Guardrails',
    category: 'safety',
    priority: 2,
    description: 'Agents should be autonomous within constitutional boundaries.',
    rationale: 'Autonomous agents are efficient, but must be constrained by safety principles.',
    enforcement: 'strict',
    examples: {
      compliant: [
        'Auto-fix simple bugs without asking',
        'Execute trivial tasks independently',
        'Make minor optimizations proactively'
      ],
      violating: [
        'Autonomous destructive actions',
        'Independent architectural decisions',
        'Unchecked auto-dispatch'
      ]
    }
  },
  {
    id: 'principle_7',
    name: 'Council for Disagreements',
    category: 'collaboration',
    priority: 2,
    description: 'When multiple agents disagree, the Council votes to resolve conflicts.',
    rationale: 'Democratic decision-making prevents rogue agents and ensures collective wisdom.',
    enforcement: 'guideline',
    examples: {
      compliant: [
        'Council votes on implementation approach',
        'Multiple agents vote on architectural decision',
        'Consensus required for major changes'
      ],
      violating: [
        'Single agent overriding others without process',
        'Ignoring council decisions',
        'Bypassing consensus mechanisms'
      ]
    }
  },
  {
    id: 'principle_8',
    name: 'Learn and Adapt',
    category: 'efficiency',
    priority: 3,
    description: 'Continuously learn from patterns and adapt to improve efficiency.',
    rationale: 'The ecosystem should become smarter and faster over time.',
    enforcement: 'advisory',
    examples: {
      compliant: [
        'Update DNA patterns based on task outcomes',
        'Adjust agent assignments based on performance',
        'Optimize workflows from historical data'
      ],
      violating: [
        'Ignoring historical patterns',
        'Repeating mistakes',
        'Not updating from learning'
      ]
    }
  }
];

/**
 * Default constraints for agents
 */
export const DEFAULT_CONSTRAINTS: ConstitutionalConstraint[] = [
  {
    id: 'constraint_coder_1',
    agentId: 'coder',
    constraintType: 'permission',
    limitation: 'Cannot delete files in production directories without approval',
    reason: 'Production data safety',
    exceptions: ['explicit_user_approval', 'council_approval'],
    enabled: true
  },
  {
    id: 'constraint_ops_1',
    agentId: 'ops',
    constraintType: 'scope',
    limitation: 'Infrastructure changes require user notification',
    reason: 'Infrastructure changes affect system stability',
    exceptions: ['emergency_fixes'],
    enabled: true
  },
  {
    id: 'constraint_maia_1',
    agentId: 'maia',
    constraintType: 'capability',
    limitation: 'Cannot bypass constitution under any circumstance',
    reason: 'Constitution is supreme law',
    exceptions: [],
    enabled: true
  }
];

// ============================================================================
// MAIN CONSTITUTION CLASS
// ============================================================================

export class Constitution {
  private principles: Map<string, ConstitutionalPrinciple>;
  private constraints: Map<string, ConstitutionalConstraint>;
  private rulingHistory: ConstitutionalRuling[];
  private amendments: Amendment[];

  constructor() {
    this.principles = new Map();
    this.constraints = new Map();
    this.rulingHistory = [];
    this.amendments = [];

    // Load core principles
    CORE_PRINCIPLES.forEach(p => this.principles.set(p.id, p));
    DEFAULT_CONSTRAINTS.forEach(c => this.constraints.set(c.id, c));
  }

  // ==========================================================================
  // PRINCIPLE MANAGEMENT
  // ==========================================================================

  /**
   * Get all principles
   */
  getPrinciples(): ConstitutionalPrinciple[] {
    return Array.from(this.principles.values()).sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get principles by category
   */
  getPrinciplesByCategory(category: ConstitutionalPrinciple['category']): ConstitutionalPrinciple[] {
    return Array.from(this.principles.values())
      .filter(p => p.category === category)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get a principle by ID
   */
  getPrinciple(id: string): ConstitutionalPrinciple | undefined {
    return this.principles.get(id);
  }

  /**
   * Add a new principle (requires council approval in production)
   */
  addPrinciple(principle: ConstitutionalPrinciple, requireApproval = true): boolean {
    if (requireApproval) {
      // In production, this would require council vote
      console.warn(`[Constitution] Adding principle "${principle.name}" - council approval recommended`);
    }
    this.principles.set(principle.id, principle);
    return true;
  }

  // ==========================================================================
  // CONSTRAINT MANAGEMENT
  // ==========================================================================

  /**
   * Get constraints for an agent
   */
  getConstraintsForAgent(agentId: string): ConstitutionalConstraint[] {
    return Array.from(this.constraints.values()).filter(
      c => c.agentId === agentId && c.enabled
    );
  }

  /**
   * Add a constraint for an agent
   */
  addConstraint(constraint: ConstitutionalConstraint): void {
    this.constraints.set(constraint.id, constraint);
  }

  /**
   * Remove a constraint
   */
  removeConstraint(constraintId: string): boolean {
    return this.constraints.delete(constraintId);
  }

  // ==========================================================================
  // CONSTITUTIONAL EVALUATION
  // ==========================================================================

  /**
   * Evaluate if an action is constitutional
   *
   * This is the main enforcement mechanism - all actions must pass
   * this check before execution.
   */
  evaluate(action: AgentAction): ConstitutionalRuling {
    const violatedPrinciples: ConstitutionalRuling['violatedPrinciples'] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let isConstitutional = true;

    // Check each principle
    for (const principle of this.principles.values()) {
      const violation = this.checkPrincipleViolation(action, principle);
      if (violation) {
        violatedPrinciples.push(violation);
        if (principle.enforcement === 'strict') {
          isConstitutional = false;
        }
      }
    }

    // Check agent-specific constraints
    const agentConstraints = this.getConstraintsForAgent(action.agentId);
    for (const constraint of agentConstraints) {
      const constraintWarning = this.checkConstraintViolation(action, constraint);
      if (constraintWarning) {
        warnings.push(constraintWarning);
      }
    }

    // Generate suggestions based on action type
    suggestions.push(...this.generateSuggestions(action));

    const ruling: ConstitutionalRuling = {
      actionId: action.id,
      isConstitutional,
      violatedPrinciples,
      warnings,
      suggestions,
      confidence: this.calculateConfidence(action, violatedPrinciples),
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'constitution'
    };

    // Record ruling in history
    this.rulingHistory.push(ruling);

    return ruling;
  }

  /**
   * Check if an action violates a specific principle
   */
  private checkPrincipleViolation(
    action: AgentAction,
    principle: ConstitutionalPrinciple
  ): ConstitutionalRuling['violatedPrinciples'][0] | null {
    // Principle 1: No Destructive Actions Without Consent
    if (principle.id === 'principle_1') {
      if (action.actionType === 'delete' || action.actionType === 'modify') {
        // Check if action has explicit consent
        const hasConsent = action.context.userConfirmed === true ||
                          action.context.councilApproved === true;
        if (!hasConsent) {
          return {
            principle,
            severity: 'critical',
            explanation: `Destructive action on "${action.target}" requires explicit user approval or council approval`
          };
        }
      }
    }

    // Principle 2: Transparency and Explainability
    if (principle.id === 'principle_2') {
      if (!action.description || action.description.length < 10) {
        return {
          principle,
          severity: 'minor',
          explanation: 'Action description is too brief to be considered transparent'
        };
      }
    }

    // Principle 4: Consult Before Major Changes
    if (principle.id === 'principle_4') {
      const isMajorChange = action.context.affectsMultipleFiles === true ||
                           action.context.affectsMultipleSystems === true ||
                           action.context.isArchitectural === true;
      if (isMajorChange) {
        const hasApproval = action.context.userApproved === true ||
                           action.context.councilVoted === true;
        if (!hasApproval) {
          return {
            principle,
            severity: 'major',
            explanation: 'Major change requires user consultation or council vote'
          };
        }
      }
    }

    // Principle 5: Recovery First
    if (principle.id === 'principle_5') {
      if (action.actionType === 'delete' && !action.context.backupCreated) {
        return {
          principle,
          severity: 'critical',
          explanation: 'Deletion action must create backup first (Recovery First principle)'
        };
      }
    }

    // Principle 6: Autonomy with Guardrails
    if (principle.id === 'principle_6') {
      if (action.actionType === 'delete' && action.context.autonomous === true) {
        return {
          principle,
          severity: 'critical',
          explanation: 'Destructive actions cannot be performed autonomously'
        };
      }
    }

    return null;
  }

  /**
   * Check if an action violates a constraint
   */
  private checkConstraintViolation(
    action: AgentAction,
    constraint: ConstitutionalConstraint
  ): string | null {
    // This is a simplified check - in production, would be more sophisticated
    if (constraint.constraintType === 'permission') {
      if (action.actionType === 'delete' &&
          action.target.includes('production') &&
          !action.context.exceptions?.includes(constraint.id)) {
        return `Constraint ${constraint.id}: ${constraint.limitation}`;
      }
    }
    return null;
  }

  /**
   * Generate suggestions for an action
   */
  private generateSuggestions(action: AgentAction): string[] {
    const suggestions: string[] = [];

    // Suggest backup before destructive actions
    if (action.actionType === 'delete' || action.actionType === 'modify') {
      if (!action.context.backupCreated) {
        suggestions.push('Consider creating a backup before this action');
      }
    }

    // Suggest council vote for complex actions
    if (action.context.complexity === 'high' || action.context.affectsMultipleAgents) {
      suggestions.push('Consider requesting a council vote for this complex action');
    }

    // Suggest explanation for transparency
    if (action.description.length < 50) {
      suggestions.push('Consider providing a more detailed explanation for transparency');
    }

    return suggestions;
  }

  /**
   * Calculate confidence in the ruling
   */
  private calculateConfidence(
    action: AgentAction,
    violations: ConstitutionalRuling['violatedPrinciples']
  ): number {
    // High confidence for clear violations
    if (violations.some(v => v.severity === 'critical')) {
      return 0.95;
    }

    // Lower confidence for edge cases
    if (action.context.novel === true) {
      return 0.7;
    }

    return 0.85;
  }

  // ==========================================================================
  // ALTERNATIVE ACTIONS
  // ==========================================================================

  /**
   * Suggest safer alternatives for unconstitutional actions
   */
  suggestAlternatives(action: AgentAction): AlternativeAction[] {
    const ruling = this.evaluate(action);
    const alternatives: AlternativeAction[] = [];

    if (!ruling.isConstitutional) {
      // Suggest safer versions based on violations

      // For deletion violations, suggest backup-first approach
      if (action.actionType === 'delete') {
        alternatives.push({
          description: 'Create backup before deletion',
          modifiedAction: {
            ...action,
            context: {
              ...action.context,
              backupCreated: true,
              backupLocation: '.backups/' + action.target
            }
          },
          reasoning: 'Principle 5 (Recovery First) requires backup before destructive actions',
          safetyImprovement: 'Data can be recovered if deletion was mistaken'
        });
      }

      // For major change violations, suggest council vote
      if (action.context.affectsMultipleFiles || action.context.affectsMultipleSystems) {
        alternatives.push({
          description: 'Request council approval first',
          modifiedAction: {
            ...action,
            context: {
              ...action.context,
              councilVoted: true,
              councilProposal: `Should I proceed with: ${action.description}?`
            }
          },
          reasoning: 'Principle 4 (Consult First) requires consultation for major changes',
          safetyImprovement: 'Multiple agents review prevents unintended consequences'
        });
      }

      // For autonomy violations, suggest user confirmation
      if (action.context.autonomous === true) {
        alternatives.push({
          description: 'Request user confirmation',
          modifiedAction: {
            ...action,
            context: {
              ...action.context,
              autonomous: false,
              userConfirmationRequired: true
            }
          },
          reasoning: 'Principle 6 (Autonomy with Guardrails) limits autonomous destructive actions',
          safetyImprovement: 'User has final say over destructive operations'
        });
      }
    }

    return alternatives;
  }

  // ==========================================================================
  // AMENDMENT SYSTEM
  // ==========================================================================

  /**
   * Propose an amendment to the Constitution
   */
  proposeAmendment(
    type: Amendment['type'],
    proposal: string,
    rationale: string,
    proposedBy: string
  ): Amendment {
    const amendment: Amendment = {
      id: `amendment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      proposal,
      rationale,
      proposedBy,
      proposedAt: new Date().toISOString(),
      status: 'pending',
      councilVoteRequired: true
    };

    this.amendments.push(amendment);
    return amendment;
  }

  /**
   * Approve an amendment
   */
  approveAmendment(amendmentId: string): boolean {
    const amendment = this.amendments.find(a => a.id === amendmentId);
    if (!amendment) return false;

    amendment.status = 'approved';

    // Apply the amendment based on type
    // In production, this would parse the proposal and apply changes
    console.log(`[Constitution] Amendment approved: ${amendment.proposal}`);

    return true;
  }

  /**
   * Reject an amendment
   */
  rejectAmendment(amendmentId: string): boolean {
    const amendment = this.amendments.find(a => a.id === amendmentId);
    if (!amendment) return false;

    amendment.status = 'rejected';
    return true;
  }

  // ==========================================================================
  // HISTORY AND REPORTING
  // ==========================================================================

  /**
   * Get ruling history
   */
  getRulingHistory(limit?: number): ConstitutionalRuling[] {
    if (limit) {
      return this.rulingHistory.slice(-limit);
    }
    return [...this.rulingHistory];
  }

  /**
   * Get rulings for an agent
   */
  getRulingsForAgent(agentId: string): ConstitutionalRuling[] {
    return this.rulingHistory.filter(r => {
      // Find the original action for this ruling
      // In production, would store action with ruling
      return true; // Simplified
    });
  }

  /**
   * Get constitution health report
   */
  getHealthReport(): {
    totalPrinciples: number;
    activeConstraints: number;
    totalRulings: number;
    constitutionalRate: number;
    commonViolations: Array<{ principle: string; count: number }>;
  } {
    const totalRulings = this.rulingHistory.length;
    const unconstitutionalRulings = this.rulingHistory.filter(r => !r.isConstitutional).length;
    const constitutionalRate = totalRulings > 0
      ? (totalRulings - unconstitutionalRulings) / totalRulings
      : 1;

    // Count common violations
    const violationCounts = new Map<string, number>();
    for (const ruling of this.rulingHistory) {
      for (const violation of ruling.violatedPrinciples) {
        const count = violationCounts.get(violation.principle.name) || 0;
        violationCounts.set(violation.principle.name, count + 1);
      }
    }

    const commonViolations = Array.from(violationCounts.entries())
      .map(([principle, count]) => ({ principle, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalPrinciples: this.principles.size,
      activeConstraints: Array.from(this.constraints.values()).filter(c => c.enabled).length,
      totalRulings,
      constitutionalRate,
      commonViolations
    };
  }

  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================

  /**
   * Serialize constitution state
   */
  serialize(): string {
    return JSON.stringify({
      principles: Array.from(this.principles.entries()),
      constraints: Array.from(this.constraints.entries()),
      amendments: this.amendments,
      // Note: Not serializing rulingHistory to avoid excessive size
    });
  }

  /**
   * Deserialize constitution state
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.principles = new Map(parsed.principles || []);
      this.constraints = new Map(parsed.constraints || []);
      this.amendments = parsed.amendments || [];
    } catch (error) {
      console.error('Failed to deserialize constitution:', error);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let constitutionInstance: Constitution | null = null;

export function getConstitution(): Constitution {
  if (!constitutionInstance) {
    constitutionInstance = new Constitution();
  }
  return constitutionInstance;
}

export function resetConstitution(): void {
  constitutionInstance = null;
}
