# 📋 Documentation Standards & Anti-Bloat Protocol

**Effective:** 2026-01-26  
**Enforced by:** All agents via `.opencode/agents/*.md` instructions

---

## ✅ The Rule: UPDATE, Don't Duplicate

When system state changes:
1. **Update** `STATUS.md` (living document)
2. **Update** `CHANGELOG.md` (append only)
3. **Update** relevant agent `.md` files

**NEVER** create:
- `*_REPORT.md`
- `*_SUMMARY.md`
- `*_COMPLETE.md`
- `*_FIX.md`
- `*_VERIFICATION.md`

---

## 📁 Canonical Files (Update These)

| File | Purpose | Update Trigger |
|------|---------|---------------|
| `STATUS.md` | Current system state | Any config/agent/model change |
| `CHANGELOG.md` | Version history | Releases, major changes |
| `AGENTS.md` | Agent roster | Agent added/removed/changed |
| `MODELS.md` | Model assignments | Model added/removed/changed |
| `README.md` | Setup guide | Installation process changes |
| `opencode.json` | Agent config | Agent tools/models change |

---

## 🔒 Enforcement Mechanism

### In Agent Instructions
All agents in `.opencode/agents/*.md` must include:

```markdown
### DOCUMENTATION PROTOCOL
When reporting completion or fixes:
1. Update STATUS.md with current state
2. Append to CHANGELOG.md if version-relevant
3. NEVER create new *_REPORT.md or *_SUMMARY.md files
```

### In Pre-Commit Hook
```bash
# .git/hooks/pre-commit
if git diff --cached --name-only | grep -E "_REPORT\.md|_SUMMARY\.md|_COMPLETE\.md|_FIX\.md"; then
    echo "❌ ERROR: Don't create new report files. Update STATUS.md instead."
    exit 1
fi
```

---

## 🗂️ Archive Policy

If a file must be preserved for historical reference:
1. Move to `.archive/YYYY-MM/filename.md`
2. Update references to point to archive
3. Add entry to `CHANGELOG.md`

---

## 🧹 Cleanup Checklist

Before pushing:
- [ ] No new `*_REPORT.md` files
- [ ] STATUS.md reflects current state
- [ ] References to deleted files updated
- [ ] Archive organized by month
