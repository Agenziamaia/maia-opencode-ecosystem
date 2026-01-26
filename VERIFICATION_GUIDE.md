# Quick Verification Guide

## ✅ All Systems Go

The research auto-fallback system has been implemented. Here's how to verify it works:

---

## 30-Second Verification

Run this command to confirm all components are in place:

```bash
echo "=== Checking MAIA fallback protocol ===" && grep -q "Research Failure Fallback" .opencode/agents/maia.md && echo "✓ MAIA protocol installed" && echo "=== Checking documentation ===" && test -f RESEARCH_AUTOFALLBACK.md && echo "✓ User guide exists" && test -f RESEARCH_AUTOFALLBACK_VALIDATION.md && echo "✓ Validation guide exists" && test -f IMPLEMENTATION_SUMMARY.md && echo "✓ Implementation summary exists" && echo "=== Checking agents ===" && grep -q '"researcher"' opencode.json && echo "✓ Researcher configured" && grep -q '"researcher_fast"' opencode.json && echo "✓ Researcher fast configured" && echo "=== All checks passed! ==="
```

Expected output:

```
=== Checking MAIA fallback protocol ===
✓ MAIA protocol installed
=== Checking documentation ===
✓ User guide exists
✓ Validation guide exists
✓ Implementation summary exists
=== Checking agents ===
✓ Researcher configured
✓ Researcher fast configured
=== All checks passed! ===
```

---

## What You Should See When It Works

### Normal Operation (No Fallback)

```
You: Research the latest React patterns
MAIA: Oracle @researcher, analyze React patterns...
[Researcher responds successfully]
MAIA: [Proceeds with synthesis]
```

### With Fallback (Automatic)

```
You: Research the latest React patterns
MAIA: Oracle @researcher, analyze React patterns...
[Researcher fails: "Error: Rate limit exceeded"]
MAIA: Gemini is overloaded; switching to fast model and continuing.
MAIA: Oracle @researcher_fast, analyze React patterns...
[Researcher_fast responds successfully]
MAIA: [Proceeds with synthesis]
```

**Key point:** You only see one line: `"Gemini is overloaded; switching to fast model and continuing."`

---

## Key Files

| File                                  | Purpose                                        |
| ------------------------------------- | ---------------------------------------------- |
| `.opencode/agents/maia.md`            | MAIA's brain with fallback protocol (modified) |
| `RESEARCH_AUTOFALLBACK.md`            | User guide (new)                               |
| `RESEARCH_AUTOFALLBACK_VALIDATION.md` | Testing guide (new)                            |
| `IMPLEMENTATION_SUMMARY.md`           | Technical details (new)                        |

---

## What Triggers Fallback

MAIA automatically switches to fast researcher when:

- Rate limits (429 errors)
- Provider overload
- Model not found
- Timeouts
- Service unavailable
- API access issues
- Resource exhaustion

---

## User Action Required

**None.** Just ask normally. MAIA handles everything.

---

## If Something Goes Wrong

1. **No fallback happens**: Check MAIA's prompt has the fallback section
2. **See error messages**: Fallback should be silent except for the one-line notification
3. **Asked to run commands**: That shouldn't happen - it's fully automatic

For detailed troubleshooting, see `RESEARCH_AUTOFALLBACK_VALIDATION.md`.

---

## Success Criteria

- ✅ MAIA has fallback protocol in system prompt
- ✅ User sees only single-line notification
- ✅ No commands required from user
- ✅ Workflow continues normally after fallback
- ✅ Documentation is clear and complete

---

_Status: Ready for use_
_Last Check: 2026-01-21_
