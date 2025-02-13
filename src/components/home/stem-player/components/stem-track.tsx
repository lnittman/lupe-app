import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useEffect, useState } from "react";

import { useAudioStore } from "@/store";
import { StemType, Stem } from "@/types/audio";

const LOOP_LENGTHS = [4, 8, 16, 32] as const;
type LoopLength = typeof LOOP_LENGTHS[number];

interface StemTrackProps {
  type: StemType;
}

const StemTrack = memo(({ type }: StemTrackProps) => {
  const { 
    engine,
    gridViewOffset,
    isPlaying,
    stems,
    selectStem,
    updateStem
  } = useAudioStore();

  const [currentGridPosition, setCurrentGridPosition] = useState<number>(0);

  // Update current grid position during playback
  useEffect(() => {
    if (!isPlaying || !engine) return;

    const interval = setInterval(() => {
      const position = engine.getTransportPosition();
      // Convert position from "bars:quarters:sixteenths" format to beats
      const [bars, quarters, sixteenths] = position.split(':').map(Number);
      const totalBeats = (bars * 4) + quarters + (sixteenths / 4);
      
      // Convert beats to grid position (each grid is 1/4 bar = 1 beat)
      let gridPos = Math.floor(totalBeats);
      
      // Adjust for loop boundaries
      const stem = stems?.[type];
      if (stem) {
        const loopStart = stem.loopStart || 0;
        const loopLength = stem.loopLength || 32;
        
        // Calculate relative position within loop
        const relativePos = ((gridPos - loopStart) % loopLength + loopLength) % loopLength;
        gridPos = loopStart + relativePos;
      }

      setCurrentGridPosition(gridPos);
    }, 16); // Update at 60fps

    return () => clearInterval(interval);
  }, [isPlaying, engine, stems, type]);

  const stem: Stem | undefined = stems?.[type];
  const { isReversed, isMuted, loopLength = 32, loopStart = 0 } = stem || {};

  const toggleMute = () => {
    updateStem(type, { isMuted: !isMuted });
  };

  /*
  const toggleDirection = () => {
    updateStem(type, { isReversed: !isReversed });
  };
  */

  const moveLoop = (direction: -1 | 1) => {
    const newStart = Math.max(0, (loopStart || 0) + direction);
    const currentViewStart = gridViewOffset * 32;
    const currentViewEnd = currentViewStart + 32;
    
    // Don't allow moving beyond current view
    if (newStart < currentViewStart || newStart >= currentViewEnd) {
      return;
    }

    updateStem(type, { loopStart: newStart });
  };

  const toggleLoopLength = () => {
    const currentIndex = LOOP_LENGTHS.indexOf(loopLength as LoopLength);
    const nextIndex = (currentIndex + 1) % LOOP_LENGTHS.length;
    const newLength = LOOP_LENGTHS[nextIndex];
    
    updateStem(type, { loopLength: newLength });
  };

  return (
    <div className={`w-full bg-white border border-black cursor-pointer flex items-stretch`}>
      {/* Left margin control */}
      <button
        className="w-12 flex items-center justify-center hover:bg-black/5"
        onClick={() => moveLoop(-1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Main content */}
      <div className="flex-1 p-4" onClick={() => selectStem(type)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-24">
            <button 
              className={`text-xs font-mono tracking-tight hover:opacity-70 ${isMuted ? 'opacity-50' : ''} w-16`}
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
            >
              {type.padEnd(6, ' ')}
            </button>

            {/*<button
              onClick={(e) => {
                e.stopPropagation();
                toggleDirection();
              }}
              className="hover:opacity-70"
            >
              {stem?.isReversed ? (
                <ArrowLeft className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>*/}
          </div>

          {/* Grid visualization */}
          <div className="flex gap-0.5 flex-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const absolutePosition = i + (gridViewOffset * 32);
              const beatInLoop = absolutePosition >= (loopStart || 0) && 
                                absolutePosition < ((loopStart || 0) + (loopLength || 32));
              const isCurrentPosition = absolutePosition === currentGridPosition;
              
              return (
                <motion.div
                  key={i}
                  className={`h-4 flex-1 ${
                    beatInLoop 
                      ? 'bg-black/20'
                      : 'bg-black/5'
                  } ${isMuted ? 'opacity-50' : ''}`}
                  animate={{
                    opacity: isPlaying && isCurrentPosition ? 1 : undefined,
                    scale: isPlaying && isCurrentPosition ? 1.1 : 1
                  }}
                  transition={{ duration: 0.05 }}
                />
              );
            })}
          </div>

          {/* Loop length toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLoopLength();
            }}
            className="flex items-center gap-1 px-2 py-1 text-[10px] hover:opacity-70"
          >
            <span className="w-4 text-center">{loopLength}</span>
          </button>
        </div>
      </div>

      {/* Right margin control */}
      <button
        className="w-12 flex items-center justify-center hover:bg-black/5"
        onClick={() => moveLoop(1)}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});

StemTrack.displayName = 'StemTrack';

export default StemTrack;