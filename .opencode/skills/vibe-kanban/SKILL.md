# Vibe Kanban Orchestration Skill

**Domain**: Multi-Agent Task Management & Kanban-First Orchestration  
**Version**: 1.0.0  
**Agents**: All MAIA agents

---

## 🎯 Purpose

Transform MAIA from simple agent delegation into structured, visual, conflict-free multi-agent orchestration using Vibe Kanban's 4-column workflow.

## ⚠️ Critical Reality Check: "Tasks" vs "Execution"

In Vibe Kanban, a **task card** is not execution.

- **Execution** only happens when a **task attempt / workspace session** is started.
- Starting an attempt requires a **repo-backed project** (a git repository attached to the project).

If a project has **no repositories attached**, tasks will sit in **To Do** with **Attempts (0)**.

## ⚠️ Executors may require paid credits

Vibe Kanban's executors are _external_ coding agents. Some require paid credits.

- **AMP**: may require paid credits in non-interactive environments (can error with "requires paid credits").
- **OpenCode (in Vibe Kanban)** refers to **SST OpenCode** (`npx -y opencode-ai`) and is **not** the same as this repo's `opencode` CLI.

**Policy**: Do not start paid executors by default. Ask user which executor is acceptable.

## ✅ Recommended Default: Tracker-Only Mode

Unless the user explicitly opts into a specific executor, treat Vibe Kanban as:

- the **system-of-record** for tasks, status, links, and artifacts
- not the system that actually runs paid coding agents

In tracker-only mode:

- MAIA agents execute work via this orchestration layer (coder/ops/researcher/reviewer)
- MAIA updates Vibe Kanban statuses to reflect _real_ progress
- No Vibe Kanban task attempts are created automatically

---

## 📋 Kanban Board Structure

```
┌─────────────────────────────────────────────────────────────┐
│  TO DO          │  IN PROGRESS      │  IN REVIEW    │  DONE  │
│  ─────────────  │  ──────────────   │  ──────────   │  ──────│
│  • New tasks    │  • Active agents  │  • Awaiting   │  • Done│
│  • Backlog      │  • Running work   │    review     │  • Merged│
│  • Prioritized  │  • Real-time      │  • Diff view  │        │
│                 │    monitoring     │  • Approvals  │        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 MCP Tools Available

### Task Management

| Tool                        | Usage                           |
| --------------------------- | ------------------------------- |
| `vibe_kanban_list_projects` | List all Vibe Kanban projects   |
| `vibe_kanban_list_tasks`    | List tasks in a specific column |
| `vibe_kanban_create_task`   | Create new task in TO DO        |
| `vibe_kanban_get_task`      | Get task details with attempts  |
| `vibe_kanban_update_task`   | Move task between columns       |
| `vibe_kanban_delete_task`   | Remove task from board          |

### Execution Control

| Tool                                  | Usage                       |
| ------------------------------------- | --------------------------- |
| `vibe_kanban_start_workspace_session` | Start agent work on task    |
| `vibe_kanban_get_context`             | Get current workspace state |

---

## 🚀 MAIA Orchestration Workflow

### Step 1: Parse User Intent → Kanban Tasks

```javascript
// User says: "Build auth system with JWT, secure database, and React UI"

// MAIA translates to:
await vibe_kanban_create_task({
  title: "Research JWT auth patterns and security requirements",
  description: "Analyze JWT vs Session, OAuth2 flows, security best practices",
  project_id: currentProject,
  tags: ["research", "auth", "security"],
});

await vibe_kanban_create_task({
  title: "Design secure database schema for users",
  description: "Password hashing, session storage, role-based access",
  project_id: currentProject,
  tags: ["backend", "database", "security"],
});

await vibe_kanban_create_task({
  title: "Implement JWT authentication API",
  description: "Express/Node endpoints: login, register, refresh token",
  project_id: currentProject,
  tags: ["backend", "api", "auth"],
});

await vibe_kanban_create_task({
  title: "Build React login/register UI",
  description: "Components, form validation, error handling",
  project_id: currentProject,
  tags: ["frontend", "ui", "auth"],
});
```

### Step 2: Parallel Agent Execution

```javascript
// Fire multiple agents in parallel (no conflicts - isolated worktrees)
background_task(
  (agent = "researcher"),
  (prompt = "Research JWT auth patterns..."),
);
background_task(
  (agent = "ops"),
  (prompt = "Design secure database infrastructure..."),
);
background_task(
  (agent = "coder"),
  (prompt = "Implement auth API per research..."),
);
// Frontend waits for API spec
```

### Step 3: Status Tracking

```javascript
// Each agent updates task status:
await vibe_kanban_update_task({
  task_id: taskId,
  status: "in_progress", // Moves from TO DO → IN PROGRESS
});

