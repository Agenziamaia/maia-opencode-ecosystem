# THE MAIA CONSTITUTION

**The Governance Layer of the MAIA Ecosystem**

A comprehensive system for autonomous governance, enabling safe multi-agent collaboration through constitutional principles, democratic decision-making, and proactive intelligence.

---

## Overview

The MAIA Constitution provides three pillars of governance:

1. **The Constitution** - Supreme law with inviolable principles
2. **The Council** - Democratic voting for conflict resolution
3. **The Predictive Engine** - Proactive anticipation of needs and risks

```
┌─────────────────────────────────────────────────────────────┐
│                  THE MAIA CONSTITUTION                      │
│                   (Governance Layer)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Constitution │→ │    Council   │→ │  Predictive  │    │
│  │              │  │              │  │              │    │
│  │ - Principles │  │ - Voting     │  │ - Anticipate │    │
│  │ - Guardrails │  │ - Consensus  │  │ - Prevent    │    │
│  │ - Safety     │  │ - Democracy  │  │ - Optimize   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## The 8 Core Principles

| # | Principle | Category | Priority | Description |
|---|-----------|----------|----------|-------------|
| 1 | No Destructive Actions Without Consent | Safety | 1 | Never delete user data without explicit approval |
| 2 | Transparency and Explainability | Transparency | 1 | All actions must be explainable to humans |
| 3 | Efficiency Over Perfection | Efficiency | 2 | Speed > Perfection (pragmatism > optimization) |
| 4 | Consult Before Major Changes | Collaboration | 1 | Major changes require user consultation |
| 5 | Recovery First | Recovery | 1 | Preserve work before aborting |
| 6 | Autonomy with Guardrails | Safety | 2 | Agents are autonomous within constitutional boundaries |
| 7 | Council for Disagreements | Collaboration | 2 | Democratic resolution of agent conflicts |
| 8 | Learn and Adapt | Efficiency | 3 | Continuously improve from patterns |

---

## Quick Start

### Basic Usage

```typescript
import {
  evaluateAction,
  getProactiveSuggestions,
  proposeCouncilDecision
} from '.opencode/ecosystem/constitution';

// 1. Check if an action is constitutional
const result = evaluateAction({
  id: 'action_1',
  agentId: 'coder',
  actionType: 'delete',
  target: '/path/to/file.ts',
  description: 'Delete a TypeScript file',
  context: {},
  timestamp: new Date().toISOString()
});

if (!result.canProceed) {
  console.log('Action unconstitutional:', result.ruling.violatedPrinciples);
  console.log('Alternatives:', result.alternatives);
}

// 2. Get proactive suggestions
const suggestions = getProactiveSuggestions({
  currentTask: { /* ... */ },
  recentTasks: [/* ... */],
  systemState: { /* ... */ },
  timeContext: { /* ... */ }
});

console.log('Predictions:', suggestions.predictions);
console.log('Risks:', suggestions.risks);

