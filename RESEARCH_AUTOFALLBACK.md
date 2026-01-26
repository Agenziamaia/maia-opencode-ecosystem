# Research Auto-Fallback

## What is this?

MAIA automatically handles research model failures without requiring any action from you.

## How it works

1. **Normal operation**: When MAIA needs research, it uses the deep researcher (`@researcher` - Gemini-2.5-Pro) for maximum depth and insight.

2. **Automatic fallback**: If the deep researcher encounters issues (provider overload, rate limits, etc.), MAIA **automatically** switches to the fast researcher (`@researcher_fast` - Gemini-2.5-Flash) and continues.

3. **User experience**: You see at most one simple message:

   ```
   Gemini is overloaded; switching to fast model and continuing.
   ```

4. **Zero friction**: No commands to run, no manual fallbacks to remember. Just ask normally, MAIA handles the rest.

## When does it trigger?

Auto-fallback activates when `@researcher` fails with:

- Rate limits (429 errors)
- Provider overload/capacity issues
- Model not found errors
- Timeouts
- Service unavailable errors
- API key/model access issues

## What about quality?

- **Deep researcher** (`@researcher`): Preferred for complex research, deeper analysis
- **Fast researcher** (`@researcher_fast`): High-availability fallback, faster response times
- **Result**: You always get results. The fallback uses the same research protocol and citations standards.

## How do I know it happened?

Look for the notification line:

```
Gemini is overloaded; switching to fast model and continuing.
```

That's it. No other changes in behavior or output format.

## Can I force fast mode?

Yes, if you want to use the fast researcher directly (e.g., for quick queries where deep analysis isn't needed), you can explicitly ask:

> "Use the fast researcher to quickly check X"

But for normal research, let MAIA choose the best model and handle fallbacks automatically.

## Summary

- **Just ask normally** - MAIA handles everything
- **No commands required** - fully automatic
- **Always get results** - transparent fallback ensures availability
- **Quality maintained** - both models follow the same research standards

---

_Built by MAIA - Autonomous, Transparent, Reliable._
