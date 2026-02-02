#!/bin/bash

# 🏁 MAIA ECOSYSTEM: DREAM TEAM WAKEUP PROTOCOL (2026-01-29)
# Matches the "Optimized Dream Team" 20-agent roster

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 WAKEUP GOD MODE. SYSTEM STATUS: INITIALIZING..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Configuration (can be overridden via environment)
VIBE_PORT=${VIBE_KANBAN_PORT:-62601}
VIBE_HOST=${VIBE_KANBAN_HOST:-127.0.0.1}

# 1. SMART DEPENDENCY LOADER (Lazy Load Repos)
echo "📦 Verifying Ecosystem Dependencies..."
npx -y tsx .opencode/ecosystem/setup_ecosystem.ts || echo "⚠️ Dependency check failed (non-critical)"

# 2. SMART CHECK (Idempotency + Fix)
if lsof -i :$VIBE_PORT >/dev/null 2>&1; then
    if curl -s -o /dev/null -w "%{http_code}" http://$VIBE_HOST:$VIBE_PORT | grep -q "200"; then
        echo "✅ Vibe Kanban: ALREADY LIVE (Standard Port $VIBE_PORT)"
    else
        echo "⚠️ Vibe Kanban Unhealthy (Zombie on $VIBE_PORT). Restarting..."
        lsof -ti :$VIBE_PORT | xargs kill -9 2>/dev/null || true
        pkill -f "vibe-kanban" || true
        sleep 2
        VIBE_PORT=$VIBE_PORT HOST=$VIBE_HOST npx -y vibe-kanban@latest > /dev/null 2>&1 &
        echo "🔄 Vibe Kanban Restarted on Port $VIBE_PORT"
    fi
else
    echo "📋 Starting Vibe Kanban on Standard Port $VIBE_PORT..."
    VIBE_PORT=$VIBE_PORT HOST=$VIBE_HOST npx -y vibe-kanban@latest > /dev/null 2>&1 &
fi

