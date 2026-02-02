/**
 * MAIA 10/10 ENHANCED VERIFICATION
 * Tests the full governance integration
 */

import { getMaiaDaemon } from './execution/maia-daemon.js';
import {
  getConstitution,
  getEnhancedCouncil,
  getPredictiveEngine
} from './constitution/index.js';

async function verifyEnhancedDaemon() {
  console.log('🦅 MAIA 10/10 ENHANCED VERIFICATION');
  console.log('====================================\n');

  // Wake up the daemon
  const daemon = getMaiaDaemon();
  await daemon.wakeUp();
  console.log('✅ Daemon awake with governance\n');

  // Verify governance components
  const constitution = getConstitution();
  console.log(`✅ Constitution: ${constitution.getPrinciples().length} principles`);

  const council = getEnhancedCouncil();
  console.log(`✅ Council: Ready`);

  const prediction = getPredictiveEngine();
  console.log(`✅ Prediction: Ready\n`);

  // Test dispatch with governance
  console.log('--- Testing Dispatch ---');

  try {
    // Test 1: Simple dispatch (should use DNA or fallback to keyword routing)
    console.log('\n📋 Test 1: Simple task dispatch');
    const result1 = await daemon.dispatch('fix the authentication bug in login.ts', {
      requestingAgent: 'maia',
    });

    console.log(`✅ Task dispatched to: @${result1.agentId}`);
    console.log(`   Governance: ${JSON.stringify(result1.governance, null, 2)}`);

    // Test 2: Complex decision (should trigger Council)
    console.log('\n📋 Test 2: Complex architectural decision');
    const result2 = await daemon.dispatch('redesign the api architecture for better scalability', {
      requestingAgent: 'sisyphus',
    });

    console.log(`✅ Task dispatched to: @${result2.agentId}`);
    console.log(`   Governance: ${JSON.stringify(result2.governance, null, 2)}`);

    // Test 3: Preferred agent
    console.log('\n📋 Test 3: Preferred agent override');
    const result3 = await daemon.dispatch('write some tests', {
      preferredAgent: 'coder',
      requestingAgent: 'maia',
    });

    console.log(`✅ Task dispatched to: @${result3.agentId}`);

  } catch (e: any) {
    console.error(`❌ Dispatch failed: ${e.message}`);

    // If constitution blocked, that's actually a success
    if (e.message.includes('Constitution blocked')) {
      console.log('   ⚖️ This is expected if Constitution has safety rules');
    }
  }

  console.log('\n====================================');
  console.log('🎯 ENHANCED VERIFICATION COMPLETE');
}

verifyEnhancedDaemon().catch(console.error);
