/**
 * MAIA SOUL MUTATOR
 *
 * Purpose: Intelligently manage the evolution of agent profiles (.md files).
 * Philosophy: Context-Aware Evolution. No hard limits, but "Entropic Thresholds".
 *
 * Mechanism:
 * 1. Scans agent profiles for "Information Entropy" (line count, token density).
 * 2. If 'Entropy' > Threshold:
 *    - Triggers 'Consolidation Proposal' (Merge redundant skills).
 *    - OR Triggers 'Expansion Request' (If content is unique).
 *
 * This ensures agents grow deep, not just fat.
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { getEnhancedCouncil } from '../council/enhanced-council.js';

const AGENTS_DIR = join(process.cwd(), '.opencode', 'agents');
const ENTROPY_THRESHOLD_LINES = 500; // Soft limit to trigger review

export interface MutationProposal {
    type: 'consolidation' | 'expansion';
    agent: string;
    reason: string;
    suggestedAction: string;
    priority: 'high' | 'medium' | 'low';
}

export class SoulMutator {
    private council = getEnhancedCouncil();

    /**
     * Scan all agents for entropy
     */
    async scanEntropy(): Promise<MutationProposal[]> {
        const proposals: MutationProposal[] = [];

        try {
            const files = await fs.readdir(AGENTS_DIR);
            for (const file of files) {
                if (!file.endsWith('.md')) continue;

                const agentName = file.replace('.md', '');
                const content = await fs.readFile(join(AGENTS_DIR, file), 'utf-8');

                const entropy = this.calculateEntropy(content);

                if (entropy.score > 1.0) { // Threshold crossed
                    const proposal = this.generateProposal(agentName, entropy, content);
                    proposals.push(proposal);

                    // Auto-submit to Council if high priority
                    if (proposal.priority === 'high') {
                        await this.submitToCouncil(proposal);
                    }
                }
            }
        } catch (error) {
            console.error('SoulMutator scan failed:', error);
        }

        return proposals;
    }

    /**
     * Calculate "Information Entropy"
     * Simple heuristic: Line count + redundancy check
     */
    private calculateEntropy(content: string): { score: number; lines: number; redundancy: number } {
        const lines = content.split('\n');
        const validLines = lines.filter(l => l.trim().length > 5);

        // Check for redundancy (repeated terms)
        const terms = content.toLowerCase().match(/\w+/g) || [];
        const termCounts: Record<string, number> = {};
        let repeats = 0;

        terms.forEach(t => {
            if (t.length < 4) return; // ignore small words
            termCounts[t] = (termCounts[t] || 0) + 1;
            if (termCounts[t] > 5) repeats++;
        });

        // Score calculation
        // 1.0 is the "Review Threshold"
        // > 500 lines OR > 20% redundancy triggers review
        const redundancyScore = repeats / terms.length;
        let score = lines.length / ENTROPY_THRESHOLD_LINES;
        score += redundancyScore * 2; // Penalize redundancy heavily

        return {
            score,
            lines: lines.length,
            redundancy: redundancyScore
        };
    }

    /**
     * Generate a mutation proposal
     */
    private generateProposal(agent: string, entropy: { score: number; lines: number; redundancy: number }, content: string): MutationProposal {
        if (entropy.redundancy > 0.15) {
            return {
                type: 'consolidation',
                agent,
                reason: `High Redundancy Detected (${(entropy.redundancy * 100).toFixed(0)}%)`,
                suggestedAction: `Consolidate repeated terms in @${agent}'s profile. Focus on 'Mastery' over list-making.`,
                priority: 'high'
            };
        } else {
            return {
                type: 'expansion',
                agent,
                reason: `Profile Size Threshold Reached (${entropy.lines} lines)`,
                suggestedAction: `Request Council approval for Profile Expansion. Verify unique value of new skills.`,
                priority: 'medium'
            };
        }
    }

    /**
     * Submit proposal to the Council
     */
    private async submitToCouncil(proposal: MutationProposal): Promise<void> {
        try {
            await this.council.propose({
                title: `Soul Mutation: ${proposal.type.toUpperCase()} for @${proposal.agent}`,
                description: `${proposal.reason}. ${proposal.suggestedAction}`,
                author: 'system.soul-mutator',
                category: 'architectural',
                magnitude: 'minor',
                tags: ['mutation', proposal.agent, proposal.type]
            });
            console.log(`🦅 SOUL MUTATOR: Submitted ${proposal.type} proposal for @${proposal.agent}`);
        } catch (error) {
            console.error('Failed to submit council proposal:', error);
        }
    }
}

// Singleton
let instance: SoulMutator | null = null;
export function getSoulMutator(): SoulMutator {
    if (!instance) instance = new SoulMutator();
    return instance;
}
