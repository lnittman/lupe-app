export interface SplitResponse {
  stems: Array<{
    name: string;
    data: string;  // base64 encoded audio data
  }>;
}

export interface Song {
  id: string;
  title: string;
  date: string;
  stems: Record<string, string>;
}

export interface RecentSong {
  id: string;
  title: string;
  date: string;
  stems: Record<string, string>;
}