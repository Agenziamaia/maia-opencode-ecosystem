#!/bin/bash
# Wrapper to start browser-use MCP from the project root
# Fixes 'cwd' property not being allowed in opencode.json

# Resolve the absolute path of the script directory
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$DIR/../mcp-browser"

# Check if uv exists
UV_BIN="/Users/g/.local/bin/uv"
if [ ! -f "$UV_BIN" ]; then
    echo "Error: uv not found at $UV_BIN" >&2
    exit 1
fi

# Go to the directory and run
cd "$TARGET_DIR" || exit 1
exec "$UV_BIN" run server.py
