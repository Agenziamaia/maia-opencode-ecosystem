# PROTOCOL OMEGA: Multi-Agent Handoff & Architecture Strategy

**To the Next Agent:**
We have elevated the `multiagent-layer0` environment to a **God-Tier Multi-Agent Ecosystem**, synthesizing the "5 Super Agents" philosophy (Sisyphus, Frontend, Librarian, Oracle, Explore) with the `opencode-sessions` and `oh-my-opencode` plugin capabilities.

## 1. The Architectural Synthesis
We have mapped the video's "5 Super Agents" concept to our existing `MAIA` cadre, creating a mirrored but enhanced architecture:

| Video Concept | MAIA Agent | Role & Capability |
| :--- | :--- | :--- |
| **Sisyphus** (Orchestrator) | **@maia** | **The Brain**. Strategic planning, delegation, and session management. |
| **Frontend Engineer** | **@coder** | **The Hand**. Full-stack architect. *Note: We kept it unified as "Coder" to remain stack-agnostic (God Mode).* |
| **Librarian** | **@researcher** | **The Eye**. Deep context ingestion, documentation reading, and finding truth. |
| **Oracle** | **@reviewer** | **The Shield**. Strict validation, "No Mercy" auditing, and architectural sanity checks. |
| **Explore** | **@ops** / **@maia** | **The Ground**. Infrastructure stability and rapid codebase exploration (grep/glob). |

## 2. The Nervous System: `opencode-sessions`
We have integrated the `opencode-sessions` plugin to provide the connective tissue between these agents. This is not just a tool; it is the **protocol for collaboration**.

### The 4 Modes of Interaction
1.  **FORK (Parallel Realities)**
    *   *Concept*: "Explore before you commit."
    *   *Usage*: When unsure of an architectural decision (e.g., "Microservices vs. Monolith"), **@maia** or **@coder** MUST usage `session({ mode: "fork" })` to spawn parallel timelines.
    *   *Benefit*: Discuss trade-offs in isolation without polluting the main context.

2.  **MESSAGE (Synaptic Firing)**
    *   *Concept*: "Hot Handoffs."
    *   *Usage*: **@coder** finishes a module -> `session({ mode: "message", agent: "reviewer" })`. **@researcher** finds a library -> `session({ mode: "message", agent: "maia" })`.
    *   *Benefit*: Zero-latency context transfer. The receiver "wakes up" with the full thread history.

3.  **NEW (Reincarnation)**
    *   *Concept*: "Clean Slate."
    *   *Usage*: Phase transitions (Planning -> Implementation) where history is noise.

4.  **COMPACT (Memory Optimization)**
    *   *Concept*: "Infinite Context."
    *   *Usage*: Compress 50k tokens into a summary to keep the "Brain" fast.

## 3. The Power Source: `oh-my-opencode`
We have added the `oh-my-opencode` plugin to unlock session management superpowers.
*   **Session Management**: `session_list`, `session_read`, `session_search` allow agents to recall past decisions or find context from other threads.
*   **Prompt Configuration**: Enables fine-tuned system prompts for each agent (already handled in `AGENTS.md`).

## 4. Strategic Thinking: "How to Use Best"

**Think in Flows, Not Tasks.**
Don't just "write code." Orchestrate a flow.
*   *Bad*: "I will write the API."
*   *Good*: "I will **Plan** the API with @maia, **Fork** two implementations (FastAPI vs Hono) with @coder, **Message** @reviewer to pick the winner, then **Compact** the session."

**The "God Mode" Loop:**
1.  **Plan** (Maia): Define the objective.
2.  **Research** (Researcher): Fetch context.
3.  **Explore** (Maia/Coder): Fork if uncertain.
4.  **Execute** (Coder): Build the winner.
5.  **Audit** (Reviewer): Kill bugs.
6.  **Compact**: Save state.

## 5. Current State & Next Steps
-   **Configuration**: `opencode.json` is updated with `"plugin": ["opencode-sessions", "oh-my-opencode"]` and tool permissions.
-   **Documentation**: `AGENTS.md` now explicitly teaches agents how to use these tools.
-   **Status**: Ready for initialization.

### Immediate Action Items for YOU:
1.  **Initialize**: Run `opencode` in this directory to trigger plugin auto-installation.
2.  **Verify**: Test a `fork` command.
3.  **Evolve**: As you build, observe if **@coder** correctly hands off to **@reviewer**. If not, reinforce `AGENTS.md`.

## 6. Smoke Test (Validation Protocol)
Run this to confirm the system is wired correctly:

```bash
# In multiagent-layer0 directory
opencode
```

Then send:
```
/plan "Build a hello world CLI in Python"
```

**Expected Flow**:
1. `@maia` creates a plan and delegates to `@coder`
2. `@coder` builds the CLI
3. `@coder` calls `session({ mode: 'message', agent: 'reviewer' })` to hand off
4. `@reviewer` audits the code

If step 3 doesn't happen automatically, explicitly prompt: "Now hand off to @reviewer using session tool."

*Rationale*: This setup avoids the "bloat" of the main folder while creating a highly modular, "mirror" synthesis that allows us to test radical multi-agent workflows safely.
