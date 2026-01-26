#!/bin/bash
# .opencode/scripts/init.sh
# Universal Init Script called by npm run init

echo "⚡ MAIA: Initializing Reality..."

# 1. Check for opencode CLI
if ! command -v opencode &> /dev/null; then
    echo "❌ Error: 'opencode' CLI not found. Please install it."
    exit 1
fi

# 2. Trigger the Agentic Init
# This calls the /init command defined in .opencode/commands/init.md
opencode run init

echo "✅ Initialization sequence triggered."
