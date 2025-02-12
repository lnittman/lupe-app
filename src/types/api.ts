import type { Stems } from '@/types/audio';

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface StemData {
  name: string;
  data: string; // base64 encoded audio data
}

export interface SeparateResponse {
  stems: StemData[];
}

export interface TrackResponse {
  id: number;
  name: string;
  stems: Record<string, string>;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  message?: string;
}

export type ApiEndpoint = '/api/separate' | '/api/tracks' | '/api/health';

export type UnauthorizedBehavior = "returnNull" | "throw";

export interface ApiError {
  status: number;
  message: string;
}
