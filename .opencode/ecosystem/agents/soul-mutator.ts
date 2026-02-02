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
     * Calculate "Information Entropy" using TF-IDF semantic analysis
     *
     * Splits the profile into sections (by headings) and measures
     * cross-section similarity. High similarity between sections means
     * redundant content. This catches semantic repetition that simple
     * term counting misses.
     */
    private calculateEntropy(content: string): { score: number; lines: number; redundancy: number } {
        const lines = content.split('\n');
        const stopwords = new Set([
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
            'her', 'was', 'one', 'our', 'out', 'has', 'have', 'that', 'this', 'with',
            'from', 'they', 'been', 'will', 'each', 'make', 'like', 'when', 'than',
            'them', 'some', 'only', 'then', 'into', 'just', 'your', 'what', 'most',
            'also', 'should', 'must', 'agent', 'always', 'never', 'every', 'about',
        ]);

        // Split content into logical sections (by markdown headings)
        const sections: string[] = [];
        let currentSection = '';
        for (const line of lines) {
            if (line.startsWith('#')) {
                if (currentSection.trim().length > 50) {
                    sections.push(currentSection);
                }
                currentSection = '';
            }
            currentSection += line + ' ';
        }
        if (currentSection.trim().length > 50) {
            sections.push(currentSection);
        }

        // Build TF vectors for each section
        const sectionVectors: Map<string, number>[] = sections.map(section => {
            const terms = section.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
            const tf = new Map<string, number>();
            for (const t of terms) {
                if (stopwords.has(t)) continue;
                tf.set(t, (tf.get(t) || 0) + 1);
            }
            // Normalize
            const max = Math.max(...tf.values(), 1);
            for (const [k, v] of tf) tf.set(k, v / max);
            return tf;
        });

        // Compute pairwise cosine similarity between sections
        let totalSimilarity = 0;
        let pairCount = 0;
        for (let i = 0; i < sectionVectors.length; i++) {
            for (let j = i + 1; j < sectionVectors.length; j++) {
                totalSimilarity += this.cosineSimilarity(sectionVectors[i], sectionVectors[j]);
                pairCount++;
            }
        }

        const avgSimilarity = pairCount > 0 ? totalSimilarity / pairCount : 0;

        // Also compute basic term redundancy as fallback
        const allTerms = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
        const termCounts: Record<string, number> = {};
        let repeats = 0;
        allTerms.forEach(t => {
            if (stopwords.has(t)) return;
            termCounts[t] = (termCounts[t] || 0) + 1;
            if (termCounts[t] > 5) repeats++;
        });
        const termRedundancy = allTerms.length > 0 ? repeats / allTerms.length : 0;

        // Combined score: size + semantic redundancy + term redundancy
        const sizeScore = lines.length / ENTROPY_THRESHOLD_LINES;
        const semanticScore = avgSimilarity * 3; // High cross-section similarity is bad
        const termScore = termRedundancy * 2;

        const score = sizeScore * 0.4 + semanticScore * 0.4 + termScore * 0.2;

        return {
            score,
            lines: lines.length,
            redundancy: Math.max(avgSimilarity, termRedundancy)
        };
    }

    /**
     * Cosine similarity between two TF vectors
     */
    private cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (const [term, weight] of a) {
            normA += weight * weight;
            if (b.has(term)) {
                dotProduct += weight * b.get(term)!;
            }
        }
        for (const weight of b.values()) {
            normB += weight * weight;
        }

        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom > 0 ? dotProduct / denom : 0;
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
                proposalType: 'architectural', // Correct mapped type
                proposedBy: 'system.soul-mutator', // Correct field
                expertiseWeights: true, // Required
                vetoPower: true, // Required
                consensusThreshold: 0.6, // Required
                estimatedImpact: 'low', // Map 'minor' -> 'low'
                expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24h expiry
                context: {
                    risks: ['Agents becoming too specialized', 'Loss of broad capabilities'],
                    benefits: ['Reduced redundancy', 'Clearer agent responsibilities'],
                    alternatives: ['Do nothing', 'Manual refactor'],
                    affectedAgents: [proposal.agent],
                    affectedSystems: ['agent-profile']
                }
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
