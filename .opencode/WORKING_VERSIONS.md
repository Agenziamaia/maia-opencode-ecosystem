# Working Versions Snapshots

This file tracks tested configurations that are known to work.

---

## Snapshot: 2026-01-29 15:43 - "OPTIMIZED DREAM TEAM"

**Status**: ✅ VERIFIED - Model lineup optimized for niche capabilities.

### Team Architecture & Model Roster

| Agent | Role | Model | Why? |
|-------|------|-------|------|
| **@maia** | Supreme Orchestrator | **GLM-5** | Core reasoning, paid reliability |
| **@sisyphus** | Project Manager | **GLM-5** | Task decomposition, reliability |
| **@coder** | Architect/LSP | **GLM-5** | Precision coding |
| **@ops** | Infrastructure | **GLM-5** | Precision ops commands |
| **@reviewer** | Quality Gate | **Big Pickle** | Logic auditing |
| **@giuzu** | Strategic Advisor | **DeepSeek R1** | Deep reasoning & strategy |
| **@prometheus** | Planner | **DeepSeek R1** | Planning requires deep thinking |
| **@workflow** | Auto Architect | **GLM-5** | JSON precision for n8n/Flowise |
| **@frontend** | UI/UX Engineer | **GLM-5** | Complex React/Tailwind logic |
| **@oracle** | Debugger | **GLM-5** | Deep system analysis |
| **@sisyphus_junior** | Executor | **GLM-5** | Strict code execution |
| **@github** | GitHub Expert | **GLM-5** | Git operations |
| **@researcher** | Fast Intel | **Gemini Flash** | Speed & volume |
| **@researcher_deep** | Deep Intel | **Gemini Pro** | 2M context for deep analysis |
| **@maia_premium** | Supreme Arbiter | **Gemini Pro** | Complex decisions |
| **@vision** | Visual Analyst | **Gemini 2.0** | Native multimodal |
| **@explore** | Fast Scanner | **Gemini Flash** | Speed |
| **@librarian** | Context Curator | **Gemini Flash** | Speed |
| **@starter** | Bootstrapper | **Gemini Flash** | Speed |
| **@opencode** | Meta Manager | **Gemini Flash** | Speed |

### Summary
- **9x GLM-5** (Core & Coding)
- **7x Gemini Flash** (Fast Utility)
- **2x Gemini Pro** (Deep Context)
- **2x DeepSeek R1** (Strategic Reasoning)
- **1x Big Pickle** (Reviewer)
- **1x Gemini 2.0 Flash** (Vision)

### Health
- ✅ **16 OK** (paid/fast models)
- ⏳ **2 Slow** (Deep context models)
- ⚠️ **2 Risky** (Reasoning models - free tier, but functional)

---

## Restore Commands

```bash
# Restore from git
git checkout 86b71d8 -- opencode.json

# Re-sync global
cp opencode.json ~/.config/opencode/opencode.json

# Validate
python3 .opencode/scripts/validate_config.py
python3 .opencode/scripts/fast_test.py
```
