#!/bin/bash
# 🚀 MAIA FAST-TRACK: Smart Routing Helper
# Usage: ./fasttrack.sh "task description" <confidence_score>
# Confidence: 0-100 (95+ = fast-track, <95 = send to reviewer)

TASK="$1"
CONFIDENCE="${2:-0}"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fast-track threshold
THRESHOLD=95

if [[ $CONFIDENCE -ge $THRESHOLD ]]; then
    echo -e "${GREEN}🚀 FAST-TRACK APPROVED${NC}"
    echo "Task: $TASK"
    echo "Confidence: $CONFIDENCE% (≥$THRESHOLD%)"
    echo "Action: Moving directly to DONE"
    
    # If vibe-kanban is running, update the task
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:62601 2>/dev/null | grep -q "200"; then
        echo "📋 Vibe Kanban: Would update task status here"
        # TODO: Add actual API call when vibe-kanban supports it
    fi
    
    exit 0
else
    echo -e "${YELLOW}🔎 REVIEW REQUIRED${NC}"
    echo "Task: $TASK"
    echo "Confidence: $CONFIDENCE% (<$THRESHOLD%)"
    echo "Action: Routing to @reviewer for validation"
    
    exit 1
fi
