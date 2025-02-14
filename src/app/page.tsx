'use client';

import { SongSelection } from "@/components/home/song-selection";
import { StemPlayer } from "@/components/home/stem-player";
import { SplitLoader } from "@/components/home/song-selection/components/split-loader";
import { useAudioStore } from "@/store";

export default function HomePage() {
  const { stems, isLoading } = useAudioStore();

  return (
    <div className="min-h-[90dvh] flex flex-col">
      {!stems && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <SongSelection />
        </div>
      )}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <SplitLoader />
        </div>
      )}
      {stems && !isLoading && <StemPlayer />}
    </div>
  );
} 
