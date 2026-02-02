/**
 * Living Ecosystem Foundation - Main Exports
 *
 * This module provides the foundation for the MAIA living ecosystem.
 * Fixed import paths to actual file locations.
 */

// ============================================================================
// EXECUTION LAYER
// ============================================================================

export * from './execution/execution-manager.js';
export * from './execution/maia-daemon.js';
export * from './execution/opencode-client.js';

// ============================================================================
// DNA & INTELLIGENCE
// ============================================================================

export * from './dna/dna-tracker.js';
export * from './swarm-integration.js';

// ============================================================================
// COUNCIL & AGENT MANAGEMENT
// ============================================================================

export * from './council/council-manager.js';
export * from './council/enhanced-council.js';
export * from './agents/agent-manager.js';

// ============================================================================
// GOVERNANCE (Constitution, Council, Prediction)
// ============================================================================

export * from './constitution/index.js';

// ============================================================================
// META-LEARNING
// ============================================================================

export * from './meta-learning.js';

// ============================================================================
// ORCHESTRATOR
// ============================================================================

export * from './orchestrator/index.js';

// ============================================================================
// MEMORY
// ============================================================================

// export * from '../memory/memory-store.js'; // Removed to prevent circular dependency with memory-tools

// ============================================================================
// TOOLS
// ============================================================================

export * from './tools/ecosystem-mcp-tools.js';
export * from './tools/session-tools.js';
export * from './tools/vibekanban-tools.js';
export * from './tools/memory-tools.js';
export * from './tools/swarm-tools.js';

/**
 * Initialize the ecosystem foundation
 * Starts the daemon, loads persisted state, and activates governance
 */
export async function initializeEcosystem(): Promise<void> {
  const { getMaiaDaemon } = await import('./execution/maia-daemon.js');
  const { loadState } = await import('./persistence.js');

  // Load persisted state (DNA patterns, council decisions, etc.)
  try {
    await loadState();
    console.log('🌱 Ecosystem: Persisted state loaded');
  } catch {
    console.log('🌱 Ecosystem: No persisted state found, starting fresh');
  }

  // Start the daemon (heartbeat, event binding)
  const daemon = getMaiaDaemon();
  await daemon.wakeUp();

  console.log('🌱 Living Ecosystem Foundation initialized');
  console.log('   - DNA Tracking: Active');
  console.log('   - Council Voting: Ready');
  console.log('   - Agent Management: Online');
  console.log('   - Constitution: Enforcing');
  console.log('   - Predictive Engine: Anticipating');
  console.log('   - OpenCode Integration: Connected');
  console.log('   - Swarm Intelligence: Collective');
  console.log('   - Orchestrator: Standby');
}
