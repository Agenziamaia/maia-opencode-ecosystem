# CLAUDE INTEGRATION FOR MAIA

## How to Invoke Claude
From MAIA terminal, use:

```
/invoke claude --context="full" --channel="main"
```

## Quick Commands
```
/claude status              # Check what Claude is working on
/claude continue            # Continue last session
/claude delegate <task>    # Delegate to Claude with context
```

## Context Preservation
- Claude uses `.claude/session-state.md` for continuity
- Specialist agents log to `.claude/channels/`
- Universal .gitignore prevents context bloat

## When to Use Claude vs Others
- **Claude (main):** Orchestration, architecture, complex decisions
- **Antigravity:** Implementation, execution, git operations
- **Giuzu:** Strategy, user-facing decisions, "what to build"
- **Verification:** Quick checks, validation, testing