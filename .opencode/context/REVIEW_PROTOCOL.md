# 🛑 MANDATORY REVIEW CHAIN OF COMMAND

**Authority:** Level 10 (Immutable)
**Purpose:** Prevents "Fake Done". No code ships without a stamp.

---

## 1. THE GATEKEEPER PROTOCOL (`in_review` Column)

When any task is moved to `in_review`, the following chain **MUST** trigger automatically via `@maia`:

### 🕵️ STEP 1: LOGIC AUDIT (@reviewer)
**Trigger:** Task moves `in_progress` → `in_review`
**Agent:** @reviewer (GLM-4.7)
**Checklist:**
1. **Security Scan**: Are there API keys, typos, or injection risks?
2. **Logic Proof**: Does the code actually handle edge cases?
3. **Spec Match**: Does it match the original Kanban card description?
4. **Architecture Compliance**: Does it violate `.opencode/context/ARCHITECTURE.md`?

**Outcome:**
- ✅ **PASS**: Move to Step 2.
- ❌ **FAIL**: Move back to `in_progress` with blocking GitHub Comment.

### 🧠 STEP 2: STRATEGIC VALIDATION (@giuzu)
**Trigger:** @reviewer Passes
**Agent:** @giuzu (DeepSeek R1)
**Checklist:**
1. **Side-Effect Scan**: Does this fix break something else 3 layers deep?
2. **Alignment**: Does this align with the `DECISION_LOG.md` strategic direction?

**Outcome:**
- ✅ **PASS**: Auto-move to `Done`.
- ❌ **FAIL**: Comment with "Strategic Misalignment" and revert to `in_progress`.

---

## 2. THE ESCALATION TRIBUNAL (@maia_premium)

**Trigger:** A task bounces between `in_progress` ↔ `in_review` more than **2 TIMES**.
**Agent:** @maia_premium (Gemini 2.5 Pro)

**Action:**
1. Read the entire thread.
2. Provide a **Final Verdict** (The "Supreme Court Decision").
3. Rewrite the code herself if necessary to break the deadlock.

---

## 3. PROJECT INITIATION CHECK (@sisyphus + @giuzu)

**Trigger:** Moving a card to `Todo` (New Project)
**Action:**
- @sisyphus drafts the plan.
- @giuzu **MUST** stamp the plan with "Strategic Approval" before any code is written.

---

## ⛔ "DEFINITION OF DONE" (DoD)

A task is ONLY `Done` when:
1. `npm test` passes.
2. `npm run lint` passes.
3. **@reviewer has commented "APPROVED".**
4. **@giuzu has not vetoed.**

*Any agent creating a "Done" card without this chain is in violation of protocol.*
