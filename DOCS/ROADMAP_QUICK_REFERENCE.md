# MAIA ECOSYSTEM - ROADMAP QUICK REFERENCE

**For Developers - At a Glance**

---

## WEEK-BY-WEEK SUMMARY

### Week 1: Critical Fixes (Days 1-5)
**Goal:** Fix blockers, enable real agent execution

| Day | Task | Files | Complexity |
|-----|------|-------|------------|
| 1-2 | Git cleanup + Session tool architecture | `.gitignore`, `session/real-session-manager.ts` | 10 pts |
| 3-4 | Session tool implementation | `tools/session-tools.ts`, `session/handoff-store.ts` | 8 pts |
| 5 | Test coverage | `__tests__/session.test.ts` | 5 pts |

**Deliverables:**
- Clean git repository
- Working session handoffs
- Unit tests passing

---

### Week 2: Core Orchestrator (Days 6-10)
**Goal:** Build main coordination system

| Day | Task | Files | Complexity |
|-----|------|-------|------------|
| 6-7 | Main coordinator + Planner | `orchestrator/main-coordinator.ts`, `planner.ts` | 13 pts |
| 8-9 | Agent execution engine | `orchestrator/agent-execution-engine.ts` | 8 pts |
| 10 | Workflow state machine | `orchestrator/workflow-state-machine.ts` | 5 pts |

**Deliverables:**
- Coordinator creates and executes plans
- Agent execution with timeout protection
- State machine managing workflows

---

### Week 3: Learning Systems (Days 11-15)
**Goal:** Enhance DNA and meta-learning

| Day | Task | Files | Complexity |
|-----|------|-------|------------|
| 11-12 | DNA pattern enhancement | `dna/pattern-extraction.ts`, `similarity-matcher.ts` | 8 pts |
| 13-14 | Meta-learning enhancement | `meta/feedback-loop.ts`, `prompt-optimizer.ts` | 5 pts |
| 15 | Feedback loops | `meta/cron-scheduler.ts` | 3 pts |

**Deliverables:**
- Enhanced pattern extraction (>80% accuracy)
- Agent optimization suggestions
- Scheduled feedback loops

---

### Week 4: Polish & Testing (Days 16-20)
**Goal:** Production-ready system

| Day | Task | Files | Complexity |
|-----|------|-------|------------|
| 16-17 | Comprehensive test suite | `__tests__/e2e/*.test.ts` | 8 pts |
| 18 | Performance optimization | Various files | 5 pts |
| 19 | Dashboard integration + Docs | `src/app/api/vk/*.ts`, `DOCS/*.md` | 8 pts |
| 20 | Final testing + Release prep | All files | 5 pts |

**Deliverables:**
- All tests passing (80%+ coverage)
- Performance benchmarks met
- Complete documentation
- Production deployment ready

---

## CRITICAL PATH

```
Git Cleanup (Day 1-2)
  ↓
Session Tool (Day 3-4)
  ↓
Main Coordinator (Day 6-7)
  ↓
Agent Execution Engine (Day 8-9)
  ↓
DNA Enhancement (Day 11-12)
  ↓
Comprehensive Testing (Day 16-17)
  ↓
Dashboard Integration (Day 19)
  ↓
RELEASE
```

**If any critical path item is delayed, the entire 4-week timeline extends.**

---

## PARALLEL WORK OPPORTUNITIES

**Can be done in parallel:**
- Documentation (Week 4) AND Performance optimization (Week 4)
- DNA enhancement (Week 3) AND Meta-learning (Week 3)
- State machine (Week 2) AND Agent execution engine (Week 2)

---

## DAILY STANDUP QUESTIONS

1. **What did you complete yesterday?**
2. **What will you work on today?**
3. **Any blockers?** (Especially P0 blockers)
4. **Are you on track for weekly milestone?**

---

## BLOCKER ESCALATION PATH

```
Developer
  ↓ (1 hour)
Tech Lead
  ↓ (4 hours)
TPM (creates mitigation plan)
  ↓ (1 day)
Stakeholder (decision)
```

---

## ACCEPTANCE CHECKLIST

Use this checklist before claiming a task is complete:

