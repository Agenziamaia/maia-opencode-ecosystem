#!/usr/bin/env node

/**
 * Living Ecosystem Foundation - Integration Demo
 *
 * This script demonstrates the full ecosystem workflow:
 * 1. Task creation with DNA tracking
 * 2. Agent assignment
 * 3. Council decision
 * 4. Outcome recording and learning
 */

import { getDNATracker } from './dna/dna-tracker';
import { getCouncilManager } from './council/council-manager';
import { getAgentManager } from './agents/agent-manager';

interface DemoConfig {
  taskTitle: string;
  taskDescription: string;
  requireCouncil: boolean;
  agentId?: string;
}

class EcosystemDemo {
  private dnaTracker = getDNATracker();
  private councilManager = getCouncilManager();
  private agentManager = getAgentManager();

  async runDemo(config: DemoConfig) {
    console.log('🌱 Living Ecosystem Foundation - Integration Demo\n');

    const taskId = `demo-${Date.now()}`;

    await this.step1_TaskCreation(taskId, config);
    await this.step2_AgentAssignment(taskId, config);

    if (config.requireCouncil) {
      await this.step3_CouncilDecision(taskId, config);
    }

    await this.step4_ExecuteAndRecord(taskId, config);
    await this.step5_ReportResults(taskId);

    console.log('\n✅ Demo complete!');
  }

  private async step1_TaskCreation(taskId: string, config: DemoConfig) {
    console.log('Step 1: Task Creation');
    console.log(`  Task ID: ${taskId}`);
    console.log(`  Title: ${config.taskTitle}`);
    console.log(`  Description: ${config.taskDescription}\n`);

    this.dnaTracker.recordInteraction(taskId, {
      agent_id: 'system',
      action: 'task_created',
      duration_ms: 0,
      timestamp: new Date().toISOString(),
    });
  }

  private async step2_AgentAssignment(taskId: string, config: DemoConfig) {
    console.log('Step 2: Agent Assignment');

    let assignment;
    if (config.agentId) {
      assignment = this.agentManager.manualAssign(config.agentId as any, ['reviewer']);
      console.log(`  Manual assignment: ${config.agentId}`);
    } else {
      assignment = this.agentManager.autoAssign(config.taskTitle, config.taskDescription);
      console.log(`  Auto assignment: ${assignment?.primary_agent || 'Failed'}`);
    }

    if (assignment) {
      console.log(`  Method: ${assignment.assignment_method}`);
      console.log(`  Availability checked: ${assignment.availability_checked}`);
      console.log(`  Backup agents: ${assignment.backup_agents.join(', ') || 'None'}\n`);

      this.dnaTracker.recordInteraction(taskId, {
        agent_id: assignment.primary_agent,
        action: 'agent_assigned',
        duration_ms: 0,
        timestamp: new Date().toISOString(),
      });

      this.agentManager.incrementTaskCount(assignment.primary_agent as any);
    }
  }

  private async step3_CouncilDecision(taskId: string, config: DemoConfig) {
    console.log('Step 3: Council Decision');

    const decision = this.councilManager.createDecision(
      `Should ${config.agentId || 'an agent'} handle ${config.taskTitle}?`,
      ['maia', 'sisyphus'],
      30000,
      0.6
    );

    console.log(`  Decision ID: ${decision.decision_id}`);
    console.log(`  Proposal: ${decision.proposal}`);
    console.log(`  Status: ${decision.status}\n`);

    this.councilManager.castVote(decision.decision_id, 'maia', 'upvote', 'Task is appropriate for this agent');
    this.councilManager.castVote(decision.decision_id, 'sisyphus', 'upvote', 'Approves assignment');

    await this.sleep(1000);

    const updated = this.councilManager.getDecision(decision.decision_id);
    console.log(`  Final status: ${updated?.status}`);
    console.log(`  Final decision: ${updated?.final_decision || 'Pending'}\n`);

    this.dnaTracker.recordInteraction(taskId, {
      agent_id: 'council',
      action: 'decision_made',
      duration_ms: 1000,
      timestamp: new Date().toISOString(),
    });
  }

  private async step4_ExecuteAndRecord(taskId: string, config: DemoConfig) {
    console.log('Step 4: Execute and Record');

    const startTime = Date.now();

    await this.sleep(2000);

    const duration = Date.now() - startTime;

    this.dnaTracker.recordInteraction(taskId, {
      agent_id: config.agentId || 'coder',
      action: 'task_execution',
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    });

    console.log(`  Execution time: ${duration}ms`);

    this.dnaTracker.recordOutcome(taskId, 'success', {
      completion_time_ms: duration,
      revision_count: 1,
      quality_score: 0.9,
    });

    console.log('  Outcome recorded: success\n');

    const assignment = this.agentManager.autoAssign('', '');
    if (config.agentId) {
      this.agentManager.decrementTaskCount(config.agentId as any);
    }
  }

  private async step5_ReportResults(taskId: string) {
    console.log('Step 5: Results');

    const dna = this.dnaTracker.getDNA(taskId);
    console.log(`  Interactions: ${dna?.agent_interactions.length}`);
    console.log(`  Outcome: ${dna?.outcome}`);
    console.log(`  Learned patterns: ${dna?.learned_patterns.length}\n`);

    const patterns = this.dnaTracker.getAllPatterns();
    console.log(`Total patterns learned: ${patterns.length}\n`);

    const loadStats = this.agentManager.getLoadStats();
    console.log('Agent load statistics:');
    Object.entries(loadStats).forEach(([agentId, stats]) => {
      console.log(`  ${agentId}: ${stats.current}/${stats.max} (${stats.percentage.toFixed(0)}%)`);
    });

    const councilStats = this.councilManager.getAgentStats('maia');
    console.log(`\nCouncil stats for maia:`);
    console.log(`  Total votes: ${councilStats.totalVotes}`);
    console.log(`  Upvotes: ${councilStats.upvotes}`);
    console.log(`  Consensus participation: ${(councilStats.consensusParticipation * 100).toFixed(1)}%`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

async function main() {
  const demo = new EcosystemDemo();

  const config: DemoConfig = {
    taskTitle: 'Implement user authentication',
    taskDescription: 'Build JWT-based authentication system with refresh tokens',
    requireCouncil: true,
    agentId: 'coder',
  };

  try {
    await demo.runDemo(config);
  } catch (error) {
    console.error('Demo failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { EcosystemDemo };
