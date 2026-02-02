# CLAUDE PERSISTENCE SYSTEM

This directory contains the universal persistence system for Claude across the MAIA ecosystem.

## Directory Structure
```
.claude/
├── .gitignore             # Universal gitignore for Claude work
├── README.md             # This file
├── channels/            # Agent channel trails
│   ├── channels.md      # Channel registry
│   ├── main.md          # Main channel logs
│   ├── architect.md     # Architect channel logs
│   ├── giuzu-evolution.md
│   └── verification.md
├── logs/                # Session logs and traces
├── session-state.md     # Current session context
└── temp/               # Temporary working files
```

## How It Works
1. **Universal Context**: All sessions start by reading `session-state.md`
2. **Channel System**: Specialized agents leave trails in their channel files
3. **Session Continuity**: Each session updates state for the next
4. **Git Integration**: Universal .gitignore prevents context bloat

## File Paths (Absolute)
- Main state: `/Users/g/Desktop/MAIA opencode/.claude/session-state.md`
- Channels registry: `/Users/g/Desktop/MAIA opencode/.claude/channels/channels.md`
- Integration guide: `/Users/g/Desktop/MAIA opencode/.opencode/CLAUDE_INTEGRATION.md`
- Universal gitignore: `/Users/g/Desktop/MAIA opencode/.claude-universal.gitignore`

## Quick Start
1. First session: Read `session-state.md` to understand context
2. Check `channels/` for trails from previous agents
3. Update `session-state.md` with current progress
4. Leave trails in appropriate channel files