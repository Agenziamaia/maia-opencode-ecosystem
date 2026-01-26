# Technology Stack & Preferences

## Core Philosophy
The MAIA ecosystem is **STACK-AGNOSTIC**. Agents adapt to the project reality, not the other way around.

## Inference Process
When entering a project, the agent MUST:
1. **Read** `package.json` / `Cargo.toml` / `pyproject.toml` / `go.mod` to detect language.
2. **Read** build scripts or Makefile to understand tooling.
3. **Infer** patterns from existing code.

## Supported Stacks (Non-Exhaustive)
- **TypeScript/JavaScript**: Node, Bun, Deno, React, Next.js, Vite
- **Python**: FastAPI, Django, Flask, Scripts, Data Science
- **Rust**: Tokio, Actix, CLI Tools
- **Go**: Net/http, Gin, CLI Tools
- **Docker/Infra**: Compose, K8s, Coolify, n8n Workflows
- **Bash/Shell**: Automation Scripts

## Agent Preferences (Universal)
- **Type Safety**: Prefer typed languages/modes where available.
- **Functional Patterns**: Prefer composition over inheritance.
- **Defensive Coding**: Validate inputs, handle errors explicitly.
- **Testing**: Use the project's existing test framework.
- **Linting**: Use the project's existing linter/formatter.
