export const API_ENDPOINTS = {
  SEPARATE: '/api/separate',
  HEALTH: '/api/health'
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]; 