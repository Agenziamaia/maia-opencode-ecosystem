# 🧠 DEEP REBOOT ANALYSIS: NERVOUS SYSTEM v2.2 & SHOWCASE ALIGNMENT

## 🚨 The Situation
MAIA was exhibiting "outdated" behavior because her primary Kanban project was empty, while the real action was happening in a new "Showcase" project (`giuzu-test`) created by another agent. Additionally, she was stalling on `session_read` calls because of a potential timeout/hang in the `oh-my-opencode` tool chain.

## 🛠️ Fixes Implemented

### 1. Transparency (WAKEUP.sh)
- **Global Task View**: The `WAKEUP.sh` script now scans **ALL** VibeKanban projects for active tasks. 
- **Bug Fix**: Removed a logic error that reported a "System Lobotomized" error even when `.opencode` was present.

### 2. Stall-Breaker Protocol (maia.md)
- **Timeouts**: MAIA now has a mandate to **ABORT** any tool call (especially `session_read`) that takes more than 10 seconds.
- **Local Fallback**: If a stall occurs, she pivots immediately to `STATUS.md`, `git log`, and local files to maintain momentum.

### 3. Deep Project Discovery
- **Multi-Project Scan**: MAIA will no longer focus on a single empty project. She now knows how to scan all projects to find the "active context" (e.g., the `giuzu-test` project with 30 tasks).

## 🧬 Nervous System v2.2 vs. Showcase Dashboard
The **Nervous System v2.2** (the `.opencode/ecosystem/` MCP server) is the "logic layer". The **Showcase Dashboard** (`src/app/dashboard`) is the "visual layer".
- They are **ALIGNED**. The dashboard uses the same DNA and Council types defined in the v2.2 nervous system.
- The dashboard at `http://localhost:3000/dashboard` (proxied) or the Next.js dev server will visually show the agent statuses and tasks that the nervous system manages.

## 🔗 Port Mapping (FINAL)
- **Port 62601**: Vibe Kanban (The DB/API)
- **Port 3000**: Flowise (Automation)
- **Next.js**: Usually runs on its own port (e.g., 3001) if started, or can be proxied through Flowise/Nginx.

## ✅ NEXT STEPS
1. **Run MAIA**: She should now be responsive, non-stalling, and fully aware of the `giuzu-test` tasks.
2. **Dashboard**: Navigate to the dashboard (once Next.js is started) to see the Living Ecosystem in 17-agent glory.
