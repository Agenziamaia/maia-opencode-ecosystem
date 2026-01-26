# 🚀 MAIA Guided Stage System

## Overview

A structured workflow that guides you from Start → Plan → Code → Test → Deploy → Expand with MAIA providing strategic questions and recommendations at each stage.

---

## 📋 Stage 1: START - Project Initiation

### Objective
Define project scope, goals, and technical requirements.

### MAIA Guidance

**Strategic Questions (ask user):**
1. **What problem does this project solve?**
   - Example: "Need a WhatsApp bot for hotel bookings"
   - Purpose: Clarify core value proposition

2. **Who are the users?**
   - Example: "Hotel guests, front desk staff"
   - Purpose: Define user personas

3. **What are the success criteria?**
   - Example: "Handle 100 concurrent bookings, <2s response time"
   - Purpose: Define measurable goals

4. **Technical constraints?**
   - Example: "Must use PostgreSQL, WhatsApp Cloud API, deploy on Coolify"
   - Purpose: Surface constraints early

5. **Timeline and budget?**
   - Example: "MVP in 2 weeks, $0 monthly cost"
   - Purpose: Set realistic expectations

### Deliverables
- ✅ Project scope document
- ✅ Technical stack defined
- ✅ Success criteria documented
- ✅ Repository created (if needed)

### When to Move On
- User answers all 5 questions
- Goals are clear and achievable
- User confirms "Proceed to Plan"

---

## 📋 Stage 2: PLAN - Architecture & Strategy

### Objective
Create a technical battle plan with multi-agent delegation.

### MAIA Guidance

**Strategic Questions (ask user):**
1. **Monorepo or separate repos?**
   - Choices: "All in one repo", "Separate per service", "Hybrid"
   - MAIA Recommendation: Based on project complexity

2. **Database schema needed?**
   - Purpose: Decide on data modeling strategy

3. **External integrations?**
   - Example: "WhatsApp API, Stripe, SendGrid"
   - Purpose: Identify dependency planning

4. **Authentication method?**
   - Example: "JWT, OAuth 2.0, Session tokens"
   - Purpose: Define security architecture

5. **Testing approach?**
   - Choices: "Unit tests only", "Integration + E2E", "Manual QA"
   - Purpose: Define quality gates

### Multi-Agent Delegation Plan

| Agent | Task | Deliverable |
|--------|-------|-------------|
| @researcher_fast | Research tech patterns | Architecture recommendations |
| @coder | Create tech spec | Stack definition, API design |
| @ops | DevOps planning | Infrastructure, CI/CD strategy |
| @workflow | Automation design | Workflow triggers, integrations |

### Deliverables
- ✅ Technical architecture document
- ✅ API specifications
- ✅ Database schema (if applicable)
- ✅ Multi-agent battle plan
- ✅ CI/CD pipeline design

### When to Move On
- Architecture approved by user
- All agents have task assignments
- User confirms "Proceed to Code"

---

## 📋 Stage 3: CODE - Implementation

### Objective
Execute implementation with God-Tier code quality.

### MAIA Guidance

**Progressive Check-ins (every major milestone):**

**Milestone 1: Core Structure**
- Ask: "Core scaffolding complete. Review before continuing?"
- What to verify: Folder structure, package.json, .env.example

**Milestone 2: Core Features**
- Ask: "Core features implemented. Run tests?"
- What to verify: Basic functionality works

**Milestone 3: Integrations**
- Ask: "External services integrated. Test connectivity?"
- What to verify: API calls succeed, auth works

**Milestone 4: Polish**
- Ask: "All features complete. Ready for testing?"
- What to verify: Code compiles, no obvious bugs

### Quality Gates (ask user):**

**After each milestone:**
1. **Type checking**: Should I run `npm run typecheck`?
2. **Linting**: Should I run `npm run lint`?
3. **Basic testing**: Should I run basic smoke tests?

### Multi-Agent Coordination

| Agent | Role | Trigger |
|--------|-------|---------|
| @coder | Core implementation | Start of Stage 3 |
| @reviewer | Code audit | Each milestone completion |
| @ops | Infrastructure | When deployment files needed |
| @maia | Orchestration | Continuous throughout |

### Deliverables
- ✅ All source code implemented
- ✅ Type checking passes
- ✅ Linting passes
- ✅ Documentation updated
- ✅ Code reviewed by @reviewer

### When to Move On
- All milestones complete
- Code quality gates pass
- User confirms "Proceed to Test"

---

## 📋 Stage 4: TEST - Quality Assurance

### Objective
Comprehensive testing with automation and manual validation.

### MAIA Guidance

**Strategic Questions (ask user):**
1. **Testing environment ready?**
   - Purpose: Verify test data, services running

2. **Automated tests passing?**
   - Purpose: Ensure CI/CD green

3. **Manual testing checklist?**
   - Purpose: Define test scenarios

### Test Levels

**Level 1: Unit Tests (Automated)**
```bash
npm run test
npm run test:coverage
```

**Level 2: Integration Tests (Automated)**
```bash
npm run test:integration
```

**Level 3: E2E Tests (Automated)**
```bash
npm run test:e2e
```

**Level 4: Manual QA (User-Driven)**
- Test checklist execution
- Edge case validation
- Performance testing

### Quality Checklist (ask user to verify):

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests cover critical paths
- [ ] Manual QA checklist complete
- [ ] Performance meets criteria
- [ ] Security scan passes (if applicable)

### When to Move On
- All test levels pass
- User confirms "All tests pass"
- User confirms "Proceed to Deploy"

---

