# ⏱️ Timeout Guard System Documentation

## Purpose

Prevents **indefinite loading/waiting** by enforcing explicit timeouts on all async operations in the MAIA ecosystem.

## Architecture

```
User Request
    ↓
MAIA Orchestrator
    ↓
Agent + Timeout Guard ← NEW: Enforces limits
    ↓
Provider API
    ↓
Result (or timeout error)
```

### Three-Layer Protection

1. **Configuration Layer** (`opencode.json`)
   - Provider timeouts (ZAI: 60s, Google: 30s, etc.)
   - Agent timeouts (health: 30s, code: 3m, etc.)
   - Network timeouts (fetch: 8s, Discord: 5s, etc.)

2. **Utility Layer** (`.opencode/utils/timeoutGuard.ts`)
   - `withTimeout()` - Promise.race-based timeout
   - `withAbortSignal()` - AbortController wrapper
   - `withRetry()` - Exponential backoff + jitter

3. **Implementation Layer** (specific tools)
   - Discord plugin: AbortController on all fetch calls
   - Future tools: Use `withTimeout()` wrapper

## Components

### 1. `withTimeout<T>()`

Basic Promise timeout with fallback:

```typescript
import { withTimeout, TIMEOUT_PRESETS } from '.opencode/utils/timeoutGuard';

const data = await withTimeout(
  () => fetch('/api/data').then(r => r.json()),
  {
    timeoutMs: TIMEOUT_PRESETS.FETCH,
    fallback: null,
    errorMessage: 'API timeout'
  }
);
```

**When to use:**
- Simple async operations
- Need fallback value on timeout
- Non-cancellable operations

### 2. `withAbortSignal<T>()`

AbortController-based cancellation for fetch/network:

```typescript
import { withAbortSignal, TIMEOUT_PRESETS } from '.opencode/utils/timeoutGuard';

const data = await withAbortSignal(
  (signal) => fetch(url, { signal }).then(r => r.json()),
  TIMEOUT_PRESETS.WEBFETCH
);
```

**When to use:**
- Network requests (fetch, axios)
- Operations supporting AbortSignal
- Need proper cancellation

### 3. `withRetry<T>()`

Retry with exponential backoff and jitter:

```typescript
import { withRetry } from '.opencode/utils/timeoutGuard';

const data = await withRetry(
  () => fetch(url).then(r => r.json()),
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}:`, error.message);
    }
  }
);
```

**When to use:**
- Flaky external APIs
- Network operations
- Idempotent operations (can retry safely)

## Timeout Presets

All timeout values are in `TIMEOUT_PRESETS`:

```typescript
{
  // Provider operations
  HEALTH_CHECK: 30000,        // 30s - Fast failover
  SIMPLE_QUERY: 60000,         // 60s - Standard wait
  CODE_TASK: 180000,           // 3m - Complex coding
  RESEARCH_TASK: 120000,        // 2m - Research
  WORKFLOW_TASK: 300000,        // 5m - Long workflows

  // Network operations
  FETCH: 8000,                 // 8s - User expectation
  DISCORD: 5000,               // 5s - Discord API
  WEBFETCH: 10000,             // 10s - Web scraping
  MCP_TOOL: 5000,             // 5s - MCP tools

  // Provider-specific
  ZAI_CODING_PLAN: 60000,       // 60s - Z.ai
  GOOGLE: 30000,               // 30s - Google
  OPENROUTER: 45000,           // 45s - OpenRouter
  OPENCODE: 30000,              // 30s - OpenCode
}
```

## Configuration

### opencode.json Structure

```json
{
  "timeout": {
    "provider": {
      "default": 30000,
      "zai-coding-plan": 60000,
      "google": 30000,
      "openrouter": 45000
    },
    "agent": {
      "health_check": 30000,
      "simple_query": 60000,
      "code_task": 180000,
      "research_task": 120000,
      "workflow_task": 300000
    },
    "network": {
      "fetch": 8000,
      "discord": 5000,
      "webfetch": 10000,
      "mcp_tool": 5000
    },
    "fallback": {
      "enabled": true,
      "max_retries": 3,
      "backoff_multiplier": 2.0,
      "initial_delay": 1000
    }
  }
}
```

## Usage Patterns

### Pattern 1: Discord Plugin (Cancellable)

```typescript
// ✅ CORRECT: With AbortController
try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const res = await fetch(url, { signal: controller.signal });

  clearTimeout(timeoutId);
  // Handle response...
} catch (e) {
  if ((e as Error).name === 'AbortError') {
    return '❌ Timeout after 5 seconds';
  }
  return `❌ Error: ${e}`;
}

