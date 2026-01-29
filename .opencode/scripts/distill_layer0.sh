#!/bin/bash

# 🧪 LAYER 0 DISTILLATION ENGINE
# Purpose: Extract the "Universal Soul" of the ecosystem into a clean, deployable seed.
# Concept: Workplace (Messy/Evolving) -> Distill -> Layer 0 (Pristine/Golden)

# 1. DEFINE PATHS
SOURCE_ROOT="/Users/g/Desktop/MAIA opencode"
TARGET_LAYER0="$SOURCE_ROOT/layer0"

echo "━ 🧪 DISTILLING ECOSYSTEM INTO LAYER 0 ━━━━━━━━━━━━━━━━━━"

# 2. SYNC "BRAIN" COMPONENTS (Universal Logic)
# We copy ONLY what is needed for a fresh system to have intelligence.

echo "🧠 Extracting Intelligence..."

# A. Agent Personalities
rsync -av --delete \
    "$SOURCE_ROOT/.opencode/agents/" \
    "$TARGET_LAYER0/.opencode/agents/" \
    --exclude="project_specific_*"

# B. Giuzu's Consciousness (The V3 Stack)
rsync -av --delete \
    "$SOURCE_ROOT/.opencode/giuzu-training/" \
    "$TARGET_LAYER0/.opencode/giuzu-training/"

# C. Skills (Universal Capabilities)
rsync -av --delete \
    "$SOURCE_ROOT/.opencode/skills/" \
    "$TARGET_LAYER0/.opencode/skills/" \
    --exclude="unused_*"

# D. Context (Architecture Maps)
# Only copy universal context, not project context
cp "$SOURCE_ROOT/.opencode/context/ARCHITECTURE.md" "$TARGET_LAYER0/.opencode/context/"
cp "$SOURCE_ROOT/.opencode/context/tech-stack.md" "$TARGET_LAYER0/.opencode/context/"
cp "$SOURCE_ROOT/REPOSITORIES.md" "$TARGET_LAYER0/"

# 3. SYNC CONFIGURATION (The Spine)
echo "⚙️  Syncing Configurations..."
cp "$SOURCE_ROOT/opencode.json" "$TARGET_LAYER0/opencode.json"
cp "$SOURCE_ROOT/WAKEUP.sh" "$TARGET_LAYER0/WAKEUP.sh"
cp "$SOURCE_ROOT/AGENTS.md" "$TARGET_LAYER0/AGENTS.md"
cp "$SOURCE_ROOT/MODELS.md" "$TARGET_LAYER0/MODELS.md"

# 4. REMOVE BLOAT (Purification)
echo "🧹 Purifying Layer 0..."
# Ensure Layer 0 doesn't have project code
rm -rf "$TARGET_LAYER0/src/"* 2>/dev/null
# Ensure Layer 0 doesn't have git history of the parent (it has its own)
rm -rf "$TARGET_LAYER0/.git/modules" 2>/dev/null

# 5. COMMIT & PUSH (Publishing)
echo "🚀 Publishing to Universal Remote..."
cd "$TARGET_LAYER0"
git add -A
git commit -m "chore(distill): updated layer0 with latest intelligence from ecosystem $(date +'%Y-%m-%d')"
git push origin main

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LAYER 0 UPDATED."
echo "   The 'Golden Seed' is now in sync with your latest evolution."
echo "   Ready to clone anywhere as a fresh, smart start."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