// When complete:
await vibe_kanban_update_task({
  task_id: taskId,
  status: "in_review", // Moves to IN REVIEW for reviewer
});
```

### Step 4: Quality Gate (Reviewer)

```javascript
// Reviewer sees task in IN REVIEW column
// Reviews code diff, adds comments, approves/denies
await vibe_kanban_update_task({
  task_id: taskId,
  status: "done", // Approved → DONE
});
```

---

## 💬 Natural Language → Kanban Translation

### User Input Patterns

| User Says                        | MAIA Creates                             |
| -------------------------------- | ---------------------------------------- |
| "Analyze X"                      | Research task in TO DO                   |
| "Build X"                        | Implementation task in TO DO             |
| "Plan X"                         | Planning task, then subtasks             |
| "Deploy X"                       | Ops task in TO DO                        |
| "Review X"                       | Review task in TO DO                     |
| "Research 3 options in parallel" | 3 research tasks, fire background agents |

### Example Translations

```
User: "Analyze 3 auth libraries, plan minimal secure integration,
       get reviewer approval"

┌────────────────────────────────────────────────────────────┐
│  TO DO (3 tasks created)                                  │
│  ├─ Research: Auth0 vs Clerk vs Supabase                  │
│  ├─ Research: JWT implementation patterns                 │
│  ├─ Research: Security audit checklist                    │
│                                                            │
│  → 3 background research agents fire in parallel          │
│                                                            │
│  MAIA synthesizes findings → Creates integration plan     │
│  → Moves to IN PROGRESS (ops task)                        │
│                                                            │
│  → Complete → IN REVIEW (reviewer task)                   │
│  → Reviewer approves → DONE                               │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Message Mode for Agent Handoffs

### When to Use Message Mode

Message mode preserves exact context between agents when:

1. **Sequential dependencies** - Agent B MUST see Agent A's exact output
2. **Complex synthesis** - Reviewer needs to see all research combined
3. **Hierarchical tasks** - Subtasks inherit parent context

### How It Works

```javascript
// Agent A (researcher) completes task
session({
  mode: "message",
  agent: "maia", // Return to orchestrator
  text: `Research Complete:
  
  Finding 1: JWT libraries analyzed (jsonwebtoken, jose, Auth0)
  Finding 2: Security patterns (rotating refresh tokens, httpOnly)
  Finding 3: Compliance requirements (GDPR, SOC2)
  
  RECOMMENDATION: jose for Node.js with rotating refresh tokens`,
});

// MAIA synthesizes and hands off to next agent
session({
  mode: "message",
  agent: "coder",
  text: `Auth Implementation Spec:
  
  Based on research findings:
  - Use 'jose' library (modern, TypeScript support)
  - Implement rotating refresh tokens with short expiry
  - HttpOnly cookies for token storage
  
  Implementation requirements:
  - POST /auth/login
  - POST /auth/register  
  - POST /auth/refresh
  - Middleware for protected routes`,
});
```

### Message Mode Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Researcher ──message──→ MAIA (synthesize)                 │
│         │                    │                               │
│         │                    ├──message──→ Coder            │
│         │                    │                               │
│         │                    │    ┌──message──→ Reviewer    │
│         │                    │    │                         │
│         │                    │    │    ┌──message──→ MAIA   │
│         │                    │    │    │                    │
│         │                    │    │    └──→ DONE            │
│         │                    │    │                         │
│         │                    │    └─→ (approve/deny)        │
│         │                    │                              │
│         └────────────────────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Parallel vs Sequential Decision Tree

```
Task Received
    ↓
Is this research-only with no dependencies?
    ├─ YES → Create 3 tasks, fire 3 background research agents
    └─ NO ↓

Does this require sequential implementation?
    ├─ YES → Create tasks, fire 1 agent, use message mode for handoff
    └─ NO ↓

Can frontend and backend work in parallel?
    ├─ YES → Create 2 tasks, fire coder + ops in parallel
    └─ NO → Single task, single agent
```

---

## 🛡️ Conflict Prevention Patterns

### 1. File-Level Locking (Automatic via Git Worktrees)

Vibe Kanban uses **git worktrees** to isolate each task:

- Task A → `worktrees/feature/task-a/`
- Task B → `worktrees/feature/task-b/`
- No overlapping file edits

### 2. Column-Based Semaphores

```javascript
// Before starting work on a task:
const tasksInProgress = await vibe_kanban_list_tasks({
  project_id: projectId,
  status: "in_progress",
});

// If > 3 tasks in progress, wait or queue
if (tasksInProgress.length >= 3) {
  // MAIA should queue or prioritize
}
```

### 3. Communication Channels

| Pattern          | Channel            | Use Case                 |
| ---------------- | ------------------ | ------------------------ |
| **Broadcast**    | MAIA → All agents  | Initial task assignment  |
| **Message Mode** | Agent → Agent      | Sequential handoffs      |
| **Background**   | Agent → Background | Parallel exploration     |
| **Kanban**       | Visual board       | Status, review, approval |

---

## 🎯 MAIA Message Mode Integration

### Pre-Handoff Checklist

Before using `session({ mode: "message", agent: "next", ... })`:

