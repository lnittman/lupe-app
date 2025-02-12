export const API_ENDPOINTS = {
  SEPARATE: '/api/separate',
  TRACKS: '/api/tracks',
  HEALTH: '/api/health'
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]; 