import type { SplitResponse } from '@/types/api';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

// API error handling
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function processStemSplit(file: File): Promise<SplitResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const url = API_ENDPOINTS.SEPARATE;

  console.log('Sending request to:', {
    url,
    fileSize: file.size,
    fileType: file.type,
    fileName: file.name
  });

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
    });

    clearTimeout(timeoutId);

    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        text,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new ApiError(response.status, text || 'Failed to upload file');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      throw new ApiError(500, 'Invalid response format from server');
    }

    const data = await response.json();
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Request failed:', {
      error,
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error)
    });

    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout - the server took too long to respond');
    }
    throw new ApiError(500, error instanceof Error ? error.message : 'Failed to process file');
  } finally {
    clearTimeout(timeoutId);
  }
}