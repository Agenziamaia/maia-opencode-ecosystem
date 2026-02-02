/**
 * Parallel Execution Manager
 *
 * Implements OpenCode GitHub issue #6470:
 * https://github.com/anomalyco/opencode/issues/6470
 *
 * Features:
 * - System-wide setting for execution mode: PARALLEL or SEQUENTIAL
 * - PARALLEL mode: Uses git worktrees for isolation
 * - SEQUENTIAL mode: Queue-based, one task at a time
 * - Environment variable: EXECUTION_MODE (default: sequential for safety)
 * - Agent-aware: Tracks which agents are working on what
 * - Collision detection: Prevents multiple agents working on same files
 * - Status reporting: Shows what's queued, running, completed
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { executeAgentSession } from './opencode-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execution mode types
 */
export type ExecutionMode = 'PARALLEL' | 'SEQUENTIAL';

/**
 * Task status types
 */
export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Priority levels for task queue
 */
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Collision detection result
 */
export interface CollisionResult {
  hasCollision: boolean;
  conflictingAgents?: string[];
  conflictingFiles?: string[];
}

/**
 * Task definition
 */
export interface ExecutionTask {
  id: string;
  title: string;
  description: string;
  agentId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  files?: string[];
  worktreePath?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Execution statistics
 */
export interface ExecutionStats {
  mode: ExecutionMode;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  totalProcessed: number;
  avgExecutionTime?: number;
}

/**
 * Execution queue item with priority ordering
 */
interface QueueItem {
  task: ExecutionTask;
  priority: number;
  enqueuedAt: string;
}

/**
 * Execution manager configuration
 */
export interface ExecutionManagerConfig {
  mode?: ExecutionMode;
  maxParallelTasks?: number;
  worktreeBasePath?: string;
  autoCleanupWorktrees?: boolean;
  collisionDetectionEnabled?: boolean;
}

/**
 * Main Execution Manager Class
 */
export class ExecutionManager extends EventEmitter {
  private mode: ExecutionMode;
  private maxParallelTasks: number;
  private worktreeBasePath: string;
  private autoCleanupWorktrees: boolean;
  private collisionDetectionEnabled: boolean;

  // Task storage
  private tasks: Map<string, ExecutionTask>;
  private taskQueue: QueueItem[];
  private runningTasks: Set<string>;
  private completedTasks: Set<string>;

  // Agent tracking
  private agentWorktrees: Map<string, string[]>; // agentId -> worktree paths
  private agentFileLocks: Map<string, Set<string>>; // agentId -> locked files

  // Git repository tracking
  private gitRoot: string | null;

  // Processing state
  private isProcessing: boolean;
  private processInterval: NodeJS.Timeout | null;

  constructor(config: ExecutionManagerConfig = {}) {
    super();
    // Read execution mode from environment or config (default: SEQUENTIAL for safety)
    this.mode = config.mode ||
      (process.env.EXECUTION_MODE?.toUpperCase() as ExecutionMode) ||
      'SEQUENTIAL';

    this.maxParallelTasks = config.maxParallelTasks || 3;
    this.worktreeBasePath = config.worktreeBasePath ||
      process.env.WORKTREE_BASE_PATH ||
      join(process.cwd(), '.opencode', 'worktrees');
    this.autoCleanupWorktrees = config.autoCleanupWorktrees ?? true;
    this.collisionDetectionEnabled = config.collisionDetectionEnabled ?? true;

    // Initialize storage
    this.tasks = new Map();
    this.taskQueue = [];
    this.runningTasks = new Set();
    this.completedTasks = new Set();
    this.agentWorktrees = new Map();
    this.agentFileLocks = new Map();
    this.gitRoot = null;
    this.isProcessing = false;
    this.processInterval = null;

    this.initialize();
  }

  /**
   * Initialize the execution manager
   */
  private async initialize(): Promise<void> {
    // Ensure worktree base path exists
    try {
      await fs.mkdir(this.worktreeBasePath, { recursive: true });
    } catch (error) {
      console.warn(`Failed to create worktree base path: ${error}`);
    }

    // Detect git repository
    await this.detectGitRepository();

    // Start queue processing for sequential mode
    if (this.mode === 'SEQUENTIAL') {
      this.startQueueProcessor();
    }

    console.log(`Execution Manager initialized in ${this.mode} mode`);
  }

