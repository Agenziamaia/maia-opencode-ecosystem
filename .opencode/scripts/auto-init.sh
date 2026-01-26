#!/bin/bash
# MAIA Auto-Initialization Script
# This script is called by MAIA/Sisyphus on session start to bootstrap the environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VIBE_PORT=62601

echo "🚀 MAIA Auto-Initialization Starting..."

# Step 1: Load environment variables
if [ -f "$PROJECT_ROOT/../.env" ]; then
    echo "📦 Loading .env from project root..."
    export $(grep -v '^#' "$PROJECT_ROOT/../.env" | xargs)
elif [ -f "$HOME/.config/opencode/.env" ]; then
    echo "📦 Loading .env from global config..."
    export $(grep -v '^#' "$HOME/.config/opencode/.env" | xargs)
else
    echo "⚠️ No .env found - API keys may not be available"
fi

# Step 2: Check if Vibe Kanban is already running
check_vibe_running() {
    if lsof -i :$VIBE_PORT >/dev/null 2>&1; then
        return 0  # Running
    else
        return 1  # Not running
    fi
}

# Step 3: Start Vibe Kanban if not running
start_vibe_kanban() {
    echo "🔄 Starting Vibe Kanban on port $VIBE_PORT..."
    
    # Kill any zombie processes
    pkill -f "vibe-kanban" 2>/dev/null || true
    sleep 1
    
    # Start fresh
    PORT=$VIBE_PORT HOST=127.0.0.1 npx -y vibe-kanban@latest &
    
    # Wait for startup
    echo "⏳ Waiting for Vibe Kanban to start..."
    for i in {1..10}; do
        sleep 1
        if curl -s -o /dev/null -w "" http://localhost:$VIBE_PORT 2>/dev/null; then
            echo "✅ Vibe Kanban is running on http://localhost:$VIBE_PORT"
            return 0
        fi
    done
    
    echo "❌ Vibe Kanban failed to start within 10 seconds"
    return 1
}

# Step 4: Verify HTTP response
verify_vibe_kanban() {
    local status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$VIBE_PORT 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# Main execution
main() {
    if check_vibe_running; then
        if verify_vibe_kanban; then
            echo "✅ Vibe Kanban already running and healthy on http://localhost:$VIBE_PORT"
        else
            echo "⚠️ Vibe Kanban process exists but unhealthy, restarting..."
            start_vibe_kanban
        fi
    else
        start_vibe_kanban
    fi
    
    # Report status
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 MAIA ENVIRONMENT READY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Vibe Kanban: http://localhost:$VIBE_PORT"
    echo "🔑 API Keys: $([ -n "$OPENROUTER_API_KEY" ] && echo "Loaded" || echo "Missing")"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main "$@"
