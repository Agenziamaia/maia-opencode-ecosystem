/**
 * Execution Manager Demo
 *
 * Demonstrates the execution manager functionality for OpenCode GitHub issue #6470:
 * https://github.com/anomalyco/opencode/issues/6470
 *
 * Usage:
 *   bun run demo.ts
 */

import {
  getExecutionManager,
  ExecutionMode,
  TaskPriority,
} from './execution-manager.js';

/**
 * Demo 1: Sequential Execution Mode
 */
async function demoSequentialMode() {
  console.log('\n=== Demo 1: Sequential Execution Mode ===\n');

  const manager = getExecutionManager({ mode: 'SEQUENTIAL' });
  manager.reset();

  console.log(`Current mode: ${manager.getMode()}`);
  console.log('\nCreating 3 tasks...');

  const task1 = await manager.createTask('Fix login bug', 'Fix authentication issue on login page', {
    agentId: 'coder',
    priority: 'urgent',
    files: ['src/auth/login.ts', 'src/auth/utils.ts'],
  });

  const task2 = await manager.createTask('Add user profile', 'Implement user profile page', {
    agentId: 'frontend',
    priority: 'high',
    files: ['src/components/Profile.tsx', 'src/pages/profile.tsx'],
  });

  const task3 = await manager.createTask('Write tests', 'Add unit tests for auth module', {
    agentId: 'coder',
    priority: 'normal',
    files: ['src/auth/login.test.ts', 'src/auth/utils.test.ts'],
  });

  console.log(`\nCreated tasks: ${task1.id}, ${task2.id}, ${task3.id}`);

  // Check queue status
  const queueStatus = manager.getQueueStatus();
  console.log(`\nQueue size: ${queueStatus.queue.length}`);

  // Get statistics
  const stats = manager.getStats();
  console.log(`\nStats:`, stats);

  // Simulate starting the first task
  console.log('\n--- Starting first task ---');
  await manager.startTask(task1.id);

  const updatedTask1 = manager.getTask(task1.id);
  console.log(`Task 1 status: ${updatedTask1?.status}`);

  // Complete the first task
  console.log('\n--- Completing first task ---');
  await manager.completeTask(task1.id, true);

  const completedTask1 = manager.getTask(task1.id);
  console.log(`Task 1 final status: ${completedTask1?.status}`);

  // The next task should start automatically in sequential mode
  await new Promise(resolve => setTimeout(resolve, 1100));
  const runningTasks = manager.getTasksByStatus('running');
  console.log(`\nNext task started automatically: ${runningTasks[0]?.id}`);
}

/**
 * Demo 2: Parallel Execution Mode
 */
async function demoParallelMode() {
  console.log('\n=== Demo 2: Parallel Execution Mode ===\n');

  const manager = getExecutionManager();
  manager.setMode('PARALLEL');
  manager.reset();

  console.log(`Current mode: ${manager.getMode()}`);
  console.log('\nCreating 3 tasks for parallel execution...');

  const task1 = await manager.createTask('Fix API endpoint', 'Fix /api/users endpoint', {
    agentId: 'coder',
    priority: 'high',
    files: ['src/api/users.ts'],
  });

  const task2 = await manager.createTask('Update dashboard', 'Add new widgets to dashboard', {
    agentId: 'frontend',
    priority: 'normal',
    files: ['src/pages/Dashboard.tsx'],
  });

  const task3 = await manager.createTask('Optimize database', 'Add indexes to users table', {
    agentId: 'ops',
    priority: 'low',
    files: ['migrations/002_add_indexes.sql'],
  });

  console.log(`\nCreated tasks: ${task1.id}, ${task2.id}, ${task3.id}`);

  // Check if worktrees were created
  console.log('\n--- Task worktrees ---');
  console.log(`Task 1 worktree: ${task1.worktreePath || 'None'}`);
  console.log(`Task 2 worktree: ${task2.worktreePath || 'None'}`);
  console.log(`Task 3 worktree: ${task3.worktreePath || 'None'}`);

  // Start all tasks in parallel
  console.log('\n--- Starting all tasks in parallel ---');
  await manager.startTask(task1.id);
  await manager.startTask(task2.id);
  await manager.startTask(task3.id);

  const runningTasks = manager.getTasksByStatus('running');
  console.log(`\nRunning tasks: ${runningTasks.length}`);
  runningTasks.forEach(t => {
    console.log(`  - ${t.id}: ${t.title} (${t.agentId})`);
  });

  // Complete tasks
  console.log('\n--- Completing tasks ---');
  await manager.completeTask(task1.id, true);
  await manager.completeTask(task2.id, true);
  await manager.completeTask(task3.id, true);

  const finalStats = manager.getStats();
  console.log(`\nFinal stats:`, finalStats);
}