// 3. Propose a council decision
const proposal = await proposeCouncilDecision(
  'Refactor Core Architecture',
  'Refactor the codebase for better maintainability',
  'architectural',
  {
    affectedSystems: ['api', 'frontend'],
    risks: ['Breaking changes', 'Testing required'],
    benefits: ['Better maintainability', 'Easier to extend']
  },
  'maia'
);
```

### Running the Demo

```bash
cd /Users/g/Desktop/MAIA\ opencode/.opencode/ecosystem/constitution
bun run demo.ts
```

---

## Architecture

### 1. Constitution (`constitution.ts`)

The Supreme Law of MAIA - all actions must pass constitutional review before execution.

**Key Classes:**
- `Constitution` - Main constitutional evaluator
- `ConstitutionalPrinciple` - Core inviolable values
- `ConstitutionalConstraint` - Agent-specific limitations
- `ConstitutionalRuling` - Judgment on action constitutionality

**Key Methods:**
- `evaluate(action)` - Determine if an action is constitutional
- `suggestAlternatives(action)` - Provide safer alternatives
- `addPrinciple(principle)` - Add new principle (requires approval)
- `getHealthReport()` - Get constitution health metrics

### 2. Enhanced Council (`council/enhanced-council.ts`)

Democratic decision-making for agent disagreements and major decisions.

**Key Classes:**
- `EnhancedCouncil` - Main council manager
- `CouncilProposal` - Proposal put forth for voting
- `CouncilVote` - Enhanced vote with expertise weighting
- `CouncilDecision` - Final decision from proposal

**Key Methods:**
- `propose(proposal)` - Create a new proposal
- `startVoting(proposalId)` - Begin voting phase
- `vote(proposalId, agentId, vote, reasoning)` - Cast a vote
- `getDecision(proposalId)` - Get final decision
- `findPrecedents(proposal)` - Find similar past decisions

**Expertise Matrix:**

The council uses expertise-based weighting:

```typescript
{
  'maia': {
    'planning': 0.95,
    'architecture': 0.90,
    'coding': 0.75,
    // ...
  },
  'coder': {
    'coding': 0.95,
    'architecture': 0.80,
    'testing': 0.80,
    // ...
  }
  // ...
}
```

### 3. Predictive Engine (`prediction/predictive-engine.ts`)

Proactive intelligence that anticipates needs and prevents problems.

**Key Classes:**
- `PredictiveEngine` - Main prediction engine
- `Prediction` - Anticipated future need
- `Risk` - Detected potential problem
- `Optimization` - Suggested improvement

**Key Methods:**
- `predictNext(context)` - Predict what user needs next
- `detectRisks(workflow, context)` - Detect potential problems
- `suggestOptimizations(systemState)` - Suggest improvements
- `validatePrediction(predictionId, accurate)` - Learn from accuracy

**Pattern Categories:**

- **Task Patterns**: What typically follows what (e.g., implement → test → review)
- **Risk Patterns**: Indicators of potential problems (e.g., timeout, conflicts)
- **Optimization Patterns**: Opportunities for improvement (e.g., parallelization)

---

## Integration with Existing Systems

### With MaiaOrchestrator

The Constitution wraps the orchestrator's dispatch layer:

```typescript
import { getMaiaOrchestrator } from '.opencode/ecosystem/orchestrator';
import { evaluateAction } from '.opencode/ecosystem/constitution';

const orchestrator = getMaiaOrchestrator();

// Wrap dispatch with constitutional check
async function constitutionalDispatch(task: string, agent: string) {
  const action = {
    id: generateId(),
    agentId: agent,
    actionType: 'execute',
    target: task,
    description: task,
    context: {},
    timestamp: new Date().toISOString()
  };

  const result = evaluateAction(action);

  if (!result.canProceed) {
    if (result.requiresCouncil) {
      // Propose to council
      await proposeCouncilDecision(...);
    }
    if (result.requiresUserApproval) {
      // Request user approval
      await requestUserApproval(result.ruling);
    }
  }

  return orchestrator.orchestrate(task);
}
```

### With DNA Tracker

The Predictive Engine uses DNA patterns for predictions:

```typescript
import { getDNATracker } from '.opencode/ecosystem/dna/dna-tracker';
import { getPredictiveEngine } from '.opencode/ecosystem/prediction';

const dna = getDNATracker();
const prediction = getPredictiveEngine();

// DNA informs predictions
const patternMatch = dna.findPattern(taskTitle, taskDescription);
const predictions = prediction.predictNext(userContext);
```

---

## API Reference

### Constitutional Evaluation

```typescript
interface AgentAction {
  id: string;
  agentId: string;
  actionType: 'read' | 'write' | 'delete' | 'execute' | 'dispatch';
  target: string;
  description: string;
  context: Record<string, unknown>;
  timestamp: string;
}

interface ConstitutionalRuling {
  isConstitutional: boolean;
  violatedPrinciples: Array<{
    principle: ConstitutionalPrinciple;
    severity: 'critical' | 'major' | 'minor';
    explanation: string;
  }>;
  warnings: string[];
  suggestions: string[];
  confidence: number;
}
```

### Council Voting

```typescript
interface CouncilProposal {
  id: string;
  title: string;
  description: string;
  proposalType: 'agent_assignment' | 'architectural' | 'refactoring' | 'constitutional';
  proposedBy: string;
  status: 'pending' | 'voting' | 'consensus' | 'rejected';
  votes: CouncilVote[];
  consensusThreshold: number; // 0-1
}

