/**
 * MAIA Orchestrator Module
 *
 * This module exports the main orchestrator components for the MAIA ecosystem.
 *
 * Architecture:
 * - MaiaOrchestrator: Strategic layer (high-level planning and coordination)
 * - MaiaDaemon: Dispatch layer (low-level task routing and execution)
 * - ExecutionManager: Task execution layer (queue management and isolation)
 */

export {
  MaiaOrchestrator,
  getMaiaOrchestrator,
  resetMaiaOrchestrator,
} from './maia-orchestrator.js';

export type {
  // Core types
  ExecutionPlan,
  SubTask,
  AssignedTask,
  Workflow,
  ExecutionGraph,
  TaskResult,
  Artifact,
  Deliverable,
  DeliverableMetrics,
  WorkflowResult,
  OrchestratorConfig,
} from './maia-orchestrator.js';
