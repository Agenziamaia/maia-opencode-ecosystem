/**
 * VibeKanban MCP Tools
 *
 * Direct integration with VibeKanban for task management.
 * These are the tools that agents like MAIA and Sisyphus use to manage the Kanban board.
 */

import { tool } from "@opencode-ai/plugin";
// Hardcoded logger removed. Using console.
const logger = {
  info: (msg: string, meta?: any) => console.log(`[VibeKanban] ${msg}`, meta || ''),
  error: (msg: string, meta?: any) => console.error(`[VibeKanban] ${msg}`, meta || ''),
};

const getBaseUrl = () => process.env.VIBE_KANBAN_URL || `http://${process.env.VIBE_KANBAN_HOST || '127.0.0.1'}:${process.env.VIBE_KANBAN_PORT || '62601'}`;

/**
 * Get the default project ID (MAIA's home base)
 */
function getDefaultProjectId(): string {
  return process.env.VIBE_KANBAN_DEFAULT_PROJECT_ID || "62f05a9c-1c5a-4041-b4ae-2f98882af10b";
}

/**
 * VIBE_KANBAN_CREATE_TASK - Create a new task on the Kanban board
 */
export const vibe_kanban_create_task = tool({
  description: "Create a new task on the VibeKanban board",
  args: {
    project_id: tool.schema.string().optional().describe("Project ID (default: MAIA opencode project)"),
    title: tool.schema.string().describe("Task title"),
    description: tool.schema.string().optional().describe("Task description"),
    status: tool.schema.enum(["todo", "in_progress", "in_review", "done"]).optional().describe("Initial status (default: todo)"),
    tags: tool.schema.array(tool.schema.string()).optional().describe("Tags for the task"),
  },
  async execute(args) {
    const projectId = args.project_id || getDefaultProjectId();

    try {
      const res = await fetch(`${getBaseUrl()}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title: args.title,
          description: args.description || "",
          status: args.status || "todo",
          tags: args.tags || [],
        }),
      });

      if (!res.ok) {
        return `❌ Failed to create task: HTTP ${res.status}\n\nMake sure VibeKanban is running on ${getBaseUrl()}`;
      }

      const data = await res.json();

      if (!data.success) {
        return `❌ API Error: ${JSON.stringify(data.error_data || data.error)}`;
      }

      const task = data.data;

      logger.info('VibeKanban task created', {
        taskId: task.id,
        title: task.title,
        status: task.status,
      });

      return `✅ Task created on VibeKanban\n\nTask ID: ${task.id}\nTitle: ${task.title}\nStatus: ${task.status}\nProject: ${projectId}\n\nView at: ${getBaseUrl()}/project/${projectId}`;
    } catch (error) {
      return `❌ Failed to connect to VibeKanban: ${error}\n\nMake sure VibeKanban is running on ${getBaseUrl()}`;
    }
  },
});

/**
 * VIBE_KANBAN_UPDATE_TASK - Update task status and details
 */
export const vibe_kanban_update_task = tool({
  description: "Update a task on the VibeKanban board",
  args: {
    task_id: tool.schema.string().describe("Task ID to update"),
    status: tool.schema.enum(["todo", "in_progress", "in_review", "done"]).optional().describe("New status"),
    title: tool.schema.string().optional().describe("New title"),
    description: tool.schema.string().optional().describe("New description"),
    add_tag: tool.schema.string().optional().describe("Tag to add"),
  },
  async execute(args) {
    try {
      // First get the current task to preserve fields
      const getRes = await fetch(`${getBaseUrl()}/api/tasks/${args.task_id}`);
      if (!getRes.ok) {
        return `❌ Task ${args.task_id} not found`;
      }

      const getData = await getRes.json();
      const currentTask = getData.data;

      // Build update payload
      const updates: any = {};
      if (args.status) updates.status = args.status;
      if (args.title) updates.title = args.title;
      if (args.description !== undefined) updates.description = args.description;

      // Handle tags
      let tags = currentTask.tags || [];
      if (args.add_tag && !tags.includes(args.add_tag)) {
        tags = [...tags, args.add_tag];
      }

      updates.tags = tags;

      const res = await fetch(`${getBaseUrl()}/api/tasks/${args.task_id}`, {
        method: "PATCH" || "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        return `❌ Failed to update task: HTTP ${res.status}`;
      }

      const data = await res.json();
      if (!data.success) {
        return `❌ API Error: ${JSON.stringify(data.error_data || data.error)}`;
      }

      const task = data.data;

      logger.info('VibeKanban task updated', {
        taskId: task.id,
        status: task.status,
      });

      return `✅ Task updated\n\nTask ID: ${task.id}\nTitle: ${task.title}\nStatus: ${task.status}\nTags: ${tags.join(', ') || 'None'}`;
    } catch (error) {
      return `❌ Failed to connect to VibeKanban: ${error}`;
    }
  },
});

/**
 * VIBE_KANBAN_LIST_TASKS - List tasks with optional filtering
 */
export const vibe_kanban_list_tasks = tool({
  description: "List tasks from VibeKanban with optional filtering",
  args: {
    project_id: tool.schema.string().optional().describe("Filter by project ID"),
    status: tool.schema.enum(["todo", "in_progress", "in_review", "done"]).optional().describe("Filter by status"),
    tag: tool.schema.string().optional().describe("Filter by tag"),
    limit: tool.schema.number().optional().describe("Maximum results (default: 50)"),
  },
  async execute(args) {
    try {
      const params = new URLSearchParams();
      if (args.project_id) params.append('project_id', args.project_id);
      if (args.status) params.append('status', args.status);
      if (args.limit) params.append('limit', args.limit.toString());

      const res = await fetch(`${getBaseUrl()}/api/tasks?${params}`);

      if (!res.ok) {
        return `❌ Failed to fetch tasks: HTTP ${res.status}`;
      }

      const data = await res.json();

      if (!data.success) {
        return `❌ API Error: ${JSON.stringify(data.error)}`;
      }

      const tasks = data.data || [];

      if (tasks.length === 0) {
        return `📋 No tasks found${args.status ? ` with status "${args.status}"` : ''}${args.tag ? ` with tag "${args.tag}"` : ''}`;
      }

      // Filter by tag if specified
      let filteredTasks = tasks;
      if (args.tag) {
        filteredTasks = tasks.filter((t: any) => (t.tags || []).includes(args.tag));
      }

      let output = `📋 VibeKanban Tasks\n\n`;
      output += `Found: ${filteredTasks.length} task(s)\n\n`;

      for (const task of filteredTasks.slice(0, args.limit || 50)) {
        const statusEmoji = {
          todo: '📝',
          in_progress: '🔄',
          in_review: '👀',
          done: '✅',
        }[task.status] || '📌';

        output += `${statusEmoji} ${task.id}\n`;
        output += `   Title: ${task.title}\n`;
        output += `   Status: ${task.status}\n`;
        if (task.tags && task.tags.length > 0) {
          output += `   Tags: ${task.tags.join(', ')}\n`;
        }
        output += `\n`;
      }

      return output;
    } catch (error) {
      return `❌ Failed to connect to VibeKanban: ${error}`;
    }
  },
});

/**
 * VIBE_KANBAN_GET_PROJECTS - List all projects
 */
export const vibe_kanban_get_projects = tool({
  description: "Get all projects from VibeKanban",
  args: {},
  async execute() {
    try {
      const res = await fetch(`${getBaseUrl()}/api/projects`);

      if (!res.ok) {
        return `❌ Failed to fetch projects: HTTP ${res.status}`;
      }

      const data = await res.json();

      if (!data.success) {
        return `❌ API Error: ${JSON.stringify(data.error)}`;
      }

      const projects = data.data || [];

      if (projects.length === 0) {
        return `📁 No projects found`;
      }

      let output = `📁 VibeKanban Projects\n\n`;

      for (const project of projects) {
        const isDefault = project.id === getDefaultProjectId();
        output += `${isDefault ? '⭐ ' : ''}${project.id}\n`;
        output += `   Name: ${project.name}\n`;
        output += `   Tasks: ${project.task_count || 0}\n\n`;
      }

      output += `\nDefault project: ${getDefaultProjectId()}`;

      return output;
    } catch (error) {
      return `❌ Failed to connect to VibeKanban: ${error}`;
    }
  },
});

/**
 * VIBE_KANBAN_DELETE_TASK - Delete a task
 */
export const vibe_kanban_delete_task = tool({
  description: "Delete a task from VibeKanban",
  args: {
    task_id: tool.schema.string().describe("Task ID to delete"),
  },
  async execute(args) {
    try {
      const res = await fetch(`${getBaseUrl()}/api/tasks/${args.task_id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        return `❌ Failed to delete task: HTTP ${res.status}`;
      }

      const data = await res.json();

      if (!data.success) {
        return `❌ API Error: ${JSON.stringify(data.error)}`;
      }

      logger.info('VibeKanban task deleted', { taskId: args.task_id });

      return `✅ Task deleted\n\nTask ID: ${args.task_id}`;
    } catch (error) {
      return `❌ Failed to connect to VibeKanban: ${error}`;
    }
  },
});