# 2. BRAIN CHECK (Local Intelligence)
echo "🧠 Verifying Local Brain..."
if [ -d ".opencode" ]; then
    AGENT_COUNT=$(ls .opencode/agents/*.md 2>/dev/null | grep -v "README" | wc -l)
    echo "✅ Local Brain: ACTIVE ($AGENT_COUNT agents loaded)"
else
    echo "❌ CRITICAL: .opencode/ directory missing! System lobotomized."
fi

# 2c. ECOSYSTEM MCP SERVER (Auto-start)
echo "🔧 Starting Ecosystem MCP Server..."
ECOSYSTEM_PID=$(lsof -ti :62603 2>/dev/null || echo "")
if [ ! -z "$ECOSYSTEM_PID" ]; then
    echo "✅ Ecosystem MCP Server: ALREADY RUNNING (PID: $ECOSYSTEM_PID)"
else
    # Start ecosystem MCP server in background
    nohup npx -y tsx .opencode/ecosystem/server.ts > logs/ecosystem-mcp.log 2>&1 &
    echo "✅ Ecosystem MCP Server: STARTED on stdio"
fi

# 2d. HEALTH CHECK SERVER (Auto-start)
echo "🏥 Starting Health Check Server..."
HEALTH_PID=$(lsof -ti :62602 2>/dev/null || echo "")
if [ ! -z "$HEALTH_PID" ]; then
    echo "✅ Health Check Server: ALREADY RUNNING (PID: $HEALTH_PID)"
else
    # Start health check server in background
    nohup node ecosystem/health/health-server.js > logs/health-server.log 2>&1 &
    echo "✅ Health Check Server: STARTED on port 62602"
fi

# 2b. BROWSER HYDRATION (Auto-Install)
# Ensures 'browser-use' works on new machines (Linux/VPS) without manual setup.
if [ -d ".opencode/mcp-browser" ]; then
    echo "🦅 Verifying Browser Agent..."
    if [ ! -d ".opencode/mcp-browser/.venv" ]; then
        echo "   🛠️  Hydrating Browser Engine (First Run found)..."
        (cd .opencode/mcp-browser && uv sync) >/dev/null 2>&1
        echo "   ✅ Browser Engine Installed."
    else
        echo "   ✅ Browser Engine Ready."
    fi
fi

# 3. WAITING FOR ENGINE
echo "⏳ Waiting for Engine Readiness..."
for i in {1..5}; do
    sleep 1
    if curl -s -o /dev/null -w "" http://$VIBE_HOST:$VIBE_PORT 2>/dev/null; then
        echo "✅ Vibe Kanban: LIVE"
        # 4a. DISPLAY ACTIVE TASKS (Actually USE the kanban)
        echo ""
        echo "=== 📋 ACTIVE KANBAN TASKS ==="
        PROJECTS_JSON=$(curl -s "http://$VIBE_HOST:$VIBE_PORT/api/projects" 2>/dev/null)
        PROJECT_IDS=$(echo "$PROJECTS_JSON" | python3 -c "import sys, json; data = json.load(sys.stdin); print(' '.join([p['id'] for p in data.get('data', [])]))" 2>/dev/null)
        
        if [ ! -z "$PROJECT_IDS" ]; then
            for P_ID in $PROJECT_IDS; do
                P_NAME=$(echo "$PROJECTS_JSON" | python3 -c "import sys, json; data = json.load(sys.stdin); id = '$P_ID'; print([p['name'] for p in data.get('data', []) if p['id'] == id][0])" 2>/dev/null)
                echo "📍 Project: $P_NAME ($P_ID)"
                curl -s "http://$VIBE_HOST:$VIBE_PORT/api/tasks?project_id=$P_ID" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tasks = data.get('data', [])
    active = [t for t in tasks if t.get('status') not in ['done', 'completed']][:3]
    if not active:
        print('    (No active tasks)')
    for t in active:
        status = t.get('status', 'todo').upper()
        title = t.get('title', 'Untitled')[:50]
        print(f'    [{status:10}] {title}')
except:
    print('    (Could not fetch tasks)')
" 2>/dev/null
            done
        else
            echo "  (No projects found)"
        fi
        break
    fi
done

# 4. THE MANIFESTO (Visual Status - Dream Team)
echo ""
echo "=== DREAM TEAM ROSTER (20 AGENTS) ==="
echo "👑 GLM-4.7 (PAID)      → maia, sisyphus, coder, ops, oracle, sisyphus_junior, workflow, frontend, github"
echo "⚡ GEMINI FLASH (FAST) → researcher, opencode, starter, librarian, explore"
echo "🧠 DEEPSEEK R1 (THINK) → giuzu, prometheus"
echo "📚 GEMINI PRO (DEEP)   → researcher_deep, maia_premium, reviewer"
echo "👁️ VISION              → vision (Gemini 2.0)"
echo ""
echo "=== PORT ALLOCATION ==="
echo "🔗 Port 62601 → Vibe Kanban (Task Management)"
echo "🔗 Port 62602 → Health Check Server (Monitoring)"
echo "🔗 Port 62603 → Ecosystem MCP (Tools & Orchestration)"
echo "🔗 Port 3000  → Flowise (Automation, optional)"
echo ""
echo "=== CHAIN OF COMMAND ==="
echo "USER → @maia (Supreme) → @sisyphus (PM) → His Team (@prometheus, @oracle, @frontend...)"
echo "                      ↳ @giuzu (Strategy)"
echo "                      ↳ @coder/@ops/@workflow (Execution)"
echo ""

# 5. QUICK HEALTH CHECK
echo "=== PROVIDER HEALTH ==="
if [ -f ".opencode/scripts/health_check.py" ]; then
    python3 .opencode/scripts/health_check.py 2>/dev/null || echo "⚠️ Health check failed to run"
else
    echo "⚠️ .opencode/scripts/health_check.py not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ECOSYSTEM READY. Run '/init' to restart at any time."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 6. UPDATE STATUS.MD
sed -i '' "s/^\*\*Last Updated:\*\*.*/\*\*Last Updated:\*\* $(date '+%Y-%m-%d %H:%M')/" STATUS.md 2>/dev/null || true
