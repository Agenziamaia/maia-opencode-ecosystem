/**
 * MCP Tools for Execution Manager
 *
 * Provides MCP server tools for interacting with the execution manager.
 * Integrates with the existing ecosystem tool pattern.
 */

import { tool } from "@opencode-ai/plugin";
import {
  getExecutionManager,
  ExecutionMode,
  TaskPriority,
  TaskStatus,
  ExecutionTask,
} from "./execution-manager.js";

/**
 * Get the current execution mode
 */
export const exec_get_mode = tool({
  description: "Get the current execution mode (PARALLEL or SEQUENTIAL)",
  args: {},
  async execute() {
    const manager = getExecutionManager();
    const mode = manager.getMode();

    return `Execution Mode: ${mode}\n\n${mode === 'PARALLEL'
      ? 'Parallel execution enabled. Agents work in isolated git worktrees simultaneously.'
      : 'Sequential execution enabled. Tasks are queued and processed one at a time.'
      }`;
  },
});

/**
 * Set the execution mode
 */
export const exec_set_mode = tool({
  description: "Set the execution mode (PARALLEL or SEQUENTIAL)",
  args: {
    mode: tool.schema.enum(["PARALLEL", "SEQUENTIAL"]).describe("Execution mode to set"),
  },
  async execute(args) {
    const manager = getExecutionManager();
    manager.setMode(args.mode as ExecutionMode);

    return `Execution mode changed to: ${args.mode}\n\n${args.mode === 'PARALLEL'
      ? 'Agents will now work in isolated git worktrees simultaneously.'
      : 'Tasks will now be queued and processed one at a time.'
      }`;
  },
});

/**
 * Create a new execution task
 */
export const exec_create_task = tool({
  description: "Create a new execution task",
  args: {
    title: tool.schema.string().describe("Task title"),
    description: tool.schema.string().describe("Task description"),
    agent_id: tool.schema.string().optional().describe("Agent ID to assign"),
    priority: tool.schema.enum(["low", "normal", "high", "urgent"]).optional().describe("Task priority"),
    files: tool.schema.array(tool.schema.string()).optional().describe("List of files this task will work on"),
    metadata_json: tool.schema.string().optional().describe("Additional metadata as JSON string"),
  },
  async execute(args) {
    const manager = getExecutionManager();

    let metadata: Record<string, any> | undefined;
    if (args.metadata_json) {
      try {
        metadata = JSON.parse(args.metadata_json);
      } catch {
        return "Error: Invalid JSON in metadata_json";
      }
    }

    const task = await manager.createTask(
      args.title,
      args.description,
      {
        agentId: args.agent_id,
        priority: args.priority as TaskPriority,
        files: args.files,
        metadata,
      }
    );

    const worktreeInfo = task.worktreePath
      ? `\nWorktree: ${task.worktreePath}`
      : '';

    return `Task created successfully\n\nID: ${task.id}\nTitle: ${task.title}\nDescription: ${task.description}\nStatus: ${task.status}\nPriority: ${task.priority}\nAgent: ${task.agentId || 'Unassigned'}\nCreated: ${task.createdAt}${worktreeInfo}`;
  },
});

/**
 * Start a task
 */
export const exec_start_task = tool({
  description: "Start executing a task",
  args: {
    task_id: tool.schema.string().describe("Task ID to start"),
  },
  async execute(args) {
    const manager = getExecutionManager();
    const success = await manager.startTask(args.task_id);

    if (!success) {
      const task = manager.getTask(args.task_id);
      if (task?.error) {
        return `Failed to start task: ${task.error}`;
      }
      return `Failed to start task: ${args.task_id}`;
    }

    const task = manager.getTask(args.task_id);
    return `Task started\n\nID: ${task?.id}\nStatus: ${task?.status}\nStarted at: ${task?.startedAt}\nWorktree: ${task?.worktreePath || 'N/A'}`;
  },
});

/**
 * Complete a task
 */
export const exec_complete_task = tool({
  description: "Mark a task as completed or failed",
  args: {
    task_id: tool.schema.string().describe("Task ID to complete"),
    success: tool.schema.boolean().optional().describe("Whether the task succeeded (default: true)"),
    error: tool.schema.string().optional().describe("Error message if failed"),
  },
  async execute(args) {
    const manager = getExecutionManager();
    await manager.completeTask(args.task_id, args.success !== false, args.error);

    const task = manager.getTask(args.task_id);

    return `Task completed\n\nID: ${task?.id}\nStatus: ${task?.status}\nCompleted at: ${task?.completedAt}${task?.error ? `\nError: ${task.error}` : ''}`;
  },
});

