import { motion } from "framer-motion";
import { Timer, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { memo } from "react";

import { useAudioStore } from "@/store";
import { StemType, Stem } from "@/types/audio";

const LOOP_LENGTHS = [4, 8, 16, 32] as const;
type LoopLength = typeof LOOP_LENGTHS[number];

interface StemTrackProps {
  type: StemType;
}

const StemTrack = memo(({ type }: StemTrackProps): JSX.Element => {
  const { 
    gridViewOffset,
    isPlaying,
    stems,
    selectStem,
    setGridViewOffset,
    updateStem
  } = useAudioStore();

  const stem: Stem | undefined = stems?.[type];

  const { isReversed, isMuted, loopLength = 32, loopStart = 0 } = stem || {};

  const toggleMute = () => {
    updateStem(type, { isMuted: !isMuted });
  };

  const toggleDirection = () => {
    updateStem(type, { isReversed: !isReversed });
  };

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
            <button
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
            </button>
          </div>

          {/* Grid visualization */}
          <div className="flex gap-0.5 flex-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const absolutePosition = i + (gridViewOffset * 32);
              const beatInLoop = absolutePosition >= (loopStart || 0) && 
                                absolutePosition < ((loopStart || 0) + (loopLength || 32));
              
              return (
                <motion.div
                  key={i}
                  className={`h-4 flex-1 ${
                    beatInLoop 
                      ? 'bg-black/20'
                      : 'bg-black/5'
                  } ${isMuted ? 'opacity-50' : ''}`}
                  animate={{
                    opacity: isPlaying && absolutePosition === (loopStart || 0) ? 1 : undefined,
                    scale: isPlaying && absolutePosition === (loopStart || 0) ? 1.1 : 1
                  }}
                  transition={{ duration: 0.1 }}
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
            <Timer className="w-3 h-3" />
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

export default StemTrack;