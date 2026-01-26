# Researcher Agent Configuration Guide

## Overview

The MAIA ecosystem uses two Researcher agent variants to provide robust, high-availability research capabilities:

- **`researcher`**: Primary agent using `google/gemini-2.5-pro` (high-quality, 1M context)
- **`researcher_fast`**: Fallback agent using `google/gemini-2.5-flash` (faster, higher availability)

## Single Source of Truth

**Configuration Hierarchy:**

1. **JSON config (`opencode.json`)** - Canonical configuration (authoritative)
2. **Markdown frontmatter (`.opencode/agents/*.md`)** - Mirrors JSON for documentation

Both must stay in sync. The JSON is the source of truth; markdown files should match JSON exactly.

## Agent Specifications

### Primary Researcher (`researcher`)

```json
{
  "model": "google/gemini-2.5-pro",
  "mode": "subagent",
  "tools": {
    "read": true,
    "grep": true,
    "glob": true,
    "list": true,
    "skill": true,
    "webfetch": true,
    "write": false,
    "edit": false,
    "bash": false,
    "question": true
  }
}
```

**Model**: `google/gemini-2.5-pro`

- **Context**: 1M tokens
- **Cost**: $1.25/M input, $10/M output
- **Capabilities**: High-quality reasoning, multimodal support
- **Use case**: Deep research requiring highest quality output

### Fast Researcher (`researcher_fast`)

```json
{
  "model": "google/gemini-2.5-flash",
  "mode": "subagent",
  "tools": {
    "read": true,
    "grep": true,
    "glob": true,
    "list": true,
    "skill": true,
    "webfetch": true,
    "write": false,
    "edit": false,
    "bash": false,
    "question": true
  }
}
```

**Model**: `google/gemini-2.5-flash`

- **Context**: 1M tokens
- **Cost**: $0.30/M input, $2.50/M output (~4x cheaper)
- **Capabilities**: Fast responses, high availability
- **Use case**: Quick research, fallback when Pro is overloaded

## Commands

### Standard Research

```bash
# Uses researcher (gemini-2.5-pro)
opencode run --command research "Analyze React performance patterns"

# Or explicitly
opencode run --agent researcher "Analyze React performance patterns"
```

### Fast Research (Fallback)

```bash
# Uses researcher_fast (gemini-2.5-flash)
opencode run --command research-fast "Quick API reference lookup"

# Or explicitly
opencode run --agent researcher_fast "Quick API reference lookup"
```

## Handling Provider Overload

If you encounter "model provider overload" errors with the primary researcher:

### Automatic Retry (Recommended)

Use the `research-fast` command which automatically uses the flash model:

```bash
opencode run --command research-fast "Your research query"
```

### Manual Switching

To temporarily switch the primary researcher to the fast model, edit `opencode.json`:

```json
{
  "agent": {
    "researcher": {
      "model": "google/gemini-2.5-flash" // Change from gemini-2.5-pro
      // ... rest of config
    }
  }
}
```

### Why This Approach?

1. **Model Stability**: Using explicit IDs (`google/gemini-2.5-pro`) instead of aliases (`*-latest`) prevents adapter confusion and model drift
2. **High Availability**: The Flash model has higher capacity and is less likely to experience overload
3. **Cost Efficiency**: Flash is ~4x cheaper while maintaining excellent quality for most research tasks
4. **Read-Only Safety**: Researcher agents are intentionally read-only (no write/edit) to prevent accidental modifications
5. **Webfetch Enabled**: Essential for external documentation and staying current

## Available Google Models

As of this configuration, the following Google models are available:

- `google/gemini-3-pro-preview` - Latest Pro model (experimental)
- `google/gemini-3-flash-preview` - Latest Flash model (experimental)
- `google/gemini-2.5-pro` - **Current primary researcher**
- `google/gemini-2.5-flash` - **Current fallback researcher**
- `google/gemini-2.5-flash-lite` - Ultra-fast, ultra-cheap option
- `google/gemini-flash-latest` - Alias to latest flash
- `google/gemini-1.5-pro` - Previous generation (deprecated for new configs)

To refresh the model list:

```bash
opencode models google --refresh --verbose
```

## Verification

Test that the researcher agents are working correctly:

```bash
# Test primary researcher
opencode run --agent researcher "Say hello and confirm you are the Researcher agent."

# Test fast researcher
opencode run --agent researcher_fast "Say hello and confirm you are the Researcher Fast agent."

# Verify no write permissions (should fail)
opencode run --agent researcher "Create a file named test.txt"
# Expected: Error about write permission denied
```

## Updating Model IDs

When changing the researcher model:

1. **Always** use provider-scoped IDs (`google/...`)
2. **Never** use unscoped IDs (`models/gemini-*`)
3. **Check availability** first: `opencode models google --refresh`
4. **Update both** JSON and markdown configs to maintain consistency
5. **Test immediately**: `opencode run --agent researcher "Hello"`

## Security Notes

- Researcher agents are **READ-ONLY** by design
- No `write` or `edit` permissions enabled
- No `bash` access - cannot execute commands
- Webfetch is enabled for external documentation
- This prevents accidental modifications while allowing full research capabilities

## Troubleshooting

### Error: "model provider overload"

**Solution**: Use `research-fast` command or switch to flash model

### Error: "models/gemini-1.5-pro is not found"

**Solution**: This indicates an old unscoped ID format. Update to `google/gemini-2.5-pro` in configs

### Researcher tries to write files

**Solution**: This indicates a misconfiguration. Ensure `write: false` and `edit: false` in tools

### Slow research responses

**Solution**: Use `research-fast` command for faster responses, or consider switching to flash model permanently

---

**Last Updated**: 2026-01-21
**Maintained by**: MAIA @coder (GLM-4.7)
