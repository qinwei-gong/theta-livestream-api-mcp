#!/usr/bin/env node
/**
 * Theta EdgeCloud Livestream API MCP Server
 *
 * This MCP server provides tools to interact with Theta EdgeCloud's
 * Livestream APIs directly from Claude Desktop, Claude Code,
 * and other MCP-compatible clients.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { selectIngestorToolDefinition, selectIngestor } from './tools/select-ingestor.js';

// Create the MCP server
const server = new McpServer(
  {
    name: 'theta-livestream-api',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// TODO: Register tools once the ./tools/* modules exist. With McpServer the
// tools/list and tools/call handlers are wired up automatically via registerTool, e.g.:

server.registerTool(
  'select-ingestor',
  {
    description: selectIngestorToolDefinition.description,
    inputSchema: {},
  },
  async () => {
    const result = await selectIngestor();
    return { content: [{ type: 'text', text: result }] };
  }
);

async function main() {
  // Check for API key
  if (!process.env.THETA_API_KEY || !process.env.THETA_PROJECT_ID) {
    console.error('Error: THETA_PROJECT_ID and THETA_API_KEY environment variables are required');
    console.error('');
    if (!process.env.THETA_PROJECT_ID) {
      console.error('Select your project and get its id from: https://www.thetaedgecloud.com/dashboard/settings/projects');
    } else {
      console.error(`Get your API key from: https://www.thetaedgecloud.com/dashboard/settings/project/${process.env.THETA_PROJECT_ID}`);
    }
    console.error('');
    console.error('Then set them in your MCP config:');
    console.error(JSON.stringify({
      mcpServers: {
        'theta-livestream': {
          command: 'npx',
          args: ['@qinwei-gong/theta-livestream-api-mcp'],
          env: {
            THETA_PROJECT_ID: 'your-project-id-here',
            THETA_API_KEY: 'your-api-key-here',
          },
        },
      },
    }, null, 2));
    process.exit(1);
  }

  // Start the server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Theta Livestream API MCP Server running');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});