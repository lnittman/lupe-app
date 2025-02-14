const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  SEPARATE: `${API_BASE_URL}/api/separate`,
  HEALTH: `${API_BASE_URL}/api/health`
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]; 