interface CouncilVote {
  agentId: string;
  vote: 'yes' | 'no' | 'abstain' | 'veto';
  reasoning: string;
  confidence: number; // 0-1
  expertise: number; // 0-1
}
```

### Predictions

```typescript
interface Prediction {
  type: 'next_action' | 'resource_need' | 'agent_suggestion' | 'risk_mitigation';
  confidence: number; // 0-1
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  prediction: string;
  reasoning: string;
  suggestedActions: SuggestedAction[];
}

interface Risk {
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'timeout' | 'conflict' | 'resource' | 'quality';
  probability: number; // 0-1
  mitigation: MitigationStrategy[];
}
```

---

## Examples

### Example 1: Preventing Destructive Actions

```typescript
const result = evaluateAction({
  actionType: 'delete',
  target: 'production/database.db',
  context: { autonomous: true }
});

// Result: UNCONSTITUTIONAL
// Violated: "No Destructive Actions Without Consent"
// Suggestion: Create backup before deletion
```

### Example 2: Council for Major Changes

```typescript
const result = evaluateAction({
  actionType: 'modify',
  context: {
    affectsMultipleSystems: true,
    isArchitectural: true
  }
});

// Result: Requires Council Vote
// Action: Automatic council proposal created
```

### Example 3: Proactive Suggestions

```typescript
const suggestions = getProactiveSuggestions({
  currentTask: { title: 'Implement API endpoint', progress: 0.7 },
  systemState: { diskUsage: 0.95 }
});

// Predictions: "User will likely need to: test"
// Risks: "Disk space critically low"
```

---

## Configuration

### Environment Variables

```bash
# No environment variables required for basic operation
```

### Custom Principles

```typescript
import { getConstitution } from '.opencode/ecosystem/constitution';

const constitution = getConstitution();

constitution.addPrinciple({
  id: 'custom_principle',
  name: 'My Custom Principle',
  category: 'safety',
  priority: 1,
  description: 'Description of the principle',
  rationale: 'Why this principle exists',
  enforcement: 'strict',
  examples: {
    compliant: ['Example 1'],
    violating: ['Example 2']
  }
});
```

### Custom Expertise Matrix

```typescript
import { getEnhancedCouncil } from '.opencode/ecosystem/council';

const council = getEnhancedCouncil();

council.updateExpertise('coder', 'python', 0.95);
council.updateExpertise('coder', 'rust', 0.85);
```

---

## Persistence

All three systems support serialization:

```typescript
import {
  getConstitution,
  getEnhancedCouncil,
  getPredictiveEngine
} from '.opencode/ecosystem/constitution';

const constitution = getConstitution();
const council = getEnhancedCouncil();
const prediction = getPredictiveEngine();

// Serialize
const state = {
  constitution: constitution.serialize(),
  council: council.serialize(),
  prediction: prediction.serialize()
};

// Persist to disk
fs.writeFileSync('governance-state.json', JSON.stringify(state));

// Deserialize
constitution.parse(state.constitution);
council.deserialize(state.council);
prediction.deserialize(state.prediction);
```

---

## Testing

```bash
# Run constitution tests
bun test .opencode/ecosystem/constitution/constitution.test.ts

# Run council tests
bun test .opencode/ecosystem/council/enhanced-council.test.ts

# Run prediction tests
bun test .opencode/ecosystem/prediction/predictive-engine.test.ts

# Run integration tests
bun test .opencode/ecosystem/constitution/integration.test.ts
```

---

## Health Monitoring

```typescript
import { getGovernanceHealth } from '.opencode/ecosystem/constitution';

const health = getGovernanceHealth();

console.log('Constitution Health:', health.constitution.healthStatus);
console.log('Council Decisions:', health.council.totalDecisions);
console.log('Prediction Accuracy:', health.prediction.accuracyRate);
```

---

## Contributing

When adding new governance features:

1. **Constitution**: Only add principles with priority 3+ (lower priority = more critical)
2. **Council**: Ensure all proposals have constitution checks
3. **Prediction**: Validate predictions with user feedback

---

## License

Part of the MAIA Open Code Ecosystem

---

## Summary

**THE MAIA CONSTITUTION** represents a unique signature contribution that enables:

1. **Safe Autonomous Operation** - Constitution enforces guardrails
2. **Democratic Conflict Resolution** - Council provides consensus
3. **Proactive Optimization** - Prediction anticipates needs

This is the orchestrator's perspective on governance - enabling autonomous agents to work safely and effectively while maintaining human oversight and democratic principles.