/**
 * Demo 3: Collision Detection
 */
async function demoCollisionDetection() {
  console.log('\n=== Demo 3: Collision Detection ===\n');

  const manager = getExecutionManager();
  manager.setMode('SEQUENTIAL');
  manager.reset();

  console.log('Creating tasks with overlapping files...');

  const task1 = await manager.createTask('Update auth service', 'Add OAuth support', {
    agentId: 'coder',
    priority: 'high',
    files: ['src/auth/service.ts'],
  });

  const task2 = await manager.createTask('Fix auth bug', 'Fix token refresh issue', {
    agentId: 'coder',
    priority: 'urgent',
    files: ['src/auth/service.ts', 'src/auth/tokens.ts'],
  });

  // Start first task (locks the file)
  await manager.startTask(task1.id);
  console.log(`\nStarted task 1 (locks: ${task1.files?.join(', ')})`);

  // Check for collisions for task 2
  const collision = manager.checkCollisions(task2.id, task2.files || []);
  console.log(`\nCollision check for task 2:`);
  console.log(`  Has collision: ${collision.hasCollision}`);
  console.log(`  Conflicting agents: ${collision.conflictingAgents?.join(', ') || 'None'}`);
  console.log(`  Conflicting files: ${collision.conflictingFiles?.join(', ') || 'None'}`);

  // Try to start task 2 (should fail due to collision)
  const canStart = await manager.startTask(task2.id);
  console.log(`\nCan start task 2: ${canStart}`);

  if (!canStart) {
    const failedTask = manager.getTask(task2.id);
    console.log(`Task 2 error: ${failedTask?.error}`);
  }

  // Complete task 1 and retry task 2
  await manager.completeTask(task1.id, true);
  console.log('\nTask 1 completed, releasing locks...');

  // Now task 2 should be able to start
  manager.reset();
  const task3 = await manager.createTask('Fix auth bug again', 'Fix token refresh issue', {
    agentId: 'coder',
    priority: 'urgent',
    files: ['src/auth/service.ts'],
  });

  const canStartNow = await manager.startTask(task3.id);
  console.log(`Can start task 3 after cleanup: ${canStartNow}`);
}

/**
 * Demo 4: Dynamic Mode Switching
 */
async function demoModeSwitching() {
  console.log('\n=== Demo 4: Dynamic Mode Switching ===\n');

  const manager = getExecutionManager();
  manager.reset();

  console.log(`Initial mode: ${manager.getMode()}`);

  // Create some tasks in sequential mode
  const task1 = await manager.createTask('Task A', 'Description A', { agentId: 'coder' });
  const task2 = await manager.createTask('Task B', 'Description B', { agentId: 'frontend' });

  console.log(`\nCreated tasks in ${manager.getMode()} mode`);
  console.log(`Queue size: ${manager.getQueueStatus().queue.length}`);

  // Switch to parallel mode
  console.log('\n--- Switching to PARALLEL mode ---');
  manager.setMode('PARALLEL');
  console.log(`Current mode: ${manager.getMode()}`);

  // Create more tasks in parallel mode
  const task3 = await manager.createTask('Task C', 'Description C', { agentId: 'ops' });
  const task4 = await manager.createTask('Task D', 'Description D', { agentId: 'researcher' });

  console.log(`\nCreated tasks in ${manager.getMode()} mode`);
  console.log(`Task 3 worktree: ${task3.worktreePath || 'None'}`);
  console.log(`Task 4 worktree: ${task4.worktreePath || 'None'}`);

  // Switch back to sequential
  console.log('\n--- Switching back to SEQUENTIAL mode ---');
  manager.setMode('SEQUENTIAL');
  console.log(`Current mode: ${manager.getMode()}`);
}

