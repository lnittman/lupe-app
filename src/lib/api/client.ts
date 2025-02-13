import useSWR from 'swr';
import type { ApiResponse, SeparateResponse } from '@/types/api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// API error handling
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base fetcher for JSON endpoints
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
  }
  return res.json();
};

// File upload fetcher
const uploadFetcher = async ([url, file]: [string, File]) => {
  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(response.status, text || 'Failed to upload file');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new ApiError(500, 'Invalid response format from server');
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Failed to process file');
  } finally {
    clearTimeout(timeoutId);
  }
};

// Hook for checking API health
export function useHealthCheck() {
  return useSWR<ApiResponse<{ status: string }>>(
    API_ENDPOINTS.HEALTH,
    fetcher,
    { refreshInterval: 30000 } // Check every 30 seconds
  );
}

// Hook for processing stem separation
export function useStemSeparation(file: File | null) {
  return useSWR<SeparateResponse>(
    file ? [API_ENDPOINTS.SEPARATE, file] : null,
    uploadFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false
    }
  );
}

// Legacy function for compatibility
export async function processStemSeparation(file: File): Promise<SeparateResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(API_ENDPOINTS.SEPARATE, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text);
  }

  return response.json();
} 