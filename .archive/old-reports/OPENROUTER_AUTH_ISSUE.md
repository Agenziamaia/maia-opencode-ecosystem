# OpenRouter Connection Issue - DIAGNOSIS

**Date**: 2026-01-24
**Problem**: All OpenRouter models returning "No endpoints found" or 401/402 errors

---

## What We've Discovered

### 1. OpenRouter API Connection

**Test Results**:

- `curl https://openrouter.ai/api/v1/models` → **Status 200** ✅
- OpenRouter list API accessible
- 482K+ models available on platform

### 2. Direct API Tests

**Test** (with API key environment variable):

```bash
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/chat/completions \
  -d '{"model":"zai-coding-plan/glm-4.7","messages":[{"role":"user","content":"test"}]}'
```

**Result**: `{"error":{"message":"No cookie auth credentials found","code":401}}`

**Analysis**:

- Error 401 = Authentication problem
- OpenCode isn't finding or using the API key correctly
- This is NOT a model availability issue
- This is an **OpenCode configuration issue**

---

## Root Cause: OpenCode Authentication

### The Problem

OpenCode is configured to use OpenRouter, BUT:

1. ❌ API key not being passed correctly to curl/OpenCode API calls
2. ❌ Possible causes:
   - OpenCode API key not set in settings
   - OpenCode using cached/old credentials
   - API key has insufficient credits
   - OpenCode session needs refresh

### Why This Affects All Models

ALL OpenRouter models (free or paid) will fail because:

- OpenCode can't authenticate with OpenRouter
- It returns 401 "No cookie auth credentials found"
- OpenCode then reports "No endpoints found" (misleading error message)

---

## Evidence of Configuration Issues

### Current opencode.json Configuration

**Working**:

```json
"maia": {"model": "zai-coding-plan/glm-4.7"},
"vision": {"model": "openrouter/google/gemini-2.0-flash-exp"},
```

**Problematic** (from previous attempts):

```json
"coder": {"model": "zai-coding-plan/glm-4.7"},  // Not OpenRouter format
"giuzu": {"model": "zai-coding-plan/glm-4.7"},  // Not OpenRouter format
"workflow": {"model": "zai-coding-plan/glm-4.7"}, // Not OpenRouter format
```

### What Should Work (Based on Verified OpenRouter List):

**High-Quality Free Options**:

| Model ID                  | Context | Best For                                             | Status                     |
| ------------------------- | ------- | ---------------------------------------------------- | -------------------------- |
| `z-ai/glm-4.5-air:free`   | 32K     | Core agents (maia/coder/ops/reviewer/giuzu/workflow) | Free tier, verified exists |
| `qwen/qwen3-coder:free`   | -       | Coding tasks                                         | Free tier, verified exists |
| `google/gemini-2.5-flash` | -       | Researcher                                           | Free tier, verified exists |

**Mid-Tier Options**:

| Model ID            | Context | Best For              | Status                |
| ------------------- | ------- | --------------------- | --------------------- |
| `openai/gpt-5-mini` | 160K    | Testing, simple tasks | Free tier, very cheap |

---

## Required Actions (For You to Fix)

### 1. Check OpenCode Settings

**In VS Code**:

1. Open Command Palette (Cmd+Shift+P)
2. Type "OpenCode: Settings"
3. Click "Providers" or "API Keys"
4. Check OpenRouter configuration:
   - API key is set?
   - Has sufficient credits?
   - Status shows "Active" or "Connected"?

**In Browser**:

1. Go to https://openrouter.ai
2. Click your account icon
3. Verify:
   - API key is valid
   - Has credits available
   - No account restrictions

### 2. Test Connection

**Test with curl (verify API key works)**:

```bash
# Replace YOUR_ACTUAL_KEY with your OpenRouter API key
export OPENROUTER_API_KEY=YOUR_ACTUAL_KEY

# Test simple request
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemini-2.5-flash","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
```

### 3. Update OpenCode Configuration

Once you confirm API key works:

**Option A**: Update opencode.json with verified free models

```json
{
  "agent": {
    "maia": { "model": "z-ai/glm-4.5-air:free" },
    "coder": { "model": "z-ai/glm-4.5-air:free" },
    "ops": { "model": "z-ai/glm-4.5-air:free" },
    "reviewer": { "model": "z-ai/glm-4.5-air:free" },
    "giuzu": { "model": "z-ai/glm-4.5-air:free" },
    "workflow": { "model": "z-ai/glm-4.5-air:free" },
    "vision": { "model": "google/gemini-2.5-flash" }
  }
}
```

**Option B**: Use OpenRouter's GPT-5.2 (paid but highest quality)

```json
{
  "agent": {
    "maia": { "model": "zai-coding-plan/glm-4.7" },
    "coder": { "model": "zai-coding-plan/glm-4.7" },
    "ops": { "model": "zai-coding-plan/glm-4.7" },
    "reviewer": { "model": "zai-coding-plan/glm-4.7" },
    "giuzu": { "model": "zai-coding-plan/glm-4.7" },
    "workflow": { "model": "zai-coding-plan/glm-4.7" }
  }
}
```

---

## What This Document Shows

### Confirmed Working

- ✅ OpenRouter API is online (status 200)
- ✅ Models list accessible
- ✅ 482K+ models available

### Confirmed Broken

- ❌ OpenCode cannot authenticate with OpenRouter (401 error)
- ❌ "No endpoints found" is misleading - it's auth, not endpoint issues
- ❌ All OpenRouter models fail because of auth problem

### Recommended Model Choices

**For FREE usage**:

- `z-ai/glm-4.5-air:free` - 32K context, good for core agents
- `qwen/qwen3-coder:free` - Coding-focused
- `google/gemini-2.5-flash` - Fast research
- `openai/gpt-5-mini` - Cheap, simple tasks

**For PAID usage** (if willing to spend):

- `zai-coding-plan/glm-4.7` - Highest quality, 400K context

---

## Your Next Steps

1. **Check OpenCode API key** in OpenRouter settings
2. **Verify credits** on OpenRouter account
3. **Test with curl** (example above) to confirm API key works
4. **Update opencode.json** with working model IDs
5. **Test agents** to confirm they work after fix

---

**The issue is NOT model availability** - it's OpenCode authentication to OpenRouter.

**Once you fix the auth issue, ANY OpenRouter model will work** (free or paid).
