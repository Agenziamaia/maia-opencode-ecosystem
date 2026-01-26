# 🔧 MAIA ECOSYSTEM AUTOMATION SCRIPTS

> **Purpose**: Executable tools that extend agent capabilities.  
> **Location**: `.opencode/scripts/`  
> **Updated**: 2026-01-27

---

## 🔍 Semantic Search (`semantic_search.py`)

**What it does**: Searches the entire knowledge base using keyword matching (or embeddings if installed).

**Use cases**:
- Finding relevant documentation before answering a question
- Locating code patterns across the codebase
- Cross-referencing agent definitions and protocols

**Commands**:
```bash
# Build the search index (run after adding new docs)
python3 .opencode/scripts/semantic_search.py --index

# Search the knowledge base
python3 .opencode/scripts/semantic_search.py --search "query here"

# Check index status
python3 .opencode/scripts/semantic_search.py --status
```

**For embedding support** (optional, faster & smarter):
```bash
pip install sentence-transformers numpy
```

**Authorized Agents**: ALL (especially `@researcher`, `@researcher_fast`, `@librarian`, `@maia`)

---

## 🏗️ Architecture Linter (`architecture_linter.js`)

**What it does**: Verifies all directories are documented in `ARCHITECTURE.md`.

**Commands**:
```bash
node .opencode/scripts/architecture_linter.js
```

**Output**: Lists missing required entries, undocumented directories, and stale entries.

**Authorized Agents**: `@ops`, `@opencode`, `@reviewer`

---

## ✅ Config Validator (`validate_config.py`)

**What it does**: Validates `opencode.json` against the JSON schema.

**Commands**:
```bash
python3 .opencode/scripts/validate_config.py
```

**Auto-runs**: On every `git commit` via pre-commit hook.

**Authorized Agents**: ALL

---

## 🚀 Fast-Track Router (`fasttrack.sh`)

**What it does**: Determines if a task can skip review based on confidence score.

**Commands**:
```bash
# High confidence (≥95%) → Fast-track to DONE
bash .opencode/scripts/fasttrack.sh "Fix typo in README" 98

# Lower confidence (<95%) → Route to @reviewer
bash .opencode/scripts/fasttrack.sh "Refactor auth module" 70
```

**Authorized Agents**: `@maia`, `@sisyphus`

---

## 🧠 Giuzu Self-Evolution (`giuzu_evolve.py`)

**What it does**: Watches Giuzu's journal and auto-updates identity with learned patterns.

**Commands**:
```bash
# Single sync (process journal once)
python3 .opencode/scripts/giuzu_evolve.py --once

# Continuous watch mode (daemon)
python3 .opencode/scripts/giuzu_evolve.py --watch
```

**Authorized Agents**: `@giuzu` only

---

## 💰 Token Budget Monitor (`token_monitor.py`)

**What it does**: Tracks token usage per agent tier, warns when limits approached.

**Tiers**:
| Tier | Daily Limit | Agents |
|------|-------------|--------|
| Premium | 1,000,000 | maia_premium, researcher |
| Standard | 500,000 | maia, sisyphus, coder, ops, reviewer |
| Economy | 200,000 | researcher_fast, opencode, starter, librarian, vision |
| Free | ∞ | giuzu, workflow |

**Commands**:
```bash
# Show current usage
python3 .opencode/scripts/token_monitor.py --status

# Log usage after a task
python3 .opencode/scripts/token_monitor.py --add maia 50000

# Reset counters (new billing cycle)
python3 .opencode/scripts/token_monitor.py --reset
```

**Authorized Agents**: `@maia`, `@ops`

---

## 📋 Review Protocol (`review_protocol.json`)

**What it is**: Machine-readable escalation rules (not a script, but a config).

**Location**: `.opencode/config/review_protocol.json`

**Confidence thresholds**:
- `≥95%` → Fast-track (skip review)
- `70-94%` → Standard review (@reviewer)
- `50-69%` → Deep review (@reviewer + @coder)
- `<50%` → Escalate to @maia_premium

**Authorized Agents**: `@maia`, `@reviewer`, `@maia_premium`

---

## 🌐 Swarm Intelligence (`swarm_intel.py`)

**What it does**: Collective learning system that tracks patterns discovered by ALL agents.

**Why it matters**: Agents learn from each other's successes, building a shared brain.

**Commands**:
```bash
# Log a learning from any agent
python3 .opencode/scripts/swarm_intel.py --learn maia "Pre-commit hooks prevent broken commits"

# Show discovered patterns across all agents
python3 .opencode/scripts/swarm_intel.py --patterns

# Get recommendations for a task based on collective learning
python3 .opencode/scripts/swarm_intel.py --recommend "optimize database queries"

# Show swarm health and agent contributions
python3 .opencode/scripts/swarm_intel.py --status
```

**Use cases**:
- Track what works across the ecosystem
- Get recommendations based on past successes
- Identify emerging patterns (timeout, caching, etc.)
- See which agents are contributing the most

**Authorized Agents**: ALL (read), `@maia`, `@giuzu` (write)

---

## 🔗 Quick Reference


| Script | Primary Agent | Bash Command |
|--------|---------------|--------------|
| `semantic_search.py` | @researcher | `python3 .opencode/scripts/semantic_search.py --search "query"` |
| `architecture_linter.js` | @ops | `node .opencode/scripts/architecture_linter.js` |
| `validate_config.py` | ALL | `python3 .opencode/scripts/validate_config.py` |
| `fasttrack.sh` | @maia | `bash .opencode/scripts/fasttrack.sh "task" 95` |
| `giuzu_evolve.py` | @giuzu | `python3 .opencode/scripts/giuzu_evolve.py --once` |
| `token_monitor.py` | @maia | `python3 .opencode/scripts/token_monitor.py --status` |
