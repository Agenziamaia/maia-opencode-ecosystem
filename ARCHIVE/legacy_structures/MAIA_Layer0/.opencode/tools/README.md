# Tools Directory

This directory contains custom MCP (Model Context Protocol) tools for extending agent capabilities.

## Structure

Tools are organized by platform/service. Each tool file exports one or more tool functions using the OpenCode plugin system.

## Current Tools

- **discord.ts**: Discord integration tools (send, read, channels)

## Adding a New Tool

1. Create a new file: `<platform>.ts`
2. Import the `tool` helper from `@opencode-ai/plugin`
3. Export tool functions with proper schema definitions

Example:

```typescript
import { tool } from '@opencode-ai/plugin';

export const myFunction = tool({
  description: 'Description of what this tool does',
  args: {
    param1: tool.schema.string().describe('Parameter description'),
    param2: tool.schema.number().optional().describe('Optional parameter'),
  },
  async execute(args) {
    // Implementation
    return 'Result';
  },
});
```

## Tool Best Practices

1. **Environment Variables**: Always check for required env vars and return clear error messages
2. **Error Handling**: Wrap all external API calls in try-catch with meaningful error messages
3. **Input Validation**: Use schema validation for all arguments
4. **Return Format**: Return clear, human-readable results
5. **Rate Limiting**: Consider API rate limits when implementing tools

## Tool Registration

Tools are automatically registered by the OpenCode MCP server when the project is initialized.
