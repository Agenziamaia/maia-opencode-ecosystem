#!/bin/bash

echo "=========================================="
echo "MAIA Skills Demo - Quick Start"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "Starting development server..."
echo "Open http://localhost:3000 in your browser"
echo ""

npm run dev
