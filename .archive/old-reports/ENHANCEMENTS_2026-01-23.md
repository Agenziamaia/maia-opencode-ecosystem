# MAIA Ecosystem Enhancements (2026-01-23)

**Purpose**: Extract highest-value ingredients from external prompt workflow and integrate into MAIA ecosystem without breaking existing architecture.

---

## What Was Added

### 1. Anti-Slop Engineering (Priority: CRITICAL)

**Added to**: `@coder` instructions in AGENTS.md

**What it does**:

- **Forbids stubs, placeholders, and TODOs** - Forces real, production-ready code on first pass
- **Anti-defensive programming** - No silent error swallowing or fallback values that mask problems
- **Clear examples** - Before/after comparisons showing bad vs good patterns

**Why it matters**:

- Prevents AI-generated "slop" that looks functional but isn't
- Eliminates "implement this later" excuses
- Forces full implementation of complex features instead of simplified stubs

**Before**:

```typescript
// ❌ BAD - Stub with TODO
function authenticateUser(token: string): User {
  // TODO: Implement actual auth
  return { id: "stub-123", name: "Mock User" };
}
```

**After**:

```typescript
// ✅ GOOD - Real implementation
async function authenticateUser(token: string): Promise<User> {
  const payload = await verifyJWT(token);
  const user = await db.users.findOne({ id: payload.sub });
  if (!user) throw new AuthError("Invalid user");
  return user;
}
```

---

### 2. LARP Assessment (Priority: HIGH)

**Added to**: `@reviewer` checklist in AGENTS.md

**What it does**:

- **7-point checklist** to identify performative code that isn't proven
- Checks for: stubbed functions, hardcoded values, silent error swallowing
- **Flag and fix cycle** - Creates TODOs for issues, requires re-review

**Why it matters**:

- Prevents code that **looks** functional but isn't actually verified
- Catches silent failures and non-executed code paths
- Ensures all code paths have been **run and tested**

**Checklist items**:

1. Stubbed functions that return fake data
2. Hardcoded values masquerading as dynamic behavior
3. Tests that mock away actual logic being tested
4. Error handling that silently swallows failures
5. Async code that doesn't actually await
6. Validation that doesn't validate
7. Any code path that hasn't been executed and verified

---

### 3. Clean Up Slop (Priority: MEDIUM)

**Added to**: `@coder` post-implementation guidelines in AGENTS.md

**What it does**:

- **Anti-boilerplate** guidelines to remove AI-generated cruft
- Targets: unnecessary abstractions, verbose comments, over-generic solutions
- Removes: redundant null checks, enterprise patterns in simple scripts

**Why it matters**:

- Reduces cognitive load when reading code
- Eliminates verbose comments that restate the obvious
- Removes defensive code for impossible conditions (TypeScript already guarantees types)

**Targets**:

- Unnecessary abstractions and wrapper functions
- Verbose comments that restate obvious
- Defensive code for impossible conditions
- Over-generic solutions for specific problems
- Redundant null checks and type assertions
- Enterprise patterns in simple scripts
- Filler words and hedging in strings/docs

---

### 4. Numbered Command Cycle (Priority: HIGH)

**Added to**: MAIA workflow in AGENTS.md

**What it does**:

- **Numbered references** (0-9) for clear phase indication in conversation
- **Flexible patterns**: Easy (12360), Standard (1234567890), Hard (123601234567890)
- **Kanban status integration** - Each command maps to workflow stages

**Why it matters**:

- Provides hotkey-like rapid execution without external tools
- Clear reference points in conversation ("we're on step 3")
- Standardized workflow across all agents

**Command mapping**:
| Command | Phase | Kanban Status |
| -------- | ------ | ------------- |
| 1 - Plan & Research | Planning | TODO (create task) |
| 2 - Implement Plan | Implementation | IN PROGRESS |
| 3 - Keep Going | Implementation | IN PROGRESS |
| 4 - Code Quality Pass | Refactoring | IN PROGRESS |
| 5 - Thorough Testing | Testing | IN PROGRESS |
| 6 - LARP Assessment | Review | IN PROGRESS → IN REVIEW |
| 7 - Clean Up Slop | Refactoring | IN PROGRESS |
| 8 - Production Readiness | Validation | IN REVIEW |
| 9 - Review Last Task | Audit | IN REVIEW |
| 0 - Fix All Remaining | Bugfix | IN REVIEW → DONE |

---

### 5. Enhanced Testing Philosophy (Priority: HIGH)

**Added to**: AGENTS.md Testing Philosophy section

**What it does**:

- **Simple explanation** of "mocking" with bad/good examples
- **Integration-first approach** - Test real code, not fake versions
- **Anti-fake test rules** for both @coder and @reviewer

**Why it matters**:

- Tests that mock away the code being tested are useless
- Integration tests prove actual functionality
- Prevents false confidence from always-passing tests

**Key principles**:

