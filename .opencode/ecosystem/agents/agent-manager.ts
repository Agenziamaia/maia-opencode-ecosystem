wait wh/**
 * Agent Availability and Tagging System
 *
 * Purpose: Manage agent availability, tagging, and automatic assignment
 * for tasks in the MAIA ecosystem.
 */

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

export type AssignmentMethod = 'manual' | 'auto' | 'council' | 'pattern';

export interface AgentCapabilities {
  id: AgentId;
  name: string;
  capabilities: AgentCapability[];
  available: boolean;
  currentTasks: number;
  maxTasks: number;
  lastSeen: string;
  specialties: string[];
}

export interface AgentAssignment {
  primary_agent: AgentId;
  agent_variant?: string;
  assigned_at: string;
  assignment_method: AssignmentMethod;
  availability_checked: boolean;
  backup_agents: AgentId[];
}

export interface TaskTypeMatch {
  agentId: AgentId;
  confidence: number;
  reason: string;
}

/**
 * Agent Manager - Main class for managing agent availability and assignments
 */
export class AgentManager {
  private agents: Map<AgentId, AgentCapabilities>;
  private taskTypePatterns: Map<string, AgentId[]>;

  constructor() {
    this.agents = new Map();
    this.taskTypePatterns = new Map();
    this.initializeDefaultAgents();
    this.initializeTaskPatterns();
  }

