import { tool } from "@opencode-ai/plugin";
import { getCouncilManager, VoteType } from "../council/council-manager";
import { getDNATracker } from "../dna/dna-tracker";
import { getAgentManager } from "../agents/agent-manager";
import { getSemanticService } from "../utils/semantic-service";
import { getMaiaOrchestrator } from "../orchestrator/maia-orchestrator";

const getBaseUrl = () =>
  process.env.VIBE_KANBAN_URL || "http://localhost:62601";

/**
 * MCP Tools for Living Ecosystem Foundation
 */

/**
 * Council voting tools
 */
export const council_create_decision = tool({
  description: "Create a new council decision for agent voting",
  args: {
    proposal: tool.schema.string().describe("The proposal being voted on"),
    council_members: tool.schema.array(tool.schema.string()).describe("List of agent IDs that can vote"),
    timeout_ms: tool.schema.number().optional().describe("Timeout in milliseconds (default: 300000)"),
    consensus_threshold: tool.schema.number().optional().describe("Consensus threshold 0-1 (default: 0.7)"),
  },
  async execute(args) {
    const councilManager = getCouncilManager();
    const decision = councilManager.createDecision(
      args.proposal,
      args.council_members,
      args.timeout_ms || 300000,
      args.consensus_threshold || 0.7
    );

    return `✅ Council decision created\n\nDecision ID: ${decision.decision_id}\nProposal: ${decision.proposal}\nStatus: ${decision.status}\nConsensus threshold: ${decision.consensus_threshold}\nTimeout at: ${decision.timeout_at}`;
  },
});

export const council_cast_vote = tool({
  description: "Cast a vote on a council decision",
  args: {
    decision_id: tool.schema.string().describe("Decision ID to vote on"),
    agent_id: tool.schema.string().describe("Your agent ID"),
    vote: tool.schema.enum(["upvote", "downvote", "abstain"]).describe("Your vote"),
    reasoning: tool.schema.string().optional().describe("Reason for your vote"),
  },
  async execute(args) {
    const councilManager = getCouncilManager();
    const result = councilManager.castVote(
      args.decision_id,
      args.agent_id,
      args.vote as VoteType,
      args.reasoning
    );

    if (!result) {
      return `❌ Decision ${args.decision_id} not found`;
    }

    const upvotes = result.votes.filter((v) => v.vote === "upvote").length;
    const downvotes = result.votes.filter((v) => v.vote === "downvote").length;
    const abstains = result.votes.filter((v) => v.vote === "abstain").length;

    return `✅ Vote cast\n\nDecision ID: ${result.decision_id}\nStatus: ${result.status}\n\n📊 Vote Summary:\nUpvotes: ${upvotes}\nDownvotes: ${downvotes}\nAbstains: ${abstains}\nTotal: ${result.votes.length}\n\n${result.final_decision ? `Final decision: ${result.final_decision}` : "Waiting for more votes..."}`;
  },
});

export const council_get_decision = tool({
  description: "Get details of a council decision",
  args: {
    decision_id: tool.schema.string().describe("Decision ID to retrieve"),
  },
  async execute(args) {
    const councilManager = getCouncilManager();
    const decision = councilManager.getDecision(args.decision_id);

    if (!decision) {
      return `❌ Decision ${args.decision_id} not found`;
    }

    const upvotes = decision.votes.filter((v) => v.vote === "upvote").length;
    const downvotes = decision.votes.filter((v) => v.vote === "downvote").length;
    const abstains = decision.votes.filter((v) => v.vote === "abstain").length;

    let votesDetails = decision.votes
      .map((v) => `  • ${v.agent_id}: ${v.vote}${v.reasoning ? ` (${v.reasoning})` : ""}`)
      .join("\n");

    return `🗳️ Council Decision\n\nID: ${decision.decision_id}\nStatus: ${decision.status}\nProposal: ${decision.proposal}\n\n📊 Vote Summary:\nUpvotes: ${upvotes}\nDownvotes: ${downvotes}\nAbstains: ${abstains}\n\nVotes:\n${votesDetails || "No votes yet"}\n\n${decision.final_decision ? `✅ Final decision: ${decision.final_decision}` : "⏳ Pending decision..."}`;
  },
});

