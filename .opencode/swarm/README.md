# Swarm Intelligence - MAIA Ecosystem

Collective intelligence for agent task routing and decision making.

## Overview

The Swarm Intelligence system provides:

1. **Task-to-Agent Recommendations**: Suggests the best agent for a task based on historical success patterns
2. **Pattern Learning**: Learns from completed tasks to improve future recommendations
3. **Council Recommendations**: Suggests council members for complex decisions
4. **Collective Analytics**: Provides insights into swarm performance

## Installation

The system consists of two components:

1. **Python CLI**: `.opencode/swarm/swarm-intel.py` - Core intelligence engine
2. **TypeScript Wrapper**: `ecosystem/swarm-integration.ts` - Integration layer

Ensure Python 3 is installed:
```bash
python3 --version
```

## CLI Usage

### Recommend an Agent for a Task

```bash
python3 swarm-intel.py --recommend "Fix the login bug in authentication"
```

**Response:**
```json
{
  "status": "success",
  "task": "Fix the login bug in authentication",
  "recommendation": {
    "category": "bugfix",
    "ranked_agents": [
      {"agent": "coder", "confidence": 0.92},
      {"agent": "reviewer", "confidence": 0.75},
      {"agent": "ops", "confidence": 0.45}
    ],
    "similar_patterns": [...]
  }
}
```

### Query Similar Past Tasks

```bash
python3 swarm-intel.py --query "implement api endpoint" --limit 5
```

### Learn from Completed Task

```bash
python3 swarm-intel.py --learn \
  --task "Fix login authentication bug" \
  --agent coder \
  --outcome success \
  --complexity medium \
  --duration-ms 45000
```

### Get Council Recommendation

```bash
python3 swarm-intel.py --council "Redesign the entire database schema" --complexity high
```

**Response:**
```json
{
  "status": "success",
  "task": "Redesign the entire database schema",
  "council_recommendation": {
    "task_category": "refactor",
    "complexity": "high",
    "recommended_council": [
      "oracle",
      "prometheus",
      "coder",
      "ops",
      "maia_premium",
      "sisyphus",
      "maia"
    ],
    "rationale": "refactor task requiring high complexity oversight"
  }
}
```

### Show Swarm Statistics

```bash
python3 swarm-intel.py --stats
```

## TypeScript Integration

### Import

```typescript
import {
  getSwarmIntelligence,
  recommendAgent,
  recordTaskOutcome,
  getCouncil
} from './swarm-integration.js';
```

### Get Recommendation

```typescript
const swarm = getSwarmIntelligence();
const rec = await swarm.directRecommend("Fix the UI bug");
console.log(`Top agent: ${rec.topAgent} (confidence: ${rec.confidence})`);
```

### Learn from Outcome

```typescript
await swarm.learn(
  "Task description",
  "coder",
  "success",
  { complexity: "medium", durationMs: 30000 }
);
```

### Quick Functions

```typescript
// Quick agent recommendation
const agent = await recommendAgent("Implement new feature");

// Record task outcome
await recordTaskOutcome("Fix bug", "coder", true, 15000);

// Get council for complex task
const council = await getCouncil("Architecture redesign", "high");
```

## Integration with MaiaDaemon

The `MaiaDaemon` automatically uses swarm intelligence as part of the agent selection process:

1. DNA pattern matching (highest priority)
2. **Swarm intelligence** (collective wisdom)
3. Hierarchy rules (Sisyphus for projects, MAIA for strategy)
4. Operational routing (specialist agents)
5. Default to coder

## Data Storage

Swarm data is stored in `.opencode/swarm/data/`:

- `patterns.json` - Learned task patterns
- `tasks.json` - Task history
- `council.json` - Council recommendations
- `knowledge.json` - Collective insights

## Task Categories

The system recognizes the following categories:

- `bugfix` - Fixing bugs or errors
- `feature` - Implementing new features
- `refactor` - Code restructuring
- `documentation` - Documentation tasks
- `testing` - Testing and quality assurance
- `deployment` - Deployment and release
- `review` - Code review and audit
- `research` - Research and investigation
- `optimization` - Performance optimization
- `general` - General tasks

## Complexity Levels

- `low` - Simple, well-defined tasks
- `medium` - Standard tasks (default)
- `high` - Complex, multi-faceted tasks

## Agent Capabilities

Each agent has defined capabilities that influence recommendations:

| Agent | Capabilities |
|-------|-------------|
| maia | planning, meta, coding, strategy |
| sisyphus | planning, meta, project-management, scheduling |
| coder | coding, testing, frontend, backend, architecture |
| ops | infrastructure, devops, automation, deployment |
| researcher | research, meta, documentation |
| reviewer | review, testing, quality-assurance |
| workflow | automation, infrastructure, n8n, workflows |
| researcher_deep | research, meta, academic, deep-analysis |
| vision | research, meta, multimodal, visual |
| starter | planning, infrastructure, bootstrap, setup |
| librarian | research, meta, documentation, knowledge |
| maia_premium | meta, planning, review, escalation |
| prometheus | planning, meta, milestones, architecture |
| oracle | meta, planning, coding, architecture |
| explore | research, scanning, codebase-mapping |
| frontend | frontend, coding, ui, ux |
| github | automation, meta, git, version-control |
| sisyphus_junior | coding, implementation, precision |
| opencode | meta, infrastructure, ecosystem |

## Semantic Similarity

The system uses TF-IDF style feature extraction with cosine similarity to find similar tasks:

1. Tokenizes task descriptions
2. Builds feature vectors
3. Calculates similarity scores
4. Combines with success rate weighting

## Contributing

To improve swarm intelligence:

1. Regularly record task outcomes using `--learn`
2. Use `--stats` to monitor collective performance
3. Review patterns in `.opencode/swarm/data/patterns.json`
4. Adjust agent capabilities in `swarm-intel.py`

## License

Part of the MAIA Ecosystem.
