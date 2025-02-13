import type { Action } from './action';

export enum StemType {
  Vocals = 'vocals',
  Drums = 'drums',
  Bass = 'bass',
  Other = 'other'
}

export type LoopEvent = {
  name: string;
  loopStart: number;
  loopLength: number;
  playerState: string;
};

export type EventMap = {
  'loopChanged': LoopEvent;
  'bpmChanged': number;
  'stateLogged': LoopEvent;
  'actionLogged': Record<string, unknown>;
  'action': Action;
  'playbackRate': number;
  'playing': boolean;
  [key: string]: unknown;
};

export type EventCallback<T = unknown> = (event: T) => void;

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