/**
 * Cancel a task
 */
export const exec_cancel_task = tool({
  description: "Cancel a task",
  args: {
    task_id: tool.schema.string().describe("Task ID to cancel"),
  },
  async execute(args) {
    const manager = getExecutionManager();
    const success = await manager.cancelTask(args.task_id);

    if (!success) {
      return `Failed to cancel task: ${args.task_id} (not found)`;
    }

    const task = manager.getTask(args.task_id);
    return `Task cancelled\n\nID: ${task?.id}\nStatus: ${task?.status}`;
  },
});

/**
 * Get task details
 */
export const exec_get_task = tool({
  description: "Get details of a specific task",
  args: {
    task_id: tool.schema.string().describe("Task ID to retrieve"),
  },
  async execute(args) {
    const manager = getExecutionManager();
    const task = manager.getTask(args.task_id);

    if (!task) {
      return `Task not found: ${args.task_id}`;
    }

    return `Task Details\n\nID: ${task.id}\nTitle: ${task.title}\nDescription: ${task.description}\nStatus: ${task.status}\nPriority: ${task.priority}\nAgent: ${task.agentId || 'Unassigned'}\nFiles: ${task.files?.join(', ') || 'None'}\nWorktree: ${task.worktreePath || 'N/A'}\nCreated: ${task.createdAt}\nStarted: ${task.startedAt || 'Not started'}\nCompleted: ${task.completedAt || 'Not completed'}${task.error ? `\nError: ${task.error}` : ''}${task.metadata ? `\nMetadata: ${JSON.stringify(task.metadata, null, 2)}` : ''}`;
  },
});

/**
 * List all tasks
 */
export const exec_list_tasks = tool({
  description: "List all tasks, optionally filtered by status",
  args: {
    status: tool.schema.enum(["queued", "running", "completed", "failed", "cancelled"]).optional().describe("Filter by status"),
    agent_id: tool.schema.string().optional().describe("Filter by agent ID"),
  },
  async execute(args) {
    const manager = getExecutionManager();

    let tasks: ExecutionTask[];

    if (args.status) {
      tasks = manager.getTasksByStatus(args.status as TaskStatus);
    } else if (args.agent_id) {
      tasks = manager.getTasksForAgent(args.agent_id);
    } else {
      tasks = manager.getAllTasks();
    }

    if (tasks.length === 0) {
      return args.status
        ? `No tasks with status: ${args.status}`
        : args.agent_id
          ? `No tasks for agent: ${args.agent_id}`
          : "No tasks found";
    }

    const statusEmoji: Record<TaskStatus, string> = {
      queued: "🕐",
      running: "▶️",
      completed: "✅",
      failed: "❌",
      cancelled: "🚫",
    };

    return tasks
      .map((t) =>
        `${statusEmoji[t.status]} ${t.id}\n  Title: ${t.title}\n  Status: ${t.status}\n  Agent: ${t.agentId || 'Unassigned'}\n  Priority: ${t.priority}`
      )
      .join("\n\n");
  },
});

/**
 * Get queue status (for sequential mode)
 */
export const exec_get_queue = tool({
  description: "Get the current task queue status",
  args: {},
  async execute(args) {
    const manager = getExecutionManager();
    const queueStatus = manager.getQueueStatus();

    if (queueStatus.queue.length === 0) {
      return "Queue is empty";
    }

    const priorityEmoji: Record<TaskPriority, string> = {
      urgent: "🔴",
      high: "🟠",
      normal: "🟡",
      low: "🟢",
    };

    return `Task Queue (${queueStatus.queue.length} tasks)\n\n` +
      queueStatus.queue
        .map((item, index) =>
          `${index + 1}. ${priorityEmoji[item.task.priority]} ${item.task.id}\n   Title: ${item.task.title}\n   Priority: ${item.task.priority}\n   Agent: ${item.task.agentId || 'Unassigned'}\n   Enqueued: ${item.enqueuedAt}`
        )
        .join("\n\n");
  },
});

/**
 * Get execution statistics
 */
