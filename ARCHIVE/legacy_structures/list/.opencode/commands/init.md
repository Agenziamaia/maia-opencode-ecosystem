---
description: Bootstrap the Reality. (System Initialization)
agent: maia
---

# /init Command

**PROTOCOL**: REALITY_BOOTSTRAP_01
Use this command to initialize the "Level 100" environment for a new session or project.

## Execution Template
```
Action: Initialize Reality

1.  **Verify Droids**: Confirm existence of `.opencode/agents/{maia,coder,ops,researcher}.md`.
2.  **Verify Structure**: Ensure `src/` and `package.json` exist. If not, trigger @coder to build them.
3.  **Verify Skills**: Check `.opencode/skills/` availability.
4.  **Report**: "REALITY INITIALIZED. READY FOR ARCHITECTURE."
```
