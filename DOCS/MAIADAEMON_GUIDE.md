# MAIA DAEMON - Shared Dispatch Service

**Architecture Decision**: Option A - MaiaDaemon as a shared service used by MAIA, Sisyphus, and any agent that needs to dispatch tasks.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIADAEMON (Shared Service)              │
│  - dispatch(instruction, options)                          │
│  - Constitution check (safety before dispatch)              │
│  - DNA-aware routing (learn from past successes)            │
│  - Council consultation (for complex decisions)             │
│  - Prediction check (risk detection)                        │
└──────────┬──────────────────────────────────────────────────┘
           │
           ├──► MAIA.dispatch("fix bug") → Constitution → DNA → @coder
           ├──► Sisyphus.dispatch("build feature") → Council → DNA → @frontend
           └──► Any agent can use the shared dispatch service
```

---

## 📖 Usage

### Basic Dispatch

```typescript
import { getMaiaDaemon } from '.opencode/ecosystem/execution/maia-daemon.js';

const daemon = getMaiaDaemon();

// Simple dispatch - daemon decides agent
const task = await daemon.dispatch("fix the authentication bug");

// Specify preferred agent
const task = await daemon.dispatch("write tests", {
  preferredAgent: "coder",
});
```

### With Governance

```typescript
// MAIA uses daemon with Constitution check
const task = await daemon.dispatch("delete all production data", {
  requestingAgent: "maia",
  // Constitution will evaluate safety
});
```

```typescript
// Sisyphus uses daemon with Council consultation
const task = await daemon.dispatch("redesign the api architecture", {
  requestingAgent: "sisyphus",
  requireCouncilVote: true,  // Force Council consultation
  // Council will vote on architectural decisions
});
```

### Emergency Override

```typescript
// Skip constitution for emergency operations
const task = await daemon.dispatch("emergency hotfix", {
  skipConstitution: true,
  requestingAgent: "ops",
});
```

---

## 🔄 Dispatch Flow

```
1. Constitution Check
   ├─ Is this action safe?
   ├─ Are there alternatives?
   └─ Can proceed? (if not, throws error)

2. DNA-Aware Agent Selection
   ├─ Check past successes (pattern matching)
   ├─ Hierarchy rules (Sisyphus for projects, MAIA for strategy)
   └─ Operational routing (researcher, coder, etc.)

3. Council Consultation
   ├─ Is this a complex decision?
   ├─ Create proposal for voting
   └─ Log for review

4. Prediction Check
   ├─ Detect risks
   └─ Suggest optimizations

5. Route & Monitor
   ├─ Create task in ExecutionManager
   ├─ Start task (parallel or sequential)
   └─ Monitor health (10s checks)
```

---

## 📊 Governance Result

Every dispatch returns a result with full governance info:

```typescript
{
  id: "task-123",
  agentId: "coder",
  status: "running",
  governance: {
    constitutionChecked: true,
    constitutionRuling: {
      canProceed: true,
      violatedPrinciples: [],
      alternatives: []
    },
    councilConsulted: true,
    councilDecision: "Proposal logged for review",
    dnaPatternMatched: true,
    predictionUsed: false
  }
}
```

---

## 🎯 Agent Integration Examples

### MAIA (CEO/Orchestrator)

```typescript
// In MAIA's orchestration logic
const daemon = getMaiaDaemon();

// Quick tactical dispatch
const task = await daemon.dispatch("fix the login bug", {
  requestingAgent: "maia",
});

// Strategic decision
const task = await daemon.dispatch("approve database migration", {
  requestingAgent: "maia",
  requireCouncilVote: true,  // Major decisions need Council
});
```

### Sisyphus (Project Manager)

```typescript
// In Sisyphus's campaign logic
const daemon = getMaiaDaemon();

// Project work
const task = await daemon.dispatch("implement user profile feature", {
  preferredAgent: "frontend",
  requestingAgent: "sisyphus",
});

// Complex architectural work
const task = await daemon.dispatch("redesign api for scalability", {
  requestingAgent: "sisyphus",
  // Complex decisions automatically trigger Council
});
```

### Any Specialist Agent

```typescript
// Even specialists can dispatch if needed
const daemon = getMaiaDaemon();

// Researcher asks for implementation
const task = await daemon.dispatch("implement the researched solution", {
  preferredAgent: "coder",
  requestingAgent: "researcher",
});
```

---

## 🛡️ Safety Features

1. **Constitution Guardrails**: Blocks unconstitutional actions
2. **DNA Learning**: Gets smarter with every task
3. **Council Democracy**: Complex decisions get voted on
4. **Risk Detection**: Predictive engine catches issues early
5. **Health Monitoring**: 10s timeout checks on all tasks

---

## 📝 Key Design Decisions

**Why MaiaDaemon as a shared service?**
- ✅ Consistent routing logic across all agents
- ✅ Single queue, single health monitor
- ✅ All DNA learning captured in one place
- ✅ Easy to update routing rules globally

**Not a separate agent, but infrastructure:**
- Like ExecutionManager, it's a utility
- Agents USE it, they don't compete with it
- Think of it as the "transmission" that all "drivers" (agents) use

**Relationship to MAIA vs Sisyphus:**
- MAIA = CEO (strategic decisions)
- Sisyphus = Project Manager (campaign planning)
- MaiaDaemon = Transmission (routes work to specialists)
- Both MAIA and Sisyphus USE MaiaDaemon to dispatch work