/**
 * Demo 5: Agent Workload
 */
async function demoAgentWorkload() {
  console.log('\n=== Demo 5: Agent Workload ===\n');

  const manager = getExecutionManager();
  manager.reset();
  manager.setMode('SEQUENTIAL');

  console.log('Creating tasks for different agents...');

  const tasks = [
    await manager.createTask('Backend task 1', 'API endpoint', { agentId: 'coder', priority: 'high' }),
    await manager.createTask('Backend task 2', 'Database migration', { agentId: 'ops', priority: 'normal' }),
    await manager.createTask('Backend task 3', 'Bug fix', { agentId: 'coder', priority: 'urgent' }),
    await manager.createTask('Frontend task 1', 'UI component', { agentId: 'frontend', priority: 'normal' }),
    await manager.createTask('Frontend task 2', 'Page layout', { agentId: 'frontend', priority: 'low' }),
    await manager.createTask('Research task 1', 'Documentation', { agentId: 'researcher', priority: 'normal' }),
  ];

  console.log(`\nCreated ${tasks.length} tasks`);

  // Start one task
  await manager.startTask(tasks[0].id);

  // Show agent workload
  console.log('\n--- Agent Workload ---');
  for (const agent of ['coder', 'frontend', 'ops', 'researcher']) {
    const agentTasks = manager.getTasksForAgent(agent);
    console.log(`\n${agent}:`);
    console.log(`  Total tasks: ${agentTasks.length}`);
    console.log(`  Queued: ${agentTasks.filter(t => t.status === 'queued').length}`);
    console.log(`  Running: ${agentTasks.filter(t => t.status === 'running').length}`);
  }
}

/**
 * Demo 6: Statistics and Cleanup
 */
async function demoStatistics() {
  console.log('\n=== Demo 6: Statistics and Cleanup ===\n');

  const manager = getExecutionManager();
  manager.reset();

  console.log('Creating and completing tasks...');

  const task1 = await manager.createTask('Task 1', 'Description 1', { agentId: 'coder' });
  await manager.startTask(task1.id);
  await manager.completeTask(task1.id, true);

  const task2 = await manager.createTask('Task 2', 'Description 2', { agentId: 'frontend' });
  await manager.startTask(task2.id);
  await manager.completeTask(task2.id, false, 'Simulated failure');

  const task3 = await manager.createTask('Task 3', 'Description 3', { agentId: 'ops' });
  await manager.startTask(task3.id);
  await manager.completeTask(task3.id, true);

  console.log('\n--- Execution Statistics ---');
  const stats = manager.getStats();
  console.log(JSON.stringify(stats, null, 2));

  console.log('\n--- All Tasks ---');
  const allTasks = manager.getAllTasks();
  allTasks.forEach(t => {
    console.log(`  ${t.id}: ${t.title} - ${t.status}`);
  });

  console.log('\n--- Cleanup (removing completed tasks) ---');
  const cleaned = manager.cleanup(0); // Remove all completed tasks
  console.log(`Cleaned up ${cleaned} tasks`);

  console.log('\n--- Tasks after cleanup ---');
  const remainingTasks = manager.getAllTasks();
  remainingTasks.forEach(t => {
    console.log(`  ${t.id}: ${t.title} - ${t.status}`);
  });
}

/**
 * Main demo runner
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   OpenCode Execution Manager Demo                          ║');
  console.log('║   GitHub Issue #6470: Sequential vs Parallel Execution     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  try {
    await demoSequentialMode();
    await demoParallelMode();
    await demoCollisionDetection();
    await demoModeSwitching();
    await demoAgentWorkload();
    await demoStatistics();

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║   Demo Complete!                                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run the demo
main();
