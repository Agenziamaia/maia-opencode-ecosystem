/**
 * Living Ecosystem Foundation - Main Exports
 *
 * This module provides the foundation for the MAIA living ecosystem:
 * - DNA tracking for pattern recognition
 * - Council voting for agent consensus
 * - Agent availability and management
 * - MCP tools for integration
 */

export * from './dna/dna-tracker';
export * from './council/council-manager';
export * from './agents/agent-manager';
export * from './tools/ecosystem-mcp-tools';
export * from './tools/session-tools';
export * from './tools/vibekanban-tools';
export * from './tools/memory-tools';
export * from './execution';
export * from './meta-learning';
export * from '../memory/memory-store';

/**
 * Initialize the ecosystem foundation
 */
export function initializeEcosystem(): void {
  console.log('Living Ecosystem Foundation initialized');
}

/**
 * Initialize with persisted state
 */
export function initializeWithState(
  dnaState?: string,
  councilState?: string
): void {
  import { getDNATracker } from './dna/dna-tracker';
  const dnaTracker = getDNATracker();
  if (dnaState) {
    dnaTracker.deserialize(dnaState);
  }

  console.log('Living Ecosystem Foundation initialized with state');
}
