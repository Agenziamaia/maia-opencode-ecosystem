#!/usr/bin/env python3
"""
🌐 MAIA SWARM INTELLIGENCE - Collective Learning System
Tracks patterns and insights discovered by ALL agents, creating a shared brain.

This is the creative "side angle" feature - agents learn from each other's successes.

Usage:
  python3 swarm_intel.py --learn "agent" "insight"    # Log a learning
  python3 swarm_intel.py --patterns                   # Show discovered patterns
  python3 swarm_intel.py --recommend "task"           # Get swarm recommendations
  python3 swarm_intel.py --status                     # Show swarm health
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Configuration
DATA_DIR = Path(__file__).parent.parent / 'data'
SWARM_FILE = DATA_DIR / 'swarm_intelligence.json'
PATTERNS_FILE = DATA_DIR / 'discovered_patterns.json'


def ensure_data():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not SWARM_FILE.exists():
        SWARM_FILE.write_text(json.dumps({
            'created': datetime.now().isoformat(),
            'learnings': [],
            'agent_contributions': {},
            'pattern_count': 0
        }, indent=2))
    if not PATTERNS_FILE.exists():
        PATTERNS_FILE.write_text(json.dumps({
            'patterns': [],
            'recommendations': {}
        }, indent=2))


def load_swarm():
    ensure_data()
    return json.loads(SWARM_FILE.read_text())


def save_swarm(data):
    ensure_data()
    SWARM_FILE.write_text(json.dumps(data, indent=2))


def load_patterns():
    ensure_data()
    return json.loads(PATTERNS_FILE.read_text())


def save_patterns(data):
    ensure_data()
    PATTERNS_FILE.write_text(json.dumps(data, indent=2))


def learn(agent: str, insight: str):
    """Log a new learning from an agent"""
    swarm = load_swarm()
    
    learning = {
        'agent': agent,
        'insight': insight,
        'timestamp': datetime.now().isoformat(),
        'id': len(swarm['learnings']) + 1
    }
    
    swarm['learnings'].append(learning)
    
    # Track agent contributions
    if agent not in swarm['agent_contributions']:
        swarm['agent_contributions'][agent] = 0
    swarm['agent_contributions'][agent] += 1
    
    save_swarm(swarm)
    
    # Analyze for patterns
    analyze_patterns(insight)
    
    print(f"🧠 Swarm learned from @{agent}: {insight[:80]}...")
    print(f"   Total swarm learnings: {len(swarm['learnings'])}")
    return learning


def analyze_patterns(new_insight: str):
    """Look for patterns across learnings"""
    swarm = load_swarm()
    patterns_data = load_patterns()
    
    # Simple pattern detection: keyword frequency
    keywords = ['timeout', 'fallback', 'cache', 'retry', 'async', 'parallel', 
                'validation', 'schema', 'index', 'search', 'optimize', 'refactor']
    
    insight_lower = new_insight.lower()
    found_keywords = [k for k in keywords if k in insight_lower]
    
    if found_keywords:
        for keyword in found_keywords:
            existing = next((p for p in patterns_data['patterns'] if p['keyword'] == keyword), None)
            if existing:
                existing['count'] += 1
                existing['last_seen'] = datetime.now().isoformat()
            else:
                patterns_data['patterns'].append({
                    'keyword': keyword,
                    'count': 1,
                    'first_seen': datetime.now().isoformat(),
                    'last_seen': datetime.now().isoformat()
                })
    
    save_patterns(patterns_data)


def show_patterns():
    """Display discovered patterns"""
    patterns_data = load_patterns()
    
    if not patterns_data['patterns']:
        print("🌐 No patterns discovered yet. The swarm is still learning.")
        return
    
    print("🌐 SWARM INTELLIGENCE - Discovered Patterns")
    print("━" * 50)
    
    sorted_patterns = sorted(patterns_data['patterns'], key=lambda x: -x['count'])
    
    for p in sorted_patterns[:10]:
        bar = "█" * min(p['count'], 20)
        print(f"  {p['keyword']:15} {bar} ({p['count']})")
    
    print()


def recommend(task: str):
    """Get swarm recommendations based on collective learning"""
    swarm = load_swarm()
    patterns_data = load_patterns()
    
    print(f"🌐 SWARM RECOMMENDATIONS for: \"{task}\"")
    print("━" * 50)
    
    task_lower = task.lower()
    
    # Find relevant learnings
    relevant = []
    for learning in swarm['learnings']:
        # Simple relevance: word overlap
        insight_words = set(learning['insight'].lower().split())
        task_words = set(task_lower.split())
        overlap = insight_words & task_words
        if len(overlap) >= 2:
            relevant.append((len(overlap), learning))
    
    relevant.sort(key=lambda x: -x[0])
    
    if relevant:
        print("\n📚 Relevant learnings from the swarm:")
        for score, learning in relevant[:5]:
            print(f"  • @{learning['agent']}: {learning['insight'][:100]}...")
    else:
        print("\n  No directly relevant learnings found.")
    
    # Recommend agents based on patterns
    print("\n👥 Recommended agents:")
    
    # Simple heuristics
    if 'research' in task_lower or 'find' in task_lower or 'search' in task_lower:
        print("  → @researcher or @researcher_fast (semantic search available)")
    if 'code' in task_lower or 'implement' in task_lower or 'build' in task_lower:
        print("  → @coder (primary) with @reviewer (gate-keeper)")
    if 'deploy' in task_lower or 'infra' in task_lower or 'script' in task_lower:
        print("  → @ops for infrastructure")
    if 'strategy' in task_lower or 'decision' in task_lower or 'architecture' in task_lower:
        print("  → @giuzu for strategic reasoning")
    
    print()


def show_status():
    """Show swarm health"""
    swarm = load_swarm()
    patterns_data = load_patterns()
    
    print("🌐 SWARM INTELLIGENCE STATUS")
    print("━" * 50)
    print(f"📅 Created: {swarm.get('created', 'unknown')[:10]}")
    print(f"🧠 Total learnings: {len(swarm['learnings'])}")
    print(f"🔍 Patterns discovered: {len(patterns_data['patterns'])}")
    print()
    
    if swarm['agent_contributions']:
        print("👥 Agent contributions:")
        for agent, count in sorted(swarm['agent_contributions'].items(), key=lambda x: -x[1]):
            bar = "▓" * min(count, 20)
            print(f"   @{agent:15} {bar} ({count})")
    
    print()
    
    # Health indicators
    total = len(swarm['learnings'])
    if total == 0:
        print("⚠️  Swarm is NEW - no learnings yet")
    elif total < 10:
        print("🌱 Swarm is GROWING - collecting initial insights")
    elif total < 50:
        print("🌿 Swarm is DEVELOPING - patterns emerging")
    else:
        print("🌳 Swarm is MATURE - rich collective intelligence")


def show_help():
    print("""
🌐 MAIA SWARM INTELLIGENCE

Usage:
  --learn <agent> <insight>   Log a new learning from an agent
  --patterns                  Show discovered patterns
  --recommend <task>          Get swarm recommendations for a task
  --status                    Show swarm health

Examples:
  python3 swarm_intel.py --learn coder "Using async/await improved API response time by 40%"
  python3 swarm_intel.py --recommend "optimize database queries"
  python3 swarm_intel.py --patterns
""")


def main():
    if len(sys.argv) < 2:
        show_help()
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == '--learn' and len(sys.argv) >= 4:
        agent = sys.argv[2]
        insight = ' '.join(sys.argv[3:])
        learn(agent, insight)
    elif cmd == '--patterns':
        show_patterns()
    elif cmd == '--recommend' and len(sys.argv) >= 3:
        task = ' '.join(sys.argv[2:])
        recommend(task)
    elif cmd == '--status':
        show_status()
    else:
        show_help()


if __name__ == '__main__':
    main()
