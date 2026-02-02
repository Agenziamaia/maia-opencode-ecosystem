# MAIA Orchestrator Architecture

## Overview

The MAIA Orchestrator is the strategic brain of the MAIA ecosystem. It sits above the MaiaDaemon and ExecutionManager, providing intelligent planning, decomposition, and coordination capabilities for complex multi-agent workflows.

```
┌─────────────────────────────────────────────────────────────┐
│                      USER OBJECTIVE                          │
│                  "Build a REST API"                          │
└──────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   MAIA ORCHESTRATOR                          │
│                  (Strategic Layer)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Planning   │→ │ Decomposition│→ │  Assignment  │      │
│  │     Phase    │  │    Phase     │  │    Phase     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Execution   │→ │  Synthesis   │→ │   Learning   │      │
│  │    Phase     │  │    Phase     │  │    Phase     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    MAIA DAEMON                               │
│                   (Dispatch Layer)                           │
│  - Routes individual tasks to agents                        │
│  - Monitors execution                                       │
│  - Handles retries and fallbacks                            │
└──────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXECUTION MANAGER                           │
│              (Task Execution Layer)                          │
│  - Queue management                                         │
│  - Parallel/sequential execution                            │
│  - Worktree isolation                                       │
└─────────────────────────────────────────────────────────────┘
```

## Layers

### 1. MAIA Orchestrator (Strategic Layer)

**File**: `.opencode/ecosystem/orchestrator/maia-orchestrator.ts`

**Responsibilities**:
- Receives natural language objectives from users
- Creates execution plans with strategy and estimates
- Decomposes complex objectives into subtasks with dependencies
- Routes tasks to optimal agents using DNA/pattern learning
- Orchestrates multi-agent workflows (parallel/sequential)
- Synthesizes results into final deliverables
- Learns from every execution via meta-learning

**Key Methods**:
- `createPlan(objective: string): Promise<ExecutionPlan>`
- `decomposeTasks(plan: ExecutionPlan): Promise<SubTask[]>`
- `assignAgents(tasks: SubTask[]): Promise<AssignedTask[]>`
- `executeWorkflow(workflow: Workflow): Promise<WorkflowResult>`
- `synthesizeResults(workflowId, taskResults): Promise<Deliverable>`
- `orchestrate(objective: string): Promise<Deliverable>` (main entry point)

### 2. MaiaDaemon (Dispatch Layer)

**File**: `.opencode/ecosystem/execution/maia-daemon.ts`

**Responsibilities**:
- Routes individual tasks to agents
- Monitors task execution
- Handles retries and fallbacks
- Logs task outcomes for meta-learning

**Key Methods**:
- `dispatch(instruction: string, preferredAgent?: string): Promise<ExecutionTask>`
- `decideAgent(instruction: string): string`
- `monitorTaskHealth(taskId: string): void`

### 3. ExecutionManager (Execution Layer)

**File**: `.opencode/ecosystem/execution/execution-manager.ts`

**Responsibilities**:
- Queue management
- Parallel/sequential execution modes
- Git worktree isolation
- Collision detection
- Task lifecycle management

**Key Methods**:
- `createTask(title, description, options): Promise<ExecutionTask>`
- `startTask(taskId: string): Promise<boolean>`
- `completeTask(taskId: string, success, error?): Promise<void>`
- `checkCollisions(taskId, files): CollisionResult`

## Key Differences

| Aspect | **MAIA Orchestrator** | **MaiaDaemon** | **ExecutionManager** |
|:------:|:---------------------|:--------------|:-------------------|
| **Layer** | Strategic | Dispatch | Execution |
| **Role** | Brain/Planner | Router/Dispatcher | Executor |
| **Input** | Natural language objectives | Pre-defined tasks | Task definitions |
| **Output** | Complete deliverables | Task execution status | Task completion events |
| **Scope** | Full workflow orchestration | Single task routing | Low-level task execution |
| **Planning** | Decomposes objectives | Routes existing tasks | Manages task lifecycle |
| **DNA Usage** | Pattern matching for decomposition | Agent recommendation | N/A |
| **Execution** | Multi-agent workflows | Single task execution | Task queue management |

## Type Definitions

