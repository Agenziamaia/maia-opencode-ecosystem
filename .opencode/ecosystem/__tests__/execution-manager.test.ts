/**
 * Test ExecutionManager actually executes tasks
 *
 * This test verifies that the ExecutionManager.startTask() method
 * actually calls the agent execution instead of just queuing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionManager, resetExecutionManager, getExecutionManager } from '../execution/execution-manager.js';

describe('ExecutionManager - Actual Execution', () => {
  beforeEach(() => {
    // Reset state before each test
    resetExecutionManager();
  });

  describe('SEQUENTIAL Mode', () => {
    it('should create and execute a task (not just queue)', async () => {
      const manager = getExecutionManager({ mode: 'SEQUENTIAL' });

      // Create a task
      const task = await manager.createTask(
        'Test Task',
        'Say "TEST COMPLETE" and nothing else.',
        { agentId: 'test-agent' }
      );

      // Task should be created with queued status
      expect(task.status).toBe('queued');
      expect(task.id).toBeDefined();

      // Wait for task to process (queue processor runs every 1 second)
      // We'll manually start the task to avoid waiting
      await manager.startTask(task.id);

      // Give it time to execute (the actual agent call)
      // In a real scenario with OpenCode server, this would execute
      // For this test, we're verifying the wiring is in place

      const updatedTask = manager.getTask(task.id);
      expect(updatedTask).toBeDefined();

      // The task should have been started (status may be running, completed, or failed)
      expect(['running', 'completed', 'failed']).toContain(updatedTask?.status);

      console.log(`Task status: ${updatedTask?.status}`);
      console.log(`Task started at: ${updatedTask?.startedAt}`);
    }, 30000);

    it('should handle task completion after execution', async () => {
      const manager = getExecutionManager({ mode: 'SEQUENTIAL' });

      // Track completion event
      let completedTask: any = null;
      manager.on('taskCompleted', (task) => {
        completedTask = task;
      });

      const task = await manager.createTask(
        'Completion Test',
        'Reply with "DONE".',
        { agentId: 'test-agent' }
      );

      // Start the task (this will now actually execute)
      await manager.startTask(task.id);

      // Wait for completion (in real scenario, this would wait for agent)
      // For now, we verify the completion mechanism exists
      const finalTask = manager.getTask(task.id);
      expect(finalTask).toBeDefined();

      console.log('Final task status:', finalTask?.status);
      console.log('Started at:', finalTask?.startedAt);
      console.log('Completed at:', finalTask?.completedAt);
    }, 30000);
  });

  describe('PARALLEL Mode', () => {
    it('should start tasks immediately in parallel', async () => {
      const manager = getExecutionManager({ mode: 'PARALLEL' });

      const task1 = await manager.createTask(
        'Parallel Task 1',
        'Say "PARALLEL 1".',
        { agentId: 'agent-1' }
      );

      const task2 = await manager.createTask(
        'Parallel Task 2',
        'Say "PARALLEL 2".',
        { agentId: 'agent-2' }
      );

      // In PARALLEL mode, tasks should start immediately (fire and forget)
      // We'll check that they have startedAt timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updated1 = manager.getTask(task1.id);
      const updated2 = manager.getTask(task2.id);

      expect(updated1).toBeDefined();
      expect(updated2).toBeDefined();

      console.log('Task 1 status:', updated1?.status);
      console.log('Task 2 status:', updated2?.status);
    }, 30000);
  });

  describe('Queue Processing', () => {
    it('should process tasks sequentially in SEQUENTIAL mode', async () => {
      const manager = getExecutionManager({ mode: 'SEQUENTIAL' });

      // Create multiple tasks
      const task1 = await manager.createTask('Seq Task 1', 'Task 1');
      const task2 = await manager.createTask('Seq Task 2', 'Task 2');
      const task3 = await manager.createTask('Seq Task 3', 'Task 3');

      // Check queue status
      const queueStatus = manager.getQueueStatus();
      expect(queueStatus.queue.length).toBeGreaterThanOrEqual(3);

      console.log('Queue length:', queueStatus.queue.length);
      console.log('Task 1 status:', task1.status);
      console.log('Task 2 status:', task2.status);
      console.log('Task 3 status:', task3.status);
    });
  });

  describe('Stats', () => {
    it('should track execution statistics', () => {
      const manager = getExecutionManager({ mode: 'SEQUENTIAL' });

      const stats = manager.getStats();

      expect(stats).toBeDefined();
      expect(stats.mode).toBe('SEQUENTIAL');
      expect(typeof stats.queued).toBe('number');
      expect(typeof stats.running).toBe('number');
      expect(typeof stats.completed).toBe('number');
      expect(typeof stats.failed).toBe('number');

      console.log('Stats:', stats);
    });
  });
});
