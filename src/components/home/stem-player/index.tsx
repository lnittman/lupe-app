import { motion } from "framer-motion";
import { memo } from "react";

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
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col w-full">
          <div className="flex-1" /> {/* Spacer */}
          
          <div className="w-full px-4 mb-[1px]">
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

        <PlayerControls />
      </div>
    </motion.div>
  );
});

StemPlayer.displayName = 'StemPlayer';