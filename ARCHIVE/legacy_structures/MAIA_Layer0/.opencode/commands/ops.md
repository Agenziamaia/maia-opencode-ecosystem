---
description: Infrastructure tasks (Docker, Coolify, n8n)
agent: ops
---

# /ops Command

Triggers the **ops** agent for infrastructure tasks.
Use this for: Docker, Coolify, n8n, environment variables, and deployments.

## Prompt Template
```
Task: "$ARGUMENTS"

1. Analyze if this requires Docker, Coolify, or n8n interaction.
2. Plan the safest execution path.
3. If modifying prod, verify backups/state first.
4. Execute and return output.
```
