/**
 * Swarm Intelligence MCP Tools
 *
 * Tools for agents to query and contribute to swarm intelligence.
 */

import { tool } from '@opencode-ai/plugin';
import {
  getSwarmIntelligence,
  type SwarmIntelligence,
  type ComplexityLevel,
  type TaskOutcome,
} from '../swarm-integration.js';

// Get the singleton instance
const getSwarm = (): SwarmIntelligence => {
  return getSwarmIntelligence();
};

/**
 * SWARM_RECOMMEND: Get agent recommendation for a task
 */
export const swarm_recommend = tool({
  description: 'Get swarm intelligence recommendation for which agent should handle a task based on past successes.',
  args: {
    task: tool.schema.string().describe('The task description to get a recommendation for'),
  },
  async execute(args) {
    try {
      const swarm = getSwarm();
      const rec = await swarm.directRecommend(args.task);

      return `🐝 SWARM RECOMMENDATION for "${args.task}":

Category: ${rec.category}
Top Agent: @${rec.topAgent}
Confidence: ${(rec.confidence * 100).toFixed(1)}%

Alternative Agents: ${rec.alternativeAgents.map(a => '@' + a).join(', ') || 'None'}

Reasoning: ${rec.reasoning}

${rec.confidence > 0.7
  ? '✅ High confidence recommendation based on swarm knowledge.'
  : '⚠️ Moderate confidence - consider alternatives based on task specifics.'}`;
    } catch (e: any) {
      return `❌ Swarm recommendation failed: ${e.message}`;
    }
  }
});

/**
 * SWARM_QUERY: Query similar past tasks
 */
export const swarm_query = tool({
  description: 'Query swarm intelligence for similar past tasks and their outcomes.',
  args: {
    pattern: tool.schema.string().describe('The pattern or task description to search for'),
    limit: tool.schema.number().optional().describe('Maximum number of results (default: 5)'),
  },
  async execute(args) {
    try {
      const swarm = getSwarm();
      const result = await swarm.query(args.pattern, args.limit || 5);

      if (result.matches === 0) {
        return `🐝 SWARM QUERY: No similar patterns found for "${args.pattern}"\n\nTry learning from tasks by using swarm_learn after completion.`;
      }

      let output = `🐝 SWARM QUERY: Found ${result.matches} similar pattern(s) for "${args.pattern}"\n\n`;

      for (const match of result.results) {
        output += `Similarity: ${(match.similarity * 100).toFixed(1)}%\n`;
        output += `Task: ${match.description}\n`;
        output += `Category: ${match.category}\n`;
        output += `Success Rate: ${(match.success_rate * 100).toFixed(1)}%\n`;
        output += `Agents: ${match.recommended_agents.map(a => '@' + a).join(', ')}\n`;
        output += `Complexity: ${match.complexity}\n\n`;
      }

      return output;
    } catch (e: any) {
      return `❌ Swarm query failed: ${e.message}`;
    }
  }
});

/**
 * SWARM_LEARN: Record task outcome for collective learning
 */
export const swarm_learn = tool({
  description: 'Teach the swarm about a completed task so it can learn and improve future recommendations.',
  args: {
    task: tool.schema.string().describe('The task description that was completed'),
    agent: tool.schema.string().describe('The agent that performed the task (e.g., coder, researcher)'),
    outcome: tool.schema.string().describe('The outcome: success, failure, or partial'),
    complexity: tool.schema.string().optional().describe('Task complexity: low, medium, or high (default: medium)'),
    duration_ms: tool.schema.number().optional().describe('Task duration in milliseconds'),
  },
  async execute(args) {
    const validOutcomes = ['success', 'failure', 'partial'];
    const validComplexities = ['low', 'medium', 'high'];

    if (!validOutcomes.includes(args.outcome)) {
      return `❌ Invalid outcome "${args.outcome}". Must be one of: ${validOutcomes.join(', ')}`;
    }

    if (args.complexity && !validComplexities.includes(args.complexity)) {
      return `❌ Invalid complexity "${args.complexity}". Must be one of: ${validComplexities.join(', ')}`;
    }

    try {
      const swarm = getSwarm();
      await swarm.learn(
        args.task,
        args.agent,
        args.outcome as TaskOutcome,
        {
          complexity: args.complexity as ComplexityLevel || 'medium',
          durationMs: args.duration_ms,
        }
      );

      return `✅ SWARM LEARNING: Recorded task outcome

Task: ${args.task}
Agent: @${args.agent}
Outcome: ${args.outcome}
Complexity: ${args.complexity || 'medium'}
${args.duration_ms ? `Duration: ${args.duration_ms}ms` : ''}

The swarm will use this knowledge to improve future recommendations.`;
    } catch (e: any) {
      return `❌ Swarm learning failed: ${e.message}`;
    }
  }
});

