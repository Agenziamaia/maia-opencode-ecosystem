# 📉 DE-BLOAT & CONNECTIVITY PLAN

## 1. Documentation Pruning (Context Bloat)
**Problem:** 8,500+ lines of documentation. MAIA loads 700+ lines of just her own profile.
**Action:**
- **Consolidate:** Merge `LIVING_ECOSYSTEM_ANALYSIS.md`, `ARCHITECTURE_ANALYSIS.md`, and `STRATEGIC_INTELLIGENCE_PACKAGE.md` into `DOCS/ARCHIVE/`.
- **Streamline:** Create a single, high-level `ECOSYSTEM_MAP.md` (max 100 lines) for agents to read.
- **Reference:** Move deep analyses to the "Library" (to be read *only* on demand, not pre-loaded).

## 2. The Broken "Review" Chain
**Problem:** The `@reviewer` agent is "fake".
- **Current State:** Has `read`, `grep`, `lsp`. Can only "look" at code locally.
- **Missing:** Cannot Comment on PRs (`github_comment_pr`), Cannot Request Changes (`github_request_changes`), Cannot Merge (`github_merge`).
- **Fix:** Bind the `github` MCP tools (which `@github` has) to `@reviewer`.

## 3. The Broken "Deploy" Chain
**Problem:** The `@ops` agent relies on `bash`.
- **Fix:** Create a formal `deploy_pipeline` workflow in `opencode.json` (using Vercel CLI or Docker compose) and give `@ops` a dedicated tool to trigger it safely.

## 4. Knowledge Retrieval (The "Look Up" Gap)
**Problem:** Agents are "guessing" or reading 50 files.
**Fix:**
- **Active RAG:** Ensure `semantic_search.py` is available as a tool `knowledge_query(query)`.
- **Protocol:** Update `maia.md` to use `knowledge_query` instead of `read_file` for broad questions.

## 5. Execution Order
1.  **De-Bloat:** Move files to `ARCHIVE`.
2.  **Re-Wire:** Update `reviewer.md` with `github_*` tools.
3.  **Enable RAG:** Add `knowledge_query` to `maia.md` tools.
4.  **Verify:** Run a full "Code -> Review" cycle.
