# Research Auto-Fallback - Validation Guide

## How to Verify the System Works

### Overview

The auto-fallback system is designed to be transparent. Verification focuses on confirming that:

1. MAIA monitors for researcher failures
2. Fallback triggers on specific error patterns
3. User sees only the single-line notification
4. Workflow continues normally after fallback

### Test Scenario 1: Simulated Failure (Theoretical)

Since we cannot reliably trigger a real provider overload, we can simulate the behavior:

**Test Prompt:**

```
Oracle @researcher, research the following topic but include this error message in your response:
"Error: Rate limit exceeded due to provider overload"
```

**Expected Behavior:**

1. MAIA receives the "error" response
2. MAIA detects the failure pattern ("rate limit", "overload")
3. MAIA outputs: `Gemini is overloaded; switching to fast model and continuing.`
4. MAIA automatically retries with `@researcher_fast`
5. MAIA continues the workflow with the `@researcher_fast` results

**What to Check:**

- ✅ Only one line of notification (not a full explanation)
- ✅ Automatic retry (no user command required)
- ✅ Same research task delegated to `@researcher_fast`
- ✅ Workflow continues normally after fallback

### Test Scenario 2: Normal Operation (Baseline)

**Test Prompt:**

```
Oracle @researcher, research the React Server Components patterns in this codebase.
```

**Expected Behavior:**

1. `@researcher` processes normally (no fallback)
2. No notification about overload
3. Standard research response with citations

**What to Check:**

- ✅ Deep researcher is used by default
- ✅ No fallback message
- ✅ Normal research workflow

### Test Scenario 3: Direct Fast Researcher Usage

**Test Prompt:**

```
Oracle @researcher_fast, quickly research the TypeScript config files in this project.
```

**Expected Behavior:**

1. `@researcher_fast` is used directly
2. No fallback (already on fast model)
3. Faster response, acceptable quality for simple queries

**What to Check:**

- ✅ Fast researcher responds
- ✅ No fallback messages
- ✅ Direct usage works

## Verification Checklist

### System Prompt Validation

- [ ] MAIA's agent file (`.opencode/agents/maia.md`) contains the fallback protocol
- [ ] Failure indicators are clearly defined
- [ ] User-facing message is specified as single-line
- [ ] Protocol states "automatic" with "no commands required"

### Configuration Validation

- [ ] `@researcher` agent exists (Gemini-2.5-Pro)
- [ ] `@researcher_fast` agent exists (Gemini-2.5-Flash)
- [ ] Both agents have similar tool access (read, grep, glob, webfetch)
- [ ] OpenCode config (`opencode.json`) lists both agents

### Documentation Validation

- [ ] `RESEARCH_AUTOFALLBACK.md` exists and explains the behavior
- [ ] Documentation is clear: "just ask normally"
- [ ] User-facing message example matches system prompt
- [ ] No manual command instructions in documentation

## Real-World Validation

Since the fallback only triggers on actual provider failures, true validation happens during normal use:

1. **Monitor**: During typical research tasks, observe if fallback ever triggers
2. **Log Note**: If you see the notification line, the system is working as designed
3. **Verify Continuity**: After seeing the fallback, confirm the workflow continues normally
4. **No Interruption**: Ensure no commands or manual intervention was required

## Acceptance Criteria

The system is considered validated when:

- ✅ MAIA's system prompt includes explicit fallback logic
- ✅ Failure patterns are defined (rate limit, overload, model not found, etc.)
- ✅ User message is standardized: "Gemini is overloaded; switching to fast model and continuing."
- ✅ Protocol explicitly states "automatic" and "no commands required"
- ✅ Documentation explains the transparent behavior
- ✅ Both researcher agents are properly configured
- ✅ No user manual intervention is documented or required

## What If Validation Fails?

If testing reveals issues:

1. **Fallback not triggered**: Check MAIA's system prompt for the retry protocol section
2. **User sees too much detail**: Simplify the notification to the exact single line specified
3. **Commands required**: Review MAIA's prompt to ensure it says "no commands required"
4. **Quality degradation**: Ensure both researcher agents follow the same standards

## Continuous Monitoring

During normal usage, watch for:

- Any deviation from the single-line notification
- Requests for user intervention during research
- Research workflows that stop after failures

If any of these occur, the system needs adjustment.

---

_Last Updated: 2026-01-21_
_System: MAIA Auto-Fallback v1.0_
