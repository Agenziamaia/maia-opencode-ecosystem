# 🧠 DEEP ROOT CAUSE ANALYSIS: THE "FAKE TERMS" INCIDENT

## 🚨 The Situation
The user reported that the ecosystem felt "fake" and that MAIA was stuck in thinking loops, unable to perform basic orchestration that Sisyphus previously handled well. The "quick fix" attempts were rejected as band-aids.

## 🕵️ Root Cause Analysis

### 1. Why the Thinking Loops?
**Root Cause:** `oh-my-opencode` tool chain timeouts + "Blind" Optimism.
- MAIA was attempting to read sessions using tools that hung or returned ambiguous "loading" states.
- Lacking a "Stall-Breaker" protocol, she optimistically retried, causing an infinite loop.
- **Fix:** Implemented a **Strict Stall-Breaker Protocol** in `maia.md`. If a tool takes >10s, she MUST abort and pivot to local state (git log, status files).

### 2. Why "Fake Terms"? (The Broken Ecosystem Feeling)
**Root Cause:** Agents were **ignoring** the MCP ecosystem tools.
- Sisyphus worked because his profile had explicit "Hive Protocol" instructions forcing him to create Kanban cards.
- MAIA's profile was too high-level ("Strategy") and lacked the grit to force `vk_create_extended_task` calls.
- As a result, she "thought" about tasks but never materialized them on the board, making the swarm feel "fake".
- **Fix:** Ported Sisyphus's strict **Hive Protocol** to MAIA. Now she is MANDATED to create a card for *every* request.

### 3. Was Coder's MCP Real?
- **Verification:** ✅ YES.
- We manually tested the API:
  - `POST /api/tasks` -> Created "🔴 SWARM TEST: Hello World"
  - `PUT /api/tasks/:id` -> Moved it to "🟡 In Progress"
  - `WAKEUP.sh` -> Instantly reflected the change.
- The tools works; the agents just weren't using it.

## 🛠️ The Permanent Solution

### 1. Deep Project Discovery
MAIA now scans **ALL** projects on startup. If she finds active work in `giuzu-test`, she locks onto it rather than staring at an empty `MAIA opencode` board.

### 2. Mandatory Swarm Orchestration
MAIA's profile now explicitly commands:
> "Card for Every Request: You MUST create a card in Vibe Kanban for EVERY user request."

### 3. Transparent WAKEUP
The `WAKEUP.sh` script now provides a "God View" of all active tasks across all projects, preventing any hidden work.

## ✅ NEXT STEPS
1.  **Run MAIA**: She is now "awake" and mandated to use the Kanban.
2.  **Verify Flow**: Watch the Vibe Kanban board (Port 62601). You should see cards moving.
3.  **Build**: Proceed with the website build. The swarm is ready.
