import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

import { processStemSeparation } from '@/lib/api/client'
import { AudioEngine } from '@/lib/audio/engine'
import { base64ToAudioBuffer, detectBPM } from '@/lib/audio/utils'
import { Action, SystemActionType, UserActionType } from '@/types/action'
import type { SplitProgress, Stem, Stems, StemType } from '@/types/audio'
import { AudioStore } from '@/types/store'

export const useAudioStore = create<AudioStore>()(
  subscribeWithSelector((set, get) => {
    return {
      // Initial state
      engine: null,
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
        if (get().isInitialized) return;

        try {
          // Create engine instance only when initialized
          const engine = new AudioEngine();
          await engine.initialize();
          
          // Set up event listeners
          engine.on('action', (action: Action) => {
            get().addAction(action);
          });

          engine.on('bpmChanged', (bpm: number) => set({ bpm }));
          engine.on('playbackRate', (rate: number) => set({ playbackRate: rate }));
          engine.on('playing', (isPlaying: boolean) => set({ isPlaying }));

          set({ engine, isInitialized: true });
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
          // Let the engine handle the action logging
          engine.setBPM(bpm);
          // Only update the store state
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

        // Remove loop change logging from here since engine handles it
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
        } finally {
          set({ isLoading: false });
        }
      },
    };
  })
); 