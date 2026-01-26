# Quick Start Guide: MAIA Project Templates

**Updated**: January 22, 2026

---

## 🚀 Start a New Project in 30 Seconds

### Option A: Full MAIA Ecosystem (Recommended)

Use this when you want the complete MAIA agent system.

```bash
# 1. Go to your desired location
cd ~/Desktop
mkdir my-awesome-project
cd my-awesome-project

# 2. Copy MAIA_Layer0 (one command)
cp -r "/Users/g/Desktop/MAIA opencode/MAIA_Layer0/"* .

# 3. Initialize MAIA
bash .opencode/scripts/init.sh

# DONE! You're ready to code.
```

### Option B: React Template

Use this when you want a React app with minimal MAIA integration.

```bash
# 1. Go to your desired location
cd ~/Desktop

# 2. Create from template
bash "/Users/g/Desktop/MAIA opencode/.opencode/scripts/create-project.sh" maia-layer0 my-react-app

# 3. Go to project
cd my-react-app

# 4. Start coding
npm install
npm run dev
```

### Option C: WhatsApp Agentic Bot Template

Use this when you want a production WhatsApp automation system.

```bash
# 1. Go to your desired location
cd ~/Desktop

# 2. Create from template
bash "/Users/g/Desktop/MAIA opencode/.opencode/scripts/create-project.sh" whatsapp-agentic-bot my-bot

# 3. Go to project
cd my-bot

# 4. Install dependencies
npm install

# 5. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 6. Initialize database
npm run db:migrate

# 7. Start development
npm run dev
```

---

## 📋 Available Templates

List all available templates:

```bash
bash "/Users/g/Desktop/MAIA opencode/.opencode/scripts/create-project.sh"
```

### maia-layer0

- **Stack**: React + TypeScript + Vite
- **Purpose**: Quick React project with testing setup
- **MAIA Integration**: Minimal (init script only)

### whatsapp-agentic-bot

- **Stack**: Node.js + TypeScript + BullMQ + Redis + SQLite
- **Purpose**: Production WhatsApp automation
- **MAIA Integration**: Full (agents, workflows)
- **Features**: 24/7 reliability, job queues, multi-agent system
- **Cost**: $0/month (local-only)

---

## 🎯 What's Included in Each Template

### MAIA_Layer0 (Full Ecosystem)

- 11 MAIA agents (@maia, @coder, @ops, @researcher, etc.)
- All commands (plan, audit, ops, research, etc.)
- 22 Open Skills packages
- MCP server configuration
- Project context templates
- Workflow storage
- Custom tools

### React Template (maia-layer0)

- React 18 + TypeScript
- Vite for fast development
- Vitest for testing
- ESLint + Prettier
- Component structure (components, features, services)
- Utility functions
- Basic Counter example

### WhatsApp Bot Template (whatsapp-agentic-bot)

- Multi-agent system with stub implementations
- Express.js webhook server
- BullMQ + Redis job queuing
- SQLite database (embedded)
- Winston logging with rotation
- macOS launchd for 24/7 reliability
- Complete documentation

---

## 🔧 Quick Commands Reference

### MAIA_Layer0 Commands

```bash
opencode run init          # Initialize environment
opencode run plan "task"   # Plan with MAIA
opencode run audit         # Code quality check
opencode run ops "task"    # Infrastructure tasks
opencode run research      # Research with Oracle
opencode run supercharge   # Meta-analysis
```

### React Template Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
npm run check        # All quality checks
```

### WhatsApp Bot Template Commands

```bash
npm run dev              # Development mode
npm run start            # Production mode (24/7)
npm run db:migrate       # Initialize database
npm run db:seed          # Seed sample data
npm run db:reset         # Reset database
npm run logs:tail        # View application logs
npm run logs:health      # View health check logs
npm run logs:error       # View error logs
```

---

## 💡 Tips

1. **Choose the right template**:
   - Full MAIA ecosystem → Use MAIA_Layer0
   - React app → Use maia-layer0 template
   - WhatsApp bot → Use whatsapp-agentic-bot template

2. **Configure environment early**:
   - Copy `.env.example` to `.env`
   - Add your API keys
   - Never commit `.env` to git

3. **Use MAIA for everything**:
   - Planning: `opencode run plan "build feature X"`
   - Coding: MAIA delegates to @coder automatically
   - Research: `opencode run research "how does Y work"`
   - Infrastructure: `opencode run ops "deploy to production"`

4. **Sync improvements**:
   - When you improve this project, sync back to MAIA_Layer0:
     ```bash
     cp -r .opencode/ "/Users/g/Desktop/MAIA opencode/MAIA_Layer0/"
     cp opencode.json "/Users/g/Desktop/MAIA opencode/MAIA_Layer0/"
     ```

---

## 📚 Documentation

- `MAIA_READY.md` - Full ecosystem documentation
- `.opencode/project-templates/README.md` - Template system documentation
- `LAYER0_SYNC_COMPLETION_SUMMARY.md` - Sync completion report
- Template README files - Individual template documentation

---

## 🆘 Troubleshooting

### Template creation fails

```bash
# Check if template exists
ls "/Users/g/Desktop/MAIA opencode/.opencode/project-templates"

# Check script permissions
ls -la "/Users/g/Desktop/MAIA opencode/.opencode/scripts/create-project.sh"
```

### Dependencies fail to install

```bash
# Clear cache and try again
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### MAIA commands not found

```bash
# Initialize MAIA first
bash .opencode/scripts/init.sh
```

---

**Built by MAIA** | **Zero Setup** | **Production Ready**
