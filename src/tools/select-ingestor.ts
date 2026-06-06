/**
 * select-ingestor tool - Select an available Theta EdgeIngestor for livestreaming
 */

import { getTECClient } from '../api/client.js';
import type { Stream } from '../types/index.js';

export const selectIngestorToolDefinition = {
  name: 'select-ingestor',
  description: "Select an ingestor from Theta's available EdgeIngestor list. Returns the ingestor's server URL and stream key.",
  inputSchema: {
  },
};

export async function selectIngestor(): Promise<string> {
  const client = await getTECClient();

  const ingestors = await client.listIngestors();
  const ingestor = ingestors[0];
  if (!ingestor) {
    return `Seems all Theta's EdgeIngestors are in use. Please try again later.\n`;
  }

  const streams = await client.listStreams();

  let stream: Stream | undefined;
  if (Array.isArray(streams) && streams.length > 0) {
    stream = streams.find(s => s.status === 'off');
  }

  if (!stream) {
    // create a new stream for the user
    stream = await client.createStream();
  }

  const streamInfo = await client.selectIngestor(ingestor.id, stream.id);
  
  let output = `Found an available ingestor:\n\n`;
  output += `### Stream Server: ${streamInfo.stream_server}\n`;
  output += `### Stream Key: ${streamInfo.stream_key}\n`;
  output += `Please copy/paste them into your streaming software (e.g. OBS) and start your livestream.\n\n`;
  
  return output;  
}