export const council_list_active = tool({
  description: "List all active council decisions",
  args: {},
  async execute() {
    const councilManager = getCouncilManager();
    const decisions = councilManager.getActiveDecisions();

    if (decisions.length === 0) {
      return "No active council decisions";
    }

    return decisions
      .map(
        (d) =>
          `• ${d.decision_id}\n  Proposal: ${d.proposal}\n  Status: ${d.status}\n  Votes: ${d.votes.length}`
      )
      .join("\n\n");
  },
});

export const council_agent_stats = tool({
  description: "Get voting statistics for an agent",
  args: {
    agent_id: tool.schema.string().describe("Agent ID to get stats for"),
  },
  async execute(args) {
    const councilManager = getCouncilManager();
    const stats = councilManager.getAgentStats(args.agent_id);

    return `📊 Agent Voting Stats: ${args.agent_id}\n\nTotal votes: ${stats.totalVotes}\nUpvotes: ${stats.upvotes}\nDownvotes: ${stats.downvotes}\nAbstains: ${stats.abstains}\nConsensus participation: ${(stats.consensusParticipation * 100).toFixed(1)}%`;
  },
});

/**
 * DNA tracking tools
 */
export const dna_record_interaction = tool({
  description: "Record an agent interaction for a task",
  args: {
    task_id: tool.schema.string().describe("Task ID"),
    agent_id: tool.schema.string().describe("Agent ID"),
    action: tool.schema.string().describe("Action performed"),
    duration_ms: tool.schema.number().optional().describe("Duration in milliseconds"),
  },
  async execute(args) {
    const dnaTracker = getDNATracker();
    dnaTracker.recordInteraction(args.task_id, {
      agent_id: args.agent_id,
      action: args.action,
      duration_ms: args.duration_ms || 0,
      timestamp: new Date().toISOString(),
    });

    return `✅ Interaction recorded\n\nTask: ${args.task_id}\nAgent: ${args.agent_id}\nAction: ${args.action}\nDuration: ${args.duration_ms || 0}ms`;
  },
});

export const dna_record_outcome = tool({
  description: "Record task outcome and trigger learning",
  args: {
    task_id: tool.schema.string().describe("Task ID"),
    outcome: tool.schema.enum(["success", "partial", "failure"]).describe("Task outcome"),
    completion_time_ms: tool.schema.number().describe("Time to complete in milliseconds"),
    revision_count: tool.schema.number().optional().describe("Number of revisions (default: 0)"),
    quality_score: tool.schema.number().optional().describe("Quality score 0-1 (default: 1.0)"),
  },
  async execute(args) {
    const dnaTracker = getDNATracker();
    dnaTracker.recordOutcome(args.task_id, args.outcome, {
      completion_time_ms: args.completion_time_ms,
      revision_count: args.revision_count || 0,
      quality_score: args.quality_score || 1.0,
    });

    return `✅ Outcome recorded\n\nTask: ${args.task_id}\nOutcome: ${args.outcome}\nCompletion time: ${args.completion_time_ms}ms\nRevisions: ${args.revision_count || 0}\nQuality score: ${(args.quality_score || 1.0).toFixed(2)}`;
  },
});

export const dna_find_pattern = tool({
  description: "Find matching patterns for a task",
  args: {
    task_title: tool.schema.string().describe("Task title"),
    task_description: tool.schema.string().optional().describe("Task description"),
  },
  async execute(args) {
    const dnaTracker = getDNATracker();
    const match = dnaTracker.findPattern(args.task_title, args.task_description || "");

    if (!match) {
      return "No matching patterns found for this task";
    }

    return `🧬 Pattern Match Found\n\nPattern: ${match.pattern.name}\nConfidence: ${(match.confidence * 100).toFixed(1)}%\n\nReasoning: ${match.reasoning}\n\nRecommended agents: ${match.pattern.recommended_agents.join(", ")}\nSuccess rate: ${(match.pattern.success_rate * 100).toFixed(1)}%\nAvg completion time: ${match.pattern.avg_completion_time_ms}ms`;
  },
});

