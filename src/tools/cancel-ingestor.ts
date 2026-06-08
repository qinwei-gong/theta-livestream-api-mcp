/**
 * cancel-ingestor tool - Cancel previous selection of a Theta EdgeIngestor
 */

import { getTECClient } from '../api/client.js';

export const cancelIngestorToolDefinition = {
  name: 'cancel-ingestor',
  description: "Cancel previous selection of a Theta EdgeIngestor.",
};

export interface CancelIngestorInput {
  ingestor_id: string;
}

export async function cancelIngestor(input: CancelIngestorInput): Promise<string> {
  const client = await getTECClient();

  await client.cancelIngestor(input.ingestor_id);
  
  return `The ingestor has been released.\n`;
}
