# 🗺️ MAIA UNIFIED SEMANTIC ARCHITECTURE

**Authority:** Level 10 (Immutable except by @opencode)  
**Purpose:** Defines EXACTLY where files belong to prevent fragmentation.  
**Last Updated:** 2026-01-27

---

## 1. ROOT STRUCTURE

| Directory | Semantic Purpose | Rules |
|-----------|------------------|-------|
| `.opencode/` | **THE BRAIN**. Agent definitions, skills, memory, scripts. | Core infrastructure. Protected. |
| `PROJECTS/` | **ACTIVE WORK**. Individual project folders with their own code. | One folder per project. Self-contained. |
| `DOCS/` | **DOCUMENTATION**. Guides, roadmaps, references. | Append-only. Consolidate, don't duplicate. |
| `ARCHIVE/` | **HISTORICAL**. Old files, deprecated code, completed experiments. | Read-only. Move here instead of deleting. |
| `CONFIG/` | **SHARED CONFIG**. Environment configs, shared settings. | Version controlled. Never secrets. |
| `UNIVERSAL/` | **REUSABLE ASSETS**. Context files, templates, shared resources. | Symlinked from `.opencode/context`. |
| `.github/` | **CI/CD**. GitHub Actions, workflows, issue templates. | Automation only. |
| `.agents/` | **LEGACY**. Old agent configs (deprecated). | Migrated to `.opencode/agents/`. |

---

## 2. THE BRAIN (`.opencode/`)

*Everything related to "Thinking", "Memory", and "Agent definition".*

| Directory | Semantic Purpose | Rules |
|-----------|------------------|-------|
| `.opencode/agents/` | **Identity Matrix**. Who the agents are and what they believe. | **READ-ONLY** for agents. Only @opencode modifies via `strategy_sync`. |
| `.opencode/skills/` | **Capabilities**. Reusable logic modules (e.g., `frontend-design`). | **SHARED**. Added via `skill-creator`. |
| `.opencode/context/` | **Long-Term Memory**. Symlink to `UNIVERSAL/context/`. | **APPEND-ONLY**. |
| `.opencode/giuzu-training/` | **Digital Soul**. Giuzu's identity, journal, vocabulary. | **SELF-EVOLVING**. Only @giuzu modifies. |
| `.opencode/scripts/` | **Automation Nerves**. Utility scripts (Python/JS/Shell). | **ATOMIC**. One script = one function. |
| `.opencode/schema/` | **Validation Rules**. JSON schemas for config files. | **IMMUTABLE**. Changes require @reviewer. |
| `.opencode/config/` | **Protocol Definitions**. Machine-readable rules. | **VERSIONED**. Changes logged in CHANGELOG. |
| `.opencode/data/` | **Runtime State**. Token usage, search indices. | **TRANSIENT**. May be regenerated. |
| `.opencode/commands/` | **Agent Commands**. Slash-command definitions. | One file per command. |

---

## 3. THE NERVOUS SYSTEM (Root Config Files)

| File | Purpose | Rules |
|------|---------|-------|
| `opencode.json` | **Agent & Tool Config**. The "DNA". | **SINGLE SOURCE**. Never edit a copy. |
| `WAKEUP.sh` | **System Boot**. The "Reboot" command. | **IDEMPOTENT**. Safe to run 100 times. |
| `STATUS.md` | **Living Dashboard**. The current reality. | **UPDATE IN PLACE**. Never duplicate. |
| `README.md` | **Entry Point**. Project overview for newcomers. | Keep concise. Link to DOCS/. |

---

## 4. PROJECTS (`PROJECTS/`)

Each project is a self-contained folder with its own structure:

```
PROJECTS/
├── whatsapp-agentic-bot/    # Active project
├── whatsapp-bot-demo/       # Demo/prototype
└── [project-name]/          # One folder per project
```

---

## ⛔ ANTI-FRAGMENTATION PROTOCOLS

1. **The "Check First" Rule**: Before creating a file, grep for key terms. If a similar file exists, **update it**.
2. **The "Skill First" Rule**: Before writing a complex bash script, check `.opencode/skills/`. A skill probably exists.
3. **The "No Orphan" Rule**: Every new file must have a link in `DOCS.md` or be within a documented directory.
4. **The "Archive, Don't Delete" Rule**: Move deprecated files to `ARCHIVE/`, don't delete them.
5. **The "One Source" Rule**: Never create copies of `opencode.json`. Edit the root file only.

---

## 🔄 DATA FLOW

1. **User Request** → `@maia` (Orchestrator)
2. **Strategy Lookup** → `.opencode/context/DECISION_LOG.md`
3. **Capability Lookup** → `.opencode/skills/`
4. **Execution** → `PROJECTS/` (Code) OR `.opencode/scripts/` (Automation)
5. **State Update** → `STATUS.md` (Not a new report)

---

## 📊 Visual Map

```
ROOT
├── .opencode/               # BRAIN (Memory, Identity, Skills)
│   ├── agents/              # Who we are
│   ├── skills/              # What we can do
│   ├── scripts/             # Automation
│   ├── giuzu-training/      # Giuzu's soul
│   ├── schema/              # Validation
│   ├── config/              # Protocols
│   ├── data/                # Runtime state
│   └── context/ → UNIVERSAL/context/
├── PROJECTS/                # Active work
├── DOCS/                    # Guides & references
├── ARCHIVE/                 # Historical
├── UNIVERSAL/               # Shared assets
├── CONFIG/                  # Shared configs
├── .github/                 # CI/CD
├── opencode.json            # DNA (Config)
├── WAKEUP.sh                # Boot script
└── STATUS.md                # Current state
```
