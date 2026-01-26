# 🧠 MAIA Ecosystem Knowledge Base

**Last Updated**: 2026-01-24
**Maintainers**: MAIA, Sisyphus, Human Operator

---

## 1. Core Architecture

### Agent Roster

| Agent | Model | Role | Fallback |
| :--- | :--- | :--- | :--- |
| **@maia** | `zai-coding-plan/glm-4.7` | Orchestrator, Strategic Planning | N/A (Primary) |
| **@coder** | `zai-coding-plan/glm-4.7` | Code Synthesis, Architecture | @maia, @ops |
| **@ops** | `zai-coding-plan/glm-4.7` | DevOps, Infrastructure, Docker | @coder, @maia |
| **@reviewer** | `zai-coding-plan/glm-4.7` | Code Audit, Quality Gates | @maia, @coder |
| **@researcher** | `google/gemini-2.5-pro` | Deep Research, Documentation | @researcher_fast, @maia |
| **@researcher_fast** | `google/gemini-2.5-flash` | Fast Research, High Availability | @maia |
| **@vision** | `google/gemini-2.5-flash` | Image Analysis, Multimodal | @researcher_fast, @maia |
| **@workflow** | `qwen/qwen-2.5-coder-32b-instruct` | n8n, Flowise, Automation | @coder, @maia |
| **@giuzu** | `qwen/qwen-2.5-coder-32b-instruct` | Digital Clone, Pattern Learning | @coder, @maia |
| **@opencode** | `google/gemini-2.5-flash` | OpenCode Config, Meta-Management | @maia |
| **@starter** | `google/gemini-2.5-flash` | Workspace Onboarding | @maia |
| **@maia_premium** | `zai-coding-plan/glm-4.7` | Complex Challenges (Escalation) | @maia |

### Plugin Stack

| Plugin | Purpose | Status |
| :--- | :--- | :--- |
| `opencode-sessions` | Agent-to-agent communication (message/fork/new modes) | ✅ Active |
| `oh-my-opencode` | Multi-agent transformation, aliases, MCP integration | ✅ Active |

### MCP Servers

| Server | Purpose | Port/Config |
| :--- | :--- | :--- |
| `vibe-kanban` | Visual Kanban board for task orchestration | `localhost:62601` |
| `filesystem` | File system operations | Local |
| `git` | Version control operations | Local |
| `openskills` | Skill loading and management | Local |

---

## 2. Initialization Protocol

### Automatic Startup (Called by MAIA/Sisyphus)

When `/init` is executed or a new session starts:

1. **Environment Loading**
   - Source `.env` file for API keys
   - Verify `OPENROUTER_API_KEY`, `ZAI_API_KEY`, `GOOGLE_API_KEY`

2. **Vibe Kanban Bootstrap**
   - Check if already running on port 62601
   - If not, start with `PORT=62601 HOST=127.0.0.1 npx vibe-kanban &`
   - Verify HTTP 200 response

3. **Agent Health Checks**
   - Ping each agent with 30-second timeout
   - Assign fallbacks for offline agents
   - Report status to user

4. **Ready State**
   - Display agent status table
   - Show Vibe Kanban URL
   - Confirm ready for commands

### Script Location
```
.opencode/scripts/auto-init.sh
```

---

## 3. Resilient Orchestration Protocol

### Health Checks (Before Every Delegation)

```javascript
// Always verify agent is alive before delegating
const status = await healthCheck("@coder", 30000); // 30s timeout
if (status !== "OK") {
  // Switch to fallback
  const fallback = FALLBACKS["@coder"][0]; // @maia
  await delegateWithTimeout(fallback, task, timeout);
}
```

### Timeout Policy

| Task Type | Timeout | Fallback Action |
| :--- | :--- | :--- |
| Health check | 30 seconds | Switch to fallback |
| Research | 2 minutes | Use @researcher_fast |
| Coding | 5 minutes | Use @maia |
| Review | 3 minutes | Use @maia |
| Quick query | 1 minute | Handle directly |

