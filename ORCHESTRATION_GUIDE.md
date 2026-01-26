# 🎯 MAIA Multi-Agent Orchestration: The Complete Guide

**Purpose**: Fix the broken orchestration flow so agents don't hang, switch automatically, and keep work moving.

---

## 1. What Are These Plugins?

### `opencode-sessions` Plugin
**Function**: Enables agents to communicate with each other via **session modes**.

| Mode | Purpose | Use Case |
| :--- | :--- | :--- |
| **`message`** | Send context to another agent | "Here's research findings, now implement" |
| **`fork`** | Create parallel exploration branches | "Try microservices AND monolith, compare" |
| **`new`** | Start fresh session for agent | "Begin new task with clean slate" |

### `oh-my-opencode` Plugin
**Function**: Transforms your single-agent setup into a **multi-agent system**.

| Feature | Purpose |
| :--- | :--- |
| **Agent aliases** | Map friendly names to agents (e.g., `frontend` → `@coder`) |
| **MCP integration** | Connect external tools (Vibe Kanban, Context7, etc.) |
| **Session tools** | List, read, search across all agent sessions |

### `vibe-kanban` MCP Server
**Function**: Visual **Kanban board** for tracking tasks across agents.

| Tool | Purpose |
| :--- | :--- |
| `vibe_kanban_create_task` | Create new task in TO DO column |
| `vibe_kanban_list_tasks` | See all tasks and their status |
| `vibe_kanban_update_task` | Move task between columns |
| `vibe_kanban_get_task` | Get task details for handoff |

---

## 2. The Problem You Experienced

### What Went Wrong

```
User Request → MAIA delegates to @researcher → @researcher HANGS (model issue)
                                                      ↓
                                               MAIA WAITS FOREVER
                                               (no timeout, no failover)
                                                      ↓
                                               USER FRUSTRATED
```

### Root Causes

1. **No Health Checks**: MAIA didn't verify agents were alive before delegating
2. **No Timeout**: When an agent call didn't return, MAIA waited indefinitely
3. **No Failover**: When one model failed, no automatic switch to backup
4. **Broken Models**: `:free` suffix caused 404 errors you didn't see

---

## 3. The Fix: Resilient Orchestration Protocol

### Pre-Flight Check (Before Delegating)

```javascript
// BEFORE firing any subagent, MAIA should:
async function healthCheck(agentName) {
  const startTime = Date.now();
  const timeout = 30000; // 30 seconds max
  
  try {
    // Send a simple ping
    const response = await session({
      mode: "message",
      agent: agentName,
      text: "HEALTH_CHECK: Respond with 'OK' if operational.",
      timeout: timeout
    });
    
    if (response && response.includes("OK")) {
      return { status: "alive", agent: agentName };
    }
  } catch (error) {
    return { status: "dead", agent: agentName, error: error.message };
  }
  
  return { status: "timeout", agent: agentName };
}
```

### Failover Strategy

```javascript
// Agent fallback configuration
const AGENT_FALLBACKS = {
  "researcher": ["researcher_fast", "maia"],  // If researcher fails, try flash, then self
  "coder": ["maia", "ops"],                    // If coder fails, try maia, then ops
  "ops": ["coder", "maia"],                    // If ops fails, try coder, then maia
  "reviewer": ["maia", "coder"],               // If reviewer fails, try maia, then coder
  "workflow": ["coder", "maia"],               // If workflow fails, try coder, then maia
  "giuzu": ["coder", "maia"],                  // If giuzu fails, try coder, then maia
  "vision": ["researcher_fast", "maia"],       // If vision fails, try flash, then maia
};

async function delegateWithFallback(taskType, context) {
  const primaryAgent = TASK_TO_AGENT[taskType];
  const fallbacks = AGENT_FALLBACKS[primaryAgent] || ["maia"];
  
  const agentsToTry = [primaryAgent, ...fallbacks];
  
  for (const agent of agentsToTry) {
    const health = await healthCheck(agent);
    
    if (health.status === "alive") {
      console.log(`✅ Delegating to @${agent}`);
      return await delegateTask(agent, context);
    } else {
      console.log(`⚠️ @${agent} unavailable (${health.status}), trying next...`);
    }
  }
  
  // All agents failed - notify user
  throw new Error(`All agents failed for ${taskType}. Manual intervention required.`);
}
```

### Timeout Wrapper

```javascript
// Wrap ALL agent calls with timeout
async function delegateWithTimeout(agent, prompt, timeoutMs = 120000) {
  return Promise.race([
    session({ mode: "message", agent: agent, text: prompt }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`@${agent} timed out after ${timeoutMs/1000}s`)), timeoutMs)
    )
  ]);
}
```

---

## 4. Updated MAIA Protocol

### New Initialization Sequence

