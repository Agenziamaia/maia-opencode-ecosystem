# Workflow Storage

This directory contains automated workflows for various platforms.

## Structure

- **agentic/**: Custom TypeScript agentic workflow scripts
- **flowise/**: LangChain flow definitions for Flowise AI
- **n8n/**: n8n workflow JSON files
- **trigger/**: Trigger.dev job definitions

## Usage

Workflows are managed by the @workflow agent. When you need to create or modify a workflow, run:

```bash
opencode run @workflow "Create a workflow that [description]"
```

## Best Practices

1. **Security First**: Never hardcode credentials. Use environment variables.
2. **Idempotency**: Workflows should be safe to re-run.
3. **Observability**: Every workflow must have logging + error handling.
4. **Documentation**: Include a README for each workflow explaining its purpose and triggers.

## Examples

### Adding a new n8n workflow

1. Create JSON file: `n8n/my-workflow.json`
2. Add README: `n8n/my-workflow.md`
3. Test with `@workflow` agent

### Adding a Trigger.dev job

1. Create TypeScript file: `trigger/my-job.ts`
2. Document triggers and schedules
3. Test locally with `npm run dev`
