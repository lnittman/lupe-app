import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { Action, SystemActionType, UserActionType } from '@/types/action'
import { AudioEngine } from '@/lib/audio/engine'
import type { SplitProgress, Stem, Stems, StemType } from '@/types/audio'
import { detectBPM } from '@/lib/audio/utils'
import { base64ToAudioBuffer } from '@/lib/audio/utils'
import { processStemSeparation } from '@/lib/api/client'

interface AudioStore {
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
  setStems: (stems: Stems) => void
  processAudioFile: (file: File) => Promise<void>
  dispose: () => void
}

export const useAudioStore = create<AudioStore>()(
  subscribeWithSelector((set, get) => {
    // Create engine instance
    const engine = new AudioEngine();

    return {
      // Initial state
      engine,
      isInitialized: false,
      bpm: 120,
      playbackRate: 1,
      isPlaying: false,
      stems: null,
      selectedStem: null,
      actions: [],
      gridViewOffset: 0,
      SplitProgress: null,
      file: null,
      isLoading: false,

      // Actions
      initializeEngine: async () => {
        const { engine } = get();
        if (!engine || get().isInitialized) return;

        try {
          await engine.initialize();
          
          // Set up event listeners
          engine.on('action', (action: Action) => {
            get().addAction(action);
          });

          engine.on('bpm', (bpm: number) => set({ bpm }));
          engine.on('playbackRate', (rate: number) => set({ playbackRate: rate }));
          engine.on('playing', (isPlaying: boolean) => set({ isPlaying }));

          set({ isInitialized: true });
        } catch (error) {
          console.error('Failed to initialize audio engine:', error);
          throw error;
        }
      },

      dispose: () => {
        const { engine } = get();
        if (engine) {
          engine.dispose();
        }
      },

      addAction: (action: Action) => {
        set((state) => ({
          actions: [action, ...state.actions].slice(0, 100)
        }));
      },

      setBPM: (bpm) => {
        const { engine } = get();
        if (engine) {
          engine.setBPM(bpm);
          set({ bpm });
        }
      },

      setPlaybackRate: (rate) => {
        const { engine } = get();
        if (engine) {
          engine.setPlaybackRate(rate);
          set({ playbackRate: rate });
        }
      },

      togglePlayback: async () => {
        const { engine } = get();
        if (!engine) return;

        try {
          await engine.togglePlayback();
          const isPlaying = engine.getTransportState() === 'started';
          set({ isPlaying });
          console.log('isPlaying', isPlaying);
        } catch (error) {
          console.error('Error toggling playback:', error);
        }
      },

      updateStem: (name, updates) => {
        const { stems, engine, addAction } = get();
        if (!engine || !stems) return;

        const currentStem = stems[name] || {
          name,
          buffer: null,
          volume: 1,
          isMuted: false,
          isReversed: false,
          loopStart: 0,
          loopLength: 32,
          isSelected: false
        };

        const updatedStem = { ...currentStem, ...updates };

        // Update engine if stem exists
        if (stems[name]) {
          engine.updateStem(name, {
            isMuted: updatedStem.isMuted,
            volume: updatedStem.volume,
            loopStart: updatedStem.loopStart,
            loopLength: updatedStem.loopLength,
          });
        }

        // Handle action logging
        const baseActionProps = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          stem: name
        };

        if (updates.isMuted !== undefined) {
          addAction({
            ...baseActionProps,
            type: updates.isMuted ? UserActionType.StemMuted : UserActionType.StemUnmuted
          });
        }

        if (updates.volume !== undefined) {
          addAction({
            ...baseActionProps,
            type: UserActionType.StemVolumeChanged,
            volume: updates.volume
          });
        }

        if (updates.loopStart !== undefined || updates.loopLength !== undefined) {
          addAction({
            ...baseActionProps,
            type: UserActionType.StemLoopChanged,
            loopStart: updatedStem.loopStart || 0,
            loopLength: updatedStem.loopLength || 32
          });
        }

        if (updates.isReversed !== undefined) {
          addAction({
            ...baseActionProps,
            type: UserActionType.StemReversed,
            reversed: updates.isReversed
          });
        }

        set({
          stems: {
            ...stems,
            [name]: updatedStem
          }
        });
      },

      selectStem: (name) => {
        set({ selectedStem: name });
      },

      setGridViewOffset: (offset: number) => {
        set({ gridViewOffset: offset });
      },

      setIsLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setSplitProgress: (progress: SplitProgress | null) => {
        set({ SplitProgress: progress });
      },

      setFile: (file: File) => {
        set({ file });
      },

      setStems: (stems: Stems) => {
        const { engine } = get();

        if (!engine) {
          console.error('No engine available when setting stems');
          return;
        }

        const stemStates: Record<StemType, Stem> = {} as Record<StemType, Stem>;

        Object.entries(stems).forEach(([name, buffer]) => {
          stemStates[name as StemType] = {
            name: name as StemType,
            buffer,
            volume: 1,
            isMuted: false,
            isReversed: false,
            loopStart: 0,
            loopLength: 32,
            isSelected: false
          };
        });

        // Add stems to engine after creating all stem states
        Object.values(stemStates).forEach(async (stem) => {
          try {
            await engine.addStem(stem);
          } catch (err) {
            console.error(`Failed to add stem ${stem.name} to engine:`, err);
          }
        });

        set({ stems: stemStates });
      },

      processAudioFile: async (file: File) => {
        const { engine, addAction } = get();
        
        if (!engine || !file.type.startsWith("audio/")) {
          throw new Error("Invalid file type or engine not initialized");
        }

        set({ file, isLoading: true });

        // Log stem split start
        addAction({
          type: SystemActionType.StemSplit,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          filename: file.name
        });

        try {
          const response = await processStemSeparation(file);
          
          if (!response?.stems) {
            throw new Error("No stems returned from separation");
          }

          const rawStems: Stems = {} as Stems;
          await Promise.all(
            response.stems.map(async (stem) => {
              const audioBuffer = await base64ToAudioBuffer(
                stem.data,
                engine.getContext()
              );
              rawStems[stem.name as keyof Stems] = audioBuffer;
            })
          );
          
          const stems: Record<StemType, Stem> = {} as Record<StemType, Stem>;
          
          Object.entries(rawStems).forEach(([name, buffer]) => {
            stems[name as StemType] = {
              name: name as StemType,
              buffer,
              volume: 1,
              isMuted: false,
              isReversed: false,
              loopStart: 0,
              loopLength: 32,
              isSelected: false
            };
          });

          // Add stems to engine after creating all stem states
          await Promise.all(
            Object.values(stems).map(stem => engine.addStem(stem))
          );

          set({ stems });

          const detectedBPM = detectBPM(rawStems.drums);
          engine.setBPM(detectedBPM, true);

          set({ bpm: detectedBPM });
        } catch (error) {
          set({ isLoading: false, SplitProgress: null });
          throw error;
        }
      },
    };
  })
); 