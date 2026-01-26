#!/usr/bin/env python3
"""
💰 MAIA Token Budget Monitor
Tracks token usage per agent and warns when limits are approached

Usage:
  python3 token_monitor.py --status          # Show current usage
  python3 token_monitor.py --reset           # Reset counters (new billing cycle)
  python3 token_monitor.py --add <agent> <tokens>  # Log usage
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Configuration
DATA_DIR = Path(__file__).parent.parent / 'data'
USAGE_FILE = DATA_DIR / 'token_usage.json'

# Budget limits per agent tier (tokens per day)
BUDGETS = {
    'premium': {
        'daily_limit': 1_000_000,
        'warning_threshold': 0.8,
        'agents': ['maia_premium', 'researcher']
    },
    'standard': {
        'daily_limit': 500_000,
        'warning_threshold': 0.75,
        'agents': ['maia', 'sisyphus', 'coder', 'ops', 'reviewer']
    },
    'economy': {
        'daily_limit': 200_000,
        'warning_threshold': 0.7,
        'agents': ['researcher_fast', 'opencode', 'starter', 'librarian', 'vision']
    },
    'free': {
        'daily_limit': float('inf'),
        'warning_threshold': 1.0,
        'agents': ['giuzu', 'workflow']
    }
}


def ensure_data_dir():
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_usage():
    ensure_data_dir()
    if USAGE_FILE.exists():
        with open(USAGE_FILE) as f:
            return json.load(f)
    return {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'agents': {},
        'total': 0
    }


def save_usage(data):
    ensure_data_dir()
    with open(USAGE_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def get_agent_tier(agent):
    for tier, config in BUDGETS.items():
        if agent in config['agents']:
            return tier, config
    return 'standard', BUDGETS['standard']


def add_usage(agent, tokens):
    data = load_usage()
    
    # Reset if new day
    today = datetime.now().strftime('%Y-%m-%d')
    if data['date'] != today:
        data = {'date': today, 'agents': {}, 'total': 0}
    
    # Add usage
    if agent not in data['agents']:
        data['agents'][agent] = 0
    data['agents'][agent] += tokens
    data['total'] += tokens
    
    save_usage(data)
    
    # Check warnings
    tier, config = get_agent_tier(agent)
    agent_usage = data['agents'][agent]
    limit = config['daily_limit']
    
    if limit != float('inf'):
        pct = agent_usage / limit
        if pct >= 1.0:
            print(f"🚨 BUDGET EXCEEDED: {agent} ({tier}) at {pct*100:.1f}% ({agent_usage:,} / {limit:,})")
            return False
        elif pct >= config['warning_threshold']:
            print(f"⚠️  WARNING: {agent} ({tier}) at {pct*100:.1f}% ({agent_usage:,} / {limit:,})")
    
    print(f"✅ Logged {tokens:,} tokens for {agent}")
    return True


def show_status():
    data = load_usage()
    
    print("💰 MAIA Token Budget Monitor")
    print("━" * 50)
    print(f"📅 Date: {data['date']}")
    print(f"📊 Total tokens today: {data['total']:,}")
    print()
    
    for tier, config in BUDGETS.items():
        tier_total = sum(data['agents'].get(a, 0) for a in config['agents'])
        limit = config['daily_limit']
        
        if limit == float('inf'):
            limit_str = "∞"
            pct = 0
        else:
            limit_str = f"{limit:,}"
            pct = tier_total / limit * 100
        
        status = "🟢" if pct < config['warning_threshold'] * 100 else "🟡" if pct < 100 else "🔴"
        
        print(f"{status} {tier.upper()}: {tier_total:,} / {limit_str} ({pct:.1f}%)")
        for agent in config['agents']:
            usage = data['agents'].get(agent, 0)
            if usage > 0:
                print(f"   └─ {agent}: {usage:,}")
    
    print()


def reset_usage():
    data = {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'agents': {},
        'total': 0
    }
    save_usage(data)
    print("✅ Token counters reset for new billing cycle")


def main():
    if len(sys.argv) < 2:
        print("Usage: token_monitor.py [--status | --reset | --add <agent> <tokens>]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == '--status':
        show_status()
    elif cmd == '--reset':
        reset_usage()
    elif cmd == '--add' and len(sys.argv) >= 4:
        agent = sys.argv[2]
        tokens = int(sys.argv[3])
        add_usage(agent, tokens)
    else:
        print("Invalid command. Use --status, --reset, or --add <agent> <tokens>")
        sys.exit(1)


if __name__ == '__main__':
    main()
