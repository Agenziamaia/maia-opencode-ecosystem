---
description: Session initialization command that bootstraps the MAIA environment
agent: maia
---

# /init - Bootstrap the MAIA Environment

Execute full environment initialization before any work begins.

## Automatic Steps (Executed by MAIA)

### 1. Environment Bootstrap
```bash
# Run auto-init script
bash .opencode/scripts/auto-init.sh
```

### 2. Vibe Kanban Verification
- Confirm HTTP 200 on http://localhost:62601
- If failed, report error and continue in degraded mode

### 3. Agent Health Check
Ping each agent with 30-second timeout:
- @coder (GLM-4.7)
- @ops (GLM-4.7)
- @researcher (Gemini Pro)
- @researcher_fast (Gemini Flash)
- @reviewer (GLM-4.7)
- @vision (Gemini Flash)
- @workflow (Qwen)
- @giuzu (Qwen)

### 4. Status Report
Generate report showing:
- Which agents are ONLINE/OFFLINE
- Fallback assignments for offline agents
- Vibe Kanban board URL
- Ready state

## Example Output

```
🚀 MAIA ECOSYSTEM INITIALIZED

┌─────────────────────────────────────────┐
│ AGENT STATUS                            │
├─────────────────────────────────────────┤
│ ✅ @maia        GLM-4.7       ONLINE    │
│ ✅ @coder       GLM-4.7       ONLINE    │
│ ✅ @ops         GLM-4.7       ONLINE    │
│ ✅ @researcher  Gemini-Pro    ONLINE    │
│ ✅ @reviewer    GLM-4.7       ONLINE    │
│ ⚠️ @workflow    Qwen-32B      TIMEOUT   │
│    └─ Fallback: @coder                  │
│ ✅ @vision      Gemini-Flash  ONLINE    │
├─────────────────────────────────────────┤
│ 📋 Vibe Kanban: http://localhost:62601  │
│ 🔑 API Keys: Loaded                     │
├─────────────────────────────────────────┤
│ ✅ READY FOR COMMANDS                   │
└─────────────────────────────────────────┘
```

## Notes
- This command is idempotent (safe to run multiple times)
- Vibe Kanban will not restart if already healthy
- Degraded mode continues without Kanban if startup fails
