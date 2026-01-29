#!/bin/bash

# 🏁 MAIA ECOSYSTEM: DREAM TEAM WAKEUP PROTOCOL (2026-01-29)
# Matches the "Optimized Dream Team" 20-agent roster

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 WAKEUP GOD MODE. SYSTEM STATUS: INITIALIZING..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

VIBE_PORT=62601

# 1. SMART CHECK (Idempotency)
if lsof -i :$VIBE_PORT >/dev/null 2>&1; then
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$VIBE_PORT | grep -q "200"; then
        echo "✅ Vibe Kanban: ALREADY LIVE (Skipping Purge)"
    else
        echo "⚠️ Vibe Kanban Unhealthy. Restarting..."
        pkill -f "vibe-kanban" || true
        sleep 1
        PORT=$VIBE_PORT HOST=127.0.0.1 npx -y vibe-kanban@latest > /dev/null 2>&1 &
    fi
else
    echo "📋 Starting Vibe Kanban on port $VIBE_PORT..."
    PORT=$VIBE_PORT HOST=127.0.0.1 npx -y vibe-kanban@latest > /dev/null 2>&1 &
fi

# 2. BRAIN CHECK (Local Intelligence)
echo "🧠 Verifying Local Brain..."
if [ -d ".opencode" ]; then
    AGENT_COUNT=$(ls .opencode/agents/*.md 2>/dev/null | grep -v "README" | wc -l)
    echo "✅ Local Brain: ACTIVE ($AGENT_COUNT agents loaded)"
else
    echo "❌ CRITICAL: .opencode/ directory missing! System lobotomized."
fi

# 3. WAITING FOR ENGINE
echo "⏳ Waiting for Engine Readiness..."
for i in {1..5}; do
    sleep 1
    if curl -s -o /dev/null -w "" http://localhost:$VIBE_PORT 2>/dev/null; then
        echo "✅ Vibe Kanban: LIVE"
        break
    fi
done

# 4. THE MANIFESTO (Visual Status - Dream Team)
echo ""
echo "=== DREAM TEAM ROSTER (20 AGENTS) ==="
echo "👑 GLM-4.7 (PAID)      → maia, sisyphus, coder, ops, oracle, sisyphus_junior, workflow, frontend, github"
echo "⚡ GEMINI FLASH (FAST) → researcher, opencode, starter, librarian, prometheus, explore, librarian"
echo "🧠 DEEPSEEK R1 (THINK) → giuzu, prometheus"
echo "📚 GEMINI PRO (DEEP)   → researcher_deep, maia_premium"
echo "🥒 BIG PICKLE          → reviewer"
echo "👁️ VISION              → vision (Gemini 2.0)"
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
