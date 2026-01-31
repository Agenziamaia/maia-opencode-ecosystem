/**
 * MAIA DAEMON (The Singleton Cortex)
 *
 * This is the runtime identity of the MAIA Agent.
 * It is a singleton daemon that stays awake (in theory) to coordinate
 * the "Body" (ExecutionManager) and the "Memory" (MetaLearning).
 *
 * Capabilities:
 * 1. Dispatcher: Routes "Intent" -> "Agent Task".
 * 2. Learner: Listens to every task completion to update DNA.
 * 3. Guardian: Ensures system health.
 */

import { EventEmitter } from 'events';
import { getExecutionManager, ExecutionManager, ExecutionTask } from './execution-manager.js';
import { getMetaLearningEngine, MetaLearningEngine, logTaskOutcome } from '../meta-learning.js';
import { getMemoryStore } from '../../memory/memory-store.js';

export class MaiaDaemon extends EventEmitter {
    private execution: ExecutionManager;
    private memory: MetaLearningEngine;
    private isAwake: boolean = false;

    private static instance: MaiaDaemon;

    private constructor() {
        super();
        this.execution = getExecutionManager();
        this.memory = getMetaLearningEngine();

        // Bind the neural pathways
        this.bindEvents();
    }

    public static getInstance(): MaiaDaemon {
        if (!MaiaDaemon.instance) {
            MaiaDaemon.instance = new MaiaDaemon();
        }
        return MaiaDaemon.instance;
    }

    /**
     * WAKEUP: Start the Daemon's event loop
     */
    public async wakeUp() {
        if (this.isAwake) return;

        console.log('🦅 MAIA DAEMON: Waking up...');

        // Ensure the body is ready
        // (ExecutionManager constructor handles its own init, but we can double check)

        this.isAwake = true;
        console.log('🦅 MAIA DAEMON: Online and Listening.');
        this.emit('awake');
    }

    /**
     * DISPATCH: The core command function.
     * "I need you to [instruction]" -> Agent Task.
     */
    public async dispatch(instruction: string, preferredAgent?: string): Promise<ExecutionTask> {
        if (!this.isAwake) await this.wakeUp();

        // 1. Decide Agent (Simple routing for now, can be LLM-based later)
        const agentId = preferredAgent || this.decideAgent(instruction);

        // 2. Create the Task in the Execution Manager
        const task = await this.execution.createTask(
            `Dispatch: ${instruction.slice(0, 30)}...`,
            instruction,
            {
                agentId,
                priority: 'normal'
            }
        );

        console.log(`🦅 MAIA DAEMON: Dispatched task ${task.id} to @${agentId}`);

        // 3. Start it (if in sequential mode, it queues; parallel starts immediately)
        // The ExecutionManager handles the queue logic.
        // If we want to FORCE start it (e.g. background task tool):
        await this.execution.startTask(task.id);

        return task;
    }

    /**
     * DECIDE AGENT: Simple heuristic routing.
     * In the future, this will use the "Council" or an LLM call.
     */
    private decideAgent(instruction: string): string {
        const text = instruction.toLowerCase();

        if (text.includes('research') || text.includes('search') || text.includes('find')) return 'researcher';
        if (text.includes('test') || text.includes('audit') || text.includes('review')) return 'reviewer';
        if (text.includes('script') || text.includes('deploy') || text.includes('install')) return 'ops';
        if (text.includes('plan') || text.includes('roadmap')) return 'prometheus';
        if (text.includes('ui') || text.includes('frontend') || text.includes('css')) return 'frontend';

        return 'coder'; // Default doer
    }

    /**
     * BIND EVENTS: Wiring the Brain to the Body
     */
    private bindEvents() {
        // We need to modify ExecutionManager to emit this event,
        // OR we just hook into the completeTask method wrapper if we had one.
        // For now, let's assume we will Refactor ExecutionManager to emit events.

        // TEMPORARY: Since ExecutionManager doesn't emit 'taskCompleted' yet (Phase 3),
        // we will rely on the tool-level integration to call logTaskOutcome.
        // BUT, the Roadmap says we MUST wire this.

        // So, in Phase 3 we will add `this.emit('taskCompleted')` to ExecutionManager.
        // Here we prepare the listener.
        // @ts-ignore - Event will exist after Phase 3 refactor
        this.execution.on('taskCompleted', async (task: ExecutionTask) => {
            console.log(`🦅 MAIA DAEMON: Observed completion of ${task.id}`);

            // Feed the Memory
            // We use the helper `logTaskOutcome` which talks to MetaLearning
            logTaskOutcome(
                task.id,
                task.agentId || 'unknown',
                task.title,
                task.description,
                task.status === 'completed',
                { failure_reason: task.error }
            );

            // Initial "Self-Correction" Logic (Phase 4 groundwork)
            if (task.status === 'failed') {
                const memory = getMemoryStore();
                // TODO: Analyze failure patterns here (Phase 4)
            }
        });
    }
}

// Singleton Export
export function getMaiaDaemon(): MaiaDaemon {
    return MaiaDaemon.getInstance();
}
