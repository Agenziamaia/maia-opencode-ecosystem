import { execSync } from 'child_process';
import * as path from 'path';

export interface SemanticResult {
    path: string;
    score: number;
    content: string;
}

export class SemanticService {
    private scriptPath: string;

    constructor() {
        this.scriptPath = path.resolve(process.cwd(), '.opencode/scripts/semantic_search.py');
    }

    /**
     * Search the vault semantically
     */
    search(query: string, topK: number = 3): SemanticResult[] {
        try {
            const command = `python3 "${this.scriptPath}" --search "${query.replace(/"/g, '\\"')}" --json`;
            const output = execSync(command, { encoding: 'utf-8' });

            return JSON.parse(output);
        } catch (error) {
            console.error('Semantic search failed:', error);
            return [];
        }
    }
}

let semanticServiceInstance: SemanticService | null = null;

export function getSemanticService(): SemanticService {
    if (!semanticServiceInstance) {
        semanticServiceInstance = new SemanticService();
    }
    return semanticServiceInstance;
}
