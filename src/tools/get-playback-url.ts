/**
 * get-playback-url tool - Get the playback URL of livestream
 */

import { getTECClient } from '../api/client.js';

export const getPlaybackUrlToolDefinition = {
  name: 'get-playback-url',
  description: "Get the playback URL of Theta EdgeCloud livestream.",
};

interface GetPlaybackUrlInput {
  ingestor_id: string;
}

export async function getPlaybackUrl(input: GetPlaybackUrlInput): Promise<string> {
  const client = await getTECClient();

  const ingestor = await client.getIngestor(input.ingestor_id);
  if (!ingestor.playback_url) {
    return `There's no livestream from this ingestor now.`;
  }

  let output = `The stream's playback url is ${ingestor.playback_url}\n\n`;

  try {
    const streamId = await client.getIngestorStreamId(input.ingestor_id);
    const stream = await client.getStream(streamId);
    if (stream.status === 'off') {
      output += `But this livestream hasn't started yet.\n`;
    }
  } catch {
    output = `Seems that something is wrong with this ingestor.\n`;
  }
  
  return output;
}
