# MAIA Quick Start Guide

**Last Updated**: 2026-01-22

---

## 🚀 INITIAL SETUP (3 Steps)

### Step 1: Initialize Environment (1 minute)

```bash
cd "/Users/g/Desktop/MAIA opencode"

# Setup GitHub token
cp .env.github.example .env.github
nano .env.github  # Add your GitHub token to GITHUB_TOKEN_DEV_ROOT

# Source token (hides from shell history)
set +o history && source .env.github && set -o history

# Verify GitHub access
gh auth status  # Should show: Logged in as Agenziamaia
```

### Step 2: Verify GitHub Token (30 seconds)

```bash
# Validate token works
node .opencode/validate-github-token.js

# If passes, you're ready!
```

### Step 3: Start Working (Now!)

```bash
# Open MAIA interface
opencode

# Or use commands directly
opencode run plan "I want to build a new project"
opencode run ops "Set up deployment"
opencode run research-fast "Research best practices"
```

---

## 🎯 COMMON TASKS → AGENTS

| You Want | Use This Agent | Command |
|-----------|----------------|---------|
| Write code | @coder | Delegate from MAIA |
| Fix infrastructure | @ops | `/ops task` |
| Research docs | @researcher_fast | `/research-fast topic` |
| GitHub operations | @github | Auto-invoked! |
| Audit code | @reviewer | `/audit` |
| Automate workflows | @workflow | Delegate from MAIA |
| New project | @starter | `/start project-name` |

### GitHub Operations (@github - Auto-Invoked)

**No command needed!** Just mention GitHub tasks:

- "Create a repo" → @github auto-invoked
- "Make a pull request" → @github auto-invoked
- "Invite collaborator" → @github auto-invoked
- "Push to GitHub" → @github auto-invoked
- "Set up CI/CD" → @github auto-invoked

---

## 📊 MONITORING & METRICS

### Check Agent Performance

```bash
# View metrics
cat .opencode/agents/metrics.json

# View recent handoffs
cat .opencode/agents/handoffs.json

# See task distribution
cat .opencode/agents/work-distribution.json
```

### Track GitHub Operations

**All GitHub operations are logged** in:
- `.opencode/agents/metrics.json` - Agent call counts
- `.agents/handoffs.json` - Context passed between agents

---

## 🔄 WORKFLOW PATTERNS

### Pattern 1: New Production App

```
1. MAIA: START stage (ask 5 questions)
2. User: Answers questions
3. MAIA: PLAN stage (@researcher_fast + @coder)
4. MAIA: CODE stage (@coder)
5. MAIA: @github (auto-invoked)
   - Creates repo on GitHub
   - Sets up .gitignore
   - Creates .env.example
   - Initializes git
   - Invites collaborators
6. MAIA: DEPLOY stage (@ops)
7. User: Tests deployment
8. Done!
```

### Pattern 2: Feature Development

```
1. User: "Add login feature"
2. MAIA: Delegates to @coder
3. @coder: Implements authentication
4. MAIA: @github (auto-invoked)
   - Creates feature branch
   - Opens pull request
5. MAIA: @reviewer (audit)
6. User: Approves PR
7. MAIA: @github (auto-invoked)
   - Merges PR
   - Deletes feature branch
```

---

## 💡 PRO TIPS

### Speed Tips

1. **Be Specific**: "Create user login with JWT" > "make auth"
2. **Use Commands**: `/ops deploy` > "deploy my app please"
3. **Trust Delegation**: Let MAIA pick best agent
4. **Ask for Plans**: `/plan "Add feature"` > "add this feature"

### GitHub Tips

1. **Use CLI for Speed**: `gh pr create` faster than web UI
2. **Batch Operations**: List repos once, then filter
3. **Templates Matter**: Use PULL_REQUEST_TEMPLATE.md
4. **Branch Protection**: Always protect main from direct pushes

---

## 🛠️ TROUBLESHOOTING

### GitHub Token Issues?

```bash
# Validate token
node .opencode/validate-github-token.js

# If failed, regenerate token:
# 1. Go to https://github.com/settings/tokens
# 2. Create new token with repo scope
# 3. Update .env.github
# 4. Source again
```

### Agent Not Responding?

**Symptom**: Agent stuck for >30s

**Solution**:
- MAIA will auto-switch to @researcher_fast
- You'll see: "Gemini is overloaded; switching to fast model"
- Task continues automatically

### Wrong Agent Invoked?

**Symptom**: @github called for non-GitHub task

**Fix**:
- Clarify: "This needs @coder, not @github"
- MAIA will redirect to correct agent
- No manual intervention needed

---

## 📚 DOCUMENTATION INDEX

**Core Documentation**:
- `.opencode/agents/README.md` - Multi-agent system overview
- `.opencode/agents/LEARNING_SYSTEM.md` - Continuous improvement patterns
- `.opencode/agents/github.md` - GitHub expert capabilities

**Project Documentation**:
- `TASKS_SUMMARY.md` - Current tasks and status
- `GITHUB_INTEGRATION_STRATEGY.md` - GitHub patterns
- `GUIDED_STAGE_SYSTEM.md` - 6-stage project workflow

---

## 🎯 NEXT: YOUR CHOICE

**What do you want to do?**

**A.** Start a new project → Use `/start "my new app"`
**B.** Plan a complex feature → Use `/plan "Add feature"`
**C.** GitHub operations → Just say "create repo", "make PR"
**D.** Infrastructure task → Use `/ops "deploy app"`
**E.** Research topic → Use `/research-fast "topic"`

---

**Ready to accelerate your productivity!** 🚀

