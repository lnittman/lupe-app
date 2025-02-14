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
      className="relative h-screen"
    >
      {/* Action Log - positioned in top left */}
      <div className="absolute left-0 z-10">
        <ActionLog />
      </div>

      {/* Stem tracks container - positioned from bottom */}
      <div className="absolute bottom-[110px] left-0 right-0">
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

      {/* Player Controls */}
      <PlayerControls />
    </motion.div>
  );
});

StemPlayer.displayName = 'StemPlayer'; 