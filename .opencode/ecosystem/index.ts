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

export * from './meta-learning/index.js';

// ============================================================================
// MEMORY
// ============================================================================

export * from '../memory/memory-store.js';

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
 */
export function initializeEcosystem(): void {
  console.log('🌱 Living Ecosystem Foundation initialized');
  console.log('   - DNA Tracking: Active');
  console.log('   - Council Voting: Ready');
  console.log('   - Agent Management: Online');
  console.log('   - Constitution: Enforcing');
  console.log('   - Predictive Engine: Anticipating');
  console.log('   - OpenCode Integration: Connected');
  console.log('   - Swarm Intelligence: Collective');
}
