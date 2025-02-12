'use client';

import { ChevronUp, ChevronDown, Play, Pause } from 'lucide-react';
import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useAudioStore } from '@/lib/store';
import { UserActionType } from '@/types/action';

export const PlayerControls = memo(() => {
  const { 
    engine,
    isInitialized,
    bpm,
    isPlaying,
    playbackRate,
    addAction,
    setPlaybackRate,
    setBPM,
    togglePlayback
  } = useAudioStore();

  const [tempoBpm, setTempoBpm] = useState<string>(bpm.toString());
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const tapTimesRef = useRef<number[]>([]);

  // Handle spacebar shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && engine && isInitialized) {
        e.preventDefault();
        togglePlayback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayback, engine, isInitialized]);

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempoBpm(e.target.value);
  };

  const handleBpmSubmit = () => {
    const newBpm = parseInt(tempoBpm);
    if (!isNaN(newBpm) && newBpm > 0 && newBpm < 1000) {
      setBPM(newBpm);
      addAction({
        type: UserActionType.BPMChanged,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        bpm: newBpm
      });
    } else {
      setTempoBpm(bpm.toString());
    }
  };

  const handleTapTempo = useCallback(() => {
    const now = performance.now();
    const times = tapTimesRef.current;

    if (now - lastTapTime > 2000) {
      times.length = 0;
    }

    times.push(now);
    if (times.length > 4) times.shift();
    
    if (times.length > 1) {
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i-1]);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      
      if (newBpm > 0 && newBpm < 1000) {
        setBPM(newBpm);
        setTempoBpm(newBpm.toString());
        addAction({
          type: UserActionType.BPMChanged,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          bpm: newBpm
        });
      }
    }
    
    setLastTapTime(now);
  }, [lastTapTime, setBPM, addAction]);

  const handlePlaybackRateChange = () => {
    const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    const newRate = PLAYBACK_RATES[nextIndex];
    
    setPlaybackRate(newRate);
    addAction({
      type: UserActionType.PlaybackRateChanged,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      rate: newRate
    });
  };

  const handleBpmAdjust = (delta: number) => {
    const newBPM = Math.min(999, Math.max(1, bpm + delta));
    setBPM(newBPM);
    addAction({
      type: UserActionType.BPMChanged,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      bpm: newBPM
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayback}
            className="w-12 h-12 bg-black text-white flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/90"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          
          <span className="text-xs text-neutral-500">
            press <kbd className="px-2 py-0.5 bg-neutral-100 rounded">space</kbd> to play/pause
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Playback Rate */}
          <button 
            onClick={handlePlaybackRateChange}
            className="text-sm font-mono w-20 text-center"
          >
            {playbackRate}x
          </button>

          {/* BPM Input */}
          <div className="flex items-center">
            <div className="relative flex items-center">
              <Input
                type="text"
                value={tempoBpm}
                onChange={handleBpmChange}
                onBlur={handleBpmSubmit}
                onKeyDown={e => e.key === 'Enter' && handleBpmSubmit()}
                className="w-20 h-8 text-sm font-mono pr-6"
                min={1}
                max={999}
              />
              <div className="absolute right-1 flex flex-col">
                <button 
                  onClick={() => handleBpmAdjust(1)}
                  className="h-4 flex items-center justify-center hover:text-neutral-500"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleBpmAdjust(-1)}
                  className="h-4 flex items-center justify-center hover:text-neutral-500"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Tap Tempo Button */}
          <button
            onClick={handleTapTempo}
            className="w-20 h-8 bg-black text-white text-sm font-mono hover:bg-black/90 transition-colors"
          >
            TAP
          </button>
        </div>
      </div>
    </div>
  );
});

PlayerControls.displayName = 'PlayerControls';