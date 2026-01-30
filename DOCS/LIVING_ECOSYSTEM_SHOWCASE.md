# VibeKanban Living Ecosystem Showcase

**MAIA's Living Breathing Ecosystem - Real-Time Multi-Agent Collaboration Dashboard**

---

## 🚀 Quick Start

```bash
# 1. Start VibeKanban MCP server
npx vibe-kanban@latest --mcp

# 2. Start Ecosystem MCP server (new terminal)
npx -y tsx .opencode/ecosystem/server.ts

# 3. Start dashboard
cd maia-landing-page && npm run dev

# 4. Open in browser
open http://localhost:3000/dashboard
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [LIVING_ECOSYSTEM_ANALYSIS.md](./LIVING_ECOSYSTEM_ANALYSIS.md) | Complete architecture analysis with implementation plan |
| [RESEARCH_SYNTHESIS.md](./RESEARCH_SYNTHESIS.md) | Multi-agent system research with real-world examples |
| [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md) | Setup guide with troubleshooting |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Comprehensive implementation summary |

---

## 🎯 Features

### Real-Time Visibility
- **Agent Status Grid**: 19 agents with health indicators and task load
- **Task Board**: 5-column kanban board with drag-and-drop
- **Activity Feed**: Live stream of agent actions, votes, and pattern matches
- **Ecosystem Health**: Overall system status with metrics

### Agent Integration
- **DNA Pattern Matching**: Automatic task categorization and agent recommendations
- **Council Voting**: Consensus decisions on strategic issues
- **Emergence Tracking**: Novel capabilities detection from agent collaboration
- **Task Tagging**: Problem/solution categorization with automatic linking

### Visualization
- **Color-Coded Status**: Green (healthy), Yellow (busy), Red (unhealthy)
- **Progress Indicators**: Load bars, voting progress, pattern confidence
- **Time Formatting**: "Xs ago", "Xm ago", "Xh ago" for all events
- **Responsive Design**: Mobile-first with breakpoint-based layouts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           EcosystemDashboard (React)               │
│                                                     │
│  ┌────────────┬────────────┬────────────┐ │
│  │AgentStatus │  TaskBoard │ActivityFeed│ │
│  │  Grid      │            │            │ │
│  │(19 agents) │ (5 cols)   │ (live)     │ │
│  └────────────┴────────────┴────────────┘ │
│                                                     │
│  useEcosystemPolling (5s interval)               │
│  ↓                                            │
│  API Routes (Next.js)                           │
│  ↓                                            │
│  VibeKanban MCP + Ecosystem MCP                │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Components

### Core Components
- **EcosystemDashboard** - Main container with polling and error handling
- **AgentStatusGrid** - 19-agent status display with health/load
- **TaskBoard** - 5-column kanban board with drag-and-drop
- **TaskCard** - Individual task with DNA/agent/council badges
- **ActivityFeed** - Live event stream with time formatting

### API Routes
- **`/api/vk/tasks`** - Fetch all tasks with ecosystem data
- **`/api/vk/agents`** - Get agent health and load stats
- **`/api/vk/decisions`** - Fetch council decisions
- **`/api/vk/health`** - Get overall ecosystem status

### Types & Hooks
- **`src/lib/types.ts`** - Complete TypeScript type definitions
- **`src/lib/hooks/useEcosystemPolling.ts`** - Real-time polling hook

---

## 🎨 Design System

### Agent Status Colors
| Status | Color | Meaning |
|--------|-------|----------|
| Healthy | 🟢 Green | Available and responsive |
| Busy | 🟡 Yellow | Has active tasks |
| Unhealthy | 🔴 Red | Not responding |
| Idle | ⚪ Gray | Available, no current tasks |

### Activity Feed Icons
| Type | Icon | Color |
|-------|-------|-------|
| Agent Status | 🤖 | Blue |
| Task Update | 📋 | Green |
| Vote Cast | 🗳️ | Purple |
| Pattern Match | 🧬 | Indigo |
| Agent Interaction | 🤝 | Orange |

### Task Board Columns
| Column | Color | Purpose |
|--------|-------|---------|
| To Do | Gray | New tasks |
| In Progress | Blue | Active work |
| In Review | Purple | Awaiting approval |
| Done | Green | Completed |
| Cancelled | Red | Cancelled |

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` in project root:

```bash
# VibeKanban Configuration
VIBE_KANBAN_URL=http://localhost:62601
VIBE_PROJECT_ID=b7a06d11-3600-447f-8dbd-617b0de52e67

# Polling Configuration
NEXT_PUBLIC_POLL_INTERVAL=5000
```

### Polling Intervals

| Endpoint | Interval | Reason |
|----------|-----------|---------|
| Tasks | 5 seconds | Frequent status changes |
| Agents | 10 seconds | Health checks are stable |
| Decisions | 10 seconds | Voting is time-sensitive |
| Health | 10 seconds | Overall status changes infrequently |

---

## 🧪 Agents Supported (19 Total)

### Strategy & Planning
1. **maia** - MAIA Orchestrator (planning, meta, coding)
2. **sisyphus** - Sisyphus PM (planning, meta)
3. **giuzu** - Strategic Advisor (reasoning, strategic planning)
4. **prometheus** - Planner (planning, milestones, estimation)

### Execution
5. **coder** - Coder Architect (coding, testing, frontend, backend)
6. **ops** - Ops Engineer (infrastructure, devops, automation)
7. **frontend** - UI Engineer (frontend, coding, responsive)
8. **sisyphus_junior** - Code Executor (coding)
9. **workflow** - Workflow Automator (automation, infrastructure)
10. **oracle** - Architect (meta, planning, complex debugging)

### Research & Intelligence
11. **researcher** - Researcher Oracle (research, meta)
12. **researcher_deep** - Deep Oracle (research, meta)
13. **explore** - Fast Scanner (research, codebase mapping)
14. **librarian** - Success Curator (research, meta, memory)
15. **vision** - Vision Analyst (research, meta, visual)

### Governance
16. **reviewer** - Reviewer Gatekeeper (review, testing)
17. **maia_premium** - Supreme Arbiter (meta, planning, review)

### Ecosystem Management
18. **github** - GitHub Expert (automation, meta, version control)
19. **opencode** - Platform Oracle (meta, infrastructure, mcp integration)

---

## 📈 Current Status

### Phase 1: ✅ Complete
- [x] Architecture research and analysis
- [x] Type system definitions
- [x] Polling hook implementation
- [x] Dashboard components (5 total)
- [x] API routes (4 endpoints)
- [x] Documentation (4 guides)

### Phase 2: 🚧 In Progress
- [ ] Connect to real VibeKanban API
- [ ] DNA pattern matching visualization
- [ ] Council voting interface
- [ ] Emergence metrics display
- [ ] Task creation form
- [ ] WebSocket support

### Phase 3: ⏳ Planned
- [ ] Animations with Framer Motion
- [ ] Mobile optimization
- [ ] User authentication
- [ ] Persistent preferences
- [ ] Analytics integration

---

## 🛠️ Troubleshooting

### Dashboard Not Loading
1. Verify VibeKanban server: `curl http://localhost:62601/health`
2. Check API routes exist in `src/app/api/vk/`
3. Restart dev server: `Ctrl+C` then `npm run dev`
4. Check browser console for errors

### Polling Not Working
1. Verify `NEXT_PUBLIC_POLL_INTERVAL` is set
2. Check network tab for failed requests
3. Try manual refresh button on dashboard

### Styling Broken
1. Ensure Tailwind CSS imported in `src/app/globals.css`
2. Clear browser cache: `Cmd+Shift+R` (Mac)
3. Check dev mode is enabled (not production)

---

## 🚀 Deployment

### Development
```bash
cd maia-landing-page
npm run dev
```

### Production Build
```bash
cd maia-landing-page
npm run build
npm start
```

### Recommended Platforms
- **Frontend**: Vercel (Next.js optimized)
- **VibeKanban**: Railway (Rust backend)
- **Ecosystem MCP**: Render (Node.js + TypeScript)

---

## 📞 Support

For issues or questions:

1. Check [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md) for detailed troubleshooting
2. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for implementation details
3. Examine browser console for error messages
4. Verify all services are running (VibeKanban + Ecosystem MCP)

---

**Built by MAIA Coder** | **Phase 1 Complete** | **January 30, 2026**

*Transforming VibeKanban into Living Ecosystem Showcase*