### Error Recovery

1. Log the failure: `❌ @{agent} timed out`
2. Notify user: `⚠️ Switching to fallback...`
3. Try fallback agent
4. If all fail: Ask user for guidance

---

## 4. Vibe Kanban Integration

### Task Workflow

```
TO DO → IN PROGRESS → IN REVIEW → DONE
```

### Key Tools

| Tool | Purpose |
| :--- | :--- |
| `vibe_kanban_create_task` | Create task from user intent |
| `vibe_kanban_list_tasks` | Check existing work |
| `vibe_kanban_update_task` | Move between columns |
| `vibe_kanban_get_task` | Get context for handoff |

### Operating Modes

1. **Tracker-Only (Default)**: MAIA agents execute, Kanban reflects status
2. **Vibe-Executor (Opt-in)**: Vibe Kanban manages execution (requires user confirmation)

---

## 5. Session Modes (opencode-sessions)

| Mode | Syntax | Use Case |
| :--- | :--- | :--- |
| **message** | `session({ mode: "message", agent: "coder", text: "..." })` | Pass context sequentially |
| **fork** | `session({ mode: "fork", agent: "coder", text: "..." })` | Explore alternatives |
| **new** | `session({ mode: "new", agent: "coder" })` | Clean slate |

---

## 6. GitHub Repositories

| Repo | Purpose | URL |
| :--- | :--- | :--- |
| `maia-opencode-ecosystem` | Main MAIA workspace, agents, skills | https://github.com/Agenziamaia/maia-opencode-ecosystem |
| `multiagent-layer0` | Multi-agent orchestration, Vibe Kanban integration | https://github.com/Agenziamaia/multiagent-layer0 |

---

## 7. File Structure Reference

```
.opencode/
├── agents/           # Agent profiles (maia.md, coder.md, etc.)
├── commands/         # Custom commands (/init, /plan, /audit)
├── scripts/          # Automation scripts (auto-init.sh)
├── context/          # Project context files
├── workflows/        # Workflow definitions
├── skills/           # Domain expertise
└── tools/            # Custom tool implementations

opencode.json         # Main configuration (agents, models, MCP, tools)
.env                  # API keys (DO NOT COMMIT)
```

---

## 8. API Key Management

### Storage Locations

1. **Project `.env`** (preferred): `/path/to/project/.env`
2. **Global auth**: `~/.local/share/opencode/auth.json`
3. **Global config**: `~/.config/opencode/.env`

### Required Keys

| Key | Provider | Used By |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | OpenRouter | @researcher, @workflow, @giuzu, @vision |
| `ZAI_API_KEY` | Z.AI | @maia, @coder, @ops, @reviewer |
| `OPENAI_API_KEY` | OpenAI | @maia_premium |
| `GOOGLE_API_KEY` | Google | Gemini agents |

---

## 9. Troubleshooting

### Agent Not Responding

1. Check model availability: `curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/models`
2. Verify API key is loaded: `echo $OPENROUTER_API_KEY`
3. Try fallback agent

### Vibe Kanban Not Starting

1. Kill zombie processes: `pkill -f vibe-kanban`
2. Check port availability: `lsof -i :62601`
3. Restart: `PORT=62601 HOST=127.0.0.1 npx vibe-kanban &`

### Model Errors (404/401)

1. Remove `:free` suffix from model IDs
2. Verify model exists on OpenRouter
3. Check API key credits

---

## 10. Quick Commands

| Command | Description |
| :--- | :--- |
| `/init` | Bootstrap environment, check agents |
| `/plan <task>` | Create strategic multi-agent plan |
| `/audit` | Run code quality checks |
| `/research <topic>` | Deep research with synthesis |
| `/workflow <task>` | Create automation workflow |
| `/clone <task>` | Consult Giuzu digital clone |

---

*This knowledge base is the single source of truth for the MAIA ecosystem.*
