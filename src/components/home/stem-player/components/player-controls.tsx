'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useAudioStore } from '@/store';

export const PlayerControls = memo(() => {
  const { 
    engine,
    isInitialized,
    bpm,
    isPlaying,
    playbackRate,
    setPlaybackRate,
    setBPM,
  } = useAudioStore();

  const [tempoBpm, setTempoBpm] = useState<string>(bpm.toString());
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const tapTimesRef = useRef<number[]>([]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!engine || !isInitialized) return;

      if (e.code === 'Space') {
        e.preventDefault();
        engine.startPlayback();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [engine, isInitialized]);

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempoBpm(e.target.value);
  };

  const handleBpmSubmit = () => {
    const newBpm = parseInt(tempoBpm);
    if (!isNaN(newBpm) && newBpm > 0 && newBpm < 1000) {
      setBPM(newBpm);
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
      }
    }
    
    setLastTapTime(now);
  }, [lastTapTime, setBPM]);

  const handlePlaybackRateChange = () => {
    const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    const newRate = PLAYBACK_RATES[nextIndex];
    
    setPlaybackRate(newRate);
  };

  const handleBpmAdjust = (delta: number) => {
    const newBPM = Math.min(999, Math.max(1, bpm + delta));
    setBPM(newBPM);
    setTempoBpm(newBPM.toString());
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black">
      <div className="px-4 pt-4 pb-8 flex justify-between max-w-5xl mx-auto pb-[calc(env(safe-area-inset-bottom,24px)+1rem)]">
        {/* Left corner - Play/Stop */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (engine) {
                engine.startPlayback();
              }
            }}
            className="h-8 w-24 bg-black text-white flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/90 font-mono text-sm"
          >
            play
          </button>
          <button
            onClick={() => {
              if (isPlaying && engine) {
                engine.stopPlayback();
              }
            }}
            className="h-8 w-24 bg-black text-white flex items-center justify-center [border-radius:0] transition-colors hover:bg-black/90 font-mono text-sm"
          >
            stop
          </button>
        </div>

        {/* Right corner controls */}
        <div className="flex gap-3">
          {/* BPM controls */}
          <div className="flex flex-col gap-1">
            <Input
              type="text"
              value={tempoBpm}
              onChange={handleBpmChange}
              onBlur={handleBpmSubmit}
              onKeyDown={e => {
                e.preventDefault();
                if (e.key === 'Enter') handleBpmSubmit();
              }}
              readOnly={true}
              className="h-8 w-24 text-sm font-mono text-center [border-radius:0]"
              min={1}
              max={999}
            />
            <div className="flex h-8">
              <button 
                onClick={() => handleBpmAdjust(1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-black/5 transition-colors border border-black"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button 
                onClick={() => handleBpmAdjust(-1)}
                className="flex-1 h-full flex items-center justify-center hover:bg-black/5 transition-colors border-t border-r border-b border-black"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Tap/Rate controls */}
          <div className="flex flex-col gap-1">
            <button
              onClick={handleTapTempo}
              className="h-8 w-24 bg-black text-white text-sm font-mono hover:bg-black/90 transition-colors"
            >
              tap
            </button>
            <button 
              onClick={handlePlaybackRateChange}
              className="h-8 w-24 bg-black text-white text-sm font-mono hover:bg-black/90 transition-colors"
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PlayerControls.displayName = 'PlayerControls';