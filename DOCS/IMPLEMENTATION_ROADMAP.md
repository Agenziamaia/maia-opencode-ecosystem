# MAIA ECOSYSTEM - IMPLEMENTATION ROADMAP

**Technical Program Manager Edition**

**Version:** 1.0
**Date:** February 1, 2026
**Status:** Ready for Development
**Total Timeline:** 4 Weeks (20 Business Days)

---

## EXECUTIVE SUMMARY

This roadmap provides a production-ready implementation plan for the MAIA Living Ecosystem, building on Phase 1 foundation (complete) to deliver a fully operational multi-agent orchestration system with learning capabilities.

### Current State Assessment
| Component | Status | Notes |
|-----------|--------|-------|
| DNA Tracker | ✅ Complete | Pattern recognition functional |
| Council Manager | ✅ Complete | Voting system operational |
| Agent Manager | ✅ Complete | 19 agents registered |
| Session Tool | ⚠️ Mock Only | Returns formatted strings, no real execution |
| Dashboard Frontend | ✅ Complete | All components built, using mock data |
| VibeKanban Integration | 🚧 Partial | API routes ready, needs real connection |
| Git Repository | ⚠️ Needs Cleanup | Untracked files, uncommitted changes |
| Meta-Learning | ✅ Complete | Weekly sync, prompt optimization ready |
| Execution Manager | ✅ Complete | Parallel/Sequential modes implemented |

