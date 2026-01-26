# MAIA Project Templates

This directory contains ready-to-use project templates for common use cases.

## Available Templates

### whatsapp-agentic-bot

Production-ready agentic workflow system for WhatsApp automation.

**Stack**: Node.js + TypeScript, Express.js, BullMQ + Redis, SQLite, launchd

**Features**:

- Multi-agent system (welcome, FAQ, custom agents)
- Job queuing with BullMQ
- Scheduled messages via cron
- 24/7 reliability with launchd
- Zero monthly cost (local-only)

**Use case**: Hotel customer service bots, automated support, messaging workflows

**Quick start**:

```bash
../scripts/create-project.sh whatsapp-agentic-bot my-hotel-bot
cd my-hotel-bot
npm install
# Configure .env
npm run dev
```

## Creating a New Project

Use the create-project script from the `.opencode/scripts` directory:

```bash
# From anywhere in the MAIA ecosystem
bash .opencode/scripts/create-project.sh <template-name> <project-name>
```

Example:

```bash
bash .opencode/scripts/create-project.sh whatsapp-agentic-bot my-bot
cd my-bot
# The template is now ready to customize!
```

## What's Included

Each template includes:

- **Source code**: Complete directory structure with stub implementations
- **Configuration**: TypeScript, ESLint, Prettier configs
- **Dependencies**: package.json with all required packages
- **Environment**: .env.example with placeholders for your credentials
- **Documentation**: README with setup and usage instructions
- **Scripts**: Setup, build, test, and deployment scripts
- **MAIA integration**: Pre-configured to work with MAIA agents

## Customization Guidelines

Templates are designed to be **copy-and-go ready**:

1. **Copy the template**: Use the create-project script
2. **Configure environment**: Edit .env with your credentials
3. **Customize logic**: Implement your business logic in the stub files
4. **Test locally**: Run `npm run dev` to test
5. **Deploy**: Use the provided deployment scripts

## Template Structure

```
project-templates/
├── whatsapp-agentic-bot/
│   ├── src/
│   │   ├── agents/          # Agent implementations
│   │   ├── gateway/         # Webhook & API gateway
│   │   ├── scheduler/       # Job scheduling logic
│   │   ├── workers/         # BullMQ worker processes
│   │   ├── services/        # External API integrations
│   │   └── utils/           # Shared utilities
│   ├── config/              # Environment & app config
│   ├── logs/                # Application logs
│   ├── scripts/             # Bootstrap & utility scripts
│   ├── tests/               # Test suites
│   ├── docs/                # Documentation
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
```

## Adding a New Template

To add a new template:

1. Create a directory in `project-templates/your-template-name/`
2. Add all project files (source, config, scripts, docs)
3. Include a comprehensive README.md
4. Test the template by creating a project from it
5. Document it in this README

## Best Practices

- **Keep templates minimal**: Include structure and setup, not full implementations
- **Document everything**: Include setup instructions and customization guides
- **Use environment variables**: Never hardcode credentials
- **Include MAIA integration**: Templates should work with MAIA agents out of the box
- **Test thoroughly**: Ensure templates create working projects

---

**Built by MAIA** | **Zero Setup** | **Production Ready**