export const dna_get_patterns = tool({
  description: "Get all learned patterns",
  args: {
    agent_id: tool.schema.string().optional().describe("Filter by agent ID"),
  },
  async execute(args) {
    const dnaTracker = getDNATracker();
    const patterns = args.agent_id
      ? dnaTracker.getPatternsForAgent(args.agent_id)
      : dnaTracker.getAllPatterns();

    if (patterns.length === 0) {
      return args.agent_id
        ? `No patterns found for agent ${args.agent_id}`
        : "No patterns learned yet";
    }

    return patterns
      .map(
        (p) =>
          `• ${p.name} (${p.id})\n  Success rate: ${(p.success_rate * 100).toFixed(1)}%\n  Avg completion: ${p.avg_completion_time_ms}ms\n  Samples: ${p.sample_size}\n  Recommended agents: ${p.recommended_agents.join(", ")}`
      )
      .join("\n\n");
  },
});

export const dna_agent_performance = tool({
  description: "Get performance statistics for an agent",
  args: {
    agent_id: tool.schema.string().describe("Agent ID"),
  },
  async execute(args) {
    const dnaTracker = getDNATracker();
    const perf = dnaTracker.analyzeAgentPerformance(args.agent_id);

    return `📊 Agent Performance: ${args.agent_id}\n\nTotal tasks: ${perf.taskCount}\nAvg duration: ${perf.avgDuration.toFixed(0)}ms\nSuccess rate: ${(perf.successRate * 100).toFixed(1)}%\n\nCommon patterns:\n${perf.commonPatterns.map((p) => `  • ${p}`).join("\n") || "  None yet"}`;
  },
});

/**
 * Agent management tools
 */
export const vault_search = tool({
  description: "Search the knowledge base (Vault) semantically",
  args: {
    query: tool.schema.string().describe("Search query"),
    count: tool.schema.number().optional().describe("Number of results (default: 3)"),
  },
  async execute(args) {
    const semanticService = getSemanticService();
    const results = semanticService.search(args.query, args.count || 3);

    if (results.length === 0) {
      return "No matching documents found in the vault";
    }

    return results
      .map(
        (r) =>
          `• [${r.score.toFixed(3)}] ${r.path}\n  ${r.content.substring(0, 200)}...`
      )
      .join("\n\n");
  },
});

export const agent_recommend = tool({
  description: "Recommend agents for a task based on capabilities and Vault context",
  args: {
    task_title: tool.schema.string().describe("Task title"),
    task_description: tool.schema.string().optional().describe("Task description"),
    count: tool.schema.number().optional().describe("Number of recommendations (default: 3)"),
    use_vault: tool.schema.boolean().optional().describe("Whether to search the vault for context (default: true)"),
  },
  async execute(args) {
    const agentManager = getAgentManager();
    const semanticService = getSemanticService();

    let contextKeywords: string[] = [];
    if (args.use_vault !== false) {
      const results = semanticService.search(`${args.task_title} ${args.task_description || ""}`, 2);
      contextKeywords = results.flatMap(r => r.content.split(/\s+/).slice(0, 10));
    }

    const recommendations = agentManager.recommendAgents(
      `${args.task_title} ${contextKeywords.join(' ')}`,
      args.task_description || "",
      args.count || 3
    );

    if (recommendations.length === 0) {
      return "No suitable agents found for this task";
    }

    return recommendations
      .map(
        (r) =>
          `• ${r.agentId} (${(r.confidence * 100).toFixed(1)}%)\n  Reason: ${r.reason}`
      )
      .join("\n\n");
  },
});

export const agent_auto_assign = tool({
  description: "Automatically assign an agent to a task",
  args: {
    task_title: tool.schema.string().describe("Task title"),
    task_description: tool.schema.string().optional().describe("Task description"),
  },
  async execute(args) {
    const agentManager = getAgentManager();
    const assignment = agentManager.autoAssign(args.task_title, args.task_description || "");

    if (!assignment) {
      return "❌ Could not auto-assign an agent. No suitable agents available.";
    }

    return `✅ Agent assigned\n\nPrimary agent: ${assignment.primary_agent}\nVariant: ${assignment.agent_variant || "DEFAULT"}\nMethod: ${assignment.assignment_method}\nAvailability checked: ${assignment.availability_checked}\nBackup agents: ${assignment.backup_agents.join(", ") || "None"}`;
  },
});

