# MAIA Droids - Multi-Agent Layer 0

**Generated:** 2026-01-24
**Stack:** TypeScript, React, Vite, Vitest, Vibe Kanban

---

## OVERVIEW

God-Tier agent orchestration with modular skills system.

---

## STRUCTURE

```
multiagent-layer0/
├── .opencode/
│   ├── maia-layer0/          # Core Layer 0 (see .opencode/maia-layer0/AGENTS.md)
│   ├── skills/               # 22 modular skills (SKILL.md each)
│   ├── scripts/              # Build/init
│   ├── agents/               # Agent configs
│   └── tools/               # Tool configs
├── opencode.json             # Agents, MCP, commands
├── package.json              # Root deps
└── VIBE_KANBAN_PROTOCOL.md  # Kanban startup
```

---

## WHERE TO LOOK

| Task              | Location                        |
| ----------------- | ------------------------------- |
| Agent definitions | opencode.json                   |
| Layer 0           | .opencode/maia-layer0/AGENTS.md |
| Skills            | .opencode/skills/\*/SKILL.md    |
| Vibe Kanban       | VIBE_KANBAN_PROTOCOL.md         |

---

## CONVENTIONS

- **Vibe Kanban First**: Work → Tasks → Agents → Done (tracker mode default)
- **Message Mode**: `session({mode: "message"})` for sequential handoffs
- **Skills Registry**: Flat, 22 independent skills
- **TypeScript**: Strict mode, no `any`
- **Import Groups**: External → Internal → Relative
- **LSP-First**: @coder and @reviewer use LSP for semantic code analysis
- **Authority Split**: @opencode handles meta-level tool audits; @ops handles infrastructure-level deployment safety

---

## ANTI-PATTERNS

❌ **Mocking**: Never fake code you're testing
❌ **TODOs**: Implement real code on first pass
❌ **LARP**: Code that looks functional but isn't proven
❌ **Silent Swallow**: Try-catch without logging

---

## AGENT ECOSYSTEM

| Agent            | Model              | Role                               |
| ---------------- | ------------------ | ---------------------------------- |
| @maia            | GLM-4.7            | Orchestrator                       |
| @sisyphus        | GLM-4.7            | Project Manager                    |
| @coder           | GLM-4.7            | Code Architect (LSP)               |
| @ops             | GLM-4.7            | Infrastructure (bash, Docker, n8n) |
| @researcher      | Gemini 2.5 Pro     | Oracle (Context7)                  |
| @researcher_fast | Gemini 2.5 Flash   | Flash Oracle                       |
| @reviewer        | Big-Pickle         | Gatekeeper (LARP check)            |
| @giuzu           | Big-Pickle         | Digital Clone                      |
| @opencode        | Gemini 2.5 Flash   | Meta Specialist                    |
| @workflow        | Qwen 2.5 Coder 32B | Automation (n8n, Flowise)          |

**Note**: Additional specialized agents (@vision, @starter, @maia_premium) are documented but not currently registered in opencode.json.

**Fallback**: 2-3 models, 3 retries each.

---

## COMMANDS

```bash
# Dev
npm run dev              # Vite dev
npm run build            # tsc + vite build
npm run test             # Vitest
npm run test:watch       # Vitest watch
npm run lint            # ESLint
npm run lint:fix        # ESLint fix
npm run typecheck       # tsc --noEmit
npm run check           # lint + typecheck

# OpenCode
npm run plan             # @maia: Strategic plan
npm run ops              # @ops: Infra
npm run research         # @researcher: Deep research
npm run research-fast     # @researcher_fast: Quick research
npm run audit            # @reviewer: Code audit
npm run supercharge      # @maia: Meta-analysis
npm run init             # @maia: Bootstrap

# Vibe Kanban
npm run setup:vibe-kanban    # Configure MCP
npm run vibe:start           # Start server
```

---

## NOTES

**Vibe Kanban**: Project `f947a334-989d-408a-9e3c-03b73fe2f6e9`, HTTP `localhost:62601`

**Agent Retry**: 3 attempts/model, 10s timeout, report every 3 attempts.

**Skills**: 22 modular skills via OpenSkills MCP (`skill()`).

**Testing**: Integration-first, anti-mocking, real code only.

---

## SUB-AGENTS.md

- `.opencode/maia-layer0/AGENTS.md` - Core Layer 0
- `.opencode/skills/*/SKILL.md` - 22 skill docs

---

_Hierarchical AGENTS.md by /init-deep._
