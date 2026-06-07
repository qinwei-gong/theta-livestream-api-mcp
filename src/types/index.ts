/**
 * Types for Theta EdgeCloud Livestream API MCP Server
 */

// API Response wrapper
export interface ApiResponse<T> {
  body: T;
  status: number;
}

// TVA info response
export interface TVAInfoResponse {
  tva_id: string;
  tva_secret: string;
}

export interface Ingestor {
  id: string;
  ip: string;
  stakes: number;
  state: 'available' | 'busy' | 'selected';
  playback_url: string | null;
  stream_key: string | null;
}

export interface IngestorStreamInfo {
  status: string;
  stream_server: string;
  stream_key: string;
}

export interface Stream {
  id: string;
  name: string;
  status: 'on' | 'off';
}

export interface IngestorListResponse {
  ingestors: Ingestor[];
  total_count: number;
}

export interface StreamListResponse {
  streams: Stream[];
  total_count: number;
}

export interface McpConfig {
  tva_id: string;
  tva_key: string;
}
