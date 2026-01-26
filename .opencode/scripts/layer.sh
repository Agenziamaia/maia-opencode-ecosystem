#!/bin/bash
# .opencode/scripts/layer.sh
# Universal Layer Replication Script

TARGET_DIR=$1

if [ -z "$TARGET_DIR" ]; then
    echo "Usage: npm run layer <new_project_path>"
    exit 1
fi

echo "🧬 MAIA: Replicating Layer0 to $TARGET_DIR..."

mkdir -p "$TARGET_DIR"

# Sync the Agency Core
rsync -av --progress .opencode "$TARGET_DIR/" --exclude node_modules
rsync -av --progress opencode.json "$TARGET_DIR/"
rsync -av --progress package.json "$TARGET_DIR/"

echo "✅ Layer0 Replicated. God Mode Active in $TARGET_DIR."
