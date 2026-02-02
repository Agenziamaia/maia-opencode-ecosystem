import { tool } from "@opencode-ai/plugin";
import { getExecutionManager } from '../execution/execution-manager.js';

export const background_output = tool({
    description: "Get the output/status of a background task.",
    args: {
        taskId: tool.schema.string().describe("The ID of the task to check.")
    },
    async execute(args) {
        const manager = getExecutionManager();
        const task = manager.getTask(args.taskId);

        if (!task) {
            return `Task ${args.taskId} not found.`;
        }

        return `Task ${task.id} Status: ${task.status}\nResult: ${JSON.stringify(task.metadata?.result || 'No result yet')}\nError: ${task.error || 'None'}`;
    }
});
