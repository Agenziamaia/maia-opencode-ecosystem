#!/bin/bash
# Wrapper to run python scripts in the gym venv
# Usage: ./run.sh script.py [args]

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_PYTHON="$DIR/.venv/bin/python3"

if [ ! -f "$VENV_PYTHON" ]; then
    echo "Error: Virtual environment not found at $DIR/.venv"
    echo "Please run: /opt/homebrew/bin/python3.12 -m venv .opencode/gym/.venv && .opencode/gym/.venv/bin/pip install agentlightning"
    exit 1
fi

"$VENV_PYTHON" "$@"
