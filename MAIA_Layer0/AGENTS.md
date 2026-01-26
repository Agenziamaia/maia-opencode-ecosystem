# Agent Instructions: GOD MODE ACTIVATED

**Role**: You are operating in the **MAIA Droids God-Tier Ecosystem**.
**Manifesto**: We do not just build. We architect reality. We use "Open Skills" to absorb any capability instantly.
**CRITICAL**: This system is **STACK-AGNOSTIC**. Adapt to the project reality.

---

## ⚡ The God-Tier Workflow

### 1. Planning Phase (`/plan` -> `@maia`)
-   **Trigger**: User runs `/plan "New Initiative..."`
-   **Agent**: `@maia` (Orchestrator, GPT-5.2)
-   **Action**: Analyzes project structure and delegates tasks.
-   **Output**: A strategic directive assigning work to `@coder`, `@ops`, `@researcher`.

### 2. Execution Phase
-   **Coding**: `@maia` invokes `@coder` (GLM-4.7) for bug-free logic.
-   **Infrastructure**: `@maia` invokes `@ops` (GLM-4.7) for infra/n8n.
-   **Research**: `@maia` invokes `@researcher` (Gemini) for crystal-clear insight.

### 3. Verification Phase (`/audit` -> `@reviewer`)
-   **Trigger**: Task complete.
-   **Agent**: `@reviewer` (Gatekeeper, GLM-4.7)
-   **Action**: Strict quality gate. NO MERCY.

### 4. Evolution Phase (`/supercharge` -> `@maia`)
-   **Trigger**: Periodic checkup.
-   **Action**: `@maia` analyzes the ecosystem for meta-improvements.

### 5. Initialization Phase (`/init` -> `@maia`)
-   **Trigger**: New Session.
-   **Action**: Bootstrap reality. Check droids, files, and skills.

---

## Stack Detection Protocol (MANDATORY)

Before ANY action, an agent MUST:
1. **Check for manifest**: `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `Makefile`.
2. **Infer language**: Read the manifest to determine the primary language.
3. **Infer tooling**: Read scripts/configs to determine build/test/lint commands.
4. **Adapt**: Use the project's commands, not hardcoded defaults.

---

## Universal Build/Test/Lint Commands

**DO NOT ASSUME**. Read the project's scripts first.

**Examples by Language**:
| Language | Build | Test | Lint |
|:---------|:------|:-----|:-----|
| TypeScript (Node) | `npm run build` | `npm test` | `npm run lint` |
| Python | `pip install -e .` | `pytest` | `ruff check .` |
| Rust | `cargo build` | `cargo test` | `cargo clippy` |
| Go | `go build ./...` | `go test ./...` | `golangci-lint run` |
| Docker-only | `docker build .` | N/A | `hadolint Dockerfile` |

---

## Code Style Guidelines (Universal)

### Imports and Exports
- Group imports by: external -> internal -> relative.
- Separate groups with blank lines.

### Formatting
- Use the project's existing formatter (Prettier, Black, rustfmt, gofmt).
- If none exists, propose one rather than doing ad-hoc formatting.

### Type Safety
- Prefer typed modes (`strict: true`, `--strict`, typed hints).
- Avoid `any` / dynamic types. Use `unknown` if type is truly unknown.

### Naming Conventions
- Adapt to the project's existing conventions.
- If none exist, follow language idioms (snake_case for Python, camelCase for JS/TS, PascalCase for Go).

### Error Handling
- Always handle errors explicitly.
- Log errors with context.
- Never expose stack traces to end users.

---

## Multi-Agent Collaboration

### Agent Identification
Always identify yourself at the start of responses and in code comments.
Format: `<!-- {MODEL_NAME}-{SESSION_ID}: Context -->` or `// {MODEL_NAME}: Context`.

### Handoff Procedures
1. Document current state.
2. List completed tasks with file/line references.
3. Identify blockers clearly.
4. Tag the next agent: `<!-- @coder: Continue from here -->`.

### Conflict Resolution
1. Never silently overwrite another agent's work.
2. Document conflicts.
3. Request human input if unclear.

---

## Best Practices

- **Adapt**: Read the project before assuming anything.
- **Test**: Run the project's test suite, not a generic one.
- **Lint**: Run the project's linter, not a generic one.
- **Document**: Explain non-obvious design decisions.
- **Ask**: If requirements are unclear, ask for clarification.
