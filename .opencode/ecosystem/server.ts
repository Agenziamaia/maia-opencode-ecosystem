#!/usr/bin/env node

import { Server } from "../../node_modules/@modelcontextprotocol/sdk/dist/server/index.js";
import { StdioServerTransport } from "../../node_modules/@modelcontextprotocol/sdk/dist/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "../../node_modules/@modelcontextprotocol/sdk/dist/types.js";
import * as tools from "./tools/ecosystem-mcp-tools.js";

const server = new Server(
  {
    name: "ecosystem",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.values(tools).map((t: any) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema || { type: "object", properties: {} },
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const tool = Object.values(tools).find((t: any) => t.name === toolName);

  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  try {
    const result = await tool.execute(request.params.arguments);
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: String(error),
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
