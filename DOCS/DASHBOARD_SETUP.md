# VibeKanban Living Ecosystem Showcase - Setup Guide

## Overview

This dashboard transforms the VibeKanban board into a **living ecosystem showcase** demonstrating how 19 MAIA agents work together through DNA tracking, council voting, and emergent capabilities.

## Features

- **Real-Time Visibility**: Live updates showing agent status, task progress, and activity
- **Agent Status Grid**: Health indicators and workload for all 19 agents
- **Task Board with DNA**: Kanban board with pattern matching, agent assignments, and council decisions
- **Activity Feed**: Live stream of agent actions, votes, and pattern matches
- **Ecosystem Health**: Overall system status with metrics

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# VibeKanban Configuration
VIBE_KANBAN_URL=http://localhost:62601
VIBE_PROJECT_ID=b7a06d11-3600-447f-8dbd-617b0de52e67

# Polling Configuration (5 seconds default)
NEXT_PUBLIC_POLL_INTERVAL=5000
```

### 2. Start VibeKanban MCP Server

```bash
# From project root
npx vibe-kanban@latest --mcp
```

This starts the VibeKanban server on `http://localhost:62601`.

### 3. Start Ecosystem MCP Server

```bash
# From project root
npx -y tsx .opencode/ecosystem/server.ts
```

This starts the extended ecosystem tools (DNA, Council, Agent management).

### 4. Start Next.js Development Server

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The dashboard will be available at `http://localhost:3000/dashboard`.

## Component Structure

```
src/
├── components/dashboard/
│   ├── EcosystemDashboard.tsx    # Main container with polling
│   ├── AgentStatusGrid.tsx       # 19-agent status display
│   ├── TaskBoard.tsx               # Kanban board with 5 columns
│   ├── TaskCard.tsx                # Individual task with DNA/agent/council
│   └── ActivityFeed.tsx             # Live activity stream
├── app/api/vk/
│   ├── tasks/route.ts              # Proxy to VibeKanban tasks API
│   ├── agents/route.ts             # Agent health and load stats
│   ├── decisions/route.ts          # Council decisions
│   └── health/route.ts             # Ecosystem health status
└── lib/
    ├── types.ts                    # TypeScript types
    └── hooks/useEcosystemPolling.ts   # Real-time polling hook
```

## Agent Status Indicators

| Color | Status | Meaning |
|--------|--------|---------|
| 🟢 Green | Healthy | Agent is available and responsive |
| 🟡 Yellow | Busy | Agent has tasks in progress |
| 🔴 Red | Unhealthy | Agent is not responding |
| ⚪ Gray | Idle | Agent is available but no current tasks |

## Task Board Columns

| Column | Description | Color |
|---------|-------------|--------|
| To Do | New tasks, not started | Gray |
| In Progress | Active work | Blue |
| In Review | Awaiting approval | Purple |
| Done | Completed tasks | Green |
| Cancelled | Cancelled tasks | Red |

## Activity Feed Types

| Icon | Type | Description |
|-------|-------|-------------|
| 🤖 | Agent Status | Agent health changes |
| 📋 | Task Update | Task creation, movement, completion |
| 🗳️ | Vote Cast | Council voting activity |
| 🧬 | Pattern Match | DNA pattern detected and matched |
| 🤝 | Agent Interaction | Agent-to-agent collaboration |

## Mock Data

Currently using mock data for:
- 19 agent configurations with capabilities and specialties
- Sample council decisions with voting history
- Ecosystem health metrics

**TODO**: Replace with real VibeKanban API integration once MCP tools are accessible from Next.js.

## Polling Strategy

The dashboard polls for updates at these intervals:

| Endpoint | Interval | Reason |
|----------|-----------|---------|
| Tasks | 5 seconds | Task status changes frequently |
| Agents | 10 seconds | Health checks are stable |
| Decisions | 10 seconds | Voting is time-sensitive |
| Health | 10 seconds | Overall status changes infrequently |

**Future Upgrade**: WebSocket connection for true real-time updates.

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test --watch

# Run tests with coverage
npm test --coverage
```

### Build for Production
```bash
# Build optimized bundle
npm run build

# Start production server
npm start
```

## Troubleshooting

### VibeKanban Not Responding
```bash
# Check if VibeKanban is running
curl http://localhost:62601/health

# Expected response: {"status":"ok"}
```

### API Routes 404 Errors
```bash
# Restart Next.js dev server
npm run dev

# Clear Next.js cache
rm -rf .next
```

### Polling Not Working
- Check browser console for errors
- Verify `NEXT_PUBLIC_POLL_INTERVAL` is set
- Ensure VibeKanban server is running

## Deployment

### Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Railway (Recommended for VibeKanban)

1. Push VibeKanban repo to GitHub
2. Connect Railway account
3. Deploy from GitHub with environment variables

### Environment Variables for Production

```bash
VIBE_KANBAN_URL=https://your-vibekanban-instance.railway.app
VIBE_PROJECT_ID=your-production-project-id
NEXT_PUBLIC_POLL_INTERVAL=5000
```

## Next Steps

- [ ] Integrate real VibeKanban API (remove mock data)
- [ ] Add WebSocket support for real-time updates
- [ ] Implement DNA pattern matching visualization
- [ ] Add council voting interface (cast votes)
- [ ] Add emergence metrics display
- [ ] Implement task drag-and-drop
- [ ] Add task filtering and search
- [ ] Add user authentication
- [ ] Add persistent preferences

## Contributing

When adding new features:

1. Follow the existing component structure
2. Use Tailwind CSS for styling
3. Maintain TypeScript strict typing
4. Update this README with new features
5. Test locally before committing

## License

Part of MAIA Open Code Ecosystem
