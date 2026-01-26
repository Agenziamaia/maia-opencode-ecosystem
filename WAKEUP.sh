#!/bin/bash

# 🏁 MAIA ECOSYSTEM: DEFINITIVE WAKEUP & INIT PROTOCOL 2026-01-26
# Consolidated from: auto-init.sh, WAKEUP_MAIA.sh, and WAKEUP_OPENCODE.txt

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
    AGENT_COUNT=$(ls .opencode/agents/*.md 2>/dev/null | wc -l)
    echo "✅ Local Brain: ACTIVE ($AGENT_COUNT agents loaded)"
    
    # Check Giuzu V2
    if [ -f ".opencode/giuzu-training/brain.md" ]; then
        echo "✅ Giuzu V2: ONLINE (Unified Brain detected)"
    fi
else
    echo "❌ CRITICAL: .opencode/ directory missing! System lobotomized."
fi

# 4. FINAL HEALTH CHECK
echo "⏳ Waiting for Engine Readiness..."
for i in {1..5}; do
    sleep 1
    if curl -s -o /dev/null -w "" http://localhost:$VIBE_PORT 2>/dev/null; then
        echo "✅ Vibe Kanban: LIVE"
        break
    fi
done

# 5. THE MANIFESTO (Visual Status - Matches opencode.json)
echo ""
echo "=== MODEL MATRIX (14 AGENTS) ==="
echo "CORE ENGINE:      GLM-4.7 (Paid)       → maia, sisyphus, coder, ops, reviewer"
echo "RESEARCH:         GEMINI-2.5-PRO       → researcher, maia_premium"
echo "FAST INTEL:       GEMINI-2.5-FLASH     → researcher_fast, opencode, starter, librarian"
echo "VISION:           GEMINI-2.0-FLASH     → vision (native multimodal)"
echo "REASONING:        DEEPSEEK-R1 (Free)   → giuzu (strategic clone)"
echo "AUTOMATION:       QWEN-2.5-CODER       → workflow (n8n/flowise)"
echo ""
echo "=== AGENTS (14) ==="
echo "@maia, @sisyphus, @coder, @ops, @researcher, @researcher_fast, @reviewer, @vision, @giuzu, @workflow, @opencode, @starter, @librarian, @maia_premium"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ECOSYSTEM READY. ACTION: /init triggered via terminal."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 6. UPDATE STATUS.MD (Living Document Auto-Sync)
sed -i '' "s/^\*\*Last Updated:\*\*.*/\*\*Last Updated:\*\* $(date '+%Y-%m-%d %H:%M')/" STATUS.md 2>/dev/null || true

# 7. TRIGGER AGENTIC INIT (Always runs to ensure context is fresh)
opencode run "@maia initialize the board and check for success patterns" --log-level ERROR > /dev/null 2>&1 &

