'use client';

import { SongSelection } from "@/components/home/song-selection";
import { StemPlayer } from "@/components/home/stem-player";
import { useAudioStore } from "@/store";

export default function HomePage() {
  const { stems, isLoading } = useAudioStore();

  return (
    <div className="min-h-screen w-full flex flex-col">
      {!stems && <SongSelection />}
      {stems && !isLoading && <StemPlayer />}
    </div>
  );
} 
