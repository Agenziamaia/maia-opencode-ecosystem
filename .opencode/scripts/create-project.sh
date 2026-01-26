#!/bin/bash
# MAIA Project Creation Script
# Usage: ./create-project.sh <template-name> <project-name>

set -e

MAIA_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
TEMPLATES_DIR="$MAIA_ROOT/.opencode/project-templates"

# Display usage
function usage() {
    echo "MAIA Project Creation Script"
    echo "=========================="
    echo ""
    echo "Usage: $0 <template-name> <project-name>"
    echo ""
    echo "Available templates:"
    ls -1 "$TEMPLATES_DIR" 2>/dev/null | sed 's/^/  - /' || echo "  (No templates found)"
    echo ""
    echo "Examples:"
    echo "  $0 whatsapp-agentic-bot my-hotel-bot"
    echo "  $0 maia-layer0 my-new-app"
    echo ""
}

# Check arguments
if [ $# -lt 2 ]; then
    usage
    exit 1
fi

TEMPLATE_NAME=$1
PROJECT_NAME=$2
TEMPLATE_PATH="$TEMPLATES_DIR/$TEMPLATE_NAME"
PROJECT_PATH="$(pwd)/$PROJECT_NAME"

# Check if template exists
if [ ! -d "$TEMPLATE_PATH" ]; then
    echo "❌ Template '$TEMPLATE_NAME' not found in $TEMPLATES_DIR"
    echo ""
    usage
    exit 1
fi

# Check if project directory already exists
if [ -d "$PROJECT_PATH" ]; then
    echo "❌ Directory '$PROJECT_NAME' already exists"
    exit 1
fi

echo "🚀 Creating project: $PROJECT_NAME"
echo "   Template: $TEMPLATE_NAME"
echo "   Source: $TEMPLATE_PATH"
echo "   Target: $PROJECT_PATH"
echo ""

# Copy template files
echo "📋 Copying template files..."
cp -r "$TEMPLATE_PATH" "$PROJECT_PATH"

# Initialize git repository
echo "📦 Initializing git repository..."
cd "$PROJECT_PATH"
git init
git add .
git commit -m "Initial commit from MAIA template: $TEMPLATE_NAME"

echo ""
echo "✅ Project created successfully!"
echo ""
echo "Next steps:"
echo "  cd $PROJECT_NAME"
echo "  [Review and configure .env]"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "MAIA commands:"
echo "  opencode run init        # Initialize MAIA"
echo "  opencode run plan \"task\" # Plan new features"
echo ""
