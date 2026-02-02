import { NextRequest, NextResponse } from 'next/server';
import { getDNATracker } from '../../../../../../.opencode/ecosystem/dna/dna-tracker.js';
import { getEnhancedCouncil } from '../../../../../../.opencode/ecosystem/council/enhanced-council.js';
import { getExecutionManager } from '../../../../../../.opencode/ecosystem/execution/execution-manager.js';
import { getMemoryStore } from '../../../../../../.opencode/memory/memory-store.js';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Count agent .md files in the ecosystem
 */
async function countAgentFiles(): Promise<{ available: number; total: number }> {
  try {
    const agentsDir = join(process.cwd(), '.opencode', 'agents');
    const files = await fs.readdir(agentsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    // Count available agents as those with complete profiles
    let available = 0;
    for (const file of mdFiles) {
      const content = await fs.readFile(join(agentsDir, file), 'utf-8');
      // Simple heuristic: agent has at least 2 sections (name + capabilities)
      const sections = content.split('##').length - 1;
      if (sections >= 2) available++;
    }

    return { available, total: mdFiles.length };
  } catch {
    return { available: 0, total: 0 };
  }
}

/**
 * Get real ecosystem health from actual system state
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch real data from ecosystem components
    const [agentCounts, dna, council, execution, memory] = await Promise.all([
      countAgentFiles(),
      Promise.resolve(getDNATracker()),
      Promise.resolve(getEnhancedCouncil()),
      Promise.resolve(getExecutionManager()),
      Promise.resolve(getMemoryStore()),
    ]);

    const patterns = dna.getAllPatterns();
    const activeProposals = council.getActiveProposals();
    const execStats = execution.getStats();
    const memoryStats = memory.getStats();

    // Determine overall health based on system state
    const queuedTasks = execStats.queued;
    const runningTasks = execStats.running;
    const failedTasks = execStats.failed;

    let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (failedTasks > 5 || queuedTasks > 50) {
      overall = 'critical';
    } else if (failedTasks > 2 || queuedTasks > 20) {
      overall = 'degraded';
    }

    const health = {
      agents: {
        available: agentCounts.available,
        total: agentCounts.total,
        running: runningTasks,
        queued: queuedTasks,
      },
      council: {
        activeDecisions: activeProposals.length,
        totalProposals: council.getAllDecisions().length,
      },
      dna: {
        learnedPatterns: patterns.length,
        taskHistory: dna.getTaskHistory().length,
      },
      memory: {
        totalMemories: memoryStats.total,
        byType: memoryStats.byType,
        topTags: memoryStats.topTags.slice(0, 5),
      },
      execution: {
        completed: execStats.completed,
        failed: execStats.failed,
        totalProcessed: execStats.totalProcessed,
        mode: execStats.mode,
      },
      overall,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ecosystem health',
        error_data: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
