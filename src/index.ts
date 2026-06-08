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
import { z } from 'zod';

import { selectIngestorToolDefinition, selectIngestor } from './tools/select-ingestor.js';
import { listStreamsToolDefinition, listStreams } from './tools/list-streams.js';
import { getPlaybackUrlToolDefinition, getPlaybackUrl } from './tools/get-playback-url.js';

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

server.registerTool(
  listStreamsToolDefinition.name,
  {
    description: listStreamsToolDefinition.description,
    inputSchema: {
      status: z.enum(['on', 'off']).optional().describe('Stream status (either "on" or "off")'),
    },
  },
  async ({ status }) => {
    const result = await listStreams({ status });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.registerTool(
  selectIngestorToolDefinition.name,
  {
    description: selectIngestorToolDefinition.description,
    inputSchema: {
      stream_id: z.string().optional().describe('ID of the livestream'),
    },
  },
  async ({ stream_id }) => {
    const result = await selectIngestor({ stream_id });
    return { content: [{ type: 'text', text: result }] };
  }
);

server.registerTool(
  getPlaybackUrlToolDefinition.name,
  {
    description: getPlaybackUrlToolDefinition.description,
    inputSchema: {
      ingestor_id: z.string().length(42).describe('ID of the Theta EdgeIngestor (returned from select-ingestor tool)'),
    },
  },
  async ({ ingestor_id }) => {
    const result = await getPlaybackUrl({ ingestor_id });
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
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});