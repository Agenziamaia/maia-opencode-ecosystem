# 🎯 MAIA ECOSYSTEM - LIVING STATUS

**Last Updated:** 2026-01-29 16:37
**System State:** 🟢 FULLY OPERATIONAL

---

## 📊 Current Configuration

### Agents: 20 Total
- **Strategy & PM**: maia, sisyphus, giuzu, prometheus
- **Execution**: coder, ops, frontend, workflow, sisyphus_junior, github, oracle
- **Research**: researcher, researcher_deep, explore, librarian, vision
- **Governance**: reviewer, maia_premium, opencode, starter

### Infrastructure
- ✅ Vibe Kanban: Port 62601
- ✅ Git: Both repos synced
- ✅ MCP: filesystem, git, vibekanban
- ✅ Success Vault: 4 patterns
- ✅ Pre-commit hook: Active
- ✅ Schema validation: Enabled
- ✅ Architecture linter: Enabled
- ✅ Semantic search: 59 documents indexed
- ✅ Token monitor: Ready
- ✅ Giuzu self-evolution: Ready
- ✅ Review protocol: Machine-readable
- ✅ Layer-0 CI/CD: Configured

---

## 🔧 Recent Fixes (Latest First)

### 2026-01-29: V3 Deep Sync & Health Optimization (FINAL CERTIFICATION)
- **Problem:** Stale V2 references, misleading "Risky" flags for passing models.
- **Fix:** Purged legacy technical debt (811 lines). Overhauled Registry for 20 agents. Optimized `health_check.py` to remove false positives. Sync'ed all dashboards.
- **Status:** 💎 CERTIFIED - V3 LIVE
**Problem Identified:**
- OpenCode SDK default: 300,000ms (5 minutes) timeout
- Discord plugin: NO timeout on fetch calls
- opencode.json: NO timeout configuration
- Result: Agents stuck loading/waiting indefinitely

**Root Cause Analysis (MAX EFFORT SEARCH):**
- Provider requests default to 5-min wait before failure
- No explicit timeout config in main opencode.json
- Discord plugin missing AbortController on all fetch calls
- Agent preferences had 10s fallback but wasn't used for main ops

**Fixes Implemented:**
- `opencode.json` - Added comprehensive timeout section:
  - Provider timeouts (ZAI: 60s, Google: 30s, OpenRouter: 45s)
  - Agent timeouts (health: 30s, code: 3m, research: 2m)
  - Network timeouts (fetch: 8s, Discord: 5s, webfetch: 10s)
  - Fallback retry config (3 retries, 2x backoff)
- `.opencode/tools/discord.ts` - Added AbortController with 5s timeout to all 3 tools
- `.opencode/utils/timeoutGuard.ts` - Created timeout guard utilities:
  - `withTimeout()` - Promise.race-based timeout protection
  - `withAbortSignal()` - AbortController wrapper for cancellable ops
  - `withRetry()` - Exponential backoff with ±25% jitter
  - `TIMEOUT_PRESETS` - Constants for all operation types
  - `getTimeout()` - Safe timeout getter with fallback

**Timeout Values Based On:**
- Industry best practices (MDN, AWS Well-Architected)
- Production codebases (Overleaf, Infisical, n8n, Langsmith SDK)
- User expectation studies (8s for simple requests)
- Agent framework patterns (LangChain, LangGraph recursion limits)

**Status:** ✅ DEPLOYED - NO MORE INFINITE LOADING

### 2026-01-27: Full Infrastructure Deployment
**Added:**  
- `architecture_linter.js` – Node script verifying ARCHITECTURE.md coverage  
- `giuzu_evolve.py` – Self-evolution daemon for Giuzu's digital soul  
- `review_protocol.json` – Machine-readable escalation rules  
- `token_monitor.py` – Token budget tracking per agent tier  
- `semantic_search.py` – Knowledge base search (59 docs indexed)  
- `layer0-sync.yml` – CI/CD for auto-creating Layer-0 seed artifacts  
- `ARCHITECTURE.md` – Complete rewrite with all directories  
**Status:** ✅ Deployed

### 2026-01-27: Enforcement Infrastructure
**Added:**  
- `opencode.schema.json` – JSON schema for config validation  
- `validate_config.py` – Python validator script  
- `fasttrack.sh` – Smart routing helper for simple tasks  
- `pre-commit` hook – Blocks broken commits and orphan files  
- `TOOLS.md` – Central tool registry for all agents  
- CI workflow updated with schema validation step  
**Status:** ✅ Deployed

### 2026-01-26: Configuration Cleanup
**Problem:** Config revert loop, wrong models, documentation drift  
**Fix:** Unified all configs, removed 8 obsolete scripts, corrected banner  
**Status:** ✅ Resolved


---

## 📝 Quick Commands

```bash
# Start system
bash WAKEUP.sh

# Verify agents
cat opencode.json | python3 -c 'import sys,json; print(f"{len(json.load(sys.stdin)[\"agent\"])} agents")'

# Test agent
opencode run "@agent_name test prompt"
```

---

## 📚 Documentation Index

- **Setup:** README.md
- **Agents:** AGENTS.md (agent roster)
- **Models:** MODELS.md (model assignments)
- **Archive:** .archive/old-reports/ (historical)

---

## 🧠 Historical Knowledge (From Archived Reports)

### Model Lessons Learned
- **`:free` suffix causes 404s** - Always use clean model IDs
- **GLM-4.7 proven reliable** - Core agents work perfectly with it
- **Gemini Flash > Pro for speed** - Use researcher_fast as default, Pro for deep dives
- **DeepSeek R1** - Best for reasoning/strategic tasks (Giuzu)

### Architecture Patterns
- **Prompt-level fallback** works better than plugins/hooks for research agents
- **Vibe Kanban on port 62601** - Standardized across all workspaces
- **strategy_sync.py** is the single source of truth for config sync

### Archived Reports (`.archive/old-reports/`)
- BUILD_REPORT.md - Initial ecosystem build (Jan 2026)
- ECOSYSTEM_SYNC_REPORT.md - Model tier system
- MULTIAGENT_POC_REPORT.md - 78% agent success rate analysis
- OPENROUTER_FIX_REPORT.md - Model ID format fixes
- RESEARCHER_FIX_SUMMARY.md - Read-only perms + fallback setup

---

**Note:** This is a LIVING DOCUMENT - update in place, don't create new files.