  /**
   * Detect if we're in a git repository
   */
  private async detectGitRepository(): Promise<void> {
    return new Promise((resolve) => {
      const git = spawn('git', ['rev-parse', '--show-toplevel'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'ignore'],
      });

      let output = '';
      git.stdout?.on('data', (data) => {
        output += data.toString();
      });

      git.on('close', (code) => {
        if (code === 0) {
          this.gitRoot = output.trim();
          console.log(`Git repository detected: ${this.gitRoot}`);
        } else {
          console.log('No git repository detected');
        }
        resolve();
      });
    });
  }

  /**
   * Get the current execution mode
   */
  getMode(): ExecutionMode {
    return this.mode;
  }

  /**
   * Set the execution mode dynamically
   */
  setMode(mode: ExecutionMode): void {
    const oldMode = this.mode;
    this.mode = mode;

    if (mode === 'SEQUENTIAL' && oldMode !== 'SEQUENTIAL') {
      this.startQueueProcessor();
    } else if (mode === 'PARALLEL' && oldMode !== 'PARALLEL') {
      this.stopQueueProcessor();
    }

    console.log(`Execution mode changed from ${oldMode} to ${mode}`);
  }

  /**
   * Create a new task
   * - PARALLEL mode: Starts execution immediately (fire-and-forget)
   * - SEQUENTIAL mode: Adds to queue for later execution
   */
  async createTask(
    title: string,
    description: string,
    options: {
      agentId?: string;
      priority?: TaskPriority;
      files?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<ExecutionTask> {
    const task: ExecutionTask = {
      id: this.generateTaskId(),
      title,
      description,
      agentId: options.agentId,
      status: 'queued',
      priority: options.priority || 'normal',
      files: options.files,
      createdAt: new Date().toISOString(),
      metadata: options.metadata,
    };

    this.tasks.set(task.id, task);

    if (this.mode === 'PARALLEL') {
      // In PARALLEL mode, prepare worktree and start execution immediately
      if (this.gitRoot) {
        await this.prepareParallelTask(task);
      }
      // Fire and forget - don't await, let it run in parallel
      this.startTask(task.id).catch(err => {
        console.error(`[ExecutionManager] Parallel task failed to start:`, err);
      });
    } else {
      // In SEQUENTIAL mode, add to queue for later processing
      this.enqueueTask(task);
    }

    return task;
  }

  /**
   * Prepare a task for parallel execution with worktree
   */
  private async prepareParallelTask(task: ExecutionTask): Promise<void> {
    if (!this.gitRoot || !task.agentId) {
      return;
    }

    const worktreePath = join(this.worktreeBasePath, `task-${task.id}-${task.agentId}`);

    try {
      // Check if worktree already exists
      await fs.access(worktreePath);
      task.worktreePath = worktreePath;
    } catch {
      // Create new worktree
      try {
        await this.createWorktree(worktreePath);
        task.worktreePath = worktreePath;

        // Track agent's worktrees
        const agentWorktrees = this.agentWorktrees.get(task.agentId) || [];
        agentWorktrees.push(worktreePath);
        this.agentWorktrees.set(task.agentId, agentWorktrees);
      } catch (error) {
        console.error(`Failed to create worktree for task ${task.id}:`, error);
        task.error = `Failed to create worktree: ${error}`;
      }
    }
  }

  /**
   * Create a git worktree
   */
  private createWorktree(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const git = spawn('git', ['worktree', 'add', path, '--detach'], {
        cwd: this.gitRoot || undefined,
        stdio: 'ignore',
      });

      git.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`git worktree add failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Remove a git worktree
   */
  private removeWorktree(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const git = spawn('git', ['worktree', 'remove', '--force', path], {
        cwd: this.gitRoot || undefined,
        stdio: 'ignore',
      });

      git.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`git worktree remove failed with code ${code}`));
        }
      });
    });
  }

  /**
   * Check for file collisions
   */
  checkCollisions(taskId: string, files: string[]): CollisionResult {
    if (!this.collisionDetectionEnabled) {
      return { hasCollision: false };
    }

    const conflictingAgents: string[] = [];
    const conflictingFiles: string[] = [];

    for (const [agentId, lockedFiles] of this.agentFileLocks.entries()) {
      for (const file of files) {
        if (lockedFiles.has(file)) {
          conflictingAgents.push(agentId);
          conflictingFiles.push(file);
        }
      }
    }

    return {
      hasCollision: conflictingAgents.length > 0,
      conflictingAgents: Array.from(new Set(conflictingAgents)),
      conflictingFiles: Array.from(new Set(conflictingFiles)),
    };
  }

  /**
   * Start executing a task - ACTUALLY EXECUTES THE AGENT
   */
  async startTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    // Check for collisions if files are specified
    if (task.files && task.agentId) {
      const collision = this.checkCollisions(taskId, task.files);
      if (collision.hasCollision) {
        task.error = `Collision detected with agents: ${collision.conflictingAgents?.join(', ')} on files: ${collision.conflictingFiles?.join(', ')}`;
        task.status = 'failed';
        return false;
      }

      // Lock files for this agent
      const agentLocks = this.agentFileLocks.get(task.agentId) || new Set();
      task.files.forEach(f => agentLocks.add(f));
      this.agentFileLocks.set(task.agentId, agentLocks);
    }

    task.status = 'running';
    task.startedAt = new Date().toISOString();
    this.runningTasks.add(taskId);

    // ACTUALLY EXECUTE THE AGENT
    console.log(`[ExecutionManager] Starting task execution: ${task.id} - ${task.title}`);

    try {
      // PERISTENT FOCUS (God Mode): Write the task to the agent's working memory
      if (task.agentId) {
        await this.writeWorkingMemory(task.agentId, task);
      }

      // Execute the agent session
      const result = await executeAgentSession({
        agentId: task.agentId,
        prompt: task.description,
        timeout: task.metadata?.timeout || 300000, // 5 minutes default
      });

      console.log(`[ExecutionManager] Task ${task.id} completed with status: ${result.status}`);

      // Handle completion based on result status
      if (result.status === 'completed') {
        await this.completeTask(taskId, true);
        return true;
      } else if (result.status === 'timeout') {
        await this.completeTask(taskId, false, 'Task execution timed out');
        return false;
      } else {
        await this.completeTask(taskId, false, `Task completed with unexpected status: ${result.status}`);
        return false;
      }
    } catch (error) {
      console.error(`[ExecutionManager] Task ${task.id} failed:`, error);
      await this.completeTask(taskId, false, String(error));
      return false;
    }
  }

  /**
   * GOD MODE: Write task context to WORKING.md
   */
  private async writeWorkingMemory(agentId: string, task: ExecutionTask): Promise<void> {
    try {
      const agentDir = join(process.cwd(), '.opencode', 'agents', agentId);
      await fs.mkdir(agentDir, { recursive: true });

      const workingPath = join(agentDir, 'WORKING.md');
      const content = `# CURRENT FOCUS
**Task ID**: ${task.id}
**Started**: ${new Date().toISOString()}
**Priority**: ${task.priority.toUpperCase()}

## Objective
${task.title}

## Context
${task.description}

## Status
IN_PROGRESS (PID: ${process.pid})
`;
      await fs.writeFile(workingPath, content);
    } catch (error) {
      console.warn(`Failed to write WORKING.md for ${agentId}:`, error);
    }
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string, success: boolean = true, error?: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return;
    }

    task.status = success ? 'completed' : 'failed';
    task.completedAt = new Date().toISOString();
    task.error = error;

    this.runningTasks.delete(taskId);

    if (success) {
      this.completedTasks.add(taskId);
    }

    // Release file locks
    if (task.agentId && task.files) {
      const agentLocks = this.agentFileLocks.get(task.agentId);
      if (agentLocks) {
        task.files.forEach(f => agentLocks.delete(f));
      }
    }

    // Emit completion event for the Orchestrator/Daemon
    this.emit('taskCompleted', task);

    // Cleanup worktree if auto-cleanup is enabled
    if (this.mode === 'PARALLEL' && this.autoCleanupWorktrees && task.worktreePath) {
      await this.cleanupWorktree(task);
    }
  }

  /**
   * Cleanup worktree for a task
   */
  private async cleanupWorktree(task: ExecutionTask): Promise<void> {
    if (!task.worktreePath) {
      return;
    }

    try {
      await this.removeWorktree(task.worktreePath);

      // Remove from agent's worktree list
      if (task.agentId) {
        const agentWorktrees = this.agentWorktrees.get(task.agentId) || [];
        const index = agentWorktrees.indexOf(task.worktreePath);
        if (index !== -1) {
          agentWorktrees.splice(index, 1);
        }
      }

      task.worktreePath = undefined;
    } catch (error) {
      console.warn(`Failed to cleanup worktree for task ${task.id}:`, error);
    }
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    if (task.status === 'running') {
      await this.completeTask(taskId, false, 'Task cancelled');
    } else if (task.status === 'queued') {
      this.taskQueue = this.taskQueue.filter(item => item.task.id !== taskId);
      task.status = 'cancelled';
    }

    return true;
  }

  /**
   * Add task to queue with priority
   */
  private enqueueTask(task: ExecutionTask): void {
    const priorityMap: Record<TaskPriority, number> = {
      urgent: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    this.taskQueue.push({
      task,
      priority: priorityMap[task.priority],
      enqueuedAt: new Date().toISOString(),
    });

    // Sort by priority (lower number = higher priority)
    this.taskQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.enqueuedAt).getTime() - new Date(b.enqueuedAt).getTime();
    });
  }

  /**
   * Start the queue processor for sequential mode
   */
  private startQueueProcessor(): void {
    if (this.processInterval) {
      return;
    }

    this.processInterval = setInterval(() => {
      this.processQueue();
    }, 1000);

    console.log('Queue processor started');
  }

  /**
   * Stop the queue processor
   */
  private stopQueueProcessor(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
      console.log('Queue processor stopped');
    }
  }

  /**
   * Process the next task in the queue (SEQUENTIAL mode)
   * Executes tasks one at a time, waiting for completion before starting next
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    if (this.taskQueue.length === 0) {
      return;
    }

    if (this.runningTasks.size >= 1) {
      // Sequential mode: only one task at a time
      return;
    }

    const item = this.taskQueue.shift();
    if (!item) {
      return;
    }

    this.isProcessing = true;

    const task = item.task;
    console.log(`[ExecutionManager] Starting queued task: ${task.id} - ${task.title}`);

    // startTask now actually executes the agent and awaits completion
    await this.startTask(task.id);

    console.log(`[ExecutionManager] Task finished: ${task.id}`);

    this.isProcessing = false;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ExecutionTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): ExecutionTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): ExecutionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  /**
   * Get tasks for a specific agent
   */
  getTasksForAgent(agentId: string): ExecutionTask[] {
    return Array.from(this.tasks.values()).filter(t => t.agentId === agentId);
  }

  /**
   * Get execution statistics
   */
  getStats(): ExecutionStats {
    const allTasks = Array.from(this.tasks.values());
    const completed = allTasks.filter(t => t.status === 'completed');
    const failed = allTasks.filter(t => t.status === 'failed');

    let avgExecutionTime: number | undefined;
    if (completed.length > 0) {
      const times = completed
        .filter(t => t.startedAt && t.completedAt)
        .map(t => new Date(t.completedAt!).getTime() - new Date(t.startedAt!).getTime());
      if (times.length > 0) {
        avgExecutionTime = times.reduce((a, b) => a + b, 0) / times.length;
      }
    }

    return {
      mode: this.mode,
      queued: this.taskQueue.length,
      running: this.runningTasks.size,
      completed: this.completedTasks.size,
      failed: failed.length,
      totalProcessed: this.completedTasks.size + failed.length,
      avgExecutionTime,
    };
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { queue: QueueItem[] } {
    return {
      queue: [...this.taskQueue],
    };
  }

  /**
   * Cleanup completed tasks
   */
  cleanup(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [taskId, task] of this.tasks.entries()) {
      if (
        (task.status === 'completed' || task.status === 'failed') &&
        new Date(task.completedAt || 0).getTime() < cutoffTime
      ) {
        this.tasks.delete(taskId);
        this.completedTasks.delete(taskId);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Reset the execution manager
   */
  reset(): void {
    this.stopQueueProcessor();
    this.tasks.clear();
    this.taskQueue = [];
    this.runningTasks.clear();
    this.completedTasks.clear();
    this.agentWorktrees.clear();
    this.agentFileLocks.clear();

    if (this.mode === 'SEQUENTIAL') {
      this.startQueueProcessor();
    }

    console.log('Execution Manager reset');
  }

  /**
   * Serialize state for persistence
   */
  serialize(): string {
    return JSON.stringify({
      mode: this.mode,
      tasks: Array.from(this.tasks.entries()),
      stats: this.getStats(),
    });
  }

  /**
   * Deserialize state
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.mode = parsed.mode || this.mode;
      this.tasks = new Map(parsed.tasks || []);

      // Rebuild internal state
      for (const task of this.tasks.values()) {
        if (task.status === 'running') {
          this.runningTasks.add(task.id);
        } else if (task.status === 'completed') {
          this.completedTasks.add(task.id);
        }
      }

      console.log('Execution Manager state restored');
    } catch (error) {
      console.error('Failed to deserialize state:', error);
    }
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let executionManagerInstance: ExecutionManager | null = null;

/**
 * Get the execution manager singleton
 */
export function getExecutionManager(config?: ExecutionManagerConfig): ExecutionManager {
  if (!executionManagerInstance) {
    executionManagerInstance = new ExecutionManager(config);
  }
  return executionManagerInstance;
}

/**
 * Reset the execution manager singleton
 */
export function resetExecutionManager(): void {
  if (executionManagerInstance) {
    executionManagerInstance.reset();
  }
  executionManagerInstance = null;
}
