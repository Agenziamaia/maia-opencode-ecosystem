export type AgentId =
  | 'maia'
  | 'sisyphus'
  | 'coder'
  | 'ops'
  | 'researcher'
  | 'researcher_deep'
  | 'reviewer'
  | 'giuzu'
  | 'workflow'
  | 'opencode'
  | 'vision'
  | 'starter'
  | 'librarian'
  | 'maia_premium'
  | 'prometheus'
  | 'oracle'
  | 'explore'
  | 'frontend'
  | 'github'
  | 'sisyphus_junior';

export type AgentStatus = 'healthy' | 'unhealthy' | 'busy' | 'idle';

export type AgentCapability =
  | 'planning'
  | 'coding'
  | 'testing'
  | 'research'
  | 'review'
  | 'infrastructure'
  | 'automation'
  | 'meta'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops';

export interface AgentData {
  id: AgentId;
  name: string;
  capabilities: AgentCapability[];
  status: AgentStatus;
  currentTasks: number;
  maxTasks: number;
  lastSeen: string;
  specialties: string[];
}

export type TaskStatus = 'todo' | 'inprogress' | 'inreview' | 'done' | 'cancelled';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  tags: string[];
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface AgentInteraction {
  agent_id: string;
  timestamp: string;
  action: string;
  duration_ms: number;
  context?: Record<string, unknown>;
}

export interface OutcomeMetrics {
  completion_time_ms: number;
  revision_count: number;
  quality_score: number;
}

export interface TaskDNA {
  pattern_id?: string;
  pattern_confidence: number;
  agent_interactions: AgentInteraction[];
  outcome?: 'success' | 'partial' | 'failure' | 'pending';
  outcome_metrics?: OutcomeMetrics;
  learned_patterns: string[];
}

export interface Pattern {
  id: string;
  name: string;
  task_type: string;
  characteristics: string[];
  success_rate: number;
  avg_completion_time_ms: number;
  recommended_agents: AgentId[];
  sample_size: number;
  last_updated: string;
}

export interface DNAMatchResult {
  pattern: Pattern;
  confidence: number;
  reasoning: string;
}

export type VoteType = 'upvote' | 'downvote' | 'abstain';

export interface CouncilVote {
  agent_id: string;
  vote: VoteType;
  reasoning?: string;
  timestamp: string;
}

export type CouncilStatus = 'pending' | 'consensus' | 'no_consensus' | 'timeout';

export interface CouncilDecision {
  decision_id: string;
  proposal: string;
  votes: CouncilVote[];
  status: CouncilStatus;
  consensus_threshold: number;
  created_at: string;
  timeout_at: string;
  final_decision?: string;
  timeout_ms: number;
}

export interface EmergenceData {
  emergence_score: number;
  emergent_capabilities: string[];
  novelty_score: number;
  cross_agent_collaborations: {
    agents: string[];
    purpose: string;
    outcome: string;
  }[];
}

export interface ExtendedTask extends Task {
  dna?: TaskDNA;
  agent_assignment?: {
    primary_agent: AgentId;
    agent_variant?: string;
    assigned_at: string;
    assignment_method: 'manual' | 'auto' | 'council' | 'pattern';
    availability_checked: boolean;
    backup_agents: AgentId[];
  };
  council_decision?: CouncilDecision;
  emergence?: EmergenceData;
}

export type ActivityType =
  | 'agent_status'
  | 'task_update'
  | 'vote_cast'
  | 'pattern_match'
  | 'agent_interaction';

export interface ActivityItem {
  id: string;
  timestamp: Date;
  type: ActivityType;
  data: any;
}

export interface EcosystemHealth {
  agents: {
    available: number;
    total: number;
  };
  council: {
    activeDecisions: number;
  };
  dna: {
    learnedPatterns: number;
  };
  overall: 'healthy' | 'warning' | 'error';
}
