# Working Versions Snapshots

This file tracks tested configurations that are known to work (or almost work).

---

## Snapshot: 2026-01-29 13:36 - "Almost Working"

**Status**: Almost working - needs final validation

### Agent Model Matrix

| Agent | Model | Provider | Status |
|-------|-------|----------|--------|
| **maia** | `zai-coding-plan/glm-4.7` | Z.ai Paid | ✅ Primary |
| **sisyphus** | `zai-coding-plan/glm-4.7` | Z.ai Paid | ✅ PM |
| **coder** | `zai-coding-plan/glm-4.7` | Z.ai Paid | ✅ |
| **ops** | `zai-coding-plan/glm-4.7` | Z.ai Paid | ✅ |
| **researcher** | `google/gemini-2.5-pro` | Google | ⏳ Slow but works |
| **researcher_fast** | `google/gemini-2.5-flash` | Google | ✅ Fast |
| **giuzu** | `openrouter/deepseek/deepseek-r1:free` | OpenRouter | ⚠️ Free tier |
| **vision** | `google/gemini-2.0-flash` | Google | ✅ |
| **reviewer** | `opencode/big-pickle` | OpenCode | ✅ Tested |
| **workflow** | `openrouter/qwen/qwen-2.5-coder-32b-instruct` | OpenRouter | ⚠️ Needs tool support |
| **opencode** | `google/gemini-2.5-flash` | Google | ✅ |
| **starter** | `google/gemini-2.5-flash` | Google | ✅ |
| **librarian** | `google/gemini-2.5-flash` | Google | ✅ |
| **maia_premium** | `google/gemini-2.5-pro` | Google | ⏳ Slow |

### Provider Summary

| Provider | Count | Agents |
|----------|-------|--------|
| Z.ai GLM-4.7 | 4 | maia, sisyphus, coder, ops |
| Google Gemini 2.5 Flash | 5 | researcher_fast, vision, opencode, starter, librarian |
| Google Gemini 2.5 Pro | 2 | researcher, maia_premium |
| OpenCode Big Pickle | 1 | reviewer |
| OpenRouter DeepSeek R1 | 1 | giuzu |
| OpenRouter Qwen 2.5 Coder | 1 | workflow |

### Known Issues

- **giuzu**: Free OpenRouter tier may rate limit
- **workflow**: Qwen via OpenRouter may have tool support issues
- **researcher/maia_premium**: Gemini Pro is slow (45s+ response times)

### Fallback Strategy

If an agent fails, use:
- OpenRouter agents → `google/gemini-2.5-flash`
- Gemini Pro → `google/gemini-2.5-flash`
- Big Pickle → `zai-coding-plan/glm-4.7`

---

## How to Restore This Snapshot

```bash
git checkout 2026-01-29-almost-working -- opencode.json
```

Or copy the config from this file.
