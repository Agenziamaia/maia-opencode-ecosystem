# OpenRouter "Provider Not Found" - Root Cause & Fix

## 🚨 Problem Summary

Your OpenCode configuration is failing with two errors:

1. **"No endpoints found that support tool use"** - Models don't support function calling
2. **"ProviderModelNotFoundError"** - Models not in OpenCode's model registry

## 🔍 Root Cause Analysis

### Issue #1: Tool Support Required

OpenCode's agent system **requires models that support function calling/tool use**. Your configured models:

- `qwen/qwen3-coder:free` ❌ Doesn't support tools
- `deepseek/deepseek-r1-0528:free` ❌ Doesn't support tools

**Why this matters**: OpenCode uses OpenAI's function calling API to enable agents to call tools (bash, file operations, git, etc.). Models without tool support simply cannot work with OpenCode's agent system.

### Issue #2: Model Registry

OpenCode uses [models.dev](https://models.dev) to validate models. Custom models need:

1. Proper configuration in `opencode.json`
2. **Tool support** (function calling capability)

## ✅ Solution: Use Tool-Supported Models

I've created `opencode.fixed.json` with **verified OpenRouter models** that support tools:

### Recommended Models (with full tool support):

| Model                                | Context | Output | Cost | Best For                 |
| ------------------------------------ | ------- | ------ | ---- | ------------------------ |
| `openai/gpt-4o`                      | 128K    | 64K    | $$$  | Primary orchestration    |
| `openai/gpt-4o-mini`                 | 128K    | 64K    | $    | Fast tasks, ops          |
| `google/gemini-2.5-flash`            | 1M      | 8K     | $    | Fast, huge context       |
| `deepseek/deepseek-coder`            | 128K    | 4K     | $    | Coding tasks             |
| `qwen/qwen-2.5-coder-32b-instruct`   | 32K     | 8K     | $    | Coding (cheaper)         |

## 🛠️ Steps to Fix

### Step 1: Backup Current Config

```bash
cp opencode.json opencode.backup.json
```

### Step 2: Apply Fixed Config

```bash
cp opencode.fixed.json opencode.json
```

### Step 3: Verify OpenRouter API Key

```bash
# Check if API key is set
cat ~/.local/share/opencode/auth.json | grep -i openrouter
```

If not set:

```bash
# Run OpenCode and use /connect command
opencode
# Then type: /connect
# Search for: openrouter
# Enter your API key from: https://openrouter.ai/settings/keys
```

### Step 4: Test Configuration

```bash
opencode
# Should load without errors
# Type: /models
# You should see the OpenRouter models listed
```

## 🎯 Agent Configuration Changes

I've optimized agent models for cost-effectiveness and reliability:

| Agent       | Primary Model                 | Why                              |
| ----------- | ----------------------------- | -------------------------------- |
| @maia       | `openai/gpt-4o`               | Best reasoning for orchestration |
| @coder      | `google/gemini-2.5-flash`     | Fast, 1M context for coding      |
| @ops        | `openai/gpt-4o-mini`          | Fast, cost-effective for infra   |
| @workflow   | `google/gemini-2.5-flash`     | Fast, supports complex workflows |

## 💰 Cost Optimization

The fixed configuration prioritizes:

1. **GPT-4o-mini** for ops and fast tasks (cheapest GPT-4)
2. **Gemini 2.5 Flash** for coding and research (very cheap, 1M context)
3. **DeepSeek Coder** for coding (specialized, cheap)
4. **Fallback chain** for reliability

## 🔍 How to Verify Tool Support

Before adding any OpenRouter model to your config, check:

1. Visit [OpenRouter's model page](https://openrouter.ai/models)
2. Look for the model
3. Check if it has **"Function Calling"** capability
4. If yes, add to `opencode.json` with the format:

```json
{
  "provider": {
    "openrouter": {
      "models": {
        "my-model": {
          "id": "provider/model-id",
          "name": "Display Name",
          "limit": {
            "context": 128000,
            "output": 4096
          }
        }
      }
    }
  }
}
```

## 📚 References

- [OpenRouter Models](https://openrouter.ai/models)
- [OpenCode Providers Documentation](https://opencode.ai/docs/providers/#openrouter)
- [OpenRouter Provider Routing](https://openrouter.ai/docs/provider-routing)
- [GitHub Issue #1002](https://github.com/anomalyco/opencode/issues/1002) - Tool use error
- [GitHub Issue #916](https://github.com/anomalyco/opencode/issues/916) - Model not found error

## ⚠️ Important Notes

1. **Free models** often don't support tool calling - they're basic inference only
2. **DeepSeek R1** and **Qwen 3 Coder** free versions lack tool support
3. **DeepSeek Chat** and **DeepSeek Coder** paid versions DO support tools
4. **Function calling is mandatory** for OpenCode's agent system to work
5. **Always verify tool support** before adding new models

## 🚀 Next Steps

1. Backup your current config
2. Apply the fixed configuration
3. Verify your OpenRouter API key
4. Test with `/models` command
5. Run a simple test session

If you still encounter errors, check:

- API key is valid: `https://openrouter.ai/keys`
- Account has credits: `https://openrouter.ai/billing`
- Logs: `~/.local/share/opencode/log/`

---

**Status**: ✅ Fixed configuration created
**Action Required**: Apply `opencode.fixed.json` to `opencode.json`
