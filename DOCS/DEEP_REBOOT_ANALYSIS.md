# 🧠 DEEP ROOT CAUSE ANALYSIS: HIERARCHY & RESILIENCE RESTORED

## 🚨 The Situation
The user identified that the previous "Deep Discovery" fix was flawed (it would scan stagnant projects) and that the "Stall-Breaker" felt like a band-aid that led to "false negatives" (aborting valid work). They also noted that MAIA felt weaker than Sisyphus on the Kanban board.

## 🕵️ Refined Root Cause & Fixes

### 1. The Power Dynamic (MAIA vs. Sisyphus)
**Observation:** MAIA wasn't flowing better than Sisyphus because she was trying to *be* Sisyphus.
**The Fix:** I have redefined the relationship in their DNA (`.opencode/agents/*.md`):
- **MAIA (Supreme):** She owns the **INTENT** and **VISION**. She interacts with the user and delegates the "Execution Plan" to Sisyphus.
- **Sisyphus (PM):** He owns the **BOARD**. He translates MAIA's intent into 3-5 granular cards and manages the team.
- **Result:** MAIA is "Strategy", Sisyphus is "Logistics". They are now complementary, not redundant.

### 2. Project Anchoring (No More Guessing)
**Observation:** "Scanning all projects" is useless if they are all stale.
**The Fix:** MAIA is now **HARD-ANCHORED** to the `MAIA opencode` project (`62f05a9c-1c5a-4041-b4ae-2f98882af10b`) as her default context. She will only switch if explicitly told. This eliminates the "floating ghost" behavior.

### 3. Resilient Context Recovery (Not Just a "Breaker")
**Observation:** "Aborting" is dangerous.
**The Fix:** I rebranded the "Stall-Breaker" to **"Resilient Context Recovery"**.
- If a tool hangs (>10s), MAIA does **not** give up.
- She pivots to **"Hard Truths"**: `git log` (what was committed?) and `STATUS.md` (what was claimed?).
- This ensures she maintains momentum based on *Code Reality*, not *Tool Flakiness*.

## 🛠️ The New Protocol
**User** → **MAIA** ("We need X") → **Sisyphus** (Creates Cards for X) → **Team** (Executes X) → **MAIA** (Verifies X).

## ✅ NEXT STEPS
1.  **Run MAIA**: She behaves like a CEO now.
2.  **Watch Sisyphus**: If you ask for a website build, Sisyphus will populate the board.
3.  **No More Loops**: MAIA will read the Git log if the session reader hangs, ensuring zero downtime.
