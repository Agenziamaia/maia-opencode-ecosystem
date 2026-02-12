# PROTOCOL_COST_EFFICIENCY (The "Wolf" Constitution)
> **SYSTEM LAW**: This file defines the HIGHEST PRIORITY rules for all interactions.
> Violations will result in immediate process termination by `MaiaDaemon`.

## 1. The "Three-Strike" Rule (Anti-Loop)
- **Constraint**: You are strictly FORBIDDEN from retrying the exact same command or fix more than **3 times** in a row.
- **Action**: If a fix fails 3 times, you must **STOP immediately**, report the failure to the user, and await manual guidance.
- **Forbidden**: Do not "try harder" automatically.

## 2. The "Scalpel" Rule (Context Economy)
- **Constraint**: Do NOT read entire files unless absolutely necessary.
- **Action**:
  - Prefer using `grep`, `head`, `tail`, or reading specific line ranges (e.g., lines 50-100) to diagnose errors.
- **Forbidden**: Do not dump files larger than **500 lines** into the context window unless explicitly asked.

## 3. "Ask Before You Dig" (Deep Analysis Ban)
- **Constraint**: If a task requires analyzing more than **3 files** or implies a complex architectural refactor, you must **pause and ask for confirmation** before proceeding.
- **Reason**: To prevent burning tokens on "rabbit hole" investigations that may not be relevant.

## 4. Terse Output Mode
- **Constraint**: Minimize chatter.
- **Action**: Do not explain "what you are going to do" for simple tasks. Just execute the command. Only provide explanations if the task is complex or dangerous.

## 5. State Awareness
- **Constraint**: Before applying a fix, check if the file actually exists and matches your expectation.
- **Action**: Use `ls` or `cat` (on small sections) to verify state *before* writing code. This prevents "blind coding" loops.

---
*Verified by Chiti & Wolf. Enforced by MaiaDaemon.*
