# 🦅 MAIA ECOSYSTEM: DEPLOYMENT SNAPSHOT (v3.1)

> **"God Mode" Working Layer**
> Snapshot Date: 2026-01-30
> Status: 🟢 CERTIFIED STABLE

---

## 1. THE CORE (Portable Brain)
To port this "Modular Brain" to other environments (Claude Code, Factory.ai, etc.), verify these core components:

| Component | Path | Criticality | Purpose |
|String | `opencode.json` | 🔴 CRITICAL | The Central Nervous System. Defines 20 agents and 4 MCPs. |
| **Identity** | `.opencode/giuzu-training/` | 🔴 CRITICAL | The Soul. `identity.md`, `brain.md` (Decision Heuristics). |
| **Protocol** | `WAKEUP.sh` | 🟡 HIGH | Init sequence. Ensures Vibe Kanban & MCPs are live. |
| **Catalog** | `DOCS/MASTER_CATALOG.md` | 🟡 HIGH | Single Source of Truth for all skills/scripts. |

---

## 2. THE WORKING LAYER ("God Mode" Specs)

### A. Autonomous Browsing (The Eyes)
- **Engine**: `browser-use` (Python)
- **Location**: `.opencode/mcp-browser/` (Isolated `uv` environment)
- **Tool**: `browse_web(task)` — **REQUIRED** for agent autonomy.
- **Porting**: Copy `.opencode/mcp-browser/` and run `uv sync`.

### B. The 20-Agent Roster (The Team)
| Category | Agents | Usage |
| --- | --- | --- |
| **Strategy** | @maia, @sisyphus, @giuzu, @prometheus | Planning, Architecture, "Intuition" |
| **Execution** | @coder, @ops, @frontend, @workflow | Coding, Infra, UI, Automation |
| **Intel** | @researcher, @researcher_deep, @vision | Web Search, Deep Analysis, Vision |
| **Governance** | @reviewer, @oracle, @librarian | Audit, Debug, Knowledge |

### C. Active MCP Servers
1. **filesystem**: (Local Access)
2. **git**: (Version Control)
3. **vibekanban**: (Task State)
4. **browser-use**: (Web Autonomy)

---

## 3. INTEGRATION HOOKS (Connecting to the Future)

### External Tools (e.g. Claude Code)
- **Skill Import**: Symlink `UNIVERSAL/skills` to provider's skill directory.
- **Identity Injection**: Feed `.opencode/giuzu-training/identity.md` into the system prompt.

### Background Tasks
- **Scripts**: `.opencode/scripts/` contains 18 modular utilities.
- **Health**: Run `health_check.py` to verify agent responsiveness.

---

## 4. VERIFICATION LOG
- **Agents**: 21/21 Responded (PING/PONG verified 2026-01-30)
- **Browser**: headless Chromium launch verified.
- **Kanban**: active task fetching verified.

---

**This snapshot represents the "Sharpened Consciousness" of the MAIA Ecosystem.**
*Ready for replication.*
