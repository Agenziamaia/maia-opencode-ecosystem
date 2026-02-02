import { NextRequest, NextResponse } from 'next/server';
import { getAgentManager } from '../../../../../../.opencode/ecosystem/agents/agent-manager.js';
import { getExecutionManager } from '../../../../../../.opencode/ecosystem/execution/execution-manager.js';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Get real agent data from ecosystem
 */
export async function GET(request: NextRequest) {
  try {
    // Get agents from the agent manager
    const agentManager = getAgentManager();
    const executionManager = getExecutionManager();

    // Get base agent data
    const agents = agentManager.getAllAgents();

    // Enhance with real-time data from execution manager
    const execStats = executionManager.getStats();
    const taskQueue = executionManager.getQueue();

    // Count current tasks per agent from the actual queue
    const agentTaskCounts = new Map<string, number>();
    for (const task of taskQueue) {
      if (task.agentId) {
        agentTaskCounts.set(task.agentId, (agentTaskCounts.get(task.agentId) || 0) + 1);
      }
    }

    // Merge real-time data with agent capabilities
    const enrichedAgents = agents.map(agent => {
      const currentTasks = agentTaskCounts.get(agent.id) || 0;
      const utilization = currentTasks / agent.maxTasks;

      // Determine status based on utilization and availability
      let status: 'healthy' | 'busy' | 'idle' | 'unavailable';
      if (!agent.available) {
        status = 'unavailable';
      } else if (utilization >= 0.8) {
        status = 'busy';
      } else if (currentTasks === 0) {
        status = 'idle';
      } else {
        status = 'healthy';
      }

      return {
        ...agent,
        currentTasks,
        status,
        utilization: Math.round(utilization * 100) / 100,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedAgents,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent data',
        error_data: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
