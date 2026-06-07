/**
 * list-streams tool - List user's livestreams in Theta EdgeCloud
 */

import { getTECClient } from '../api/client.js';

export const listStreamsToolDefinition = {
  name: 'list-streams',
  description: "List user's livestreams in Theta EdgeCloud.",
};

interface ListStreamsInput {
  status?: 'on' | 'off' | undefined;
}

export async function listStreams(input: ListStreamsInput): Promise<string> {
  const client = await getTECClient();

  let streams = await client.listStreams();
  if (!Array.isArray(streams) || streams.length === 0) {
    return `Seems you haven't created any streams in Theta EdgeCloud yet.`;
  }

  if (input.status) {
    streams = streams.filter(s => s.status === input.status);
    if (streams.length === 0) {
      return `Seems you don't have any '${input.status}' streams now.`;
    }
  }

  let output = `Here's your ${input.status ? `'${input.status}' ` : ''}streams in Theta EdgeCloud:\n`;
  for (const s of streams) {
    output += `- Name: ${s.name}, ID: ${s.id})`;
    if (!input.status) {
        output += `, Status: ${s.status}`;
    }
    output += `\n`;
  }

  return output;
}