export const agent_health_check = tool({
  description: "Check health status of an agent",
  args: {
    agent_id: tool.schema.string().describe("Agent ID to check"),
  },
  async execute(args) {
    const agentManager = getAgentManager();
    const isHealthy = await agentManager.healthCheck(args.agent_id as any);
    const agent = agentManager.getAgent(args.agent_id as any);

    if (!agent) {
      return `❌ Agent ${args.agent_id} not found`;
    }

    const statusEmoji = isHealthy ? "✅" : "❌";
    const availability = agentManager.isAvailable(args.agent_id as any);

    return `${statusEmoji} Agent Health: ${args.agent_id}\n\nHealth status: ${isHealthy ? "Healthy" : "Unhealthy"}\nAvailable: ${availability ? "Yes" : "No"}\nCurrent tasks: ${agent.currentTasks}/${agent.maxTasks}\nLast seen: ${agent.lastSeen}`;
  },
});

export const agent_health_check_all = tool({
  description: "Check health status of all agents",
  args: {},
  async execute() {
    const agentManager = getAgentManager();
    const results = await agentManager.healthCheckAll();

    return Object.entries(results)
      .map(([agentId, healthy]) => `${healthy ? "✅" : "❌"} ${agentId}: ${healthy ? "Healthy" : "Unhealthy"}`)
      .join("\n");
  },
});

export const agent_load_stats = tool({
  description: "Get current load statistics for all agents",
  args: {},
  async execute() {
    const agentManager = getAgentManager();
    const stats = agentManager.getLoadStats();

    return Object.entries(stats)
      .map(
        ([agentId, s]) =>
          `• ${agentId}\n  Tasks: ${s.current}/${s.max}\n  Load: ${s.percentage.toFixed(0)}%`
      )
      .join("\n\n");
  },
});

/**
 * Extended VibeKanban integration tools
 */