## 📋 Stage 5: DEPLOY - Production Release

### Objective
Deploy to production with zero-downtime strategy.

### MAIA Guidance

**Strategic Questions (ask user):**
1. **Deployment target?**
   - Choices: "Coolify", "VPS/Docker", "Vercel/Netlify", "Other"
   - Purpose: Platform-specific optimization

2. **Environment configuration?**
   - Purpose: Production secrets setup

3. **Deployment strategy?**
   - Choices: "Blue-green", "Canary", "Rolling", "Instant"
   - Purpose: Risk mitigation

4. **Monitoring in place?**
   - Purpose: Post-deployment observability

5. **Rollback plan?**
   - Purpose: Safety net if issues arise

### Deployment Steps

**Pre-Deployment:**
1. ✅ Run final test suite
2. ✅ Build production assets
3. ✅ Update CHANGELOG.md
4. ✅ Tag release (v1.0.0, etc.)
5. ✅ Backup current production (if applicable)

**Deployment:**
6. ✅ Push to production branch
7. ✅ Trigger CI/CD pipeline
8. ✅ Monitor deployment logs
9. ✅ Run smoke tests on production

**Post-Deployment:**
10. ✅ Verify health checks
11. ✅ Monitor error logs
12. ✅ Check performance metrics
13. ✅ Send release notification (if applicable)

### When to Move On
- Deployment successful
- Health checks pass
- No critical errors in logs
- User confirms "Production stable"

---

## 📋 Stage 6: EXPAND - Iteration & Scale

### Objective
Plan next features based on feedback and learnings.

### MAIA Guidance

**Strategic Questions (ask user):**
1. **What worked well?**
   - Purpose: Identify strengths

2. **What needs improvement?**
   - Purpose: Identify weaknesses

3. **User feedback collected?**
   - Purpose: Gather insights

4. **Next priority features?**
   - Purpose: Plan roadmap

### Next Cycle

Return to **Stage 1 (START)** with:
- Refined project scope
- Technical debt identified
- Success criteria updated

---

## 🎯 SUMMARY: User Journey

```
START (5 questions)
   ↓ [User confirms]
PLAN (5 questions + agent delegation)
   ↓ [User approves architecture]
CODE (4 milestones + quality gates)
   ↓ [All tests pass]
TEST (4 test levels + checklist)
   ↓ [User approves]
DEPLOY (13 steps + verification)
   ↓ [Production stable]
EXPAND (feedback gathering → back to START)
   ↓
  [Repeat cycle]
```

---

## 💡 USAGE EXAMPLE

**User**: "I want to build a WhatsApp bot for hotel bookings"

**MAIA (START stage)**:
```
Let me ask you some questions to define the project:

1. What problem does this solve?
2. Who are the users?
3. What are success criteria?
4. Technical constraints?
5. Timeline/budget?

Your answers will guide the architecture and implementation.
```

**User**: [Answers all 5 questions]

**MAIA (PLAN stage)**:
```
Based on your answers, here's the technical plan:
- Database: PostgreSQL (bookings, guests, rooms)
- API: Express.js + OpenAPI spec
- WhatsApp: Meta Cloud API
- Deployment: Coolify (Docker)

I'll delegate:
- @researcher_fast: WhatsApp API best practices
- @coder: Create API spec and database schema
- @ops: Coolify deployment strategy

Approve this plan?
```

**User**: "Yes, proceed"

**MAIA (CODE stage)**:
```
Milestone 1: Core scaffolding complete. Review?

[User approves]

Milestone 2: Core features implemented. Run tests?

[User runs tests, all pass]

Milestone 3: WhatsApp integration. Test connectivity?

[User tests, works]

Milestone 4: All features complete. Ready for testing?

[User confirms]
```

**MAIA (TEST stage)**:
```
Running test suite...
- Unit tests: ✅ 100/100 pass
- Integration tests: ✅ 25/25 pass
- E2E tests: ✅ 10/10 pass

Manual QA checklist:
- [ ] Book a room
- [ ] Cancel booking
- [ ] Check availability
- [ ] Test error handling

Complete the checklist?
```

**[User completes QA, all pass]**

**MAIA (DEPLOY stage)**:
```
Deployment checklist:
1. ✅ Tests pass
2. ✅ Build production
3. ✅ Tag v1.0.0
4. ✅ Deploy to Coolify
5. ✅ Verify health

Deployment successful! Production URL: https://hotel-bot.example.com
```

**MAIA (EXPAND stage)**:
```
What worked well? What needs improvement?
Next features priority?

[User answers]

Ready to start next cycle? (Return to START)
```

---

## ⚙️ CONFIGURATION

### Customization

To adapt this system for your workflow:

1. **Add/Remove questions** in each stage
2. **Adjust quality gates** based on your standards
3. **Modify agent delegation** based on your team
4. **Update deployment checklist** for your platform

### MAIA Prompts

Use these commands to trigger stage-specific guidance:

```bash
# Start new project cycle
opencode run start "WhatsApp hotel bot"

# Create detailed plan
opencode run plan "Implement booking system"

# Execute code with review
opencode run audit  # After code milestone

# Infra setup
opencode run ops "Set up Coolify deployment"

# Research tech stack
opencode run research "WhatsApp Cloud API best practices"
```

---

## 📚 Related Documentation

- `AGENTS.md` - Agent capabilities and tools
- `.opencode/GITHUB_INTEGRATION_STRATEGY.md` - GitHub workflow patterns
- `README.md` - Quickstart guide
- `.opencode/workflows.md` - Automation workflows

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
