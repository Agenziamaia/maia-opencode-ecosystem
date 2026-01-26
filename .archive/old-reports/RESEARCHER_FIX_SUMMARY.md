# Researcher Agent Fix - Execution Summary

**Agent**: @coder (GLM-4.7)
**Date**: 2026-01-21
**Status**: ✅ COMPLETE

---

## Problem Solved

1. **Model ID Instability**: Fixed all configs to use stable, explicit model IDs instead of aliases
2. **Wrong Format**: Ensured all models use provider-scoped format (`google/...`)
3. **Permission Errors**: Fixed all researcher agents to be read-only
4. **Provider Overload**: Added fallback agent (`researcher_fast`) and command for high availability

---

## Changes Applied

### Root Configuration

- ✅ `researcher`: `google/gemini-2.5-pro` (stable, high-quality)
- ✅ `researcher_fast`: `google/gemini-2.5-flash` (high availability fallback)
- ✅ Both: read-only, webfetch enabled, bash disabled
- ✅ New command: `research-fast`

### Layer0 Template

- ✅ Synchronized with root configuration
- ✅ Both researcher variants properly configured

### List Configuration

- ✅ Already correct (no changes needed)
- ✅ Updated markdown to match

### Documentation

- ✅ `RESEARCHER_CONFIG.md`: Comprehensive guide
- ✅ `RESEARCHER_FIX_VERIFICATION.md`: Verification details

---

## Verification Results

```
✅ No 'models/gemini' patterns in configs (only in docs as warnings)
✅ Root researcher uses google/gemini-2.5-pro
✅ Root researcher_fast uses google/gemini-2.5-flash
✅ Root researcher has correct read-only permissions
✅ researcher.md uses google/gemini-2.5-pro
✅ researcher_fast.md uses google/gemini-2.5-flash
✅ research-fast command exists
✅ Layer0 configs synchronized
✅ Documentation complete
```

---

## How to Use

### Standard Research

```bash
opencode run --command research "Your query"
# Uses gemini-2.5-pro (high quality)
```

### Fast Research (Fallback)

```bash
opencode run --command research-fast "Your query"
# Uses gemini-2.5-flash (high availability)
```

### Direct Agent Invocation

```bash
opencode run --agent researcher "Your query"
opencode run --agent researcher_fast "Your query"
```

---

## Handling Provider Overload

When encountering "model provider overload" errors:

### Option 1: Use Fast Command (Recommended)

```bash
opencode run --command research-fast "Your query"
```

### Option 2: Edit Config (Temporary)

Edit `opencode.json`:

```json
{
  "agent": {
    "researcher": {
      "model": "google/gemini-2.5-flash" // Switch from gemini-2.5-pro
    }
  }
}
```

### Why This Works

- Flash model has higher capacity
- Less likely to experience overload
- ~4x cheaper with similar quality
- Same 1M token context window

---

## Key Improvements

1. **Stability**: Explicit model IDs instead of aliases
2. **Availability**: Fallback agent for provider overload scenarios
3. **Safety**: Read-only permissions prevent accidental modifications
4. **Consistency**: All configs (root, templates, markdown) synchronized
5. **Documentation**: Clear guidance on usage and troubleshooting

---

## Files Modified

| File                                              | Changes                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `opencode.json`                                   | Updated models, added researcher_fast, added command |
| `.opencode/agents/researcher.md`                  | Fixed model ID and permissions                       |
| `.opencode/agents/researcher_fast.md`             | **NEW** - Fast variant                               |
| `MAIA_Layer0/opencode.json`                       | Synced with root config                              |
| `MAIA_Layer0/.opencode/agents/researcher.md`      | Fixed model ID and permissions                       |
| `MAIA_Layer0/.opencode/agents/researcher_fast.md` | **NEW** - Fast variant                               |
| `list/.opencode/agents/researcher.md`             | Fixed model ID and permissions                       |
| `RESEARCHER_CONFIG.md`                            | **NEW** - Comprehensive guide                        |
| `RESEARCHER_FIX_VERIFICATION.md`                  | **NEW** - Verification details                       |

---

## Model Selection Rationale

### Why `google/gemini-2.5-pro`?

- Latest stable Pro model
- 1M token context
- High-quality reasoning
- Multimodal support

### Why `google/gemini-2.5-flash`?

- Faster response times
- Higher availability (less overload)
- ~4x cheaper ($0.30 vs $1.25 per 1M tokens)
- Same 1M token context
- Excellent quality for most research tasks

### Why Not `*-latest` Aliases?

- Aliases can change without notice
- May cause adapter compatibility issues
- Explicit IDs are more predictable

---

## Next Steps

1. **Test**: Run research commands during normal workflow
2. **Monitor**: Watch for provider overload errors
3. **Fallback**: Use `research-fast` when needed
4. **Refresh**: Periodically run `opencode models google --refresh`

---

## Success Criteria - All Met ✅

- ✅ Single source of truth (JSON canonical)
- ✅ Stable, explicit model IDs
- ✅ No `models/gemini` patterns in configs
- ✅ All researcher agents read-only
- ✅ Webfetch enabled for all
- ✅ Fallback agent created
- ✅ Fallback command added
- ✅ Comprehensive documentation
- ✅ All configs consistent
- ✅ No unrelated refactors
- ✅ Minimal but decisive changes

---

**Constraints Adhered To**:

- No unrelated refactors
- No commits made
- Changes minimal but decisive
- Verification steps provided

---

**MAIA @coder - GLM-4.7**
_Architecting Reality. Building Well._
