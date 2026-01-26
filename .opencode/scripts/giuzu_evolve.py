#!/usr/bin/env python3
"""
🧠 Giuzu Self-Evolution Daemon
Watches giuzu-training/journal.md for new entries and updates identity.md

Usage:
  python3 .opencode/scripts/giuzu_evolve.py --watch   # Continuous mode
  python3 .opencode/scripts/giuzu_evolve.py --once    # Single sync
"""

import os
import sys
import re
import time
import hashlib
from pathlib import Path
from datetime import datetime

# Configuration
GIUZU_DIR = Path(__file__).parent.parent / 'giuzu-training'
JOURNAL_PATH = GIUZU_DIR / 'journal.md'
IDENTITY_PATH = GIUZU_DIR / 'identity.md'
BRAIN_PATH = GIUZU_DIR / 'brain.md'
PERSONALITY_PATH = GIUZU_DIR / 'personality_matrix.md'
WATCH_INTERVAL = 30  # seconds


def get_file_hash(filepath):
    """Get MD5 hash of file contents"""
    if not filepath.exists():
        return None
    return hashlib.md5(filepath.read_bytes()).hexdigest()


def parse_journal_entries(content):
    """Extract structured entries from journal.md"""
    entries = []
    # Match entries like: ## 2026-01-27: Topic
    pattern = r'##\s*(\d{4}-\d{2}-\d{2}):\s*(.+?)(?=\n##|\Z)'
    matches = re.findall(pattern, content, re.DOTALL)
    
    for date, body in matches:
        # Extract key learnings
        learnings = re.findall(r'[-*]\s*\*\*(.+?)\*\*:\s*(.+)', body)
        entries.append({
            'date': date,
            'content': body.strip(),
            'learnings': learnings
        })
    
    return entries


def extract_evolution_signals(entries):
    """Identify patterns and traits from journal entries"""
    signals = {
        'new_skills': [],
        'preferences': [],
        'lessons_learned': [],
        'recurring_themes': {},
    }
    
    for entry in entries:
        for label, detail in entry.get('learnings', []):
            label_lower = label.lower()
            if 'skill' in label_lower or 'learned' in label_lower:
                signals['new_skills'].append(detail)
            elif 'prefer' in label_lower or 'like' in label_lower:
                signals['preferences'].append(detail)
            elif 'lesson' in label_lower or 'realized' in label_lower:
                signals['lessons_learned'].append(detail)
            
            # Track recurring themes
            for word in label_lower.split():
                if len(word) > 4:  # Skip short words
                    signals['recurring_themes'][word] = signals['recurring_themes'].get(word, 0) + 1
    
    return signals


def update_identity(signals):
    """Append new insights to identity.md"""
    if not signals['new_skills'] and not signals['lessons_learned']:
        return False
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
    update_block = f"\n\n---\n\n## Auto-Evolution Update ({timestamp})\n\n"
    
    if signals['new_skills']:
        update_block += "### New Skills Acquired\n"
        for skill in signals['new_skills'][-5:]:  # Last 5 only
            update_block += f"- {skill}\n"
    
    if signals['lessons_learned']:
        update_block += "\n### Lessons Integrated\n"
        for lesson in signals['lessons_learned'][-5:]:
            update_block += f"- {lesson}\n"
    
    if signals['recurring_themes']:
        top_themes = sorted(signals['recurring_themes'].items(), key=lambda x: -x[1])[:5]
        if top_themes:
            update_block += "\n### Emerging Themes\n"
            for theme, count in top_themes:
                update_block += f"- **{theme}** (mentioned {count}x)\n"
    
    # Append to identity.md
    if IDENTITY_PATH.exists():
        current = IDENTITY_PATH.read_text()
        # Check if we already have this update (avoid duplicates)
        if f"## Auto-Evolution Update ({timestamp[:10]}" not in current:
            IDENTITY_PATH.write_text(current + update_block)
            return True
    else:
        IDENTITY_PATH.write_text(f"# Giuzu Identity\n\n{update_block}")
        return True
    
    return False


def sync_once():
    """Perform a single sync from journal to identity"""
    print("🧠 Giuzu Self-Evolution: Syncing...")
    
    if not JOURNAL_PATH.exists():
        print(f"   ⚠️  Journal not found: {JOURNAL_PATH}")
        return False
    
    content = JOURNAL_PATH.read_text()
    entries = parse_journal_entries(content)
    print(f"   📖 Found {len(entries)} journal entries")
    
    if not entries:
        print("   ℹ️  No structured entries to process")
        return False
    
    signals = extract_evolution_signals(entries)
    print(f"   🎯 Detected: {len(signals['new_skills'])} skills, {len(signals['lessons_learned'])} lessons")
    
    if update_identity(signals):
        print("   ✅ Identity updated with new insights!")
        return True
    else:
        print("   ℹ️  No new updates needed")
        return False


def watch_mode():
    """Continuously watch for journal changes"""
    print(f"🧠 Giuzu Self-Evolution Daemon")
    print(f"   Watching: {JOURNAL_PATH}")
    print(f"   Updating: {IDENTITY_PATH}")
    print(f"   Interval: {WATCH_INTERVAL}s")
    print("   Press Ctrl+C to stop\n")
    
    last_hash = get_file_hash(JOURNAL_PATH)
    
    try:
        while True:
            time.sleep(WATCH_INTERVAL)
            current_hash = get_file_hash(JOURNAL_PATH)
            
            if current_hash != last_hash:
                print(f"\n📝 Journal changed at {datetime.now().strftime('%H:%M:%S')}")
                sync_once()
                last_hash = current_hash
            else:
                print(".", end="", flush=True)
    except KeyboardInterrupt:
        print("\n\n👋 Daemon stopped")


def main():
    if '--watch' in sys.argv:
        watch_mode()
    elif '--once' in sys.argv or len(sys.argv) == 1:
        sync_once()
    else:
        print("Usage: giuzu_evolve.py [--watch | --once]")
        sys.exit(1)


if __name__ == '__main__':
    main()
