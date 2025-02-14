import { motion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { isMobile as isMobileDetect } from 'react-device-detect';

import { useAudioStore } from '@/store';
import { StemType } from "@/types/audio";

import { PlayerControls } from "./components/player-controls";
import { GridNavigation } from "./components/grid-navigation";
import StemTrack from "./components/stem-track";
import Instructions from "../../instructions";

export const StemPlayer = memo(() => {
  const { stems, showInstructions } = useAudioStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set mobile status after component mounts on client
    setIsMobile(isMobileDetect);
  }, []);

  if (!stems) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen flex flex-col"
    >
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {showInstructions ? (
          <Instructions />
        ) : (
          <div className="flex-1 flex flex-col justify-end">
            <div className={`w-full px-4 ${isMobile ? 'pb-[280px]' : 'pb-[180px]'}`}>
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
        )}
      </div>

      {/* Controls always visible */}
      <PlayerControls />
    </motion.div>
  );
});

StemPlayer.displayName = 'StemPlayer';