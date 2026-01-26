---
description: Deep dive research or context retrieval
agent: researcher
---

# /research Command

Triggers the **researcher** agent.
Use this for: Analyzing large files, finding patterns, or synthesizing context.

## Prompt Template
```
Objective: "$ARGUMENTS"

1. Search the codebase and Documentation for relevant context.
2. Read aggressively (large context window is active).
3. Synthesize findings into a concise report for @maia.
```
