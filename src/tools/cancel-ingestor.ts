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

/**
 * Subset of the MCP RequestHandlerExtra we use to keep the client's request
 * timeout from firing during the (slow) unselect call.
 */
export interface ProgressReporter {
  _meta?: { progressToken?: string | number | undefined };
  sendNotification: (notification: {
    method: 'notifications/progress';
    params: { progressToken: string | number; progress: number; message?: string };
  }) => Promise<void>;
}

const HEARTBEAT_INTERVAL_MS = 5000;

export async function cancelIngestor(
  input: CancelIngestorInput,
  extra?: ProgressReporter
): Promise<string> {
  const client = await getTECClient();

  // The unselect API is slow but reliable. Emit periodic progress
  // notifications so the MCP client resets its request timeout instead of
  // giving up while the call is still in flight.
  const progressToken = extra?._meta?.progressToken;
  let progress = 0;
  const heartbeat =
    progressToken !== undefined
      ? setInterval(() => {
          progress += 1;
          extra!
            .sendNotification({
              method: 'notifications/progress',
              params: { progressToken, progress, message: 'Releasing ingestor…' },
            })
            .catch(() => {
              /* notification delivery is best-effort */
            });
        }, HEARTBEAT_INTERVAL_MS)
      : undefined;

  try {
    await client.cancelIngestor(input.ingestor_id);
  } finally {
    if (heartbeat) clearInterval(heartbeat);
  }

  return `The ingestor has been released.\n`;
}
