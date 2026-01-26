# 🔧 MAIA ECOSYSTEM - TOOL REGISTRY

> **Single Source of Truth** for all tools available to agents.  
> Last synchronized with `opencode.json`: 2026-01-27

---

## Core Tools

| Tool | Description | Authorized Agents |
|------|-------------|-------------------|
| `read` | Read file contents | ALL |
| `write` | Create/overwrite files | maia, sisyphus, coder, ops, giuzu, workflow, opencode, starter, librarian, maia_premium |
| `edit` | Patch existing files | coder, ops |
| `patch` | Apply diff patches | coder |
| `bash` | Execute shell commands | maia, coder, ops, workflow, opencode, starter |
| `grep` | Search file contents | maia, sisyphus, researcher, reviewer |
| `glob` | Find files by pattern | maia, researcher, librarian |
| `skill` | Invoke skill modules | ALL except vision |

---

## MCP Tools (External Services)

| Tool Pattern | Source MCP | Authorized Agents |
|--------------|------------|-------------------|
| `filesystem_*` | filesystem | coder |
| `git_*` | git | coder |
| `vibekanban_*` | vibekanban | maia, sisyphus |

---

## Specialized Tools

| Tool | Description | Authorized Agents |
|------|-------------|-------------------|
| `session` | Multi-agent session management | maia, sisyphus, giuzu, vision, maia_premium |
| `webfetch` | Fetch web content | ops, researcher, researcher_fast, opencode, vision |
| `lsp` | Language Server Protocol queries | coder, reviewer |
| `todoread` | Read kanban tasks | sisyphus |
| `todowrite` | Update kanban tasks | sisyphus |

---

## Tool Authorization Matrix

```
                read write edit patch bash grep glob skill session web lsp todo
maia              ✓    ✓    -    -     ✓    ✓    ✓    ✓      ✓     -   -    -
sisyphus          ✓    ✓    -    -     -    ✓    -    ✓      ✓     -   -    ✓
coder             ✓    ✓    ✓    ✓     ✓    -    -    ✓      -     -   ✓    -
ops               ✓    ✓    ✓    -     ✓    -    -    ✓      -     ✓   -    -
researcher        ✓    -    -    -     -    ✓    ✓    ✓      -     ✓   -    -
researcher_fast   ✓    -    -    -     -    -    -    ✓      -     ✓   -    -
giuzu             ✓    ✓    -    -     -    -    -    ✓      ✓     -   -    -
vision            ✓    -    -    -     -    -    -    -      ✓     ✓   -    -
reviewer          ✓    -    -    -     -    ✓    -    ✓      -     -   ✓    -
workflow          ✓    ✓    -    -     ✓    -    -    ✓      -     -   -    -
opencode          ✓    ✓    -    -     ✓    -    -    ✓      -     ✓   -    -
starter           ✓    ✓    -    -     ✓    -    -    ✓      -     -   -    -
librarian         ✓    ✓    -    -     -    -    ✓    ✓      -     -   -    -
maia_premium      ✓    ✓    -    -     -    -    -    -      ✓     -   -    -
```

---

## Adding New Tools

1. Define the tool in `opencode.json` under the agent's `tools` object
2. Update this registry with the tool name and authorized agents
3. Run `python .opencode/scripts/validate_config.py` to verify
4. Update any agent `.md` files that reference the tool

---

**Note:** This is a LIVING DOCUMENT - update in place when tools change.
