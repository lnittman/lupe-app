import { Action } from "@/types/action"
import { SplitProgress, Stems, Stem, StemType } from "@/types/audio"
import { AudioEngine } from "@/lib/audio/engine"

export interface AudioStore {
  // Core State
  engine: AudioEngine | null
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

  // Actions
  setEngine: (engine: AudioEngine) => void
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
  setStems: (stems: Stems) => void
  processAudioFile: (file: File) => Promise<void>
}
