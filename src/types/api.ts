export interface SplitResponse {
  stems: Array<{
    name: string;
    data: string;  // base64 encoded audio data
  }>;
}
