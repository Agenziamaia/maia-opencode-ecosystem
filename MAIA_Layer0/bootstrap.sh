#!/bin/bash
# MAIA Layer0 - God Mode Bootstrap
# Usage: ./bootstrap.sh <new_project_name>

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./bootstrap.sh <new_project_name>"
  exit 1
fi

echo "⚡ MAIA Layer0: Injecting God Mode into $PROJECT_NAME..."

mkdir -p "$PROJECT_NAME"
cp -r .opencode "$PROJECT_NAME/"
cp opencode.json "$PROJECT_NAME/"
cp package.json "$PROJECT_NAME/"

echo "✅ God Mode Injected."
echo "👉 cd $PROJECT_NAME"
echo "👉 opencode"