// ❌ WRONG: No timeout
const res = await fetch(url); // Waits forever!
```

### Pattern 2: Agent Delegation (Timeout Guard)

```typescript
// ✅ CORRECT: With timeout utility
import { withTimeout, TIMEOUT_PRESETS } from './utils/timeoutGuard';

const result = await withTimeout(
  () => agent.execute(prompt),
  {
    timeoutMs: TIMEOUT_PRESETS.CODE_TASK,
    fallback: { error: 'timeout' }
  }
);

// ❌ WRONG: Unbounded wait
const result = await agent.execute(prompt); // Waits forever!
```

### Pattern 3: Retry with Backoff

```typescript
// ✅ CORRECT: With retry utility
import { withRetry } from './utils/timeoutGuard';

const data = await withRetry(
  () => fetch(url).then(r => r.json()),
  {
    maxRetries: 3,
    baseDelay: 1000,
    onRetry: (attempt, error) => console.log(`Retry ${attempt}`)
  }
);

// ❌ WRONG: Single attempt
const data = await fetch(url).then(r => r.json());
```

## Maintenance

### When to Adjust Timeouts

| Scenario | Action |
|----------|--------|
| **Users report timeout** | Increase specific timeout (e.g., CODE_TASK: 3m → 4m) |
| **Agents too slow** | Check provider health, consider switching models |
| **Network issues** | Increase fetch/discord timeouts |
| **New provider added** | Add timeout config to opencode.json |

### Adding New Provider

1. Add to `opencode.json` provider section:

```json
"new-provider": {
  "npm": "@ai-sdk/compatible",
  "name": "New Provider",
  "options": {
    "timeout": 45000
  }
}
```

2. Add to `TIMEOUT_PRESETS` in `.opencode/utils/timeoutGuard.ts`:

```typescript
NEW_PROVIDER: 45000, // 45s - New provider
```

### Adding New Agent

1. Add to `opencode.json` agent section with timeout:

```json
"new_agent": {
  "description": "Agent description",
  "model": "provider/model",
  "mode": "subagent",
  "timeout": 90000, // ← CRITICAL: Always set timeout
  "tools": { ... }
}
```

2. Choose appropriate timeout from presets:
   - Fast (30-60s): Simple queries, health checks
   - Medium (90-120s): Research, analysis
   - Long (180-300s): Complex tasks, workflows

## Monitoring

### Log Timeouts

If logging enabled in preferences:

```typescript
// .opencode/agents/preferences.json
"timeout": {
  "logging": {
    "enabled": true,
    "log_timeouts": true,
    "log_retries": true
  }
}
```

### Key Metrics

Track:
- **Timeout rate** (operations timing out / total)
- **Retry success rate** (succeed on retry vs total retries)
- **Agent hang rate** (agents exceeding timeout / total)
- **Provider response times** (avg response time per provider)

## Troubleshooting

### Symptom: "Loading..." forever

**Cause:** Missing timeout configuration

**Fix:**
1. Check `opencode.json` has `timeout` section
2. Verify agent has `timeout` field
3. Check tool uses `withTimeout()` or `withAbortSignal()`

### Symptom: Frequent timeouts

**Cause:** Timeout too low

**Fix:**
1. Check which operation timing out
2. Increase specific timeout in presets
3. Consider if provider is slow/unstable

### Symptom: No errors, no result

**Cause:** Fallback swallowing errors

**Fix:**
1. Check `withTimeout()` has appropriate `errorMessage`
2. Ensure fallback doesn't hide real issues
3. Add logging to track execution path

## Research Basis

These timeout values are based on:

1. **Production systems** (Overleaf, Infisical, n8n, Langsmith)
2. **Industry best practices** (MDN, AWS Well-Architected)
3. **User expectation studies** (8s max for simple requests)
4. **Agent frameworks** (LangChain, LangGraph recursion limits)
5. **Platform guidelines** (Google Cloud, OpenAI, Anthropic)

See comprehensive research report in STATUS.md (2026-01-27).

## Future Enhancements

1. **Adaptive timeouts** - Auto-adjust based on historical response times
2. **Circuit breaker** - Stop calling failing providers temporarily
3. **Timeout dashboard** - Visualize timeout metrics across system
4. **Predictive preemption** - Detect slow operations before timeout
5. **Distributed tracing** - Track timeout path through system

---

**Last Updated:** 2026-01-27
**Status:** ✅ PRODUCTION READY
**Anti-Deadlock Architecture:** ✅ ACTIVE