### ExecutionPlan
```typescript
interface ExecutionPlan {
  id: string;
  objective: string;
  objectiveType: 'trivial' | 'complex' | 'strategic';
  strategy: 'direct' | 'sequential' | 'parallel' | 'hybrid';
  estimatedDuration: number;
  confidence: number;
  reasoning: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}
```

### SubTask
```typescript
interface SubTask {
  id: string;
  planId: string;
  title: string;
  description: string;
  type: string;
  dependencies: string[];
  priority: 'urgent' | 'high' | 'normal' | 'low';
  estimatedDuration: number;
  requiredCapabilities: string[];
  recommendedAgents: AgentId[];
  status: 'pending' | 'assigned' | 'running' | 'completed' | 'failed' | 'skipped';
  assignedAgent?: AgentId;
  executionTaskId?: string;
  result?: TaskResult;
}
```

### Workflow
```typescript
interface Workflow {
  id: string;
  planId: string;
  objective: string;
  tasks: AssignedTask[];
  executionGraph: ExecutionGraph;
  status: 'planning' | 'ready' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  metadata: Record<string, unknown>;
}
```

### Deliverable
```typescript
interface Deliverable {
  workflowId: string;
  objective: string;
  summary: string;
  artifacts: Artifact[];
  taskResults: TaskResult[];
  metrics: DeliverableMetrics;
  synthesizedAt: string;
  nextActions?: string[];
}
```

## Usage Example

```typescript
import { getMaiaOrchestrator } from '.opencode/ecosystem/orchestrator';

// Get the orchestrator instance
const orchestrator = getMaiaOrchestrator({
  maxParallelTasks: 3,
  enableDNALearning: true,
  taskTimeout: 5 * 60 * 1000, // 5 minutes
});

// Orchestrate a complex objective
const deliverable = await orchestrator.orchestrate('Build a REST API for user management');

console.log(deliverable.summary);
console.log('Success Rate:', deliverable.metrics.successRate);
console.log('Duration:', deliverable.metrics.totalDuration / 1000, 'seconds');
console.log('Artifacts:', deliverable.artifacts);
```

## Files Created/Modified

### Created Files:
1. `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/maia-orchestrator.ts` - Main orchestrator class
2. `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/index.ts` - Module exports
3. `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/ARCHITECTURE.md` - This file

### Modified Files:
1. `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/index.ts` - Added orchestrator export
2. `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/execution/index.ts` - Added MaiaDaemon export
3. `/Users/g/Desktop/MAIA opencode/.opencode/agents/maia.md` - Updated agent documentation

## Integration Points

### With MaiaDaemon
The Orchestrator calls `MaiaDaemon.dispatch()` for each task in the workflow. The Daemon handles the low-level routing and monitoring.

### With ExecutionManager
The MaiaDaemon uses `ExecutionManager` to create and manage tasks. The Orchestrator receives events from the ExecutionManager to track workflow progress.

### With AgentManager
The Orchestrator uses `AgentManager` to:
- Get agent availability
- Perform health checks
- Get agent recommendations
- Assign backup agents

### With DNATracker
The Orchestrator uses `DNATracker` to:
- Find patterns in task history
- Match new tasks to successful patterns
- Recommend agents based on past performance
- Learn from completed workflows

### With MetaLearning
The Orchestrator integrates with `MetaLearningEngine` to:
- Log task outcomes
- Update pattern library
- Improve future recommendations

## Event Flow

```
User Objective
    ↓
orchestrate(objective)
    ↓
createPlan() → ExecutionPlan
    ↓
decomposeTasks() → SubTask[]
    ↓
assignAgents() → AssignedTask[]
    ↓
createWorkflow() → Workflow
    ↓
executeWorkflow()
    ├─→ executeParallelGroups() [for parallel/hybrid]
    └─→ executeSequential() [for sequential]
    ↓
synthesizeResults() → Deliverable
    ↓
Return to User
```

## Next Steps

1. **Testing**: Add unit tests for the orchestrator
2. **Integration**: Test orchestrator with actual agents
3. **Optimization**: Fine-tune DNA matching algorithms
4. **Monitoring**: Add observability and metrics
5. **Documentation**: Create user guide and API reference
