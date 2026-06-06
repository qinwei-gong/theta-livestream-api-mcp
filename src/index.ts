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

// import { listServicesToolDefinition, listServices } from './tools/list-services.js';
// import { livestreamToolDefinition, infer } from './tools/livestream.js';

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
//
// server.registerTool(
//   'list_services',
//   {
//     description: listServicesToolDefinition.description,
//     inputSchema: { category: z.string().optional() },
//   },
//   async ({ category }) => {
//     const result = await listServices({ category });
//     return { content: [{ type: 'text', text: result }] };
//   }
// );

// // Register tool call handler
// server.setRequestHandler(CallToolRequestSchema, async (request) => {
//   const { name, arguments: args } = request.params;

//   try {
//     let result: string;

//     switch (name) {
//       case 'list_services':
//         result = await listServices(args as { category?: string });
//         break;

//       case 'infer':
//         result = await infer(args as {
//           service: string;
//           input: Record<string, unknown>;
//           wait?: number;
//           prediction?: string;
//           variant?: string;
//         });
//         break;

//       case 'get_request_status':
//         result = await getRequestStatus(args as { request_id: string });
//         break;

//       case 'get_upload_url':
//         result = await getUploadUrl(args as {
//           service: string;
//           input_field: string;
//         });
//         break;

//       default:
//         throw new Error(`Unknown tool: ${name}`);
//     }

//     return {
//       content: [
//         {
//           type: 'text',
//           text: result,
//         },
//       ],
//     };
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     return {
//       content: [
//         {
//           type: 'text',
//           text: `Error: ${errorMessage}`,
//         },
//       ],
//       isError: true,
//     };
//   }
// });

// Main function
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

  console.debug('Theta Livestream API MCP Server running');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});







// #!/usr/bin/env node

// const greetUser = (username: string): string => {
//     return `Hello, ${username}! Your Mac TypeScript environment is fully live.`;
// };

// console.log(greetUser("qinwei"));