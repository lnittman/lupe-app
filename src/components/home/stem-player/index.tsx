import { motion } from "framer-motion";
import { memo } from "react";
import { isMobile } from 'react-device-detect';

import { useAudioStore } from '@/store';
import { StemType } from "@/types/audio";

import { PlayerControls } from "./components/player-controls";
import { GridNavigation } from "./components/grid-navigation";
import StemTrack from "./components/stem-track";

export const StemPlayer = memo(() => {
  const { stems } = useAudioStore();

  if (!stems) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
    >
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Stems area */}
        <div className="flex-1 flex flex-col justify-end">
          <div className={`w-full px-4 ${isMobile ? 'pb-[200px]' : 'pb-[120px]'}`}>
            <div className="max-w-[1400px] mx-auto w-full">
              <GridNavigation />
              <div className="flex flex-col gap-2 mt-2">
                {Object.keys(stems).map((name) => (
                  <StemTrack key={name} type={name as StemType} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <PlayerControls />
    </motion.div>
  );
});

StemPlayer.displayName = 'StemPlayer';