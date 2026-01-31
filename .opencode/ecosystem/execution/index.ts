/**
 * Execution Manager Module - Main Exports
 *
 * This module provides the execution manager for OpenCode GitHub issue #6470:
 * https://github.com/anomalyco/opencode/issues/6470
 *
 * Features:
 * - PARALLEL mode: Agents work in isolated git worktrees simultaneously
 * - SEQUENTIAL mode: Queue-based, one task at a time
 * - Agent-aware tracking
 * - Collision detection
 * - Status reporting
 */

// Core execution manager
export * from './execution-manager.js';

// MCP tools
export * from './execution-tools.js';

/**
 * Initialize the execution manager with default configuration
 */
export function initializeExecutionManager(config?: {
  mode?: 'PARALLEL' | 'SEQUENTIAL';
  maxParallelTasks?: number;
  worktreeBasePath?: string;
  autoCleanupWorktrees?: boolean;
  collisionDetectionEnabled?: boolean;
}): void {
  // The execution manager is lazily initialized via getExecutionManager()
  // This function is for explicit initialization with custom config
  const { getExecutionManager } = require('./execution-manager.js');
  getExecutionManager(config);
}