export const exec_get_stats = tool({
  description: "Get execution statistics",
  args: {},
  async execute() {
    const manager = getExecutionManager();
    const stats = manager.getStats();

    return `Execution Statistics\n\nMode: ${stats.mode}\n\nQueue:\n  Queued: ${stats.queued}\n  Running: ${stats.running}\n  Completed: ${stats.completed}\n  Failed: ${stats.failed}\n  Total processed: ${stats.totalProcessed}${stats.avgExecutionTime ? `\n\nAvg execution time: ${(stats.avgExecutionTime / 1000).toFixed(2)}s` : ''}`;
  },
});

/**
 * Check for file collisions
 */
export const exec_check_collisions = tool({
  description: "Check if working on specified files would cause collisions",
  args: {
    task_id: tool.schema.string().describe("Task ID (for reference, doesn't affect check)"),
    files: tool.schema.array(tool.schema.string()).describe("List of files to check"),
  },
  async execute(args) {
    const manager = getExecutionManager();
    const collision = manager.checkCollisions(args.task_id, args.files);

    if (!collision.hasCollision) {
      return `No collisions detected for files:\n  ${args.files.join('\n  ')}`;
    }

    return `⚠️ COLLISION DETECTED\n\nConflicting agents: ${collision.conflictingAgents?.join(', ') || 'None'}\nConflicting files: ${collision.conflictingFiles?.join(', ') || 'None'}`;
  },
});

/**
 * Cleanup old completed tasks
 */
export const exec_cleanup = tool({
  description: "Remove old completed tasks from memory",
  args: {
    older_than_hours: tool.schema.number().optional().describe("Remove tasks completed more than this many hours ago (default: 24)"),
  },
  async execute(args) {
    const manager = getExecutionManager();
    const cleaned = manager.cleanup(args.older_than_hours || 24);

    return `Cleaned up ${cleaned} old task(s)`;
  },
});

/**
 * Reset the execution manager
 */
export const exec_reset = tool({
  description: "Reset the execution manager (clears all tasks and state)",
  args: {
    confirm: tool.schema.boolean().describe("Must be true to confirm reset"),
  },
  async execute(args) {
    if (!args.confirm) {
      return "Reset cancelled. Set confirm to true to proceed.";
    }

    const manager = getExecutionManager();
    manager.reset();

    return "Execution manager reset complete";
  },
});

/**
 * Get execution manager status summary
 */
export const exec_status = tool({
  description: "Get a comprehensive status summary of the execution manager",
  args: {},
  async execute() {
    const manager = getExecutionManager();
    const stats = manager.getStats();
    const mode = manager.getMode();

    const queueStatus = manager.getQueueStatus();

    let summary = `Execution Manager Status\n`;
    summary += `========================\n\n`;
    summary += `Mode: ${mode === 'PARALLEL' ? '⚡ PARALLEL' : '📋 SEQUENTIAL'}\n\n`;

    summary += `Statistics:\n`;
    summary += `  Queued: ${stats.queued}\n`;
    summary += `  Running: ${stats.running}\n`;
    summary += `  Completed: ${stats.completed}\n`;
    summary += `  Failed: ${stats.failed}\n`;
    summary += `  Total processed: ${stats.totalProcessed}\n`;
    if (stats.avgExecutionTime) {
      summary += `  Avg execution time: ${(stats.avgExecutionTime / 1000).toFixed(2)}s\n`;
    }

    // Get running tasks
    const runningTasks = manager.getTasksByStatus('running');
    if (runningTasks.length > 0) {
      summary += `\nRunning Tasks:\n`;
      runningTasks.forEach(t => {
        summary += `  ▶️ ${t.id}: ${t.title}\n`;
        summary += `     Agent: ${t.agentId || 'Unassigned'}\n`;
        summary += `     Started: ${t.startedAt || 'Unknown'}\n`;
        if (t.worktreePath) {
          summary += `     Worktree: ${t.worktreePath}\n`;
        }
      });
    }

    // Get queue (for sequential mode)
    if (mode === 'SEQUENTIAL' && queueStatus.queue.length > 0) {
      summary += `\nNext in Queue:\n`;
      const nextTasks = queueStatus.queue.slice(0, 5);
      nextTasks.forEach((item, index) => {
        summary += `  ${index + 1}. ${item.task.id}: ${item.task.title}\n`;
        summary += `     Priority: ${item.task.priority}\n`;
        summary += `     Agent: ${item.task.agentId || 'Unassigned'}\n`;
      });
      if (queueStatus.queue.length > 5) {
        summary += `  ... and ${queueStatus.queue.length - 5} more\n`;
      }
    }

    return summary;
  },
});

