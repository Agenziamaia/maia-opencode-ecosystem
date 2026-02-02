#!/usr/bin/env python3
"""
Swarm Intelligence CLI for MAIA Ecosystem

Command line tool for swarm recommendations and collective intelligence.
Usage:
    python swarm-intel.py --recommend "task description"
    python swarm-intel.py --query "task pattern"
    python swarm-intel.py --learn --task "..." --agent "..." --outcome success
    python swarm-intel.py --council "complex decision description"
    python swarm-intel.py --stats
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import re


# ============================================================================
# STORAGE LAYER
# ============================================================================

SWARM_DATA_DIR = Path(os.path.dirname(os.path.abspath(__file__))) / "data"
PATTERNS_FILE = SWARM_DATA_DIR / "patterns.json"
TASKS_FILE = SWARM_DATA_DIR / "tasks.json"
COUNCIL_FILE = SWARM_DATA_DIR / "council.json"
KNOWLEDGE_FILE = SWARM_DATA_DIR / "knowledge.json"


def ensure_data_dir():
    """Ensure the swarm data directory exists."""
    SWARM_DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_json(filepath: Path, default: Any = None) -> Any:
    """Load JSON from file, return default if not exists."""
    if not filepath.exists():
        return default if default is not None else {}
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return default if default is not None else {}


def save_json(filepath: Path, data: Any) -> bool:
    """Save data to JSON file."""
    try:
        ensure_data_dir()
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}", file=sys.stderr)
        return False


# ============================================================================
# SEMANTIC SIMILARITY
# ============================================================================

def tokenize(text: str) -> List[str]:
    """Simple tokenization for semantic matching."""
    text = text.lower()
    # Extract alphanumeric tokens
    tokens = re.findall(r'\b[a-z0-9_]+\b', text)
    return tokens


def extract_features(text: str) -> Dict[str, float]:
    """Extract TF-IDF style features from text."""
    tokens = tokenize(text)
    features = {}
    for token in tokens:
        features[token] = features.get(token, 0) + 1
    return features


def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    """Calculate cosine similarity between two feature vectors."""
    # Get all unique terms
    all_terms = set(vec1.keys()) | set(vec2.keys())

    # Calculate dot product and magnitudes
    dot_product = sum(vec1.get(t, 0) * vec2.get(t, 0) for t in all_terms)
    mag1 = sum(v ** 2 for v in vec1.values()) ** 0.5
    mag2 = sum(v ** 2 for v in vec2.values()) ** 0.5

    if mag1 == 0 or mag2 == 0:
        return 0.0

    return dot_product / (mag1 * mag2)


def jaccard_similarity(set1: set, set2: set) -> float:
    """Calculate Jaccard similarity between two sets."""
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    return intersection / union if union > 0 else 0.0


# ============================================================================
# AGENT CONFIGURATION
# ============================================================================

# Agent capabilities mapping
AGENT_CAPABILITIES = {
    'maia': ['planning', 'meta', 'coding', 'strategy'],
    'sisyphus': ['planning', 'meta', 'project-management', 'scheduling'],
    'coder': ['coding', 'testing', 'frontend', 'backend', 'architecture'],
    'ops': ['infrastructure', 'devops', 'automation', 'deployment'],
    'researcher': ['research', 'meta', 'documentation'],
    'reviewer': ['review', 'testing', 'quality-assurance'],
    'workflow': ['automation', 'infrastructure', 'n8n', 'workflows'],
    'researcher_deep': ['research', 'meta', 'academic', 'deep-analysis'],
    'vision': ['research', 'meta', 'multimodal', 'visual'],
    'starter': ['planning', 'infrastructure', 'bootstrap', 'setup'],
    'librarian': ['research', 'meta', 'documentation', 'knowledge'],
    'maia_premium': ['meta', 'planning', 'review', 'escalation'],
    'prometheus': ['planning', 'meta', 'milestones', 'architecture'],
    'oracle': ['meta', 'planning', 'coding', 'architecture'],
    'explore': ['research', 'scanning', 'codebase-mapping'],
    'frontend': ['frontend', 'coding', 'ui', 'ux'],
    'github': ['automation', 'meta', 'git', 'version-control'],
    'sisyphus_junior': ['coding', 'implementation', 'precision'],
    'opencode': ['meta', 'infrastructure', 'ecosystem'],
}


def get_agent_for_capability(capability: str) -> List[str]:
    """Get agents that have a specific capability."""
    return [agent for agent, caps in AGENT_CAPABILITIES.items() if capability in caps]


# ============================================================================
# TASK CATEGORY DETECTION
# ============================================================================

CATEGORIES = {
    'bugfix': ['fix', 'bug', 'error', 'issue', 'broken'],
    'feature': ['implement', 'add', 'feature', 'new', 'create'],
    'refactor': ['refactor', 'restructure', 'reorganize', 'cleanup'],
    'documentation': ['document', 'readme', 'doc', 'comment'],
    'testing': ['test', 'spec', 'coverage', 'assert'],
    'deployment': ['deploy', 'release', 'ship', 'production'],
    'review': ['review', 'audit', 'check', 'verify'],
    'research': ['research', 'investigate', 'explore', 'find'],
    'optimization': ['optimize', 'improve', 'speed', 'performance'],
}


def detect_category(text: str) -> str:
    """Detect the category of a task from its description."""
    text_lower = text.lower()
    scores = {}
    for category, keywords in CATEGORIES.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score
    return max(scores.keys()) if scores else 'general'


# ============================================================================
# PATTERN MATCHING
# ============================================================================

class PatternMatcher:
    """Matcher for finding similar past tasks."""

    def __init__(self):
        self.patterns = load_json(PATTERNS_FILE, [])
        self.tasks = load_json(TASKS_FILE, [])

    def find_similar_patterns(self, task_description: str, limit: int = 5) -> List[Dict]:
        """Find patterns similar to the task description."""
        task_features = extract_features(task_description)
        task_tokens = set(tokenize(task_description))

        results = []
        for pattern in self.patterns:
            # Calculate semantic similarity
            pattern_features = extract_features(pattern.get('description', ''))
            semantic_score = cosine_similarity(task_features, pattern_features)

            # Calculate token overlap
            pattern_tokens = set(tokenize(pattern.get('description', '')))
            token_score = jaccard_similarity(task_tokens, pattern_tokens)

            # Combine scores
            combined_score = semantic_score * 0.7 + token_score * 0.3

            # Boost by success rate
            success_rate = pattern.get('success_rate', 0.5)
            combined_score = combined_score * 0.8 + success_rate * 0.2

            if combined_score > 0.3:  # Minimum threshold
                results.append({
                    'pattern': pattern,
                    'similarity': combined_score,
                })

        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:limit]

    def find_best_agent(self, task_description: str, category: str = None) -> Dict:
        """Find the best agent for a task based on patterns and capabilities."""
        if category is None:
            category = detect_category(task_description)

        # Get similar patterns
        similar = self.find_similar_patterns(task_description)

        # Calculate agent scores
        agent_scores = {}

        # Initialize with capability-based scores
        category_keywords = CATEGORIES.get(category, [])
        for keyword in category_keywords:
            agents = get_agent_for_capability(keyword)
            for agent in agents:
                agent_scores[agent] = agent_scores.get(agent, 0) + 1

        # Boost agents that succeeded on similar tasks
        for result in similar:
            pattern = result['pattern']
            similarity = result['similarity']
            for agent in pattern.get('recommended_agents', []):
                agent_scores[agent] = agent_scores.get(agent, 0) + (similarity * 3)

        # Normalize scores
        max_score = max(agent_scores.values()) if agent_scores else 1
        for agent in agent_scores:
            agent_scores[agent] = agent_scores[agent] / max_score

        # Sort by score
        ranked_agents = sorted(agent_scores.items(), key=lambda x: x[1], reverse=True)

        return {
            'category': category,
            'ranked_agents': [{'agent': a, 'confidence': c} for a, c in ranked_agents],
            'similar_patterns': similar[:3],
        }


# ============================================================================
# SWARM KNOWLEDGE
# ============================================================================

class SwarmKnowledge:
    """Manages collective swarm knowledge."""

    def __init__(self):
        self.knowledge = load_json(KNOWLEDGE_FILE, {})

    def record_pattern(self, task: str, agent: str, outcome: str,
                      complexity: str = 'medium', duration_ms: int = 0) -> bool:
        """Record a task pattern for learning."""
        patterns = load_json(PATTERNS_FILE, [])

        category = detect_category(task)
        features = extract_features(task)

        # Check if similar pattern exists
        pattern_found = False
        for pattern in patterns:
            pattern_features = extract_features(pattern.get('description', ''))
            similarity = cosine_similarity(features, pattern_features)

            if similarity > 0.7:
                # Update existing pattern
                pattern['count'] = pattern.get('count', 1) + 1
                pattern['last_seen'] = datetime.now().isoformat()

                # Update success rate
                current_rate = pattern.get('success_rate', 0.5)
                success_value = 1 if outcome == 'success' else 0
                pattern['success_rate'] = (current_rate * (pattern['count'] - 1) + success_value) / pattern['count']

                # Update agents
                if agent not in pattern.get('recommended_agents', []):
                    pattern.setdefault('recommended_agents', []).append(agent)

                # Update agent performance
                pattern.setdefault('agent_performance', {})[agent] = \
                    pattern['agent_performance'].get(agent, 0.5) * 0.9 + success_value * 0.1

                pattern_found = True
                break

        if not pattern_found:
            # Create new pattern
            new_pattern = {
                'id': f"pattern_{len(patterns)}_{int(datetime.now().timestamp())}",
                'description': task,
                'category': category,
                'characteristics': list(features.keys()),
                'complexity': complexity,
                'recommended_agents': [agent],
                'agent_performance': {agent: 1.0 if outcome == 'success' else 0.0},
                'success_rate': 1.0 if outcome == 'success' else 0.0,
                'avg_completion_time_ms': duration_ms,
                'count': 1,
                'created_at': datetime.now().isoformat(),
                'last_seen': datetime.now().isoformat(),
            }
            patterns.append(new_pattern)

        return save_json(PATTERNS_FILE, patterns)

    def record_task(self, task: str, agent: str, outcome: str,
                   duration_ms: int = 0) -> bool:
        """Record a completed task."""
        tasks = load_json(TASKS_FILE, [])

        task_record = {
            'id': f"task_{len(tasks)}_{int(datetime.now().timestamp())}",
            'description': task,
            'agent': agent,
            'outcome': outcome,
            'duration_ms': duration_ms,
            'timestamp': datetime.now().isoformat(),
            'category': detect_category(task),
        }

        tasks.append(task_record)
        return save_json(TASKS_FILE, tasks)

    def get_collective_insights(self) -> Dict:
        """Get insights from collective swarm behavior."""
        patterns = load_json(PATTERNS_FILE, [])
        tasks = load_json(TASKS_FILE, [])

        if not patterns:
            return {'message': 'No patterns learned yet'}

        # Analyze patterns
        category_success = {}
        agent_success = {}
        complexity_distribution = {}

        for pattern in patterns:
            cat = pattern.get('category', 'general')
            if cat not in category_success:
                category_success[cat] = {'count': 0, 'total_rate': 0}
            category_success[cat]['count'] += 1
            category_success[cat]['total_rate'] += pattern.get('success_rate', 0.5)

            for agent, rate in pattern.get('agent_performance', {}).items():
                if agent not in agent_success:
                    agent_success[agent] = {'count': 0, 'total_rate': 0}
                agent_success[agent]['count'] += 1
                agent_success[agent]['total_rate'] += rate

            comp = pattern.get('complexity', 'medium')
            complexity_distribution[comp] = complexity_distribution.get(comp, 0) + 1

        # Calculate averages
        category_avg = {
            cat: data['total_rate'] / data['count']
            for cat, data in category_success.items()
        }
        agent_avg = {
            agent: data['total_rate'] / data['count']
            for agent, data in agent_success.items()
        }

        return {
            'total_patterns': len(patterns),
            'total_tasks': len(tasks),
            'category_success_rate': category_avg,
            'agent_success_rate': agent_avg,
            'complexity_distribution': complexity_distribution,
        }


# ============================================================================
# COUNCIL RECOMMENDATION
# ============================================================================

def recommend_council(task_description: str, complexity: str = 'medium') -> Dict:
    """Recommend council members for complex decisions."""
    category = detect_category(task_description)
    features = extract_features(task_description)

    # Determine council size based on complexity
    council_sizes = {
        'low': 3,
        'medium': 5,
        'high': 7,
    }
    council_size = council_sizes.get(complexity, 5)

    # Priority agents for different categories
    category_priority = {
        'bugfix': ['coder', 'reviewer', 'researcher', 'oracle'],
        'feature': ['prometheus', 'coder', 'maia', 'sisyphus'],
        'refactor': ['oracle', 'coder', 'reviewer'],
        'documentation': ['librarian', 'researcher'],
        'testing': ['reviewer', 'coder'],
        'deployment': ['ops', 'maia_premium', 'maia'],
        'review': ['reviewer', 'oracle', 'maia_premium'],
        'research': ['researcher_deep', 'researcher', 'librarian', 'explore'],
    }

    priority_agents = category_priority.get(category, ['maia', 'oracle', 'coder'])

    # Add generalists
    generalists = ['maia', 'oracle', 'prometheus', 'sisyphus']
    council_members = list(dict.fromkeys(priority_agents + generalists))[:council_size]

    return {
        'task_category': category,
        'complexity': complexity,
        'recommended_council': council_members,
        'rationale': f'{category} task requiring {complexity} complexity oversight',
    }


# ============================================================================
# COMMAND HANDLERS
# ============================================================================

def cmd_recommend(args) -> None:
    """Handle --recommend command."""
    matcher = PatternMatcher()
    result = matcher.find_best_agent(args.recommend)

    print(json.dumps({
        'status': 'success',
        'task': args.recommend,
        'recommendation': result,
    }, indent=2))


def cmd_query(args) -> None:
    """Handle --query command."""
    matcher = PatternMatcher()
    similar = matcher.find_similar_patterns(args.pattern, args.limit)

    output = {
        'status': 'success',
        'query': args.pattern,
        'matches': len(similar),
        'results': []
    }

    for item in similar:
        pattern = item['pattern']
        output['results'].append({
            'similarity': round(item['similarity'], 3),
            'description': pattern.get('description', ''),
            'category': pattern.get('category', ''),
            'success_rate': pattern.get('success_rate', 0),
            'recommended_agents': pattern.get('recommended_agents', []),
            'complexity': pattern.get('complexity', 'unknown'),
        })

    print(json.dumps(output, indent=2))


def cmd_learn(args) -> None:
    """Handle --learn command."""
    knowledge = SwarmKnowledge()

    # Validate outcome
    if args.outcome not in ['success', 'failure', 'partial']:
        print(json.dumps({
            'status': 'error',
            'message': 'outcome must be one of: success, failure, partial'
        }, indent=2))
        sys.exit(1)

    # Record pattern
    pattern_saved = knowledge.record_pattern(
        task=args.task,
        agent=args.agent,
        outcome=args.outcome,
        complexity=args.complexity,
        duration_ms=args.duration_ms
    )

    # Record task
    task_saved = knowledge.record_task(
        task=args.task,
        agent=args.agent,
        outcome=args.outcome,
        duration_ms=args.duration_ms
    )

    if pattern_saved and task_saved:
        print(json.dumps({
            'status': 'success',
            'message': 'Pattern and task recorded successfully',
            'task': args.task,
            'agent': args.agent,
            'outcome': args.outcome,
        }, indent=2))
    else:
        print(json.dumps({
            'status': 'error',
            'message': 'Failed to save pattern or task'
        }, indent=2))
        sys.exit(1)


def cmd_council(args) -> None:
    """Handle --council command."""
    result = recommend_council(args.council, args.complexity)

    print(json.dumps({
        'status': 'success',
        'task': args.council,
        'council_recommendation': result,
    }, indent=2))


def cmd_stats(args) -> None:
    """Handle --stats command."""
    knowledge = SwarmKnowledge()
    insights = knowledge.get_collective_insights()

    # Load raw data for detailed stats
    patterns = load_json(PATTERNS_FILE, [])
    tasks = load_json(TASKS_FILE, [])

    stats = {
        'status': 'success',
        'insights': insights,
        'recent_patterns': [
            {
                'id': p.get('id'),
                'category': p.get('category'),
                'success_rate': p.get('success_rate'),
                'agents': p.get('recommended_agents', []),
            }
            for p in patterns[-10:]  # Last 10 patterns
        ]
    }

    print(json.dumps(stats, indent=2))


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Swarm Intelligence CLI for MAIA Ecosystem',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Recommend an agent for a task
  python swarm-intel.py --recommend "Fix the login bug"

  # Query similar past tasks
  python swarm-intel.py --query "implement api endpoint" --limit 5

  # Learn from a completed task
  python swarm-intel.py --learn --task "Fix login bug" --agent coder --outcome success

  # Get council recommendation for complex task
  python swarm-intel.py --council "Redesign the entire database schema" --complexity high

  # Show swarm statistics
  python swarm-intel.py --stats
        """
    )

    # Main commands
    parser.add_argument('--recommend', metavar='TASK',
                       help='Get agent recommendation for a task')
    parser.add_argument('--query', metavar='PATTERN',
                       help='Query similar past tasks')
    parser.add_argument('--council', metavar='TASK',
                       help='Get council recommendation for complex task')

    # Learning options
    parser.add_argument('--learn', action='store_true',
                       help='Learn mode: record a task pattern')
    parser.add_argument('--task', metavar='DESC',
                       help='Task description (for --learn)')
    parser.add_argument('--agent', metavar='AGENT',
                       help='Agent that performed the task (for --learn)')
    parser.add_argument('--outcome', choices=['success', 'failure', 'partial'],
                       help='Task outcome (for --learn)')

    # Options
    parser.add_argument('--complexity', choices=['low', 'medium', 'high'],
                       default='medium', help='Task complexity level')
    parser.add_argument('--duration-ms', type=int, default=0,
                       help='Task duration in milliseconds (for --learn)')
    parser.add_argument('--limit', type=int, default=5,
                       help='Maximum results for --query (default: 5)')
    parser.add_argument('--stats', action='store_true',
                       help='Show swarm statistics')

    args = parser.parse_args()

    # Route to appropriate command
    if args.recommend:
        cmd_recommend(args)
    elif args.query:
        cmd_query(args)
    elif args.learn:
        if not args.task or not args.agent or not args.outcome:
            print(json.dumps({
                'status': 'error',
                'message': '--learn requires --task, --agent, and --outcome'
            }, indent=2))
            sys.exit(1)
        cmd_learn(args)
    elif args.council:
        cmd_council(args)
    elif args.stats:
        cmd_stats(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
