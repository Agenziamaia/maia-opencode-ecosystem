# Living Ecosystem Foundation - Phase 1

## Overview

The Living Ecosystem Foundation enables the MAIA agent system to learn, adapt, and evolve through:

1. **DNA Tracking** - Pattern recognition from task execution history
2. **Council Voting** - Agent consensus on decisions
3. **Agent Management** - Availability tracking and intelligent assignment
4. **VibeKanban Integration** - Extended task schema with ecosystem fields

## Architecture

```
.opencode/ecosystem/
├── schema/
│   └── extended-task-schema.json    # Extended VibeKanban task schema
├── dna/
│   └── dna-tracker.ts             # Pattern recognition and learning
├── council/
│   └── council-manager.ts         # Voting and consensus system
├── agents/
│   └── agent-manager.ts           # Agent availability and assignment
├── tools/
│   └── ecosystem-mcp-tools.ts     # MCP tools for integration
└── index.ts                      # Main exports
```

## Components

### 1. DNA Tracking (`dna/dna-tracker.ts`)

**Purpose**: Learn from task execution to recognize patterns and recommend optimal approaches.

**Key Features**:
- Record agent interactions for each task
- Extract patterns from completed tasks
- Match new tasks to historical patterns
- Calculate agent performance metrics
- Learning feedback loop

**Usage**:
```typescript
import { getDNATracker } from './.opencode/ecosystem';

const tracker = getDNATracker();

// Record an interaction
tracker.recordInteraction('task-123', {
  agent_id: 'coder',
  action: 'implementation',
  duration_ms: 15000,
  timestamp: new Date().toISOString()
});

// Record outcome and trigger learning
tracker.recordOutcome('task-123', 'success', {
  completion_time_ms: 15000,
  revision_count: 2,
  quality_score: 0.9
});

// Find patterns for new task
const match = tracker.findPattern('Implement API endpoint', 'Build REST API for user management');
```

### 2. Council Voting (`council/council-manager.ts`)

**Purpose**: Enable agents to vote on decisions and reach consensus.

**Key Features**:
- Create council decisions with proposals
- Cast votes (upvote/downvote/abstain)
- Consensus detection with configurable threshold
- Timeout handling for decisions
- Agent voting statistics

**Usage**:
```typescript
import { getCouncilManager } from './.opencode/ecosystem';

const council = getCouncilManager();

// Create a decision
const decision = council.createDecision(
  'Should we use TypeScript?',
  ['coder', 'reviewer', 'sisyphus'],
  300000, // 5 minutes
  0.7   // 70% consensus threshold
);

// Cast a vote
council.castVote(decision.decision_id, 'coder', 'upvote', 'TypeScript improves type safety');

// Check if consensus reached
const decisionStatus = council.getDecision(decision.decision_id);
```

### 3. Agent Management (`agents/agent-manager.ts`)

**Purpose**: Track agent availability and intelligently assign tasks.

**Key Features**:
- Register agents with capabilities
- Track current task load
- Health check integration
- Automatic agent recommendation
- Multiple assignment methods (manual, auto, pattern-based)

**Usage**:
```typescript
import { getAgentManager } from './.opencode/ecosystem';

const manager = getAgentManager();

// Recommend agents for a task
const recommendations = manager.recommendAgents(
  'Fix authentication bug',
  'Users cannot login after password reset',
  3
);

// Auto-assign an agent
const assignment = manager.autoAssign(
  'Implement new API endpoint',
  'Build REST endpoint for user CRUD'
);

// Check agent health
const isHealthy = await manager.healthCheck('coder');
```

### 4. MCP Tools (`tools/ecosystem-mcp-tools.ts`)

**Purpose**: Provide MCP tools for seamless integration with MAIA agents.

**Available Tools**:

**Council Tools**:
- `council_create_decision` - Create a new council decision
- `council_cast_vote` - Cast a vote on a decision
- `council_get_decision` - Get decision details
- `council_list_active` - List all active decisions
- `council_agent_stats` - Get voting statistics

**DNA Tools**:
- `dna_record_interaction` - Record agent interaction
- `dna_record_outcome` - Record task outcome
- `dna_find_pattern` - Find matching patterns
- `dna_get_patterns` - Get all learned patterns
- `dna_agent_performance` - Get performance statistics

**Agent Tools**:
- `agent_recommend` - Recommend agents for task
- `agent_auto_assign` - Auto-assign an agent
- `agent_health_check` - Check specific agent health
- `agent_health_check_all` - Check all agents
- `agent_load_stats` - Get load statistics

**Integration Tools**:
- `vk_create_extended_task` - Create task with ecosystem fields
- `ecosystem_health` - Overall ecosystem status

## Extended Task Schema

