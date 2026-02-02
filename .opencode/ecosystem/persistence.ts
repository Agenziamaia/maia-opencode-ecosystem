/**
 * Persistence Layer for MAIA Ecosystem
 *
 * Saves DNA patterns, Council decisions, Constitution state to disk
 * so they survive restarts.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { getDNATracker } from './dna/dna-tracker.js';
import { getEnhancedCouncil } from './council/enhanced-council.js';
import { getConstitution } from './constitution/constitution.js';

const PERSISTENCE_DIR = join(process.cwd(), '.opencode', 'persistence');

/**
 * Ensure persistence directory exists
 */
async function ensureDir(): Promise<void> {
  try {
    await fs.mkdir(PERSISTENCE_DIR, { recursive: true });
  } catch (e) {
    // Ignore if exists
  }
}

/**
 * Save all state to disk
 */
export async function saveState(): Promise<void> {
  await ensureDir();

  try {
    // Save DNA patterns
    const dna = getDNATracker();
    await fs.writeFile(
      join(PERSISTENCE_DIR, 'dna.json'),
      JSON.stringify(dna.serialize(), null, 2)
    );

    // Save Council state
    const council = getEnhancedCouncil();
    await fs.writeFile(
      join(PERSISTENCE_DIR, 'council.json'),
      JSON.stringify(council.serialize(), null, 2)
    );

    // Save Constitution state
    const constitution = getConstitution();
    await fs.writeFile(
      join(PERSISTENCE_DIR, 'constitution.json'),
      JSON.stringify(constitution.serialize(), null, 2)
    );

    console.log('✅ State saved to', PERSISTENCE_DIR);
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

/**
 * Load all state from disk
 */
export async function loadState(): Promise<void> {
  await ensureDir();

  try {
    // Load DNA patterns
    try {
      const dnaData = await fs.readFile(join(PERSISTENCE_DIR, 'dna.json'), 'utf-8');
      const dna = getDNATracker();
      dna.deserialize(JSON.parse(dnaData));
      console.log('✅ DNA state loaded');
    } catch (e) {
      console.log('ℹ️ No DNA state found, starting fresh');
    }

    // Load Council state
    try {
      const councilData = await fs.readFile(join(PERSISTENCE_DIR, 'council.json'), 'utf-8');
      const council = getEnhancedCouncil();
      council.deserialize(JSON.parse(councilData));
      console.log('✅ Council state loaded');
    } catch (e) {
      console.log('ℹ️ No Council state found, starting fresh');
    }

    // Load Constitution state
    try {
      const constitutionData = await fs.readFile(join(PERSISTENCE_DIR, 'constitution.json'), 'utf-8');
      const constitution = getConstitution();
      constitution.deserialize(JSON.parse(constitutionData));
      console.log('✅ Constitution state loaded');
    } catch (e) {
      console.log('ℹ️ No Constitution state found, starting fresh');
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
}

/**
 * Clear all persisted state (for testing/reset)
 */
export async function clearState(): Promise<void> {
  try {
    await fs.rm(PERSISTENCE_DIR, { recursive: true, force: true });
    console.log('✅ All state cleared');
  } catch (e) {
    console.error('Failed to clear state:', e);
  }
}
