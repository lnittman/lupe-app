export enum StemType {
  Vocals = 'vocals',
  Drums = 'drums',
  Bass = 'bass',
  Other = 'other'
}

export type EventCallback = (...args: any[]) => void;

export interface SplitProgress {
  stage: 'loading' | 'processing' | 'complete';
  progress: number;
  currentStem?: StemType;
}

export interface Stems {
  vocals: AudioBuffer;
  drums: AudioBuffer;
  bass: AudioBuffer;
  other: AudioBuffer;
}

export interface Stem {
  name: string;
  buffer: AudioBuffer | null;
  volume: number;
  isMuted: boolean;
  isReversed: boolean;
  loopStart: number;
  loopLength: number;
  isSelected?: boolean;
}
