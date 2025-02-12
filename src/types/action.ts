import { StemType } from './audio';

export enum SystemActionType {
  BPMChanged = 'BPM_CHANGED',
  EngineInitialized = 'ENGINE_INITIALIZED',
  StemAdded = 'STEM_ADDED',
  StemSplit = 'STEM_SPLIT'
}

export enum UserActionType {
  StemMuted = 'STEM_MUTED',
  StemUnmuted = 'STEM_UNMUTED',
  StemVolumeChanged = 'STEM_VOLUME_CHANGED',
  StemLoopChanged = 'STEM_LOOP_CHANGED',
  StemReversed = 'STEM_REVERSED',
  PlaybackStarted = 'PLAYBACK_STARTED',
  PlaybackStopped = 'PLAYBACK_STOPPED',
  BPMChanged = 'BPM_CHANGED',
  PlaybackRateChanged = 'PLAYBACK_RATE_CHANGED'
}

export type ActionType = SystemActionType | UserActionType;

interface BaseAction {
  id: string;
  timestamp: number;
  type: ActionType;
}

export interface StemAddedAction extends BaseAction {
  type: SystemActionType.StemAdded;
  stem: StemType;
}

export interface BPMChangedAction extends BaseAction {
  type: UserActionType.BPMChanged;
  bpm: number;
}

export interface SystemBPMChangedAction extends BaseAction {
  type: SystemActionType.BPMChanged;
  bpm: number;
}

export interface PlaybackRateChangedAction extends BaseAction {
  type: UserActionType.PlaybackRateChanged;
  rate: number;
}

export interface PlaybackStartedAction extends BaseAction {
  type: UserActionType.PlaybackStarted;
}

export interface PlaybackStoppedAction extends BaseAction {
  type: UserActionType.PlaybackStopped;
}

export interface StemMutedAction extends BaseAction {
  type: UserActionType.StemMuted;
  stem: StemType;
}

export interface StemUnmutedAction extends BaseAction {
  type: UserActionType.StemUnmuted;
  stem: StemType;
}

export interface StemVolumeChangedAction extends BaseAction {
  type: UserActionType.StemVolumeChanged;
  stem: StemType;
  volume: number;
}

export interface StemLoopChangedAction extends BaseAction {
  type: UserActionType.StemLoopChanged;
  stem: StemType;
  loopStart: number;
  loopLength: number;
}

export interface StemSplitAction extends BaseAction {
  type: SystemActionType.StemSplit;
  filename: string;
}

export interface StemReversedAction extends BaseAction {
  type: UserActionType.StemReversed;
  stem: StemType;
  reversed: boolean;
}

export interface EngineInitializedAction extends BaseAction {
  type: SystemActionType.EngineInitialized;
}

export type Action = 
  | StemAddedAction 
  | BPMChangedAction
  | SystemBPMChangedAction
  | PlaybackRateChangedAction
  | PlaybackStartedAction
  | PlaybackStoppedAction
  | StemMutedAction 
  | StemUnmutedAction
  | StemVolumeChangedAction
  | StemLoopChangedAction
  | StemSplitAction
  | StemReversedAction
  | EngineInitializedAction;
