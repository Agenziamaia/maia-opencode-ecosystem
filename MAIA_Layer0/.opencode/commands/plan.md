---
description: Orchestrate a new task with MAIA
agent: maia
---

# /plan Command

Triggers **maia** (Orchestrator) to plan a complex initiative.

## Prompt Template
```
New Initiative: "$ARGUMENTS"

1.  **Analyze**: What are we building?
2.  **Delegation Strategy**: Check `droid-registry.md`.
    -   Need code? -> @coder
    -   Need infra? -> @ops
    -   Need info? -> @researcher
3.  **Plan**: Output a step-by-step checklist.
4.  **Action**: Explicitly call the first agent.
```