### Critical Path Items
1. **Git Repository Cleanup** (Blocker for Week 2)
2. **Session Tool Real Implementation** (Blocker for orchestration)
3. **VibeKanban Real Integration** (Blocker for dashboard live data)
4. **Main Orchestrator** (Depends on #1, #2)

---

## PHASE 1: CRITICAL FIXES (Week 1 - Days 1-5)

### Objective
Resolve all blocking issues that prevent reliable multi-agent orchestration.

---

### 1.1 Git Repository Cleanup

**Priority:** P0 (Blocker)
**Complexity:** 2 story points (4 hours)
**Risk Level:** Medium (Data loss potential)

#### Files to Modify
- `/Users/g/Desktop/MAIA opencode/.gitignore` - Add ecosystem artifacts
- `/Users/g/Desktop/MAIA opencode/WAKEUP.sh` - Commit or discard changes
- `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/external-tools.ts` - Add to git
- `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/setup_ecosystem.ts` - Add to git
- `/Users/g/Desktop/MAIA opencode/.opencode/gym/agent-lightning/` - Add to git

#### Specific Functions to Implement
```bash
# .gitignore additions
.opencode/ecosystem/execution/.opencode/worktrees/
.opencode/ecosystem/memory/store.json
.opencode/ecosystem/council/state.json
.opencode/ecosystem/dna/patterns.json
*.log
logs/
```

#### Dependencies
- None (can start immediately)

#### Acceptance Criteria
- [ ] All untracked files properly handled (committed or added to .gitignore)
- [ ] `git status` shows clean working directory (or only intentional changes)
- [ ] `.gitignore` prevents ecosystem runtime artifacts from being committed
- [ ] Worktree directories excluded from git tracking
- [ ] State files (DNA, Council, Memory) in .gitignore

#### Testing Approach
```bash
# Verify git status
git status
# Expected: Only intentional changes shown

# Test .gitignore
touch .opencode/ecosystem/execution/.opencode/worktrees/test
git status
# Expected: New file NOT shown

# Verify no accidental state file commits
git log --all --full-history -- "*.json" | grep ecosystem
# Expected: No state files in history
```

#### Risk Mitigation
- **Risk:** Accidentally committing sensitive state files
- **Mitigation:** Comprehensive .gitignore with patterns for all state files
- **Rollback:** `git restore` for any incorrect commits

---

### 1.2 Session Tool Real Implementation

**Priority:** P0 (Blocker)
**Complexity:** 8 story points (16 hours)
**Risk Level:** High (Core orchestration component)

#### Files to Create/Modify

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/session/real-session-manager.ts`

```typescript
// Signature of core functions to implement:
interface RealSessionManager {
  // Execute a handoff to another agent
  executeHandoff(params: {
    agent: string;
    mode: 'message' | 'background' | 'fork';
    context: string;
    timeout_ms: number;
  }): Promise<SessionResult>;

  // Health check before delegation
  healthCheck(agent: string, timeout_ms: number): Promise<HealthStatus>;

  // Get active handoffs
  getActiveHandoffs(): HandoffStatus[];

  // Cancel a handoff
  cancelHandoff(sessionId: string): Promise<boolean>;
}
```

**MODIFY:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/tools/session-tools.ts`
- Replace mock implementation with real session manager calls
- Integrate with OpenCode SDK's agent execution API
- Add timeout wrapping with AbortController
- Implement retry logic with exponential backoff

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/session/handoff-store.ts`

```typescript
// Persistent handoff state store
interface HandoffStore {
  save(sessionId: string, handoff: Handoff): Promise<void>;
  load(sessionId: string): Promise<Handoff | null>;
  list(agent?: string): Promise<Handoff[]>;
  cleanup(olderThan: Date): Promise<number>;
}
```

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/session/health-monitor.ts`

```typescript
// Agent health monitoring
interface HealthMonitor {
  ping(agent: string): Promise<{ alive: boolean; latency_ms: number }>;
  pingAll(): Promise<Map<string, HealthStatus>>;
  getFailureCount(agent: string): number;
  recordFailure(agent: string): void;
  recordSuccess(agent: string): void;
}
```

#### Specific Functions to Implement

**Function 1: `executeHandoff`**
```typescript
async function executeHandoff(params: HandoffParams): Promise<SessionResult> {
  // 1. Validate target agent exists in opencode.json
  // 2. Pre-flight health check (30s timeout)
  // 3. Create handoff session record
  // 4. Execute via OpenCode SDK agent API
  // 5. Wrap with timeout using AbortController
  // 6. Stream results back
  // 7. Handle failures with fallback chain
  // 8. Record outcome for DNA learning
  // 9. Update VibeKanban task status
}
```

**Function 2: `healthCheck`**
```typescript
async function healthCheck(agent: string, timeout_ms: number = 30000): Promise<HealthStatus> {
  // 1. Send lightweight ping prompt
  // 2. Measure response latency
  // 3. Check for recent failures in health monitor
  // 4. Return status with confidence score
  // 5. Cache result for 60 seconds
}
```

**Function 3: `delegateWithFallback`**
```typescript
async function delegateWithFallback(
  taskType: string,
  context: string,
  fallbackChain: string[]
): Promise<SessionResult> {
  // 1. Try primary agent
  // 2. On failure, try fallback agents in order
  // 3. On all failures, return detailed error report
  // 4. Log all attempts for troubleshooting
}
```

#### Dependencies
- Must complete Git Cleanup first (to avoid session tracking issues)
- Requires OpenCode SDK agent execution API access
- Depends on Agent Manager for agent configuration

#### Acceptance Criteria
- [ ] `session()` tool successfully executes real agent handoffs
- [ ] Health checks return accurate status for all 19 agents
- [ ] Timeout protection works (agents killed after configured timeout)
- [ ] Fallback chain activates on primary agent failure
- [ ] Background tasks execute in parallel without blocking
- [ ] Handoff state persists across server restarts
- [ ] All handoffs logged to VibeKanban for visibility

#### Testing Approach
```typescript
// Unit tests
describe('RealSessionManager', () => {
  it('should execute successful handoff to coder agent', async () => {
    const result = await executeHandoff({
      agent: 'coder',
      mode: 'message',
      context: 'Write a hello world function',
      timeout_ms: 60000
    });
    expect(result.status).toBe('completed');
    expect(result.output).toContain('hello');
  });

  it('should timeout unresponsive agent', async () => {
    const result = await executeHandoff({
      agent: 'slow-agent',
      context: 'Take 10 minutes to respond',
      timeout_ms: 5000
    });
    expect(result.status).toBe('timeout');
  });

  it('should fallback on primary agent failure', async () => {
    // Mock primary agent failure
    const result = await delegateWithFallback(
      'coding',
      'Write code',
      ['broken-coder', 'maia', 'ops']
    );
    expect(result.agent).toBe('maia');
    expect(result.fallbackUsed).toBe(true);
  });
});

// Integration tests
describe('Session Integration', () => {
  it('should complete full handoff chain: maia -> coder -> reviewer', async () => {
    // MAIA creates task
    const task = await vibe_kanban_create_task({...});

    // MAIA delegates to coder
    const coderResult = await session({
      agent: 'coder',
      mode: 'message',
      text: `Implement task ${task.id}`
    });

    // Coder delegates to reviewer
    const reviewerResult = await session({
      agent: 'reviewer',
      mode: 'message',
      text: `Review task ${task.id}`
    });

    expect(task.status).toBe('done');
  });
});
```

#### Risk Mitigation
- **Risk:** Handoffs fail silently
- **Mitigation:** Comprehensive logging at each step, status callbacks
- **Risk:** Infinite loops in fallback chain
- **Mitigation:** Max fallback attempts (3), circuit breaker pattern
- **Risk:** State corruption on crashes
- **Mitigation:** Atomic write operations, state file validation on load

---

### 1.3 Comprehensive Test Coverage

**Priority:** P1 (High)
**Complexity:** 5 story points (10 hours)
**Risk Level:** Low (Testing infrastructure)

#### Files to Create

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/__tests__/session.test.ts`

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/__tests__/health-monitor.test.ts`

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/__tests__/integration/end-to-end.test.ts`

**MODIFY:** `/Users/g/Desktop/MAIA opencode/vitest.config.ecosystem.ts`

#### Specific Tests to Implement

**Test Suite 1: Session Tool Tests**
```typescript
describe('Session Tool', () => {
  test('message mode executes sequentially');
  test('background mode returns immediately');
  test('fork mode creates parallel timeline');
  test('timeout kills agent after limit');
  test('fallback activates on failure');
  test('health check detects dead agents');
  test('handoff state persists across restarts');
  test('concurrent handoffs do not interfere');
});
```

**Test Suite 2: Integration Tests**
```typescript
describe('Ecosystem Integration', () => {
  test('full task lifecycle: create -> assign -> complete');
  test('multi-agent collaboration flow');
  test('council decision making');
  test('DNA pattern learning from outcomes');
  test('VibeKanban task status updates');
  test('error recovery and retry');
});
```

#### Dependencies
- Depends on Session Tool Implementation (1.2)
- Requires test environment setup

#### Acceptance Criteria
- [ ] 80%+ code coverage on all session-related code
- [ ] All integration tests pass
- [ ] Tests run in under 30 seconds
- [ ] No flaky tests (100% pass rate over 10 runs)

#### Testing Approach
```bash
# Run tests
npm run test:ecosystem

# Watch mode
npm run test:ecosystem -- --watch

# Coverage report
npm run test:ecosystem -- --coverage
```

---

## PHASE 2: CORE ORCHESTRATOR (Week 2 - Days 6-10)

### Objective
Implement the main coordinator that manages multi-agent workflows end-to-end.

---

### 2.1 Main Coordinator Implementation

**Priority:** P0 (Core Feature)
**Complexity:** 13 story points (26 hours)
**Risk Level:** High (Complex orchestration logic)

#### Files to Create

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/main-coordinator.ts`

```typescript
// Main orchestrator class
class MainCoordinator {
  // Core functions
  async planAndExecute(userRequest: string): Promise<ExecutionResult>;
  async createExecutionPlan(request: string): Promise<ExecutionPlan>;
  async executePlan(plan: ExecutionPlan): Promise<ExecutionResult>;
  async monitorExecution(executionId: string): Promise<ExecutionStatus>;
  async handleFailure(taskId: string, error: Error): Promise<RecoveryAction>;
  async delegateTask(task: Task, agent: string): Promise<TaskResult>;
}
```

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/planner.ts`

```typescript
// Task planning and breakdown
class ExecutionPlanner {
  async createPlan(request: string): Promise<ExecutionPlan>;
  async breakDownTask(task: Task): Promise<SubTask[]>;
  async estimateComplexity(task: Task): Promise<ComplexityScore>;
  async identifyDependencies(tasks: Task[]): Promise<DependencyGraph>;
  async optimizePlan(plan: ExecutionPlan): Promise<ExecutionPlan>;
}
```

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/workflow-state-machine.ts`

```typescript
// Workflow state machine
class WorkflowStateMachine {
  states: WorkflowState[];
  transitions: StateTransition[];

  transition(current: WorkflowState, event: WorkflowEvent): WorkflowState;
  canTransition(from: WorkflowState, to: WorkflowState): boolean;
  getCurrentState(executionId: string): WorkflowState;
  setState(executionId: string, state: WorkflowState): void;
}
```

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/task-graph.ts`

```typescript
// Task dependency graph
class TaskGraph {
  addNode(task: Task): void;
  addEdge(fromTask: Task, toTask: Task): void;
  getReadyTasks(): Task[];
  getBlockedTasks(task: Task): Task[];
  topologicalSort(): Task[];
  detectCycles(): Cycle[];
}
```

#### Specific Functions to Implement

**Function 1: `planAndExecute`**
```typescript
async function planAndExecute(userRequest: string): Promise<ExecutionResult> {
  // 1. Parse user request
  // 2. Consult DNA tracker for similar past requests
  // 3. Create council decision for complex tasks
  // 4. Generate execution plan with subtasks
  // 5. Create tasks in VibeKanban
  // 6. Execute plan using state machine
  // 7. Monitor progress with health checks
  // 8. Handle failures with retry/fallback
  // 9. Record outcomes to DNA tracker
  // 10. Return summary with VibeKanban link
}
```

**Function 2: `createExecutionPlan`**
```typescript
async function createExecutionPlan(request: string): Promise<ExecutionPlan> {
  // 1. Analyze request complexity
  // 2. Identify required capabilities (research, coding, ops, etc.)
  // 3. Break down into atomic subtasks
  // 4. Assign agents based on DNA patterns
  // 5. Identify dependencies between subtasks
  // 6. Estimate completion time for each subtask
  // 7. Create parallel execution tracks where possible
  // 8. Build task dependency graph
  // 9. Validate plan (detect cycles, conflicts)
  // 10. Return optimized plan
}
```

**Function 3: Workflow State Machine**
```typescript
// States: IDLE -> PLANNING -> APPROVED -> EXECUTING -> REVIEWING -> COMPLETED/FAILED
enum WorkflowState {
  IDLE = 'idle',
  PLANNING = 'planning',
  AWAITING_COUNCIL = 'awaiting_council',
  APPROVED = 'approved',
  EXECUTING = 'executing',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Transitions
const transitions = {
  IDLE: [WorkflowState.PLANNING],
  PLANNING: [WorkflowState.AWAITING_COUNCIL, WorkflowState.APPROVED],
  AWAITING_COUNCIL: [WorkflowState.APPROVED, WorkflowState.CANCELLED],
  APPROVED: [WorkflowState.EXECUTING, WorkflowState.CANCELLED],
  EXECUTING: [WorkflowState.REVIEWING, WorkflowState.FAILED, WorkflowState.CANCELLED],
  REVIEWING: [WorkflowState.COMPLETED, WorkflowState.EXECUTING, WorkflowState.FAILED],
  FAILED: [WorkflowState.PLANNING], // Retry
  CANCELLED: [WorkflowState.IDLE],
  COMPLETED: [WorkflowState.IDLE]
};
```

#### Dependencies
- Requires Phase 1 completion (Git cleanup, Session tool, Tests)
- Requires Agent Manager for agent assignment
- Requires Council Manager for decision making
- Requires DNA Tracker for pattern matching

#### Acceptance Criteria
- [ ] Coordinator accepts natural language requests
- [ ] Creates valid execution plans with subtasks
- [ ] Executes plans using state machine
- [ ] Handles agent failures with fallback
- [ ] All execution tracked in VibeKanban
- [ ] DNA patterns learned from outcomes
- [ ] Support for parallel task execution
- [ ] Proper handling of task dependencies
- [ ] Cycle detection in task graphs

#### Testing Approach
```typescript
describe('MainCoordinator', () => {
  it('should plan and execute simple task', async () => {
    const result = await coordinator.planAndExecute('Write a hello world API');
    expect(result.status).toBe('completed');
    expect(result.subtasks.length).toBeGreaterThan(0);
  });

  it('should handle complex multi-agent task', async () => {
    const result = await coordinator.planAndExecute(
      'Research JWT auth, implement API, deploy to production'
    );
    expect(result.agentsUsed).toContain('researcher');
    expect(result.agentsUsed).toContain('coder');
    expect(result.agentsUsed).toContain('ops');
  });

  it('should recover from agent failure', async () => {
    // Mock coder agent failure
    const result = await coordinator.planAndExecute('Write API');
    expect(result.recoveryActions).toContain('fallback_to_maia');
  });

  it('should respect task dependencies', async () => {
    const plan = await coordinator.createExecutionPlan(
      'Build API after researching patterns'
    );
    const codingTask = plan.tasks.find(t => t.type === 'coding');
    expect(codingTask.dependencies).toContain('research-task-id');
  });
});
```

#### Risk Mitigation
- **Risk:** Complex state machine bugs
- **Mitigation:** State machine validation, comprehensive unit tests
- **Risk:** Infinite loops in task dependencies
- **Mitigation:** Cycle detection, max depth limits
- **Risk:** Memory leaks in long-running executions
- **Mitigation:** Cleanup tasks, resource monitoring

---

### 2.2 Agent Execution Engine

**Priority:** P0 (Core Feature)
**Complexity:** 8 story points (16 hours)
**Risk Level:** Medium (Agent interface integration)

#### Files to Create/Modify

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/agent-execution-engine.ts`

```typescript
class AgentExecutionEngine {
  // Execute a single agent task
  async executeTask(task: AgentTask): Promise<TaskResult>;

  // Execute multiple tasks in parallel
  async executeParallel(tasks: AgentTask[]): Promise<TaskResult[]>;

  // Stream agent output
  async executeWithStream(task: AgentTask): Promise<AsyncIterable<string>>;

  // Cancel running task
  async cancelTask(taskId: string): Promise<boolean>;

  // Get task status
  getTaskStatus(taskId: string): TaskStatus;
}
```

**MODIFY:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/execution/execution-manager.ts`
- Integrate with agent execution engine
- Add task result streaming
- Improve collision detection
- Add task prioritization

#### Specific Functions to Implement

**Function 1: `executeTask`**
```typescript
async function executeTask(task: AgentTask): Promise<TaskResult> {
  // 1. Verify agent health before execution
  // 2. Lock required files (collision detection)
  // 3. Create worktree if in parallel mode
  // 4. Inject skill context if specified
  // 5. Execute agent with timeout
  // 6. Stream output to VibeKanban
  // 7. Handle errors with retry
  // 8. Release file locks
  // 9. Cleanup worktree
  // 10. Return result with metrics
}
```

**Function 2: `executeWithStream`**
```typescript
async function* executeWithStream(task: AgentTask): AsyncIterable<StreamChunk> {
  // 1. Start agent execution
  // 2. Yield chunks as they arrive
  // 3. Update VibeKanban in real-time
  // 4. Handle stream errors
  // 5. Close stream on completion
}
```

#### Dependencies
- Depends on Main Coordinator (2.1)
- Requires Session Tool (1.2)
- Requires Execution Manager (already complete)

#### Acceptance Criteria
- [ ] Single task execution completes successfully
- [ ] Parallel execution respects file locks
- [ ] Streaming output updates VibeKanban in real-time
- [ ] Task cancellation works cleanly
- [ ] Worktrees properly created and cleaned up
- [ ] Collision detection prevents concurrent file edits

#### Testing Approach
```typescript
describe('AgentExecutionEngine', () => {
  it('should execute single task', async () => {
    const task = { agent: 'coder', prompt: 'Write hello()', files: ['src/hello.ts'] };
    const result = await engine.executeTask(task);
    expect(result.status).toBe('completed');
  });

  it('should execute parallel tasks', async () => {
    const tasks = [
      { agent: 'coder', prompt: 'Write feature A', files: ['src/a.ts'] },
      { agent: 'ops', prompt: 'Write deployment script', files: ['deploy.sh'] }
    ];
    const results = await engine.executeParallel(tasks);
    expect(results).toHaveLength(2);
    expect(results.every(r => r.status === 'completed')).toBe(true);
  });

  it('should detect file collisions', async () => {
    const tasks = [
      { agent: 'coder', prompt: 'Write API', files: ['src/api.ts'] },
      { agent: 'frontend', prompt: 'Style API', files: ['src/api.ts'] }
    ];
    await expect(engine.executeParallel(tasks)).rejects.toThrow('collision');
  });

  it('should stream output', async () => {
    const task = { agent: 'coder', prompt: 'Count to 10' };
    const chunks = [];
    for await (const chunk of engine.executeWithStream(task)) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
  });
});
```

#### Risk Mitigation
- **Risk:** File corruption from concurrent edits
- **Mitigation:** File locking, collision detection
- **Risk:** Worktree cleanup failures
- **Mitigation:** Best-effort cleanup, periodic full cleanup
- **Risk:** Stream hanging indefinitely
- **Mitigation:** Timeout on stream, heartbeat detection

---

### 2.3 Workflow State Machine

**Priority:** P1 (High)
**Complexity:** 5 story points (10 hours)
**Risk Level:** Low (Well-defined logic)

#### Files to Create

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/workflow-states.ts`

```typescript
// Define all workflow states
export enum WorkflowState {
  IDLE = 'idle',
  PLANNING = 'planning',
  AWAITING_COUNCIL = 'awaiting_council',
  APPROVED = 'approved',
  EXECUTING = 'executing',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Define state transition rules
export const STATE_TRANSITIONS: Record<WorkflowState, WorkflowState[]> = {
  idle: [WorkflowState.PLANNING],
  planning: [WorkflowState.AWAITING_COUNCIL, WorkflowState.APPROVED],
  awaiting_council: [WorkflowState.APPROVED, WorkflowState.CANCELLED],
  approved: [WorkflowState.EXECUTING, WorkflowState.CANCELLED],
  executing: [WorkflowState.REVIEWING, WorkflowState.FAILED, WorkflowState.CANCELLED],
  reviewing: [WorkflowState.COMPLETED, WorkflowState.EXECUTING, WorkflowState.FAILED],
  failed: [WorkflowState.PLANNING],
  cancelled: [WorkflowState.IDLE],
  completed: [WorkflowState.IDLE]
};
```

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/state-machine.ts`

```typescript
export class WorkflowStateMachine {
  // Core methods
  canTransition(from: WorkflowState, to: WorkflowState): boolean;
  transition(executionId: string, event: WorkflowEvent): WorkflowState;
  getCurrentState(executionId: string): WorkflowState;
  setState(executionId: string, state: WorkflowState): void;
  getHistory(executionId: string): StateTransition[];
}
```

#### Dependencies
- Depends on Main Coordinator (2.1)
- Integrates with Council Manager for AWAITING_COUNCIL state

#### Acceptance Criteria
- [ ] All valid transitions allowed
- [ ] Invalid transitions rejected
- [ ] State history tracked for audit
- [ ] State persistence across restarts
- [ ] State change events emitted

#### Testing Approach
```typescript
describe('WorkflowStateMachine', () => {
  it('should allow valid transitions', () => {
    const machine = new WorkflowStateMachine();
    machine.setState('exec-1', WorkflowState.IDLE);
    expect(machine.canTransition(WorkflowState.IDLE, WorkflowState.PLANNING)).toBe(true);
  });

  it('should reject invalid transitions', () => {
    const machine = new WorkflowStateMachine();
    machine.setState('exec-1', WorkflowState.EXECUTING);
    expect(machine.canTransition(WorkflowState.EXECUTING, WorkflowState.PLANNING)).toBe(false);
  });

  it('should track state history', () => {
    const machine = new WorkflowStateMachine();
    machine.transition('exec-1', { type: 'start' });
    machine.transition('exec-1', { type: 'approve' });
    const history = machine.getHistory('exec-1');
    expect(history).toHaveLength(2);
  });
});
```

---

## PHASE 3: LEARNING SYSTEMS (Week 3 - Days 11-15)

### Objective
Enhance DNA pattern algorithms and meta-learning capabilities.

---

### 3.1 DNA Pattern Algorithm Enhancement

**Priority:** P1 (High)
**Complexity:** 8 story points (16 hours)
**Risk Level:** Medium (Algorithm complexity)

#### Files to Modify

**MODIFY:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/dna/dna-tracker.ts`

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/dna/pattern-extraction.ts`

```typescript
// Enhanced pattern extraction
class PatternExtractor {
  // Extract patterns from completed tasks
  extractFromTask(task: Task, interactions: AgentInteraction[]): Pattern;

  // Characterize task by type, complexity, domain
  characterizeTask(task: Task): TaskCharacteristics;

  // Find similar tasks in history
  findSimilarTasks(characteristics: TaskCharacteristics): Task[];

  // Calculate pattern confidence
  calculateConfidence(pattern: Pattern): number;

  // Merge similar patterns
  mergePatterns(patterns: Pattern[]): Pattern[];
}
```

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/dna/similarity-matcher.ts`

```typescript
// Task similarity matching
class SimilarityMatcher {
  // Calculate similarity between two tasks
  calculateSimilarity(task1: Task, task2: Task): number;

  // Find best matching pattern
  findBestMatch(task: Task): PatternMatch | null;

  // Vector-based similarity search
  vectorSearch(queryVector: number[]): PatternMatch[];
}
```

#### Specific Functions to Implement

**Function 1: Enhanced Pattern Extraction**
```typescript
function extractFromTask(task: Task, interactions: AgentInteraction[]): Pattern {
  // 1. Extract N-grams from task title and description
  // 2. Identify domain keywords (API, UI, database, etc.)
  // 3. Extract technology stack mentions
  // 4. Calculate task complexity metrics
  // 5. Identify agent interaction patterns
  // 6. Extract success factors
  // 7. Build pattern fingerprint (vector embedding)
  // 8. Recommend agents based on success rate
  // 9. Calculate confidence score
  // 10. Return structured pattern
}
```

**Function 2: Vector-Based Similarity**
```typescript
function vectorSearch(queryVector: number[]): PatternMatch[] {
  // 1. Convert query to vector space
  // 2. Calculate cosine similarity with all patterns
  // 3. Return top K matches above threshold
  // 4. Include similarity scores
}
```

#### Dependencies
- Builds on existing DNA Tracker (complete)
- Requires semantic service (already implemented)

#### Acceptance Criteria
- [ ] Pattern extraction accuracy > 80%
- [ ] Similarity search returns relevant matches
- [ ] Vector embeddings capture semantic meaning
- [ ] Pattern merging reduces duplicates
- [ ] Confidence scores correlate with success rates

#### Testing Approach
```typescript
describe('PatternExtraction', () => {
  it('should extract accurate patterns', () => {
    const task = {
      title: 'Implement JWT authentication API',
      description: 'Build secure REST API with JWT tokens',
      interactions: [/* ... */]
    };
    const pattern = extractor.extractFromTask(task, task.interactions);
    expect(pattern.characteristics).toContain('api');
    expect(pattern.characteristics).toContain('auth');
    expect(pattern.recommendedAgents).toContain('coder');
  });

  it('should find similar tasks', () => {
    const matches = similarityMatcher.findBestMatch({
      title: 'Build OAuth login API'
    });
    expect(matches).not.toBeNull();
    expect(matches.similarity).toBeGreaterThan(0.7);
  });
});
```

#### Risk Mitigation
- **Risk:** Poor quality pattern recommendations
- **Mitigation:** Minimum confidence thresholds, human-in-the-loop validation
- **Risk:** Too many similar patterns
- **Mitigation:** Pattern merging, deduplication

---

### 3.2 Meta-Learning Enhancement

**Priority:** P1 (High)
**Complexity:** 5 story points (10 hours)
**Risk Level:** Low (Builds on existing)

#### Files to Modify

**MODIFY:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/meta-learning.ts`

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/meta/feedback-loop.ts`

```typescript
// Feedback loop implementation
class FeedbackLoop {
  // Process task outcomes
  processOutcome(outcome: TaskOutcome): void;

  // Generate agent optimization suggestions
  generateOptimizations(agent: string): Optimization[];

  // Apply learned optimizations
  applyOptimization(agent: string, optimization: Optimization): void;

  // Track optimization effectiveness
  trackEffectiveness(agent: string): EffectivenessMetrics;
}
```

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/meta/prompt-optimizer.ts`

```typescript
// Prompt optimization based on learning
class PromptOptimizer {
  // Generate optimized prompt for agent
  optimizePrompt(agent: string, basePrompt: string): string;

  // Suggest prompt improvements
  suggestImprovements(agent: string): PromptImprovement[];

  // Apply A/B testing for prompts
  abTestPrompts(agent: string, promptA: string, promptB: string): TestResult;
}
```

#### Specific Functions to Implement

**Function 1: Feedback Processing**
```typescript
function processOutcome(outcome: TaskOutcome): void {
  // 1. Extract learning signals from outcome
  // 2. Update agent performance stats
  // 3. Identify failure patterns
  // 4. Generate new patterns if novel
  // 5. Update pattern confidence scores
  // 6. Flag agents for optimization if needed
  // 7. Trigger optimization generation
}
```

**Function 2: Prompt Optimization**
```typescript
function optimizePrompt(agent: string, basePrompt: string): string {
  // 1. Get agent's weak patterns
  // 2. Extract common failure reasons
  // 3. Generate prompt additions
  // 4. Inject context requirements
  // 5. Add step-by-step guidance
  // 6. Include relevant examples
  // 7. Return optimized prompt
}
```

#### Dependencies
- Builds on existing Meta-Learning Engine (complete)
- Requires enhanced DNA patterns (3.1)

#### Acceptance Criteria
- [ ] Feedback loop processes outcomes in real-time
- [ ] Optimizations generated weekly
- [ ] Prompt improvements measurable
- [ ] A/B testing supported
- [ ] Effectiveness tracking accurate

#### Testing Approach
```typescript
describe('FeedbackLoop', () => {
  it('should process successful outcomes', () => {
    const outcome = {
      taskId: 'task-1',
      agent: 'coder',
      success: true,
      quality: 0.9
    };
    feedbackLoop.processOutcome(outcome);
    const stats = metaLearning.getAgentStats('coder');
    expect(stats.successRate).toBeGreaterThan(0);
  });

  it('should generate optimizations', () => {
    const optimizations = feedbackLoop.generateOptimizations('coder');
    expect(optimizations.length).toBeGreaterThan(0);
  });
});
```

---

### 3.3 Feedback Loops

**Priority:** P2 (Medium)
**Complexity:** 3 story points (6 hours)
**Risk Level:** Low

#### Files to Create

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/meta/cron-scheduler.ts`

```typescript
// Scheduled feedback loops
class CronScheduler {
  // Schedule weekly learning sync
  scheduleWeeklySync(): void;

  // Schedule daily health checks
  scheduleDailyHealthCheck(): void;

  // Schedule prompt optimization
  schedulePromptOptimization(): void;

  // Execute scheduled tasks
  executeScheduledTasks(): void;
}
```

#### Dependencies
- Requires Meta-Learning Enhancement (3.2)

#### Acceptance Criteria
- [ ] Weekly sync runs automatically
- [ ] Daily health checks scheduled
- [ ] Optimizations applied automatically
- [ ] Schedule persisted across restarts

---

## PHASE 4: POLISH & TESTING (Week 4 - Days 16-20)

### Objective
Comprehensive testing, performance optimization, documentation.

---

### 4.1 Comprehensive Test Suite

**Priority:** P0 (Critical)
**Complexity:** 8 story points (16 hours)
**Risk Level:** Low

#### Files to Create

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/__tests__/e2e/full-workflow.test.ts`

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/__tests__/performance/stress.test.ts`

**NEW:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/__tests__/recovery/failure-recovery.test.ts`

#### Test Suites to Implement

**Suite 1: End-to-End Workflows**
```typescript
describe('E2E Workflows', () => {
  test('full feature development: research -> code -> review -> deploy');
  test('multi-agent collaboration with council decision');
  test('error recovery and retry scenarios');
  test('parallel execution with collision detection');
  test('DNA pattern learning from complete workflow');
});
```

**Suite 2: Performance Tests**
```typescript
describe('Performance', () => {
  test('orchestrator handles 100 concurrent tasks');
  test('memory usage stays under 2GB');
  test('agent execution timeout works correctly');
  test('VibeKanban API calls complete in < 100ms');
});
```

**Suite 3: Failure Recovery**
```typescript
describe('Failure Recovery', () => {
  test('agent failure triggers fallback');
  test('network timeout is handled gracefully');
  test('state corruption is detected and recovered');
  test('partial execution can be resumed');
});
```

#### Dependencies
- Requires all previous phases complete

#### Acceptance Criteria
- [ ] 80%+ code coverage across all modules
- [ ] All E2E tests pass
- [ ] Performance tests meet benchmarks
- [ ] Recovery tests validate fault tolerance
- [ ] Test suite runs in under 5 minutes

---

### 4.2 Performance Optimization

**Priority:** P1 (High)
**Complexity:** 5 story points (10 hours)
**Risk Level:** Medium

#### Files to Optimize

**MODIFY:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/dna/dna-tracker.ts`
- Add LRU cache for pattern lookups
- Implement bulk pattern queries

**MODIFY:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/orchestrator/main-coordinator.ts`
- Optimize task graph traversal
- Add request debouncing

**MODIFY:** `/Users/g/Desktop/MAIA opencode/.opencode/ecosystem/session/real-session-manager.ts`
- Connection pooling for agent execution
- Response streaming optimization

#### Optimization Targets
| Component | Metric | Target | Current |
|-----------|--------|--------|---------|
| Pattern lookup | Latency | < 10ms | TBD |
| Task creation | Latency | < 100ms | TBD |
| Agent handoff | Latency | < 500ms | TBD |
| Memory usage | RSS | < 2GB | TBD |
| VibeKanban sync | Throughput | 100 req/s | TBD |

#### Acceptance Criteria
- [ ] All performance targets met
- [ ] No memory leaks (verified with 24h soak test)
- [ ] CPU usage < 80% under load
- [ ] Response times at p95 < target

---

### 4.3 Documentation

**Priority:** P1 (High)
**Complexity:** 5 story points (10 hours)
**Risk Level:** Low

#### Files to Create

**NEW:** `/Users/g/Desktop/MAIA opencode/DOCS/ORCHESTRATOR_GUIDE.md`

**NEW:** `/Users/g/Desktop/MAIA opencode/DOCS/AGENT_HANDOFF_PROTOCOL.md`

**NEW:** `/Users/g/Desktop/MAIA opencode/DOCS/DNA_PATTERN_REFERENCE.md`

**NEW:** `/Users/g/Desktop/MAIA opencode/DOCS/TROUBLESHOOTING.md`

**MODIFY:** `/Users/g/Desktop/MAIA opencode/README.md`
- Update with new capabilities
- Add quick start guide

#### Documentation Sections

**Orchestrator Guide:**
- Architecture overview
- Configuration options
- Plugin system
- Extending the orchestrator

**Agent Handoff Protocol:**
- Session modes explained
- Health check mechanism
- Fallback chain configuration
- Error handling patterns

**DNA Pattern Reference:**
- Pattern format specification
- Character extraction rules
- Similarity algorithm
- Pattern lifecycle

**Troubleshooting:**
- Common issues and solutions
- Debug mode enablement
- Log analysis
- Recovery procedures

#### Acceptance Criteria
- [ ] All public APIs documented
- [ ] Architecture diagrams included
- [ ] Code examples provided
- [ ] Troubleshooting guide covers 10+ common issues
- [ ] Quick start guide < 5 minutes to first execution

---

### 4.4 Dashboard Real Integration

**Priority:** P1 (High)
**Complexity:** 8 story points (16 hours)
**Risk Level:** Medium

#### Files to Modify

**MODIFY:** `/Users/g/Desktop/MAIA opencode/src/app/api/vk/tasks/route.ts`
- Replace mock with real VibeKanban API calls

**MODIFY:** `/Users/g/Desktop/MAIA opencode/src/app/api/vk/agents/route.ts`
- Replace mock with real agent health data

**MODIFY:** `/Users/g/Desktop/MAIA opencode/src/app/api/vk/decisions/route.ts`
- Replace mock with real council decisions

**MODIFY:** `/Users/g/Desktop/MAIA opencode/src/app/api/vk/health/route.ts`
- Add real ecosystem health metrics

#### Specific Functions to Implement

**Function 1: Real Task Data**
```typescript
export async function GET(request: Request) {
  // 1. Connect to VibeKanban at localhost:62601
  // 2. Fetch all tasks using vibe_kanban_list_tasks
  // 3. Enrich with DNA pattern data
  // 4. Add agent assignment info
  // 5. Include council decision links
  // 6. Return extended task format
}
```

**Function 2: Real Agent Data**
```typescript
export async function GET(request: Request) {
  // 1. Query Agent Manager for all agents
  // 2. Perform health checks on each
  // 3. Get current task load
  // 4. Calculate availability
  // 5. Return agent status array
}
```

#### Dependencies
- Requires VibeKanban server running
- Requires Ecosystem MCP server running

#### Acceptance Criteria
- [ ] Dashboard shows live data from VibeKanban
- [ ] Agent health status updates in real-time
- [ ] Council decisions displayed live
- [ ] DNA patterns shown on task cards
- [ ] Error handling for server unavailability

---

## GANTT CHART

```
WEEK 1: CRITICAL FIXES
├─────────────────────────────────────────────────────────────────
│ Day 1-2: Git Cleanup + Session Tool (Parallel)                │
│ ██████████████████████████████████████████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 3-4: Session Tool Implementation                          │
│                    ████████████████████████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 5: Test Coverage                                          │
│                                          ████████████████████████ │
└─────────────────────────────────────────────────────────────────

WEEK 2: CORE ORCHESTRATOR
├─────────────────────────────────────────────────────────────────
│ Day 6-7: Main Coordinator (Planning + State Machine)          │
│ ██████████████████████████████████████████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 8-9: Agent Execution Engine                                │
│                    ████████████████████████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 10: Integration Testing                                    │
│                                          ████████████████████████ │
└─────────────────────────────────────────────────────────────────

WEEK 3: LEARNING SYSTEMS
├─────────────────────────────────────────────────────────────────
│ Day 11-12: DNA Pattern Enhancement                             │
│ ██████████████████████████████████████████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 13-14: Meta-Learning Enhancement                           │
│                    ████████████████████████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 15: Feedback Loops                                         │
│                                          ████████████████████████ │
└─────────────────────────────────────────────────────────────────

WEEK 4: POLISH & TESTING
├─────────────────────────────────────────────────────────────────
│ Day 16-17: Comprehensive Test Suite                            │
│ ██████████████████████████████████████████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 18: Performance Optimization                               │
│                    ████████████████████████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 19: Dashboard Real Integration + Documentation             │
│                                          ████████████████████████ │
├─────────────────────────────────────────────────────────────────
│ Day 20: Final Testing + Release Prep                           │
│                                          ████████████████████████ │
└─────────────────────────────────────────────────────────────────

CRITICAL PATH: ████
PARALLEL TASKS: ░░░░
```

### Parallel Execution Opportunities

**Week 1 (Day 1-2):**
- Git Cleanup AND Session Tool architecture can be done in parallel
- Test suite setup can happen while Session Tool is being implemented

**Week 2:**
- State Machine AND Agent Execution Engine can be built in parallel
- Integration testing can start as soon as first component is ready

**Week 3:**
- DNA Enhancement AND Meta-Learning can be developed in parallel
- Feedback Loops depend on both, but can start once either is ready

**Week 4:**
- Performance Optimization AND Documentation can be done in parallel
- Dashboard integration AND Final Testing can overlap

### Critical Path

The critical path (items that cannot be delayed without extending the timeline):

1. **Git Cleanup** (Day 1-2) - Blocker for everything
2. **Session Tool Implementation** (Day 3-4) - Blocker for orchestrator
3. **Main Coordinator** (Day 6-7) - Core component
4. **Agent Execution Engine** (Day 8-9) - Required for execution
5. **DNA Pattern Enhancement** (Day 11-12) - Required for learning
6. **Comprehensive Testing** (Day 16-17) - Must pass before release
7. **Dashboard Integration** (Day 19) - Final deliverable

### Milestones

| Milestone | Date | Deliverables |
|-----------|------|--------------|
| M1: Foundation Secure | Day 5 | Git clean, Session tool working, Tests passing |
| M2: Orchestrator Live | Day 10 | Coordinator executing tasks, State machine operational |
| M3: Learning Active | Day 15 | Enhanced DNA, Meta-learning, Feedback loops |
| M4: Production Ready | Day 20 | All tests pass, Performance optimized, Docs complete |

### Checkpoints

**Checkpoint 1 (Day 5 - End of Week 1):**
- [ ] Git repository clean
- [ ] Session tool executing real handoffs
- [ ] Unit tests passing
- [ ] No P0 blockers remaining

**Checkpoint 2 (Day 10 - End of Week 2):**
- [ ] Main coordinator creates and executes plans
- [ ] Agent execution engine operational
- [ ] State machine transitions working
- [ ] Integration tests passing

**Checkpoint 3 (Day 15 - End of Week 3):**
- [ ] DNA pattern accuracy > 80%
- [ ] Meta-learning generating optimizations
- [ ] Feedback loops scheduled
- [ ] Learning system tests passing

**Checkpoint 4 (Day 20 - End of Week 4):**
- [ ] All acceptance criteria met
- [ ] Performance benchmarks achieved
- [ ] Documentation complete
- [ ] Ready for production deployment

---

## DECISION LOG

### Technical Decisions

#### Decision 1: Session Tool Architecture
**Date:** February 1, 2026
**Context:** Need real agent handoff execution, currently using mock

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| A) Extend OpenCode SDK | Native integration, clean API | SDK changes may break, limited control |
| B) Custom implementation with HTTP | Full control, independent | More complex, need to maintain compatibility |
| C) Hybrid approach | Best of both worlds | More complex architecture |

**Decision:** Option B - Custom implementation with HTTP
**Rationale:**
- Full control over timeout handling, retry logic, streaming
- Independent of SDK changes
- Can integrate with any agent backend
- Better testability
- Clear separation of concerns

**Trade-offs:**
- More initial development effort
- Need to maintain compatibility layer
- Increased testing surface area

---

#### Decision 2: State Machine Implementation
**Date:** February 1, 2026
**Context:** Orchestration needs reliable state tracking

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| A) XState library | Battle-tested, good tooling | External dependency, learning curve |
| B) Custom state machine | Lightweight, exact fit | Need to implement edge cases |
| C) Simple enum + switch | Simple, no dependencies | Limited functionality, hard to extend |

**Decision:** Option B - Custom state machine
**Rationale:**
- Exact fit for our workflow states
- No external dependency
- Can add custom logic (persistence, events)
- Full control over transition rules
- Easier to debug

**Trade-offs:**
- Need to implement all edge case handling
- No visualizer/tooling out of the box
- More testing needed

---

#### Decision 3: DNA Pattern Storage
**Date:** February 1, 2026
**Context:** Need to persist learned patterns

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| A) JSON files | Simple, human-readable | Performance issues at scale |
| B) SQLite | Fast, ACID compliant | External dependency, migration needed |
| C) In-memory with periodic dump | Fast, simple | Data loss on crash |

**Decision:** Option A - JSON files for MVP
**Rationale:**
- Simple to implement
- Easy to debug (can read patterns directly)
- Sufficient for initial scale (< 10K patterns)
- Easy to migrate later if needed
- Version control friendly

**Trade-offs:**
- Will need to migrate to SQLite at scale
- Slower than database for large datasets
- No ACID guarantees

**Migration Path:**
When pattern count > 10K or query latency > 100ms, migrate to SQLite.

---

#### Decision 4: Agent Health Check Strategy
**Date:** February 1, 2026
**Context:** Need reliable way to check if agents are alive

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| A) Actual prompt execution | Most accurate | Slow, costly (uses tokens) |
| B) Dedicated health endpoint | Fast, cheap | May not reflect real execution |
| C) Last-seen timestamp | Simple, cheap | May be stale |

**Decision:** Hybrid approach - B + C
**Rationale:**
- Fast health check using last-seen timestamp
- Actual prompt execution only when timestamp is stale (> 5 min)
- Balances accuracy with performance
- Reduces token usage

**Algorithm:**
```typescript
async function healthCheck(agent: string): Promise<HealthStatus> {
  const lastSeen = getLastSeen(agent);
  const staleness = Date.now() - lastSeen.timestamp;

  if (staleness < 30000) {
    return { alive: true, confidence: 1.0, method: 'cache' };
  }

  if (staleness < 300000) {
    // Quick ping with short timeout
    const ping = await quickPing(agent, 10000);
    return ping;
  }

  // Full health check with actual prompt
  return await fullHealthCheck(agent, 30000);
}
```

---

#### Decision 5: Parallel Execution Strategy
**Date:** February 1, 2026
**Context:** Execution Manager already supports parallel mode

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| A) Enable parallel by default | Faster execution | Collision risk, complexity |
| B) Keep sequential default | Safe, predictable | Slower |
| C) Per-task mode selection | Flexible | More user configuration |

**Decision:** Option C - Per-task mode selection with smart defaults
**Rationale:**
- Safety for critical tasks (sequential)
- Speed for independent tasks (parallel)
- Automatic detection based on file conflicts
- User override available

**Default Rules:**
```typescript
function getDefaultMode(task: Task): ExecutionMode {
  // Sequential if:
  // - Task touches critical files (package.json, tsconfig.json)
  // - Multiple agents targeting same files
  // - Explicit dependency chain

  // Parallel if:
  // - Independent subtasks
  // - Different file sets
  // - Different agents

  if (hasCriticalFiles(task) || hasFileConflicts(task)) {
    return 'SEQUENTIAL';
  }
  return 'PARALLEL';
}
```

---

#### Decision 6: Dashboard Real-Time Updates
**Date:** February 1, 2026
**Context:** Dashboard needs live data updates

**Options Considered:**
| Option | Pros | Cons |
|--------|------|------|
| A) WebSocket (SSE) | Real-time, efficient | More complex infrastructure |
| B) Polling (current) | Simple, works everywhere | Higher latency, server load |
| C) Hybrid (poll + event source) | Balance | More complex client logic |

**Decision:** Option B - Polling for MVP
**Rationale:**
- Already implemented
- Sufficient for 5s update interval
- No additional infrastructure
- Works everywhere (no WebSocket issues)
- Easy to upgrade later

**Upgrade Criteria:**
When any of these are true, upgrade to WebSocket:
- Polling interval needs to be < 1s
- More than 100 concurrent dashboard users
- Bandwidth becomes an issue

---

### Alternatives Rejected

#### Rejected 1: Multi-Process Architecture
**Proposed:** Run each agent in separate process
**Rejected Reasons:**
- Too complex for current scale
- Process management overhead
- Harder debugging
- Not necessary given current load

**Chosen Instead:** Single process with async execution

---

#### Rejected 2: Redis for State Storage
**Proposed:** Use Redis for all state management
**Rejected Reasons:**
- External dependency adds deployment complexity
- Overkill for current scale (< 100 concurrent tasks)
- JSON files sufficient for MVP
- Can add Redis layer later if needed

**Chosen Instead:** JSON file storage with in-memory caching

---

#### Rejected 3: GraphQL for Dashboard API
**Proposed:** Use GraphQL instead of REST
**Rejected Reasons:**
- Steeper learning curve
- Over-engineering for simple CRUD
- REST is sufficient
- Better caching with REST

**Chosen Instead:** REST API with Next.js route handlers

---

#### Rejected 4: Custom Agent Protocol
**Proposed:** Build custom agent communication protocol
**Rejected Reasons:**
- Reinventing the wheel
- OpenCode SDK already handles this
- More maintenance burden
- Compatibility issues

**Chosen Instead:** Leverage OpenCode SDK + custom session wrapper

---

#### Rejected 5: Docker Compose for Development
**Proposed:** Full Docker Compose setup for local development
**Rejected Reasons:**
- Slower feedback loop (rebuild images)
- More complex setup for contributors
- Not necessary for local development
- Native npm is faster

**Chosen Instead:** Native npm scripts with Docker only for production

---

## RISK REGISTER

| Risk | Probability | Impact | Mitigation | Owner |
|------|------------|--------|-----------|-------|
| Session tool integration fails | Medium | High | Early POC with OpenCode team, fallback to HTTP | Week 1 |
| Git cleanup loses data | Low | High | Comprehensive backup, careful review | Day 1 |
| State machine bugs | Medium | High | Comprehensive unit tests, formal verification | Week 2 |
| Performance bottlenecks | Medium | Medium | Early profiling, optimization sprint | Week 4 |
| Agent failures cascade | Low | High | Circuit breaker, max retry limits | Week 2 |
| DNA pattern quality low | Medium | Medium | Human validation, confidence thresholds | Week 3 |
| Dashboard integration breaks | Low | Medium | Feature flags, gradual rollout | Week 4 |
| Documentation incomplete | Medium | Low | Dedicated documentation sprint | Week 4 |

---

## SUCCESS CRITERIA

### Phase 1 Success (Week 1)
- [ ] Git repository clean with no untracked state files
- [ ] Session tool successfully executes handoffs between agents
- [ ] Health checks accurately detect agent status
- [ ] 80%+ test coverage on new code
- [ ] Zero P0 blockers remaining

### Phase 2 Success (Week 2)
- [ ] Main coordinator creates execution plans from natural language
- [ ] Agent execution engine executes tasks with timeout protection
- [ ] State machine correctly manages workflow transitions
- [ ] Integration tests pass for end-to-end workflows
- [ ] VibeKanban integration operational

### Phase 3 Success (Week 3)
- [ ] DNA pattern extraction accuracy > 80%
- [ ] Similarity matching returns relevant patterns
- [ ] Meta-learning generates actionable optimizations
- [ ] Feedback loops run on schedule
- [ ] Pattern confidence scores correlate with success rates

### Phase 4 Success (Week 4)
- [ ] All tests passing (unit + integration + E2E)
- [ ] Performance benchmarks met
- [ ] Dashboard shows live data
- [ ] Documentation complete and reviewed
- [ ] Ready for production deployment

### Overall Success
- [ ] 4-week timeline met
- [ ] All acceptance criteria satisfied
- [ ] Zero critical bugs in production
- [ ] Stakeholder approval received
- [ ] Handover complete

---

## HANDOVER PLAN

### Week 5 (Post-Implementation)

**Day 1: Knowledge Transfer**
- Team walkthrough of architecture
- Code tour with developers
- Q&A session

**Day 2: Documentation Review**
- Verify all docs are accurate
- Create runbooks for operations
- Update troubleshooting guides

**Day 3: Training**
- Train operators on dashboard
- Train developers on extending system
- Create video tutorials

**Day 4: Production Deployment**
- Deploy to production environment
- Smoke testing
- Monitoring setup

**Day 5: Post-Deployment Support**
- Monitor for issues
- Hotfix any critical bugs
- Gather feedback for next iteration

---

## APPENDICES

### A. File Inventory

**Files to Create:** 27 new files
**Files to Modify:** 12 existing files
**Total Lines of Code:** ~4,000 estimated

### B. Story Points Summary

| Phase | Total Points | Key Items |
|-------|-------------|-----------|
| Week 1 | 15 pts | Git cleanup, Session tool, Tests |
| Week 2 | 26 pts | Coordinator, Execution engine, State machine |
| Week 3 | 16 pts | DNA enhancement, Meta-learning, Feedback |
| Week 4 | 26 pts | Testing, Performance, Docs, Dashboard |
| **Total** | **83 pts** | |

### C. Resource Requirements

**Development:** 1 Senior Full-Stack Developer (40 hrs/week)
**Testing:** 1 QA Engineer (20 hrs/week)
**Documentation:** 1 Technical Writer (10 hrs/week)
**Project Management:** 1 TPM (10 hrs/week)

---

**End of Implementation Roadmap**

**Prepared by:** Technical Program Manager
**Approved by:** [Pending]
**Version:** 1.0
**Last Updated:** February 1, 2026
