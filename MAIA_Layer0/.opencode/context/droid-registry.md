# MAIA Droid Registry

| Droid | Role | Model | Ideal Tasks |
| :--- | :--- | :--- | :--- |
| **@MAIA** | Orchestrator | GPT-4o | Planning, Delegation, Marketing, Vision Keeper |
| **@Coder** | Architect | GLM-4 | Implementation, Refactoring, Logic, API Design |
| **@Ops** | Infrastructure | GLM-4 | Docker, Coolify, n8n, Deployments, Secrets |
| **@Researcher** | Analyst | Gemini 1.5 Pro | Large-scale reading, summarization, pattern matching |
| **@Reviewer** | QA | Claude 3.5 Sonnet | Strict code quality, security checks, linting |

## Delegation Rules
1.  **Start with @MAIA**: Always use `/plan` or talk to MAIA first for complex tasks.
2.  **Respect Expertise**: Don't ask `@Coder` to restart Docker containers; ask `@Ops`.
3.  **Review is Mandatory**: Before closing a task, `@Reviewer` must sign off (`/audit`).