- [ ] Code implements the specification
- [ ] Unit tests pass (80%+ coverage)
- [ ] Integration tests pass (if applicable)
- [ ] Documentation updated
- [ ] Code review approved
- [ ] No console errors or warnings
- [ ] Performance acceptable (measure with profiling)
- [ ] Git commit messages are clear

---

## KEY FILE PATHS

### Session Tool
```
.opencode/ecosystem/session/
├── real-session-manager.ts (NEW - Core implementation)
├── handoff-store.ts (NEW - Persistent storage)
└── health-monitor.ts (NEW - Agent health checking)
```

### Orchestrator
```
.opencode/ecosystem/orchestrator/
├── main-coordinator.ts (NEW - Entry point)
├── planner.ts (NEW - Task planning)
├── workflow-state-machine.ts (NEW - State management)
└── task-graph.ts (NEW - Dependency management)
```

### DNA Enhancement
```
.opencode/ecosystem/dna/
├── pattern-extraction.ts (NEW - Enhanced extraction)
└── similarity-matcher.ts (NEW - Vector search)
```

### Meta-Learning
```
.opencode/ecosystem/meta/
├── feedback-loop.ts (NEW - Outcome processing)
├── prompt-optimizer.ts (NEW - Prompt improvements)
└── cron-scheduler.ts (NEW - Scheduled tasks)
```

---

## GIT CONVENTION

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation
- `chore`: Maintenance tasks

**Examples:**
```
feat(session): implement real agent handoff execution

- Add executeHandoff function with timeout protection
- Integrate with OpenCode SDK
- Add health check before delegation

Closes #123
```

```
fix(dna): resolve pattern extraction memory leak

- Clear vector cache after extraction
- Add memory limit checks

Fixes #456
```

---

## BRANCHING STRATEGY

```
main (protected)
  ↓
develop (integration branch)
  ↓
feature/session-tool (per feature)
  ↓
hotfix/critical-fix (for urgent fixes)
```

**Workflow:**
1. Create feature branch from `develop`
2. Work on feature
3. Create PR to `develop`
4. Code review required
5. Merge to `develop`
6. Weekly `develop` → `main` merge

---

## TEST COMMANDS

```bash
# Run all ecosystem tests
npm run test:ecosystem

# Run specific test file
npm run test:ecosystem -- session.test.ts

# Watch mode
npm run test:ecosystem -- --watch

# Coverage report
npm run test:ecosystem -- --coverage

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

---

## DEBUG MODE

Enable debug logging:

```bash
# Set environment variable
export DEBUG=maia:*

# Or in .env
DEBUG=maia:*
```

**Debug namespaces:**
- `maia:session` - Session tool debugging
- `maia:orchestrator` - Coordinator debugging
- `maia:dna` - Pattern extraction debugging
- `maia:meta` - Meta-learning debugging

---

## PERFORMANCE BENCHMARKS

Target metrics to validate before release:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Pattern lookup | < 10ms | `npm run benchmark:pattern` |
| Task creation | < 100ms | `npm run benchmark:task` |
| Agent handoff | < 500ms | `npm run benchmark:handoff` |
| Memory usage | < 2GB RSS | `npm run benchmark:memory` |
| VibeKanban sync | 100 req/s | `npm run benchmark:vibe` |

---

## EMERGENCY CONTACTS

| Role | Name | Contact |
|------|------|---------|
| TPM | [Name] | [Email/Slack] |
| Tech Lead | [Name] | [Email/Slack] |
| Architect | [Name] | [Email/Slack] |

---

## WEEKLY MILESTONES

**Week 1 Checkpoint (Day 5):**
- [ ] Git clean
- [ ] Session tool working
- [ ] Tests passing

**Week 2 Checkpoint (Day 10):**
- [ ] Coordinator operational
- [ ] Execution engine working
- [ ] State machine transitions OK

**Week 3 Checkpoint (Day 15):**
- [ ] DNA accuracy > 80%
- [ ] Meta-learning generating insights
- [ ] Feedback loops scheduled

**Week 4 Checkpoint (Day 20):**
- [ ] All tests pass
- [ ] Performance OK
- [ ] Docs complete
- [ ] Ready for production

---

**Remember:** When in doubt, check the full IMPLEMENTATION_ROADMAP.md for details!

**Last Updated:** February 1, 2026
