# Working Versions Snapshots

This file tracks tested configurations that are known to work.

---

## Snapshot: 2026-01-29 15:13 - "DUAL-ORCHESTRATION VERIFIED"

**Status**: ✅ VERIFIED - All 20 agents configured and synced.

### Architecture

```
USER
  └─ @maia (Supreme Orchestrator - GLM-4.7)
       │
       ├─ @sisyphus (PM - GLM-4.7, commands his own team)
       │    ├─ @prometheus (Planner - Gemini Flash)
       │    ├─ @oracle (Architect/Debugger - GLM-4.7)
       │    ├─ @explore (Fast Scanner - Gemini Flash)
       │    ├─ @librarian (Docs Research - Gemini Flash)
       │    ├─ @frontend (UI/UX - Gemini Flash)
       │    └─ @sisyphus_junior (Code Executor - GLM-4.7)
       │
       ├─ @giuzu (Strategic Advisor - DeepSeek R1)
       ├─ @researcher / @researcher_fast (Intel)
       ├─ @coder (LSP Architect - shared, GLM-4.7)
       ├─ @ops (Infra - shared, GLM-4.7)
       ├─ @reviewer (Quality Gate - shared, Big Pickle)
       ├─ @github (GitHub Expert - GLM-4.7)
       └─ @maia_premium (Supreme Arbiter - Gemini Pro)
```

### Model Distribution

| Model | Count | Agents |
|-------|-------|--------|
| GLM-4.7 | 7 | maia, sisyphus, coder, ops, oracle, sisyphus_junior, github |
| Gemini 2.5 Flash | 7 | researcher_fast, opencode, starter, librarian, prometheus, explore, frontend |
| Gemini 2.5 Pro | 2 | researcher, maia_premium |
| Gemini 2.0 Flash | 1 | vision |
| Big Pickle | 1 | reviewer |
| DeepSeek R1 | 1 | giuzu |
| Qwen Coder | 1 | workflow |

### Files Synced

- ✅ `opencode.json` - 20 agents
- ✅ `.opencode/agents/*.md` - All 20 have MD files
- ✅ `~/.config/opencode/opencode.json` - Global synced
- ✅ `.opencode/oh-my-opencode.json` - Plugin override active
- ✅ Git - Clean, pushed to origin/main

### Health Check Results

- ✅ OK: 16 agents (reliable providers)
- ⏳ Slow: 2 agents (Gemini Pro models)
- ⚠️ Risky: 2 agents (OpenRouter free tier)

---

## Previous Snapshots

### 2026-01-29 13:46 - "Verified Orchestration"
- Fixed MAIA override from Big Pickle to GLM-4.7
- 14 agents configured

### 2026-01-29 13:36 - "Almost Working"
- Initial tested config before hierarchy changes

---

## Restore Commands

```bash
# Restore from git
git checkout db27985 -- opencode.json

# Re-sync global
cp opencode.json ~/.config/opencode/opencode.json

# Validate
python3 .opencode/scripts/validate_config.py
python3 .opencode/scripts/fast_test.py
```
