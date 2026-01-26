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

# 2. UNIVERSAL STRATEGY SYNC (Brain Sync)
# This is safe to run repeatedly; it just refreshes logic.
echo "🧠 Synchronizing Universal Brain (Layer 0)..."
if [ -f "layer0/.opencode/scripts/strategy_sync.py" ]; then
    python3 "layer0/.opencode/scripts/strategy_sync.py" > /dev/null
    
    # COUNT SUCCESS PATTERNS
    PATTERN_COUNT=$(find layer0/.opencode/context/success_patterns -type f 2>/dev/null | wc -l)
    echo "✅ Universal Strategy: ACTIVE"
    echo "💎 Success Vault: Found $PATTERN_COUNT Universal Patterns"
else
    echo "⚠️ layer0/ not found. Running in standalone production mode."
fi

# 3. AGENT DEFINITION GENERATION (Inside-Out Build)
if [ ! -f "AGENTS.md" ]; then
    echo "📝 Generating AGENTS.md from Universal Layer..."
    cat layer0/.opencode/agents/*.md > AGENTS.md 2>/dev/null
    echo "✅ AGENTS.md Created from Layer 0 Templates"
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

# 5. THE MANIFESTO (Visual Status)
echo ""
echo "=== MODEL MATRIX ==="
echo "CORE ENGINE:      GLM-4.7 (Paid)       → maia, coder, ops, opencode"
echo "RESEARCH:         GEMINI-2.5-PRO       → researcher (deep context)"
echo "REVIEWER:         BIG-PICKLE (Free)    → reviewer (no mercy audits)"
echo "VISION:           GEMINI-2.0-FLASH     → vision (dedicated vision path)"
echo "CLONE:            BIG-PICKLE (Free)    → giuzu (giulio's brain)"
echo "PREMIUM:          GEMINI-2.5-PRO       → maia_premium (complex reasoning)"
echo ""
echo "=== AGENTS (12+) ==="
echo "@maia, @coder, @ops, @researcher, @researcher_fast, @reviewer, @vision, @giuzu, @workflow, @starter, @opencode, @maia_premium"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ECOSYSTEM READY. ACTION: /init triggered via terminal."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 6. TRIGGER AGENTIC INIT (Always runs to ensure context is fresh)
opencode run "@maia initialize the board and check for success patterns" --log-level ERROR > /dev/null 2>&1 &