/**
 * Quick create and start a task (convenience function)
 */
export const exec_quick_start = tool({
  description: "Quickly create and start a task",
  args: {
    title: tool.schema.string().describe("Task title"),
    description: tool.schema.string().describe("Task description"),
    agent_id: tool.schema.string().optional().describe("Agent ID to assign"),
    priority: tool.schema.enum(["low", "normal", "high", "urgent"]).optional().describe("Task priority"),
    files: tool.schema.array(tool.schema.string()).optional().describe("List of files this task will work on"),
  },
  async execute(args) {
    const manager = getExecutionManager();

    const task = await manager.createTask(args.title, args.description, {
      agentId: args.agent_id,
      priority: args.priority as TaskPriority,
      files: args.files,
    });

    // In PARALLEL mode, the task is ready to start
    // In SEQUENTIAL mode, it's been queued
    if (manager.getMode() === 'PARALLEL') {
      await manager.startTask(task.id);
    }

    const updatedTask = manager.getTask(task.id);

    return `Task ${task.id} created\n\nTitle: ${task.title}\nDescription: ${task.description}\nStatus: ${updatedTask?.status}\nPriority: ${task.priority}\nAgent: ${task.agentId || 'Unassigned'}\n\n${manager.getMode() === 'PARALLEL'
      ? `Started in PARALLEL mode with worktree: ${updatedTask?.worktreePath || 'N/A'}`
      : `Queued in SEQUENTIAL mode (position in queue: ${manager.getQueueStatus().queue.length})`
      }`;
  },
});

/**
 * Batch create multiple tasks
 */
export const exec_batch_create = tool({
  description: "Create multiple tasks at once from a JSON array",
  args: {
    tasks_json: tool.schema.string().describe("JSON array of task objects with title, description, and optional agent_id, priority, files"),
  },
  async execute(args) {
    let tasks: any[];
    try {
      tasks = JSON.parse(args.tasks_json);
    } catch {
      return "Error: Invalid JSON in tasks_json";
    }

    if (!Array.isArray(tasks)) {
      return "Error: tasks_json must be an array";
    }

    const manager = getExecutionManager();
    const created: ExecutionTask[] = [];

    for (const t of tasks) {
      if (!t.title || !t.description) {
        continue;
      }

      const task = await manager.createTask(t.title, t.description, {
        agentId: t.agent_id,
        priority: t.priority,
        files: t.files,
        metadata: t.metadata,
      });

      created.push(task);
    }

    return `Created ${created.length} task(s)\n\n${created.map(t =>
      `• ${t.id}: ${t.title} (${t.status}, ${t.priority})`
    ).join('\n')}`;
  },
});

/**
 * Get agent workload
 */
export const exec_get_agent_workload = tool({
  description: "Get workload for a specific agent or all agents",
  args: {
    agent_id: tool.schema.string().optional().describe("Agent ID (optional, shows all if not provided)"),
  },
  async execute(args) {
    const manager = getExecutionManager();
    const allTasks = manager.getAllTasks();

    const agentTasks = args.agent_id
      ? allTasks.filter(t => t.agentId === args.agent_id)
      : allTasks;

    if (agentTasks.length === 0) {
      return args.agent_id
        ? `No tasks for agent: ${args.agent_id}`
        : "No tasks found";
    }

    // Group by agent
    const agentStats: Record<string, { queued: number; running: number; completed: number; failed: number }> = {};

    for (const task of agentTasks) {
      const agentId = task.agentId || 'unassigned';
      if (!agentStats[agentId]) {
        agentStats[agentId] = { queued: 0, running: 0, completed: 0, failed: 0 };
      }
      agentStats[agentId][task.status]++;
    }

    let output = `Agent Workload\n\n`;

    if (args.agent_id) {
      const stats = agentStats[args.agent_id];
      output += `${args.agent_id}:\n`;
      output += `  Queued: ${stats.queued}\n`;
      output += `  Running: ${stats.running}\n`;
      output += `  Completed: ${stats.completed}\n`;
      output += `  Failed: ${stats.failed}\n`;
    } else {
      for (const [agentId, stats] of Object.entries(agentStats)) {
        output += `${agentId}:\n`;
        output += `  Queued: ${stats.queued}\n`;
        output += `  Running: ${stats.running}\n`;
        output += `  Completed: ${stats.completed}\n`;
        output += `  Failed: ${stats.failed}\n\n`;
      }
    }

    return output;
  },
});