The foundation extends the VibeKanban task schema with:

```json
{
  "dna": {
    "pattern_id": "string",
    "pattern_confidence": 0.8,
    "agent_interactions": [...],
    "outcome": "success|partial|failure|pending",
    "outcome_metrics": {...},
    "learned_patterns": [...]
  },
  "agent_assignment": {
    "primary_agent": "coder",
    "agent_variant": "DEFAULT",
    "assigned_at": "2026-01-30T00:00:00Z",
    "assignment_method": "auto",
    "availability_checked": true,
    "backup_agents": ["ops", "reviewer"]
  },
  "council_decision": {
    "decision_id": "uuid",
    "proposal": "string",
    "votes": [...],
    "status": "pending|consensus|no_consensus|timeout",
    "consensus_threshold": 0.7,
    "created_at": "string",
    "timeout_at": "string",
    "final_decision": "string"
  },
  "emergence": {
    "emergence_score": 0.8,
    "emergent_capabilities": [...],
    "novelty_score": 0.7,
    "cross_agent_collaborations": [...]
  }
}
```

## Integration with VibeKanban

The foundation connects to VibeKanban (default: `http://localhost:62601`):

1. **Task Creation**: Create tasks via `vk_create_extended_task`
2. **Health Check**: Use `/health` endpoint for agent status
3. **Extended Fields**: Store DNA/agent/council data locally (pending VibeKanban backend update)
4. **Backward Compatibility**: All existing VibeKanban tools still work

## Workflow Example

```typescript
// 1. Receive new task request
const task = {
  title: 'Implement authentication',
  description: 'Build JWT-based auth system'
};

// 2. Find patterns
const dnaMatch = tracker.findPattern(task.title, task.description);

// 3. Recommend/assign agent
const assignment = dnaMatch
  ? manager.patternAssign(dnaMatch.pattern.id)
  : manager.autoAssign(task.title, task.description);

// 4. Create council decision if needed
const decision = council.createDecision(
  `Should ${assignment.primary_agent} handle ${task.title}?`,
  ['maia', 'reviewer'],
  300000
);

// 5. Create extended task
vk_create_extended_task({
  project_id: 'project-uuid',
  title: task.title,
  description: task.description,
  primary_agent: assignment.primary_agent,
  assignment_method: dnaMatch ? 'pattern' : 'auto',
  pattern_id: dnaMatch?.pattern.id
});

// 6. Track interactions during execution
tracker.recordInteraction(taskId, {
  agent_id: assignment.primary_agent,
  action: 'implementation',
  duration_ms: 15000,
  timestamp: new Date().toISOString()
});

// 7. Record outcome on completion
tracker.recordOutcome(taskId, 'success', {
  completion_time_ms: 15000,
  revision_count: 2,
  quality_score: 0.9
});
```

## Persistence

State can be serialized and persisted:

```typescript
import { getDNATracker } from './.opencode/ecosystem';

const tracker = getDNATracker();

// Serialize state
const state = tracker.serialize();

// Persist to disk/database
fs.writeFileSync('dna-state.json', state);

// Deserialize on startup
const loadedState = fs.readFileSync('dna-state.json', 'utf-8');
tracker.deserialize(loadedState);
```

## Default Agents

The foundation includes these default agents:

| Agent ID | Name | Capabilities | Max Tasks |
|-----------|-------|--------------|------------|
| maia | MAIA Orchestrator | planning, meta, coding | 5 |
| sisyphus | Sisyphus PM | planning, meta | 3 |
| coder | Coder Architect | coding, testing, frontend, backend | 10 |
| ops | Ops Engineer | infrastructure, devops, automation | 5 |
| researcher | Researcher Oracle | research, meta | 8 |
| reviewer | Reviewer Gatekeeper | review, testing | 6 |
| workflow | Workflow Automator | automation, infrastructure | 5 |

## Development Status

**Phase 1** (Current):
- ✅ Extended task schema
- ✅ DNA tracking system
- ✅ Council voting tools
- ✅ Agent tagging and management
- ✅ MCP tools for integration
- ✅ Basic VibeKanban integration

**Next Steps** (Phase 2):
- Emergence scoring and detection
- Advanced pattern recognition
- Cross-agent collaboration tracking
- Reinforcement learning from outcomes
- Real-time ecosystem dashboard

## Testing

Run tests to verify implementation:

```bash
# Test DNA tracking
npm run test -- dna

# Test council voting
npm run test -- council

# Test agent management
npm run test -- agents

# Test full integration
npm run test -- ecosystem
```

## Configuration

Environment variables:

- `VIBE_KANBAN_URL`: VibeKanban API URL (default: `http://localhost:62601`)

## License

Part of MAIA Open Code Ecosystem
