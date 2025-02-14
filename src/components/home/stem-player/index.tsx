import { motion } from "framer-motion";
import { memo } from "react";

import { useAudioStore } from '@/store';
import { StemType } from "@/types/audio";

import { PlayerControls } from "./components/player-controls";
import { GridNavigation } from "./components/grid-navigation";
import { ActionLog } from "../action-log";
import StemTrack from "./components/stem-track";

export const StemPlayer = memo(() => {
  const { stems } = useAudioStore();

  if (!stems) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col"
    >
      {/* Action Log - positioned in top left */}
      <div className="absolute left-0 z-20">
        <ActionLog />
      </div>

      {/* Main content area that fills available space */}
      <div className="flex-1 relative">
        {/* Stem tracks container - positioned above controls with padding */}
        <div className="absolute inset-x-0 bottom-0 pb-6">
          <div className="max-w-5xl mx-auto w-full px-3">
            <GridNavigation />
            
            {/* Stem tracks */}
            <div className="flex flex-col gap-2">
              {Object.keys(stems).map((name) => (
                <StemTrack key={name} type={name as StemType} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls fixed to bottom with safe area inset */}
      <div className="relative">
        <PlayerControls />
      </div>
    </motion.div>
  );
});

StemPlayer.displayName = 'StemPlayer';