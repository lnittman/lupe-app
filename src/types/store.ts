import { Action } from "@/types/action"
import { SplitProgress, Stems, Stem, StemType } from "@/types/audio"
import { AudioEngine } from "@/lib/audio/engine"

export interface AudioStore {
  // Core State
  engine: AudioEngine | null
  isInitialized: boolean
  bpm: number
  playbackRate: number
  isPlaying: boolean
  stems: Record<StemType, Stem> | null
  selectedStem: StemType | null
  actions: Action[]
  gridViewOffset: number
  SplitProgress: SplitProgress | null
  file: File | null
  isLoading: boolean
  showInstructions: boolean

  // Actions
  initializeEngine: () => Promise<void>
  setBPM: (bpm: number) => void
  setPlaybackRate: (rate: number) => void
  togglePlayback: () => Promise<void>
  updateStem: (name: StemType, updates: Partial<Stem>) => void
  selectStem: (name: StemType) => void
  addAction: (action: Action) => void
  setGridViewOffset: (offset: number) => void
  setIsLoading: (isLoading: boolean) => void
  setSplitProgress: (progress: SplitProgress | null) => void
  setFile: (file: File) => void
  setStems: (stems: Stems | null) => void
  processAudioFile: (file: File) => Promise<void>
  dispose: () => void
}
