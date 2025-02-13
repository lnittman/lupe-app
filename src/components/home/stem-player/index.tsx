import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

import { useAudioStore } from '@/store';
import { StemType } from "@/types/audio";

import { PlayerControls } from "./components/player-controls";
import StemTrack from "./components/stem-track";

export const StemPlayer = memo(() => {
  const { stems, gridViewOffset, setGridViewOffset, updateStem } = useAudioStore();

  if (!stems) return null;

  const handleGridNavigation = (direction: -1 | 1) => {
    const newOffset = Math.max(0, gridViewOffset + direction);
    setGridViewOffset(newOffset);

    // Update all stem loop positions
    Object.entries(stems).forEach(([name, stem]) => {
      const currentStart = stem.loopStart || 0;
      const newStart = currentStart + (direction * 32);
      if (newStart >= 0) {
        updateStem(name as StemType, { loopStart: newStart });
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col p-4 pb-32"
    >
      <div className="mt-auto grid grid-cols-1 gap-2 z-10">
        <div className="flex flex-col">
          {/* Grid Navigation */}
          <div className="flex items-stretch mb-2 border border-black">
            <button
              onClick={() => handleGridNavigation(-1)}
              disabled={gridViewOffset === 0}
              className="w-12 h-[55px] flex items-center justify-center hover:bg-black/5 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 p-4" />
            <button
              onClick={() => handleGridNavigation(1)}
              className="w-12 h-[55px] flex items-center justify-center hover:bg-black/5 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {Object.entries(stems).map(([name, stem]) => (
              <StemTrack key={name} type={name as StemType} />
            ))}
          </div>

          <PlayerControls />
        </div>
      </div>
    </motion.div>
  );
});

StemPlayer.displayName = 'StemPlayer'; 