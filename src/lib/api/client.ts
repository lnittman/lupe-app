import type { ApiResponse } from '@/types/api';
import { API_ENDPOINTS } from './endpoints';
import type { SeparateResponse } from '@/types/api';

// API error handling
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new ApiError(res.status, text);
  }
}

// Enhanced API request function with better typing
export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown,
): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

export async function separateAudioFile(file: File): Promise<SeparateResponse> {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch(API_ENDPOINTS.SEPARATE, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Separation failed');
  }

  return response.json();
}

export async function processStemSeparation(file: File): Promise<SeparateResponse> {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch(API_ENDPOINTS.SEPARATE, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  await throwIfResNotOk(response);
  return response.json();
} 