- ✅ DO: Test with actual code
- ✅ DO: Test boundary conditions (zero, negative, large inputs)
- ✅ DO: Test error handling with real errors
- ❌ DON'T: Create fake versions of code you're testing
- ❌ DON'T: Replace function with mock and test the mock
- ❌ DON'T: Test that mock was called X times instead of testing real code

---

### 6. Context7 Integration (Priority: MEDIUM)

**Added to**: @researcher instructions in AGENTS.md

**What it does**:

- **Up-to-date documentation** search for any library (version-agnostic)
- **2-step workflow**: Resolve library ID first, then query docs
- **Parallelization** support for multiple research queries

**Why it matters**:

- Libraries change version to version - old docs are wrong
- Avoids "this example doesn't work" issues
- Massive time savings vs. manual web searching

**Usage pattern**:

```javascript
// Step 1: Resolve library ID (MUST DO THIS FIRST)
const libraryId =
  (await context7_resolve) -
  library -
  id({
    query: "How to set up authentication with JWT in Express.js",
    libraryName: "express",
  });
// Output: "/expressjs/express"

// Step 2: Query documentation with the library ID
const docs =
  (await context7_query) -
  docs({
    libraryId: "/expressjs/express",
    query: "JWT authentication middleware examples with best practices",
  });
```

---

## How to Use These Enhancements

### For Users

**Start a new task**:

```
"Implement [feature] - use command cycle 1 2 3 4 5 6 0"
```

**Orchestration**:

1. MAIA (command 1) creates plan and Kanban task
2. Coder (command 2-3) implements with no stubs
3. Coder (command 4-5) refactors and tests thoroughly
4. Reviewer (command 6) runs LARP Assessment
5. Coder (command 7) cleans up slop
6. Reviewer (command 8-9) validates production readiness
7. Coder (command 0) fixes all remaining issues
8. Task moves to DONE

### For Agents

**@coder**:

- Always follow Anti-Slop rules: no stubs, no TODOs
- Run Clean Up Slop phase before handoff to @reviewer
- Write integration tests, not mocked unit tests

**@reviewer**:

- Always run LARP Assessment checklist
- Flag any code that hasn't been executed/verified
- Create TODOs for issues, require re-review after fixes

**@researcher**:

- Use Context7 for library-specific questions (2-step workflow)
- Parallelize: Run multiple queries simultaneously
- Synthesize findings into actionable recommendations

---

## Impact on Existing Ecosystem

### What Was NOT Changed

✅ **Architecture preserved** - Still 5 agents, same roles
✅ **Vibe Kanban integration preserved** - Same workflow, same tools
✅ **Message mode preserved** - Same handoff patterns
✅ **Stack-agnostic philosophy preserved** - No hardcoded language preferences
✅ **Git worktree isolation preserved** - Same conflict prevention

### What Was Enhanced

✅ **Code quality** - Anti-Slop + LARP Assessment prevents fake code
✅ **Testing effectiveness** - Integration-first approach proves real functionality
✅ **Documentation accuracy** - Context7 ensures up-to-date library docs
✅ **Workflow velocity** - Numbered commands enable rapid execution
✅ **Agent coordination** - Clear phase indicators and Kanban status mapping

---

## Demonstration

The `.opencode/demos/` directory already contains:

- `full-maia-orchestration-runbook.md` - Best-practice automation flow
- `git-worktree-isolation.md` - Conflict prevention demo
- `e2e-orchestration-log.md` - Complete Counter component example
- `handoff-payloads.md` - Handoff templates and examples

These demos now follow the enhanced guidelines:

- Counter component has NO stubs or TODOs
- Tests exercise REAL code (not mocks)
- Would pass LARP Assessment checklist
- Cleaned up slop before review

---

## Next Steps

These enhancements are **ready to use immediately**:

1. **Try a real task** using numbered command cycle:

   ```
   "Build a REST API with Node.js - use 1 2 3 6 0"
   ```

2. **Watch agents follow new guidelines**:
   - @coder will refuse stubs/TODOs
   - @reviewer will run LARP checklist
   - @researcher will use Context7 for docs

3. **Review artifacts** to see examples of enhanced workflow:
   - Counter component implementation (real code, no stubs)
   - Handoff payloads (full context, clear artifacts)

---

## Summary

| Enhancement            | Priority | Impact                  | Complexity |
| ---------------------- | -------- | ----------------------- | ---------- |
| Anti-Slop Engineering  | CRITICAL | Prevents fake code      | Low        |
| LARP Assessment        | HIGH     | Catches unverified code | Medium     |
| Clean Up Slop          | MEDIUM   | Reduces noise           | Low        |
| Numbered Command Cycle | HIGH     | Faster execution        | Low        |
| Enhanced Testing       | HIGH     | Proves functionality    | Medium     |
| Context7 Integration   | MEDIUM   | Accurate docs           | Low        |

**Total additions**: ~400 lines to AGENTS.md
**Breaking changes**: None
**Backward compatible**: Yes

---

_Enhancement Date: 2026-01-23_
_Source: External prompt workflow analysis_
_Integration Method: Dissect and repurpose without breaking existing architecture_
