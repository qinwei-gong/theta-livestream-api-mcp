/**
 * HTTP Client wrapper for Theta EdgeCloud Livestream API
 */

import type {
  ApiResponse,
  TVAInfoResponse,
  Ingestor,
  Stream,
  IngestorStreamInfo,
  IngestorListResponse,
  StreamListResponse,
  McpConfig,
} from '../types/index.js';

const TEC_BASE_URL = 'https://api.thetaedgecloud.com';
const TVA_BASE_URL = 'https://api.thetavideoapi.com';

export class TECApiClient {
  private headers: Record<string, string>;

  constructor(config: McpConfig) {
    this.headers = {
      'Content-Type': 'application/json',
      'x-tva-sa-id': config.tva_id,
      'x-tva-sa-secret': config.tva_key
    };
  }

  /**
   * List all available ingestors
   */
  async listIngestors(): Promise<Ingestor[]> {
    const response = await request<ApiResponse<IngestorListResponse>>(
      'GET',
      `${TVA_BASE_URL}/ingestor/filter?max_distance=40000000`,
      this.headers
    );
    return response.body.ingestors;
  }

  /**
   * List all streams in user's Theta EdgeCloud dashboard
   */
  async listStreams(): Promise<Stream[]> {
    const response = await request<ApiResponse<StreamListResponse>>(
      'GET',
      `${TVA_BASE_URL}/service_account/${this.headers['x-tva-sa-id']}/streams`,
      this.headers
    );
    return response.body.streams;
  }

  /**
   * Create a new Theta EdgeCloud stream for user
   */
  async createStream(): Promise<Stream> {
    const response = await request<ApiResponse<Stream>>(
      'POST',
      `${TVA_BASE_URL}/stream`,
      this.headers,
      { name: 'MCPStream' }
    );
    return response.body;
  }

  /**
   * Select a Theta EdgeCloud ingestor and return its stream url + key
   */
  async selectIngestor(id: string, tvaStream: string): Promise<IngestorStreamInfo> {
    const response = await request<ApiResponse<IngestorStreamInfo>>(
      'PUT',
      `${TVA_BASE_URL}/ingestor/${id}/select`,
      this.headers,
      { tva_stream: tvaStream }
    );
    return response.body;
  }
}

async function request<T>(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch {
      errorMessage = errorText;
    }
    throw new Error(`API Error (${response.status}): ${errorMessage}`);
  }

  const data = await response.json();
  return data as T;
}

// Singleton instance
let TECClientInstance: TECApiClient | null = null;

export async function getTECClient(): Promise<TECApiClient> {
  if (!TECClientInstance) {
    const projectId = process.env.THETA_PROJECT_ID;
    if (!projectId) {
      throw new Error('THETA_PROJECT_ID environment variable is required');
    }
    const apiKey = process.env.THETA_API_KEY;
    if (!apiKey) {
      throw new Error('THETA_API_KEY environment variable is required');
    }
    const headers: Record<string, string> = {
      'x-api-key': `${apiKey}`
    };

    const response = await request<ApiResponse<TVAInfoResponse>>(
      'GET',
      `${TEC_BASE_URL}/project/${projectId}/tva_info`,
      headers
    );
    const {tva_id, tva_secret: tva_key} = response.body;

    TECClientInstance = new TECApiClient({ tva_id, tva_key });
  }
  return TECClientInstance;
}

export function resetClient(): void {
  TECClientInstance = null;
}
