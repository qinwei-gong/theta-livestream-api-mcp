/**
 * select-ingestor tool - Select an available Theta EdgeIngestor for livestreaming
 */

import { getTECClient } from '../api/client.js';
import type { Stream } from '../types/index.js';

export const selectIngestorToolDefinition = {
  name: 'select-ingestor',
  description: "Select an ingestor from Theta's available EdgeIngestor list. Returns the ingestor's server URL and stream key.",
};

export interface SelectIngestorInput {
  stream_id?: string | undefined;
}

export async function selectIngestor(input: SelectIngestorInput): Promise<string> {
  const client = await getTECClient();

  const ingestors = await client.listIngestors();
  const ingestor = ingestors[0];
  if (!ingestor) {
    return `Seems all Theta's EdgeIngestors are in use. Please try again later.\n`;
  }

  let stream: Stream | undefined;
  if (!input.stream_id) {
    const streams = await client.listStreams();

    if (Array.isArray(streams) && streams.length > 0) {
      stream = streams.find(s => s.status === 'on');
      if (stream) {
        return `Sorry, seems you aleady have a livestream ${stream.name}. You can only have one livestream at a time.\n`;
      }

      // use the first 'off' stream
      stream = streams[0];
    }

    if (!stream) {
      // create a new stream for the user
      stream = await client.createStream();
    }
  } else {
    stream = await client.getStream(input.stream_id);
    if (stream.status === 'on') {
      return `Stream ${stream.name} is already being used for another livestream.`;
    }
  }

  const streamInfo = await client.selectIngestor(ingestor.id, stream.id);
  
  let output = `Found an available ingestor:\n\n`;
  output += `### Stream Server: ${streamInfo.stream_server}\n`;
  output += `### Stream Key: ${streamInfo.stream_key}\n`;
  output += `### Ingestor ID: ${ingestor.id}\n`;
  output += `Please copy/paste Stream Server and Stream Key into your streaming software (e.g. OBS) and start livestream.\n`;
  output += `(The above server/key pair will expire in 5 min)\n`;
  
  return output;  
}