```
/init triggers:

1. START VIBE KANBAN
   └─ PORT=62601 HOST=127.0.0.1 npx vibe-kanban &
   └─ Verify HTTP 200 on localhost:62601

2. AGENT HEALTH CHECK (All Agents)
   └─ @coder: PING → OK/FAIL
   └─ @ops: PING → OK/FAIL
   └─ @researcher: PING → OK/FAIL
   └─ @reviewer: PING → OK/FAIL
   └─ @workflow: PING → OK/FAIL
   └─ @giuzu: PING → OK/FAIL
   └─ @vision: PING → OK/FAIL

3. REPORT STATUS
   ┌─────────────────────────────────────────┐
   │ MAIA ECOSYSTEM STATUS                   │
   ├─────────────────────────────────────────┤
   │ ✅ @coder      GLM-4.7         ONLINE   │
   │ ✅ @ops        GLM-4.7         ONLINE   │
   │ ✅ @researcher Gemini-Pro      ONLINE   │
   │ ⚠️ @workflow   Qwen-32B        TIMEOUT  │
   │ ✅ @reviewer   GLM-4.7         ONLINE   │
   │ ✅ @vision     Gemini-Flash    ONLINE   │
   │ ❌ @giuzu      Qwen-32B        OFFLINE  │
   ├─────────────────────────────────────────┤
   │ FALLBACK: @workflow → @coder            │
   │ FALLBACK: @giuzu → @coder               │
   └─────────────────────────────────────────┘

4. READY FOR COMMANDS
```

### New Delegation Flow

```
User: "Research auth patterns, then implement API"

MAIA:
1. Create tasks in Vibe Kanban
   └─ Task 1: "Research auth patterns" (TO DO)
   └─ Task 2: "Implement auth API" (BLOCKED - depends on #1)

2. Check @researcher health → OK
   └─ Delegate Task 1 to @researcher
   └─ Set 2-minute timeout

3. @researcher returns findings
   └─ Update Task 1 → IN REVIEW
   └─ Update Task 2 → TO DO (unblocked)

4. Check @coder health → OK
   └─ Delegate Task 2 to @coder with context from Task 1
   └─ Set 5-minute timeout

5. @coder returns implementation
   └─ Update Task 2 → IN REVIEW

6. Check @reviewer health → OK
   └─ Delegate review to @reviewer
   └─ Set 3-minute timeout

7. @reviewer approves
   └─ Update all tasks → DONE
   └─ Report to user
```

---

## 5. How to Enable This

### Step 1: Update MAIA Profile

Add this to `.opencode/agents/maia.md`:

```markdown
## 🛡️ RESILIENT ORCHESTRATION PROTOCOL

### Before EVERY Delegation

1. **HEALTH CHECK**: Ping the target agent (30s timeout)
2. **FALLBACK READY**: Know which agent to use if primary fails
3. **TIMEOUT SET**: Never wait more than 2 minutes for any single call
4. **STATUS UPDATE**: Report to user what's happening

### If Agent Fails

1. Log: "⚠️ @{agent} not responding, switching to @{fallback}"
2. Try fallback agent
3. If all fail: Ask user for guidance

### Timeouts

| Agent Type | Default Timeout |
| :--- | :--- |
| Health check | 30 seconds |
| Research task | 2 minutes |
| Code task | 5 minutes |
| Review task | 3 minutes |
| Quick query | 1 minute |
```

### Step 2: Start Vibe Kanban Properly

```bash
# Kill any stuck processes
pkill -f "vibe-kanban" || true

# Start fresh
PORT=62601 HOST=127.0.0.1 npx vibe-kanban &

# Verify
sleep 5 && curl -s http://localhost:62601 && echo "✅ Vibe Kanban running"
```

### Step 3: Test the Flow

```bash
# In your terminal, run:
cd /Users/g/Desktop/multiagent-layer0
source .env

# Start OpenCode
opencode

# Run health check
/init
```

---

## 6. Quick Reference Card

### Vibe Kanban Commands

| Action | Command |
| :--- | :--- |
| Start Kanban | `PORT=62601 npx vibe-kanban &` |
| Open Board | http://localhost:62601 |
| Create Task | `vibe_kanban_create_task(...)` |
| Move Task | `vibe_kanban_update_task(...)` |

### Session Modes

| Mode | When to Use |
| :--- | :--- |
| `message` | Pass context to next agent |
| `fork` | Explore alternatives in parallel |
| `new` | Start clean session |

### Agent Fallbacks

| Primary | Fallback 1 | Fallback 2 |
| :--- | :--- | :--- |
| @researcher | @researcher_fast | @maia |
| @coder | @maia | @ops |
| @workflow | @coder | @maia |
| @giuzu | @coder | @maia |
| @vision | @researcher_fast | @maia |

---

## 7. The Vision: What It Should Feel Like

```
You: "Build me a WhatsApp bot with AI responses"

MAIA: 
  📋 Created 4 tasks in Vibe Kanban
  
  🔍 @researcher researching WhatsApp API patterns... (2 min max)
  ✅ Research complete - found: Twilio, WhatsApp Business API, Baileys
  
  🔧 @coder implementing bot with Baileys... (5 min max)
  ✅ Code complete - /src/whatsapp-bot.ts created
  
  🏗️ @ops setting up Docker deployment... (3 min max)
  ✅ Dockerfile and docker-compose.yml ready
  
  🔍 @reviewer checking code quality... (2 min max)
  ✅ Approved with minor suggestions
  
  📦 All tasks DONE. View board: http://localhost:62601
```

No waiting forever. No silent failures. No confusion about what's happening.

---

*This protocol makes your multi-agent system actually work reliably.*