```javascript
// 1. Verify current task is complete
const task = await vibe_kanban_get_task({ task_id: currentTaskId });
if (task.status !== "in_review") {
  await vibe_kanban_update_task({
    task_id: currentTaskId,
    status: "in_review"
  });
}

// 2. Prepare handoff payload
const handoffPayload = {
  sourceAgent: "researcher",
  taskId: task.id,
  summary: "Complete research findings...",
  artifacts: [...],  // Files created, data gathered
  recommendations: "Use X because Y...",
  nextSteps: "Implement A, then B, then C"
};

// 3. Use message mode with complete context
session({
  mode: "message",
  agent: "coder",
  text: `TASK HANDOFF: Auth Implementation

  ${JSON.stringify(handoffPayload, null, 2)}

  Please implement per recommendations.`
});
```

---

## 📊 Natural Language Commands

### Task Creation

```
"Create a task to analyze auth libraries"
  → vibe_kanban_create_task({ title: "Analyze auth libraries" })

"Create 3 parallel research tasks for auth, database, and UI"
  → 3 tasks created in TO DO, 3 background agents fired
```

### Agent Delegation

```
"Run research on JWT patterns"
  → background_task(agent="researcher", ...) + status update

"Have coder implement the API based on findings"
  → session({ mode: "message", agent: "coder", ... })

"Get reviewer approval for the plan"
  → session({ mode: "message", agent: "reviewer", ... })
```

### Status Updates

```
"When researcher completes, have coder start"
  → Message mode handoff on completion

"Move task to in review when done"
  → vibe_kanban_update_task({ status: "in_review" })

"Approve task when reviewer is happy"
  → vibe_kanban_update_task({ status: "done" })
```

---

## 🎬 Example: Complete Workflow

### User Input

```
"Analyze 3 state management options for React (Redux, Zustand,
Jotai), have ops plan the migration, then get reviewer approval
for the most maintainable solution"
```

### MAIA Execution

```javascript
// 1. Parse → Create 3 research tasks
await vibe_kanban_create_task({ title: "Research Redux for React" });
await vibe_kanban_create_task({ title: "Research Zustand for React" });
await vibe_kanban_create_task({ title: "Research Jotai for React" });

// 2. Fire 3 parallel research agents
background_task((agent = "researcher"), (prompt = "Analyze Redux patterns..."));
background_task(
  (agent = "researcher"),
  (prompt = "Analyze Zustand patterns..."),
);
background_task((agent = "researcher"), (prompt = "Analyze Jotai patterns..."));

// 3. Collect findings (background_output)
const findings = await background_output();

// 4. MAIA synthesizes, creates planning task
await vibe_kanban_create_task({
  title: "Plan React state management migration",
  description: `Based on research:
  ${findings.summary}
  
  Recommendation: ${findings.recommendation}`,
});

// 5. Message handoff to ops
session({
  mode: "message",
  agent: "ops",
  text: `Plan the migration to ${findings.recommendation}
  
  Requirements:
  - Minimal breaking changes
  - Migration strategy (gradual vs big bang)
  - Timeline and dependencies
  - Rollback plan`,
});

// 6. Ops creates plan, moves to IN REVIEW
await vibe_kanban_update_task({ status: "in_review" });

// 7. Reviewer approves/denies
session({
  mode: "message",
  agent: "reviewer",
  text: `Review the migration plan for:
  - Technical soundness
  - Security implications
  - Maintainability`,
});

// 8. Approved → DONE
await vibe_kanban_update_task({ status: "done" });
```

---

## 🛠️ Tool Reference

### vibe_kanban_create_task

```typescript
{
  project_id: UUID,           // Required - project to add task to
  title: string,              // Required - task title
  description?: string,       // Optional - detailed description
  tags?: string[],            // Optional - e.g., ["frontend", "backend"]
  status?: "todo" | "in_progress" | "in_review" | "done" | "cancelled"
}
```

### vibe_kanban_update_task

```typescript
{
  task_id: UUID,              // Required - task to update
  status: TaskStatus,         // Required - new column
  title?: string,             // Optional - rename
  description?: string,       // Optional - update description
  tags?: string[]             // Optional - update tags
}
```

### vibe_kanban_list_tasks

```typescript
{
  project_id: UUID,           // Required - project to list
  status?: TaskStatus,        // Optional - filter by column
  limit?: number              // Optional - max results
}
```

### vibe_kanban_start_workspace_session

```typescript
{
  task_id: UUID,              // Required - task to work on
  agent: "coder" | "ops" | "researcher",  // Agent variant
  variant?: string            // Optional - agent variant (PLAN, DEFAULT, etc.)
}
```

---

## ⚡ Quick Reference

| Pattern                | Command                       | Tools                                             |
| ---------------------- | ----------------------------- | ------------------------------------------------- |
| **Create task**        | "Create task to build X"      | `vibe_kanban_create_task`                         |
| **Parallel research**  | "Analyze X, Y, Z in parallel" | `background_task` ×3                              |
| **Sequential handoff** | "When done, have X do Y"      | `session({ mode: "message" })`                    |
| **Status update**      | "Move to in review"           | `vibe_kanban_update_task`                         |
| **Quality gate**       | "Get reviewer approval"       | `session({ mode: "message", agent: "reviewer" })` |
| **Complete**           | "Done!"                       | `vibe_kanban_update_task({ status: "done" })`     |

---

_Skill Version: 1.0.0 | Updated: 2024 | For MAIA Multi-Agent Ecosystem_