  /**
   * Register a new agent
   */
  registerAgent(agent: AgentCapabilities): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Update agent availability
   */
  updateAvailability(agentId: AgentId, available: boolean): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.available = available;
      agent.lastSeen = new Date().toISOString();
    }
  }

  /**
   * Increment task count for an agent
   */
  incrementTaskCount(agentId: AgentId): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentTasks++;
    }
  }

  /**
   * Decrement task count for an agent
   */
  decrementTaskCount(agentId: AgentId): void {
    const agent = this.agents.get(agentId);
    if (agent && agent.currentTasks > 0) {
      agent.currentTasks--;
    }
  }

  /**
   * Check if an agent is available
   */
  isAvailable(agentId: AgentId): boolean {
    const agent = this.agents.get(agentId);
    return agent ? agent.available && agent.currentTasks < agent.maxTasks : false;
  }

  /**
   * Get all available agents
   */
  getAvailableAgents(): AgentCapabilities[] {
    return Array.from(this.agents.values()).filter((a) => this.isAvailable(a.id));
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: AgentId): AgentCapabilities | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentCapabilities[] {
    return Array.from(this.agents.values());
  }

  /**
   * Recommend agents for a task
   */
  recommendAgents(
    taskTitle: string,
    taskDescription: string,
    count: number = 3
  ): TaskTypeMatch[] {
    const features = this.extractTaskFeatures(taskTitle, taskDescription);
    const matches: TaskTypeMatch[] = [];

    Array.from(this.agents.values()).forEach((agent) => {
      const score = this.calculateCapabilityMatch(features, agent);
      if (score > 0) {
        const availabilityBonus = this.isAvailable(agent.id) ? 0.2 : -0.3;
        const loadPenalty = (agent.currentTasks / agent.maxTasks) * 0.3;

        matches.push({
          agentId: agent.id,
          confidence: Math.max(0, Math.min(1, score + availabilityBonus - loadPenalty)),
          reason: `Matches ${features.filter((f) => agent.capabilities.includes(f as AgentCapability)).join(', ')}`,
        });
      }
    });

    matches.sort((a, b) => b.confidence - a.confidence);
    return matches.slice(0, count);
  }

  /**
   * Auto-assign an agent to a task
   */
  autoAssign(
    taskTitle: string,
    taskDescription: string
  ): AgentAssignment | null {
    const recommendations = this.recommendAgents(taskTitle, taskDescription, 1);

    if (recommendations.length === 0) {
      return null;
    }

    const primaryAgentId = recommendations[0].agentId;
    const backupAgents = recommendations.slice(1, 3).map((r) => r.agentId);

    this.incrementTaskCount(primaryAgentId);

    return {
      primary_agent: primaryAgentId,
      assigned_at: new Date().toISOString(),
      assignment_method: 'auto',
      availability_checked: true,
      backup_agents: backupAgents,
    };
  }

  /**
   * Assign an agent manually
   */
  manualAssign(agentId: AgentId, backupAgents?: AgentId[]): AgentAssignment | null {
    if (!this.isAvailable(agentId)) {
      return null;
    }

    this.incrementTaskCount(agentId);

    return {
      primary_agent: agentId,
      assigned_at: new Date().toISOString(),
      assignment_method: 'manual',
      availability_checked: true,
      backup_agents: backupAgents || [],
    };
  }

  /**
   * Assign based on DNA pattern
   */
  patternAssign(patternId: string): AgentAssignment | null {
    const agents = this.taskTypePatterns.get(patternId);
    if (!agents || agents.length === 0) {
      return null;
    }

    for (const agentId of agents) {
      if (this.isAvailable(agentId)) {
        this.incrementTaskCount(agentId);
        return {
          primary_agent: agentId,
          assigned_at: new Date().toISOString(),
          assignment_method: 'pattern',
          availability_checked: true,
          backup_agents: [],
        };
      }
    }

    return null;
  }

  /**
   * Perform health check on an agent
   */
  async healthCheck(agentId: AgentId): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    try {
      const response = await fetch('http://localhost:62601/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      const isHealthy = response.ok;
      this.updateAvailability(agentId, isHealthy);
      return isHealthy;
    } catch {
      this.updateAvailability(agentId, false);
      return false;
    }
  }

  /**
   * Perform health checks on all agents
   */
  async healthCheckAll(): Promise<Record<AgentId, boolean>> {
    const results: Record<AgentId, boolean> = {} as Record<AgentId, boolean>;

    const checks = Array.from(this.agents.keys()).map(async (agentId) => {
      results[agentId] = await this.healthCheck(agentId);
    });

    await Promise.all(checks);
    return results;
  }

  /**
   * Get agent load statistics
   */
  getLoadStats(): Record<AgentId, { current: number; max: number; percentage: number }> {
    const stats: Record<AgentId, { current: number; max: number; percentage: number }> =
      {} as Record<AgentId, { current: number; max: number; percentage: number }>;

    this.agents.forEach((agent) => {
      stats[agent.id] = {
        current: agent.currentTasks,
        max: agent.maxTasks,
        percentage: (agent.currentTasks / agent.maxTasks) * 100,
      };
    });

    return stats;
  }

  private initializeDefaultAgents(): void {
    const defaultAgents: AgentCapabilities[] = [
      {
        id: 'maia',
        name: 'MAIA Orchestrator',
        capabilities: ['planning', 'meta', 'coding'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['strategic planning', 'orchestration', 'meta-analysis'],
      },
      {
        id: 'sisyphus',
        name: 'Sisyphus PM',
        capabilities: ['planning', 'meta'],
        available: true,
        currentTasks: 0,
        maxTasks: 3,
        lastSeen: new Date().toISOString(),
        specialties: ['project management', 'task breakdown', 'scheduling'],
      },
      {
        id: 'coder',
        name: 'Coder Architect',
        capabilities: ['coding', 'testing', 'frontend', 'backend'],
        available: true,
        currentTasks: 0,
        maxTasks: 10,
        lastSeen: new Date().toISOString(),
        specialties: ['architecture', 'implementation', 'refactoring'],
      },
      {
        id: 'ops',
        name: 'Ops Engineer',
        capabilities: ['infrastructure', 'devops', 'automation'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['deployment', 'CI/CD', 'infrastructure'],
      },
      {
        id: 'researcher',
        name: 'Researcher Oracle',
        capabilities: ['research', 'meta'],
        available: true,
        currentTasks: 0,
        maxTasks: 8,
        lastSeen: new Date().toISOString(),
        specialties: ['documentation', 'best practices', 'context research'],
      },
      {
        id: 'reviewer',
        name: 'Reviewer Gatekeeper',
        capabilities: ['review', 'testing'],
        available: true,
        currentTasks: 0,
        maxTasks: 6,
        lastSeen: new Date().toISOString(),
        specialties: ['code review', 'quality assurance', 'audit'],
      },
      {
        id: 'workflow',
        name: 'Workflow Automator',
        capabilities: ['automation', 'infrastructure'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['n8n', 'Flowise', 'automation workflows', 'trigger', 'logic'],
      },
      {
        id: 'researcher_deep',
        name: 'Deep Oracle',
        capabilities: ['research', 'meta'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['academic research', 'thorough analysis', 'deep dive', 'intel'],
      },
      {
        id: 'vision',
        name: 'Vision Analyst',
        capabilities: ['research', 'meta'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['multimodal', 'image analysis', 'video analysis', 'visual recon'],
      },
      {
        id: 'starter',
        name: 'Bootstrapper',
        capabilities: ['planning', 'infrastructure'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['project launch', 'bootstrap', 'init', 'setup', 'environment'],
      },
      {
        id: 'librarian',
        name: 'Success Curator',
        capabilities: ['research', 'meta'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['documentation', 'curation', 'knowledge vault', 'memory'],
      },
      {
        id: 'maia_premium',
        name: 'Supreme Arbiter',
        capabilities: ['meta', 'planning', 'review'],
        available: true,
        currentTasks: 0,
        maxTasks: 3,
        lastSeen: new Date().toISOString(),
        specialties: ['escalation', 'paradox resolution', 'deadlock fix', 'supreme reasoning'],
      },
      {
        id: 'prometheus',
        name: 'Planner',
        capabilities: ['planning', 'meta'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['milestones', 'decomposition', 'estimation', 'architecture plans'],
      },
      {
        id: 'oracle',
        name: 'Architect',
        capabilities: ['meta', 'planning', 'coding'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['system mapping', 'risk assessment', 'complex debugging', 'architecture'],
      },
      {
        id: 'explore',
        name: 'Fast Scanner',
        capabilities: ['research'],
        available: true,
        currentTasks: 0,
        maxTasks: 10,
        lastSeen: new Date().toISOString(),
        specialties: ['scanning', 'codebase mapping', 'grep', 'glob', 'breadth-first search'],
      },
      {
        id: 'frontend',
        name: 'UI Engineer',
        capabilities: ['frontend', 'coding'],
        available: true,
        currentTasks: 0,
        maxTasks: 8,
        lastSeen: new Date().toISOString(),
        specialties: ['ui design', 'ux', 'responsive', 'animations', 'nextjs'],
      },
      {
        id: 'github',
        name: 'GitHub Expert',
        capabilities: ['automation', 'meta'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['version control', 'git', 'collaboration', 'github actions', 'pr management'],
      },
      {
        id: 'sisyphus_junior',
        name: 'Code Executor',
        capabilities: ['coding'],
        available: true,
        currentTasks: 0,
        maxTasks: 10,
        lastSeen: new Date().toISOString(),
        specialties: ['implementation', 'precision coding', 'diagnostics', 'task runner'],
      },
      {
        id: 'opencode',
        name: 'Platform Oracle',
        capabilities: ['meta', 'infrastructure'],
        available: true,
        currentTasks: 0,
        maxTasks: 5,
        lastSeen: new Date().toISOString(),
        specialties: ['ecosystem management', 'mcp integration', 'plugin audit', 'platform'],
      },
    ];

    defaultAgents.forEach((agent) => this.registerAgent(agent));
  }

  private initializeTaskPatterns(): void {
    this.taskTypePatterns.set('implement', ['coder', 'ops']);
    this.taskTypePatterns.set('test', ['coder', 'reviewer']);
    this.taskTypePatterns.set('review', ['reviewer']);
    this.taskTypePatterns.set('plan', ['maia', 'sisyphus']);
    this.taskTypePatterns.set('deploy', ['ops']);
    this.taskTypePatterns.set('research', ['researcher']);
    this.taskTypePatterns.set('optimize', ['coder', 'ops']);
  }

  private extractTaskFeatures(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const features: string[] = [];

    const keywords: AgentCapability[] = [
      'planning',
      'coding',
      'testing',
      'research',
      'review',
      'infrastructure',
      'automation',
      'meta',
      'frontend',
      'backend',
      'database',
      'devops',
    ];

    const aliases: Record<string, AgentCapability[]> = {
      implement: ['coding'],
      'fix': ['coding', 'testing'],
      'bug': ['coding', 'testing'],
      'feature': ['coding', 'planning'],
      'api': ['backend', 'coding'],
      'ui': ['frontend', 'coding'],
      'design': ['planning', 'frontend'],
      'deploy': ['devops', 'infrastructure'],
      'docker': ['devops', 'infrastructure'],
      'database': ['database', 'backend'],
      'auth': ['backend', 'coding'],
      'test': ['testing', 'coding'],
      'review': ['review'],
      'audit': ['review', 'meta'],
      'plan': ['planning'],
      'optimize': ['coding', 'testing'],
      'automate': ['automation'],
      'workflow': ['automation'],
      'research': ['research'],
      'document': ['research', 'meta'],
    };

    keywords.forEach((kw) => {
      if (text.includes(kw)) {
        features.push(kw);
      }
    });

    for (const [alias, capabilities] of Object.entries(aliases)) {
      if (text.includes(alias)) {
        features.push(...capabilities);
      }
    }

    return Array.from(new Set(features));
  }

  private calculateCapabilityMatch(
    features: string[],
    agent: AgentCapabilities
  ): number {
    const capabilityMatches = features.filter((f) =>
      agent.capabilities.includes(f as AgentCapability)
    ).length;

    const specialtyMatches = features.filter((f) =>
      agent.specialties.some((s) => s.toLowerCase().includes(f))
    ).length;

    const capabilityScore = features.length > 0 ? capabilityMatches / features.length : 0;
    const specialtyScore = features.length > 0 ? specialtyMatches / features.length : 0;

    return capabilityScore * 0.7 + specialtyScore * 0.3;
  }
}

let agentManagerInstance: AgentManager | null = null;

export function getAgentManager(): AgentManager {
  if (!agentManagerInstance) {
    agentManagerInstance = new AgentManager();
  }
  return agentManagerInstance;
}