export const vk_create_extended_task = tool({
  description: "Create a task with DNA, agent assignment, and council fields",
  args: {
    project_id: tool.schema.string().describe("Project ID"),
    title: tool.schema.string().describe("Task title"),
    description: tool.schema.string().optional().describe("Task description"),
    status: tool.schema.string().optional().describe("Initial status"),
    primary_agent: tool.schema.string().optional().describe("Primary agent ID"),
    agent_variant: tool.schema.string().optional().describe("Agent variant"),
    assignment_method: tool.schema.enum(["manual", "auto", "council", "pattern"]).optional().describe("How agent was assigned"),
    pattern_id: tool.schema.string().optional().describe("DNA pattern ID"),
  },
  async execute(args) {
    // 1. ADD AGENT BADGE (Living Card)
    let finalTitle = args.title;
    if (args.primary_agent) {
      const badge = _getAgentBadge(args.primary_agent);
      if (!finalTitle.includes("[")) {
        finalTitle = `${badge} ${finalTitle}`;
      }
    }

    const res = await fetch(`${getBaseUrl()}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: args.project_id,
        title: finalTitle,
        description: args.description,
        status: args.status || "todo",
      }),
    });

    if (!res.ok) {
      return `❌ Failed to create task: ${res.status}`;
    }

    const data = await res.json();
    if (!data.success) {
      return `❌ API Error: ${data.error_data}`;
    }

    const taskId = data.data.id;

    const extendedData: any = {};
    if (args.primary_agent) {
      extendedData.agent_assignment = {
        primary_agent: args.primary_agent,
        agent_variant: args.agent_variant,
        assigned_at: new Date().toISOString(),
        assignment_method: args.assignment_method || "manual",
        availability_checked: true,
        backup_agents: [],
      };
    }

    if (args.pattern_id) {
      extendedData.dna = {
        pattern_id: args.pattern_id,
        pattern_confidence: 0.8,
        agent_interactions: [],
        learned_patterns: [],
      };
    }

    // 2. DNA INJECTION (Add metadata to description context)
    if (args.pattern_id && args.description) {
      // We could update the description here with a footer if the API supports it,
      // or just rely on the badge for now.
    }

    const dnaTracker = getDNATracker();
    if (args.pattern_id) {
      const dna = dnaTracker.getDNA(taskId);
      if (!dna) {
        dnaTracker.recordInteraction(taskId, {
          agent_id: "system",
          action: "task_created",
          duration_ms: 0,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (args.primary_agent) {
      const agentManager = getAgentManager();
      agentManager.incrementTaskCount(args.primary_agent as any);
    }

    return `✅ Task created with extended fields\n\nTask ID: ${taskId}\nTitle: ${data.data.title}\n\nAgent assignment:\n  Primary: ${args.primary_agent || "None"}\n  Variant: ${args.agent_variant || "DEFAULT"}\n  Method: ${args.assignment_method || "manual"}\n\nDNA:\n  Pattern: ${args.pattern_id || "None"}`;
  },
});

export const ecosystem_health = tool({
  description: "Get overall health of the living ecosystem",
  args: {},
  async execute() {
    const agentManager = getAgentManager();
    const councilManager = getCouncilManager();
    const dnaTracker = getDNATracker();

    const activeDecisions = councilManager.getActiveDecisions();
    const patterns = dnaTracker.getAllPatterns();
    const loadStats = agentManager.getLoadStats();
    const availableAgents = agentManager.getAvailableAgents();

    return `🌱 Living Ecosystem Health\n\n🤖 Agents:\n  Available: ${availableAgents.length}\n  Total: ${Object.keys(loadStats).length}\n\n🗳️ Council:\n  Active decisions: ${activeDecisions.length}\n\n🧬 DNA:\n  Learned patterns: ${patterns.length}\n\n📊 Overall: ${availableAgents.length > 0 && patterns.length > 0 ? "✅ Healthy" : "⚠️ Needs attention"}`;
  },
});

/**
 * Orchestrator tools
 */
export const orchestrate_objective = tool({
  description: "Orchestrate a multi-agent workflow from a natural language objective. Decomposes complex tasks into subtasks, assigns agents, and executes the workflow.",
  args: {
    objective: tool.schema.string().describe("The objective to accomplish (e.g. 'Build a REST API with authentication')"),
  },
  async execute(args) {
    const orchestrator = getMaiaOrchestrator();

    try {
      const deliverable = await orchestrator.orchestrate(args.objective);

      return `🎯 Orchestration Complete\n\n**Objective**: ${deliverable.objective}\n\n**Summary**:\n${deliverable.summary}\n\n**Metrics**:\n  Tasks: ${deliverable.metrics.completedTasks}/${deliverable.metrics.totalTasks}\n  Success rate: ${(deliverable.metrics.successRate * 100).toFixed(1)}%\n  Duration: ${(deliverable.metrics.totalDuration / 1000).toFixed(1)}s\n  Agents: ${deliverable.metrics.agentsInvolved.map(a => `@${a}`).join(', ')}\n\n${deliverable.nextActions && deliverable.nextActions.length > 0 ? `**Next Actions**:\n${deliverable.nextActions.map(a => `  - ${a}`).join('\n')}` : ''}`;
    } catch (error) {
      return `❌ Orchestration failed: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
});

export const orchestrate_plan = tool({
  description: "Create an execution plan for an objective without executing it. Returns the plan, subtasks, and agent assignments for review.",
  args: {
    objective: tool.schema.string().describe("The objective to plan"),
  },
  async execute(args) {
    const orchestrator = getMaiaOrchestrator();

    const plan = await orchestrator.createPlan(args.objective);
    const subtasks = await orchestrator.decomposeTasks(plan);
    const assigned = await orchestrator.assignAgents(subtasks);

    const taskList = assigned.map(t =>
      `  - ${t.title} -> @${t.assignedAgent} (${t.assignmentMethod}: ${t.assignmentReason})`
    ).join('\n');

    return `📋 Execution Plan\n\n**Objective**: ${plan.objective}\n**Type**: ${plan.objectiveType}\n**Strategy**: ${plan.strategy}\n**Confidence**: ${(plan.confidence * 100).toFixed(1)}%\n**Reasoning**: ${plan.reasoning}\n\n**Tasks** (${assigned.length}):\n${taskList}`;
  },
});

function _getAgentBadge(agentId: string): string {
  const map: Record<string, string> = {
    maia: "[👑 @maia]",
    sisyphus: "[🛡️ @sisyphus]",
    coder: "[🤖 @coder]",
    ops: "[🔥 @ops]",
    researcher: "[⚡ @researcher]",
    reviewer: "[🧐 @reviewer]",
    giuzu: "[🧠 @giuzu]",
    frontend: "[🎨 @frontend]",
    vision: "[👁️ @vision]",
  };
  return map[agentId] || `[👾 @${agentId}]`;
}
