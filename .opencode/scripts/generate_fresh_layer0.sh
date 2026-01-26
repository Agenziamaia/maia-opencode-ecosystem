#!/bin/bash

# 🧬 MAIA LAYER 0 PROTOCOL
# EXTRACTS: Universal Intelligence (Brain, Agents, Configs)
# TARGET: Desktop/MAIA_Layer0_v[DATE].[VERSION]
# USAGE: ./generate_fresh_layer0.sh [custom_name]

SOURCE_ROOT="/Users/g/Desktop/MAIA opencode"
BASE_DATE=$(date +%Y-%m-%d)
BASE_NAME="MAIA_Layer0_v${BASE_DATE}"

# 1. VERSIONING LOGIC
if [ -z "$1" ]; then
    # Auto-increment
    TARGET_NAME="${BASE_NAME}"
    COUNTER=1
    
    # Check if folder exists, if so, increment
    if [ -d "/Users/g/Desktop/${TARGET_NAME}" ]; then
        TARGET_NAME="${BASE_NAME}.${COUNTER}"
        while [ -d "/Users/g/Desktop/${TARGET_NAME}" ]; do
            COUNTER=$((COUNTER + 1))
            TARGET_NAME="${BASE_NAME}.${COUNTER}"
        done
    fi
else
    TARGET_NAME="$1"
fi

TARGET_DIR="/Users/g/Desktop/$TARGET_NAME"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧬 INITIATING LAYER 0 PROTOCOL"
echo "📂 TARGET: $TARGET_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 2. CREATE SHELL
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/PROJECTS"
mkdir -p "$TARGET_DIR/UNIVERSAL"
mkdir -p "$TARGET_DIR/ARCHIVE"
mkdir -p "$TARGET_DIR/src" # For compatibility

# 3. TRANSPLANT THE BRAIN (Intelligence)
echo "🧠 Transplanting Intelligence..."
mkdir -p "$TARGET_DIR/.opencode"

# Copy Agents
rsync -av --exclude="*.bak" \
    "$SOURCE_ROOT/.opencode/agents/" "$TARGET_DIR/.opencode/agents/"

# Copy Giuzu (The Core)
rsync -av "$SOURCE_ROOT/.opencode/giuzu-training/" "$TARGET_DIR/.opencode/giuzu-training/"

# Copy UNIVERSAL (The Capabilities) - Explicitly copy the Source of Truth
rsync -av "$SOURCE_ROOT/UNIVERSAL/" "$TARGET_DIR/UNIVERSAL/"

# RE-WIRE CONSCIOUSNESS (Recreate Symlinks in Target)
# Because we copy the source files to UNIVERSAL, we must link them back to .opencode for the system to find them.
ln -s ../UNIVERSAL/skills "$TARGET_DIR/.opencode/skills"
ln -s ../UNIVERSAL/tools "$TARGET_DIR/.opencode/tools"
ln -s ../UNIVERSAL/context "$TARGET_DIR/.opencode/context"


# Copy Scripts (Recursive Capability)
rsync -av "$SOURCE_ROOT/.opencode/scripts/" "$TARGET_DIR/.opencode/scripts/"

# Copy Commands (Natural Language Capability)
rsync -av --exclude="*.bak" \
    "$SOURCE_ROOT/.opencode/commands/" "$TARGET_DIR/.opencode/commands/"

# 4. TRANSPLANT CONFIG (The DNA)
echo "🧬 Replicating Configuration..."
cp "$SOURCE_ROOT/opencode.json" "$TARGET_DIR/"
cp "$SOURCE_ROOT/WAKEUP.sh" "$TARGET_DIR/"
cp "$SOURCE_ROOT/README.md" "$TARGET_DIR/"
cp "$SOURCE_ROOT/package.json" "$TARGET_DIR/"
cp "$SOURCE_ROOT/tsconfig.json" "$TARGET_DIR/" 2>/dev/null || true # If exists
cp -r "$SOURCE_ROOT/CONFIG" "$TARGET_DIR/" 2>/dev/null || true # If exists

# 5. SANITIZE (Remove Bloat)
echo "🧹 Sanitizing Consciousness..."
# No logs, no sessions, no history
rm -rf "$TARGET_DIR/.opencode/sessions"
rm -rf "$TARGET_DIR/.opencode/metrics.json"

# 6. INITIALIZE
echo "📝 Creating Manifest..."
cat <<EOF > "$TARGET_DIR/LAYER0_MANIFEST.md"
# MAIA LAYER 0 (Seed v${TIMESTAMP}.${COUNTER})

**Generated from:** $SOURCE_ROOT
**Date:** $(date)

## What is this?
This is a distilled 'Layer 0' of the MAIA ecosystem.
It contains the Universal Intelligence (Agents, Giuzu, Skills) but none of the project mess.

## How to use?
1. \`npm install\`
2. \`bash WAKEUP.sh\`
3. Start building in \`src/\` or \`PROJECTS/\`.
EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LAYER 0 PROTOCOL COMPLETE."
echo "   New Entity: $TARGET_DIR"
echo "   Status: CLEAN & UPGRADED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
