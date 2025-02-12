import * as Tone from 'tone';
import { AudioContext } from 'standardized-audio-context';

import type { Stem, StemType } from '@/types/audio';
import { SystemActionType, UserActionType } from '@/types/action';

import { EventEmitter } from './event-emitter';
import { GridClock } from './grid-clock';

export class AudioEngine extends EventEmitter {
  private bpm = 120;
  private context: AudioContext;
  private gridClock: GridClock;
  private initialized = false;
  private limiter: Tone.Limiter;
  private mainOutput: Tone.Volume;
  private playbackRate = 1;
  private stems: Map<string, {
    player: Tone.Player;
    volume: Tone.Volume;
  }> = new Map();
  private transport = Tone.Transport;

  constructor() {
    super();

    this.context = new AudioContext();
    
    // Create main output chain
    this.limiter = new Tone.Limiter(-6);
    this.mainOutput = new Tone.Volume(0);
    this.mainOutput.chain(this.limiter).toDestination();

    this.initializeTransport();
    this.setupEventListeners();

    this.gridClock = new GridClock(this.transport, this.transport.bpm.value);
    
    this.emit('action', {
      type: SystemActionType.EngineInitialized,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
  }

  public async addStem(stem: Stem): Promise<void> {
    try {
      if (!stem.buffer) {
        throw new Error('Cannot add stem without audio buffer');
      }

      // Create a new buffer from the AudioBuffer
      const buffer = new Tone.ToneAudioBuffer(stem.buffer);
      
      // Wait for buffer to load using the loaded getter
      if (!buffer.loaded) {
        await new Promise<void>((resolve) => {
          buffer.onload = () => resolve();
        });
      }

      // Calculate time-based loop points from grid positions
      const { startTime, endTime } = this.gridClock.calculateLoopPoints(stem.loopStart, stem.loopLength);

      const player = new Tone.Player({
        loop: true,
        loopStart: startTime,
        loopEnd: endTime,
        autostart: false,
        mute: stem.isMuted,
        playbackRate: this.playbackRate // Set initial playback rate
      });

      // Set the buffer directly
      player.buffer = buffer;

      const volume = new Tone.Volume(
        stem.volume === 0 ? -Infinity : 20 * Math.log10(stem.volume)
      );
      
      player.chain(volume, this.mainOutput);

      this.stems.set(stem.name, { player, volume });

      this.emit('action', {
        type: SystemActionType.StemAdded,
        stem: stem.name as StemType,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error adding stem:', error);
      throw error;
    }
  }

  public async togglePlayback(): Promise<void> {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
      await this.context.resume();
    }

    if (this.transport.state === 'started') {
      // Emit playing state first
      this.emit('playing', false);
      
      this.transport.pause();
      this.stems.forEach(({ player }) => {
        player.stop();
      });
      
      this.emit('action', {
        type: UserActionType.PlaybackStopped,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      });
    } else {
      // Emit playing state first
      this.emit('playing', true);
      
      const startTime = this.transport.now() + 0.1; // Small delay for scheduling
      
      // Schedule all stems to start together
      this.stems.forEach(({ player }) => {
        const loopDuration = Number(player.loopEnd) - Number(player.loopStart);
        const loopPosition = player.loopStart;
        
        // Ensure player is in loop mode
        player.loop = true;
        
        // Schedule the start precisely
        player.start(startTime, loopPosition);
      });

      // Start transport slightly after players to ensure sync
      this.transport.start(startTime);
      
      this.emit('action', {
        type: UserActionType.PlaybackStarted,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      });
    }
  }

  public dispose(): void {
    // Dispose of all audio nodes
    this.stems.forEach(({ player }) => {
      player.dispose();
    });
    
    // Stop and clear transport
    this.transport.stop();
    this.transport.cancel(0);
    this.transport.dispose();
    
    // Clear all maps
    this.stems.clear();
  }

  public getBPM(): number {
    return this.transport.bpm.value;
  }

  public getContext(): AudioContext {
    return this.context;
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public getTransportPosition(): string {
    return this.transport.position.toString();
  }

  public getTransportState(): string {
    return this.transport.state;
  }

  public async initialize(): Promise<void> {
    if (!this.initialized) {
      // Resume the audio context on first user interaction
      await this.context.resume();
      this.initialized = true;
    }
  }

  public setBPM(bpm: number, isSystem = false): void {
    this.bpm = bpm;
    this.transport.bpm.value = bpm;
    
    // Update GridClock timing
    this.gridClock.updateBPM(bpm);

    // Recalculate and update loop points for all stems
    this.stems.forEach((stem, name) => {
      const player = stem.player;
      const currentLoopStart = this.gridClock.timeToGrid(Number(player.loopStart));
      const currentLoopEnd = this.gridClock.timeToGrid(Number(player.loopEnd));
      const loopLength = currentLoopEnd - currentLoopStart;
      
      // Update loop points with new timing
      const { startTime, endTime } = this.gridClock.calculateLoopPoints(currentLoopStart, loopLength);
      player.loopStart = startTime;
      player.loopEnd = Math.min(endTime, player.buffer.duration);
    });

    this.emit('action', {
      bpm,
      type: isSystem ? SystemActionType.BPMChanged : UserActionType.BPMChanged,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });

    this.emit('bpmChanged', bpm);
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    
    // Update each player's playback rate directly
    this.stems.forEach(({ player }) => {
      player.playbackRate = rate;
    });

    // Update transport BPM to match new rate
    this.transport.bpm.value = Number(this.bpm) * Number(rate);

    this.emit('action', {
      type: UserActionType.PlaybackRateChanged,
      rate,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });

    this.emit('rate', rate);
  }

  public start(): void {
    this.transport.start();
  }

  public stop(): void {
    this.transport.stop();
  }

  public updateStem(name: StemType, config: Partial<Stem>): void {
    const stem = this.stems.get(name);
    if (!stem) return;

    const { player, volume } = stem;

    if (config.isMuted !== undefined) {
      // Use volume for muting instead of player.mute to maintain sync
      volume.volume.value = config.isMuted ? -Infinity : (
        config.volume === undefined ? 0 : // If no volume specified, use 0dB when unmuting
        config.volume === 0 ? -Infinity : 20 * Math.log10(config.volume)
      );
      
      this.emit('action', {
        type: config.isMuted ? UserActionType.StemMuted : UserActionType.StemUnmuted,
        stem: name,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      });
    }

    if (config.volume !== undefined && !config.isMuted) {
      const db = config.volume === 0 ? -Infinity : 20 * Math.log10(config.volume);
      volume.volume.value = db;
      this.emit('action', {
        type: UserActionType.StemVolumeChanged,
        stem: name,
        volume: config.volume,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      });
    }

    if (config.loopLength !== undefined || config.loopStart !== undefined) {
      this.updateStemLoop(name, config.loopStart ?? 0, config.loopLength ?? 32);

      this.emit('action', {
        type: UserActionType.StemLoopChanged,
        stem: name,
        loopStart: config.loopStart ?? 0,
        loopLength: config.loopLength ?? 32,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      });
    }
  }

  public updateStemLoop(name: string, loopStart: number, loopLength: number): void {
    const stem = this.stems.get(name);
    if (!stem) return;

    const { player } = stem;
    const wasPlaying = player.state === 'started';

    // Calculate time-based loop points from grid positions
    const { startTime, endTime } = this.gridClock.calculateLoopPoints(loopStart, loopLength);

    // Enable looping and update loop points
    player.loop = true;
    player.loopStart = startTime;
    player.loopEnd = Math.min(endTime, player.buffer.duration);

    // If the player was playing, restart it at the new loop points synchronized with transport
    if (wasPlaying) {
      try {
        const currentTime = this.transport.now();
        player.stop();
        
        // Calculate the correct phase of the loop based on transport time
        // Use a safer way to get the current position
        let loopPosition = startTime;
        
        if (this.transport.state === 'started') {
          const loopDuration = endTime - startTime;
          const transportTime = this.transport.seconds || 0;
          loopPosition = startTime + ((transportTime - startTime) % loopDuration);
          
          // Ensure the position is within valid bounds
          if (loopPosition < startTime || loopPosition >= endTime) {
            loopPosition = startTime;
          }
        }
        
        // Schedule the restart slightly in the future to ensure clean playback
        const scheduleTime = currentTime + 0.1;
        player.start(scheduleTime, loopPosition);
      } catch (error) {
        console.warn('Error updating stem loop, restarting from beginning:', error);
        // Fallback: just restart from the beginning if something goes wrong
        player.start(this.transport.now() + 0.1, player.loopStart);
      }
    }

    this.emit('loopChanged', {
      name,
      loopStart,
      loopLength,
      playerState: player.state
    });
  }

  // Private methods

  private setupEventListeners(): void {
    this.on('loopChanged', (event: { name: string; loopStart: number; loopLength: number; playerState: string }) => {
      this.logAction('Loop Changed', event);
    });

    this.on('bpmChanged', (bpm: number) => {
      this.logAction('BPM Changed', { bpm });
    });

    this.on('stateLogged', (state: { name: string; loopStart: number; loopLength: number; playerState: string }) => {
      this.logAction('State Logged', state);
    });
  }

  private logAction(type: string, details: Record<string, any>): void {
    const action = {
      type,
      timestamp: new Date().toISOString(),
      ...details
    };

    this.emit('actionLogged', action);
  }

  private initializeTransport() {
    this.transport.bpm.value = this.bpm;
    this.transport.loop = true;
    this.transport.loopStart = 0;
    this.transport.loopEnd = '4m'; // Default 4 measure loop
  }

}
