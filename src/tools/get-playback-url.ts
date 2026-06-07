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
    return `This ingestor doesn't have any livestreams at the moment.`;
  }
  
  return `The stream's playback url is ${ingestor.playback_url}\n\n`;
}
