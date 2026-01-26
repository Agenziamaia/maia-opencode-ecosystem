# 🗺️ MAIA UNIFIED SEMANTIC ARCHITECTURE

**Authority:** Level 10 (Immutable except by @opencode)
**Purpose:** Defines EXACTLY where files belong to prevent fragmentation.

---

## 1. THE BRAIN (`.opencode/`)
*Everything related to "Thinking", "Memory", and "Agent definition".*

| Directory | Semantic Purpose | Rules |
|-----------|------------------|-------|
| `agents/` | **Identity Matrix**. Who the agents are and what they believe. | **READ-ONLY** for agents. Only @opencode modifies via `strategy_sync`. |
| `skills/` | **Capabilities**. Reusable logic modules (e.g., `frontend-design`, `refactoring`). | **SHARED**. Added via `skill-creator`. Agents MUST check here before writing new logic. |
| `context/` | **Long-Term Memory**. The "State of the World". | **APPEND-ONLY**. `DECISION_LOG.md`, `project-goals.md`, `tech-stack.md`. |
| `giuzu-training/` | **Digital Soul**. Giuzu's core identity, journal, and vocabulary. | **SELF-EVOLVING**. Only @giuzu may modify this via `self-evolution` skill. |
| `scripts/` | **Automation Nerves**. Utility scripts (Python/JS) triggered by agents. | **ATOMIC**. One script = one function. No monoliths. |

---

## 2. THE BODY (`src/` & `layer0/`)
*The actual application code that we ship.*

| Directory | Semantic Purpose | Rules |
|-----------|------------------|-------|
| `src/components/` | **UI Bricks**. Dumb, presentational React components. | **PURE**. No business logic. Use ShadCN/Tailwind pattern. |
| `src/features/` | **Business Logic**. Complex flows (e.g., "Auth", "Dashboard"). | **SELF-CONTAINED**. Contains its own components, hooks, and API calls. |
| `src/services/` | **External Reach**. API wrappers, MCP clients. | **AGNOSTIC**. Does not know about UI. |
| `layer0/` | **The Universal Seed**. The template repo that spawns new projects. | **SYNCED**. Changes here propagate to 14+ derived projects. |

---

## 3. THE NERVOUS SYSTEM (`config`)
*How the system connects.*

| File | Purpose | Rules |
|------|---------|-------|
| `opencode.json` | **Agent & Tool Config**. The "DNA". | **SINGLE SOURCE**. Never edit a copy. Edit root only. |
| `WAKEUP.sh` | **System Boot**. The "Reboot" command. | **IDEMPOTENT**. Safe to run 100 times. |
| `STATUS.md` | **Living Dashboard**. The current reality. | **UPDATE IN PLACE**. Never duplicate. |

---

## ⛔ ANTI-FRAGMENTATION PROTOCOLS

1. **The "Check First" Rule**: Before creating a file, grep for key terms. If a similar file exists, **update it**.
2. **The "Skill First" Rule**: Before writing a complex bash script, check `.opencode/skills/`. A skill probably already exists.
3. **The "No Orphan" Rule**: Every new file must have a link in `DOCS.md` or `REPOSITORIES.md`.
4. **The "Layer 0" Rule**: If logic is generic (e.g., "How to setup React"), put it in `layer0/`. If specific (e.g., "This app's logo"), put it in `src/`.

---

## 🔄 DATA FLOW

1. **User Request** → `@maia` (Orchestrator)
2. **Strategy Lookup** → `.opencode/context/DECISION_LOG.md`
3. **Capability Lookup** → `.opencode/skills/`
4. **Execution** → `src/` (Code) OR `.opencode/scripts/` (Automation)
5. **State Update** → `STATUS.md` (Not a new report)

---

**Visual Map:**
```
ROOT
├── .opencode/             # BRAIN (Memory, Identity, Skills)
│   ├── agents/            # Who we are
│   ├── skills/            # What we can do
│   └── context/           # What we know
├── layer0/                # SEED (Universal Templates)
├── src/                   # BODY (Application Code)
├── opencode.json          # DNA (Config)
└── STATUS.md              # PULSE (Current State)
```