/**
 * SWARM_COUNCIL: Get council recommendation for complex tasks
 */
export const swarm_council = tool({
  description: 'Get recommendation for which agents should form a council for a complex decision or task.',
  args: {
    task: tool.schema.string().describe('The complex task or decision description'),
    complexity: tool.schema.string().optional().describe('Task complexity: low, medium, or high (default: medium)'),
  },
  async execute(args) {
    try {
      const swarm = getSwarm();
      const result = await swarm.getCouncilRecommendation(
        args.task,
        (args.complexity as ComplexityLevel) || 'medium'
      );

      return `🏛️ SWARM COUNCIL RECOMMENDATION for "${args.task}":

Task Category: ${result.council_recommendation.task_category}
Complexity: ${result.council_recommendation.complexity}

Recommended Council (${result.council_recommendation.recommended_council.length} members):
${result.council_recommendation.recommended_council.map(a => '  • @' + a).join('\n')}

Rationale: ${result.council_recommendation.rationale}`;
    } catch (e: any) {
      return `❌ Council recommendation failed: ${e.message}`;
    }
  }
});

/**
 * SWARM_STATS: Show swarm statistics and insights
 */
export const swarm_stats = tool({
  description: 'Show swarm intelligence statistics including patterns learned, agent success rates, and collective insights.',
  args: {},
  async execute() {
    try {
      const swarm = getSwarm();
      const stats = await swarm.getStats();

      let output = `🐝 SWARM INTELLIGENCE STATISTICS

=== COLLECTIVE INSIGHTS ===
Total Patterns Learned: ${stats.insights.total_patterns}
Total Tasks Recorded: ${stats.insights.total_tasks}

=== CATEGORY SUCCESS RATES ===
`;

      if (Object.keys(stats.insights.category_success_rate).length === 0) {
        output += `No category data yet.\n`;
      } else {
        for (const [cat, rate] of Object.entries(stats.insights.category_success_rate)) {
          output += `${cat}: ${(rate * 100).toFixed(1)}%\n`;
        }
      }

      output += `
=== AGENT SUCCESS RATES ===
`;

      if (Object.keys(stats.insights.agent_success_rate).length === 0) {
        output += `No agent data yet.\n`;
      } else {
        for (const [agent, rate] of Object.entries(stats.insights.agent_success_rate)) {
          output += `@${agent}: ${(rate * 100).toFixed(1)}%\n`;
        }
      }

      output += `
=== COMPLEXITY DISTRIBUTION ===
`;

      if (Object.keys(stats.insights.complexity_distribution).length === 0) {
        output += `No complexity data yet.\n`;
      } else {
        for (const [comp, count] of Object.entries(stats.insights.complexity_distribution)) {
          output += `${comp}: ${count} task(s)\n`;
        }
      }

      if (stats.recent_patterns.length > 0) {
        output += `
=== RECENT PATTERNS ===
`;
        for (const pattern of stats.recent_patterns) {
          output += `• ${pattern.id}: ${pattern.category} (@${pattern.agents.join(', @')}) - ${(pattern.success_rate * 100).toFixed(1)}% success\n`;
        }
      }

      return output;
    } catch (e: any) {
      return `❌ Stats retrieval failed: ${e.message}`;
    }
  }
});

/**
 * SWARM_BATCH_LEARN: Learn from multiple tasks at once
 */
export const swarm_batch_learn = tool({
  description: 'Teach the swarm from multiple completed tasks at once for faster learning.',
  args: {
    tasks: tool.schema.string().describe('JSON array of task outcomes: [{"task":"...", "agent":"...", "outcome":"..."}]'),
  },
  async execute(args) {
    try {
      const tasks = JSON.parse(args.tasks);

      if (!Array.isArray(tasks)) {
        return '❌ Input must be a JSON array of task objects.';
      }

      const swarm = getSwarm();
      const results = await swarm.batchLearn(tasks);

      const success = results.filter(r => r.status === 'success').length;
      const failure = results.filter(r => r.status === 'error').length;

      return `✅ SWARM BATCH LEARNING: Complete

Processed: ${results.length} task(s)
Succeeded: ${success}
Failed: ${failure}

The swarm will use this knowledge to improve future recommendations.`;
    } catch (e: any) {
      return `❌ Batch learning failed: ${e.message}`;
    }
  }
});

// Export all tools
export const swarmTools = {
  swarm_recommend,
  swarm_query,
  swarm_learn,
  swarm_council,
  swarm_stats,
  swarm_batch_learn,
};

export default swarmTools;
