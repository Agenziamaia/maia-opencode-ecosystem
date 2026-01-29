# 🗂️ MAIA MASTER CATALOG

> **The single source of truth for all tools, MCPs, scripts, skills, and resources.**
> Last Updated: 2026-01-30

---

## 1. 🔌 MCP Servers (Model Context Protocol)

| MCP | Purpose | Command | Used By |
| --- | ------- | ------- | ------- |
| **filesystem** | Local file operations | `npx @modelcontextprotocol/server-filesystem .` | @coder |
| **git** | Git repository operations | `npx @modelcontextprotocol/server-git` | @coder, @github |
| **vibekanban** | Kanban board & task management | `npx vibe-kanban@latest --mcp` | @maia, @sisyphus |
| **browser-use** | Autonomous web browsing | `uv run server.py` | @maia, @researcher, @giuzu, @vision |

---

## 2. 🛠️ Script Registry (`.opencode/scripts/`)

| Script | Purpose | Called By | Status |
| ------ | ------- | --------- | ------ |
| `health_check.py` | Test all agent endpoints | WAKEUP.sh | ✅ Active |
| `semantic_search.py` | Vector search over knowledge base (59 docs) | @researcher | ⚠️ Underused |
| `giuzu_evolve.py` | **Identity Daemon**. Watches `journal.md` to update `identity.md`. | Manual/Cron | ⚠️ Valid but dormant |
| `swarm_intel.py` | **Collective Brain**. Logs insights to `data/swarm_intelligence.json`. | Manual | ⚠️ Valid but dormant |
| `token_monitor.py` | Token usage tracking per agent | N/A | ⚠️ Underused |
| `validate_config.py` | Schema validation for opencode.json | Pre-commit | ✅ Active |
| `distill_layer0.sh` | Extract intelligence to backup layer | Manual | ✅ Active |
| `fasttrack.sh` | Smart routing for simple tasks | N/A | ⚠️ Underused |
| `architecture_linter.js` | Verify ARCHITECTURE.md coverage | CI | ✅ Active |
| `auto-handoff.js` | Track agent handoffs | npm track:handoffs | ✅ Active |
| `pre-commit` | Block broken commits | Git hook | ✅ Active |
| `create-project.sh` | Scaffold new projects | Manual | ✅ Active |
| `generate_fresh_layer0.sh` | Create clean layer0 seed | Manual | ✅ Active |
| `analyze_lexicon.py` | Analyze Giuzu vocabulary | Training | ⚠️ Underused |
| `process_whatsapp.py` | Parse WhatsApp exports for Giuzu | Training | ⚠️ Underused |
| `openrouter_proxy.js` | Proxy for OpenRouter requests | N/A | ⚠️ Orphaned? |
| `debug_config.py` | Debug configuration issues | Manual | ✅ Active |

---

## 3. 🧠 Skills Registry (`UNIVERSAL/skills/`)

**24 Skills Available** (symlinked from `.opencode/skills`)

| Skill | Purpose | Children |
| ----- | ------- | -------- |
| `canvas-design` | Generate visual designs (posters, art) | 83 |
| `docx` | Word document manipulation | 59 |
| `pptx` | PowerPoint generation | 56 |
| `webapp-testing` | Playwright-based web testing | 6 |
| `mcp-builder` | Create new MCP servers | 10 |
| `frontend-design` | UI/UX design patterns | 2 |
| `vibe-kanban` | Kanban integration skill | 1 |
| `xlsx` | Excel spreadsheet manipulation | 3 |
| `pdf` | PDF generation/parsing | 12 |
| `self-evolution` | Giuzu self-improvement | 1 |
| `skill-creator` | Meta-skill for creating new skills | 7 |
| + 13 more... | | |

---

## 4. 📋 Command Templates (`.opencode/commands/`)

| Command | File | Agent | Purpose |
| ------- | ---- | ----- | ------- |
| `/init` | init.md | @maia | WAKEUP protocol |
| `/plan` | plan.md | @maia | Strategic planning |
| `/ops` | ops.md | @ops | Infrastructure tasks |
| `/research` | research.md | @researcher | Deep research |
| `/audit` | audit.md | @reviewer | Code quality check |
| `/train-giuzu` | train-giuzu.md | @giuzu | Training ingestion |
| `/layer0` | layer0.md | @maia | Layer extraction |
| `/supercharge` | supercharge.md | @maia | Meta-optimization |

---

## 5. 🔄 Workflow Templates (`.opencode/workflows/`)

| Dir | Purpose |
| --- | ------- |
| `n8n/` | n8n workflow exports |
| `flowise/` | Flowise agent flows |
| `agentic/` | Multi-agent patterns |
| `trigger/` | Automation triggers |
| `giuzu-consultant-workflow.md` | Giuzu consultation flow |

---

## 6. 🔧 Custom Tools (`.opencode/tools/`)

| Tool | File | Purpose |
| ---- | ---- | ------- |
| Discord Integration | `discord.ts` | Send/receive Discord messages |

---

## 7. 🛡️ Utilities (`.opencode/utils/`)

| Utility | File | Purpose |
| ------- | ---- | ------- |
| Timeout Guard | `timeoutGuard.ts` | Prevent infinite waits |

---

## Cross-References

- **Tool Authorization**: See [TOOLS.md](file:///.opencode/TOOLS.md)
- **Agent Registry**: See [droid-registry.md](file:///.opencode/context/droid-registry.md)
- **Architecture**: See [ARCHITECTURE.md](file:///.opencode/context/ARCHITECTURE.md)
- **Status**: See [STATUS.md](file:///STATUS.md)

---

**Note**: This is a LIVING DOCUMENT. Update when adding new tools, MCPs, or skills.
