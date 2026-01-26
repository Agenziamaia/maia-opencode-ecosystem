# 🎯 MAIA ECOSYSTEM - LIVING STATUS

**Last Updated:** 2026-01-26  
**System State:** 🟢 FULLY OPERATIONAL

---

## 📊 Current Configuration

### Agents: 14 Total
- **Core (GLM-4.7):** maia, sisyphus, coder, ops, reviewer
- **Research (Gemini Pro):** researcher, maia_premium  
- **Fast Intel (Gemini Flash):** researcher_fast, opencode, starter, librarian
- **Vision (Gemini 2.0 Flash):** vision
- **Reasoning (DeepSeek R1):** giuzu
- **Automation (Qwen):** workflow

### Infrastructure
- ✅ Vibe Kanban: Port 62601
- ✅ Git: Both repos synced
- ✅ MCP: filesystem, git, vibekanban
- ✅ Success Vault: 4 patterns

---

## 🔧 Recent Fixes (Latest First)

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
